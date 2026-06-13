from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from core.models import WeeklyLog
from core.serializers import WeeklyLogSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):
    user = request.user
    try:
        if user.role == 'student':
            logs = WeeklyLog.objects.filter(student=user)

        elif user.role == 'academic_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            )

        elif user.role == 'workplace_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__workplace_supervisor__user=user
            )

        else:
            logs = WeeklyLog.objects.all()

        serializer = WeeklyLogSerializer(logs, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):
    if request.user.role != 'student':
        return Response({"error": "Only students can create logs"}, status=403)

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

    if user.role == 'student':
        if log.student != user:
            return Response({"error": "Not authorized"}, status=403)
        if log.status not in ['draft', 'rejected']:
            return Response({"error": "Only draft or rejected logs can be edited"}, status=400)

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
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def review_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response(
            {"error": "Log not found"},
            status=404
        )

    # Only supervisors can review logs
    if request.user.role not in ['academic_supervisor', 'workplace_supervisor']:
        return Response(
            {"error": "Only supervisors can review logs."},
            status=403
        )

    # Only submitted logs can be reviewed
    if log.status != 'submitted':
        return Response(
            {"error": "Only submitted logs can be approved or rejected."},
            status=400
        )

    review_status = request.data.get('review_status')

    # Validate review status
    if review_status not in ['approved', 'rejected']:
        return Response(
            {"error": "review_status must be either 'approved' or 'rejected'."},
            status=400
        )

    # Update review status
    log.review_status = review_status

    # Keep main status synchronized
    log.status = review_status

    # Save supervisor comment if provided
    log.supervisor_comment = request.data.get(
        'supervisor_comment',
        log.supervisor_comment
    )

    log.save()

    return Response({
        "message": "Log reviewed successfully",
        "log_id": log.id,
        "week_number": log.week_number,
        "status": log.status,
        "review_status": log.review_status,
        "supervisor_comment": log.supervisor_comment,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    user = request.user

    if user.role == 'student':
        if log.student != user:
            return Response({"error": "Not authorized"}, status=403)
        if log.status != 'draft':
            return Response({"error": "Only draft logs can be deleted"}, status=400)
    elif user.role != 'admin':
        return Response({"error": "Not authorized"}, status=403)

    log.delete()
    return Response({"message": "Log deleted successfully"}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_summary(request):
    user = request.user
    try:
        if user.role == 'student':
            logs = WeeklyLog.objects.filter(student=user)
        elif user.role == 'academic_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            )
        elif user.role == 'workplace_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__workplace_supervisor__user=user
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

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_stats(request):
    user = request.user
    try:
        if user.role == 'student':
            logs = WeeklyLog.objects.filter(student=user)
        elif user.role == 'academic_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__academic_supervisor__user=user
            )
        elif user.role == 'workplace_supervisor':
            logs = WeeklyLog.objects.filter(
                student__studentprofile__internshipplacement__workplace_supervisor__user=user
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

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── NEW SUBMISSION ENDPOINT ──
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_log(request, pk):
    """
    Allows students to submit a draft weekly logbook entry for supervisor evaluation.
    """
    if request.user.role != 'student':
        return Response({"error": "Only students can submit logbook entries."}, status=403)
        
    # Find the log, ensuring it belongs explicitly to the student making the request
    log = get_object_or_404(WeeklyLog, pk=pk, student=request.user)
    
    # Validation constraint check
    if log.status != 'draft':
        return Response(
            {"error": f"Cannot submit log. This entry is already marked as '{log.status}'."}, 
            status=400
        )
        
    # Perform status state migration
    log.status = 'submitted'
    log.save()
    
    # Return updated item fields back to react UI sync cycle
    serializer = WeeklyLogSerializer(log)
    return Response(serializer.data, status=200)