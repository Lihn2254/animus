from flask import Blueprint
from controllers.analysis_controller import get_analysis_results, run_analysis

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analysis", methods=["GET"])
def get_analysis_results_route():
    return get_analysis_results()


@analysis_bp.route("/analysis/run", methods=["POST"])
def run_analysis_route():
    return run_analysis()
