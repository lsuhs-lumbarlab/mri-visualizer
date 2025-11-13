import React, { useEffect, useRef } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { Enums, Types } from '@cornerstonejs/core';
import type { IStackViewport } from '@cornerstonejs/core/types';
import { useDicomStore } from '@/store/dicomStore';
import { getRenderingEngine } from '@/services/cornerstone/renderingEngineService';

interface ViewportProps {
  orientation: 'sagittal' | 'axial' | 'coronal';
}

const Viewport: React.FC<ViewportProps> = ({ orientation }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isEnabledRef = useRef(false);
  
  const selectedSeries = useDicomStore((state) => state.selectedSeries[orientation]);
  const viewportInfo = useDicomStore((state) => state.viewportInfo[orientation]);
  const updateViewportInfo = useDicomStore((state) => state.updateViewportInfo);

  // Initialize viewport
  useEffect(() => {
    if (!viewportRef.current || isEnabledRef.current) return;

    const viewportId = `viewport-${orientation}`;
    const renderingEngine = getRenderingEngine();

    // Define viewport
    const viewportInput: Types.PublicViewportInput = {
      viewportId,
      type: Enums.ViewportType.STACK,
      element: viewportRef.current,
    };

    renderingEngine.enableElement(viewportInput);
    isEnabledRef.current = true;

    return () => {
      if (isEnabledRef.current) {
        try {
          renderingEngine.disableElement(viewportId);
        } catch (error) {
          // Viewport may already be disabled
        }
        isEnabledRef.current = false;
      }
    };
  }, [orientation]);

  // Load images when series is selected
  useEffect(() => {
    if (!selectedSeries || !isEnabledRef.current) return;

    const loadImages = async () => {
      const viewportId = `viewport-${orientation}`;
      const renderingEngine = getRenderingEngine();
      const viewport = renderingEngine.getViewport(viewportId) as IStackViewport;

      if (!viewport) {
        console.error(`Viewport ${viewportId} not found`);
        return;
      }

      const imageIds = selectedSeries.images.map((img) => img.imageId);

      console.log(`Setting stack with ${imageIds.length} images for ${orientation}`);
      console.log(`First 2 imageIds:`, imageIds.slice(0, 2));

      try {
        // Update viewport info immediately so UI updates
        updateViewportInfo(orientation, {
          totalSlices: imageIds.length,
          currentSlice: 0,
        });

        // Set the stack (this loads the first image)
        await viewport.setStack(imageIds);
        console.log(`Stack set successfully for ${orientation}`);
        
        // Set to first image explicitly
        await viewport.setImageIdIndex(0);
        console.log(`Set to image index 0`);
        
        // Force render
        viewport.render();
        console.log(`Viewport rendered for ${orientation}`);
        
      } catch (error) {
        console.error(`Error loading stack for ${orientation}:`, error);
      }
    };

    loadImages();
  }, [selectedSeries, orientation, updateViewportInfo]);

  // Handle slice navigation
  const handleSliceChange = (_event: Event, value: number | number[]) => {
    if (!isEnabledRef.current) return;

    const sliceIndex = value as number;
    const viewportId = `viewport-${orientation}`;
    const renderingEngine = getRenderingEngine();
    const viewport = renderingEngine.getViewport(viewportId) as IStackViewport;

    if (viewport) {
      viewport.setImageIdIndex(sliceIndex);
      viewport.render();
      updateViewportInfo(orientation, { currentSlice: sliceIndex });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
      }}
    >
      {/* Viewport Canvas */}
      <Box
        ref={viewportRef}
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          position: 'relative',
        }}
      />

      {/* Overlay Info */}
      {selectedSeries && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: 'white',
              fontSize: '0.75rem',
              textShadow: '1px 1px 2px black',
            }}
          >
            <Typography variant="caption" display="block">
              {selectedSeries.seriesDescription}
            </Typography>
            <Typography variant="caption" display="block">
              {orientation.toUpperCase()}
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              color: 'white',
              fontSize: '0.75rem',
              textAlign: 'right',
              textShadow: '1px 1px 2px black',
            }}
          >
            <Typography variant="caption" display="block">
              Slice: {viewportInfo.currentSlice + 1} / {viewportInfo.totalSlices}
            </Typography>
            <Typography variant="caption" display="block">
              W: {viewportInfo.windowWidth} L: {viewportInfo.windowLevel}
            </Typography>
          </Box>
        </>
      )}

      {/* Slice Slider */}
      {selectedSeries && viewportInfo.totalSlices > 0 && (
        <Box sx={{ px: 1, py: 0.5, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Slider
            value={viewportInfo.currentSlice}
            min={0}
            max={viewportInfo.totalSlices - 1}
            onChange={handleSliceChange}
            size="small"
            sx={{ color: 'primary.main' }}
          />
        </Box>
      )}

      {/* Empty State */}
      {!selectedSeries && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'grey.600',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">{orientation.toUpperCase()}</Typography>
          <Typography variant="body2">No series loaded</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Viewport;