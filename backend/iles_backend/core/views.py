from django.shortcuts import render

# Create your views here.

#api view for registration. 
from core.models import CustomUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

#API register_view
@api_view(['POST'])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors, status=400)

#API login_view
@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        print(serializer.errors)
        return Response(serializer.errors, status=400)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    
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
    return Response({'error': 'Invalid credentials'}, status=401)
    

#Get Current User API view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.role,
        "created_at": request.user.created_at
    })


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
import logging

logger = logging.getLogger(__name__)


