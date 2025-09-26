from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Usuario extendido con información de Google"""
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    google_email = models.EmailField(unique=True, null=True, blank=True)
    google_name = models.CharField(max_length=200, null=True, blank=True)
    google_picture = models.URLField(null=True, blank=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('student', 'Estudiante'),
            ('teacher', 'Profesor'),
            ('coordinator', 'Coordinador'),
        ],
        default='student'
    )
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.google_name or self.username} ({self.role})"


class Course(models.Model):
    """Curso de Google Classroom"""
    google_course_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    section = models.CharField(max_length=100, blank=True)
    room = models.CharField(max_length=100, blank=True)
    owner_id = models.CharField(max_length=100)  # Google ID del profesor
    creation_time = models.DateTimeField()
    update_time = models.DateTimeField()
    enrollment_code = models.CharField(max_length=20, blank=True)
    course_state = models.CharField(max_length=20, default='ACTIVE')
    alternate_link = models.URLField()
    
    # Campos adicionales para e-campus
    cohort = models.CharField(max_length=100, blank=True, help_text="Cohorte o grupo del curso")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.section})"


class CourseEnrollment(models.Model):
    """Inscripción de usuarios en cursos"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=[
            ('STUDENT', 'Estudiante'),
            ('TEACHER', 'Profesor'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'user']
    
    def __str__(self):
        return f"{self.user.google_name} en {self.course.name} como {self.role}"


class CourseWork(models.Model):
    """Tarea o trabajo de curso"""
    google_coursework_id = models.CharField(max_length=100, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    state = models.CharField(max_length=20, default='PUBLISHED')
    alternate_link = models.URLField()
    creation_time = models.DateTimeField()
    update_time = models.DateTimeField()
    due_date = models.DateTimeField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)
    max_points = models.FloatField(null=True, blank=True)
    work_type = models.CharField(max_length=50, default='ASSIGNMENT')
    
    def __str__(self):
        return f"{self.title} - {self.course.name}"


class StudentSubmission(models.Model):
    """Entrega de estudiante"""
    google_submission_id = models.CharField(max_length=100, unique=True)
    coursework = models.ForeignKey(CourseWork, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_time = models.DateTimeField()
    update_time = models.DateTimeField()
    state = models.CharField(
        max_length=20,
        choices=[
            ('NEW', 'Nueva'),
            ('CREATED', 'Creada'),
            ('TURNED_IN', 'Entregada'),
            ('RETURNED', 'Devuelta'),
            ('RECLAIMED_BY_STUDENT', 'Reclamada por estudiante'),
        ],
        default='NEW'
    )
    late = models.BooleanField(default=False)
    draft_grade = models.FloatField(null=True, blank=True)
    assigned_grade = models.FloatField(null=True, blank=True)
    alternate_link = models.URLField()
    
    class Meta:
        unique_together = ['coursework', 'user']
    
    def __str__(self):
        return f"{self.user.google_name} - {self.coursework.title} ({self.state})"


class SyncLog(models.Model):
    """Log de sincronización con Google Classroom"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sync_type = models.CharField(
        max_length=50,
        choices=[
            ('courses', 'Cursos'),
            ('coursework', 'Tareas'),
            ('submissions', 'Entregas'),
            ('enrollments', 'Inscripciones'),
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('success', 'Exitoso'),
            ('error', 'Error'),
            ('partial', 'Parcial'),
        ]
    )
    message = models.TextField(blank=True)
    items_processed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.sync_type} - {self.status} ({self.created_at})"
