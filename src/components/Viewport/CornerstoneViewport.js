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
    border: '1px solid transparent',
    transition: 'border-color 0.2s ease',
  },
  containerActive: {
    borderColor: '#ff0000 !important',
  },
  viewportWrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewportWrapperClickable: {
    cursor: 'pointer',
  },
  viewport: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    color: '#fff',
    pointerEvents: 'none',
    fontSize: '13px',
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
  topCenter: {
    top: 5,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '15px',
  },
  bottomCenter: {
    bottom: 5,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '15px',
  },
  leftCenter: {
    top: '50%',
    left: 5,
    transform: 'translateY(-50%)',
    fontSize: '15px',
  },
  rightCenter: {
    top: '50%',
    right: 5,
    transform: 'translateY(-50%)',
    fontSize: '15px',
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

const getDirectionalMarkers = (orientation) => {
  const orientationUpper = orientation.toUpperCase();
  
  switch (orientationUpper) {
    case 'SAGITTAL':
      return {
        top: 'S',
        bottom: 'I',
        left: 'A',
        right: 'P',
      };
    case 'AXIAL':
      return {
        top: 'A',
        bottom: 'P',
        left: 'R',
        right: 'L',
      };
    case 'CORONAL':
      return {
        top: 'S',
        bottom: 'I',
        left: 'R',
        right: 'L',
      };
    default:
      return {
        top: '',
        bottom: '',
        left: '',
        right: '',
      };
  }
};

const CornerstoneViewport = forwardRef(({ 
  imageIds = [], 
  orientation = 'UNKNOWN',
  seriesDescription = '',
  referenceLinesEnabled = false,
  viewportData = {},
  onImageIndexChange,
  isActive = false,
  onViewportClick,
  activeViewport = null,
  patientName = '',
  dateOfBirth = '',
  studyDate = '',
  studyTime = '',
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
  
  // NEW: Track the current drawing request to prevent race conditions
  const drawingRequestRef = useRef(0);

  const directionalMarkers = getDirectionalMarkers(orientation);

  // Redraw the current image to clear any previously drawn reference lines
  const clearReferenceLines = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Draw reference lines from a specific source
  const drawReferenceLinesFrom = (sourceOrientation, requestId) => {
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
      // NEW: Check if this drawing request is still valid
      if (requestId !== drawingRequestRef.current) {
        // A newer drawing request has been made, ignore this one
        return;
      }

      const refLines = referenceLinesRefs.current[sourceOrientation];
      
      // Build reference lines from source to this destination
      const success = refLines.build(sourceImage, currentImageRef.current);
      
      if (success) {
        // Check again before drawing (in case request changed during build)
        if (requestId === drawingRequestRef.current) {
          // Draw the reference lines
          refLines.draw(canvas, element);
        }
      }
    }).catch(error => {
      // Silently fail - not all images may have proper metadata
    });
  };

  // Draw reference lines only from the active viewport
  const drawAllReferenceLines = () => {
    // NEW: Increment request ID to invalidate any pending async operations
    drawingRequestRef.current += 1;
    const currentRequestId = drawingRequestRef.current;

    if (!referenceLinesEnabled) return;

    // Clear any existing reference lines before drawing new ones
    clearReferenceLines();

    // Only draw reference lines if there's an active viewport
    // and this viewport is NOT the active one
    const currentOrientation = orientation.toLowerCase();
    
    if (!activeViewport) {
      // No active viewport selected, don't draw any reference lines
      return;
    }
    
    if (activeViewport === currentOrientation) {
      // This IS the active viewport, don't draw reference lines on itself
      return;
    }
    
    // Draw reference lines only from the active viewport
    drawReferenceLinesFrom(activeViewport, currentRequestId); // NEW: Pass request ID
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateReferenceLinesFromOther: () => {
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

  // Redraw reference lines when enabled/disabled, viewport data changes, OR activeViewport changes
  useEffect(() => {
    if (referenceLinesEnabled && imageIds.length > 0 && currentImageRef.current) {
      drawAllReferenceLines();
    } else {
      clearReferenceLines();
    }
  }, [referenceLinesEnabled, viewportData, activeViewport]);

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

  const handleViewportWrapperClick = () => {
    if (imageIds.length > 0 && onViewportClick) {
      onViewportClick();
    }
  };

  const hasImages = imageIds.length > 0;

  if (!hasImages) {
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
    <Paper className={`${classes.container} ${isActive ? classes.containerActive : ''}`}>
      <Box className={classes.title}>
        <Typography variant="subtitle2">
          {orientation} - {seriesDescription}
        </Typography>
      </Box>
      
      <Box 
        className={`${classes.viewportWrapper} ${hasImages ? classes.viewportWrapperClickable : ''}`}
        onClick={handleViewportWrapperClick}
      >
        <div ref={viewportRef} className={classes.viewport} />

        {/* Reference lines overlay canvas */}
        <canvas ref={overlayCanvasRef} className={classes.viewport} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        
        {/* Overlays */}
        <Box className={`${classes.overlay} ${classes.topLeft}`}>
          <div>{patientName}</div>
          <div>DOB: {dateOfBirth}</div>
          <div>{studyDate} {studyTime}</div>
        </Box>
        
        <Box className={`${classes.overlay} ${classes.bottomRight}`}>
          <div>Slice: {currentSlice + 1} / {imageIds.length}</div>
          <div>Zoom: {viewportInfo.zoom}</div>
          <div>WL: {viewportInfo.windowCenter}&nbsp; WW: {viewportInfo.windowWidth}</div>
        </Box>

        {/* Directional markers */}
        <Box className={`${classes.overlay} ${classes.topCenter}`}>
          {directionalMarkers.top}
        </Box>
        <Box className={`${classes.overlay} ${classes.bottomCenter}`}>
          {directionalMarkers.bottom}
        </Box>
        <Box className={`${classes.overlay} ${classes.leftCenter}`}>
          {directionalMarkers.left}
        </Box>
        <Box className={`${classes.overlay} ${classes.rightCenter}`}>
          {directionalMarkers.right}
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
          valueLabelDisplay="off"
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