# Insights routes — Business-facing analytics and pipeline transparency.
# GET /insights/metrics — returns engagement metrics and audience data.
# GET /insights/pipeline — returns the insight generation pipeline status.
from flask import Blueprint, jsonify

insights_bp = Blueprint("insights", __name__)

DUMMY_METRICS = {
    "ctr": {"value": 4.8, "unit": "%", "change": 12, "direction": "up", "label": "CTR"},
    "productionClicks": {"value": 2483, "unit": "", "change": 18, "direction": "up", "label": "Production Clicks"},
    "engagementRate": {"value": 63, "unit": "%", "change": 7, "direction": "up", "label": "Engagement Rate"},
    "productionImpressions": {"value": 52840, "unit": "", "change": 16, "direction": "up", "label": "Production Impressions"},
    "audienceBreakdown": {
        "Organic Search": 38,
        "Marketplace Search": 27,
        "Direct Traffic": 21,
        "Other Platforms": 14,
    },
    "platformEngagement": {
        "Instagram": 38,
        "TikTok": 27,
        "Google Search": 21,
        "Twitter/X": 9,
        "Other": 5,
    },
    "keywordEngagement": [
        {"keyword": "sustainable running shoes", "ctr": 18},
        {"keyword": "recycled sneakers", "ctr": 14},
        {"keyword": "eco-friendly footwear", "ctr": 21},
        {"keyword": "running shoes under 150", "ctr": 11},
    ],
}

DUMMY_PIPELINE = {
    "dataRefreshCycle": {
        "label": "Data Refresh Cycle",
        "type": "Weekly Market Scan",
        "lastScan": "2026-03-10",
        "nextScan": "2026-03-17",
        "bullets": [
            "Scrapes AI responses from GPT, Claude, and Gemini",
            "Aggregates engagement data from platform integrations",
            "Updates credit score and visibility metrics",
        ],
    },
    "visibilityPipeline": {
        "label": "Visibility Pipeline",
        "signalsAnalyzed": [
            "Search keyword ranking",
            "Product listing optimization",
            "Competitor product positioning",
            "Marketplace discovery signals",
            "Engagement indicators",
        ],
    },
    "pipelineSteps": [
        {"name": "Data Collection", "description": "Raw data gathered from AI platforms, search engines, and user interactions across all tracked products."},
        {"name": "Data Aggregation", "description": "Normalize and combine data from multiple sources into unified product profiles with engagement metrics."},
        {"name": "Visibility Scoring", "description": "Calculate per-platform visibility scores based on mention rate, position, accuracy, and sentiment."},
        {"name": "AI Analysis", "description": "Run hallucination detection, competitor analysis, and trend identification using our scoring models."},
        {"name": "Insights Generation", "description": "Produce actionable recommendations, credit score updates, and visibility reports for business dashboards."},
    ],
}


@insights_bp.route("/metrics", methods=["GET"])
def get_metrics():
    """Return business engagement metrics."""
    return jsonify(DUMMY_METRICS)


@insights_bp.route("/pipeline", methods=["GET"])
def get_pipeline():
    """Return insight generation pipeline status and steps."""
    return jsonify(DUMMY_PIPELINE)
