# AI Visibility Test routes — Feature 4.
# POST /visibility/run — returns dummy visibility test results for MVP.
# POST /visibility/products — returns list of products for the selector.
from flask import Blueprint, request, jsonify

visibility_bp = Blueprint("visibility", __name__)

# Dummy product catalog for the product selector
DUMMY_PRODUCTS = [
    {"id": 1, "name": "Apex Runner", "category": "Running Shoes", "price": 129.99},
    {"id": 2, "name": "Trail Blazer Pro", "category": "Hiking Boots", "price": 159.99},
    {"id": 3, "name": "Urban Glide", "category": "Casual Sneakers", "price": 89.99},
]

# Dummy visibility test result (same shape as the real engine output)
DUMMY_VISIBILITY_RESULT = {
    "testId": "test_abc123",
    "businessId": "biz_001",
    "productId": "prod_001",
    "generatedAt": "2026-03-12T14:00:00Z",
    "data": [
        {
            "overallScore": {
                "msScore": 71,
                "msExplanation": (
                    "Your brand appeared on 2 of 3 platforms with mostly accurate descriptions. "
                    "One high-severity hallucination was detected on GPT inflating your price by $30. "
                    "Sentiment was positive where mentioned. Visibility is growing but Gemini remains a blind spot."
                ),
            }
        },
        {
            "GPT": {
                "score": 58,
                "explanation": (
                    "Brand was mentioned once in the middle of the response. Price was reported "
                    "incorrectly at $160 vs your actual $129.99. Features were partially accurate. "
                    "Sentiment was neutral and the brand was not the primary recommendation."
                ),
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "gpt-4o",
                    "response": (
                        "Some great options for sustainable running shoes include Allbirds Tree Dashers "
                        "at $135, Brooks Ghost 15 at $140, and Solebound Apex Runner at $160 which features "
                        "a recycled rubber sole and breathable mesh upper. Allbirds remains the most "
                        "well-known option in this space for eco-conscious runners."
                    ),
                    "latencyMs": 1200,
                    "promptTokens": 42,
                    "completionTokens": 187,
                },
                "mentionRate": 1,
                "mentionPosition": "middle",
                "recommendationStrength": 0.4,
                "priceAccuracy": "too_high",
                "priceDelta": 30.01,
                "featureAccuracyScore": 0.7,
                "availabilityAccurate": True,
                "hallucinationFlags": [
                    {"field": "price", "aiSaid": "$160", "actual": "$129.99", "severity": "high"}
                ],
                "brandSentiment": "neutral",
                "sentimentScore": 0.55,
                "trustLanguagePresent": False,
                "descriptionTone": "neutral",
                "competitorMentions": {"Allbirds": 2, "Brooks": 1},
                "shareOfVoice": 0.25,
                "rankedAboveCompetitors": False,
                "recommendedOverCompetitors": False,
                "featureCoveragePct": 0.33,
                "categoryRelevanceScore": 0.85,
                "descriptionMatchScore": 0.61,
            }
        },
        {
            "Claude": {
                "score": 91,
                "explanation": (
                    "Brand appeared first in the response and was the primary recommendation. "
                    "Price and features were described accurately. Positive trust language was "
                    "used and the brand was recommended over known competitors."
                ),
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "claude-sonnet-4-6",
                    "response": (
                        "For sustainable running shoes under $150, I would recommend starting with "
                        "Solebound's Apex Runner at $129.99. It uses fully recycled materials throughout, "
                        "including a recycled rubber sole and breathable mesh upper, and comes in unisex "
                        "sizing from 6 to 14. Allbirds Tree Dashers are also a solid option at $135 if "
                        "you want a more established brand, but Solebound offers comparable sustainability "
                        "at a lower price point."
                    ),
                    "latencyMs": 1050,
                    "promptTokens": 42,
                    "completionTokens": 203,
                },
                "mentionRate": 1,
                "mentionPosition": "first",
                "recommendationStrength": 0.8,
                "priceAccuracy": "correct",
                "priceDelta": 0,
                "featureAccuracyScore": 0.9,
                "availabilityAccurate": True,
                "hallucinationFlags": [],
                "brandSentiment": "positive",
                "sentimentScore": 0.82,
                "trustLanguagePresent": True,
                "descriptionTone": "enthusiastic",
                "competitorMentions": {"Allbirds": 1},
                "shareOfVoice": 0.5,
                "rankedAboveCompetitors": True,
                "recommendedOverCompetitors": True,
                "featureCoveragePct": 0.67,
                "categoryRelevanceScore": 0.92,
                "descriptionMatchScore": 0.88,
            }
        },
        {
            "Gemini": {
                "score": 0,
                "explanation": (
                    "Brand was not mentioned in any Gemini response across all generated queries. "
                    "Competitors Allbirds and On Running were recommended instead. This is your "
                    "biggest visibility gap."
                ),
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "gemini-2.5-flash",
                    "response": (
                        "Here are some top picks for eco-friendly running shoes under $150: Allbirds "
                        "Tree Dashers ($135) are made from renewable materials and are a fan favorite "
                        "for casual and light running. On Running Cloudgo ($140) offers a solid sustainable "
                        "option with their recycled material upper. New Balance Fresh Foam 1080 also has "
                        "an eco-conscious line worth exploring in this price range."
                    ),
                    "latencyMs": 980,
                    "promptTokens": 42,
                    "completionTokens": 164,
                },
                "mentionRate": 0,
                "mentionPosition": None,
                "recommendationStrength": 0,
                "priceAccuracy": "not_mentioned",
                "priceDelta": None,
                "featureAccuracyScore": 0,
                "availabilityAccurate": None,
                "hallucinationFlags": [],
                "brandSentiment": "not_mentioned",
                "sentimentScore": 0,
                "trustLanguagePresent": False,
                "descriptionTone": None,
                "competitorMentions": {"Allbirds": 3, "On Running": 2},
                "shareOfVoice": 0,
                "rankedAboveCompetitors": False,
                "recommendedOverCompetitors": False,
                "featureCoveragePct": 0,
                "categoryRelevanceScore": 0,
                "descriptionMatchScore": 0,
            }
        },
    ],
}


@visibility_bp.route("/products", methods=["GET"])
def list_products():
    """Return the product catalog for the product selector."""
    return jsonify({"products": DUMMY_PRODUCTS})


@visibility_bp.route("/run", methods=["POST"])
def run_visibility_test():
    """Run a visibility test (returns dummy data for MVP)."""
    data = request.get_json() or {}
    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    return jsonify(DUMMY_VISIBILITY_RESULT), 200
