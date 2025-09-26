import os
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import login
from django.http import JsonResponse
from django.db.models import Count, Q, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from .models import User, Course, CourseEnrollment, CourseWork, StudentSubmission, SyncLog
from .serializers import (
    UserSerializer, CourseSerializer, CourseEnrollmentSerializer,
    CourseWorkSerializer, StudentSubmissionSerializer, SyncLogSerializer,
    DashboardStatsSerializer, CourseProgressSerializer, StudentProgressSerializer
)


# Configuración de OAuth 2.0
SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]


class GoogleLoginView(APIView):
    """Iniciar el flujo de autenticación con Google"""
    
    def get(self, request, *args, **kwargs):
        try:
            flow = Flow.from_client_config(
                client_config={
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
                    }
                },
                scopes=SCOPES,
                redirect_uri=settings.GOOGLE_REDIRECT_URI
            )
            
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            
            request.session['state'] = state
            return Response({'authorization_url': authorization_url})
            
        except Exception as e:
            return Response(
                {'error': f'Error configurando OAuth: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleCallbackView(APIView):
    """Manejar el callback de Google OAuth"""
    
    def get(self, request, *args, **kwargs):
        try:
            state = request.session.get('state')
            
            flow = Flow.from_client_config(
                client_config={
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                scopes=SCOPES,
                state=state,
                redirect_uri=settings.GOOGLE_REDIRECT_URI
            )
            
            flow.fetch_token(authorization_response=request.build_absolute_uri())
            
            credentials = flow.credentials
            
            # Obtener información del usuario de Google
            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()
            
            # Crear o actualizar usuario
            user, created = User.objects.get_or_create(
                google_id=user_info['id'],
                defaults={
                    'username': user_info['email'],
                    'email': user_info['email'],
                    'google_email': user_info['email'],
                    'google_name': user_info['name'],
                    'google_picture': user_info.get('picture', ''),
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                }
            )
            
            # Actualizar tokens
            user.access_token = credentials.token
            user.refresh_token = credentials.refresh_token
            if credentials.expiry:
                user.token_expires_at = credentials.expiry
            user.save()
            
            # Iniciar sesión
            login(request, user)
            
            # Guardar credenciales en sesión para uso posterior
            request.session['credentials'] = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
            
            # Redirigir al dashboard del frontend
            return redirect('http://localhost:3000/dashboard')
            
        except Exception as e:
            return redirect(f'http://localhost:3000/?error={str(e)}')


class UserProfileView(APIView):
    """Obtener información del usuario autenticado"""
    
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)


class SyncClassroomDataView(APIView):
    """Sincronizar datos desde Google Classroom"""
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Obtener credenciales del usuario
            credentials_data = request.session.get('credentials')
            if not credentials_data:
                return Response({'error': 'No hay credenciales disponibles'}, status=status.HTTP_400_BAD_REQUEST)
            
            credentials = Credentials(
                token=credentials_data['token'],
                refresh_token=credentials_data['refresh_token'],
                token_uri=credentials_data['token_uri'],
                client_id=credentials_data['client_id'],
                client_secret=credentials_data['client_secret'],
                scopes=credentials_data['scopes']
            )
            
            # Refrescar token si es necesario
            if credentials.expired:
                credentials.refresh(Request())
            
            # Construir servicio de Classroom
            service = build('classroom', 'v1', credentials=credentials)
            
            # Sincronizar cursos
            courses_synced = self._sync_courses(service, request.user)
            
            # Sincronizar inscripciones y tareas para cada curso
            coursework_synced = 0
            submissions_synced = 0
            
            for course in Course.objects.all():
                # Sincronizar inscripciones
                self._sync_enrollments(service, course, request.user)
                
                # Sincronizar tareas
                coursework_count = self._sync_coursework(service, course, request.user)
                coursework_synced += coursework_count
                
                # Sincronizar entregas
                submissions_count = self._sync_submissions(service, course, request.user)
                submissions_synced += submissions_count
            
            return Response({
                'message': 'Sincronización completada',
                'courses_synced': courses_synced,
                'coursework_synced': coursework_synced,
                'submissions_synced': submissions_synced
            })
            
        except Exception as e:
            SyncLog.objects.create(
                user=request.user,
                sync_type='full',
                status='error',
                message=str(e)
            )
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _sync_courses(self, service, user):
        """Sincronizar cursos desde Google Classroom"""
        try:
            results = service.courses().list(pageSize=100).execute()
            courses = results.get('courses', [])
            
            synced_count = 0
            for course_data in courses:
                course, created = Course.objects.update_or_create(
                    google_course_id=course_data['id'],
                    defaults={
                        'name': course_data['name'],
                        'description': course_data.get('description', ''),
                        'section': course_data.get('section', ''),
                        'room': course_data.get('room', ''),
                        'owner_id': course_data['ownerId'],
                        'creation_time': datetime.fromisoformat(course_data['creationTime'].replace('Z', '+00:00')),
                        'update_time': datetime.fromisoformat(course_data['updateTime'].replace('Z', '+00:00')),
                        'enrollment_code': course_data.get('enrollmentCode', ''),
                        'course_state': course_data['courseState'],
                        'alternate_link': course_data['alternateLink'],
                    }
                )
                synced_count += 1
            
            SyncLog.objects.create(
                user=user,
                sync_type='courses',
                status='success',
                items_processed=synced_count
            )
            
            return synced_count
            
        except Exception as e:
            SyncLog.objects.create(
                user=user,
                sync_type='courses',
                status='error',
                message=str(e)
            )
            raise e
    
    def _sync_enrollments(self, service, course, user):
        """Sincronizar inscripciones de un curso"""
        try:
            # Obtener estudiantes
            students = service.courses().students().list(courseId=course.google_course_id).execute()
            for student_data in students.get('students', []):
                student_user, created = User.objects.get_or_create(
                    google_id=student_data['userId'],
                    defaults={
                        'username': student_data['profile']['emailAddress'],
                        'email': student_data['profile']['emailAddress'],
                        'google_email': student_data['profile']['emailAddress'],
                        'google_name': student_data['profile']['name']['fullName'],
                        'role': 'student'
                    }
                )
                
                CourseEnrollment.objects.get_or_create(
                    course=course,
                    user=student_user,
                    defaults={'role': 'STUDENT'}
                )
            
            # Obtener profesores
            teachers = service.courses().teachers().list(courseId=course.google_course_id).execute()
            for teacher_data in teachers.get('teachers', []):
                teacher_user, created = User.objects.get_or_create(
                    google_id=teacher_data['userId'],
                    defaults={
                        'username': teacher_data['profile']['emailAddress'],
                        'email': teacher_data['profile']['emailAddress'],
                        'google_email': teacher_data['profile']['emailAddress'],
                        'google_name': teacher_data['profile']['name']['fullName'],
                        'role': 'teacher'
                    }
                )
                
                CourseEnrollment.objects.get_or_create(
                    course=course,
                    user=teacher_user,
                    defaults={'role': 'TEACHER'}
                )
                
        except Exception as e:
            print(f"Error sincronizando inscripciones para {course.name}: {e}")
    
    def _sync_coursework(self, service, course, user):
        """Sincronizar tareas de un curso"""
        try:
            coursework_list = service.courses().courseWork().list(courseId=course.google_course_id).execute()
            synced_count = 0
            
            for coursework_data in coursework_list.get('courseWork', []):
                due_date = None
                due_time = None
                
                if 'dueDate' in coursework_data:
                    due_date_data = coursework_data['dueDate']
                    due_date = datetime(
                        due_date_data['year'],
                        due_date_data['month'],
                        due_date_data['day']
                    )
                    
                    if 'dueTime' in coursework_data:
                        due_time_data = coursework_data['dueTime']
                        due_time = datetime.time(
                            due_time_data.get('hours', 23),
                            due_time_data.get('minutes', 59)
                        )
                
                coursework, created = CourseWork.objects.update_or_create(
                    google_coursework_id=coursework_data['id'],
                    defaults={
                        'course': course,
                        'title': coursework_data['title'],
                        'description': coursework_data.get('description', ''),
                        'state': coursework_data['state'],
                        'alternate_link': coursework_data['alternateLink'],
                        'creation_time': datetime.fromisoformat(coursework_data['creationTime'].replace('Z', '+00:00')),
                        'update_time': datetime.fromisoformat(coursework_data['updateTime'].replace('Z', '+00:00')),
                        'due_date': due_date,
                        'due_time': due_time,
                        'max_points': coursework_data.get('maxPoints'),
                        'work_type': coursework_data['workType']
                    }
                )
                synced_count += 1
            
            return synced_count
            
        except Exception as e:
            print(f"Error sincronizando tareas para {course.name}: {e}")
            return 0
    
    def _sync_submissions(self, service, course, user):
        """Sincronizar entregas de un curso"""
        try:
            coursework_list = CourseWork.objects.filter(course=course)
            synced_count = 0
            
            for coursework in coursework_list:
                submissions = service.courses().courseWork().studentSubmissions().list(
                    courseId=course.google_course_id,
                    courseWorkId=coursework.google_coursework_id
                ).execute()
                
                for submission_data in submissions.get('studentSubmissions', []):
                    # Obtener usuario por Google ID
                    try:
                        student_user = User.objects.get(google_id=submission_data['userId'])
                    except User.DoesNotExist:
                        continue
                    
                    submission, created = StudentSubmission.objects.update_or_create(
                        google_submission_id=submission_data['id'],
                        defaults={
                            'coursework': coursework,
                            'user': student_user,
                            'creation_time': datetime.fromisoformat(submission_data['creationTime'].replace('Z', '+00:00')),
                            'update_time': datetime.fromisoformat(submission_data['updateTime'].replace('Z', '+00:00')),
                            'state': submission_data['state'],
                            'late': submission_data.get('late', False),
                            'draft_grade': submission_data.get('draftGrade'),
                            'assigned_grade': submission_data.get('assignedGrade'),
                            'alternate_link': submission_data['alternateLink']
                        }
                    )
                    synced_count += 1
            
            return synced_count
            
        except Exception as e:
            print(f"Error sincronizando entregas para {course.name}: {e}")
            return 0


class DashboardStatsView(APIView):
    """Obtener estadísticas para el dashboard"""
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Filtros opcionales
        cohort = request.GET.get('cohort')
        teacher_id = request.GET.get('teacher_id')
        
        # Base queryset
        courses_qs = Course.objects.filter(is_active=True)
        if cohort:
            courses_qs = courses_qs.filter(cohort=cohort)
        if teacher_id:
            courses_qs = courses_qs.filter(courseenrollment__user_id=teacher_id, courseenrollment__role='TEACHER')
        
        # Estadísticas básicas
        total_courses = courses_qs.count()
        total_students = CourseEnrollment.objects.filter(course__in=courses_qs, role='STUDENT').values('user').distinct().count()
        total_assignments = CourseWork.objects.filter(course__in=courses_qs).count()
        
        # Estadísticas de entregas
        submissions_qs = StudentSubmission.objects.filter(coursework__course__in=courses_qs)
        total_submissions = submissions_qs.count()
        submissions_on_time = submissions_qs.filter(late=False, state='TURNED_IN').count()
        submissions_late = submissions_qs.filter(late=True, state='TURNED_IN').count()
        submissions_pending = submissions_qs.filter(state__in=['NEW', 'CREATED']).count()
        
        completion_rate = (submissions_on_time + submissions_late) / total_submissions * 100 if total_submissions > 0 else 0
        
        stats = {
            'total_courses': total_courses,
            'total_students': total_students,
            'total_assignments': total_assignments,
            'total_submissions': total_submissions,
            'submissions_on_time': submissions_on_time,
            'submissions_late': submissions_late,
            'submissions_pending': submissions_pending,
            'completion_rate': round(completion_rate, 2)
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para cursos"""
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        cohort = self.request.query_params.get('cohort')
        if cohort:
            queryset = queryset.filter(cohort=cohort)
        return queryset


class StudentProgressView(APIView):
    """Obtener progreso de estudiantes"""
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Filtros
        course_id = request.GET.get('course_id')
        cohort = request.GET.get('cohort')
        
        # Base queryset
        enrollments_qs = CourseEnrollment.objects.filter(role='STUDENT')
        
        if course_id:
            enrollments_qs = enrollments_qs.filter(course_id=course_id)
        if cohort:
            enrollments_qs = enrollments_qs.filter(course__cohort=cohort)
        
        progress_data = []
        
        for enrollment in enrollments_qs:
            course = enrollment.course
            student = enrollment.user
            
            # Obtener estadísticas del estudiante en este curso
            total_assignments = CourseWork.objects.filter(course=course).count()
            submissions = StudentSubmission.objects.filter(
                coursework__course=course,
                user=student
            )
            
            completed_assignments = submissions.filter(state='TURNED_IN').count()
            late_assignments = submissions.filter(late=True, state='TURNED_IN').count()
            
            completion_percentage = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0
            
            # Promedio de calificaciones
            grades = submissions.filter(assigned_grade__isnull=False).values_list('assigned_grade', flat=True)
            average_grade = sum(grades) / len(grades) if grades else None
            
            progress_data.append({
                'student_id': student.id,
                'student_name': student.google_name,
                'student_email': student.google_email,
                'course_name': course.name,
                'total_assignments': total_assignments,
                'completed_assignments': completed_assignments,
                'late_assignments': late_assignments,
                'completion_percentage': round(completion_percentage, 2),
                'average_grade': round(average_grade, 2) if average_grade else None
            })
        
        serializer = StudentProgressSerializer(progress_data, many=True)
        return Response(serializer.data)
