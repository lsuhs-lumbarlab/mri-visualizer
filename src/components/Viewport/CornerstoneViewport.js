import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { enableViewportTools } from '../../services/cornerstoneInit';

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

const CornerstoneViewport = ({ 
  imageIds = [], 
  orientation = 'UNKNOWN',
  seriesDescription = ''
}) => {
  const classes = useStyles();
  const viewportRef = useRef(null);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [viewportData, setViewportData] = useState({
    zoom: 1,
    windowWidth: 0,
    windowCenter: 0,
  });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || imageIds.length === 0) return;

    // Enable the element for cornerstone
    cornerstone.enable(element);

    // Load the first image
    cornerstone.loadImage(imageIds[0]).then((image) => {
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
      element.addEventListener('cornerstoneimagerendered', () => {
        updateViewportData(element);
      });

      // Listen to stack scroll event
      element.addEventListener('cornerstonetoolsstackscroll', (e) => {
        const stackData = cornerstoneTools.getToolState(element, 'stack');
        if (stackData && stackData.data && stackData.data[0]) {
          setCurrentSlice(stackData.data[0].currentImageIdIndex);
        }
      });
    });

    return () => {
      // Cleanup: Remove event listeners and disable element
      if (element) {
        element.removeEventListener('cornerstoneimagerendered', updateViewportData);
        element.removeEventListener('cornerstonetoolsstackscroll', () => {});
        
        // Clear cornerstone element
        try {
          cornerstone.disable(element);
        } catch (error) {
          console.warn('Error disabling viewport:', error);
        }
      }
    };
  }, [imageIds]);

  const updateViewportData = (element) => {
    const viewport = cornerstone.getViewport(element);
    const image = cornerstone.getImage(element);
    
    if (viewport && image) {
      setViewportData({
        zoom: viewport.scale.toFixed(2),
        windowWidth: Math.round(viewport.voi.windowWidth),
        windowCenter: Math.round(viewport.voi.windowCenter),
      });
    }
  };

  const handleSliceChange = (event, newValue) => {
    const element = viewportRef.current;
    if (!element) return;

    const stackData = cornerstoneTools.getToolState(element, 'stack');
    if (stackData && stackData.data && stackData.data[0]) {
      stackData.data[0].currentImageIdIndex = newValue;
      cornerstone.loadImage(imageIds[newValue]).then((image) => {
        cornerstone.displayImage(element, image);
        setCurrentSlice(newValue);
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
          <div>Zoom: {viewportData.zoom}</div>
          <div>W/L: {viewportData.windowWidth} / {viewportData.windowCenter}</div>
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
};

export default CornerstoneViewport;