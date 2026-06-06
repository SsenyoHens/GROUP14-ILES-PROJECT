from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken

from core.serializers import RegisterSerializer, LoginSerializer

from core.models import (
    CustomUser,
    StudentProfile,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):

    data = request.data

    
    email = data.get('email').lower()
    username = email.lower()
    password = data.get('password')
    role = data.get('role')

    # REQUIRED FIELDS
    if not username or not email or not password or not role:
        return Response(
            {"error": "All required fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # CHECK EXISTING USER
    if CustomUser.objects.filter(username=username).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if CustomUser.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # CREATE USER
    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )

    # =========================
    # STUDENT PROFILE
    # =========================
    if role == 'student':

        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'registration_number': data.get('registration_number'),
                'course': data.get('course'),
                'year_of_study': data.get('year_of_study')
        }
    )

    # =========================
    # ACADEMIC SUPERVISOR PROFILE
    # =========================
    elif role == 'academic_supervisor':

        AcademicSupervisorProfile.objects.get_or_create(
            user=user,
            defaults={
                'department': data.get('department'),
                'office_number': data.get('office_number')
            }
        )

    # =========================
    # WORKPLACE SUPERVISOR PROFILE
    # =========================
    elif role == 'workplace_supervisor':

        WorkplaceSupervisorProfile.objects.get_or_create(
            user=user,
            defaults={
                'company_name': data.get('company_name'),
                'position': data.get('position')
            }
        )

    return Response(
        {
            "message": "User registered successfully"
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    email = serializer.validated_data['email'].lower()
    password = serializer.validated_data['password']

    #debug print(f"Attempting login for email: {email}")
    print("EMAIL RECEIVED:", email)
    print("PASSWORD RECEIVED:", password)

    user_check = CustomUser.objects.filter(username=email).first()

    print("USER FOUND:", user_check)

    user = authenticate(
        request,
        username=email,
        password=password
    )
    
    print("AUTHENTICATED USER:", user)
    
    if user is None:
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"error": "Account is disabled"},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)

    return Response({

        "message": "Login successful",

        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },

        "tokens": {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):

    try:

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )

    except Exception:

        return Response(
            {"error": "Invalid or expired token"},
            status=status.HTTP_400_BAD_REQUEST
        )