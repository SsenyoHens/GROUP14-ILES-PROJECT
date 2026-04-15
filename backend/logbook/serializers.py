from rest_framework import serializers
from .models import LogbookEntry


class LogbookEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogbookEntry
        fields = ['id', 'week_number', 'activities', 'date_logged', 'is_submitted', 'submitted_at']
        read_only_fields = ['student', 'date_logged', 'submitted_at']
