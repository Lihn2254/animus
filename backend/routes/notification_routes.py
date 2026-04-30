from flask import Blueprint, request
from middlewares.jwt_required import jwt_required
from controllers.notification_controller import get_notifications, mark_as_read, delete_notification

notification_bp = Blueprint("notification", __name__)

@notification_bp.route("/notifications", methods=["GET"])
@jwt_required
def get_notifications_route():
    return get_notifications(request.current_user_id)

@notification_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required
def mark_as_read_route(notification_id):
    return mark_as_read(request.current_user_id, notification_id)

@notification_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
@jwt_required
def delete_notification_route(notification_id):
    return delete_notification(request.current_user_id, notification_id)
