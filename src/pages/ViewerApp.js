import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  CircularProgress, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Tooltip 
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import GridOnIcon from '@material-ui/icons/GridOn';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import StudyExplorer from '../components/StudyExplorer/StudyExplorer';
import CornerstoneViewport from '../components/Viewport/CornerstoneViewport';
import { initCornerstone } from '../services/cornerstoneInit';
import { loadDicomFile, loadSeriesImageStack, isDicomFile } from '../services/dicomLoader';
import { formatDicomDate, formatDicomTime } from '../utils/dateFormatter';
import db from '../database/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  // Layout styles
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 200,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  viewportArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  },
  // Header styles
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  spacer: {
    flexGrow: 1,
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  activeButton: {
    color: theme.palette.primary.light,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

function ViewerApp() {
  const classes = useStyles();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);
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

  // Handle back to library
  const handleBackToLibrary = () => {
    // Pass the patientId back to Library to restore selection
    if (location.state?.patientId) {
      navigate('/library', {
        state: { patientId: location.state.patientId }
      });
    } else {
      navigate('/library');
    }
  };

  // Handle open folder
  const handleOpenFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        handleFilesSelected(files);
      }
    };
    
    input.click();
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
    <Box className={classes.root}>
      {/* Header */}
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Tooltip title="Back to Library">
            <IconButton 
              color="inherit" 
              onClick={handleBackToLibrary}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          
          <div className={classes.spacer} />
          
          <Tooltip title="Open DICOM Folder">
            <IconButton 
              color="inherit" 
              onClick={handleOpenFolder}
              className={classes.button}
            >
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={referenceLinesEnabled ? "Hide Reference Lines" : "Show Reference Lines"}>
            <IconButton 
              color="inherit" 
              onClick={toggleReferenceLines}
              className={`${classes.button} ${referenceLinesEnabled ? classes.activeButton : ''}`}
            >
              <GridOnIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              className={classes.button}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box className={classes.content}>
        {/* Sidebar */}
        <Box className={classes.sidebar}>
          <StudyExplorer
            key={hasFiles ? viewportKey : 'empty'}
            onSeriesSelect={handleSeriesSelect}
          />
        </Box>

        {/* Viewport Area */}
        <Box className={classes.viewportArea}>
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
          />
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
          />
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
        </Box>
      </Box>
    </Box>
  );
}

export default ViewerApp;