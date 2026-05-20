from core.views.auth_views       import register_view, login_view
from core.views.user_views       import get_current_user, user_list, user_detail, reset_password
from core.views.profile_views    import (
    get_my_profile, update_my_profile, change_password,
    view_supervisors, update_student_profile,
)
from core.views.student_views    import student_list, student_detail
from core.views.placement_views  import (
    view_placements, placement_detail, create_placement,
    update_placement, update_placement_status,
)
from core.views.weeklylog_views  import (
    view_logs, create_log, update_log, delete_log,
    weekly_log_summary, weekly_log_stats, submit_log
)
from core.views.evaluation_views import (
    evaluation_list, evaluation_detail, create_evaluation,
    update_evaluation, submit_evaluation, evaluation_summary,
)
from core.views.dashboard_views  import (
    dashboard_stats, recent_activity, upcoming_deadlines,
)
from core.views.report_views     import (
    report_summary, placement_trend, report_by_dept, status_breakdown,
)
from core.views.supervisor_views import (
    view_supervisors as manage_supervisors,
    create_supervisor, update_supervisor, delete_supervisor,
)
from core.views.notification_views import (
    get_notifications, get_unread_count,
)