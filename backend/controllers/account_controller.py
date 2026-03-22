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


def get_account(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify(user.to_dict()), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def delete_account_by_credentials():
    try:
        data = request.get_json()
        if not data or not data.get("email") or not data.get("password"):
            return (
                jsonify({"error": "Faltan campos requeridos: email, password"}),
                400,
            )

        email = data["email"]
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Credenciales inválidas"}), 401

        username = user.username
        db.session.delete(user)
        db.session.commit()

        return (
            jsonify({"message": f'La cuenta de "{username}" fue eliminada correctamente'}),
            200,
        )

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

        allowed_fields = {"fullname", "username", "email", "password", "country", "region"}
        if not any(field in data for field in allowed_fields):
            return jsonify({"error": "Se debe proporcionar al menos un campo válido: fullname, username, email, password, country, region"}), 400

        if "fullname" in data:
            new_fullname = data["fullname"].strip()
            if not new_fullname:
                return jsonify({"error": "El nombre completo no puede estar vacío"}), 400
            user.fullname = new_fullname

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

        if "country" in data:
            new_country = data["country"].strip()
            if not new_country:
                return jsonify({"error": "El país no puede estar vacío"}), 400
            user.country = new_country

        if "region" in data:
            new_region = data["region"].strip()
            if not new_region:
                return jsonify({"error": "La región no puede estar vacía"}), 400
            user.region = new_region

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
