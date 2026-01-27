import React, { memo, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { AutomationNode, ActionNodeData } from "@/types/flow";
import { useModal } from "@/context/ModalContext";

const ActionNode = ({ data, id }: NodeProps<AutomationNode>) => {
  const actionData = data as ActionNodeData;
  const { deleteElements } = useReactFlow();
  const { confirm } = useModal();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "Remove Step",
      "Are you sure you want to remove this action step? This will break the connected flow."
    );
    if (confirmed) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (actionData.onChange) {
        actionData.onChange(id, { ...actionData, message: evt.target.value });
      }
    },
    [actionData, id],
  );

  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-indigo-100 min-w-50">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-indigo-400"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Action
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
          title="Remove step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-tight">
          Email Message
        </label>
        <textarea
          value={actionData.message}
          onChange={onChange}
          placeholder="Write email content..."
          className="nodrag w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-20 text-slate-800 placeholder-slate-400"
        />
        {!actionData.message && (
          <p className="text-[9px] text-rose-500 font-bold">
            Message is required
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-indigo-400"
      />
    </div>
  );
};

export default memo(ActionNode);
