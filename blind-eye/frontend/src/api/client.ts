// Central axios instance pointing to local Flask backend.
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

const client = axios.create({
  baseURL: API_BASE,
});

export default client;
