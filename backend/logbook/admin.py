from django.contrib import admin
from .models import LogbookEntry


@admin.register(LogbookEntry)
class LogbookEntryAdmin(admin.ModelAdmin):
    list_display = ['student', 'week_number', 'is_submitted', 'date_logged']
    list_filter = ['is_submitted']
