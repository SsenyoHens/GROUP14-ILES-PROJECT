from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from core.models import CustomUser, InternshipPlacement, AcademicSupervisorProfile, WorkplaceSupervisorProfile
from core.serializers import SupervisorSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def view_supervisors(request):
    supervisors = CustomUser.objects.filter(
        role__in=['academic_supervisor', 'workplace_supervisor']
    )
    serializer = SupervisorSerializer(supervisors, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_supervisor(request):
    serializer = SupervisorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_supervisor(request, pk):
    try:
        supervisor = CustomUser.objects.get(pk=pk)
        InternshipPlacement.objects.filter(academic_supervisor__user=supervisor).update(academic_supervisor=None)
        InternshipPlacement.objects.filter(workplace_supervisor__user=supervisor).update(workplace_supervisor=None)
        AcademicSupervisorProfile.objects.filter(user=supervisor).delete()
        WorkplaceSupervisorProfile.objects.filter(user=supervisor).delete()
        supervisor.delete()
        return Response({"message": "Deleted successfully"}, status=204)
    except CustomUser.DoesNotExist:
        return Response({"error": "Supervisor not found"}, status=404)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_supervisor(request, pk):
    try:
        supervisor = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({"error": "Supervisor not found"}, status=404)
    serializer = SupervisorSerializer(supervisor, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)