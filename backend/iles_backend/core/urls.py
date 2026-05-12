from django.urls import path
from core.views.notification_views import (
    my_notifications,
    mark_notification_as_read,
)
from core.views import (
    # Auth
    register_view, login_view, get_current_user,
    # Users
    user_list, user_detail, reset_password,
    # Students
    student_list, student_detail,
    # Placements
    view_placements, placement_detail, create_placement,
    update_placement, update_placement_status,
    # Weekly Logs
    view_logs, create_log, update_log, delete_log,
    weekly_log_summary, weekly_log_stats,
    # Evaluations
    evaluation_list, evaluation_detail, create_evaluation,
    update_evaluation, submit_evaluation, evaluation_summary,
    # Dashboard
    dashboard_stats, recent_activity, upcoming_deadlines,
    # Reports
    report_summary, placement_trend, report_by_dept, status_breakdown,
    # Supervisors
    view_supervisors, create_supervisor, update_supervisor, delete_supervisor,
)

urlpatterns = [

    #  AUTH
    path('auth/login/',    login_view,       name='login'),
    path('auth/register/', register_view,    name='register'),
    path('auth/me/',       get_current_user, name='get_current_user'),

    # USERS
    path('users/',                         user_list,      name='user-list'),
    path('users/<int:pk>/',                user_detail,    name='user-detail'),
    path('users/<int:pk>/reset-password/', reset_password, name='reset-password'),

    #  STUDENTS
    path('students/',          student_list,   name='student-list'),
    path('students/<int:pk>/', student_detail, name='student-detail'),

    #  PLACEMENTS   static paths before dynamic
    path('placements/',                    view_placements,         name='view-placements'),
    path('placements/create/',             create_placement,        name='create-placement'),
    path('placements/<int:pk>/',           placement_detail,        name='placement-detail'),
    path('placements/<int:pk>/update/',    update_placement,        name='update-placement'),
    path('placements/<int:pk>/status/',    update_placement_status, name='placement-status'),

    #  WEEKLY LOGS   static paths before dynamic
    path('logs/',                    view_logs,          name='view-logs'),
    path('logs/create/',             create_log,         name='create-log'),
    path('logs/summary/',            weekly_log_summary, name='log-summary'),
    path('logs/<int:pk>/update/',    update_log,         name='update-log'),
    path('logs/<int:pk>/delete/',    delete_log,         name='delete-log'),
    path('weeklylog/stats/',         weekly_log_stats,   name='log-stats'),

    #  EVALUATIONS   static paths before dynamic
    path('evaluations/',                   evaluation_list,    name='evaluation-list'),
    path('evaluations/create/',            create_evaluation,  name='create-evaluation'),
    path('evaluations/summary/',           evaluation_summary, name='evaluation-summary'),
    path('evaluations/<int:pk>/',          evaluation_detail,  name='evaluation-detail'),
    path('evaluations/<int:pk>/update/',   update_evaluation,  name='update-evaluation'),
    path('evaluations/<int:pk>/submit/',   submit_evaluation,  name='submit-evaluation'),

    #  DASHBOARD
    path('dashboard/stats/',           dashboard_stats,    name='dashboard-stats'),
    path('dashboard/recent-activity/', recent_activity,    name='recent-activity'),
    path('dashboard/deadlines/',       upcoming_deadlines, name='deadlines'),

    # REPORTS
    path('reports/summary/',          report_summary,  name='report-summary'),
    path('reports/placement-trend/',  placement_trend, name='placement-trend'),
    path('reports/by-department/',    report_by_dept,  name='report-by-dept'),
    path('reports/status-breakdown/', status_breakdown, name='status-breakdown'),

    #  SUPERVISORS   static paths before dynamic
    path('supervisors/',                    view_supervisors,  name='view-supervisors'),
    path('supervisors/create/',             create_supervisor, name='create-supervisor'),
    path('supervisors/<int:pk>/update/',    update_supervisor, name='update-supervisor'),
    path('supervisors/<int:pk>/delete/',    delete_supervisor, name='delete-supervisor'),

    #  NOTIFICATIONS
    path('notifications/',                   my_notifications,          name='my-notifications'),
    path('notifications/<int:pk>/read/',    mark_notification_as_read, name='mark-notification-as-read'),
]
