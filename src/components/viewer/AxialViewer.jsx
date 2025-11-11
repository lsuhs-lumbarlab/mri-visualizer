import React, { useEffect, useRef } from "react";
import {
  init as cs3dInit,
  RenderingEngine,
  Enums,
} from "@cornerstonejs/core";

export default function AxialViewer() {
  const divRef = useRef(null);

  useEffect(() => {
    async function initViewer() {
      // Initialize Cornerstone3D
      await cs3dInit();

      console.log("CornerstoneRender: using GPU rendering");

      const element = divRef.current;

      // Create a rendering engine
      const renderingEngineId = "axialEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      // Create a viewport for 2D rendering
      const viewportId = "axialViewport";
      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK, // 2D image stack viewer
        element,
        defaultOptions: {
          background: [0, 0, 0],
        },
      };

      // Enable the viewport
      renderingEngine.enableElement(viewportInput);

      console.log("Cornerstone3D initialized successfully!");
    }

    initViewer();
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        width: "512px",
        height: "512px",
        border: "1px solid #444",
        margin: "10px auto",
      }}
    />
  );
}
