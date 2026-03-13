import client from "./client";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
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
  mentionRate: number;
  mentionPosition: string | null;
  recommendationStrength: number;
  priceAccuracy: string;
  priceDelta: number | null;
  featureAccuracyScore: number;
  hallucinationFlags: HallucinationFlag[];
  brandSentiment: string;
  sentimentScore: number;
  shareOfVoice: number;
  competitorMentions: Record<string, number>;
  featureCoveragePct: number;
  categoryRelevanceScore: number;
  descriptionMatchScore: number;
  rawOutput?: {
    query: string;
    model: string;
    response: string;
    latencyMs: number;
  };
}

export interface VisibilityResult {
  testId: string;
  generatedAt: string;
  data: Array<
    | { overallScore: { msScore: number; msExplanation: string } }
    | Record<string, PlatformResult>
  >;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await client.get<{ products: Product[] }>("/visibility/products");
  return data.products;
}

export async function runVisibilityTest(productId: number): Promise<VisibilityResult> {
  const { data } = await client.post<VisibilityResult>("/visibility/run", {
    product_id: productId,
  });
  return data;
}
