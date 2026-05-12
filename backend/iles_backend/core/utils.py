from core.models import Notification

#=======================================================================
# Utility function to create a notification for a user
# This function can be called whenever a notification needs to be sent to a user, such as when a new comment is added to their weekly log or when they receive a new message.
#=======================================================
def create_notification(
    recipient,
    weekly_log,
    notification_type,
    message
):

    Notification.objects.create(
        recipient=recipient,
        weekly_log=weekly_log,
        notification_type=notification_type,
        message=message
    )