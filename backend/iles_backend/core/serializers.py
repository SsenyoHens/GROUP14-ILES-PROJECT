from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    CustomUser,
    Evaluation,
    EvaluationScore,
    EvaluationCriteria,
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile,
    InternshipPlacement,
    WeeklyLog,
    WeeklyLogHistory,
)

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=8)

    # Shared
    phone_number = serializers.CharField(required=False, allow_blank=True)

    # Student only
    registration_number = serializers.CharField(required=False, allow_blank=True)
    course              = serializers.CharField(required=False, allow_blank=True)
    year_of_study       = serializers.IntegerField(required=False, allow_null=True)

    # Academic supervisor only
    department    = serializers.CharField(required=False, allow_blank=True)
    staff_id      = serializers.CharField(required=False, allow_blank=True)
    office_number = serializers.CharField(required=False, allow_blank=True)

    # Workplace supervisor only
    company_name = serializers.CharField(required=False, allow_blank=True)
    position     = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = User
        fields = [
            'email', 'username', 'password', 'role',
            'first_name', 'last_name',
            # shared
            'phone_number',
            # student
            'registration_number', 'course', 'year_of_study',
            # academic supervisor
            'department', 'staff_id', 'office_number',
            # workplace supervisor
            'company_name', 'position',
        ]

    def validate_role(self, value):
        valid_roles = ['student', 'admin', 'academic_supervisor', 'workplace_supervisor']
        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role.")
        return value

    def create(self, validated_data):
        # Pop profile fields
        phone_number        = validated_data.pop('phone_number', '')
        registration_number = validated_data.pop('registration_number', '')
        course              = validated_data.pop('course', '')
        year_of_study       = validated_data.pop('year_of_study', None)
        department          = validated_data.pop('department', '')
        staff_id            = validated_data.pop('staff_id', '')
        office_number       = validated_data.pop('office_number', '')
        company_name        = validated_data.pop('company_name', '')
        position            = validated_data.pop('position', '')
        password            = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Create profile with full data (signal uses get_or_create so no duplicate)
        if user.role == 'student':
            StudentProfile.objects.filter(user=user).update(
                registration_number=registration_number.upper(),
                course=course,
                year_of_study=year_of_study,
                phone_number=phone_number,
            )

        elif user.role == 'academic_supervisor':
            AcademicSupervisorProfile.objects.filter(user=user).update(
                department=department,
                staff_id=staff_id,
                office_number=office_number,
                phone_number=phone_number,
            )

        elif user.role == 'workplace_supervisor':
            WorkplaceSupervisorProfile.objects.filter(user=user).update(
                company_name=company_name,
                position=position,
                phone_number=phone_number,
            )

        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'department', 'phone']
        read_only_fields = ['id']


class StudentProfileSerializer(serializers.ModelSerializer):
    email      = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name', read_only=True)
    role       = serializers.CharField(source='user.role', read_only=True)


    def validate_registration_number(self, value):
        if value:
            value = value.upper().strip()
        return value

    class Meta:
        model  = StudentProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'registration_number', 'course', 'year_of_study', 'phone_number',
        ]


class AcademicSupervisorProfileSerializer(serializers.ModelSerializer):
    email      = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model  = AcademicSupervisorProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'department', 'staff_id', 'office_number', 'phone_number']


class WorkplaceSupervisorProfileSerializer(serializers.ModelSerializer):
    email      = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model  = WorkplaceSupervisorProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'company_name', 'position', 'phone_number']


class SupervisorSerializer(serializers.ModelSerializer):
    """Combined serializer for listing all supervisors"""
    profile = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'profile']

    def get_profile(self, obj):
        if obj.role == 'academic_supervisor':
            profile = getattr(obj, 'academicsupervisorprofile', None)
            if profile:
                return AcademicSupervisorProfileSerializer(profile).data
        elif obj.role == 'workplace_supervisor':
            profile = getattr(obj, 'workplacesupervisorprofile', None)
            if profile:
                return WorkplaceSupervisorProfileSerializer(profile).data
        return None


class PlacementSerializer(serializers.ModelSerializer):
    student_email  = serializers.EmailField(source='student.user.email', read_only=True)
    student_name   = serializers.SerializerMethodField()

    class Meta:
        model  = InternshipPlacement
        fields = [
            'id', 'student', 'student_email', 'student_name',
            'academic_supervisor', 'workplace_supervisor',
            'company_name', 'position',
            'start_date', 'end_date', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def validate(self, data):
        start = data.get('start_date')
        end   = data.get('end_date')
        if start and end and start >= end:
            raise serializers.ValidationError("End date must be after start date.")
        return data


class WeeklyLogSerializer(serializers.ModelSerializer):
    student_email = serializers.ReadOnlyField(source='student.email')
    student_name  = serializers.SerializerMethodField()

    class Meta:
        model  = WeeklyLog
        fields = [
            'id', 'student', 'student_email', 'student_name',
            'week_number', 'activities_done', 'challenges',
            'skills_gained', 'strengths', 'plan_for_action',   
            'status', 'submitted_at', 'created_at',
        ]
        read_only_fields = ['id', 'student', 'submitted_at', 'created_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def validate(self, data):
        if data.get('status') == 'submitted' and not data.get('activities_done'):
            raise serializers.ValidationError("Cannot submit an empty log.")
        return data


class WeeklyLogHistorySerializer(serializers.ModelSerializer):
    changed_by_email = serializers.EmailField(source='changed_by.email', read_only=True)

    class Meta:
        model  = WeeklyLogHistory
        fields = ['id', 'log', 'changed_by', 'changed_by_email', 'old_status', 'new_status', 'changed_at']  


class WeeklyLogStatsSerializer(serializers.Serializer):
    total_logs     = serializers.IntegerField()
    submitted_logs = serializers.IntegerField()
    approved_logs  = serializers.IntegerField()
    rejected_logs  = serializers.IntegerField()
    draft_logs     = serializers.IntegerField()


class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EvaluationCriteria
        fields = ['id', 'name', 'max_score', 'description']


class EvaluationScoreSerializer(serializers.ModelSerializer):
    criteria_name     = serializers.CharField(source='criteria.name', read_only=True)
    criteria_max      = serializers.IntegerField(source='criteria.max_score', read_only=True)

    class Meta:
        model  = EvaluationScore
        fields = ['id', 'criteria', 'criteria_name', 'criteria_max', 'score']


class EvaluationSerializer(serializers.ModelSerializer):
    scores        = EvaluationScoreSerializer(many=True, source='evaluationscore_set', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    evaluator_email = serializers.EmailField(source='evaluator.email', read_only=True)

    class Meta:
        model  = Evaluation
        fields = [
            'id', 'student', 'student_email',
            'evaluator', 'evaluator_email',
            'weekly_log', 'status',
            'total_score', 'grade',
            'feedback', 'scores',
            'created_at', 'updated_at',   
        ]
        read_only_fields = ['id', 'total_score', 'grade', 'created_at', 'updated_at']