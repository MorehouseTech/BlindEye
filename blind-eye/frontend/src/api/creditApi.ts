import client from "./client";

export async function getCreditScoreGraph(business_id: string) {
  const response = await client.post("/getCreditScoreGraph", {
    business_id
  });

  return response.data;
}