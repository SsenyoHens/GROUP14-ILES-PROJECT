from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'student'


class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'academic_supervisor'


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in [
            'academic_supervisor',
            'workplace_supervisor'
        ]


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'