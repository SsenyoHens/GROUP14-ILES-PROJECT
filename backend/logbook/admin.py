"""
Django Admin Configuration for Logbook
Allows admins and supervisors to manage logbook entries
"""

from django.contrib import admin
from .models import LogbookEntry


@admin.register(LogbookEntry)
class LogbookEntryAdmin(admin.ModelAdmin):
    """Admin interface for LogbookEntry"""
    
    list_display = [
        'student',
        'week_start',
        'week_end',
        'hours_spent',
        'status',
        'date_logged',
    ]
    
    list_filter = [
        'status',
        'week_start',
        'created_at',
    ]
    
    search_fields = [
        'student__username',
        'student__first_name',
        'student__last_name',
        'activity_description',
    ]
    
    readonly_fields = [
        'date_logged',
        'created_at',
        'updated_at',
        'approved_by',
        'approval_date',
    ]
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student',)
        }),
        ('Activity Details', {
            'fields': (
                'activity_description',
                'week_start',
                'week_end',
                'hours_spent',
            )
        }),
        ('Status & Approval', {
            'fields': (
                'status',
                'supervisor_feedback',
                'approved_by',
                'approval_date',
            )
        }),
        ('Timestamps', {
            'fields': (
                'date_logged',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_approved', 'mark_as_rejected']
    
    def mark_as_approved(self, request, queryset):
        """Admin action to approve entries"""
        updated = queryset.filter(status='submitted').update(
            status='approved',
            approved_by=request.user
        )
        self.message_user(request, f'{updated} entries were approved.')
    
    mark_as_approved.short_description = "Mark selected entries as approved"
    
    def mark_as_rejected(self, request, queryset):
        """Admin action to reject entries"""
        updated = queryset.filter(status='submitted').update(
            status='rejected',
            approved_by=request.user
        )
        self.message_user(request, f'{updated} entries were rejected.')
    
    mark_as_rejected.short_description = "Mark selected entries as rejected"
    
    def get_readonly_fields(self, request, obj=None):
        """Make fields read-only for non-superusers"""
        if not request.user.is_superuser:
            return self.readonly_fields + ['student', 'activity_description', 'hours_spent']
        return self.readonly_fields
