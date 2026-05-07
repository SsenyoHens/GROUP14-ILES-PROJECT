"""
Logbook Views and Serializers for Issue #3
Provides API endpoints for students to manage their logbook entries
"""

from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import LogbookEntry


class LogbookEntrySerializer(serializers.ModelSerializer):
    """Serializer for LogbookEntry model"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    supervisor_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = LogbookEntry
        fields = [
            'id',
            'student',
            'student_name',
            'activity_description',
            'date_logged',
            'week_start',
            'week_end',
            'hours_spent',
            'status',
            'supervisor_feedback',
            'approved_by',
            'supervisor_name',
            'approval_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'date_logged', 'created_at', 'updated_at', 'approved_by', 'approval_date']


class LogbookEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LogbookEntry
    Provides CRUD operations and custom actions for logbook management
    """
    serializer_class = LogbookEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns logbook entries based on user role:
        - Students see only their own entries
        - Supervisors see all entries in their department
        - Admin sees all entries
        """
        user = self.request.user
        
        # If user is superuser, return all entries
        if user.is_superuser:
            return LogbookEntry.objects.all()
        
        # If user is a student, return only their entries
        if hasattr(user, 'student_profile'):
            return LogbookEntry.objects.filter(student=user)
        
        # If user is a supervisor, return entries for students they supervise
        if hasattr(user, 'supervisor_profile'):
            return LogbookEntry.objects.filter(
                student__in=user.supervisor_profile.students.all()
            )
        
        return LogbookEntry.objects.none()

    def perform_create(self, serializer):
        """Auto-assign current user as the student"""
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a draft logbook entry for review"""
        logbook_entry = self.get_object()
        
        if logbook_entry.status != 'draft':
            return Response(
                {'error': f'Only draft entries can be submitted. Current status: {logbook_entry.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logbook_entry.submit()
        serializer = self.get_serializer(logbook_entry)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a submitted logbook entry (Supervisor only)"""
        logbook_entry = self.get_object()
        feedback = request.data.get('feedback', '')
        
        # Check if user is supervisor or admin
        if not (request.user.is_superuser or hasattr(request.user, 'supervisor_profile')):
            return Response(
                {'error': 'Only supervisors can approve logbook entries'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if logbook_entry.status != 'submitted':
            return Response(
                {'error': f'Only submitted entries can be approved. Current status: {logbook_entry.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logbook_entry.approve(request.user, feedback)
        serializer = self.get_serializer(logbook_entry)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a submitted logbook entry with feedback (Supervisor only)"""
        logbook_entry = self.get_object()
        feedback = request.data.get('feedback', 'No feedback provided')
        
        # Check if user is supervisor or admin
        if not (request.user.is_superuser or hasattr(request.user, 'supervisor_profile')):
            return Response(
                {'error': 'Only supervisors can reject logbook entries'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if logbook_entry.status != 'submitted':
            return Response(
                {'error': f'Only submitted entries can be rejected. Current status: {logbook_entry.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logbook_entry.reject(request.user, feedback)
        serializer = self.get_serializer(logbook_entry)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_entries(self, request):
        """Get all logbook entries for the current user"""
        entries = self.get_queryset()
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get all logbook entries pending approval (Supervisor only)"""
        if not (request.user.is_superuser or hasattr(request.user, 'supervisor_profile')):
            return Response(
                {'error': 'Only supervisors can view pending entries'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        entries = self.get_queryset().filter(status='submitted')
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)
