import React from "react";
import {
  getBezierPath,
  getEdgeCenter,
} from "react-flow-renderer";

import "./css/buttonedge.css";

export default function removeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd
}) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  const foreignObjectSize = 40;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div xmlns="http://www.w3.org/1999/xhtml">
          {/* <button
            className="edgebutton"
            onClick={event => onEdgeClick(event, id)}
          >
            <Delete sx={{ width: "12px", height: "12px", color: "#0000FF" }} />
          </button> */}
        </div>
      </foreignObject>
    </>
  );
}
