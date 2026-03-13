import client from "./client";

export interface MetricCard {
  value: number;
  unit: string;
  change: number;
  direction: string;
  label: string;
}

export interface InsightsMetrics {
  ctr: MetricCard;
  productionClicks: MetricCard;
  engagementRate: MetricCard;
  productionImpressions: MetricCard;
  audienceBreakdown: Record<string, number>;
  platformEngagement: Record<string, number>;
  keywordEngagement: Array<{ keyword: string; ctr: number }>;
}

export interface PipelineStep {
  name: string;
  description: string;
}

export interface InsightsPipeline {
  dataRefreshCycle: {
    label: string;
    type: string;
    lastScan: string;
    nextScan: string;
    bullets: string[];
  };
  visibilityPipeline: {
    label: string;
    signalsAnalyzed: string[];
  };
  pipelineSteps: PipelineStep[];
}

const FALLBACK_METRICS: InsightsMetrics = {
  ctr: { value: 4.2, unit: "%", change: 12, direction: "up", label: "Click-Through Rate" },
  productionClicks: { value: 1247, unit: "", change: 8, direction: "up", label: "Product Clicks" },
  engagementRate: { value: 6.8, unit: "%", change: 3, direction: "up", label: "Engagement Rate" },
  productionImpressions: { value: 29640, unit: "", change: 15, direction: "up", label: "Impressions" },
  audienceBreakdown: { "18-24": 28, "25-34": 35, "35-44": 22, "45+": 15 },
  platformEngagement: { ChatGPT: 42, Gemini: 31, Claude: 27 },
  keywordEngagement: [
    { keyword: "sustainable shoes", ctr: 5.2 },
    { keyword: "eco-friendly", ctr: 4.8 },
    { keyword: "recycled materials", ctr: 3.9 },
  ],
};

const FALLBACK_PIPELINE: InsightsPipeline = {
  dataRefreshCycle: {
    label: "Data Refresh Cycle",
    type: "Weekly automated scan",
    lastScan: "2026-03-10",
    nextScan: "2026-03-17",
    bullets: ["AI platform responses", "Consumer search patterns", "Engagement metrics"],
  },
  visibilityPipeline: {
    label: "Visibility Pipeline",
    signalsAnalyzed: ["Brand mentions", "Sentiment analysis", "Price accuracy", "Position tracking"],
  },
  pipelineSteps: [
    { name: "Data Collection", description: "Gather AI responses and user interactions" },
    { name: "Analysis", description: "Score visibility, sentiment, and accuracy" },
    { name: "Reporting", description: "Generate actionable insights and recommendations" },
  ],
};

export async function fetchMetrics(): Promise<InsightsMetrics> {
  try {
    const { data } = await client.get<InsightsMetrics>("/insights/metrics");
    return data;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline metrics data");
    return FALLBACK_METRICS;
  }
}

export async function fetchPipeline(): Promise<InsightsPipeline> {
  try {
    const { data } = await client.get<InsightsPipeline>("/insights/pipeline");
    return data;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline pipeline data");
    return FALLBACK_PIPELINE;
  }
}
