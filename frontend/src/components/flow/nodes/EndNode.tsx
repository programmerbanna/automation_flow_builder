import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const EndNode = () => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-slate-50 border-2 border-slate-300 w-32 text-center">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-slate-400 border-2 border-white"
      />
      <div className="font-bold text-slate-400 uppercase text-xs tracking-wider">End</div>
      <div className="text-sm font-semibold text-slate-500">Flow Stop</div>
    </div>
  );
};

export default memo(EndNode);
