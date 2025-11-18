import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline, Box, CircularProgress } from '@material-ui/core';
import theme from './theme/theme';
import MainLayout from './components/Layout/MainLayout';
import Header from './components/Layout/Header';
import StudyExplorer from './components/StudyExplorer/StudyExplorer';
import CornerstoneViewport from './components/Viewport/CornerstoneViewport';
import FileUploader from './components/FileUpload/FileUploader';
import { initCornerstone } from './services/cornerstoneInit';
import { loadDicomFile, loadSeriesImageStack } from './services/dicomLoader';
import db from './database/db';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [viewportData, setViewportData] = useState({
    sagittal: { imageIds: [], seriesDescription: '' },
    axial: { imageIds: [], seriesDescription: '' },
    coronal: { imageIds: [], seriesDescription: '' },
  });

  useEffect(() => {
    // Initialize Cornerstone
    initCornerstone();
    setIsInitialized(true);

    // Clear database on app start (don't persist across refreshes)
    clearDatabase();
  }, []);

  const clearDatabase = async () => {
    try {
      await db.files.clear();
      await db.series.clear();
      await db.studies.clear();
      await db.images.clear();
      setHasFiles(false);
      console.log('Database cleared on app start');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  };

  const handleFilesSelected = async (files) => {
    setIsLoading(true);
    try {
      // Load all DICOM files
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.dcm')) {
          await loadDicomFile(file);
        }
      }
      setHasFiles(true);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Error loading DICOM files. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesSelect = async (series) => {
    try {
      const imageIds = await loadSeriesImageStack(series.seriesInstanceUID);
      const orientation = series.orientation.toLowerCase();

      setViewportData((prev) => ({
        ...prev,
        [orientation]: {
          imageIds: imageIds,
          seriesDescription: series.seriesDescription,
        },
      }));
    } catch (error) {
      console.error('Error loading series:', error);
      alert('Error loading series. Check console for details.');
    }
  };

  if (!isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout
        header={<Header onOpenFiles={handleFilesSelected} />}
        sidebar={
          hasFiles ? (
            <StudyExplorer onSeriesSelect={handleSeriesSelect} />
          ) : (
            <FileUploader onFilesSelected={handleFilesSelected} />
          )
        }
        viewports={[
          <CornerstoneViewport
            key="sagittal"
            imageIds={viewportData.sagittal.imageIds}
            orientation="SAGITTAL"
            seriesDescription={viewportData.sagittal.seriesDescription}
          />,
          <CornerstoneViewport
            key="axial"
            imageIds={viewportData.axial.imageIds}
            orientation="AXIAL"
            seriesDescription={viewportData.axial.seriesDescription}
          />,
          <CornerstoneViewport
            key="coronal"
            imageIds={viewportData.coronal.imageIds}
            orientation="CORONAL"
            seriesDescription={viewportData.coronal.seriesDescription}
          />
        ]}
      />
      {isLoading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(0,0,0,0.7)"
          zIndex={9999}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;