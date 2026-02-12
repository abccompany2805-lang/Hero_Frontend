import axios from "axios";
import API_BASE_URL from "./config";

/**
 * LOGIN API
 * Role-based login handled in frontend
 * Backend: POST /api/users/login
 */
export const loginUser = (payload) => {
  return axios.post(`${API_BASE_URL}/api/users/login`, payload);
};
