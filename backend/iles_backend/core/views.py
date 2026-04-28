from django.db.models import Count, Avg, Sum, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import WeeklyLog, Evaluation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WeeklyLogStatsSerializer
from rest_framework import status

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging

from .models import InternshipPlacement, WeeklyLog
from .serializers import (
    PlacementSerializer,
    WeeklyLogSerializer,
    RegisterSerializer,
    LoginSerializer,
    StudentProfileSerializer
)

# ✅ Import custom permissions
from .permissions import (
    IsStudent,
    IsAcademicSupervisor,
    IsSupervisor,
    IsAdmin
)

User = get_user_model()
logger = logging.getLogger(__name__)


# =========================
# 🔐 AUTH
# =========================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = authenticate(username=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "role": user.role
        })

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# =========================
# 👤 PROFILE
# =========================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsStudent])
def update_student_profile(request):
    profile = request.user.studentprofile

    if request.method == 'GET':
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    serializer = StudentProfileSerializer(profile, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# =========================
# 🏢 PLACEMENTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_placement(request):
    serializer = PlacementSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSupervisor])
def view_placements(request):
    placements = InternshipPlacement.objects.all()
    serializer = PlacementSerializer(placements, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsSupervisor])
def update_placement(request, pk):
    try:
        placement = InternshipPlacement.objects.get(id=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    serializer = PlacementSerializer(placement, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


# =========================
# 📘 WEEKLY LOGS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_log(request):
    serializer = WeeklyLogSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user.studentprofile)
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAcademicSupervisor])
def view_logs(request):
    logs = WeeklyLog.objects.all()
    serializer = WeeklyLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsStudent])
def update_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk, student=request.user.studentprofile)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    serializer = WeeklyLogSerializer(log, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    log.delete()
    return Response({"message": "Deleted successfully"})
@api_view(['GET'])
def weekly_log_summary(request):
    summary = WeeklyLog.objects.values(
        'student__first_name',
        'student__last_name'
    ).annotate(
        total_logs=Count('id'),
        draft_logs=Count('id', filter=Q(status='draft')),
        submitted_logs=Count('id', filter=Q(status='submitted')),
        approved_logs=Count('id', filter=Q(status='approved')),
        rejected_logs=Count('id', filter=Q(status='rejected')),
    )

    return Response(summary)


@api_view(['GET'])
def evaluation_summary(request):
    summary = Evaluation.objects.values(
        'student__first_name',
        'student__last_name'
    ).annotate(
        total_evaluations=Count('id')
    )

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_stats(request):
    stats = WeeklyLog.objects.aggregate(
        total_logs=Count('id'),
        approved_logs=Count('id', filter=Q(status='approved')),
        pending_logs=Count('id', filter=Q(status='pending')),
        rejected_logs=Count('id', filter=Q(status='rejected')),
    )

    serializer = WeeklyLogStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
    })
