from flask import Blueprint
from controllers.analysis_controller import get_analysis_results, run_analysis, get_analysis_by_id
from middlewares.jwt_required import jwt_required

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analysis", methods=["GET"])
@jwt_required
def get_analysis_results_route():
    return get_analysis_results()


@analysis_bp.route("/analysis/<int:analysis_id>", methods=["GET"])
@jwt_required
def get_analysis_by_id_route(analysis_id):
    return get_analysis_by_id(analysis_id)


@analysis_bp.route("/analysis/run", methods=["POST"])
@jwt_required
def run_analysis_route():
    return run_analysis()
