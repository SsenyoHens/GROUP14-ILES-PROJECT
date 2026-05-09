from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import WeeklyLog
from core.serializers import WeeklyLogSerializer
from core.permissions import IsAdmin, IsAcademicSupervisor, IsSupervisor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):
    user = request.user

    if user.role == 'student':
        # Students only see their own logs
        logs = WeeklyLog.objects.filter(student=user)

    elif user.role == 'academic_supervisor':
        # Academic supervisors see logs of students they supervise
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__academic_supervisor__user=user
        )

    elif user.role == 'workplace_supervisor':
        # Workplace supervisors see logs of students at their company
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__workplace_supervisor__user=user
        )

    else:
        # Admin sees all logs
        logs = WeeklyLog.objects.all()

    serializer = WeeklyLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):
    if request.user.role != 'student':
        return Response(
            {"error": "Only students can create logs"},
            status=403
        )

    serializer = WeeklyLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(student=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    user = request.user

    # Students can only edit their own draft logs
    if user.role == 'student':
        if log.student != user:
            return Response({"error": "Not authorized"}, status=403)
        if log.status != 'draft':
            return Response(
                {"error": "Only draft logs can be edited"},
                status=400
            )

    # Supervisors can update status (approve/reject)
    elif user.role in ['academic_supervisor', 'workplace_supervisor']:
        allowed_fields = {'status', 'feedback'}
        if not set(request.data.keys()).issubset(allowed_fields):
            return Response(
                {"error": "Supervisors can only update status and feedback"},
                status=403
            )

    serializer = WeeklyLogSerializer(log, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    user = request.user

    # Students can only delete their own draft logs
    if user.role == 'student':
        if log.student != user:
            return Response({"error": "Not authorized"}, status=403)
        if log.status != 'draft':
            return Response({"error": "Only draft logs can be deleted"}, status=400)

    # Only admin can delete any log
    elif user.role != 'admin':
        return Response({"error": "Not authorized"}, status=403)

    log.delete()
    return Response({"message": "Log deleted successfully"}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_summary(request):
    user = request.user

    if user.role == 'student':
        logs = WeeklyLog.objects.filter(student=user)
    elif user.role == 'academic_supervisor':
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__academic_supervisor__user=user
        )
    elif user.role == 'workplace_supervisor':
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__workplace_supervisor__user=user
        )
    else:
        logs = WeeklyLog.objects.all()

    summary = logs.values(
        'student__first_name',
        'student__last_name',
    ).annotate(
        total_logs=Count('id'),
        draft_logs=Count('id', filter=Q(status='draft')),
        submitted_logs=Count('id', filter=Q(status='submitted')),
        approved_logs=Count('id', filter=Q(status='approved')),
        rejected_logs=Count('id', filter=Q(status='rejected')),
    )

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_stats(request):
    user = request.user

    if user.role == 'student':
        logs = WeeklyLog.objects.filter(student=user)
    elif user.role == 'academic_supervisor':
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__academic_supervisor__user=user
        )
    elif user.role == 'workplace_supervisor':
        logs = WeeklyLog.objects.filter(
            student__internshipplacement__workplace_supervisor__user=user
        )
    else:
        logs = WeeklyLog.objects.all()

    return Response({
        "total_logs":     logs.count(),
        "draft_logs":     logs.filter(status='draft').count(),
        "submitted_logs": logs.filter(status='submitted').count(),
        "approved_logs":  logs.filter(status='approved').count(),
        "rejected_logs":  logs.filter(status='rejected').count(),
    })