// Central axios instance. All API calls go through here.
// Automatically attaches the JWT token to every request.
import axios from "axios";

const client = axios.create({
  baseURL: "https://overcerebral-indicially-florencia.ngrok-free.dev"
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
}

export interface ModelReport {
  score?: number;
  explanation?: string;
  mentionRate?: number;
  shareOfVoice?: number;
  featureCoveragePct?: number;
}

export interface ModelReports {
  GPT?: ModelReport;
  Claude?: ModelReport;
  Gemini?: ModelReport;
}

export interface CreditScoreApiResponse {
  creditScoreReport?: CreditScoreReport;
  modelReports?: ModelReports;
  raw_llm?: unknown;
  raw_search?: unknown;
}

interface LegacyCreditScoreResponse {
  score?: number;
  explanation?: string;
}

export async function fetchCreditScore(): Promise<CreditScoreApiResponse> {
  const devSecret = "some-long-random-string"

  try {
    const { data } = await client.post<CreditScoreApiResponse>(
      "/api/creditScore",
      {},
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
           "x-dev-secret": devSecret,
        },
      }
    );


    return data;
  } catch {
    const { data } = await client.get<LegacyCreditScoreResponse>("/credit/score");

    return {
      creditScoreReport: {
        overallCreditScore:
          typeof data.score === "number" && Number.isFinite(data.score)
            ? data.score
            : undefined,
        overallExplanation: data.explanation,
      },
    };
  }
}

export default client;
