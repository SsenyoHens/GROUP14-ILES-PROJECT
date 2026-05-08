from django.db.models import Count, Avg, Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import InternshipPlacement, WeeklyLog, Evaluation, CustomUser

from .models import (
    InternshipPlacement,
    WeeklyLog,
    Evaluation,
    CustomUser,
    AcademicSupervisorProfile,
    WorkplaceSupervisorProfile
)

from .serializers import (
    PlacementSerializer,
    WeeklyLogSerializer,
    RegisterSerializer,
    LoginSerializer,
    StudentProfileSerializer,
    WeeklyLogStatsSerializer,
    SupervisorSerializer
)

from .permissions import (
    IsStudent,
    IsAcademicSupervisor,
    IsSupervisor,
    IsAdmin
)

User = get_user_model()

# =========================
# 🔐 AUTH
# =========================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role
            })

        return Response({"error": "Invalid credentials"}, status=400)

    return Response(serializer.errors, status=400)


# =========================
# 🏢 INTERNSHIP PLACEMENTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def create_placement(request):
    serializer = PlacementSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user, user=request.user)
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSupervisor])
def view_placements(request):
    placements = InternshipPlacement.objects.all()
    serializer = PlacementSerializer(placements, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsSupervisor])
def update_placement(request, pk):
    try:
        placement = InternshipPlacement.objects.get(id=pk)
    except InternshipPlacement.DoesNotExist:
        return Response({"error": "Placement not found"}, status=404)

    serializer = PlacementSerializer(placement, data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user, user=request.user)
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# 📘 WEEKLY LOGS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_log(request):

    serializer = WeeklyLogSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save(student=request.user)

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )
    
#temporarily
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_log(request, pk):

    return Response({
        'message': 'Update log endpoint working'
    })
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_logs(request):

    logs = WeeklyLog.objects.filter(student=request.user)

    serializer = WeeklyLogSerializer(logs, many=True)

    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_log(request, pk):
    try:
        log = WeeklyLog.objects.get(pk=pk)
    except WeeklyLog.DoesNotExist:
        return Response({"error": "Log not found"}, status=404)

    log.delete()
    return Response({"message": "Deleted successfully"})


# =========================
# 📊 AGGREGATION / SUMMARY
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_log_summary(request):
    summary = WeeklyLog.objects.values(
        'student__first_name',
        'student__last_name'
    ).annotate(
        total_logs=Count('id'),
        draft_logs=Count('id', filter=Q(status='draft')),
        submitted_logs=Count('id', filter=Q(status='submitted')),
        approved_logs=Count('id', filter=Q(status='approved')),
        rejected_logs=Count('id', filter=Q(status='rejected')),
    )

    return Response(summary)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def evaluation_summary(request):
    stats = Evaluation.objects.aggregate(
        total_evaluations=Count("id")
    )

    return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def weekly_log_stats(request):
    stats = WeeklyLog.objects.aggregate(
        total_logs=Count("id")
    )

    submitted_logs = WeeklyLog.objects.filter(status="submitted").count()
    pending_logs = WeeklyLog.objects.filter(status="pending").count()

    return Response({
        "total_logs": stats["total_logs"],
        "submitted_logs": submitted_logs,
        "pending_logs": pending_logs,
    })


# =========================
# 👤 CURRENT USER
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    })

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

        # remove placement references first
        InternshipPlacement.objects.filter(
            academic_supervisor__user=supervisor
        ).update(academic_supervisor=None)

        InternshipPlacement.objects.filter(
            workplace_supervisor__user=supervisor
        ).update(workplace_supervisor=None)

        # delete profiles
        AcademicSupervisorProfile.objects.filter(
            user=supervisor
        ).delete()

        WorkplaceSupervisorProfile.objects.filter(
            user=supervisor
        ).delete()

        # delete user
        supervisor.delete()

        return Response(
            {"message": "Supervisor deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    except CustomUser.DoesNotExist:

        return Response(
            {"message": "Supervisor deleted successfully"},
            status=status.HTTP_200_OK
        )
        
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_supervisor(request, pk):

    try:
        supervisor = CustomUser.objects.get(pk=pk)

    except CustomUser.DoesNotExist:

        return Response(
            {"error": "Supervisor not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = SupervisorSerializer(
        supervisor,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )        