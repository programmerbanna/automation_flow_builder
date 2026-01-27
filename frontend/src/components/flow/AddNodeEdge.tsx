import React, { memo } from "react";
import {
  getBezierPath,
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";

const AddNodeEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { getEdge } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const onAddClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const edge = getEdge(id);
    if (edge?.data?.onAddNode) {
      // Pass the screen coordinates to position the menu correctly
      (edge.data.onAddNode as (id: string, x: number, y: number) => void)(
        id,
        evt.clientX,
        evt.clientY,
      );
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all shadow-lg group z-50"
            onClick={onAddClick}
            title="Insert step here"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-indigo-500 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(AddNodeEdge);
