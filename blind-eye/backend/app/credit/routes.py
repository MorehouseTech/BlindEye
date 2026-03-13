# Feature 3 — Credit Score Blueprint
# Consolidated from feature/credit-score (FastAPI + Azure/Tavily LLM scoring)
# and feature/credit-graph (Flask + DB credit events graph).
#
# For the MVP we serve dummy data so no external API calls or DB are needed.
# The real implementations are preserved as comments / helper functions
# that can be swapped in later.

from flask import Blueprint, jsonify, request

credit_bp = Blueprint("credit", __name__)

# ---------------------------------------------------------------------------
# Dummy data (extracted from feature/credit-score branch)
# This is the same shape the FastAPI endpoint returned.
# ---------------------------------------------------------------------------

DUMMY_CREDIT_SCORE_REPORT = {
    "scoreId": "cred_001",
    "businessId": "biz_001",
    "weekOf": "2026-03-09",
    "overallCreditScore": 71,
    "overallExplanation": (
        "Your brand appeared on 2 of 3 platforms with mostly accurate descriptions. "
        "One high-severity hallucination was detected on GPT inflating your price by $30. "
        "Sentiment was positive where mentioned. Visibility is growing but Gemini remains a blind spot."
    ),
    "scoreBreakdown": {
        "engagementScore": 68,
        "conversionScore": 61,
        "customerRetentionScore": 54,
        "visibilityScore": 76,
        "seoOptimizationScore": 59,
        "contentQualityScore": 80,
    },
    "engagementMetrics": {
        "likes": 5400,
        "comments": 420,
        "shares": 190,
        "clickThroughRate": 0.14,
        "conversionRate": 0.06,
    },
    "llmSearchMetrics": {
        "googleIndexed": True,
        "productPagesOptimized": True,
        "averageSearchRank": 12,
        "missingMetadataIssues": 3,
    },
    "recommendations": [
        "Improve product metadata for search indexing — GPT reported your price incorrectly at $160 vs actual $129.99. Ensure your product pages have structured data markup so AI systems pull accurate pricing. This alone could improve your GPT score by 15-20 points.",
        "Increase Gemini visibility — your brand was completely absent from Gemini responses. Submit your product feed to Google Merchant Center and ensure your site is indexed. Focus on creating content that answers common shopping queries in your category.",
        "Leverage Claude's strong recommendation — Claude ranked you first with a score of 91. Capitalize on this by ensuring your product descriptions remain accurate and up-to-date across all platforms to maintain this positioning.",
    ],
    "trend": {
        "previousScore": 65,
        "change": 6,
        "direction": "up",
    },
    "generatedAt": "2026-03-12T10:00:00Z",
}

# ---------------------------------------------------------------------------
# Dummy credit-score-graph events (from feature/credit-graph branch SQL seed)
# ---------------------------------------------------------------------------

DUMMY_CREDIT_EVENTS = [
    {"event_id": i + 1, "business_id": 1, "amount": amt, "event_time": ts}
    for i, (amt, ts) in enumerate([
        (10, "2024-03-01T00:00:00"), (-2, "2024-03-08T00:00:00"),
        (5, "2024-03-15T00:00:00"), (8, "2024-03-22T00:00:00"),
        (-1, "2024-03-29T00:00:00"), (12, "2024-04-05T00:00:00"),
        (3, "2024-04-12T00:00:00"), (-3, "2024-04-19T00:00:00"),
        (7, "2024-04-26T00:00:00"), (4, "2024-05-03T00:00:00"),
        (-4, "2024-05-10T00:00:00"), (6, "2024-05-17T00:00:00"),
        (9, "2024-05-24T00:00:00"), (-2, "2024-05-31T00:00:00"),
        (11, "2024-06-07T00:00:00"), (2, "2024-06-14T00:00:00"),
        (-5, "2024-06-21T00:00:00"), (8, "2024-06-28T00:00:00"),
        (1, "2024-07-05T00:00:00"), (14, "2024-07-12T00:00:00"),
        (-1, "2024-07-19T00:00:00"), (5, "2024-07-26T00:00:00"),
        (7, "2024-08-02T00:00:00"), (-3, "2024-08-09T00:00:00"),
        (10, "2024-08-16T00:00:00"), (4, "2024-08-23T00:00:00"),
        (-2, "2024-08-30T00:00:00"), (6, "2024-09-06T00:00:00"),
        (9, "2024-09-13T00:00:00"), (0, "2024-09-20T00:00:00"),
        (12, "2024-09-27T00:00:00"), (-4, "2024-10-04T00:00:00"),
        (3, "2024-10-11T00:00:00"), (8, "2024-10-18T00:00:00"),
        (2, "2024-10-25T00:00:00"), (-6, "2024-11-01T00:00:00"),
        (11, "2024-11-08T00:00:00"), (5, "2024-11-15T00:00:00"),
        (-1, "2024-11-22T00:00:00"), (7, "2024-11-29T00:00:00"),
        (13, "2024-12-06T00:00:00"), (-2, "2024-12-13T00:00:00"),
        (4, "2024-12-20T00:00:00"), (6, "2024-12-27T00:00:00"),
        (9, "2025-01-03T00:00:00"), (-3, "2025-01-10T00:00:00"),
        (10, "2025-01-17T00:00:00"), (1, "2025-01-24T00:00:00"),
        (-5, "2025-01-31T00:00:00"), (8, "2025-02-07T00:00:00"),
        (15, "2025-02-14T00:00:00"),
    ])
]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@credit_bp.route("/score", methods=["GET", "POST"])
def get_credit_score():
    """Return the credit score report (dummy data for MVP)."""
    return jsonify({
        "creditScoreReport": DUMMY_CREDIT_SCORE_REPORT,
    })


@credit_bp.route("/graph", methods=["POST"])
def get_credit_score_graph():
    """Return credit score events for the graph (dummy data for MVP)."""
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id", "1")

    result_list = [e for e in DUMMY_CREDIT_EVENTS if str(e["business_id"]) == str(business_id)]
    credit_score = sum(e["amount"] for e in result_list)

    return jsonify({
        "message": "Credit score graph",
        "result": credit_score,
        "result_list": result_list,
    })
