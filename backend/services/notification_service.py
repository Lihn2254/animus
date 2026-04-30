from infrastructure.db import db
from models.notification import Notification

class NotificationService:
    @staticmethod
    def create_notification(user_id, title, message, notification_type, analysis_id=None, report_id=None):
        """
        Creates a new notification and saves it to the database.
        
        :param user_id: ID of the user receiving the notification
        :param title: Short title of the notification
        :param message: Detailed message
        :param notification_type: Category/type of the notification (e.g., 'analysis_complete')
        :param analysis_id: Optional ID of the related analysis
        :param report_id: Optional ID of the related report
        :return: The created Notification object
        """
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=notification_type,
                analysis_id=analysis_id,
                report_id=report_id
            )
            db.session.add(notification)
            db.session.commit()
            return notification
        except Exception as e:
            db.session.rollback()
            # Depending on logging strategy, we might log this error here
            print(f"Failed to create notification for user {user_id}: {e}")
            raise e
