from flask import Blueprint
from controllers.account_controller import delete_account, update_account
from middlewares.jwt_required import jwt_required

account_bp = Blueprint("account", __name__)


@account_bp.route("/account/<int:user_id>", methods=["DELETE"])
@jwt_required
def delete_account_route(user_id):
    return delete_account(user_id)


@account_bp.route("/account/<int:user_id>", methods=["PUT"])
@jwt_required
def update_account_route(user_id):
    return update_account(user_id)
