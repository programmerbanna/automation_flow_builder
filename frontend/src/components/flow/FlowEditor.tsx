"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";
import ActionNode from "./nodes/ActionNode";
import DelayNode from "./nodes/DelayNode";
import ConditionNode from "./nodes/ConditionNode";
import AddNodeEdge from "./AddNodeEdge";
import { automationApi } from "@/lib/api";
import {
  AutomationNode,
  AutomationEdge,
  NodeType,
  AutomationNodeData,
  ConditionNodeData,
  ConditionRule,
} from "@/types/flow";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
};

const edgeTypes = {
  add: AddNodeEdge,
};

interface FlowEditorProps {
  initialData?: {
    _id?: string;
    name: string;
    nodes: AutomationNode[];
    edges: AutomationEdge[];
  };
}

const FlowInner = ({ initialData }: FlowEditorProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  useReactFlow();
  const [name, setName] = useState(initialData?.name || "");
  const [nodes, setNodes, onNodesChange] = useNodesState<AutomationNode>(
    initialData?.nodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<AutomationEdge>(
    initialData?.edges || [],
  );
  const [saving, setSaving] = useState(false);
  const [insertConfig, setInsertConfig] = useState<{
    edgeId: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<
    { nodes: AutomationNode[]; edges: AutomationEdge[] }[]
  >([]);
  const redoRef = useRef<
    { nodes: AutomationNode[]; edges: AutomationEdge[] }[]
  >([]);

  // Sync data changes from custom nodes
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: AutomationNodeData) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? ({ ...n, data: newData } as AutomationNode) : n,
        ),
      );
    },
    [setNodes],
  );

  // Handler for addition - uses screen coordinates for menu positioning
  const onAddNodeClick = useCallback(
    (edgeId: string, screenX: number, screenY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setInsertConfig({
        edgeId,
        x: screenX - rect.left,
        y: screenY - rect.top,
      });
    },
    [],
  );

  // Helper to re-inject functions lost during JSON snapshotting
  const rehydrate = useCallback(
    (nds: AutomationNode[], eds: AutomationEdge[]) => {
      return {
        cleanNodes: nds.map((n) => ({
          ...n,
          data: { ...n.data, onChange: onNodeDataChange },
        })),
        cleanEdges: eds.map((e) => ({
          ...e,
          data: { onAddNode: onAddNodeClick },
        })),
      };
    },
    [onNodeDataChange, onAddNodeClick],
  );

  const takeSnapshot = useCallback(() => {
    historyRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
    redoRef.current = []; // Clear redo on new action
  }, [nodes, edges]);

  const undo = useCallback(() => {
    const lastState = historyRef.current.pop();
    if (lastState) {
      redoRef.current.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
      const { cleanNodes, cleanEdges } = rehydrate(
        lastState.nodes,
        lastState.edges,
      );
      setNodes(cleanNodes);
      setEdges(cleanEdges);
    }
  }, [nodes, edges, setNodes, setEdges, rehydrate]);

  const redo = useCallback(() => {
    const nextState = redoRef.current.pop();
    if (nextState) {
      historyRef.current.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
      const { cleanNodes, cleanEdges } = rehydrate(
        nextState.nodes,
        nextState.edges,
      );
      setNodes(cleanNodes);
      setEdges(cleanEdges);
    }
  }, [nodes, edges, setNodes, setEdges, rehydrate]);

  const insertNode = useCallback(
    (type: NodeType) => {
      if (!insertConfig) return;
      takeSnapshot();

      const edge = edges.find((e) => e.id === insertConfig.edgeId);
      if (!edge) return;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const newNodeId = `${type}-${Date.now()}`;
      const newNode: AutomationNode = {
        id: newNodeId,
        type,
        position: {
          x: (sourceNode.position.x + targetNode.position.x) / 2,
          y: sourceNode.position.y + 150,
        },
        data:
          type === "action"
            ? { message: "", onChange: onNodeDataChange }
            : type === "delay"
              ? {
                  delayType: "relative",
                  relativeValue: 10,
                  relativeUnit: "minutes",
                  onChange: onNodeDataChange,
                }
              : {
                  rules: [
                    {
                      field: "email",
                      operator: "equals",
                      value: "",
                      join: "AND",
                    },
                  ],
                  onChange: onNodeDataChange,
                },
      };

      if (type === "condition") {
        const trueEdge: AutomationEdge = {
          id: `e-${newNodeId}-TRUE-${edge.target}`,
          source: newNodeId,
          sourceHandle: "TRUE",
          target: edge.target,
          label: "TRUE",
          type: "add",
          data: { onAddNode: onAddNodeClick },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        };
        const falseEdge: AutomationEdge = {
          id: `e-${newNodeId}-FALSE-${nodes.find((n) => n.type === "end")?.id || edge.target}`,
          source: newNodeId,
          sourceHandle: "FALSE",
          target: nodes.find((n) => n.type === "end")?.id || edge.target,
          label: "FALSE",
          type: "add",
          data: { onAddNode: onAddNodeClick },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" },
        };
        const toCondition: AutomationEdge = {
          id: `e-${edge.source}-${newNodeId}`,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: newNodeId,
          type: "add",
          data: { onAddNode: onAddNodeClick },
          label: edge.label,
          markerEnd: edge.markerEnd,
        };
        setNodes((nds) => [...nds, newNode] as AutomationNode[]);
        setEdges(
          (eds) =>
            [
              ...eds.filter((e) => e.id !== edge.id),
              toCondition,
              trueEdge,
              falseEdge,
            ] as AutomationEdge[],
        );
      } else {
        const edge1: AutomationEdge = {
          id: `e-${edge.source}-${newNodeId}`,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: newNodeId,
          type: "add",
          data: { onAddNode: onAddNodeClick },
          label: edge.label,
          markerEnd: edge.markerEnd,
        };
        const edge2: AutomationEdge = {
          id: `e-${newNodeId}-${edge.target}`,
          source: newNodeId,
          target: edge.target,
          type: "add",
          data: { onAddNode: onAddNodeClick },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        };
        setNodes((nds) => [...nds, newNode] as AutomationNode[]);
        setEdges(
          (eds) =>
            [
              ...eds.filter((e) => e.id !== edge.id),
              edge1,
              edge2,
            ] as AutomationEdge[],
        );
      }

      setInsertConfig(null);
    },
    [
      insertConfig,
      edges,
      nodes,
      onNodeDataChange,
      onAddNodeClick,
      setNodes,
      setEdges,
      takeSnapshot,
    ],
  );

  // Ensure fresh handlers on all nodes/edges
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, onChange: onNodeDataChange },
      })),
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, data: { onAddNode: onAddNodeClick } })),
    );
  }, [onNodeDataChange, onAddNodeClick, setNodes, setEdges]);

  // Global Keyboard Listener for CTRL+Z and CTRL+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === "z";
      const isY = e.key.toLowerCase() === "y";
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && isZ) {
        e.preventDefault();
        undo();
      } else if (isMod && isY) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      const sourceNode = nodes.find((n) => n.id === params.source);
      const newEdge: AutomationEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: "add",
        data: { onAddNode: onAddNodeClick },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
      };

      if (sourceNode?.type === "condition") {
        newEdge.label = params.sourceHandle as string;
        if (typeof newEdge.markerEnd === "object") {
          newEdge.markerEnd.color =
            params.sourceHandle === "TRUE" ? "#10b981" : "#f43f5e";
        }
      }

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, onAddNodeClick, setEdges, takeSnapshot],
  );

  const onReconnect = useCallback(
    (oldEdge: AutomationEdge, newConnection: Connection) => {
      takeSnapshot();
      const sourceNode = nodes.find((n) => n.id === newConnection.source);

      setEdges((els) => {
        const updatedEdges = reconnectEdge(oldEdge, newConnection, els);
        return updatedEdges.map((e) => {
          if (
            e.source === newConnection.source &&
            sourceNode?.type === "condition"
          ) {
            return {
              ...e,
              label: e.sourceHandle as string,
              markerEnd:
                typeof e.markerEnd === "object"
                  ? {
                      ...e.markerEnd,
                      color: e.sourceHandle === "TRUE" ? "#10b981" : "#f43f5e",
                    }
                  : e.markerEnd,
            };
          }
          return e as AutomationEdge;
        });
      });
    },
    [nodes, setEdges, takeSnapshot],
  );

  const onNodesDelete = useCallback(
    (deleted: AutomationNode[]) => {
      takeSnapshot();
      deleted.forEach((node) => {
        const incoming = edges.filter((e) => e.target === node.id);
        const outgoing = edges.filter((e) => e.source === node.id);

        if (incoming.length > 0 && outgoing.length > 0) {
          // Reconnect all incoming edges to the first outgoing edge's target
          const targetId = outgoing[0].target;

          const healingEdges = incoming.map((inEdge) => {
            const newEdge: AutomationEdge = {
              id: `e-${inEdge.source}-${targetId}-${Date.now()}-${Math.random()}`,
              source: inEdge.source,
              sourceHandle: inEdge.sourceHandle,
              target: targetId,
              type: "add",
              data: { onAddNode: onAddNodeClick },
              label: inEdge.label, // Keep labeling
              markerEnd: inEdge.markerEnd, // Keep colors
            };
            return newEdge;
          });

          setEdges((eds) => [
            ...eds.filter(
              (e) =>
                !deleted.some((d) => d.id === e.source || d.id === e.target),
            ),
            ...healingEdges,
          ]);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edges, nodes, onAddNodeClick, setEdges, takeSnapshot],
  );

  const validate = () => {
    if (!name.trim()) return "Automation name is required";
    for (const node of nodes) {
      if (node.type === "action" && !node.data.message)
        return `Message missing in Action node`;
      if (
        node.type === "condition" &&
        (!(node.data as ConditionNodeData).rules ||
          (node.data as ConditionNodeData).rules.some(
            (r: ConditionRule) => !r.value,
          ))
      )
        return `Invalid rules in Condition node`;
    }
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) return showToast(err, "warning");
    setSaving(true);
    try {
      // Auto-repair condition edges if labels are missing
      const repairedEdges = edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (
          sourceNode?.type === "condition" &&
          (!edge.label || edge.label !== edge.sourceHandle)
        ) {
          console.log(
            `🔧 Repairing edge ${edge.id}: Setting label to ${edge.sourceHandle}`,
          );
          return {
            ...edge,
            label: edge.sourceHandle,
            markerEnd:
              typeof edge.markerEnd === "object"
                ? {
                    ...edge.markerEnd,
                    color: edge.sourceHandle === "TRUE" ? "#10b981" : "#f43f5e",
                  }
                : edge.markerEnd,
          };
        }
        return edge;
      });

      // Front-end Pre-save Validation Debugger
      const conditionNodes = nodes.filter((n) => n.type === "condition");
      for (const node of conditionNodes) {
        const outgoing = repairedEdges.filter((e) => e.source === node.id);
        const hasTrue = outgoing.some((e) => e.label === "TRUE");
        const hasFalse = outgoing.some((e) => e.label === "FALSE");

        console.log(`🔍 Debugging Condition Node ${node.id}:`, {
          outgoingCount: outgoing.length,
          hasTrue,
          hasFalse,
          outgoingEdges: outgoing.map((e) => ({
            id: e.id,
            label: e.label,
            handle: e.sourceHandle,
          })),
        });

        if (outgoing.length !== 2 || !hasTrue || !hasFalse) {
          setSaving(false);
          return showToast(
            `Condition node ${node.id} must have exactly one TRUE and one FALSE edge.`,
            "error",
          );
        }
      }

      const payload = {
        name,
        nodes: nodes.map(({ data: _data, ...n }) => ({
          ...n,
          data: { ...(_data as Record<string, unknown>), onChange: undefined },
        })),
        edges: repairedEdges.map((e) => ({
          ...e,
          data: e.data ? { ...e.data, onAddNode: undefined } : undefined,
        })),
      };

      if (initialData?._id)
        await automationApi.update(initialData._id, payload);
      else await automationApi.create(payload);
      showToast("Automation saved successfully!", "success");
      router.push("/automations");
    } catch (err: unknown) {
      console.error("❌ Save Error:", err);
      const message =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || err.message
          : "Save failed";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xl font-bold outline-none border-b-2 border-transparent focus:border-indigo-600 text-slate-900 placeholder-slate-400"
          placeholder="Automation Name"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold"
        >
          {saving ? "Saving..." : "Save Automation"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
        </ReactFlow>

        {insertConfig && (
          <div
            className="absolute z-100 bg-white shadow-2xl border border-slate-200 rounded-xl p-3 flex flex-col gap-2 min-w-45"
            style={{ left: insertConfig.x, top: insertConfig.y }}
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center pb-2 border-b border-slate-100">
              Add Step
            </p>
            <button
              onClick={() => insertNode("action")}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 transition-colors text-left"
            >
              <span className="text-sm font-bold">Action Node</span>
            </button>
            <button
              onClick={() => insertNode("delay")}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 transition-colors text-left"
            >
              <span className="text-sm font-bold">Delay Node</span>
            </button>
            <button
              onClick={() => insertNode("condition")}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 transition-colors text-left"
            >
              <span className="text-sm font-bold">Condition Node</span>
            </button>
            <button
              onClick={() => setInsertConfig(null)}
              className="mt-2 py-2 text-[10px] font-extrabold text-slate-400 hover:text-rose-600 uppercase tracking-widest border-t border-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FlowEditor = (props: FlowEditorProps) => (
  <ReactFlowProvider>
    <FlowInner {...props} />
  </ReactFlowProvider>
);

export default FlowEditor;
