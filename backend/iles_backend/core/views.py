from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import InternshipPlacement, WeeklyLog
from .serializers import PlacementSerializer, WeeklyLogSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
def create_placement(request):
    serializer = PlacementSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors)


@api_view(['GET'])
def view_placements(request):
    placements = InternshipPlacement.objects.all()
    serializer = PlacementSerializer(placements, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):
    serializer = WeeklyLogSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors)


@api_view(['GET'])
def view_logs(request):
    logs = WeeklyLog.objects.all()
    serializer = WeeklyLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk, student=request.user)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)
    
    serializer = WeeklyLogSerializer(log, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save(student=request.user)
        return Response(serializer.data)
    
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    log.delete()
    return Response({"message": "Deleted successfully"})  

from django.contrib.auth import get_user_model

User = get_user_model()

#ADDED so i can use email for login while keeping the USERNAME
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

from django.contrib.auth import get_user_model
User = get_user_model()

@api_view(['POST'])
def register_user(request):
    data = request.data

    if User.objects.filter(email=data.get('email')).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=data.get('username'),
        email=data.get('email'),
        password=data.get('password'),
        role=data.get('role', 'student')
    )

    return Response({"message": "User created successfully"})
    
from django.contrib.auth import authenticate

@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=401)

    user = authenticate(request, username=user_obj.username, password=password)

    if user:
        return Response({
            "message": "Login successful",
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        })

    return Response({"error": "Invalid credentials"}, status=401)    