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

export async function fetchCreditScore(): Promise<CreditScoreApiResponse> {
  const { data } = await client.get<CreditScoreApiResponse>("/credit/score");
  return data;
}

export async function fetchCreditGraph(businessId: string): Promise<CreditGraphResponse> {
  const { data } = await client.post<CreditGraphResponse>("/credit/graph", {
    business_id: businessId,
  });
  return data;
}
