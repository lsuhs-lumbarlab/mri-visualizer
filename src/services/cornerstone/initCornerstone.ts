import { init as csRenderInit } from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initCornerstone(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      // Initialize cornerstone core
      await csRenderInit();
      console.log('Cornerstone Core initialized');

      // Initialize cornerstone tools
      await csToolsInit();
      console.log('Cornerstone Tools initialized');

      isInitialized = true;
      console.log('Cornerstone initialization complete');
    } catch (error) {
      console.error('Failed to initialize Cornerstone:', error);
      initPromise = null; // Reset on error so it can be retried
      throw error;
    }
  })();

  return initPromise;
}