from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import WeeklyLog
from core.serializers import (
    WeeklyLogSerializer,
)


# =========================================================
# VIEW ALL LOGS
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):

    logs = WeeklyLog.objects.filter(
        student=request.user
    )

    serializer = WeeklyLogSerializer(
        logs,
        many=True
    )

    return Response(serializer.data)


# =========================================================
# CREATE LOG
# =========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):

    serializer = WeeklyLogSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save(
            student=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# UPDATE LOG
# =========================================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):

    try:
        log = WeeklyLog.objects.get(
            pk=pk,
            student=request.user
        )

    except WeeklyLog.DoesNotExist:

        return Response(
            {"error": "Log not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = WeeklyLogSerializer(
        log,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# DELETE LOG
# =========================================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_log(request, pk):

    try:
        log = WeeklyLog.objects.get(
            pk=pk,
            student=request.user
        )

    except WeeklyLog.DoesNotExist:

        return Response(
            {"error": "Log not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    log.delete()

    return Response(
        {"message": "Log deleted successfully"}
    )


# =========================================================
# WEEKLY LOG SUMMARY
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_summary(request):

    total_logs = WeeklyLog.objects.filter(
        student=request.user
    ).count()

    return Response({
        "total_logs": total_logs
    })


# =========================================================
# WEEKLY LOG STATS
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_stats(request):

    logs = WeeklyLog.objects.filter(
        student=request.user
    )

    total_logs = logs.count()

    approved_logs = logs.filter(
        status='approved'
    ).count()

    pending_logs = logs.filter(
        status='submitted'
    ).count()

    rejected_logs = logs.filter(
        status='rejected'
    ).count()

    return Response({
        "total_logs": total_logs,
        "approved_logs": approved_logs,
        "pending_logs": pending_logs,
        "rejected_logs": rejected_logs,
    })