import json
from flask import request, jsonify

from infrastructure.db import db
from models.report import Report
from models.analysis_result import AnalysisResult


def _parse_metadata(metadata_raw):
    # Accept either a JSON string or an already-parsed dict
    if not metadata_raw:
        raise ValueError("Missing metadata")

    if isinstance(metadata_raw, str):
        try:
            metadata = json.loads(metadata_raw)
        except Exception as exc:
            raise ValueError("Invalid metadata JSON") from exc
    elif isinstance(metadata_raw, dict):
        metadata = metadata_raw
    else:
        raise ValueError("Invalid metadata format")

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


def create_report():
    """
    POST /api/reports
    Expects JSON body with keys:
      - included_analysis_ids (list)
      - title (opt)
      - overall_sentiment, stress_level, anxiety_level, total_posts, topics (opt)

    IMPORTANT: No PDF file is uploaded. The server stores only metadata. The PDF
    will be generated on-demand by the frontend using the stored included_analysis_ids.
    """
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        # Accept JSON body primarily, but also support form 'metadata'
        metadata_raw = None
        if request.is_json:
            metadata_raw = request.get_json()
        else:
            metadata_raw = request.form.get('metadata')

        try:
            metadata = _parse_metadata(metadata_raw)
            included = _normalize_analysis_ids(metadata.get('included_analysis_ids'))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        # validate that analysis ids belong to user
        analyses = AnalysisResult.query.filter(AnalysisResult.id.in_(included), AnalysisResult.user_id == user_id).all()
        if len(analyses) != len(included):
            return jsonify({"error": "Algunos análisis no existen o no pertenecen al usuario"}), 400

        # Create DB record with metadata only
        report = Report(
            user_id=user_id,
            title=metadata.get('title'),
            overall_sentiment=metadata.get('overall_sentiment'),
            stress_level=metadata.get('stress_level'),
            anxiety_level=metadata.get('anxiety_level'),
            total_posts=metadata.get('total_posts'),
            topics=metadata.get('topics'),
            included_analysis_ids=included,
        )

        db.session.add(report)
        db.session.commit()

        return jsonify({"message": "Reporte guardado", "report": report.to_dict()}), 201

    except Exception as exc:
        db.session.rollback()
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
    """GET /api/reports/<id>/download - return report metadata and included analyses.

    The frontend will build the PDF on-demand using this data.
    """
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        report = Report.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return jsonify({"error": "Report not found"}), 404

        # Fetch included analyses owned by user
        included_ids = report.included_analysis_ids or []
        analyses = AnalysisResult.query.filter(AnalysisResult.id.in_(included_ids), AnalysisResult.user_id == user_id).all()

        return jsonify({
            "report": report.to_dict(),
            "analyses": [a.to_dict() for a in analyses],
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
