from django.urls import path


from core.views.user_views import get_current_user
from core.views.login_views import login_view
from core.views.register_views import register_view
from core.views.profile_views import (
    update_student_profile,
    view_supervisors,
)
from core.views.weeklylog_views import weekly_log_stats
from core.views.placement_views import (view_placements, create_placement, update_placement)
from core.views.weeklylog_views import (view_logs, create_log, update_log, delete_log, weekly_log_summary, weekly_log_stats)
from core.views.evaluation_views import evaluation_summary

'''from .views import (
    # 🔐 Auth
    login_view,
    register_view,
    get_current_user,
    #update_student_profile,

    # 🏢 Placement
    create_placement,
    view_placements,
    update_placement,
    view_supervisors,
    create_supervisor,
    delete_supervisor,
    update_supervisor,

    # 📘 Weekly Logs
    create_log,
    view_logs,
    #get_logs,
    update_log,
    delete_log,
    weekly_log_summary,
    weekly_log_stats,

    # 📊 Evaluations
    evaluation_summary,
)'''

urlpatterns = [
    # 🔐 AUTH
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('user/', get_current_user, name='get_current_user'),
    #path('student-profile/', update_student_profile, name='update_student_profile'),
    path('supervisors/', view_supervisors, name='view_supervisors'),
    # 📊 WEEKLY LOG AGGREGATION / STATS
    path("weeklylog/stats/", weekly_log_stats, name="weeklylog-stats"),
   
    # SUPERVISORS
    path('supervisors/', view_supervisors, name='view_supervisors'),
    #path('supervisors/create/', create_supervisor, name='create_supervisor'),
    #path('supervisors/delete/<int:pk>/', delete_supervisor, name='delete_supervisor'),
    #path('supervisors/update/<int:pk>/', update_supervisor, name='update_supervisor'),
   
    # 🏢 INTERNSHIP PLACEMENTS
    path('placements/', view_placements, name='view_placements'),
    path('placements/create/', create_placement, name='create_placement'),
    path('placements/update/<int:pk>/', update_placement, name='update_placement'),

    # 📘 WEEKLY LOGS
    path('logs/', view_logs, name='view_logs'),
    path('logs/create/', create_log, name='create_log'),
    path('logs/update/<int:pk>/', update_log, name='update_log'),
    path('logs/delete/<int:pk>/', delete_log, name='delete_log'),

    # 📈 SUMMARIES
    path('logs/summary/', weekly_log_summary, name='weekly-log-summary'),
    path("evaluations/summary/", evaluation_summary, name="evaluation-summary"),
]