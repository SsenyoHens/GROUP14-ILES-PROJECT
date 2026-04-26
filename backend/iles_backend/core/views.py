from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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

User = get_user_model()
logger = logging.getLogger(__name__)


# =========================
# 🔐 AUTHENTICATION VIEWS
# =========================

@api_view(['POST'])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = authenticate(username=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        logger.info(f"User {email} logged in successfully")

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "role": user.role
        })

    logger.warning(f"Failed login attempt for {email}")
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.role,
        'created_at': request.user.created_at
    })


# =========================
# 👤 STUDENT PROFILE
# =========================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def update_student_profile(request):
    profile = request.user.studentprofile

    if request.method == 'GET':
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = StudentProfileSerializer(profile, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# 🏢 INTERNSHIP PLACEMENTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_placement(request):
    serializer = PlacementSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def view_placements(request):
    placements = InternshipPlacement.objects.all()
    serializer = PlacementSerializer(placements, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_placement(request, pk):
    try:
        placement = InternshipPlacement.objects.get(id=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    serializer = PlacementSerializer(placement, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# 📘 WEEKLY LOGS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):
    serializer = WeeklyLogSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user.studentprofile)
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):
    logs = WeeklyLog.objects.filter(student=request.user.studentprofile)
    serializer = WeeklyLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk, student=request.user.studentprofile)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    serializer = WeeklyLogSerializer(log, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk, student=request.user.studentprofile)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    log.delete()
    return Response({"message": "Deleted successfully"})