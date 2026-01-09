import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';
import PelvicParameterTool from '../tools/PelvicParameterTool';

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

  // Register custom tools
  cornerstoneTools.addTool(PelvicParameterTool);

  isInitialized = true;
  console.log('Cornerstone initialized successfully');
};

export const enableViewportTools = (element) => {
  // Add tools to this specific element (makes them available but not active)
  cornerstoneTools.addToolForElement(element, cornerstoneTools.StackScrollMouseWheelTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool, {
    configuration: {
      invert: true,
      preventZoomOutsideImage: false,
      minScale: .1,
      maxScale: 20.0,
    }
  });
  cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.LengthTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.AngleTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.ArrowAnnotateTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.CobbAngleTool);
  cornerstoneTools.addToolForElement(element, PelvicParameterTool);
  
  // By default, only mouse wheel scrolling is active
  cornerstoneTools.setToolActiveForElement(element, 'StackScrollMouseWheel', {});
  
  console.log('Viewport tools enabled for element (scroll only by default):', element);
};