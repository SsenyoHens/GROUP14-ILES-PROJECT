"""
Supervisor Views and Serializers for Issue #4
Provides API endpoints for workplace supervisors to assess students
"""

from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SupervisorProfile, WorkplaceAssessment
from django.contrib.auth.models import User


class SupervisorProfileSerializer(serializers.ModelSerializer):
    """Serializer for SupervisorProfile model"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    assigned_students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SupervisorProfile
        fields = [
            'id',
            'user',
            'user_name',
            'company_name',
            'department',
            'phone',
            'assigned_students',
            'assigned_students_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_assigned_students_count(self, obj):
        return obj.assigned_students.count()


class WorkplaceAssessmentSerializer(serializers.ModelSerializer):
    """Serializer for WorkplaceAssessment model"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    company_name = serializers.CharField(source='supervisor_profile.company_name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    
    class Meta:
        model = WorkplaceAssessment
        fields = [
            'id',
            'student',
            'student_name',
            'supervisor',
            'supervisor_name',
            'supervisor_profile',
            'company_name',
            'assessment_date',
            'assessment_period_start',
            'assessment_period_end',
            'technical_skills_rating',
            'knowledge_application_rating',
            'communication_rating',
            'overall_rating',
            'average_rating',
            'strengths',
            'areas_for_improvement',
            'recommendations',
            'is_approved',
            'approved_by_academic',
            'approval_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'assessment_date',
            'is_approved',
            'approved_by_academic',
            'approval_date',
            'created_at',
            'updated_at',
        ]


class SupervisorProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SupervisorProfile
    Allows supervisors to manage their profile and assigned students
    """
    serializer_class = SupervisorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return supervisor profiles visible to current user"""
        user = self.request.user
        
        # Supervisors see only their own profile
        if hasattr(user, 'supervisor_profile'):
            return SupervisorProfile.objects.filter(user=user)
        
        # Admin sees all
        if user.is_superuser:
            return SupervisorProfile.objects.all()
        
        return SupervisorProfile.objects.none()

    def perform_create(self, serializer):
        """Auto-assign current user to profile"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def assigned_students(self, request, pk=None):
        """Get all students assigned to this supervisor"""
        supervisor_profile = self.get_object()
        students = supervisor_profile.assigned_students.all()
        data = [{
            'id': student.id,
            'username': student.username,
            'full_name': student.get_full_name(),
            'email': student.email,
        } for student in students]
        return Response(data)

    @action(detail=True, methods=['get'])
    def pending_assessments(self, request, pk=None):
        """Get pending assessments for this supervisor"""
        supervisor_profile = self.get_object()
        assessments = WorkplaceAssessment.objects.filter(
            supervisor_profile=supervisor_profile,
            is_approved=False
        )
        serializer = WorkplaceAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)


class WorkplaceAssessmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WorkplaceAssessment
    Allows supervisors to create and manage student assessments
    """
    serializer_class = WorkplaceAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return assessments based on user role"""
        user = self.request.user
        
        # Supervisors see assessments they created
        if hasattr(user, 'supervisor_profile'):
            return WorkplaceAssessment.objects.filter(supervisor=user)
        
        # Admin sees all
        if user.is_superuser:
            return WorkplaceAssessment.objects.all()
        
        # Students see assessments about them
        return WorkplaceAssessment.objects.filter(student=user)

    def perform_create(self, serializer):
        """Auto-assign current supervisor"""
        serializer.save(supervisor=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve assessment (Academic supervisor only)"""
        assessment = self.get_object()
        
        if assessment.is_approved:
            return Response(
                {'error': 'Assessment is already approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assessment.approve(request.user)
        serializer = self.get_serializer(assessment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_assessments(self, request):
        """Get all assessments created by current supervisor"""
        assessments = self.get_queryset()
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get assessments pending academic approval"""
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only admins can view pending approvals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        assessments = WorkplaceAssessment.objects.filter(is_approved=False)
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)
