// Central axios instance pointing to local Flask backend.
// Includes retry logic, timeouts, and fallback console reporting.
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15_000, // 15s timeout for all requests
});

// Retry interceptor — retries failed requests once on network/5xx errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Only retry once, and only for GET requests or idempotent failures
    if (
      config &&
      !config._retried &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        (error.response && error.response.status >= 500))
    ) {
      config._retried = true;
      console.log(
        `[BlindEye] Retrying ${config.method?.toUpperCase()} ${config.url} (reason: ${error.code || error.response?.status})`,
      );
      return client(config);
    }

    // Log all final failures for debugging
    const url = config?.url ?? "unknown";
    const status = error.response?.status ?? "network error";
    console.log(`[BlindEye] API call failed: ${url} — status: ${status}`);

    return Promise.reject(error);
  },
);

export default client;
