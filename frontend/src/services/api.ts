/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import axios from "axios";
import { getAuthToken } from "../context/AuthContext";

const api = axios.create({
  baseURL: "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;