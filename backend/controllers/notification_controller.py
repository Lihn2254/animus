from flask import jsonify, request
from infrastructure.db import db
from models.notification import Notification


def get_notifications():
    user_id = getattr(request, "current_user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        notifications = (
            Notification.query.filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
        return (
            jsonify(
                {
                    "count": len(notifications),
                    "notifications": [n.to_dict() for n in notifications],
                }
            ),
            200,
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def mark_as_read(notification_id):
    user_id = getattr(request, "current_user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        notification = Notification.query.filter_by(
            id=notification_id, user_id=user_id
        ).first()
        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        notification.is_read = not notification.is_read
        db.session.commit()
        return (
            jsonify(
                {
                    "message": "Notification marked as read",
                    "notification": notification.to_dict(),
                }
            ),
            200,
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


def delete_notification(notification_id):
    user_id = getattr(request, "current_user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        notification = Notification.query.filter_by(
            id=notification_id, user_id=user_id
        ).first()
        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        db.session.delete(notification)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500
