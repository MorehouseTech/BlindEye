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

export async function fetchSuggestedQueries(): Promise<SuggestedQuery[]> {
  const { data } = await client.get<{ queries: SuggestedQuery[] }>(
    "/visibility/suggested-queries",
  );
  return data.queries;
}

export async function runVisibilityTest(
  query: string,
): Promise<VisibilityResult> {
  const { data } = await client.post<VisibilityResult>("/visibility/run", {
    query,
  });
  return data;
}
