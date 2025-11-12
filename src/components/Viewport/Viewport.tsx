import React, { useEffect, useRef } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { RenderingEngine, Enums, Types } from '@cornerstonejs/core';
import type { IStackViewport } from '@cornerstonejs/core/types';
import { useDicomStore } from '@/store/dicomStore';
import { initCornerstone } from '@/services/cornerstone/initCornerstone';

interface ViewportProps {
  orientation: 'sagittal' | 'axial' | 'coronal';
}

const Viewport: React.FC<ViewportProps> = ({ orientation }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  const selectedSeries = useDicomStore((state) => state.selectedSeries[orientation]);
  const viewportInfo = useDicomStore((state) => state.viewportInfo[orientation]);
  const updateViewportInfo = useDicomStore((state) => state.updateViewportInfo);

  // Initialize Cornerstone
  useEffect(() => {
    const init = async () => {
      try {
        await initCornerstone();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Cornerstone:', error);
      }
    };
    init();
  }, []);

  // Initialize rendering engine and viewport
  useEffect(() => {
    if (!isInitialized || !viewportRef.current) return;

    const renderingEngineId = `renderingEngine-${orientation}`;
    const viewportId = `viewport-${orientation}`;

    // Create rendering engine
    const renderingEngine = new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    // Define viewport
    const viewportInput: Types.PublicViewportInput = {
      viewportId,
      type: Enums.ViewportType.STACK,
      element: viewportRef.current,
    };

    renderingEngine.enableElement(viewportInput);

    return () => {
      renderingEngine.destroy();
    };
  }, [isInitialized, orientation]);

  // Load images when series is selected
  useEffect(() => {
    if (!selectedSeries || !renderingEngineRef.current) return;

    const viewportId = `viewport-${orientation}`;
    const viewport = renderingEngineRef.current.getViewport(viewportId) as IStackViewport;

    if (!viewport) return;

    const imageIds = selectedSeries.images.map((img) => img.imageId);

    // Load the stack
    viewport.setStack(imageIds, 0);
    viewport.render();

    // Update viewport info
    updateViewportInfo(orientation, {
      totalSlices: imageIds.length,
      currentSlice: 0,
    });

    console.log(`Loaded ${imageIds.length} images into ${orientation} viewport`);
  }, [selectedSeries, orientation, updateViewportInfo]);

  // Handle slice navigation
  const handleSliceChange = (_event: Event, value: number | number[]) => {
    if (!renderingEngineRef.current) return;

    const sliceIndex = value as number;
    const viewportId = `viewport-${orientation}`;
    const viewport = renderingEngineRef.current.getViewport(viewportId) as IStackViewport;

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