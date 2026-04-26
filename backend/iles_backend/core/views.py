from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .models import InternshipPlacement, WeeklyLog
from .serializers import (
    PlacementSerializer,
    WeeklyLogSerializer,
    RegisterSerializer,
    LoginSerializer,
    StudentProfileSerializer
)
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from .permissions import (
    IsStudent,
    IsAcademicSupervisor,
    IsSupervisor,
    IsAdmin
)

#@admin.register(CustomUser)
#class CustomUserAmin(admin.ModelAdmin):
    #list_display = ('email', 'role', 'is_staff')

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_placement(request):
    serializer = PlacementSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user, user=request.user)
        return Response(serializer.data)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        serializer.save(student=request.user, user=request.user)
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# 📘 WEEKLY LOGS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_log(request):
    serializer = WeeklyLogSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(
            student=request.user,
            user=request.user   # 🔥 VERY IMPORTANT (for model.clean)
        )
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):
    logs = WeeklyLog.objects.all()
    serializer = WeeklyLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    serializer = WeeklyLogSerializer(log, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(student=request.user, user=request.user)    
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    log.delete()
    return Response({"message": "Deleted successfully"})


# =========================
# 👤 CURRENT USER
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    })