# Centralized AI service — calls ChatGPT, Claude, and Gemini with caching + fallback.
# Design goals: fast demo (cache hits), graceful degradation (fallback to dummy), logging.
import os
import json
import time
import logging
import hashlib
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger("blindeye.ai")

# ── In-memory cache ──────────────────────────────────────────────────────────
_cache: dict[str, dict] = {}
CACHE_TTL = 3600  # 1 hour


def _cache_key(platform: str, query: str) -> str:
    return hashlib.sha256(f"{platform}:{query.lower().strip()}".encode()).hexdigest()


def _get_cached(platform: str, query: str) -> Optional[dict]:
    key = _cache_key(platform, query)
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        logger.info("CACHE HIT: %s for query '%s'", platform, query)
        return entry["data"]
    return None


def _set_cached(platform: str, query: str, data: dict):
    key = _cache_key(platform, query)
    _cache[key] = {"ts": time.time(), "data": data}


# ── Prompt template ──────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are a helpful shopping assistant. A consumer is looking for product "
    "recommendations. Respond naturally with specific brand names, pricing, "
    "and key features. Be concise (2-4 sentences)."
)

TIMEOUT_SECONDS = 10  # Max wait per platform


# ── Platform callers ─────────────────────────────────────────────────────────
def _call_chatgpt(query: str) -> dict:
    """Call OpenAI GPT-4o-mini for speed/cost."""
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key, timeout=TIMEOUT_SECONDS)
    start = time.time()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        max_tokens=300,
        temperature=0.7,
    )
    latency = int((time.time() - start) * 1000)
    text = response.choices[0].message.content or ""
    model = response.model or "gpt-4o-mini"
    return {"rawResponse": text, "model": model, "latencyMs": latency}


def _call_claude(query: str) -> dict:
    """Call Anthropic Claude Haiku for speed/cost."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key, timeout=TIMEOUT_SECONDS)
    start = time.time()
    response = client.messages.create(
        model="claude-haiku-4-20250414",
        max_tokens=300,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": query}],
    )
    latency = int((time.time() - start) * 1000)
    text = response.content[0].text if response.content else ""
    model = response.model or "claude-haiku-4-20250414"
    return {"rawResponse": text, "model": model, "latencyMs": latency}


def _call_gemini(query: str) -> dict:
    """Call Google Gemini Flash for speed/cost."""
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        "gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
    )
    start = time.time()
    response = model.generate_content(
        query,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=300,
            temperature=0.7,
        ),
    )
    latency = int((time.time() - start) * 1000)
    text = response.text or ""
    return {"rawResponse": text, "model": "gemini-2.0-flash", "latencyMs": latency}


PLATFORM_CALLERS = {
    "ChatGPT": _call_chatgpt,
    "Claude": _call_claude,
    "Gemini": _call_gemini,
}


# ── Analysis helpers ─────────────────────────────────────────────────────────
def _analyze_response(raw: str, business_name: str = "Solebound") -> dict:
    """Simple heuristic analysis of an AI response for a business."""
    raw_lower = raw.lower()
    biz_lower = business_name.lower()

    mentioned = biz_lower in raw_lower

    # Determine mention position
    position = None
    if mentioned:
        idx = raw_lower.index(biz_lower)
        ratio = idx / max(len(raw_lower), 1)
        if ratio < 0.25:
            position = "first"
        elif ratio < 0.6:
            position = "middle"
        else:
            position = "last"

    # Simple sentiment heuristic
    positive_words = ["recommend", "great", "excellent", "best", "top", "love", "favorite", "solid", "strong"]
    negative_words = ["avoid", "poor", "bad", "worst", "disappointing", "overpriced"]
    pos_count = sum(1 for w in positive_words if w in raw_lower)
    neg_count = sum(1 for w in negative_words if w in raw_lower)

    if not mentioned:
        sentiment = "not_mentioned"
    elif pos_count > neg_count:
        sentiment = "positive"
    elif neg_count > pos_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Score heuristic
    score = 0
    if mentioned:
        score += 40
        if position == "first":
            score += 30
        elif position == "middle":
            score += 15
        else:
            score += 5
        if sentiment == "positive":
            score += 20
        elif sentiment == "neutral":
            score += 10
        score += min(10, pos_count * 3)
    score = min(100, score)

    return {
        "score": score,
        "mentioned": mentioned,
        "mentionPosition": position,
        "sentiment": sentiment,
        "priceAccuracy": "not_checked",
        "hallucinationFlags": [],
    }


def _build_explanation(analysis: dict, platform: str) -> str:
    if not analysis["mentioned"]:
        return (
            f"Your brand was not mentioned in the {platform} response. "
            "Competitors may be dominating this query space."
        )
    parts = [f"Brand was mentioned (position: {analysis['mentionPosition']})."]
    if analysis["sentiment"] == "positive":
        parts.append("Sentiment was positive.")
    elif analysis["sentiment"] == "neutral":
        parts.append("Sentiment was neutral.")
    else:
        parts.append("Sentiment was negative — review your product positioning.")
    return " ".join(parts)


# ── Main entry point ─────────────────────────────────────────────────────────
def run_visibility_for_query(query: str, business_name: str = "Solebound") -> dict:
    """
    Run visibility test across all platforms. Uses cache, falls back to dummy.
    Returns the platforms dict with per-platform results.
    """
    results: dict[str, dict] = {}

    def _run_single(platform: str, caller):
        # Check cache first
        cached = _get_cached(platform, query)
        if cached:
            return platform, cached, False

        try:
            raw_result = caller(query)
            analysis = _analyze_response(raw_result["rawResponse"], business_name)
            combined = {
                **analysis,
                "explanation": _build_explanation(analysis, platform),
                "rawResponse": raw_result["rawResponse"],
                "model": raw_result["model"],
                "latencyMs": raw_result["latencyMs"],
            }
            _set_cached(platform, query, combined)
            logger.info("AI CALL SUCCESS: %s (%dms) for '%s'", platform, raw_result["latencyMs"], query)
            return platform, combined, False
        except Exception as e:
            logger.warning("AI CALL FAILED: %s — %s. Using fallback.", platform, str(e))
            return platform, None, True

    # Run all 3 in parallel with ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(_run_single, name, caller): name
            for name, caller in PLATFORM_CALLERS.items()
        }
        for future in as_completed(futures):
            platform, result, used_fallback = future.result()
            if result:
                results[platform] = result
            else:
                # This platform's result will be filled from dummy data by caller
                results[platform] = None

    return results


def has_api_keys() -> bool:
    """Check if any AI API keys are configured."""
    return any(
        os.getenv(k)
        for k in ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"]
    )
