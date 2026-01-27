import { Node, Edge } from "@xyflow/react";

export type NodeType = "start" | "end" | "action" | "delay" | "condition";

export interface BaseNodeData {
  onChange?: (id: string, data: AutomationNodeData) => void;
  [key: string]: unknown;
}

export interface ActionNodeData extends BaseNodeData {
  message: string;
}

export interface DelayNodeData extends BaseNodeData {
  delayType: "relative" | "absolute";
  relativeValue?: number;
  relativeUnit?: "minutes" | "hours" | "days";
  absoluteDate?: string;
}

export interface ConditionRule {
  field: string;
  operator: "equals" | "not_equals" | "includes" | "starts_with" | "ends_with";
  value: string;
  join?: "AND" | "OR";
}

export interface ConditionNodeData extends BaseNodeData {
  rules: ConditionRule[];
}

export type AutomationNodeData =
  | ActionNodeData
  | DelayNodeData
  | ConditionNodeData
  | (BaseNodeData & Record<string, unknown>);

export type AutomationNode = Node<AutomationNodeData, NodeType>;
export type AutomationEdge = Edge;

export interface AutomationPayload {
  name: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}
