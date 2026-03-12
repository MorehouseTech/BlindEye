# AI Visibility engine — Feature 4.
# Runs auto-generated shopping queries across GPT, Claude, and Gemini,
# then analyzes each response for brand mentions, accuracy, hallucinations,
# and competitive positioning.

import json
import os
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import anthropic
import google.generativeai as genai
import openai
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-1.5-pro")

JUDGE_MODEL = "gpt-4o"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_ground_truth(business, product, features: list, competitors: list) -> dict:
    """Assemble a ground-truth dict from DB records."""
    return {
        "brandName": business.name,
        "productName": product.name,
        "category": product.category,
        "description": product.description or "",
        "price": product.price,
        "features": features,
        "competitors": competitors,
        "availability": product.availability,
    }


def _parse_json_field(raw: str | None) -> list:
    """Safely parse a JSON-encoded text column into a list."""
    if not raw:
        return []
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []


# ---------------------------------------------------------------------------
# Step 1 — Query Generation
# ---------------------------------------------------------------------------

def _generate_queries(ground_truth: dict) -> list[str]:
    """Use an LLM to produce 3-5 natural shopping queries."""
    prompt = (
        "You are a consumer shopping online. Given the following product information, "
        "generate exactly 5 natural language shopping queries that a real person might "
        "type into an AI assistant when looking for this type of product. "
        "Vary the queries: some specific, some broad, some price-focused, some feature-focused. "
        "Return ONLY a JSON array of strings, nothing else.\n\n"
        f"Brand: {ground_truth['brandName']}\n"
        f"Product: {ground_truth['productName']}\n"
        f"Category: {ground_truth['category']}\n"
        f"Price: ${ground_truth['price']}\n"
        f"Key features: {', '.join(ground_truth['features'])}\n"
        f"Competitors: {', '.join(ground_truth['competitors'])}\n"
    )

    resp = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )
    text = resp.choices[0].message.content.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text)


# ---------------------------------------------------------------------------
# Step 2 — LLM Calls (parallel)
# ---------------------------------------------------------------------------

def _call_openai(query: str) -> dict:
    start = time.perf_counter()
    resp = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": query}],
    )
    latency = int((time.perf_counter() - start) * 1000)
    msg = resp.choices[0].message.content
    return {
        "platform": "GPT",
        "model": "gpt-4o",
        "query": query,
        "response": msg,
        "latencyMs": latency,
        "promptTokens": resp.usage.prompt_tokens,
        "completionTokens": resp.usage.completion_tokens,
    }


def _call_claude(query: str) -> dict:
    start = time.perf_counter()
    resp = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": query}],
    )
    latency = int((time.perf_counter() - start) * 1000)
    text = resp.content[0].text
    return {
        "platform": "Claude",
        "model": "claude-sonnet-4-6",
        "query": query,
        "response": text,
        "latencyMs": latency,
        "promptTokens": resp.usage.input_tokens,
        "completionTokens": resp.usage.output_tokens,
    }


def _call_gemini(query: str) -> dict:
    start = time.perf_counter()
    resp = gemini_model.generate_content(query)
    latency = int((time.perf_counter() - start) * 1000)
    usage = resp.usage_metadata
    return {
        "platform": "Gemini",
        "model": "gemini-1.5-pro",
        "query": query,
        "response": resp.text,
        "latencyMs": latency,
        "promptTokens": getattr(usage, "prompt_token_count", 0),
        "completionTokens": getattr(usage, "candidates_token_count", 0),
    }


PLATFORM_CALLERS = [_call_openai, _call_claude, _call_gemini]


def _run_queries_parallel(queries: list[str]) -> list[dict]:
    """Send every query to every platform in parallel."""
    results = []
    with ThreadPoolExecutor(max_workers=15) as pool:
        futures = {}
        for query in queries:
            for caller in PLATFORM_CALLERS:
                f = pool.submit(caller, query)
                futures[f] = (caller.__name__, query)
        for f in as_completed(futures):
            try:
                results.append(f.result())
            except Exception as exc:
                name, q = futures[f]
                results.append({
                    "platform": name,
                    "query": q,
                    "response": f"ERROR: {exc}",
                    "latencyMs": 0,
                    "model": "unknown",
                    "promptTokens": 0,
                    "completionTokens": 0,
                })
    return results


# ---------------------------------------------------------------------------
# Step 3 — Judge Analysis
# ---------------------------------------------------------------------------

JUDGE_SYSTEM_PROMPT = (
    "You are an impartial analyst. You will receive an AI platform's response to a "
    "shopping query and the ground truth data about a specific brand/product. "
    "Analyze the response and return ONLY a valid JSON object (no markdown, no explanation) "
    "with these exact fields:\n"
    "  mentionRate: 0 or 1\n"
    "  mentionPosition: \"first\", \"middle\", \"last\", or null\n"
    "  recommendationStrength: float 0.0-1.0\n"
    "  priceAccuracy: \"correct\", \"too_high\", \"too_low\", or \"not_mentioned\"\n"
    "  priceDelta: float or null\n"
    "  featureAccuracyScore: float 0.0-1.0\n"
    "  availabilityAccurate: true, false, or null\n"
    "  hallucinationFlags: array of {field, aiSaid, actual, severity} where severity is \"low\", \"medium\", or \"high\"\n"
    "  brandSentiment: \"positive\", \"neutral\", \"negative\", or \"not_mentioned\"\n"
    "  sentimentScore: float 0.0-1.0\n"
    "  trustLanguagePresent: true or false\n"
    "  descriptionTone: \"enthusiastic\", \"neutral\", \"dismissive\", or null\n"
    "  competitorMentions: object mapping competitor name to integer count\n"
    "  shareOfVoice: float 0.0-1.0\n"
    "  rankedAboveCompetitors: true or false\n"
    "  recommendedOverCompetitors: true or false\n"
    "  featureCoveragePct: float 0.0-1.0\n"
    "  categoryRelevanceScore: float 0.0-1.0\n"
    "  descriptionMatchScore: float 0.0-1.0\n"
)


def _judge_response(platform_result: dict, ground_truth: dict) -> dict:
    """Ask the judge LLM to analyze a single platform response."""
    user_msg = (
        f"QUERY: {platform_result['query']}\n\n"
        f"AI RESPONSE:\n{platform_result['response']}\n\n"
        f"GROUND TRUTH:\n{json.dumps(ground_truth, indent=2)}\n"
    )
    resp = openai_client.chat.completions.create(
        model=JUDGE_MODEL,
        messages=[
            {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.0,
    )
    text = resp.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"_raw_judge_output": text, "mentionRate": 0}


def _judge_all_parallel(platform_results: list[dict], ground_truth: dict) -> list[dict]:
    """Run judge analysis on every platform result in parallel."""
    analyzed = []
    with ThreadPoolExecutor(max_workers=15) as pool:
        futures = {pool.submit(_judge_response, r, ground_truth): r for r in platform_results}
        for f in as_completed(futures):
            original = futures[f]
            try:
                analysis = f.result()
            except Exception:
                analysis = {"mentionRate": 0}
            analyzed.append({**original, "analysis": analysis})
    return analyzed


# ---------------------------------------------------------------------------
# Step 4 — Scoring
# ---------------------------------------------------------------------------

def _score_platform(entries: list[dict]) -> tuple[int, str]:
    """Compute a 0-100 score for one platform from its analyzed entries."""
    if not entries:
        return 0, "No data available for this platform."

    mention_avg = sum(e["analysis"].get("mentionRate", 0) for e in entries) / len(entries)
    rec_avg = sum(e["analysis"].get("recommendationStrength", 0) for e in entries) / len(entries)
    feat_avg = sum(e["analysis"].get("featureAccuracyScore", 0) for e in entries) / len(entries)
    sov_avg = sum(e["analysis"].get("shareOfVoice", 0) for e in entries) / len(entries)
    cat_avg = sum(e["analysis"].get("categoryRelevanceScore", 0) for e in entries) / len(entries)
    desc_avg = sum(e["analysis"].get("descriptionMatchScore", 0) for e in entries) / len(entries)
    sentiment_avg = sum(e["analysis"].get("sentimentScore", 0) for e in entries) / len(entries)

    raw = (
        mention_avg * 20
        + rec_avg * 15
        + feat_avg * 15
        + sov_avg * 15
        + cat_avg * 10
        + desc_avg * 10
        + sentiment_avg * 15
    )

    # Hallucination penalty
    high_flags = sum(
        1 for e in entries
        for h in e["analysis"].get("hallucinationFlags", [])
        if h.get("severity") == "high"
    )
    med_flags = sum(
        1 for e in entries
        for h in e["analysis"].get("hallucinationFlags", [])
        if h.get("severity") == "medium"
    )
    penalty = high_flags * 5 + med_flags * 2
    score = max(0, min(100, int(raw - penalty)))

    parts = []
    if mention_avg >= 0.8:
        parts.append("strong brand presence")
    elif mention_avg >= 0.4:
        parts.append("moderate brand presence")
    else:
        parts.append("low brand visibility")
    if high_flags:
        parts.append(f"{high_flags} high-severity hallucination(s)")
    if rec_avg >= 0.7:
        parts.append("frequently recommended")

    explanation = f"Score {score}/100 — " + ", ".join(parts) + "."
    return score, explanation


def _compute_overall(platform_scores: dict[str, int], all_entries: list[dict]) -> tuple[int, str]:
    """Average platform scores with a global hallucination penalty."""
    if not platform_scores:
        return 0, "No platform data."

    avg = sum(platform_scores.values()) / len(platform_scores)
    high_count = sum(
        1 for e in all_entries
        for h in e["analysis"].get("hallucinationFlags", [])
        if h.get("severity") == "high"
    )
    ms_score = max(0, min(100, int(avg - high_count * 3)))

    if ms_score >= 80:
        tone = "Your brand has strong AI visibility across platforms."
    elif ms_score >= 50:
        tone = "Your brand has moderate AI visibility with room for improvement."
    else:
        tone = "Your brand has limited AI visibility. Consider updating product information."

    if high_count:
        tone += f" {high_count} high-severity hallucination(s) were detected."

    return ms_score, tone


# ---------------------------------------------------------------------------
# Step 5 — Assemble & Return
# ---------------------------------------------------------------------------

def _aggregate_platform(entries: list[dict]) -> dict:
    """Pick the best-query entry as the representative raw output and merge analysis."""
    best = max(entries, key=lambda e: e["analysis"].get("recommendationStrength", 0))
    score, explanation = _score_platform(entries)
    analysis = best["analysis"]
    return {
        "score": score,
        "explanation": explanation,
        "rawOutput": {
            "query": best["query"],
            "model": best["model"],
            "response": best["response"],
            "latencyMs": best["latencyMs"],
            "promptTokens": best.get("promptTokens", 0),
            "completionTokens": best.get("completionTokens", 0),
        },
        **analysis,
    }


def run_visibility_test(business_id: int, product_id: int) -> dict:
    """
    Full visibility test pipeline.

    This function is called from the Flask route and requires an active
    app context so it can query the database via SQLAlchemy.
    """
    from app.models import Business, Product

    business = Business.query.get(business_id)
    if not business:
        raise ValueError(f"Business {business_id} not found")

    product = Product.query.get(product_id)
    if not product or product.business_id != business_id:
        raise ValueError(f"Product {product_id} not found for business {business_id}")

    features = _parse_json_field(product.features)
    competitors = _parse_json_field(product.competitors)
    ground_truth = _build_ground_truth(business, product, features, competitors)

    # Step 1
    queries = _generate_queries(ground_truth)

    # Step 2
    raw_results = _run_queries_parallel(queries)

    # Step 3
    analyzed = _judge_all_parallel(raw_results, ground_truth)

    # Group by platform
    by_platform: dict[str, list[dict]] = {}
    for entry in analyzed:
        by_platform.setdefault(entry["platform"], []).append(entry)

    # Step 4
    platform_scores = {}
    platform_blocks = {}
    for name in ("GPT", "Claude", "Gemini"):
        entries = by_platform.get(name, [])
        block = _aggregate_platform(entries) if entries else {
            "score": 0,
            "explanation": f"No responses received from {name}.",
            "rawOutput": {},
        }
        platform_scores[name] = block["score"]
        platform_blocks[name] = block

    ms_score, ms_explanation = _compute_overall(platform_scores, analyzed)

    # Step 5
    return {
        "testId": str(uuid.uuid4()),
        "businessId": business_id,
        "productId": product_id,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "data": [
            {"overallScore": {"msScore": ms_score, "msExplanation": ms_explanation}},
            {"GPT": platform_blocks["GPT"]},
            {"Claude": platform_blocks["Claude"]},
            {"Gemini": platform_blocks["Gemini"]},
        ],
    }
