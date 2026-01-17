import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import libraryService from '../services/libraryService';
import { isDicomFile } from '../services/dicomLoader';
import { usePatientFilters } from '../hooks/usePatientFilters';
import { useStudyFilters } from '../hooks/useStudyFilters';
import InfoModal from '../components/InfoModal';
import ShareModal from '../components/ShareModal';
import UploadModal from '../components/UploadModal';
import Icon from '@mdi/react';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Popover,
} from '@material-ui/core';

import { 
  mdiFolderUploadOutline,
  mdiLogout,
  mdiMagnify,
  mdiClose,
  mdiSortAscending,
  mdiSortDescending,
  mdiInformation,
  mdiShareVariant,
  mdiMenuDown,
  mdiMenuUp,
  mdiCalendar
} from '@mdi/js';

const useStyles = makeStyles((theme) => ({
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
    gap: theme.spacing(2),
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  pane: {
    flex: 1,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  paneTitle: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 600,
  },
  scrollableList: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
  },
  patientCard: {
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `2px solid transparent`,
    '&:hover': {
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.action.hover,
    },
  },
  selectedCard: {
    borderColor: theme.palette.primary.main,
    '&:hover': {
      boxShadow: 'none',
      borderColor: theme.palette.primary.main,
    },
  },
  studyCard: {
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `2px solid transparent`,
    '&:hover': {
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.action.hover,
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardActions: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  patientName: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  studyDescription: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  phiInfo: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
  },
  studyInfo: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: theme.spacing(4),
  },
  emptyStateText: {
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  searchContainer: {
    padding: theme.spacing(2, 2, 0),
  },
  searchField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
  },
  sortFilterContainer: {
    padding: theme.spacing(1.5, 2, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  sortLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  filterLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  filterInput: {
    width: 95,
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
    '& input': {
      padding: theme.spacing(1, 1),
      fontSize: '0.875rem',
    },
    '& .MuiSelect-select': {
      padding: theme.spacing(1, 1),
      fontSize: '0.875rem',
    },
  },
  filterDatePicker: {
    width: 115,
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
      paddingRight: 0,
      cursor: 'pointer',
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1, 1),
      paddingRight: 0,
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
    '& .MuiInputBase-root': {
      fontSize: '0.875rem',
    },
    '& .MuiIconButton-root': {
      pointerEvents: 'none',
      padding: 0,
      marginRight: '10px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  filterToText: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  filterButton: {
    fontSize: '0.875rem',
    padding: theme.spacing(0.5, 1.5),
    minWidth: 'auto',
    textTransform: 'none',
  },
  sortLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  patientSortSelect: {
    width: 130,
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
    '& .MuiSelect-select': {
      padding: theme.spacing(1, 1),
      fontSize: '0.875rem',
    },
  },
  studySortSelect: {
    width: 120,
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
    '& .MuiSelect-select': {
      padding: theme.spacing(1, 1),
      fontSize: '0.875rem',
    },
  },
  sortButton: {
    fontSize: '0.875rem',
    padding: theme.spacing(0.5, 1.5),
    minWidth: 'auto',
    textTransform: 'none',
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  sortIcon: {
    marginLeft: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  modalityButton: {
    fontSize: '0.875rem',
    fontWeight: 400,
    padding: theme.spacing(0.5, 1.5),
    width: 80,
    textTransform: 'none',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.default,
    borderColor: theme.palette.divider,
    '& .MuiButton-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    },
    '& .MuiButton-endIcon': {
      marginLeft: theme.spacing(0.5),
    },
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      borderColor: theme.palette.text.primary,
    },
    '&:focus': {
      backgroundColor: theme.palette.background.default,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    '&.Mui-focusVisible': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    '&.open': {
      backgroundColor: theme.palette.background.default,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
  },
  modalityPopover: {
    '& .MuiPopover-paper': {
      padding: theme.spacing(2),
      marginTop: theme.spacing(0.1),
      width: 135,
    },
  },
  modalityCheckbox: {
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
    },
  },
  modalityActions: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

const Library = () => {
  const classes = useStyles();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search states
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [studySearchQuery, setStudySearchQuery] = useState('');
  
  // Use custom hooks for filtering and sorting
  const patientFiltersHook = usePatientFilters(patients, patientSearchQuery);
  const studyFiltersHook = useStudyFilters(selectedPatient, studySearchQuery);
  
  // Modal states
  const [patientInfoModal, setPatientInfoModal] = useState({
    open: false,
    patient: null,
  });
  const [studyInfoModal, setStudyInfoModal] = useState({
    open: false,
    study: null,
  });
  
  // Share modal states
  const [shareModal, setShareModal] = useState({
    open: false,
    type: null, // 'patient' or 'study'
    item: null,
  });

  // Upload modal states
  const [uploadModal, setUploadModal] = useState({
    open: false,
    progress: 0,
    status: 'uploading', // 'uploading', 'success', 'error'
    message: '',
  });

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Restore selected patient from navigation state
  useEffect(() => {
    if (location.state?.patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === location.state.patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [location.state, patients]);

  // Clear study search when selected patient changes
  useEffect(() => {
    setStudySearchQuery('');
  }, [selectedPatient]);

  /**
   * Load all accessible patients from the library service
   * Updates patients state and handles loading state
   */
  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const response = await libraryService.listAccessiblePatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout and redirect to login page
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /**
   * Trigger folder picker for DICOM file upload
   * Creates a hidden file input with directory selection enabled
   */
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        await processUpload(files);
      }
    };
    
    input.click();
  };

  /**
   * Process selected files for DICOM upload
   * Filters for valid DICOM files, uploads them, and updates UI with progress
   * @param {File[]} files - Array of files from directory selection
   */
  const processUpload = async (files) => {
    // Filter DICOM files
    const dicomFiles = [];
    for (const file of files) {
      const isDicom = await isDicomFile(file);
      if (isDicom) {
        dicomFiles.push(file);
      }
    }

    if (dicomFiles.length === 0) {
      alert('No DICOM files found in the selected folder.');
      return;
    }

    // Show upload modal
    setUploadModal({
      open: true,
      progress: 0,
      status: 'uploading',
      message: '',
    });

    try {
      // Call upload service with progress callback
      const result = await libraryService.uploadDicomFolder(
        dicomFiles,
        (progress) => {
          setUploadModal(prev => ({
            ...prev,
            progress: progress,
          }));
        }
      );

      if (result.success) {
        // Set to 100% and show success
        setUploadModal({
          open: true,
          progress: 100,
          status: 'success',
          message: `Successfully uploaded ${dicomFiles.length} DICOM file(s)!`,
        });

        // Refresh patient list after short delay
        setTimeout(async () => {
          await loadPatients();
          // Close modal immediately without showing uploading state
          setUploadModal({
            open: false,
            progress: 0,
            status: 'success',
            message: '',
          });
        }, 1000);
      } else {
        setUploadModal({
          open: true,
          progress: 0,
          status: 'error',
          message: result.message || 'Upload failed. Please try again.',
        });

        // Close error modal after delay
        setTimeout(() => {
          setUploadModal({
            open: false,
            progress: 0,
            status: 'uploading',
            message: '',
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadModal({
        open: true,
        progress: 0,
        status: 'error',
        message: 'An error occurred during upload. Please try again.',
      });

      setTimeout(() => {
        setUploadModal({
          open: false,
          progress: 0,
          status: 'uploading',
          message: '',
        });
      }, 3000);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientInfo = (e, patient) => {
    e.stopPropagation(); // Prevent card selection
    setPatientInfoModal({ open: true, patient });
  };

  const handlePatientShare = (e, patient) => {
    e.stopPropagation(); // Prevent card selection
    setShareModal({ open: true, type: 'patient', item: patient });
  };

  /**
   * Open study in viewer in a new browser tab
   * @param {Object} study - Study object with id
   */
  const handleStudyClick = (study) => {
    // Open viewer in a new tab
    const base = `${window.location.origin}${process.env.PUBLIC_URL || ''}`;
    const viewerUrl = `${base}/#/viewer/${study.id}`;
    window.open(viewerUrl, '_blank');
  };

  const handleStudyInfo = (e, study) => {
    e.stopPropagation(); // Prevent card click
    setStudyInfoModal({ open: true, study });
  };

  const handleStudyShare = (e, study) => {
    e.stopPropagation(); // Prevent card click
    setShareModal({ open: true, type: 'study', item: study });
  };

  /**
   * Share patient or study with another user via email
   * @param {string} email - Target user's email address
   * @returns {Promise<Object>} Result object with success status and message
   */
  const handleShare = async (email) => {
    const { type, item } = shareModal;
    
    if (type === 'patient') {
      return await libraryService.sharePatient(item.id, email);
    } else if (type === 'study') {
      return await libraryService.shareStudy(item.id, email);
    }
    
    return { success: false, message: 'Invalid share type' };
  };

  /**
   * Transform patient object into display-ready key-value pairs for info modal
   * @param {Object} patient - Patient object
   * @returns {Object} Key-value pairs for display
   */
  const getPatientInfoData = (patient) => {
    if (!patient) return {};
    return {
      'Name': patient.name,
      'Date of Birth': patient.dob,
      'Patient ID': patient.phiSummary.patientId,
      'Sex': patient.phiSummary.sex,
      'Age': patient.phiSummary.age ? patient.phiSummary.age : 'N/A',
      'MRN': patient.metadata.mrn || 'N/A',
    };
  };

  /**
   * Transform study object into display-ready key-value pairs for info modal
   * @param {Object} study - Study object
   * @returns {Object} Key-value pairs for display
   */
  const getStudyInfoData = (study) => {
    if (!study) return {};
    return {
      'Description': study.description,
      'Study Date': study.date,
      'Study Time': study.time || 'N/A',
      'Modality': study.modality,
      'Study ID': study.metadata.studyID || 'N/A',
      'Accession Number': study.metadata.accessionNumber || 'N/A',
      'Institution Name': study.metadata.institutionName || 'N/A',
    };
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Tooltip title="Upload DICOM Files">
            <IconButton
              onClick={handleUpload}
            >
              <Icon path={mdiFolderUploadOutline} size={1} />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Log Out">
          <IconButton
            onClick={handleLogout}
          >
            <Icon path={mdiLogout} size={1} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Content - Two Panes */}
      <Box className={classes.content}>
        {/* Left Pane - Patient List */}
        <Box className={classes.pane}>
          <Typography variant="h6" className={classes.paneTitle}>
            Patients
          </Typography>
          
          <Box className={classes.searchContainer}>
            {/* Patient search - disabled when loading or no patients exist */}
            <TextField
              className={classes.searchField}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Search by name, patient ID, or MRN..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              disabled={isLoading || patients.length === 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon path={mdiMagnify} size={1} />
                  </InputAdornment>
                ),
                endAdornment: patientSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setPatientSearchQuery('')}
                      edge="end"
                    >
                      <Icon path={mdiClose} size={1} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* Patient sort and filter controls */}
          <Box className={classes.sortFilterContainer}>
            {/* Left side - Sort controls */}
            <Box className={classes.sortLeft}>
              <Typography className={classes.sortLabel}>Sort by:</Typography>
              <Select
                className={classes.patientSortSelect}
                value={patientFiltersHook.patientSort.key}
                onChange={(e) => {
                  patientFiltersHook.setPatientSort({ 
                    key: e.target.value, 
                    direction: patientFiltersHook.patientSort.direction 
                  });
                }}
                disabled={isLoading || patients.length === 0}
                size="small"
                variant="outlined"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="dob">Date of Birth</MenuItem>
              </Select>
              <Tooltip title={
                (() => {
                  const { key, direction } = patientFiltersHook.patientSort;
                  if (key === 'name') {
                    return direction === 'asc' ? 'A - Z' : 'Z - A';
                  } else if (key === 'dob') {
                    return direction === 'asc' ? 'Oldest - Youngest' : 'Youngest - Oldest';
                  }
                  return '';
                })()
              }>
                <IconButton
                  onClick={() => {
                    patientFiltersHook.setPatientSort({
                      key: patientFiltersHook.patientSort.key,
                      direction: patientFiltersHook.patientSort.direction === 'asc' ? 'desc' : 'asc'
                    });
                  }}
                  disabled={isLoading || patients.length === 0}
                  size="small"
                >
                  <Icon 
                    path={patientFiltersHook.patientSort.direction === 'asc' ? mdiSortAscending : mdiSortDescending} 
                    size={1} 
                  />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Right side - DOB Filter */}
            <Box className={classes.filterRight}>
              <Typography className={classes.filterLabel}>Date of Birth:</Typography>
              <TextField
                className={classes.filterInput}
                variant="outlined"
                size="small"
                type="number"
                placeholder="Min Year"
                value={patientFiltersHook.tempDobFrom}
                onChange={patientFiltersHook.handleDobFromChange}
                onBlur={patientFiltersHook.handleDobFromBlur}
                disabled={isLoading || patients.length === 0}
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear(),
                }}
              />
              <Typography className={classes.filterToText}>to</Typography>
              <TextField
                className={classes.filterInput}
                variant="outlined"
                size="small"
                type="number"
                placeholder="Max Year"
                value={patientFiltersHook.tempDobTo}
                onChange={patientFiltersHook.handleDobToChange}
                onBlur={patientFiltersHook.handleDobToBlur}
                disabled={isLoading || patients.length === 0}
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear(),
                }}
              />
              <Button
                className={classes.filterButton}
                onClick={patientFiltersHook.handleApplyDobFilter}
                disabled={isLoading || patients.length === 0 || (!patientFiltersHook.tempDobFrom && !patientFiltersHook.tempDobTo)}
                size="small"
                variant="contained"
                color="primary"
              >
                Apply
              </Button>
              <Button
                className={classes.filterButton}
                onClick={patientFiltersHook.handleClearDobFilter}
                disabled={isLoading || patients.length === 0}
                size="small"
                variant="outlined"
              >
                Clear
              </Button>
            </Box>
          </Box>
          
          {isLoading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : patients.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="h6" className={classes.emptyStateText}>
                No DICOM studies available yet. Click 'Upload' to add your first study.
              </Typography>
            </Box>
          ) : patientFiltersHook.filteredPatients.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                No patients match your search and/or filters.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {patientFiltersHook.filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className={`${classes.patientCard} ${
                    selectedPatient?.id === patient.id ? classes.selectedCard : ''
                  }`}
                  onClick={() => handlePatientClick(patient)}
                >
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box>
                        <Typography className={classes.patientName}>
                          {patient.name}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          DOB: {patient.dob}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          Patient ID: {patient.phiSummary.patientId}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          {patient.phiSummary.sex} • {patient.phiSummary.age ? patient.phiSummary.age : 'N/A'}
                        </Typography>
                      </Box>
                      <Box className={classes.cardActions}>
                        <Tooltip title="Patient Information">  
                          <IconButton 
                            size="small"
                            onClick={(e) => handlePatientInfo(e, patient)}
                          >
                            <Icon path={mdiInformation} size={1} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share Patient">
                          <IconButton 
                            size="small"
                            onClick={(e) => handlePatientShare(e, patient)}
                          >
                            <Icon path={mdiShareVariant} size={1} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Right Pane - Study List */}
        <Box className={classes.pane}>
          <Typography variant="h6" className={classes.paneTitle}>
            Studies
          </Typography>
          
          <Box className={classes.searchContainer}>
            {/* Study search - disabled when no patient selected or selected patient has no studies */}
            <TextField
              className={classes.searchField}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Search by description, modality, study ID, or accession number..."
              value={studySearchQuery}
              onChange={(e) => setStudySearchQuery(e.target.value)}
              disabled={!selectedPatient || selectedPatient.studies.length === 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon path={mdiMagnify} size={1} />
                  </InputAdornment>
                ),
                endAdornment: studySearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setStudySearchQuery('')}
                      edge="end"
                    >
                      <Icon path={mdiClose} size={1} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* Study sort controls */}
          <Box className={classes.sortFilterContainer}>
            <Box className={classes.sortLeft}>
              <Typography className={classes.sortLabel}>Sort by:</Typography>
              <Select
                className={classes.studySortSelect}
                value={studyFiltersHook.studySort.key}
                onChange={(e) => {
                  studyFiltersHook.setStudySort({ 
                    key: e.target.value, 
                    direction: studyFiltersHook.studySort.direction 
                  });
                }}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                size="small"
                variant="outlined"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="description">Description</MenuItem>
              </Select>
              <Tooltip title={
                (() => {
                  const { key, direction } = studyFiltersHook.studySort;
                  if (key === 'date') {
                    return direction === 'asc' ? 'Oldest - Newest' : 'Newest - Oldest';
                  } else if (key === 'description') {
                    return direction === 'asc' ? 'A - Z' : 'Z - A';
                  }
                  return '';
                })()
              }>
                <IconButton
                  onClick={() => {
                    studyFiltersHook.setStudySort({
                      key: studyFiltersHook.studySort.key,
                      direction: studyFiltersHook.studySort.direction === 'asc' ? 'desc' : 'asc'
                    });
                  }}
                  disabled={!selectedPatient || selectedPatient.studies.length === 0}
                  size="small"
                >
                  <Icon 
                    path={studyFiltersHook.studySort.direction === 'asc' ? mdiSortAscending : mdiSortDescending} 
                    size={1} 
                  />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Study date filter - right aligned */}
            <Box className={classes.filterRight}>
              <Typography className={classes.filterLabel}>Modality:</Typography>
              
              {/* Modality filter dropdown */}
              <Button
                className={`${classes.modalityButton} ${studyFiltersHook.modalityPopoverOpen ? 'open' : ''}`}
                onClick={studyFiltersHook.handleModalityClick}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                size="small"
                variant="outlined"
                endIcon={<Icon path={studyFiltersHook.modalityPopoverOpen ? mdiMenuUp : mdiMenuDown} size={1} />}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {studyFiltersHook.modalityFilterLabel}
                </span>
              </Button>
              
              <Typography className={classes.filterLabel}>Study Date:</Typography>
              <KeyboardDatePicker
                className={classes.filterDatePicker}
                views={['year', 'month']}
                format="MM/yyyy"
                openTo="year"
                value={studyFiltersHook.tempDateFrom}
                onChange={(date) => studyFiltersHook.setTempDateFrom(date)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                variant="inline"
                inputVariant="outlined"
                size="small"
                autoOk
                placeholder="MM/YYYY"
                keyboardIcon={<Icon path={mdiCalendar} size={0.9} />}
                KeyboardButtonProps={{
                  'aria-label': 'change from date',
                }}
                InputProps={{
                  readOnly: true,
                  onClick: (e) => {
                    const iconButton = e.currentTarget.parentElement.querySelector('.MuiIconButton-root');
                    if (iconButton) iconButton.click();
                  },
                }}
              />
              <Typography className={classes.filterToText}>to</Typography>
              <KeyboardDatePicker
                className={classes.filterDatePicker}
                views={['year', 'month']}
                format="MM/yyyy"
                openTo="year"
                value={studyFiltersHook.tempDateTo}
                onChange={(date) => studyFiltersHook.setTempDateTo(date)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                variant="inline"
                inputVariant="outlined"
                size="small"
                autoOk
                placeholder="MM/YYYY"
                keyboardIcon={<Icon path={mdiCalendar} size={0.9} />}
                KeyboardButtonProps={{
                  'aria-label': 'change to date',
                }}
                InputProps={{
                  readOnly: true,
                  onClick: (e) => {
                    const iconButton = e.currentTarget.parentElement.querySelector('.MuiIconButton-root');
                    if (iconButton) iconButton.click();
                  },
                }}
              />
              <Button
                className={classes.filterButton}
                onClick={studyFiltersHook.handleApplyStudyDateFilter}
                disabled={
                  !selectedPatient || 
                  selectedPatient.studies.length === 0 ||
                  (!studyFiltersHook.tempDateFrom && !studyFiltersHook.tempDateTo)
                }
                size="small"
                variant="contained"
                color="primary"
              >
                Apply
              </Button>
              <Button
                className={classes.filterButton}
                onClick={studyFiltersHook.handleClearStudyDateFilter}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                size="small"
                variant="outlined"
              >
                Clear
              </Button>
            </Box>
          </Box>
          
          {!selectedPatient ? (
            <Box className={classes.emptyState}>
              <Typography variant="h6" className={classes.emptyStateText}>
                Select a patient to view their studies
              </Typography>
            </Box>
          ) : selectedPatient.studies.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                No studies available.
              </Typography>
            </Box>
          ) : studyFiltersHook.filteredStudies.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                No studies match your search and/or filters.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {studyFiltersHook.filteredStudies.map((study) => (
                <Card
                  key={study.id}
                  className={classes.studyCard}
                  onClick={() => handleStudyClick(study)}
                >
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box>
                        <Typography className={classes.studyDescription}>
                          {study.description}
                        </Typography>
                        <Typography className={classes.studyInfo}>
                          Study Date: {study.date}
                        </Typography>
                        <Typography className={classes.studyInfo}>
                          Modality: {study.modality}
                        </Typography>
                        <Typography className={classes.studyInfo}>
                          Accession Number: {study.metadata.accessionNumber}
                        </Typography>
                      </Box>
                      <Box className={classes.cardActions}>
                        <Tooltip title="Study Information"> 
                          <IconButton 
                            size="small"
                            onClick={(e) => handleStudyInfo(e, study)}
                          >
                            <Icon path={mdiInformation} size={1} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share Study">
                          <IconButton 
                            size="small"
                            onClick={(e) => handleStudyShare(e, study)}
                          >
                            <Icon path={mdiShareVariant} size={1} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Modality Filter Popover */}
      <Popover
        open={studyFiltersHook.modalityPopoverOpen}
        anchorEl={studyFiltersHook.modalityAnchorEl}
        onClose={studyFiltersHook.handleModalityClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.modalityPopover}
        disableAutoFocus
        disableEnforceFocus
      >
        <FormControl component="fieldset" fullWidth>
          <FormGroup>
            {studyFiltersHook.availableModalities.map(({ modality, count }) => (
              <FormControlLabel
                key={modality}
                className={classes.modalityCheckbox}
                control={
                  <Checkbox
                    checked={studyFiltersHook.selectedModalities.includes(modality)}
                    onChange={() => studyFiltersHook.handleModalityToggle(modality)}
                    size="small"
                    color="primary"
                  />
                }
                label={`${modality} (${count})`}
              />
            ))}
          </FormGroup>
          <Box className={classes.modalityActions}>
            <FormControlLabel
              className={classes.modalityCheckbox}
              control={
                <Checkbox
                  checked={
                    studyFiltersHook.availableModalities.length > 0 &&
                    studyFiltersHook.selectedModalities.length === studyFiltersHook.availableModalities.length
                  }
                  onChange={(e) => {
                    // Only allow checking (reset to default). Never allow "none selected".
                    if (e.target.checked) studyFiltersHook.handleSelectAllModalities();
                  }}
                  size="small"
                  color="primary"
                  disabled={studyFiltersHook.availableModalities.length === 0}
                />
              }
              label="Select All"
            />
          </Box>
        </FormControl>
      </Popover>

      {/* Patient Info Modal */}
      <InfoModal
        open={patientInfoModal.open}
        onClose={() => setPatientInfoModal({ open: false, patient: null })}
        title="Patient Information"
        data={getPatientInfoData(patientInfoModal.patient)}
      />

      {/* Study Info Modal */}
      <InfoModal
        open={studyInfoModal.open}
        onClose={() => setStudyInfoModal({ open: false, study: null })}
        title="Study Information"
        data={getStudyInfoData(studyInfoModal.study)}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareModal.open}
        onClose={() => setShareModal({ open: false, type: null, item: null })}
        onShare={handleShare}
        title="Share With"
        itemType={shareModal.type === 'patient' ? 'Patient' : 'Study'}
      />

      {/* Upload Modal */}
      <UploadModal
        open={uploadModal.open}
        progress={uploadModal.progress}
        status={uploadModal.status}
        message={uploadModal.message}
      />
    </Box>
    </MuiPickersUtilsProvider>
  );
};

export default Library;