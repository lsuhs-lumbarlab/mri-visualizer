import React from 'react';
import { Box, Typography } from '@mui/material';
import UploadZone from '../UploadZone/UploadZone';
import Viewport from '../Viewport/Viewport';
import StudyExplorer from '../StudyExplorer/StudyExplorer';

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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Study Explorer</Typography>
          </Box>
          
          {/* Upload Zone */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <UploadZone />
          </Box>
          
          {/* Study List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <StudyExplorer />
          </Box>
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
          <Viewport orientation="sagittal" />

          {/* Axial Viewport */}
          <Viewport orientation="axial" />

          {/* Coronal Viewport */}
          <Viewport orientation="coronal" />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;