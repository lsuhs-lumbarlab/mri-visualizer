import React from 'react';
import { Box } from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left Sidebar - Study Explorer */}
      <Box
        sx={{
          width: 300,
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Box sx={{ p: 2 }}>
          <h2>Study Explorer</h2>
          <p>Placeholder for study tree</p>
        </Box>
      </Box>

      {/* Right Section - Viewports */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar placeholder */}
        <Box
          sx={{
            height: 64,
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <h3>MRI Visualizer</h3>
        </Box>

        {/* Viewport Grid */}
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            p: 1,
            backgroundColor: 'background.default',
          }}
        >
          {/* Sagittal Viewport */}
          <Box
            sx={{
              backgroundColor: 'black',
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
            }}
          >
            Sagittal View
          </Box>

          {/* Axial Viewport */}
          <Box
            sx={{
              backgroundColor: 'black',
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
            }}
          >
            Axial View
          </Box>

          {/* Coronal Viewport */}
          <Box
            sx={{
              backgroundColor: 'black',
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
            }}
          >
            Coronal View
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;