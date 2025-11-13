import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';

let isInitialized = false;

export const initCornerstone = () => {
  if (isInitialized) return;

  // External dependencies for cornerstoneWADOImageLoader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  // Configure cornerstoneWADOImageLoader
  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
      },
    },
  };

  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

  // Initialize cornerstoneTools
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.external.Hammer = Hammer;

  // Initialize tools
  cornerstoneTools.init({
    mouseEnabled: true,
    touchEnabled: true,
    globalToolSyncEnabled: false,
    showSVGCursors: false,
  });

  // Add common tools
  cornerstoneTools.addTool(cornerstoneTools.PanTool);
  cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
  cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);

  isInitialized = true;
  console.log('Cornerstone initialized successfully');
};

export const enableViewportTools = (element) => {
  // Set tool mode for the specific element
  cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 }); // Middle/Right click
  cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 }); // Right click
  cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }); // Left click
  cornerstoneTools.setToolActive('StackScrollMouseWheel', {});
};