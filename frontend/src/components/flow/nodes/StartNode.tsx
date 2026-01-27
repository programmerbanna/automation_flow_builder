import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const StartNode = () => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-slate-300 w-32 text-center">
      <div className="font-bold text-slate-500 uppercase text-xs tracking-wider">
        Start
      </div>
      <div className="text-sm font-semibold text-slate-800">Trigger</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-600 border-2 border-white"
      />
    </div>
  );
};

export default memo(StartNode);
