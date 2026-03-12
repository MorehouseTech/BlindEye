# AI Visibility engine — Feature 4.
# Runs a shopping query across ChatGPT and Gemini, collects responses,
# checks if the business brand is mentioned, and flags any hallucinations
# by comparing AI output against known product data.

import os
from dotenv import load_dotenv

load_dotenv()

def run_visibility_test(query: str, brand_name: str) -> dict:
    results = {}

    # TODO: call OpenAI API with query, parse response for brand mentions
    # TODO: call Gemini API with query, parse response for brand mentions
    # TODO: compare AI-returned product details against ground truth
    # TODO: flag hallucinations with severity score

    return {
        "query": query,
        "brand": brand_name,
        "results": results,
        "hallucinations": []
    }
