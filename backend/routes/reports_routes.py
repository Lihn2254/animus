from flask import Blueprint
from controllers.reports_controller import create_report, list_reports, download_report
from middlewares.jwt_required import jwt_required

reports_bp = Blueprint('reports_bp', __name__, url_prefix='/api/reports')

reports_bp.add_url_rule('', 'list_reports', jwt_required(list_reports), methods=['GET'])
reports_bp.add_url_rule('', 'create_report', jwt_required(create_report), methods=['POST'])
reports_bp.add_url_rule('/<int:report_id>/download', 'download_report', jwt_required(download_report), methods=['GET'])
