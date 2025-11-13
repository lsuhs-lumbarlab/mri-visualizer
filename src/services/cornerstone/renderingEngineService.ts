import { RenderingEngine } from '@cornerstonejs/core';

let renderingEngine: RenderingEngine | null = null;
const RENDERING_ENGINE_ID = 'mainRenderingEngine';

export function getRenderingEngine(): RenderingEngine {
  if (!renderingEngine) {
    renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
  }
  return renderingEngine;
}

export function destroyRenderingEngine(): void {
  if (renderingEngine) {
    renderingEngine.destroy();
    renderingEngine = null;
  }
}