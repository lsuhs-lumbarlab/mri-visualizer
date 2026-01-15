import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Icon from '@mdi/react';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import EditIcon from '@material-ui/icons/Edit';
import * as cornerstoneTools from 'cornerstone-tools';
import StudyExplorer from '../components/StudyExplorer';
import CornerstoneViewport from '../components/CornerstoneViewport';
import { initCornerstone } from '../services/cornerstoneInit';
import { loadSeriesImageStack } from '../services/dicomLoader';
import { formatDicomDate, formatDicomTime } from '../utils/dateTimeFormatter';
import { formatPatientName } from '../utils/patientNameFormatter';
import db from '../database/db';
import { useAuth } from '../contexts/AuthContext';

import { 
  Box, 
  CircularProgress, 
  IconButton, 
  Tooltip,
  Divider
} from '@material-ui/core';

import {
  mdiArrowSplitHorizontal,
  mdiRuler,
  mdiAngleAcute,
  mdiCursorDefault
} from '@mdi/js';

// Custom COR icon component
const CorIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" rx="2"/>
    <text 
      x="12" 
      y="15" 
      textAnchor="middle" 
      fill="currentColor" 
      fontSize="8" 
      fontWeight="bold"
      fontFamily="Roboto, sans-serif"
    >
      COR
    </text>
  </SvgIcon>
);

// Custom Cobb Angle icon
const CobbAngleIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    {/* Top endplate line */}
    <path 
      d="M3 9 L21 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Bottom endplate line */}
    <path
      d="M3 15 L21 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Top perpendicular line */}
    <path
      d="M14 6 L16 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Bottom perpendicular line */}
    <path
      d="M14 18 L16 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </SvgIcon>
);

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
  activeToolButton: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
  },
  sidebar: {
    width: 230,
    flex: '0 0 230px',
    flexShrink: 0,
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
    minWidth: 0,
  },
  verticalDivider: {
    alignSelf: 'stretch',
    // margin: theme.spacing(0, 1),
    backgroundColor: theme.palette.divider,
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
  });
  const [viewportData, setViewportData] = useState({
    sagittal: { imageIds: [], seriesDescription: '', currentImageIndex: 0, seriesDate: '', seriesTime: '' },
    axial: { imageIds: [], seriesDescription: '', currentImageIndex: 0, seriesDate: '', seriesTime: '' },
    coronal: { imageIds: [], seriesDescription: '', currentImageIndex: 0, seriesDate: '', seriesTime: '' },
  });
  const [coronalVisible, setCoronalVisible] = useState(false);
  const [activeTool, setActiveTool] = useState('no-tool');

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

  // Tool selection handler - defined before useEffect to avoid no-use-before-define warning
  const handleToolSelect = useCallback((toolName) => {
    console.log('Tool selected:', toolName);
    
    // Get all viewport elements
    const viewportElements = [
      viewportRefs.current.sagittal?.getElement?.(),
      viewportRefs.current.axial?.getElement?.(),
      viewportRefs.current.coronal?.getElement?.(),
    ].filter(Boolean);
    
    // Map tool names to Cornerstone tool names
    const toolMap = {
      'no-tool': null,
      'pan': 'Pan',
      'zoom': 'Zoom',
      'wl/ww': 'Wwwc',
      'distance': 'Length',
      'angle': 'Angle',
      'cobb-angle': 'CobbAngle',
      'text': 'ArrowAnnotate',
    };
    
    const cornerstoneTool = toolMap[toolName];
    
    // Deactivate previous tool and activate new tool on all viewports
    viewportElements.forEach(element => {
      try {
        // Deactivate all interactive tools (keep scroll active)
        ['Pan', 'Zoom', 'Wwwc', 'Length', 'Angle', 'CobbAngle', 'ArrowAnnotate'].forEach(tool => {
          try {
            cornerstoneTools.setToolPassiveForElement(element, tool);
          } catch (e) {
            // Tool might not be added to this element yet
          }
        });
        
        // Activate the selected tool with left mouse button
        if (cornerstoneTool) {
          cornerstoneTools.setToolActiveForElement(element, cornerstoneTool, { mouseButtonMask: 1 });
        }
      } catch (error) {
        console.warn('Error switching tool on element:', error);
      }
    });
    
    setActiveTool(toolName);
  }, []);

  // Keyboard shortcuts for tool selection
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Map keys to tools
      const keyMap = {
        'escape': 'no-tool',    // ESC to deactivate
        'z': 'zoom',            // Z for zoom
        'p': 'pan',             // P for pan
        'w': 'wl/ww',           // W for window level/width
        'd': 'distance',        // D for distance
        'a': 'angle',           // A for angle
        'c': 'cobb-angle',      // C for cobb angle
        't': 'text',            // T for text
      };

      const toolName = keyMap[event.key.toLowerCase()];
      if (toolName) {
        event.preventDefault();
        handleToolSelect(toolName);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeTool, handleToolSelect]);

  // Load study data when component mounts or studyId changes
  useEffect(() => {
    if (isInitialized && studyId) {
      loadStudy(studyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Load patient info from patients table
      const patient = await db.patients.get(study.patientID);

      if (!patient) {
        console.error('Patient not found for study:', studyInstanceUID);
        alert('Patient data not found. Please re-upload DICOM files.');
        navigate('/library');
        return;
      }

      // Set current study UID for StudyExplorer
      setCurrentStudyUID(studyInstanceUID);

      // Load patient info for header display
      setPatientInfo({
        patientName: formatPatientName(patient.patientName) || 'Unknown Patient',
        dateOfBirth: formatDicomDate(patient.patientBirthDate),
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

      // If user selects a CORONAL series while COR viewport is hidden, show it
      if (orientation === 'coronal') {
        setCoronalVisible(true);
      }

      console.log(`Loaded ${imageIds.length} images for ${orientation} orientation`);

      setViewportData((prev) => ({
        ...prev,
        [orientation]: {
          imageIds: imageIds,
          seriesDescription: series.seriesDescription,
          currentImageIndex: 0,
          seriesDate: formatDicomDate(series.seriesDate),
          seriesTime: formatDicomTime(series.seriesTime),
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

  // Toggle coronal viewport visibility
  const toggleCoronalViewport = () => {
    setCoronalVisible((prevVisible) => {
      const nextVisible = !prevVisible;

      // If COR is being hidden and it was active, clear active viewport
      if (!nextVisible) {
        setActiveViewport((prevActive) => (prevActive === 'coronal' ? null : prevActive));
      }

      return nextVisible;
    });
  };

  // When layout changes (e.g., COR hidden/shown), force Cornerstone to resize and redraw
  useEffect(() => {
    requestAnimationFrame(() => {
      viewportRefs.current.sagittal?.resizeViewport?.();
      viewportRefs.current.axial?.resizeViewport?.();
      viewportRefs.current.coronal?.resizeViewport?.();

      // Keep reference lines visually correct after resize
      if (referenceLinesEnabled && activeViewport) {
        updateReferenceLines(activeViewport);
      }
    });
  }, [coronalVisible, referenceLinesEnabled, activeViewport]);

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
  // const handleBackToLibrary = () => {
  //   // Pass the patientId back to Library to restore selection
  //   if (location.state?.patientId) {
  //     navigate('/library', {
  //       state: { patientId: location.state.patientId }
  //     });
  //   } else {
  //     navigate('/library');
  //   }
  // };

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
          {/* <Tooltip title="Back to Library">
            <IconButton 
              className={classes.iconButton}
              onClick={handleBackToLibrary}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip> */}
        </Box>

        <Box className={classes.headerRight}>
          {/* Tool Buttons */}
          <Tooltip title="No Tool (ESC)">
            <IconButton
              className={activeTool === 'no-tool' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('no-tool')}
            >
              <Icon path={mdiCursorDefault} size={1} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Pan (P)">
            <IconButton
              className={activeTool === 'pan' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('pan')}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom (Z)">
            <IconButton
              className={activeTool === 'zoom' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('zoom')}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="WL/WW (W)">
            <IconButton
              className={activeTool === 'wl/ww' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('wl/ww')}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Distance (D)">
            <IconButton
              className={activeTool === 'distance' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('distance')}
            >
              <Icon path={mdiRuler} size={1} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Angle (A)">
            <IconButton
              className={activeTool === 'angle' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('angle')}
            >
              <Icon path={mdiAngleAcute} size={1} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cobb Angle (C)">
            <IconButton
              className={activeTool === 'cobb-angle' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('cobb-angle')}
            >
              <CobbAngleIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Text (T)">
            <IconButton
              className={activeTool === 'text' ? classes.activeToolButton : classes.iconButton}
              onClick={() => handleToolSelect('text')}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem className={classes.verticalDivider} />

          <Tooltip title="Reset Image">
            <IconButton 
              className={classes.iconButton}
              // onClick={handleLogout}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Undo">
            <IconButton 
              className={classes.iconButton}
              // onClick={handleLogout}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Redo">
            <IconButton 
              className={classes.iconButton}
              // onClick={handleLogout}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem className={classes.verticalDivider} />

          {/* Other Control Buttons */}
          <Tooltip title="Toggle Reference Lines">
            <IconButton
              className={referenceLinesEnabled ? classes.activeButton : classes.iconButton}
              onClick={toggleReferenceLines}
            >
              <Icon path={mdiArrowSplitHorizontal} size={1} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Coronal View">
            <IconButton
              className={coronalVisible ? classes.activeButton : classes.iconButton}
              onClick={toggleCoronalViewport}
            >
              <CorIcon />
            </IconButton>
          </Tooltip>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem className={classes.verticalDivider} />

          <Tooltip title="Log Out">
            <IconButton 
              className={classes.iconButton}
              onClick={handleLogout}
            >
              <EditIcon />
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
            seriesDate={viewportData.sagittal.seriesDate}
            seriesTime={viewportData.sagittal.seriesTime}
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
            seriesDate={viewportData.axial.seriesDate}
            seriesTime={viewportData.axial.seriesTime}
          />
          {coronalVisible && (  // Conditionally render coronal viewport
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
              seriesDate={viewportData.coronal.seriesDate}
              seriesTime={viewportData.coronal.seriesTime}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ViewerApp;