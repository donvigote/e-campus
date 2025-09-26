from rest_framework import serializers
from .models import User, Course, CourseEnrollment, CourseWork, StudentSubmission, SyncLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'google_name', 'google_email', 'google_picture', 'role']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'google_course_id', 'name', 'description', 'section', 
            'room', 'owner_id', 'creation_time', 'update_time', 
            'enrollment_code', 'course_state', 'alternate_link', 
            'cohort', 'is_active'
        ]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'user', 'role', 'created_at']


class CourseWorkSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = CourseWork
        fields = [
            'id', 'google_coursework_id', 'course', 'title', 'description',
            'state', 'alternate_link', 'creation_time', 'update_time',
            'due_date', 'due_time', 'max_points', 'work_type'
        ]


class StudentSubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    coursework = CourseWorkSerializer(read_only=True)
    
    class Meta:
        model = StudentSubmission
        fields = [
            'id', 'google_submission_id', 'coursework', 'user',
            'creation_time', 'update_time', 'state', 'late',
            'draft_grade', 'assigned_grade', 'alternate_link'
        ]


class SyncLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SyncLog
        fields = [
            'id', 'user', 'sync_type', 'status', 'message',
            'items_processed', 'created_at'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    total_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_assignments = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    submissions_on_time = serializers.IntegerField()
    submissions_late = serializers.IntegerField()
    submissions_pending = serializers.IntegerField()
    completion_rate = serializers.FloatField()


class CourseProgressSerializer(serializers.Serializer):
    """Serializer para progreso por curso"""
    course_id = serializers.IntegerField()
    course_name = serializers.CharField()
    total_assignments = serializers.IntegerField()
    completed_assignments = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    students_count = serializers.IntegerField()


class StudentProgressSerializer(serializers.Serializer):
    """Serializer para progreso de estudiantes"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_email = serializers.CharField()
    course_name = serializers.CharField()
    total_assignments = serializers.IntegerField()
    completed_assignments = serializers.IntegerField()
    late_assignments = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    average_grade = serializers.FloatField(allow_null=True)
