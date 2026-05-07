from django.contrib import admin
from django import forms
from .forms import CustomUserCreationForm
from .models import WeeklyLog, WeeklyLogHistory, CustomUser, InternshipPlacement, EvaluationCriteria, Evaluation    
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    WeeklyLog,
    EvaluationCriteria,
    Evaluation,
    InternshipPlacement,
)
#CustomUserCreationForm



class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = CustomUserCreationForm

    list_display = (
        'first_name',
        'last_name',
        'email',
        'role',
        'phone',
        'organization',
        'department',
    )

    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('last_name', 'first_name')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),

        ('Personal Info', {
            'fields': (
                'first_name',
                'last_name',
                'phone',
                'organization',
                'department',
            )
        }),

        ('Permissions', {
            'fields': (
                'is_staff',
                'is_superuser',
                'is_active',
            )
        }),

        ('Role', {'fields': ('role',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),

            'fields': (
                'email',
                'first_name',
                'last_name',
                'phone',
                'organization',
                'department',
                'password1',
                'password2',
                'role',
            ),
        }),
    )


class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'week_number', 'status', 'created_at')
    list_filter = ('status', 'week_number')
    search_fields = ('student__first_name', 'student__last_name', 'student__email')


class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('student', 'weekly_log', 'evaluator', 'created_at')
    search_fields = ('student__first_name', 'student__last_name')

class WeeklyLogAdminForm(forms.ModelForm):
    class Meta:
        model = WeeklyLog
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)  # Extract request from kwargs
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()

        if self.instance:
            self.instance._current_user = self.request.user  # Set current user for validation
        return cleaned_data
        

# admin.py
class WeeklyLogAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        obj._request_user = request.user
        super().save_model(request, obj, form, change)       
            
class WeeklyLogAdmin(admin.ModelAdmin):
    form = WeeklyLogAdminForm
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)

        class FormWithRequest(form):
            def __init__(self2, *args, **kwargs2):
                kwargs2['request'] = request
                super().__init__(*args, **kwargs2)

        return FormWithRequest
    def save_model(self, request, obj, form, change):
        obj._current_user = request.user #inject user into model instance
        super().save_model(request, obj, form, change)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "student":
            kwargs["queryset"] = CustomUser.objects.filter(role="student")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ['student', 'week_number', 'status', 'created_at']
    list_filter = ['status', 'week_number']
    search_fields = ['student__first_name', 'student__last_name', 'student__email']

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(WeeklyLog, WeeklyLogAdmin)
admin.site.register(Evaluation, EvaluationAdmin)
admin.site.register(EvaluationCriteria)
admin.site.register(InternshipPlacement)
admin.site.register(WeeklyLogHistory)