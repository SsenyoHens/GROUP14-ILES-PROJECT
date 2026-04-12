from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .permissions import IsSupervisor


@api_view(['GET'])
@permission_classes([IsSupervisor])
def supervisor_dashboard(request):
    return Response({"message": "Supervisor only"})

#student weekly log endpoint
from .permissions import IsStudent


@api_view(['POST'])
@permission_classes([IsStudent])
def create_weekly_log(request):
    return Response({"message": "Student can create log"})
    
#Academic Supervisor Review Endpoint    
from .permissions import IsAcademicSupervisor


@api_view(['GET'])
@permission_classes([IsAcademicSupervisor])
def review_weekly_logs(request):
    return Response({"message": "Academic supervisor reviewing logs"})
    
#Admin Only Endpoint
from .permissions import IsAdmin


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_user(request):
    return Response({"message": "Admin deleted user"})    