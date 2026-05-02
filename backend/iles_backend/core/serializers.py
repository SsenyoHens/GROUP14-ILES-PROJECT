from rest_framework import serializers

from .models import (
    CustomUser,
    Evaluation,
    StudentProfile,
    InternshipPlacement,
    WeeklyLog, 
    EvaluationScore,
    WeeklyLogHistory,
)


# =========================
# REGISTER SERIALIZER
# =========================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=5
    )

    class Meta:
        model = CustomUser

        fields = [
            'email',
            'username',
            'password',
            'role'
        ]

    def create(self, validated_data):

        user = CustomUser(
            email=validated_data['email'],
            username=validated_data['username'],
            role=validated_data.get('role', 'student')
        )

        user.set_password(validated_data['password'])

        user.save()

        return user


# =========================
# LOGIN SERIALIZER
# =========================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField(required=True)

    password = serializers.CharField(required=True)


# =========================
# STUDENT PROFILE
# =========================

class StudentProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentProfile

        fields = [
            'registration_number',
            'course',
            'year_of_study',
            'phone_number'
        ]


<<<<<<< HEAD
# =========================
# EVALUATION
# =========================

class EvaluationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Evaluation

        fields = [
            'student',
            'evaluator',
            'feedback'
        ]
=======
class EvaluationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationScore
        fields = ['criteria', 'score']
        read_only_fields = ['total_score', 'grade', 'status']
# 4. Evaluation Serializer
class EvaluationSerializer(serializers.ModelSerializer):
    scores = EvaluationScoreSerializer(many=True, source='evaluationscore_set', read_only=True)   
    class Meta:
        model = Evaluation
        fields = ['student', 'evaluator', 'feedback', 'scores']
>>>>>>> edb29e6 (modified:   core/views.py, modified:   core/urls.py, modified:   core/serializers.py, modified:   core/models.py, new file:   core/migrations/0002_evaluation_grade_evaluation_status_and_more.py)


# =========================
# PLACEMENT
# =========================

class PlacementSerializer(serializers.ModelSerializer):

    class Meta:
        model = InternshipPlacement

        fields = '__all__'


# =========================
# WEEKLY LOG
# =========================

class WeeklyLogSerializer(serializers.ModelSerializer):

    student = serializers.ReadOnlyField(
        source='student.email'
    )

    class Meta:
        model = WeeklyLog

<<<<<<< HEAD
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
            'created_at'
        ]


# =========================
# WEEKLY LOG STATS
# =========================

class WeeklyLogStatsSerializer(serializers.Serializer):

    total_logs = serializers.IntegerField()

    approved_logs = serializers.IntegerField()

    pending_logs = serializers.IntegerField()

    rejected_logs = serializers.IntegerField()


# =========================
# SUPERVISOR
# =========================

class SupervisorSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'organization',
            'department',
            'role'
        ]
=======
    def validate(self, data):
        if data.get('status') == 'submitted' and not data.get('content'):
            raise serializers.ValidationError("Cannot submit empty log.")
        return data
    

# 7. Evaluation Score Serializer
'''class EvaluationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationScore
        fields = ['criteria', 'score']
        read_only_fields = ['total_score', 'grade', 'status']'''
>>>>>>> edb29e6 (modified:   core/views.py, modified:   core/urls.py, modified:   core/serializers.py, modified:   core/models.py, new file:   core/migrations/0002_evaluation_grade_evaluation_status_and_more.py)
