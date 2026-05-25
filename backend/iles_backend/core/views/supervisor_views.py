# core/views/supervisor_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import CustomUser, AcademicSupervisorProfile, WorkplaceSupervisorProfile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_supervisors(request):
    """Returns all supervisors with their profile pk as id for dropdowns."""
    supervisors = CustomUser.objects.filter(
        role__in=['academic_supervisor', 'workplace_supervisor']
    ).select_related('academicsupervisorprofile', 'workplacesupervisorprofile')

    data = []
    for s in supervisors:
        # ✅ Use the PROFILE pk as id so placement creation works
        if s.role == 'academic_supervisor':
            profile = getattr(s, 'academicsupervisorprofile', None)
            profile_pk = profile.pk if profile else s.pk
        else:
            profile = getattr(s, 'workplacesupervisorprofile', None)
            profile_pk = profile.pk if profile else s.pk

        data.append({
            "id":         profile_pk,   # ✅ profile pk for placement FK
            "user_id":    s.id,
            "first_name": s.first_name,
            "last_name":  s.last_name,
            "email":      s.email,
            "role":       s.role,
            "department": s.department,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_supervisor(request):
    if request.user.role != 'admin':
        return Response({"error": "Not authorized"}, status=403)

    from core.serializers import UserSerializer
    data = request.data.copy()
    data['role'] = data.get('role', 'academic_supervisor')

    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(data.get('password', 'changeme123'))
        user.save()
        return Response(UserSerializer(user).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_supervisor(request, pk):
    if request.user.role != 'admin':
        return Response({"error": "Not authorized"}, status=403)
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    for field in ['first_name', 'last_name', 'email', 'department', 'phone']:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    return Response({"message": "Updated"})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_supervisor(request, pk):
    if request.user.role != 'admin':
        return Response({"error": "Not authorized"}, status=403)
    try:
        user = CustomUser.objects.get(pk=pk)
        user.delete()
        return Response({"message": "Deleted"}, status=204)
    except CustomUser.DoesNotExist:
        return Response({"error": "Not found"}, status=404)