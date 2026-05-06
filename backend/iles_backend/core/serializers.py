from rest_framework import serializers
from .models import (
    CustomUser,
    Evaluation,
    StudentProfile,
    InternshipPlacement,
    WeeklyLog
)


# 1. Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=5)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'role']

    def validate_role(self, value):
        roles = ['student', 'admin', 'academic_supervisor', 'workplace_supervisor']
        if value not in roles:
            raise serializers.ValidationError("Invalid role")
        return value

    def create(self, validated_data):
        user = CustomUser(
            email=validated_data['email'],
            username=validated_data['username'],
            role=validated_data.get('role', 'student')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
            
# 2. Login Serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


# 3. Student Profile Serializer
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['registration_number', 'course', 'year_of_study', 'phone_number']


# 4. Evaluation Serializer
class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['student', 'evaluator', 'feedback']


# 5. Internship Placement Serializer
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


# 6. Weekly Log Serializer
class WeeklyLogSerializer(serializers.ModelSerializer): 
    class Meta:
        model = WeeklyLog
        fields = ['id', 'week_number', 'content', 'status']

    def validate(self, data):
        if data.get('status') == 'submitted' and not data.get('content'):
            raise serializers.ValidationError("Cannot submit empty log.")
        return data     


class WeeklyLogStatsSerializer(serializers.Serializer):
    total_logs = serializers.IntegerField()
    approved_logs = serializers.IntegerField()
    pending_logs = serializers.IntegerField()
    rejected_logs = serializers.IntegerField()        