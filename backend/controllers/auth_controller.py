from flask import request, jsonify
from infrastructure.db import db
from models.user import User


def register():
    try:
        data = request.get_json()

        if (
            not data
            or not data.get("fullname")
            or not data.get("username")
            or not data.get("email")
            or not data.get("password")
            or not data.get("country")
            or not data.get("region")
        ):
            return (
                jsonify(
                    {"error": "Faltan campos requeridos: fullname, username, email, password, country, region"}
                ),
                400,
            )

        fullname = data["fullname"]
        username = data["username"]
        email = data["email"]
        password = data["password"]
        country = data["country"]
        region = data["region"]

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Nombre de usuario ya existe"}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email ya existe"}), 409

        new_user = User(fullname=fullname, username=username, email=email, country=country, region=region)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {"message": "Cuenta creada exitosamente", "user": new_user.to_dict()}
            ),
            201,
        )

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


def login():
    try:
        data = request.get_json()

        if not data or (not data.get("username") and not data.get("email")) or not data.get("password"):
            return (
                jsonify({"error": "Faltan campos requeridos: username/email, password"}),
                400,
            )

        credential = data.get("username") or data.get("email")
        password = data["password"]

        # Aceptar login por username o por email
        user = User.query.filter((User.username == credential) | (User.email == credential)).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Campos inválidos: usuario/email o password"}), 401

        return (
            jsonify({"message": "Inicio de sesión exitoso", "user": user.to_dict()}),
            200,
        )

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
