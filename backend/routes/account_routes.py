from flask import Blueprint
from controllers.account_controller import delete_account, update_account

account_bp = Blueprint("account", __name__)


@account_bp.route("/account/<int:user_id>", methods=["DELETE"])
def delete_account_route(user_id):
    return delete_account(user_id)


@account_bp.route("/account/<int:user_id>", methods=["PUT"])
def update_account_route(user_id):
    return update_account(user_id)
