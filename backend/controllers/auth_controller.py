from flask import request, jsonify
from infrastructure.db import db
from models.user import User


def register():
    try:
        data = request.get_json()

        if not data or not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Faltan campos requeridos: username, email, password"}), 400

        username = data["username"]
        email = data["email"]
        password = data["password"]

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Nombre de usuario ya existe"}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email ya existe"}), 409

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Cuenta creada exitosamente", "user": new_user.to_dict()}), 201

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


def login():
    try:
        data = request.get_json()

        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Faltan campos requeridos: username, password"}), 400

        username = data["username"]
        password = data["password"]

        user = User.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Campos inválidos: username o password"}), 401

        return jsonify({"message": "Inicio de sesión exitoso", "user": user.to_dict()}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
