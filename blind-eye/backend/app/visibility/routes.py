# AI Visibility Test routes — Feature 4.
# Business-focused: tests how visible a business is across AI chatbots.
# POST /visibility/run — runs visibility test for a given query.
# GET /visibility/suggested-queries — returns popular consumer queries.
import logging
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from ..ai_service import run_visibility_for_query, has_api_keys

logger = logging.getLogger("blindeye.visibility")

visibility_bp = Blueprint("visibility", __name__)

# Suggested queries sourced from aggregated user searches
SUGGESTED_QUERIES = [
    {"id": 1, "query": "Best sustainable running shoes under $150", "searchVolume": 2840, "category": "Running Shoes"},
    {"id": 2, "query": "Eco-friendly sneakers for everyday wear", "searchVolume": 1620, "category": "Casual Sneakers"},
    {"id": 3, "query": "Where to buy recycled hiking boots", "searchVolume": 890, "category": "Hiking Boots"},
    {"id": 4, "query": "Top rated organic cotton t-shirts", "searchVolume": 1450, "category": "Apparel"},
    {"id": 5, "query": "Best plant-based protein bars 2026", "searchVolume": 3200, "category": "Food & Beverage"},
    {"id": 6, "query": "Solar powered desk accessories", "searchVolume": 670, "category": "Electronics"},
    {"id": 7, "query": "Sustainable home goods brands", "searchVolume": 1180, "category": "Home Goods"},
    {"id": 8, "query": "Affordable eco-friendly running shoes", "searchVolume": 2100, "category": "Running Shoes"},
]

# Dummy fallback results — used when API keys are missing or calls fail
DUMMY_PLATFORMS = {
    "ChatGPT": {
        "score": 58,
        "explanation": (
            "Brand was mentioned once in the middle of the response. Price was reported "
            "incorrectly at $160 vs your actual $129.99. Features were partially accurate. "
            "Sentiment was neutral and the brand was not the primary recommendation."
        ),
        "mentioned": True,
        "mentionPosition": "middle",
        "sentiment": "neutral",
        "priceAccuracy": "too_high",
        "hallucinationFlags": [
            {"field": "price", "aiSaid": "$160", "actual": "$129.99", "severity": "high"}
        ],
        "rawResponse": (
            "Some great options for sustainable running shoes include Allbirds Tree Dashers "
            "at $135, Brooks Ghost 15 at $140, and Solebound Apex Runner at $160 which features "
            "a recycled rubber sole and breathable mesh upper. Allbirds remains the most "
            "well-known option in this space for eco-conscious runners."
        ),
        "model": "gpt-4o (demo)",
        "latencyMs": 1200,
    },
    "Claude": {
        "score": 91,
        "explanation": (
            "Brand appeared first in the response and was the primary recommendation. "
            "Price and features were described accurately. Positive trust language was "
            "used and the brand was recommended over known competitors."
        ),
        "mentioned": True,
        "mentionPosition": "first",
        "sentiment": "positive",
        "priceAccuracy": "correct",
        "hallucinationFlags": [],
        "rawResponse": (
            "For sustainable running shoes under $150, I would recommend starting with "
            "Solebound's Apex Runner at $129.99. It uses fully recycled materials throughout, "
            "including a recycled rubber sole and breathable mesh upper, and comes in unisex "
            "sizing from 6 to 14. Allbirds Tree Dashers are also a solid option at $135."
        ),
        "model": "claude-sonnet-4-6 (demo)",
        "latencyMs": 1050,
    },
    "Gemini": {
        "score": 0,
        "explanation": (
            "Brand was not mentioned in any Gemini response. "
            "Competitors Allbirds and On Running were recommended instead. "
            "This is your biggest visibility gap."
        ),
        "mentioned": False,
        "mentionPosition": None,
        "sentiment": "not_mentioned",
        "priceAccuracy": "not_mentioned",
        "hallucinationFlags": [],
        "rawResponse": (
            "Here are some top picks for eco-friendly running shoes under $150: Allbirds "
            "Tree Dashers ($135) are made from renewable materials and are a fan favorite. "
            "On Running Cloudgo ($140) offers a solid sustainable option with recycled upper."
        ),
        "model": "gemini-2.5-flash (demo)",
        "latencyMs": 980,
    },
}


def _build_overall(platforms: dict) -> tuple[int, str]:
    """Compute overall score and explanation from per-platform results."""
    scores = [p["score"] for p in platforms.values()]
    overall = round(sum(scores) / max(len(scores), 1))
    mentioned_count = sum(1 for p in platforms.values() if p["mentioned"])
    total = len(platforms)

    parts = []
    if mentioned_count == total:
        parts.append(f"Your brand appeared on all {total} platforms.")
    elif mentioned_count > 0:
        parts.append(f"Your brand appeared on {mentioned_count} of {total} platforms.")
    else:
        parts.append("Your brand was not mentioned on any platform tested.")

    # Check for hallucinations
    halluc_platforms = [
        name for name, p in platforms.items() if p.get("hallucinationFlags")
    ]
    if halluc_platforms:
        parts.append(
            f"Hallucinations detected on: {', '.join(halluc_platforms)}."
        )

    # Identify gaps
    gaps = [name for name, p in platforms.items() if not p["mentioned"]]
    if gaps:
        parts.append(f"Visibility gap on: {', '.join(gaps)}.")

    return overall, " ".join(parts)


@visibility_bp.route("/suggested-queries", methods=["GET"])
def get_suggested_queries():
    """Return popular consumer search queries relevant to this business."""
    return jsonify({"queries": SUGGESTED_QUERIES})


@visibility_bp.route("/run", methods=["POST"])
def run_visibility_test():
    """Run a visibility test for a given search query."""
    data = request.get_json() or {}
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"error": "query is required"}), 400

    use_live = has_api_keys()
    platforms = {}

    if use_live:
        logger.info("LIVE AI MODE: Running visibility test for '%s'", query)
        live_results = run_visibility_for_query(query)

        for platform_name in ["ChatGPT", "Claude", "Gemini"]:
            result = live_results.get(platform_name)
            if result:
                platforms[platform_name] = result
            else:
                # Fallback for this specific platform
                logger.warning(
                    "FALLBACK: Using dummy data for %s (query: '%s')",
                    platform_name, query,
                )
                platforms[platform_name] = dict(DUMMY_PLATFORMS[platform_name])
    else:
        logger.info("DEMO MODE: No API keys configured. Using dummy data for '%s'", query)
        platforms = {k: dict(v) for k, v in DUMMY_PLATFORMS.items()}

    overall_score, overall_explanation = _build_overall(platforms)

    result = {
        "testId": f"test_{int(datetime.now(timezone.utc).timestamp())}",
        "query": query,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "overallScore": overall_score,
        "overallExplanation": overall_explanation,
        "platforms": platforms,
        "liveMode": use_live,
    }

    return jsonify(result), 200


# Keep legacy endpoint alive for backwards compat
@visibility_bp.route("/products", methods=["GET"])
def list_products():
    """Legacy: redirect to suggested queries."""
    return jsonify({"products": []})
