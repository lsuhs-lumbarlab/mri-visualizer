import { init as csRenderInit } from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initCornerstone(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      await csRenderInit();
      console.log('Cornerstone Core initialized');

      await csToolsInit();
      console.log('Cornerstone Tools initialized');

      dicomImageLoaderInit({
        maxWebWorkers: navigator.hardwareConcurrency || 4,
      });
      console.log('DICOM Image Loader initialized and registered');

      isInitialized = true;
      console.log('Cornerstone initialization complete');
    } catch (error) {
      console.error('Failed to initialize Cornerstone:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}