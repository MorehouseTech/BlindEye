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

export async function fetchMetrics(): Promise<InsightsMetrics> {
  const { data } = await client.get<InsightsMetrics>("/insights/metrics");
  return data;
}

export async function fetchPipeline(): Promise<InsightsPipeline> {
  const { data } = await client.get<InsightsPipeline>("/insights/pipeline");
  return data;
}
