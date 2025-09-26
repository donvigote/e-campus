from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Course, CourseEnrollment, CourseWork, StudentSubmission, SyncLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'google_name', 'google_email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'google_name', 'google_email')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información de Google', {
            'fields': ('google_id', 'google_email', 'google_name', 'google_picture', 'role')
        }),
        ('Tokens de acceso', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'cohort', 'course_state', 'is_active', 'creation_time')
    list_filter = ('course_state', 'is_active', 'cohort', 'creation_time')
    search_fields = ('name', 'section', 'description')
    readonly_fields = ('google_course_id', 'owner_id', 'creation_time', 'update_time', 'alternate_link')
    
    fieldsets = (
        ('Información básica', {
            'fields': ('name', 'description', 'section', 'room', 'cohort')
        }),
        ('Estado', {
            'fields': ('course_state', 'is_active')
        }),
        ('Información de Google Classroom', {
            'fields': ('google_course_id', 'owner_id', 'enrollment_code', 'alternate_link'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('creation_time', 'update_time'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'role', 'created_at')
    list_filter = ('role', 'created_at', 'course__cohort')
    search_fields = ('user__google_name', 'user__google_email', 'course__name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'course')


@admin.register(CourseWork)
class CourseWorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'work_type', 'state', 'due_date', 'max_points')
    list_filter = ('work_type', 'state', 'course__cohort', 'due_date')
    search_fields = ('title', 'description', 'course__name')
    readonly_fields = ('google_coursework_id', 'creation_time', 'update_time', 'alternate_link')
    
    fieldsets = (
        ('Información básica', {
            'fields': ('title', 'description', 'course', 'work_type')
        }),
        ('Configuración', {
            'fields': ('state', 'max_points', 'due_date', 'due_time')
        }),
        ('Información de Google Classroom', {
            'fields': ('google_coursework_id', 'alternate_link'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('creation_time', 'update_time'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentSubmission)
class StudentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'coursework', 'state', 'late', 'assigned_grade', 'update_time')
    list_filter = ('state', 'late', 'coursework__course__cohort', 'update_time')
    search_fields = ('user__google_name', 'user__google_email', 'coursework__title')
    readonly_fields = ('google_submission_id', 'creation_time', 'update_time', 'alternate_link')
    
    fieldsets = (
        ('Información básica', {
            'fields': ('user', 'coursework', 'state', 'late')
        }),
        ('Calificaciones', {
            'fields': ('draft_grade', 'assigned_grade')
        }),
        ('Información de Google Classroom', {
            'fields': ('google_submission_id', 'alternate_link'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('creation_time', 'update_time'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'coursework', 'coursework__course')


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'sync_type', 'status', 'items_processed', 'created_at')
    list_filter = ('sync_type', 'status', 'created_at')
    search_fields = ('user__google_name', 'user__google_email', 'message')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Información básica', {
            'fields': ('user', 'sync_type', 'status', 'items_processed')
        }),
        ('Detalles', {
            'fields': ('message', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
