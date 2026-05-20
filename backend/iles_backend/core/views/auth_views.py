from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from core.serializers import RegisterSerializer, LoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Registration successful",
            "user": {
                "id":         user.id,
                "email":      user.email,
                "username":   user.username,
                "first_name": user.first_name,
                "last_name":  user.last_name,
                "role":       user.role,
            },
            "tokens": {
                "refresh": str(refresh),
                "access":  str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email    = serializer.validated_data['email']
    password = serializer.validated_data['password']
    user     = authenticate(request, email=email, password=password)

    if user is None:
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"error": "Account is disabled. Contact administrator."},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Login successful",
        "user": {
            "id":         user.id,
            "email":      user.email,
            "username":   user.username,
            "first_name": user.first_name,
            "last_name":  user.last_name,
            "role":       user.role,
            "department": user.department,
            "phone":      user.phone,
        },
        "tokens": {
            "refresh": str(refresh),
            "access":  str(refresh.access_token),
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