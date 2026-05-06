import os
import json
from datetime import datetime
from flask import request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename

from infrastructure.db import db
from models.report import Report
from models.analysis_result import AnalysisResult


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "reports_files")


def _ensure_upload_dir():
    path = os.path.abspath(UPLOAD_DIR)
    os.makedirs(path, exist_ok=True)
    return path


def _parse_metadata(metadata_raw):
    try:
        metadata = json.loads(metadata_raw)
    except Exception as exc:
        raise ValueError("Invalid metadata JSON") from exc

    if not isinstance(metadata, dict):
        raise ValueError("Invalid metadata JSON")

    return metadata


def _normalize_analysis_ids(values):
    if not isinstance(values, list):
        raise ValueError("Debe incluir al menos 2 análisis")

    normalized = []
    seen = set()
    for value in values:
        try:
            analysis_id = int(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("Debe incluir al menos 2 análisis") from exc

        if analysis_id in seen:
            continue

        seen.add(analysis_id)
        normalized.append(analysis_id)

    if len(normalized) < 2:
        raise ValueError("Debe incluir al menos 2 análisis")

    return normalized


def _save_report_file(file_storage, user_id):
    upload_dir = _ensure_upload_dir()
    filename = secure_filename(file_storage.filename)
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    stored_name = f"report_{user_id}_{timestamp}_{filename}"
    storage_path = os.path.join(upload_dir, stored_name)
    file_storage.save(storage_path)
    return stored_name, storage_path


def _delete_file_if_exists(path):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


def create_report():
    """
    POST /api/reports
    Expects multipart/form-data with fields:
      - file: PDF file
      - metadata: JSON string with keys: included_analysis_ids (list), title (opt), overall_sentiment, stress_level, anxiety_level, total_posts, topics
    """
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        metadata_raw = request.form.get('metadata')
        if not metadata_raw:
            return jsonify({"error": "Missing metadata field"}), 400

        try:
            metadata = _parse_metadata(metadata_raw)
            included = _normalize_analysis_ids(metadata.get('included_analysis_ids'))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        # validate that analysis ids belong to user
        analyses = AnalysisResult.query.filter(AnalysisResult.id.in_(included), AnalysisResult.user_id == user_id).all()
        if len(analyses) != len(included):
            return jsonify({"error": "Algunos análisis no existen o no pertenecen al usuario"}), 400

        stored_name = None
        storage_path = None

        try:
            # Save file
            stored_name, storage_path = _save_report_file(file, user_id)

            # Create DB record
            report = Report(
                user_id=user_id,
                title=metadata.get('title'),
                overall_sentiment=metadata.get('overall_sentiment'),
                stress_level=metadata.get('stress_level'),
                anxiety_level=metadata.get('anxiety_level'),
                total_posts=metadata.get('total_posts'),
                topics=metadata.get('topics'),
                included_analysis_ids=included,
                filename=stored_name,
                storage_path=storage_path,
            )
            db.session.add(report)
            db.session.commit()
        except Exception:
            db.session.rollback()
            _delete_file_if_exists(storage_path)
            raise

        return jsonify({"message": "Reporte guardado", "report": report.to_dict()}), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def list_reports():
    """GET /api/reports - list user's reports"""
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        reports = Report.query.filter(Report.user_id == user_id).order_by(Report.created_at.desc()).all()
        return jsonify({"count": len(reports), "results": [r.to_dict() for r in reports]}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def download_report(report_id):
    """GET /api/reports/<id>/download - download the PDF file"""
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        report = Report.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return jsonify({"error": "Report not found"}), 404

        if not os.path.exists(report.storage_path):
            return jsonify({"error": "File not found on server"}), 404

        return send_file(report.storage_path, as_attachment=True, download_name=report.filename)

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
