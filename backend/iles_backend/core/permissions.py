from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class IsAdmin(BasePermission):
    """Internship Administrator"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'workplace_supervisor'

class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'academic_supervisor'

class IsSupervisor(BasePermission):
    """Either workplace or academic supervisor"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'workplace_supervisor', 'academic_supervisor'
        ]

class IsAdminOrSupervisor(BasePermission):
    """Admin or any supervisor"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            'admin', 'workplace_supervisor', 'academic_supervisor'
        ]