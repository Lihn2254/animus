from flask import jsonify
from infrastructure.db import db
from models.user import User


def delete_account(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        username = user.username
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": f'La cuenta del usuario "{username}" fue eliminada correctamente'}), 200

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500
