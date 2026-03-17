from datetime import datetime, timedelta, timezone
from flask import request, jsonify, current_app
from infrastructure.db import db
from models.user import User
import jwt


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
                    {
                        "error": "Faltan campos requeridos: fullname, username, email, password, country, region"
                    }
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

        new_user = User(
            fullname=fullname,
            username=username,
            email=email,
            country=country,
            region=region,
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        token = jwt.encode(
            {
                "sub": new_user.id,
                "username": new_user.username,
                "exp": datetime.now(timezone.utc) + timedelta(hours=24)
            }, 
            current_app.config["SECRET_KEY"], 
            algorithm="HS256")

        return (
            jsonify(
                {
                    "message": "Cuenta creada exitosamente", 
                    "user": new_user.to_dict(),
                    "token": token
                }
            ),
            201,
        )

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


def login():
    try:
        data = request.get_json()

        if not data or not data.get("username") or not data.get("password"):
            return (
                jsonify({"error": "Faltan campos requeridos: username, password"}),
                400,
            )

        username = data["username"]
        password = data["password"]

        user = User.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Campos inválidos: username o password"}), 401

        token = jwt.encode(
            {
                "sub": user.id,
                "username": user.username,
                "exp": datetime.now(timezone.utc) + timedelta(hours=24),
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return (
            jsonify(
                {
                    "message": "Inicio de sesión exitoso",
                    "user": user.to_dict(),
                    "token": token,
                }
            ),
            200,
        )

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
