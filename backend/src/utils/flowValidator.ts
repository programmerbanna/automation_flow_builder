import { IAutomation, FlowNode, FlowEdge } from "../types";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates the automation flow graph
 */
export const validateFlow = (automation: IAutomation): ValidationResult => {
  const { nodes, edges } = automation;

  // 1) Exactly one Start node and one End node
  const startNodes = nodes.filter((n) => n.type === "start");
  const endNodes = nodes.filter((n) => n.type === "end");

  if (startNodes.length !== 1) {
    return { isValid: false, message: "Automation must have exactly one Start node" };
  }
  if (endNodes.length !== 1) {
    return { isValid: false, message: "Automation must have exactly one End node" };
  }

  const startNode = startNodes[0];
  const endNode = endNodes[0];

  // 2) Start node must have exactly one outgoing edge
  const startOutgoing = edges.filter((e) => e.source === startNode.id);
  if (startOutgoing.length !== 1) {
    return { isValid: false, message: "Start node must have exactly one outgoing edge" };
  }

  // 3) End node must have zero outgoing edges
  const endOutgoing = edges.filter((e) => e.source === endNode.id);
  if (endOutgoing.length !== 0) {
    return { isValid: false, message: "End node cannot have outgoing edges" };
  }

  // 6) Condition nodes must have exactly one TRUE and one FALSE edge
  const conditionNodes = nodes.filter((n) => n.type === "condition");
  for (const node of conditionNodes) {
    const outgoing = edges.filter((e) => e.source === node.id);
    const hasTrue = outgoing.some((e) => (e as any).label === "TRUE");
    const hasFalse = outgoing.some((e) => (e as any).label === "FALSE");

    if (outgoing.length !== 2 || !hasTrue || !hasFalse) {
      return {
        isValid: false,
        message: `Condition node ${node.id} must have exactly one TRUE edge and one FALSE edge`,
      };
    }
  }

  // 7) Every non-End node must have at least one outgoing edge
  // AND Node Content Validation
  for (const node of nodes) {
    if (node.type !== "end") {
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasOutgoing) {
        return {
          isValid: false,
          message: `Node ${node.id} (${node.type}) is a dead end and must connect to another node`,
        };
      }
    }

    // New Content Checks
    if (node.type === "action" && !node.data?.message?.trim()) {
      return {
        isValid: false,
        message: `Action node ${node.id} is missing an email message`,
      };
    }

    if (node.type === "delay") {
      const d = node.data;
      if (!d?.delayType) {
        return { isValid: false, message: `Delay node ${node.id} missing delay type` };
      }
      if (d.delayType === "relative" && (!d.relativeValue || !d.relativeUnit)) {
        return {
          isValid: false,
          message: `Delay node ${node.id} must have a relative value and unit`,
        };
      }
      if (d.delayType === "absolute" && !d.absoluteDate) {
        return {
          isValid: false,
          message: `Delay node ${node.id} must have an absolute target date`,
        };
      }
    }

    if (node.type === "condition") {
      const rules = node.data?.rules || [];
      if (rules.length === 0) {
        return {
          isValid: false,
          message: `Condition node ${node.id} must have at least one rule`,
        };
      }
    }
  }

  // 4) Reachability and 5) Cycle Detection
  try {
    checkGraphIntegrity(nodes, edges, startNode.id);
  } catch (error) {
    return { isValid: false, message: (error as Error).message };
  }

  return { isValid: true };
};

/**
 * Traverse graph to detect reachability and cycles
 */
const checkGraphIntegrity = (nodes: FlowNode[], edges: FlowEdge[], startNodeId: string) => {
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const traverse = (nodeId: string) => {
    if (recStack.has(nodeId)) {
      throw new Error("Infinite loop detected in the automation flow");
    }
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      traverse(edge.target);
    }

    recStack.delete(nodeId);
  };

  traverse(startNodeId);

  // Check if all nodes were visited
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      throw new Error(`Node ${node.id} (${node.type}) is unreachable from the Start node`);
    }
  }
};
