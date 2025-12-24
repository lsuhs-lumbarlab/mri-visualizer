import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import MainLayout from '../components/Layout/MainLayout';
import Header from '../components/Layout/Header';
import StudyExplorer from '../components/StudyExplorer/StudyExplorer';
import CornerstoneViewport from '../components/Viewport/CornerstoneViewport';
import { initCornerstone } from '../services/cornerstoneInit';
import { loadDicomFile, loadSeriesImageStack, isDicomFile } from '../services/dicomLoader';
import { formatDicomDate, formatDicomTime } from '../utils/dateFormatter';
import db from '../database/db';
import { useAuth } from '../contexts/AuthContext';

function ViewerApp() {
  const { logout } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [viewportKey, setViewportKey] = useState(0);
  const [referenceLinesEnabled, setReferenceLinesEnabled] = useState(false);
  const [activeViewport, setActiveViewport] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    patientName: '',
    dateOfBirth: '',
    studyDate: '',
    studyTime: '',
  });
  const [viewportData, setViewportData] = useState({
    sagittal: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
    axial: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
    coronal: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
  });

  // Store references to viewport components
  const viewportRefs = useRef({
    sagittal: null,
    axial: null,
    coronal: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Initialize Cornerstone
      initCornerstone();

      // Clear database on app start (don't persist across refreshes)
      await clearDatabase();

      // Only render the app after DB is cleared to avoid stale sidebar state
      if (!cancelled) {
        setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearDatabase = async () => {
    try {
      await db.files.clear();
      await db.series.clear();
      await db.studies.clear();
      await db.images.clear();
      setHasFiles(false);
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  };

  const resetAppState = async () => {
    // Clear database
    await clearDatabase();
    
    // Reset viewport data
    setViewportData({
      sagittal: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
      axial: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
      coronal: { imageIds: [], seriesDescription: '', currentImageIndex: 0 },
    });
    
    // Reset patient info
    setPatientInfo({
      patientName: '',
      dateOfBirth: '',
      studyDate: '',
      studyTime: '',
    });
    
    // Reset reference lines
    setReferenceLinesEnabled(false);
    
    // Reset active viewport
    setActiveViewport(null);
    
    // Increment key to force remount of viewports
    setViewportKey(prev => prev + 1);
    
    console.log('App state reset complete');
  };

  const handleFilesSelected = async (files) => {
    setIsLoading(true);
    
    try {
      // Clear everything first
      await resetAppState();
      
      // Load all DICOM files
      let loadedCount = 0;
      for (const file of files) {
        // Check if file is DICOM by content, not just extension
        const isDicom = await isDicomFile(file);
        if (isDicom) {
          await loadDicomFile(file);
          loadedCount++;
        }
      }
      
      if (loadedCount > 0) {
        setHasFiles(true);
        
        // Load patient info from the first study
        const studies = await db.studies.toArray();
        if (studies.length > 0) {
          const study = studies[0];
          setPatientInfo({
            patientName: study.patientName || 'Unknown',
            dateOfBirth: formatDicomDate(study.patientBirthDate),
            studyDate: formatDicomDate(study.studyDate),
            studyTime: formatDicomTime(study.studyTime),
          });
        }
        
        console.log(`Loaded ${loadedCount} DICOM file(s)`);
      } else {
        alert('No valid DICOM files found in the selected files.');
      }
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
          currentImageIndex: 0,
        },
      }));
    } catch (error) {
      console.error('Error loading series:', error);
      alert('Error loading series. Check console for details.');
    }
  };

  // Handle viewport image index changes for reference lines
  const handleViewportImageChange = (orientation, imageIndex) => {
    setViewportData((prev) => ({
      ...prev,
      [orientation]: {
        ...prev[orientation],
        currentImageIndex: imageIndex,
      },
    }));

    // Only trigger reference lines update if this is the active viewport
    if (referenceLinesEnabled && activeViewport === orientation) {
      updateReferenceLines(orientation);
    }
  };

  // Update reference lines on all other viewports
  const updateReferenceLines = (sourceOrientation) => {
    const orientations = ['sagittal', 'axial', 'coronal'];
    orientations.forEach(orientation => {
      if (orientation !== sourceOrientation && viewportRefs.current[orientation]) {
        viewportRefs.current[orientation].updateReferenceLinesFromOther(sourceOrientation);
      }
    });
  };

  // Toggle reference lines
  const toggleReferenceLines = () => {
    setReferenceLinesEnabled(prev => !prev);
  };

  // Handle viewport click to set active viewport
  const handleViewportClick = (orientation) => {
    setActiveViewport(orientation);
    
    // Update reference lines immediately when viewport becomes active
    if (referenceLinesEnabled) {
      updateReferenceLines(orientation);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  if (!isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <MainLayout
        header={
          <Header 
            onOpenFiles={handleFilesSelected}
            referenceLinesEnabled={referenceLinesEnabled}
            onToggleReferenceLines={toggleReferenceLines}
            onLogout={handleLogout}
          />
        }
        sidebar={
          <StudyExplorer
            key={hasFiles ? viewportKey : 'empty'}
            onSeriesSelect={handleSeriesSelect}
          />
        }
        viewports={[
          <CornerstoneViewport
            key={`sagittal-${viewportKey}`}
            ref={el => viewportRefs.current.sagittal = el}
            imageIds={viewportData.sagittal.imageIds}
            orientation="SAGITTAL"
            seriesDescription={viewportData.sagittal.seriesDescription}
            currentImageIndex={viewportData.sagittal.currentImageIndex}
            referenceLinesEnabled={referenceLinesEnabled}
            viewportData={viewportData}
            onImageIndexChange={(index) => handleViewportImageChange('sagittal', index)}
            isActive={activeViewport === 'sagittal'}
            onViewportClick={() => handleViewportClick('sagittal')}
            activeViewport={activeViewport}
            patientName={patientInfo.patientName}
            dateOfBirth={patientInfo.dateOfBirth}
            studyDate={patientInfo.studyDate}
            studyTime={patientInfo.studyTime}
          />,
          <CornerstoneViewport
            key={`axial-${viewportKey}`}
            ref={el => viewportRefs.current.axial = el}
            imageIds={viewportData.axial.imageIds}
            orientation="AXIAL"
            seriesDescription={viewportData.axial.seriesDescription}
            currentImageIndex={viewportData.axial.currentImageIndex}
            referenceLinesEnabled={referenceLinesEnabled}
            viewportData={viewportData}
            onImageIndexChange={(index) => handleViewportImageChange('axial', index)}
            isActive={activeViewport === 'axial'}
            onViewportClick={() => handleViewportClick('axial')}
            activeViewport={activeViewport}
            patientName={patientInfo.patientName}
            dateOfBirth={patientInfo.dateOfBirth}
            studyDate={patientInfo.studyDate}
            studyTime={patientInfo.studyTime}
          />,
          <CornerstoneViewport
            key={`coronal-${viewportKey}`}
            ref={el => viewportRefs.current.coronal = el}
            imageIds={viewportData.coronal.imageIds}
            orientation="CORONAL"
            seriesDescription={viewportData.coronal.seriesDescription}
            currentImageIndex={viewportData.coronal.currentImageIndex}
            referenceLinesEnabled={referenceLinesEnabled}
            viewportData={viewportData}
            onImageIndexChange={(index) => handleViewportImageChange('coronal', index)}
            isActive={activeViewport === 'coronal'}
            onViewportClick={() => handleViewportClick('coronal')}
            activeViewport={activeViewport}
            patientName={patientInfo.patientName}
            dateOfBirth={patientInfo.dateOfBirth}
            studyDate={patientInfo.studyDate}
            studyTime={patientInfo.studyTime}
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
    </>
  );
}

export default ViewerApp;