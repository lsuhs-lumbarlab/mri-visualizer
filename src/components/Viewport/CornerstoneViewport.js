import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Box, Slider, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { enableViewportTools } from '../../services/cornerstoneInit';
import { ReferenceLines } from '../../services/referenceLines';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minWidth: '33%',
  },
  viewportWrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    color: '#fff',
    pointerEvents: 'none',
    fontSize: '12px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  },
  topLeft: {
    top: 5,
    left: 5,
  },
  topRight: {
    top: 5,
    right: 5,
    textAlign: 'right',
  },
  bottomLeft: {
    bottom: 5,
    left: 5,
  },
  bottomRight: {
    bottom: 5,
    right: 5,
    textAlign: 'right',
  },
  sliderContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  slider: {
    flex: 1,
  },
  title: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const CornerstoneViewport = forwardRef(({ 
  imageIds = [], 
  orientation = 'UNKNOWN',
  seriesDescription = '',
  referenceLinesEnabled = false,
  viewportData = {},
  onImageIndexChange
}, ref) => {
  const classes = useStyles();
  const viewportRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [viewportInfo, setViewportInfo] = useState({
    zoom: 1,
    windowWidth: 0,
    windowCenter: 0,
  });
  
  // Reference lines for this viewport
  const referenceLinesRefs = useRef({
    sagittal: new ReferenceLines(),
    axial: new ReferenceLines(),
    coronal: new ReferenceLines(),
  });

  // Store current image for reference lines
  const currentImageRef = useRef(null);

  // Redraw the current image to clear any previously drawn reference lines
  const clearReferenceLines = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    ReferenceLines.clearCanvas(canvas);
  };

  // Draw reference lines from a specific source
  const drawReferenceLinesFrom = (sourceOrientation) => {
    const element = viewportRef.current;
    if (!element || !currentImageRef.current || !referenceLinesEnabled) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const sourceData = viewportData[sourceOrientation];
    if (!sourceData || sourceData.imageIds.length === 0) return;

    // Load the current image from the source viewport
    const sourceImageId = sourceData.imageIds[sourceData.currentImageIndex || 0];
    if (!sourceImageId) return;

    cornerstone.loadImage(sourceImageId).then((sourceImage) => {
      const refLines = referenceLinesRefs.current[sourceOrientation];
      
      // Build reference lines from source to this destination
      const success = refLines.build(sourceImage, currentImageRef.current);
      
      if (success) {
        // Draw the reference lines
        refLines.draw(canvas, element);
      }
    }).catch(error => {
      // Silently fail - not all images may have proper metadata
    });
  };

  // Draw all reference lines for this viewport based on current viewportData
  const drawAllReferenceLines = () => {
    if (!referenceLinesEnabled) return;

    // Clear any existing reference lines before drawing new ones
    clearReferenceLines();

    const orientations = ['sagittal', 'axial', 'coronal'];
    const currentOrientation = orientation.toLowerCase();

    orientations.forEach(otherOrientation => {
      if (otherOrientation !== currentOrientation) {
        drawReferenceLinesFrom(otherOrientation);
      }
    });
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateReferenceLinesFromOther: () => {
      // Parent notifies that some viewport's slice changed; recompute all
      // incoming reference lines for this viewport from current viewportData.
      drawAllReferenceLines();
    }
  }));

  const updateViewportData = (element) => {
    try {
      const viewport = cornerstone.getViewport(element);
      const image = cornerstone.getImage(element);
      
      if (viewport && image) {
        setViewportInfo({
          zoom: viewport.scale.toFixed(2),
          windowWidth: Math.round(viewport.voi.windowWidth),
          windowCenter: Math.round(viewport.voi.windowCenter),
        });
      }
    } catch (error) {
      // Ignore errors during viewport updates
    }
  };

  const onImageRendered = (e) => {
    const element = e.target;
    updateViewportData(element);

    // Ensure overlay canvas matches the underlying image canvas size
    const baseCanvas = element.querySelector('canvas');
    const overlayCanvas = overlayCanvasRef.current;
    if (baseCanvas && overlayCanvas) {
      overlayCanvas.width = baseCanvas.width;
      overlayCanvas.height = baseCanvas.height;
    }
  };

  const onStackScroll = () => {
    const element = viewportRef.current;
    if (!element) return;

    const stackData = cornerstoneTools.getToolState(element, 'stack');
    if (stackData && stackData.data && stackData.data[0]) {
      const newIndex = stackData.data[0].currentImageIdIndex;
      setCurrentSlice(newIndex);
      
      // Load new image and update reference
      cornerstone.loadImage(imageIds[newIndex]).then((image) => {
        currentImageRef.current = image;
        
        // Notify parent of image index change
        if (onImageIndexChange) {
          onImageIndexChange(newIndex);
        }
      }).catch(error => {
        console.error('Error loading image:', error);
      });
    }
  };

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || imageIds.length === 0) return;

    // Enable the element for cornerstone
    cornerstone.enable(element);

    // Load the first image
    cornerstone.loadImage(imageIds[0]).then((image) => {
      currentImageRef.current = image;
      cornerstone.displayImage(element, image);

      // Set up the stack
      const stack = {
        currentImageIdIndex: 0,
        imageIds: imageIds,
      };
      cornerstoneTools.addStackStateManager(element, ['stack']);
      cornerstoneTools.addToolState(element, 'stack', stack);

      // Enable viewport tools
      enableViewportTools(element);

      // Update viewport data
      updateViewportData(element);

      // Listen to image rendered event
      element.addEventListener('cornerstoneimagerendered', onImageRendered);

      // Listen to stack scroll event
      element.addEventListener('cornerstonetoolsstackscroll', onStackScroll);
    }).catch(error => {
      console.error('Error initializing viewport:', error);
    });

    return () => {
      // Cleanup: Remove event listeners and disable element
      if (element) {
        element.removeEventListener('cornerstoneimagerendered', onImageRendered);
        element.removeEventListener('cornerstonetoolsstackscroll', onStackScroll);
        
        // Clear cornerstone element
        try {
          cornerstone.disable(element);
        } catch (error) {
          console.warn('Error disabling viewport:', error);
        }
      }
    };
  }, [imageIds]);

  // Redraw reference lines when enabled/disabled or viewport data changes
  useEffect(() => {
    if (referenceLinesEnabled && imageIds.length > 0 && currentImageRef.current) {
      drawAllReferenceLines();
    } else {
      clearReferenceLines();
    }
  }, [referenceLinesEnabled, viewportData]);

  const handleSliceChange = (event, newValue) => {
    const element = viewportRef.current;
    if (!element) return;

    const stackData = cornerstoneTools.getToolState(element, 'stack');
    if (stackData && stackData.data && stackData.data[0]) {
      stackData.data[0].currentImageIdIndex = newValue;
      cornerstone.loadImage(imageIds[newValue]).then((image) => {
        currentImageRef.current = image;
        cornerstone.displayImage(element, image);
        setCurrentSlice(newValue);
        
        // Notify parent of image index change
        if (onImageIndexChange) {
          onImageIndexChange(newValue);
        }
      }).catch(error => {
        console.error('Error changing slice:', error);
      });
    }
  };

  if (imageIds.length === 0) {
    return (
      <Paper className={classes.container}>
        <Box className={classes.title}>
          <Typography variant="subtitle2">
            {orientation} - {seriesDescription || 'No series loaded'}
          </Typography>
        </Box>
        <Box className={classes.viewportWrapper}>
          <Typography color="textSecondary">
            No images to display
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.container}>
      <Box className={classes.title}>
        <Typography variant="subtitle2">
          {orientation} - {seriesDescription}
        </Typography>
      </Box>
      
      <Box className={classes.viewportWrapper}>
        <div ref={viewportRef} className={classes.viewport} />

        {/* Reference lines overlay canvas */}
        <canvas ref={overlayCanvasRef} className={classes.viewport} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        
        {/* Overlays */}
        <Box className={`${classes.overlay} ${classes.topLeft}`}>
          <div>{orientation}</div>
          <div>{seriesDescription}</div>
        </Box>
        
        <Box className={`${classes.overlay} ${classes.bottomRight}`}>
          <div>Slice: {currentSlice + 1} / {imageIds.length}</div>
          <div>Zoom: {viewportInfo.zoom}</div>
          <div>W/L: {viewportInfo.windowWidth} / {viewportInfo.windowCenter}</div>
        </Box>
      </Box>

      {/* Slice Slider */}
      <Box className={classes.sliderContainer}>
        <Typography variant="caption">Slice:</Typography>
        <Slider
          className={classes.slider}
          value={currentSlice}
          min={0}
          max={imageIds.length - 1}
          onChange={handleSliceChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value + 1}/${imageIds.length}`}
        />
        <Typography variant="caption">
          {currentSlice + 1}/{imageIds.length}
        </Typography>
      </Box>
    </Paper>
  );
});

export default CornerstoneViewport;