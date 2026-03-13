# AI Visibility Test routes — Feature 4.
# Business-focused: tests how visible a business is across AI chatbots.
# POST /visibility/run — runs visibility test for a given query.
# GET /visibility/suggested-queries — returns popular consumer queries.
from flask import Blueprint, request, jsonify

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

# Dummy visibility result keyed to the default query — same shape as real engine
DUMMY_RESULTS = {
    "default": {
        "testId": "test_abc123",
        "query": "Best sustainable running shoes under $150",
        "generatedAt": "2026-03-13T14:00:00Z",
        "overallScore": 71,
        "overallExplanation": (
            "Your brand appeared on 2 of 3 platforms with mostly accurate descriptions. "
            "One high-severity hallucination was detected on GPT inflating your price by $30. "
            "Sentiment was positive where mentioned. Visibility is growing but Gemini remains a blind spot."
        ),
        "platforms": {
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
                "model": "gpt-4o",
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
                "model": "claude-sonnet-4-6",
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
                "model": "gemini-2.5-flash",
                "latencyMs": 980,
            },
        },
    }
}


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

    # For MVP: return the default dummy result with the query echoed back
    result = dict(DUMMY_RESULTS["default"])
    result["query"] = query
    return jsonify(result), 200


# Keep legacy endpoint alive for backwards compat
@visibility_bp.route("/products", methods=["GET"])
def list_products():
    """Legacy: redirect to suggested queries."""
    return jsonify({"products": []})
