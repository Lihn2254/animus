from flask import request, jsonify
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


def update_account(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

        allowed_fields = {"username", "email", "password"}
        if not any(field in data for field in allowed_fields):
            return jsonify({"error": "Se debe proporcionar al menos un campo válido: username, email, password"}), 400

        if "username" in data:
            new_username = data["username"].strip()
            if not new_username:
                return jsonify({"error": "El nombre de usuario no puede estar vacío"}), 400
            existing = User.query.filter_by(username=new_username).first()
            if existing and existing.id != user_id:
                return jsonify({"error": "El nombre de usuario ya está en uso"}), 409
            user.username = new_username

        if "email" in data:
            new_email = data["email"].strip()
            if not new_email:
                return jsonify({"error": "El email no puede estar vacío"}), 400
            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != user_id:
                return jsonify({"error": "El email ya está en uso"}), 409
            user.email = new_email

        if "password" in data:
            new_password = data["password"]
            if not new_password or len(new_password) < 6:
                return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
            user.set_password(new_password)

        db.session.commit()
        return jsonify({"message": "Cuenta actualizada correctamente", "user": user.to_dict()}), 200

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500
