"use client";

import FlowEditor from "@/components/flow/FlowEditor";
import { MarkerType } from "@xyflow/react";
import Link from "next/link";
import { AutomationNode, AutomationEdge } from "@/types/flow";

const DEFAULT_NODES: AutomationNode[] = [
  {
    id: "start-node",
    type: "start",
    position: { x: 250, y: 50 },
    data: {},
    deletable: false,
  },
  {
    id: "end-node",
    type: "end",
    position: { x: 250, y: 350 },
    data: {},
    deletable: false,
  },
];

const DEFAULT_EDGES: AutomationEdge[] = [
  {
    id: "e-start-end",
    source: "start-node",
    target: "end-node",
    type: "add",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
  },
];

export default function NewAutomationPage() {
  const initialData = {
    name: "Untitled Automation",
    nodes: DEFAULT_NODES,
    edges: DEFAULT_EDGES,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/automations"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Automation
        </h2>
      </div>

      <FlowEditor initialData={initialData} />
    </div>
  );
}
