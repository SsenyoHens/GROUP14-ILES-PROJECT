from django.contrib.auth import get_user_model
from rest_framework import serializers

from core.models import (
    Notification,
    CustomUser,
    AcademicSupervisorProfile,
    Evaluation,
    EvaluationScore,
    InternshipPlacement,
    StudentProfile,
    WeeklyLog,
    WeeklyLogHistory,
    WorkplaceSupervisorProfile,
)

User = get_user_model()

#============================================
# USER SERIALIZER
#============================================
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = [
            'id',
            'username',
            'email',
            'role',
        ]


# =========================================================
# 1. REGISTER SERIALIZER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    # Shared fields
    full_name = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)

    # Student fields
    registration_number = serializers.CharField(required=False)
    course = serializers.CharField(required=False)
    year_of_study = serializers.IntegerField(required=False)

    # Academic supervisor fields
    department = serializers.CharField(required=False)
    staff_id = serializers.CharField(required=False)

    # Workplace supervisor fields
    organization = serializers.CharField(required=False)
    job_title = serializers.CharField(required=False)

    class Meta:
        model = User

        fields = [
            'email',
            'username',
            'password',
            'role',

            # Shared
            'full_name',
            'phone_number',

            # Student
            'registration_number',
            'course',
            'year_of_study',

            # Academic Supervisor
            'department',
            'staff_id',

            # Workplace Supervisor
            'organization',
            'job_title',
        ]

    def validate_role(self, value):

        valid_roles = [
            'student',
            'admin',
            'academic_supervisor',
            'workplace_supervisor',
        ]

        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role.")

        return value

    def create(self, validated_data):

        # Shared fields
        full_name = validated_data.pop('full_name', '')
        phone_number = validated_data.pop('phone_number', '')

        # Student
        registration_number = validated_data.pop('registration_number', '')

        course = validated_data.pop('course', '')

        year_of_study = validated_data.pop('year_of_study', None)

        # Academic supervisor
        department = validated_data.pop('department', '')
        staff_id = validated_data.pop('staff_id', '')

        # Workplace supervisor
        organization = validated_data.pop('organization', '')
        job_title = validated_data.pop('job_title', '')

        password = validated_data.pop('password')

        # Create user
        user = User.objects.create(**validated_data)

        user.set_password(password)
        user.save()

        # STUDENT PROFILE
        if user.role == 'student':

            StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'registration_number': registration_number,
                    'course': course,
                    'year_of_study': year_of_study,
                    'phone_number': phone_number,
                }
            )

        # ACADEMIC SUPERVISOR PROFILE
        elif user.role == 'academic_supervisor':

            AcademicSupervisorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'department': department,
                    'staff_id': staff_id,
                    'phone_number': phone_number,
                }
            )

        # WORKPLACE SUPERVISOR PROFILE
        elif user.role == 'workplace_supervisor':

            WorkplaceSupervisorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'organization': organization,
                    'job_title': job_title,
                    'phone_number': phone_number,
                }
            )

        return user


# =========================================================
# 2. LOGIN SERIALIZER
# =========================================================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField(required=True)

    password = serializers.CharField(required=True, write_only=True)


# =========================================================
# 3. STUDENT PROFILE SERIALIZER
# =========================================================

class StudentProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentProfile

        fields = [
            'registration_number',
            'course',
            'year_of_study',
            'phone_number',
        ]

# =========================================================
# ACADEMIC SUPERVISOR PROFILE SERIALIZER
# =========================================================

class AcademicSupervisorProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = AcademicSupervisorProfile

        fields = [
            'department',
            'staff_id',
            'phone_number',
        ]


# =========================================================
# WORKPLACE SUPERVISOR PROFILE SERIALIZER
# =========================================================

class WorkplaceSupervisorProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkplaceSupervisorProfile

        fields = [
            'organization',
            'job_title',
            'phone_number',
        ]

# =========================================================
# USER SERIALIZER
# =========================================================

'''class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'role',
        ]'''


# =========================================================
# ACADEMIC SUPERVISOR PROFILE SERIALIZER
# =========================================================
class AcademicSupervisorProfileSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = AcademicSupervisorProfile

        fields = '__all__'

# =========================================================
# WORKPLACE SUPERVISOR PROFILE SERIALIZER
# =========================================================
class WorkplaceSupervisorProfileSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = WorkplaceSupervisorProfile

        fields = '__all__'

# =========================================================
# SUPERVISOR SERIALIZER
# =========================================================
class SupervisorSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'role',
        ]
# =========================================================
# 4. EVALUATION SCORE SERIALIZER
# =========================================================
class EvaluationScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = EvaluationScore

        fields = [
            'criteria',
            'score',
        ]


# =========================================================
# 5. EVALUATION SERIALIZER
# =========================================================
class EvaluationSerializer(serializers.ModelSerializer):

    scores = EvaluationScoreSerializer(
        many=True,
        source='evaluationscore_set',
        read_only=True
    )

    class Meta:
        model = Evaluation

        fields = [
            'id',
            'student',
            'evaluator',
            'weekly_log',
            'status',
            'total_score',
            'grade',
            'feedback',
            'scores',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'total_score',
            'grade',
            'status',
        ]


# =========================================================
# 6. INTERNSHIP PLACEMENT SERIALIZER
# =========================================================
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


# =========================================================
# 7. WEEKLY LOG SERIALIZER
# =========================================================
class WeeklyLogSerializer(serializers.ModelSerializer):

    student = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = WeeklyLog

        fields = [
            'id',
            'student',
            'week_number',
            'activities_done',
            'challenges',
            'skills_gained',
            'strengths',
            'plan_for_action',
            'status',
            'created_at',
        ]

    def validate(self, data):

        if (data.get('status') == 'submitted' and not data.get('activities_done')):
            raise serializers.ValidationError(
                "Cannot submit empty log.")
        return data

# =========================================================
# 8. WEEKLY LOG STATS SERIALIZER
# =========================================================
class WeeklyLogStatsSerializer(serializers.Serializer):

    total_logs = serializers.IntegerField()

    approved_logs = serializers.IntegerField()

    pending_logs = serializers.IntegerField()

    rejected_logs = serializers.IntegerField()


# =========================================================
# 9. WEEKLY LOG HISTORY SERIALIZER
# =========================================================
class WeeklyLogHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLogHistory

        fields = '__all__'
<<<<<<< HEAD
          
# =========================================================
# 10. USER SERIALIZER
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'email',
            'username',
            'role',
            'first_name',
            'last_name',
            'is_active',
        ]        

# =========================================================
# SUPERVISOR SERIALIZER
# =========================================================

class SupervisorSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'role',
            'is_active',
        ]        
=======

#========================================================
# 10. NOTIFICATION SERIALIZER
# =========================================================
class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification

        fields = '__all__'
>>>>>>> c28388f (updated constraint from conditon to check, added notifications model,)
