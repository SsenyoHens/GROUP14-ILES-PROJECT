from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms

from .models import (
    CustomUser,
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile,
    InternshipPlacement,
    WeeklyLog,
    WeeklyLogHistory,
    Evaluation,
    EvaluationScore,
    EvaluationCriteria,
)
# =========================
# 🔧 WEEKLY LOG FORM
# =========================
class WeeklyLogAdminForm(forms.ModelForm):
    class Meta:
        model  = WeeklyLog
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        if self.instance and self.request:
            self.instance._current_user = self.request.user
        return cleaned_data


# =========================
# 👤 CUSTOM USER ADMIN
# =========================
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model         = CustomUser
    list_display  = ['email', 'first_name', 'last_name', 'role', 'department', 'phone', 'is_active']
    list_filter   = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering      = ['last_name', 'first_name']

    fieldsets = (
        (None,                {'fields': ('email', 'password')}),
        ('Personal Info',     {'fields': ('first_name', 'last_name', 'phone', 'department')}),  # ✅ removed organization
        ('Role',              {'fields': ('role',)}),
        ('Permissions',       {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates',   {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name',
                'phone', 'department', 'role',
                'password1', 'password2',
            ),
        }),
    )


# =========================
# 👨‍🎓 STUDENT PROFILE ADMIN
# =========================
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'registration_number', 'course', 'year_of_study']
    search_fields = ['user__email', 'user__first_name', 'registration_number']


# =========================
# 🎓 ACADEMIC SUPERVISOR ADMIN
# =========================
@admin.register(AcademicSupervisorProfile)
class AcademicSupervisorAdmin(admin.ModelAdmin):
    list_display  = ['user', 'department', 'staff_id', 'office_number', 'phone_number']
    search_fields = ['user__email', 'department', 'staff_id']


# =========================
# 🏢 WORKPLACE SUPERVISOR ADMIN
# =========================
@admin.register(WorkplaceSupervisorProfile)
class WorkplaceSupervisorAdmin(admin.ModelAdmin):
    list_display  = ['user', 'company_name', 'position', 'phone_number']
    search_fields = ['user__email', 'company_name']


# =========================
# 🏢 INTERNSHIP PLACEMENT ADMIN
# =========================
@admin.register(InternshipPlacement)
class InternshipPlacementAdmin(admin.ModelAdmin):
    list_display  = ['student', 'company_name', 'position', 'status', 'start_date', 'end_date']
    list_filter   = ['status']
    search_fields = ['student__user__email', 'company_name', 'position']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'student':
            kwargs['queryset'] = StudentProfile.objects.select_related('user')
        if db_field.name == 'academic_supervisor':
            kwargs['queryset'] = AcademicSupervisorProfile.objects.select_related('user')
        if db_field.name == 'workplace_supervisor':
            kwargs['queryset'] = WorkplaceSupervisorProfile.objects.select_related('user')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


# =========================
# 📘 WEEKLY LOG ADMIN
# =========================
@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    form          = WeeklyLogAdminForm
    list_display  = ['student', 'week_number', 'status', 'submitted_at', 'created_at']
    list_filter   = ['status', 'week_number']
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    list_select_related = ['student']

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)

        class FormWithRequest(form):
            def __init__(self2, *args, **kwargs2):
                kwargs2['request'] = request
                super().__init__(*args, **kwargs2)

        return FormWithRequest

    def save_model(self, request, obj, form, change):
        obj._current_user = request.user
        super().save_model(request, obj, form, change)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'student':
            kwargs['queryset'] = CustomUser.objects.filter(role='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


# =========================
# 📋 WEEKLY LOG HISTORY ADMIN
# =========================
@admin.register(WeeklyLogHistory)
class WeeklyLogHistoryAdmin(admin.ModelAdmin):
    list_display  = ['log', 'changed_by', 'old_status', 'new_status', 'changed_at']
    search_fields = ['log__id', 'changed_by__email']
    readonly_fields = ['log', 'changed_by', 'old_status', 'new_status', 'changed_at']


# =========================
# 📊 EVALUATION CRITERIA ADMIN
# =========================
@admin.register(EvaluationCriteria)
class EvaluationCriteriaAdmin(admin.ModelAdmin):
    list_display  = ['name', 'max_score', 'description']
    search_fields = ['name']


# =========================
# 📊 EVALUATION ADMIN
# =========================
@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display  = ['student', 'evaluator', 'weekly_log', 'status', 'total_score', 'grade', 'created_at']
    list_filter   = ['status']
    search_fields = ['student__email', 'evaluator__email']
    readonly_fields = ['total_score', 'grade', 'created_at', 'updated_at']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'student':
            kwargs['queryset'] = CustomUser.objects.filter(role='student')
        if db_field.name == 'evaluator':
            kwargs['queryset'] = CustomUser.objects.filter(
                role__in=['academic_supervisor', 'workplace_supervisor']
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


# =========================
# 📊 EVALUATION SCORE ADMIN
# =========================
@admin.register(EvaluationScore)
class EvaluationScoreAdmin(admin.ModelAdmin):
    list_display  = ['evaluation', 'criteria', 'score']
    search_fields = ['evaluation__student__email', 'criteria__name']