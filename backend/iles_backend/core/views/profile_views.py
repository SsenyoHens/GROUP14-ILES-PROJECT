from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import (
    CustomUser,
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile,
)
from core.serializers import (
    StudentProfileSerializer,
    AcademicSupervisorProfileSerializer,
    WorkplaceSupervisorProfileSerializer,
    UserSerializer,
)


# =========================
# 👤 GET MY PROFILE
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    user = request.user

    base_data = {
        "id":         user.id,
        "email":      user.email,
        "username":   user.username,
        "first_name": user.first_name,
        "last_name":  user.last_name,
        "role":       user.role,
        "department": user.department,
        "phone":      user.phone,
    }

    if user.role == 'student':
        profile = getattr(user, 'studentprofile', None)
        profile_data = StudentProfileSerializer(profile).data if profile else {}

    elif user.role == 'academic_supervisor':
        profile = getattr(user, 'academicsupervisorprofile', None)
        profile_data = AcademicSupervisorProfileSerializer(profile).data if profile else {}

    elif user.role == 'workplace_supervisor':
        profile = getattr(user, 'workplacesupervisorprofile', None)
        profile_data = WorkplaceSupervisorProfileSerializer(profile).data if profile else {}

    else:
        # Admin has no separate profile
        profile_data = {}

    return Response({**base_data, "profile": profile_data})


# =========================
# ✏️ UPDATE MY PROFILE
# =========================
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_my_profile(request):
    user = request.user

    # Update base user fields
    user_fields = ['first_name', 'last_name', 'phone', 'department']
    for field in user_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()

    # Update role-specific profile
    if user.role == 'student':
        profile = getattr(user, 'studentprofile', None)
        if profile:
            serializer = StudentProfileSerializer(
                profile, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=400)

    elif user.role == 'academic_supervisor':
        profile = getattr(user, 'academicsupervisorprofile', None)
        if profile:
            serializer = AcademicSupervisorProfileSerializer(
                profile, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=400)

    elif user.role == 'workplace_supervisor':
        profile = getattr(user, 'workplacesupervisorprofile', None)
        if profile:
            serializer = WorkplaceSupervisorProfileSerializer(
                profile, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=400)

    return Response({
        "message": "Profile updated successfully",
        "user": UserSerializer(user).data
    })


# =========================
# 🔑 CHANGE PASSWORD
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user         = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response(
            {"error": "Both old_password and new_password are required"},
            status=400
        )

    if not user.check_password(old_password):
        return Response(
            {"error": "Old password is incorrect"},
            status=400
        )

    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters"},
            status=400
        )

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully"})


# =========================
# 👥 VIEW SUPERVISORS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_supervisors(request):
    role = request.query_params.get('role')  # optional filter

    supervisors = CustomUser.objects.filter(
        role__in=['academic_supervisor', 'workplace_supervisor']
    )

    if role in ['academic_supervisor', 'workplace_supervisor']:
        supervisors = supervisors.filter(role=role)

    from core.serializers import SupervisorSerializer
    serializer = SupervisorSerializer(supervisors, many=True)
    return Response(serializer.data)


# =========================
# ✏️ UPDATE STUDENT PROFILE (admin use)
# =========================
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_student_profile(request, pk):
    try:
        profile = StudentProfile.objects.get(pk=pk)
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found"}, status=404)

    # Only admin or the student themselves
    if request.user.role != 'admin' and profile.user != request.user:
        return Response({"error": "Not authorized"}, status=403)

    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)