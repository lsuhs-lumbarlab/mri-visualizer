import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  CircularProgress, 
  IconButton, 
  Tooltip 
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GridOnIcon from '@mui/icons-material/GridOn';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudyExplorer from '../components/StudyExplorer';
import CornerstoneViewport from '../components/CornerstoneViewport';
import { initCornerstone } from '../services/cornerstoneInit';
import { loadSeriesImageStack } from '../services/dicomLoader';
import { formatDicomDate, formatDicomTime } from '../utils/dateTimeFormatter';
import db from '../database/db';
import { useAuth } from '../contexts/AuthContext';
import { formatPatientName } from '../utils/patientNameFormatter';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  // Layout styles
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 3),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  iconButton: {
    color: theme.palette.text.primary,
  },
  activeButton: {
    color: theme.palette.primary.main,
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 230,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  viewportArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

function ViewerApp() {
  const classes = useStyles();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { studyId } = useParams(); // Get studyInstanceUID from URL

  const [isInitialized, setIsInitialized] = useState(false);
  const [studyLoaded, setStudyLoaded] = useState(false);
  const [viewportKey, setViewportKey] = useState(0);
  const [referenceLinesEnabled, setReferenceLinesEnabled] = useState(false);
  const [activeViewport, setActiveViewport] = useState(null);
  const [currentStudyUID, setCurrentStudyUID] = useState(null);
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

  // Initialize Cornerstone on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Initialize Cornerstone
      initCornerstone();

      if (!cancelled) {
        setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load study data when component mounts or studyId changes
  useEffect(() => {
    if (isInitialized && studyId) {
      loadStudy(studyId);
    }
  }, [isInitialized, studyId]);

  const loadStudy = async (studyInstanceUID) => {
    try {
      console.log('Loading study:', studyInstanceUID);
      
      // Load study from IndexedDB
      const study = await db.studies.get(studyInstanceUID);
      
      if (!study) {
        console.error('Study not found in database:', studyInstanceUID);
        alert('Study not found. Please upload DICOM files in the Library.');
        navigate('/library');
        return;
      }

      console.log('Study loaded:', study);

      // Set current study UID for StudyExplorer
      setCurrentStudyUID(studyInstanceUID);

      // Load patient info for header display
      setPatientInfo({
        patientName: formatPatientName(study.patientName) || 'Unknown Patient',
        dateOfBirth: formatDicomDate(study.patientBirthDate),
        studyDate: formatDicomDate(study.studyDate),
        studyTime: formatDicomTime(study.studyTime),
      });

      setStudyLoaded(true);
      console.log('Study loaded successfully');
    } catch (error) {
      console.error('Error loading study:', error);
      alert('Error loading study. Please try again.');
    }
  };

  const handleSeriesSelect = async (series) => {
    try {
      console.log('Loading series:', series);
      
      const imageIds = await loadSeriesImageStack(series.seriesInstanceUID);
      const orientation = series.orientation.toLowerCase();

      console.log(`Loaded ${imageIds.length} images for ${orientation} orientation`);

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
  const handleLogout = async () => {
    await logout();
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

  if (!isInitialized) {
    return (
      <Box className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Tooltip title="Back to Library">
            <IconButton 
              className={classes.iconButton}
              onClick={handleBackToLibrary}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box className={classes.headerRight}>
          <Tooltip title="Toggle Reference Lines">
            <IconButton
              className={referenceLinesEnabled ? classes.activeButton : classes.iconButton}
              onClick={toggleReferenceLines}
            >
              <GridOnIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Log Out">
            <IconButton 
              className={classes.iconButton}
              onClick={handleLogout}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className={classes.content}>
        {/* Sidebar - Study Explorer */}
        <Box className={classes.sidebar}>
          {studyLoaded && currentStudyUID ? (
            <StudyExplorer 
              studyInstanceUID={currentStudyUID}
              onSeriesSelect={handleSeriesSelect} 
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={24} />
            </Box>
          )}
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