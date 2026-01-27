import React, { memo, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { AutomationNode, DelayNodeData } from "@/types/flow";
import { useModal } from "@/context/ModalContext";

const DelayNode = ({ data, id }: NodeProps<AutomationNode>) => {
  const delayData = data as DelayNodeData;
  const { deleteElements } = useReactFlow();
  const { confirm } = useModal();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "Remove Step",
      "Are you sure you want to remove this delay step?"
    );
    if (confirmed) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const updateData = useCallback(
    (newData: Partial<DelayNodeData>) => {
      if (delayData.onChange) {
        delayData.onChange(id, { ...delayData, ...newData });
      }
    },
    [delayData, id],
  );

  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-amber-100 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-amber-400"
      />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Delay
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

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-extrabold text-slate-600 uppercase block mb-1 tracking-tight">
            Type
          </label>
          <select
            value={delayData.delayType}
            onChange={(e) =>
              updateData({ delayType: e.target.value as "relative" | "absolute" })
            }
            className="nodrag w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none bg-slate-50 font-bold text-slate-800"
          >
            <option value="relative">Relative Delay</option>
            <option value="absolute">Specific Time</option>
          </select>
        </div>

        {delayData.delayType === "relative" ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-extrabold text-slate-600 uppercase mb-1 block tracking-tight">
                Value
              </label>
              <input
                type="number"
                min="1"
                value={delayData.relativeValue || ""}
                onChange={(e) =>
                  updateData({
                    relativeValue: parseInt(e.target.value) || undefined,
                  })
                }
                className="nodrag w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-600 uppercase mb-1 block tracking-tight">
                Unit
              </label>
              <select
                value={delayData.relativeUnit}
                onChange={(e) =>
                  updateData({
                    relativeUnit: e.target.value as
                      | "minutes"
                      | "hours"
                      | "days",
                  })
                }
                className="nodrag w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none bg-slate-50 font-bold text-slate-800"
              >
                <option value="minutes">Min</option>
                <option value="hours">Hrs</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-extrabold text-slate-600 uppercase mb-1 block tracking-tight">
              Pick Date/Time
            </label>
            <input
              type="datetime-local"
              value={delayData.absoluteDate || ""}
              onChange={(e) => updateData({ absoluteDate: e.target.value })}
              className="nodrag w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none font-bold text-slate-800"
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-amber-400"
      />
    </div>
  );
};

export default memo(DelayNode);
