import { Document } from "mongoose";

// React Flow node type
export interface FlowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data?: Record<string, any>;
}

// React Flow edge type
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, any>;
}

// Automation document interface (MongoDB)
export interface IAutomation extends Document {
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// Request body types
export interface CreateAutomationRequest {
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface UpdateAutomationRequest {
  name?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

// Automation list item (minimal data)
export interface AutomationListItem {
  _id: string;
  name: string;
  createdAt: Date;
}
