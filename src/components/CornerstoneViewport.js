import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Box, Slider, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { enableViewportTools } from '../services/cornerstoneInit';
import { ReferenceLines } from '../services/referenceLines';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    minWidth: 0,
    border: '1px solid transparent',
    boxSizing: 'border-box',
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
    // Keep a tiny gutter so the canvas never visually touches the active border
    padding: theme.spacing(0.25),
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  viewportInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  viewportWrapperClickable: {
    cursor: 'pointer',
  },
  viewport: {
    width: '100%',
    height: '100%',
  },
  overlayCanvas: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
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
  seriesDate = '',
  seriesTime = '',
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

  // Cache loaded source images to avoid async flicker while scrolling
  const sourceImageCacheRef = useRef(new Map());

  // Refs to avoid stale closures inside Cornerstone DOM event listeners
  const referenceLinesEnabledRef = useRef(referenceLinesEnabled);
  const drawAllReferenceLinesRef = useRef(null);

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

    const syncOverlayCanvasSize = () => {
      const baseCanvas = element.querySelector('canvas');
      const overlayCanvas = overlayCanvasRef.current;
      if (baseCanvas && overlayCanvas) {
        // Setting width/height clears the canvas; only do it if changed
        if (overlayCanvas.width !== baseCanvas.width) {
          overlayCanvas.width = baseCanvas.width;
        }
        if (overlayCanvas.height !== baseCanvas.height) {
          overlayCanvas.height = baseCanvas.height;
        }
      }
    };

    const drawWithSourceImage = (sourceImage) => {
      if (requestId !== drawingRequestRef.current) return;
      if (!currentImageRef.current) return;

      const refLines = referenceLinesRefs.current[sourceOrientation];
      const success = refLines.build(sourceImage, currentImageRef.current);
      if (!success) return;

      syncOverlayCanvasSize();
      // draw() clears only if it can compute a valid line
      refLines.draw(canvas, element);
    };

    const cached = sourceImageCacheRef.current.get(sourceImageId);
    if (cached) {
      drawWithSourceImage(cached);
      return;
    }

    cornerstone
      .loadImage(sourceImageId)
      .then((sourceImage) => {
        sourceImageCacheRef.current.set(sourceImageId, sourceImage);
        drawWithSourceImage(sourceImage);
      })
      .catch(() => {
        // Silently fail - not all images may have proper metadata
      });
  };

  // Draw reference lines only from the active viewport
  const drawAllReferenceLines = () => {
    // NEW: Increment request ID to invalidate any pending async operations
    drawingRequestRef.current += 1;
    const currentRequestId = drawingRequestRef.current;

    if (!referenceLinesEnabled) return;

    // Note: do NOT clear immediately here. If we clear and then the async
    // source image load gets cancelled by rapid scrolling, the overlay stays
    // blank. We clear right before drawing once the new line is ready.

    // Only draw reference lines if there's an active viewport
    // and this viewport is NOT the active one
    const currentOrientation = orientation.toLowerCase();
    
    if (!activeViewport) {
      // No active viewport selected, don't draw any reference lines
      clearReferenceLines();
      return;
    }
    
    if (activeViewport === currentOrientation) {
      // This IS the active viewport, don't draw reference lines on itself
      clearReferenceLines();
      return;
    }
    
    // Draw reference lines only from the active viewport
    drawReferenceLinesFrom(activeViewport, currentRequestId); // NEW: Pass request ID
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateReferenceLinesFromOther: () => {
      drawAllReferenceLines();
    },
    resizeViewport: () => {
      const element = viewportRef.current;
      if (!element) return;

      try {
        // Only resize if cornerstone has enabled the element
        cornerstone.getEnabledElement(element);
        cornerstone.resize(element, false); // false = preserve zoom/pan state
      } catch (error) {
        // Ignore - element may not be enabled yet
      }
    },
    getElement: () => {
      return viewportRef.current;
    }
  }));

  // Keep refs in sync for stable event listeners
  useEffect(() => {
    referenceLinesEnabledRef.current = referenceLinesEnabled;
  }, [referenceLinesEnabled]);

  // Expose the latest draw function to stable event listeners
  drawAllReferenceLinesRef.current = drawAllReferenceLines;

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

    // Ensure currentImageRef matches the image that was actually displayed
    try {
      const displayedImage = cornerstone.getImage(element);
      if (displayedImage) {
        currentImageRef.current = displayedImage;
      }
    } catch (error) {
      // Ignore
    }

    // Ensure overlay canvas matches the underlying image canvas size
    const baseCanvas = element.querySelector('canvas');
    const overlayCanvas = overlayCanvasRef.current;
    if (baseCanvas && overlayCanvas) {
      // Only resize when size changed; resizing clears the overlay
      if (overlayCanvas.width !== baseCanvas.width) {
        overlayCanvas.width = baseCanvas.width;
      }
      if (overlayCanvas.height !== baseCanvas.height) {
        overlayCanvas.height = baseCanvas.height;
      }
    }

    // Redraw reference lines after the image is rendered. Otherwise the overlay
    // can be cleared by canvas resize and remain blank.
    if (referenceLinesEnabledRef.current && drawAllReferenceLinesRef.current) {
      requestAnimationFrame(() => {
        if (referenceLinesEnabledRef.current && drawAllReferenceLinesRef.current) {
          drawAllReferenceLinesRef.current();
        }
      });
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

    // Keep cornerstone canvas in sync with layout changes (e.g., when COR viewport is toggled)
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        // Defer resize to next frame to avoid resize/layout thrash
        requestAnimationFrame(() => {
          try {
            cornerstone.getEnabledElement(element);
            cornerstone.resize(element, false); // false = preserve zoom/pan state
          } catch (error) {
            // Ignore
          }
        });
      });

      resizeObserver.observe(element);
    }

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

        if (resizeObserver) {
          try {
            resizeObserver.disconnect();
          } catch (error) {
            // Ignore
          }
        }
        
        // Clear cornerstone element
        try {
          cornerstone.disable(element);
        } catch (error) {
          console.warn('Error disabling viewport:', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageIds]);

  // Redraw reference lines when enabled/disabled, viewport data changes, OR activeViewport changes
  useEffect(() => {
    if (referenceLinesEnabled && imageIds.length > 0 && currentImageRef.current) {
      drawAllReferenceLines();
    } else {
      clearReferenceLines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceLinesEnabled, viewportData, activeViewport, imageIds.length]);

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
        <div className={classes.viewportInner}>
          <div ref={viewportRef} className={classes.viewport} />

          {/* Reference lines overlay canvas */}
          <canvas ref={overlayCanvasRef} className={`${classes.viewport} ${classes.overlayCanvas}`} />
        </div>
        
        {/* Overlays */}
        <Box className={`${classes.overlay} ${classes.topLeft}`}>
          <div>{patientName}</div>
          <div>DOB: {dateOfBirth}</div>
          <div>{seriesDate} {seriesTime}</div>
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