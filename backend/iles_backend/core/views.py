from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import InternshipPlacement, WeeklyLog
from .serializers import PlacementSerializer
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

    return Response(serializer.errors, status=400) 


@api_view(['PUT', 'PATCH']) 
@permission_classes([IsAuthenticated]) 
def update_weekly_log(request, pk):

    try:
        log = WeeklyLog.objects.get(pk=pk, student=request.user) 
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=400)  