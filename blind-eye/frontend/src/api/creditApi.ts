import client from "./client";

export interface CreditScoreReport {
  overallCreditScore?: number;
  overallExplanation?: string;
  recommendations?: string[];
  scoreBreakdown?: {
    engagementScore?: number;
    conversionScore?: number;
    customerRetentionScore?: number;
    visibilityScore?: number;
    seoOptimizationScore?: number;
    contentQualityScore?: number;
  };
  trend?: {
    previousScore?: number;
    change?: number;
    direction?: string;
  };
}

export interface CreditScoreApiResponse {
  creditScoreReport?: CreditScoreReport;
}

export interface CreditEvent {
  event_id: number;
  business_id: number;
  amount: number;
  event_time: string;
}

export interface CreditGraphResponse {
  result: number;
  result_list: CreditEvent[];
}

const FALLBACK_CREDIT: CreditScoreApiResponse = {
  creditScoreReport: {
    overallCreditScore: 71,
    overallExplanation: "Your AI visibility is moderate. Strong presence on Claude, but gaps on Gemini. Offline fallback data.",
    recommendations: [
      "Improve SEO metadata for key product pages",
      "Add structured data markup for products",
      "Create content targeting competitor keywords",
    ],
    scoreBreakdown: {
      engagementScore: 78,
      conversionScore: 65,
      customerRetentionScore: 72,
      visibilityScore: 58,
      seoOptimizationScore: 80,
      contentQualityScore: 75,
    },
    trend: { previousScore: 67, change: 4, direction: "up" },
  },
};

const FALLBACK_GRAPH: CreditGraphResponse = {
  result: 71,
  result_list: [
    { event_id: 1, business_id: 1, amount: 15, event_time: "2026-02-01" },
    { event_id: 2, business_id: 1, amount: 12, event_time: "2026-02-08" },
    { event_id: 3, business_id: 1, amount: 18, event_time: "2026-02-15" },
    { event_id: 4, business_id: 1, amount: 10, event_time: "2026-02-22" },
    { event_id: 5, business_id: 1, amount: 16, event_time: "2026-03-01" },
  ],
};

export async function fetchCreditScore(): Promise<CreditScoreApiResponse> {
  try {
    const { data } = await client.get<CreditScoreApiResponse>("/credit/score");
    return data;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline credit score data");
    return FALLBACK_CREDIT;
  }
}

export async function fetchCreditGraph(businessId: string): Promise<CreditGraphResponse> {
  try {
    const { data } = await client.post<CreditGraphResponse>("/credit/graph", {
      business_id: businessId,
    });
    return data;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline credit graph data");
    return FALLBACK_GRAPH;
  }
}
