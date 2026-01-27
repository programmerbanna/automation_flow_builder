import axios from "axios";
import { AutomationNode, AutomationEdge } from "@/types/flow";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Automation {
  _id: string;
  name: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export const automationApi = {
  // Get all automations
  getAll: () => api.get<ApiResponse<Automation[]>>("/automations"),

  // Get single automation
  getById: (id: string) =>
    api.get<ApiResponse<Automation>>(`/automations/${id}`),

  // Create automation
  create: (data: Partial<Automation>) =>
    api.post<ApiResponse<Automation>>("/automations", data),

  // Update automation
  update: (id: string, data: Partial<Automation>) =>
    api.put<ApiResponse<Automation>>(`/automations/${id}`, data),

  // Delete automation
  delete: (id: string) => api.delete<ApiResponse<null>>(`/automations/${id}`),

  // Trigger test run
  startTest: (id: string, email: string) =>
    api.post<ApiResponse<{ testRunId: string }>>(
      `/automations-test/${id}/test`,
      { email },
    ),

  // Get test run status
  getTestStatus: (testRunId: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/automations-test/${testRunId}`),
};

export default api;
