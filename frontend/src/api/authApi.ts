import client from "./client";

export interface LoginResponse {
  success: boolean;
  role?: string;
  name?: string;
  error?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>("/auth/login", { username, password });
  return data;
}
