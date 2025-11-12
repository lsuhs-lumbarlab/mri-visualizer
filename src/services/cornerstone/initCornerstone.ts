import { init as csRenderInit } from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';

let isInitialized = false;

export async function initCornerstone(): Promise<void> {
  if (isInitialized) {
    console.log('Cornerstone already initialized');
    return;
  }

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
    throw error;
  }
}