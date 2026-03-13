import client from "./client";

export interface SuggestedQuery {
  id: number;
  query: string;
  searchVolume: number;
  category: string;
}

export interface HallucinationFlag {
  field: string;
  aiSaid: string;
  actual: string;
  severity: string;
}

export interface PlatformResult {
  score: number;
  explanation: string;
  mentioned: boolean;
  mentionPosition: string | null;
  sentiment: string;
  priceAccuracy: string;
  hallucinationFlags: HallucinationFlag[];
  rawResponse: string;
  model: string;
  latencyMs: number;
}

export interface VisibilityResult {
  testId: string;
  query: string;
  generatedAt: string;
  overallScore: number;
  overallExplanation: string;
  platforms: Record<string, PlatformResult>;
}

const FALLBACK_QUERIES: SuggestedQuery[] = [
  { id: 1, query: "Best sustainable running shoes under $150", searchVolume: 2840, category: "Running Shoes" },
  { id: 2, query: "Eco-friendly sneakers for everyday wear", searchVolume: 1620, category: "Casual Sneakers" },
  { id: 3, query: "Top rated organic cotton t-shirts", searchVolume: 1450, category: "Apparel" },
  { id: 4, query: "Best plant-based protein bars 2026", searchVolume: 3200, category: "Food & Beverage" },
];

export async function fetchSuggestedQueries(): Promise<SuggestedQuery[]> {
  try {
    const { data } = await client.get<{ queries: SuggestedQuery[] }>(
      "/visibility/suggested-queries",
    );
    return data.queries;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline suggested queries");
    return FALLBACK_QUERIES;
  }
}

export async function runVisibilityTest(
  query: string,
): Promise<VisibilityResult> {
  const { data } = await client.post<VisibilityResult>("/visibility/run", {
    query,
  });
  return data;
}
