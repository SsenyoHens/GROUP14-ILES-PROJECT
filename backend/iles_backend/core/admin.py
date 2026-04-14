from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff')

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
)

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email', 'role')}),
)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(InternshipPlacement)
admin.site.register(WeeklyLog)
admin.site.register(EvaluationCriteria)
admin.site.register(Evaluation)