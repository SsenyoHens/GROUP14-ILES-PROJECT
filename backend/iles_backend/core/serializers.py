from rest_framework import serializers
from .models import InternshipPlacement
from .models import WeeklyLog


class PlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and start > end:
            raise serializers.ValidationError("Start date cannot be after end date.")

        return data
    

class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLog
        fields = ['id', 'week_number', 'content', 'status']
    
    def validate(self, data):

        #Prevent empty submission
        if data.get('status') == 'submitted' and not data.get('content'):
            raise serializers.ValidationError("Cannot submit empty log.")
        return data