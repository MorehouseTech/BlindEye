# Social Feed routes — User-facing product discovery feed.
# GET /feed/posts — returns a feed of product posts from businesses.
# POST /feed/like — like a post (local state, no persistence).
from flask import Blueprint, request, jsonify

feed_bp = Blueprint("feed", __name__)

DUMMY_FEED_POSTS = [
    {
        "id": 1,
        "businessName": "Solebound",
        "businessLogo": "SB",
        "productName": "Apex Runner",
        "category": "Running Shoes",
        "price": 129.99,
        "description": "Sustainable running shoes made from 100% recycled materials. Breathable mesh upper, recycled rubber sole, unisex sizing 6-14.",
        "tags": ["sustainable", "running", "eco-friendly", "recycled"],
        "likes": 342,
        "comments": 28,
        "aiScore": 71,
        "imageUrl": None,
        "businessSize": "local",
        "uniquenessScore": 82,
        "relevanceScore": 91,
    },
    {
        "id": 2,
        "businessName": "GreenThread Co.",
        "businessLogo": "GT",
        "productName": "EcoWeave Tee",
        "category": "Apparel",
        "price": 34.99,
        "description": "Organic cotton t-shirt with water-based dyes. Carbon-neutral production process, available in 12 colors.",
        "tags": ["organic", "apparel", "carbon-neutral", "cotton"],
        "likes": 518,
        "comments": 45,
        "aiScore": 85,
        "imageUrl": None,
        "businessSize": "local",
        "uniquenessScore": 67,
        "relevanceScore": 78,
    },
    {
        "id": 3,
        "businessName": "PureHome",
        "businessLogo": "PH",
        "productName": "BambooBlend Towel Set",
        "category": "Home Goods",
        "price": 49.99,
        "description": "Ultra-soft bamboo fiber towels. Naturally antibacterial, quick-drying, set of 4 bath towels.",
        "tags": ["bamboo", "home", "sustainable", "antibacterial"],
        "likes": 203,
        "comments": 15,
        "aiScore": 62,
        "imageUrl": None,
        "businessSize": "local",
        "uniquenessScore": 74,
        "relevanceScore": 65,
    },
    {
        "id": 4,
        "businessName": "BiteRight",
        "businessLogo": "BR",
        "productName": "Plant Protein Bar",
        "category": "Food & Beverage",
        "price": 2.99,
        "description": "20g plant protein per bar. No artificial sweeteners, gluten-free, available in 6 flavors. Box of 12.",
        "tags": ["protein", "plant-based", "gluten-free", "snack"],
        "likes": 891,
        "comments": 72,
        "aiScore": 45,
        "imageUrl": None,
        "businessSize": "mainstream",
        "uniquenessScore": 35,
        "relevanceScore": 88,
    },
    {
        "id": 5,
        "businessName": "LuminaTech",
        "businessLogo": "LT",
        "productName": "Solar Desk Lamp",
        "category": "Electronics",
        "price": 79.99,
        "description": "Solar-charged LED desk lamp with 3 brightness modes. Built-in USB-C charging port, 8-hour battery life.",
        "tags": ["solar", "electronics", "LED", "sustainable"],
        "likes": 156,
        "comments": 11,
        "aiScore": 38,
        "imageUrl": None,
        "businessSize": "local",
        "uniquenessScore": 89,
        "relevanceScore": 52,
    },
    {
        "id": 6,
        "businessName": "Solebound",
        "businessLogo": "SB",
        "productName": "Trail Blazer Pro",
        "category": "Hiking Boots",
        "price": 159.99,
        "description": "Waterproof hiking boots with recycled TPU sole. Ankle support, breathable Gore-Tex lining, sizes 7-15.",
        "tags": ["hiking", "waterproof", "sustainable", "outdoor"],
        "likes": 267,
        "comments": 33,
        "aiScore": 55,
        "imageUrl": None,
        "businessSize": "local",
        "uniquenessScore": 71,
        "relevanceScore": 83,
    },
    {
        "id": 7,
        "businessName": "Nike",
        "businessLogo": "NK",
        "productName": "Air Max 90",
        "category": "Running Shoes",
        "price": 130.00,
        "description": "Classic Air Max 90 with visible Air cushioning. Leather and mesh upper, rubber waffle outsole.",
        "tags": ["running", "classic", "air-max", "sneakers"],
        "likes": 2341,
        "comments": 187,
        "aiScore": 94,
        "imageUrl": None,
        "businessSize": "mainstream",
        "uniquenessScore": 22,
        "relevanceScore": 95,
    },
    {
        "id": 8,
        "businessName": "Adidas",
        "businessLogo": "AD",
        "productName": "Ultraboost 24",
        "category": "Running Shoes",
        "price": 190.00,
        "description": "Premium running shoe with BOOST midsole technology. Primeknit+ upper, Continental rubber outsole.",
        "tags": ["running", "boost", "premium", "performance"],
        "likes": 1876,
        "comments": 142,
        "aiScore": 91,
        "imageUrl": None,
        "businessSize": "mainstream",
        "uniquenessScore": 28,
        "relevanceScore": 92,
    },
]


@feed_bp.route("/posts", methods=["GET"])
def get_feed_posts():
    """Return the social feed of product posts."""
    category = request.args.get("category")
    search = request.args.get("search", "").lower()
    size = request.args.get("size")  # "local" or "mainstream" for Blind Spot

    posts = DUMMY_FEED_POSTS

    if category and category != "All":
        posts = [p for p in posts if p["category"] == category]

    if size and size in ("local", "mainstream"):
        posts = [p for p in posts if p.get("businessSize") == size]

    if search:
        posts = [
            p for p in posts
            if search in p["productName"].lower()
            or search in p["description"].lower()
            or search in p["businessName"].lower()
            or any(search in tag for tag in p["tags"])
        ]

    return jsonify({"posts": posts})


@feed_bp.route("/like", methods=["POST"])
def like_post():
    """Like a post (no persistence, just acknowledges)."""
    data = request.get_json() or {}
    post_id = data.get("post_id")
    if not post_id:
        return jsonify({"error": "post_id is required"}), 400
    return jsonify({"success": True, "post_id": post_id})


@feed_bp.route("/categories", methods=["GET"])
def get_categories():
    """Return available product categories."""
    categories = sorted(set(p["category"] for p in DUMMY_FEED_POSTS))
    return jsonify({"categories": ["All"] + categories})
