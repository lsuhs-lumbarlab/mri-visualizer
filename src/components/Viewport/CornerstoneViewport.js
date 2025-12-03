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

  // Cache for first and last slice images
  const boundaryImagesCache = useRef({
    sagittal: { first: null, last: null },
    axial: { first: null, last: null },
    coronal: { first: null, last: null },
  });

  // Draw reference lines from a specific source
  const drawReferenceLinesFrom = (sourceOrientation) => {
    const element = viewportRef.current;
    if (!element || !currentImageRef.current || !referenceLinesEnabled) return;

    const canvas = element.querySelector('canvas');
    if (!canvas) return;

    const sourceData = viewportData[sourceOrientation];
    if (!sourceData || sourceData.imageIds.length === 0) return;

    const currentIndex = sourceData.currentImageIndex || 0;
    const sourceImageId = sourceData.imageIds[currentIndex];
    if (!sourceImageId) return;

    const isFirstSlice = currentIndex === 0;
    const isLastSlice = currentIndex === sourceData.imageIds.length - 1;

    // Load current slice image
    cornerstone.loadImage(sourceImageId).then((sourceImage) => {
      const refLines = referenceLinesRefs.current[sourceOrientation];
      
      // Build and draw current slice reference line (RED)
      const success = refLines.build(sourceImage, currentImageRef.current);
      
      if (success) {
        refLines.draw(canvas);

        // Only draw boundary lines if current slice is NOT at first or last
        const firstImageId = sourceData.imageIds[0];
        const lastImageId = sourceData.imageIds[sourceData.imageIds.length - 1];

        // Load first slice if not cached
        if (firstImageId && !boundaryImagesCache.current[sourceOrientation].first) {
          cornerstone.loadImage(firstImageId).then((firstImage) => {
            boundaryImagesCache.current[sourceOrientation].first = firstImage;
            // Only draw first boundary if not currently on first slice
            if (!isFirstSlice) {
              refLines.drawBoundaries(
                canvas,
                firstImage,
                null
              );
            }
          }).catch(() => {});
        } else if (boundaryImagesCache.current[sourceOrientation].first && !isFirstSlice) {
          // Draw cached first boundary
          refLines.drawBoundaries(
            canvas,
            boundaryImagesCache.current[sourceOrientation].first,
            null
          );
        }

        // Load last slice if not cached
        if (lastImageId && !boundaryImagesCache.current[sourceOrientation].last) {
          cornerstone.loadImage(lastImageId).then((lastImage) => {
            boundaryImagesCache.current[sourceOrientation].last = lastImage;
            // Only draw last boundary if not currently on last slice
            if (!isLastSlice) {
              refLines.drawBoundaries(
                canvas,
                null,
                lastImage
              );
            }
          }).catch(() => {});
        } else if (boundaryImagesCache.current[sourceOrientation].last && !isLastSlice) {
          // Draw cached last boundary
          refLines.drawBoundaries(
            canvas,
            null,
            boundaryImagesCache.current[sourceOrientation].last
          );
        }
      }
    }).catch(() => {
      // Silently fail - not all images may have proper metadata
    });
  };

  // Draw all reference lines
  const drawAllReferenceLines = () => {
    if (!referenceLinesEnabled) return;

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
    updateReferenceLinesFromOther: (sourceOrientation) => {
      drawReferenceLinesFrom(sourceOrientation);
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
    updateViewportData(e.target);
    
    // Draw reference lines if enabled
    if (referenceLinesEnabled) {
      drawAllReferenceLines();
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

  // Clear boundary cache when viewport data changes or feature is toggled
  useEffect(() => {
    // Clear cache when reference lines are toggled or viewport changes
    boundaryImagesCache.current = {
      sagittal: { first: null, last: null },
      axial: { first: null, last: null },
      coronal: { first: null, last: null },
    };

    if (referenceLinesEnabled && imageIds.length > 0 && currentImageRef.current) {
      drawAllReferenceLines();
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