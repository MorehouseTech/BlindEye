from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import json
import httpx
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

feature3_input_data = {
    "testId": "test_abc123",
    "businessId": "biz_001",
    "productId": "prod_001",
    "generatedAt": "2026-03-12T14:00:00Z",
    "data": [
        {
            "overallScore": {
                "msScore": 71,
                "msExplanation": "Your brand appeared on 2 of 3 platforms with mostly accurate descriptions. One high-severity hallucination was detected on GPT inflating your price by $30. Sentiment was positive where mentioned. Visibility is growing but Gemini remains a blind spot."
            }
        },
        {
            "GPT": {
                "score": 58,
                "explanation": "Brand was mentioned once in the middle of the response. Price was reported incorrectly at $160 vs your actual $129.99. Features were partially accurate. Sentiment was neutral and the brand was not the primary recommendation.",
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "gpt-4o",
                    "response": "Some great options for sustainable running shoes include Allbirds Tree Dashers at $135, Brooks Ghost 15 at $140, and Solebound Apex Runner at $160 which features a recycled rubber sole and breathable mesh upper. Allbirds remains the most well-known option in this space for eco-conscious runners.",
                    "latencyMs": 1200,
                    "promptTokens": 42,
                    "completionTokens": 187
                },
                "mentionRate": 1,
                "mentionPosition": "middle",
                "recommendationStrength": 0.4,
                "priceAccuracy": "too_high",
                "priceDelta": 30.01,
                "featureAccuracyScore": 0.7,
                "availabilityAccurate": True,
                "hallucinationFlags": [
                    {
                        "field": "price",
                        "aiSaid": "$160",
                        "actual": "$129.99",
                        "severity": "high"
                    }
                ],
                "brandSentiment": "neutral",
                "sentimentScore": 0.55,
                "trustLanguagePresent": False,
                "descriptionTone": "neutral",
                "competitorMentions": {
                    "Allbirds": 2,
                    "Brooks": 1
                },
                "shareOfVoice": 0.25,
                "rankedAboveCompetitors": False,
                "recommendedOverCompetitors": False,
                "featureCoveragePct": 0.33,
                "categoryRelevanceScore": 0.85,
                "descriptionMatchScore": 0.61
            }
        },
        {
            "Claude": {
                "score": 91,
                "explanation": "Brand appeared first in the response and was the primary recommendation. Price and features were described accurately. Positive trust language was used and the brand was recommended over known competitors.",
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "claude-sonnet-4-6",
                    "response": "For sustainable running shoes under $150, I would recommend starting with Solebound's Apex Runner at $129.99. It uses fully recycled materials throughout, including a recycled rubber sole and breathable mesh upper, and comes in unisex sizing from 6 to 14. Allbirds Tree Dashers are also a solid option at $135 if you want a more established brand, but Solebound offers comparable sustainability at a lower price point.",
                    "latencyMs": 1050,
                    "promptTokens": 42,
                    "completionTokens": 203
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
                "competitorMentions": {
                    "Allbirds": 1
                },
                "shareOfVoice": 0.5,
                "rankedAboveCompetitors": True,
                "recommendedOverCompetitors": True,
                "featureCoveragePct": 0.67,
                "categoryRelevanceScore": 0.92,
                "descriptionMatchScore": 0.88
            }
        },
        {
            "Gemini": {
                "score": 0,
                "explanation": "Brand was not mentioned in any Gemini response across all generated queries. Competitors Allbirds and On Running were recommended instead. This is your biggest visibility gap.",
                "rawOutput": {
                    "query": "What are the best sustainable running shoes under $150?",
                    "model": "gemini-1.5-pro",
                    "response": "Here are some top picks for eco-friendly running shoes under $150: Allbirds Tree Dashers ($135) are made from renewable materials and are a fan favorite for casual and light running. On Running Cloudgo ($140) offers a solid sustainable option with their recycled material upper. New Balance Fresh Foam 1080 also has an eco-conscious line worth exploring in this price range.",
                    "latencyMs": 980,
                    "promptTokens": 42,
                    "completionTokens": 164
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
                "competitorMentions": {
                    "Allbirds": 3,
                    "On Running": 2
                },
                "shareOfVoice": 0,
                "rankedAboveCompetitors": False,
                "recommendedOverCompetitors": False,
                "featureCoveragePct": 0,
                "categoryRelevanceScore": 0,
                "descriptionMatchScore": 0
            }
        }
    ]
}

app = FastAPI(title="BOTB Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_dev_secret(x_dev_secret: Optional[str]) -> None:
    expected_secret = os.getenv("DEV_SECRET")
    if expected_secret and x_dev_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")

async def call_azure_chat(messages: list[dict]) -> dict:
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-04-01-preview")

    if not all([azure_endpoint, azure_api_key, azure_deployment]):
        raise HTTPException(status_code=500, detail="Missing Azure environment variables")

    request_url = f"{azure_endpoint.rstrip('/')}/openai/deployments/{azure_deployment}/chat/completions"
    request_params = {"api-version": azure_api_version}
    request_headers = {
        "Content-Type": "application/json",
        "api-key": azure_api_key,
    }
    request_body = {"messages": messages}

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            request_url,
            params=request_params,
            json=request_body,
            headers=request_headers,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

def extract_llm_text(azure_response: dict) -> str:
    return azure_response.get("choices", [{}])[0].get("message", {}).get("content", "")

def search_with_tavily(query: str) -> dict:
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    if not tavily_api_key:
        raise HTTPException(status_code=500, detail="Missing TAVILY_API_KEY")

    try:
        tavily_client = TavilyClient(api_key=tavily_api_key)
        return tavily_client.search(query)
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Tavily request failed: {str(error)}")

def build_search_context(search_response: dict, max_results: int = 5) -> tuple[str, list[str]]:
    results = search_response.get("results", [])[:max_results]

    source_urls = []
    context_sections = []

    for result in results:
        title = result.get("title", "")
        url = result.get("url", "")
        content = result.get("content", "")

        if url:
            source_urls.append(url)

        context_sections.append(
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content: {content}"
        )

    search_context = "\n\n---\n\n".join(context_sections)
    return search_context, source_urls

@app.get("/")
def root():
    return {"ok": True, "docs": "/docs"}

@app.get("/api/health")
def api_health_check():
    return {
        "ok": True,
        "service": "BOTB Backend",
        "feature": "creditScore",
        "feature3_input_loaded": bool(feature3_input_data),
        "business_id": feature3_input_data.get("businessId"),
        "product_id": feature3_input_data.get("productId"),
        "env": {
            "dev_secret_set": bool(os.getenv("DEV_SECRET")),
            "azure_endpoint_set": bool(os.getenv("AZURE_OPENAI_ENDPOINT")),
            "azure_api_key_set": bool(os.getenv("AZURE_OPENAI_API_KEY")),
            "azure_deployment_set": bool(os.getenv("AZURE_OPENAI_DEPLOYMENT")),
            "tavily_api_key_set": bool(os.getenv("TAVILY_API_KEY"))
        }
    }

@app.post("/api/creditScore")
async def generate_credit_score_report(x_dev_secret: Optional[str] = Header(default=None)):
    require_dev_secret(x_dev_secret)

    feature3_report = feature3_input_data
    business_id = feature3_report.get("businessId", "biz_001")
    product_id = feature3_report.get("productId", "prod_001")

    tavily_query = (
        f"{business_id} {product_id} AI search visibility SEO "
        f"ecommerce product discoverability metadata"
    )

    tavily_search_response = search_with_tavily(tavily_query)
    search_context, source_urls = build_search_context(tavily_search_response)

    expected_output_schema = """{
  "scoreId": "cred_001",
  "businessId": "biz_001",
  "weekOf": "2026-03-09",
  "overallCreditScore": 84,
  "scoreBreakdown": {
    "engagementScore": 88,
    "conversionScore": 81,
    "customerRetentionScore": 74,
    "visibilityScore": 86,
    "seoOptimizationScore": 79,
    "contentQualityScore": 90
  },
  "engagementMetrics": {
    "likes": 5400,
    "comments": 420,
    "shares": 190,
    "clickThroughRate": 0.14,
    "conversionRate": 0.06
  },
  "llmSearchMetrics": {
    "googleIndexed": true,
    "productPagesOptimized": true,
    "averageSearchRank": 12,
    "missingMetadataIssues": 3
  },
  "recommendations": [
    "Improve product metadata for search indexing",
    "Add clearer pricing information to product pages",
    "Use more category-specific tags in campaigns"
  ],
  "trend": {
    "previousScore": 78,
    "change": 6,
    "direction": "up"
  },
  "generatedAt": "2026-03-12T10:00:00Z"
}"""

    system_prompt = f"""
You are an AI service analyst for businesses.

Your task is to evaluate how well a business or product appears in LLM-powered search and recommendation systems.

Your primary input is the provided Feature 3 JSON data, which summarizes how GPT, Claude, and Gemini described, ranked, and recommended the product/business.

Use the Tavily web evidence only as supporting context for visibility, discoverability, SEO, and metadata quality.

Return ONLY valid JSON matching this exact schema:
{expected_output_schema}

Scoring guidance:
- overallCreditScore should be a balanced 0-100 score
- visibilityScore should heavily reflect mention rate, share of voice, recommendation strength, and whether the business appears across LLMs
- seoOptimizationScore should reflect search discoverability, metadata quality, and product page optimization based on the web evidence
- contentQualityScore should reflect description accuracy, sentiment, hallucination rate, and feature coverage
- engagementScore, conversionScore, and customerRetentionScore may be estimated conservatively if direct evidence is weak
- recommendations must be specific, mention how a business owner could improve their results across ChatGPT, Gemini, and Claude, be at least 2 sentences for every LLM model include a concluding sentence
- trend should be internally consistent

Return ONLY JSON.
No markdown.
No explanation outside the JSON.
""".strip()

    llm_messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": (
                f"Feature 3 JSON input:\n{json.dumps(feature3_report, indent=2)}\n\n"
                f"Tavily web evidence:\n{search_context}\n\n"
                f"Source URLs:\n" + "\n".join(source_urls)
            ),
        },
    ]

    raw_llm_response = await call_azure_chat(llm_messages)
    llm_output_text = extract_llm_text(raw_llm_response)

    try:
        parsed_credit_score_report = json.loads(llm_output_text)
    except json.JSONDecodeError:
        parsed_credit_score_report = {
            "scoreId": "parse_error",
            "businessId": business_id,
            "weekOf": "",
            "overallCreditScore": 0,
            "scoreBreakdown": {
                "engagementScore": 0,
                "conversionScore": 0,
                "customerRetentionScore": 0,
                "visibilityScore": 0,
                "seoOptimizationScore": 0,
                "contentQualityScore": 0
            },
            "engagementMetrics": {
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "clickThroughRate": 0.0,
                "conversionRate": 0.0
            },
            "llmSearchMetrics": {
                "googleIndexed": False,
                "productPagesOptimized": False,
                "averageSearchRank": 0,
                "missingMetadataIssues": 0
            },
            "recommendations": [
                "The language model did not return valid JSON."
            ],
            "trend": {
                "previousScore": 0,
                "change": 0,
                "direction": "flat"
            },
            "generatedAt": "",
            "rawModelOutput": llm_output_text
        }

    return {
        "creditScoreReport": parsed_credit_score_report,
        "raw_llm": raw_llm_response,
        "raw_search": tavily_search_response,
    }