from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, WeeklyLog, EvaluationCriteria, Evaluation, InternshipPlacement
from .forms import CustomUserCreationForm


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = CustomUserCreationForm

    list_display = ('first_name', 'last_name', 'email', 'role')
    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('last_name', 'first_name')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active')}),
        ('Role', {'fields': ('role',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'week_number', 'status', 'created_at')
    list_filter = ('status', 'week_number')
    search_fields = ('student__first_name', 'student__last_name', 'student__email')


class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('student', 'weekly_log', 'evaluator', 'created_at')
    search_fields = ('student__first_name', 'student__last_name')


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(WeeklyLog, WeeklyLogAdmin)
admin.site.register(EvaluationCriteria)
admin.site.register(Evaluation, EvaluationAdmin)
admin.site.register(InternshipPlacement)