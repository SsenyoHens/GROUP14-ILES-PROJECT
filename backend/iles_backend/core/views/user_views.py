from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import CustomUser
from core.serializers import UserSerializer
from core.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        "id":       user.id,
        "username": user.username,
        "email":    user.email,
        "role":     user.role,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def user_list(request):
    role  = request.query_params.get('role')
    users = CustomUser.objects.all()

    if role:
        users = users.filter(role=role)

    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def user_detail(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        user.delete()
        return Response({"message": "User deleted"}, status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reset_password(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    new_password = request.data.get('password')
    if not new_password:
        return Response({"error": "Password is required"}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password reset successfully"})