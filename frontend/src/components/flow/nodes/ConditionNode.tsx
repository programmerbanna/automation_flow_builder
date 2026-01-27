import React, { memo, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { AutomationNode, ConditionNodeData, ConditionRule } from "@/types/flow";
import { useModal } from "@/context/ModalContext";

const ConditionNode = ({ data, id }: NodeProps<AutomationNode>) => {
  const condData = data as ConditionNodeData;
  const { deleteElements } = useReactFlow();
  const { confirm } = useModal();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "Remove Step",
      "Are you sure you want to remove this condition? All child branches will be disconnected."
    );
    if (confirmed) {
      deleteElements({ nodes: [{ id }] });
    }
  };
  const rules = condData.rules || [
    { field: "email", operator: "equals", value: "", join: "AND" },
  ];

  const updateRules = useCallback(
    (newRules: ConditionRule[]) => {
      if (condData.onChange) {
        condData.onChange(id, { ...condData, rules: newRules });
      }
    },
    [condData, id],
  );

  const addRule = (join: "AND" | "OR") => {
    const newRules = [
      ...rules,
      { field: "email", operator: "equals" as const, value: "", join },
    ];
    updateRules(newRules);
  };

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const newRules = rules.map((r: ConditionRule, i: number) =>
      i === index ? { ...r, ...updates } : r,
    );
    updateRules(newRules);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_: unknown, i: number) => i !== index);
    updateRules(newRules);
  };

  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-rose-100 min-w-[300px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-rose-400"
      />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-rose-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Condition
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

      <div className="space-y-3 mb-4">
        {rules.map((rule: ConditionRule, index: number) => (
          <div
            key={index}
            className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-2 relative group"
          >
            {index > 0 && (
              <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-indigo-600 text-[8px] font-bold text-white rounded uppercase shadow-sm">
                {rule.join}
              </div>
            )}

            <div className="flex items-center gap-2">
              <select
                className="flex-1 p-1.5 text-[10px] border border-slate-200 rounded bg-white font-bold outline-none text-slate-800"
                value={rule.operator}
                onChange={(e) =>
                  updateRule(index, {
                    operator: e.target.value as ConditionRule["operator"],
                  })
                }
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="includes">Includes</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
              </select>

              {index > 0 && (
                <button
                  onClick={() => removeRule(index)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Value (e.g. @gmail.com)"
              className="nodrag w-full p-1.5 text-[10px] border border-slate-200 rounded outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 placeholder-slate-400 font-bold"
              value={rule.value}
              onChange={(e) => updateRule(index, { value: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => addRule("AND")}
          className="flex-1 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors border border-slate-200"
        >
          + AND
        </button>
        <button
          onClick={() => addRule("OR")}
          className="flex-1 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors border border-slate-200"
        >
          + OR
        </button>
      </div>

      <div className="relative h-6 mt-4">
        <div className="absolute left-1/4 -bottom-3 text-center">
          <Handle
            type="source"
            position={Position.Bottom}
            id="TRUE"
            className="w-3 h-3 bg-emerald-500 border-2 border-white"
            style={{ left: "50%" }}
          />
          <span className="text-[9px] font-bold text-emerald-600 block mt-2">
            TRUE
          </span>
        </div>
        <div className="absolute right-1/4 -bottom-3 text-center">
          <Handle
            type="source"
            position={Position.Bottom}
            id="FALSE"
            className="w-3 h-3 bg-rose-500 border-2 border-white"
            style={{ left: "50%" }}
          />
          <span className="text-[9px] font-bold text-rose-600 block mt-2">
            FALSE
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(ConditionNode);
