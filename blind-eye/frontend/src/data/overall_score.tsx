import {
	fetchCreditScore,
	type CreditScoreReport,
} from "../api/client";

export interface ScoreData {
	score: number;
	explanation: string;
}

const defaultScoreData: ScoreData = {
	score: 40,
	explanation: "No explanation available.",
};

function getOverallExplanation(report?: CreditScoreReport): string {
	if (!report) {
		return defaultScoreData.explanation;
	}

	if (
		typeof report.overallExplanation === "string" &&
		report.overallExplanation.trim().length > 0
	) {
		return report.overallExplanation.trim();
	}

	if (Array.isArray(report.recommendations)) {
		const cleanedRecommendations = report.recommendations
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (cleanedRecommendations.length > 0) {
			return cleanedRecommendations.join("\n");
		}
	}

	return defaultScoreData.explanation;
}

function toValidScore(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return null;
	}

	return parsed;
}

export async function getOverallScoreData(): Promise<ScoreData> {
	try {
		const response = await fetchCreditScore();
		const report = response.creditScoreReport;
		const score = toValidScore(report?.overallCreditScore) ?? defaultScoreData.score;

		return {
			score,
			explanation: getOverallExplanation(report),
		};
	} catch (error) {
		console.error("Unable to load credit score data", error);
		return defaultScoreData;
	}
}

export default defaultScoreData;

