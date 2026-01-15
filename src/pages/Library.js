import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import libraryService from '../services/libraryService';
import { isDicomFile } from '../services/dicomLoader';
import { sortPatients, sortStudies } from '../utils/sortHelpers';
import { filterPatientsByDobYear, validateYearInput, filterStudiesByDateRange } from '../utils/filterHelpers';
import InfoModal from '../components/InfoModal';
import ShareModal from '../components/ShareModal';
import UploadModal from '../components/UploadModal';
import Icon from '@mdi/react';
import { makeStyles } from '@material-ui/core/styles';

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
} from '@material-ui/core';

import {
  Info as InfoIcon,
  Share as ShareIcon,
  DriveFolderUpload as DriveFolderUploadIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { 
  mdiSortAlphabeticalAscending, 
  mdiSortAlphabeticalDescending,
  mdiSortNumericAscending,
  mdiSortNumericDescending, 
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
    marginBottom: theme.spacing(1),
  },
  cardActions: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  patientName: {
    fontWeight: 600,
    fontSize: '1.1rem',
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
  sortContainer: {
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
  
  // Sort states
  const [patientSort, setPatientSort] = useState({
    key: 'name', // 'name' | 'dob'
    direction: 'asc' // 'asc' | 'desc'
  });
  
  const [studySort, setStudySort] = useState({
    key: 'date', // 'date' | 'description'
    direction: 'desc' // 'asc' | 'desc' (default newest first)
  });
  
  // Filter states
  const [patientFilters, setPatientFilters] = useState({
    dobYearFrom: null,
    dobYearTo: null,
  });
  
  const [studyFilters, setStudyFilters] = useState({
    dateFromMonth: null,
    dateFromYear: null,
    dateToMonth: null,
    dateToYear: null,
  });
  
  // Temporary filter inputs (before Apply)
  const [tempDobFrom, setTempDobFrom] = useState('');
  const [tempDobTo, setTempDobTo] = useState('');
  
  const [tempDateFromMonth, setTempDateFromMonth] = useState('');
  const [tempDateFromYear, setTempDateFromYear] = useState('');
  const [tempDateToMonth, setTempDateToMonth] = useState('');
  const [tempDateToYear, setTempDateToYear] = useState('');
  
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

  // Filtered and sorted patients
  // Pipeline: filter by DOB → filter by search → sort
  const sortedPatients = useMemo(() => {
    // Step 1: Filter by DOB year range
    let filtered = filterPatientsByDobYear(patients, patientFilters);
    
    // Step 2: Filter by search query
    if (patientSearchQuery.trim()) {
      const query = patientSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(patient => {
        const name = patient.name.toLowerCase();
        const patientId = patient.phiSummary.patientId.toLowerCase();
        const mrn = patient.metadata.mrn ? patient.metadata.mrn.toLowerCase() : '';
        
        return name.includes(query) || patientId.includes(query) || mrn.includes(query);
      });
    }
    
    // Step 3: Sort
    return sortPatients(filtered, patientSort);
  }, [patients, patientFilters, patientSearchQuery, patientSort]);

  // Filtered and sorted studies
  // Pipeline: filter by date range → filter by search → sort
  const sortedStudies = useMemo(() => {
    if (!selectedPatient) return [];
    
    // Step 1: Filter by date range
    let filtered = filterStudiesByDateRange(selectedPatient.studies, studyFilters);
    
    // Step 2: Filter by search query
    if (studySearchQuery.trim()) {
      const query = studySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(study => {
        const description = study.description.toLowerCase();
        const modality = study.modality.toLowerCase();
        const studyId = study.metadata.studyID ? study.metadata.studyID.toLowerCase() : '';
        const accessionNumber = study.metadata.accessionNumber ? study.metadata.accessionNumber.toLowerCase() : '';
        
        return description.includes(query) || modality.includes(query) || studyId.includes(query) || accessionNumber.includes(query);
      });
    }
    
    // Step 3: Sort
    return sortStudies(filtered, studySort);
  }, [selectedPatient, studyFilters, studySearchQuery, studySort]);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const handleDobFromChange = (e) => {
    const value = e.target.value;
    setTempDobFrom(value);
  };
  
  const handleDobToChange = (e) => {
    const value = e.target.value;
    setTempDobTo(value);
  };
  
  const handleDobFromBlur = () => {
    const validated = validateYearInput(tempDobFrom);
    setTempDobFrom(validated);
  };
  
  const handleDobToBlur = () => {
    const validated = validateYearInput(tempDobTo);
    setTempDobTo(validated);
  };
  
  const handleApplyDobFilter = () => {
    // Validate inputs first
    const validatedFrom = validateYearInput(tempDobFrom);
    const validatedTo = validateYearInput(tempDobTo);
    
    setTempDobFrom(validatedFrom);
    setTempDobTo(validatedTo);
    
    let fromYear = validatedFrom ? parseInt(validatedFrom) : null;
    let toYear = validatedTo ? parseInt(validatedTo) : null;
    
    // Auto-swap if from >= to
    if (fromYear !== null && toYear !== null && fromYear > toYear) {
      [fromYear, toYear] = [toYear, fromYear];
      setTempDobFrom(fromYear.toString());
      setTempDobTo(toYear.toString());
    }
    
    setPatientFilters({
      dobYearFrom: fromYear,
      dobYearTo: toYear,
    });
  };
  
  const handleClearDobFilter = () => {
    setTempDobFrom('');
    setTempDobTo('');
    setPatientFilters({
      dobYearFrom: null,
      dobYearTo: null,
    });
  };
  
  // Study date filter handlers
  const handleApplyStudyDateFilter = () => {
    const fromMonth = tempDateFromMonth ? parseInt(tempDateFromMonth) : null;
    const fromYear = tempDateFromYear ? parseInt(tempDateFromYear) : null;
    const toMonth = tempDateToMonth ? parseInt(tempDateToMonth) : null;
    const toYear = tempDateToYear ? parseInt(tempDateToYear) : null;
    
    // Build comparable dates (YYYYMM format for easy comparison)
    let from = null;
    let to = null;
    
    if (fromMonth !== null && fromYear !== null) {
      from = fromYear * 100 + fromMonth;
    }
    
    if (toMonth !== null && toYear !== null) {
      to = toYear * 100 + toMonth;
    }
    
    // Auto-swap if from > to
    if (from !== null && to !== null && from > to) {
      setTempDateFromMonth(toMonth.toString());
      setTempDateFromYear(toYear.toString());
      setTempDateToMonth(fromMonth.toString());
      setTempDateToYear(fromYear.toString());
      
      setStudyFilters({
        dateFromMonth: toMonth,
        dateFromYear: toYear,
        dateToMonth: fromMonth,
        dateToYear: fromYear,
      });
    } else {
      setStudyFilters({
        dateFromMonth: fromMonth,
        dateFromYear: fromYear,
        dateToMonth: toMonth,
        dateToYear: toYear,
      });
    }
  };
  
  const handleClearStudyDateFilter = () => {
    setTempDateFromMonth('');
    setTempDateFromYear('');
    setTempDateToMonth('');
    setTempDateToYear('');
    setStudyFilters({
      dateFromMonth: null,
      dateFromYear: null,
      dateToMonth: null,
      dateToYear: null,
    });
  };
  
  // Get available years from selected patient's studies
  const availableYears = useMemo(() => {
    if (!selectedPatient || selectedPatient.studies.length === 0) return [];
    
    const years = new Set();
    selectedPatient.studies.forEach(study => {
      if (study.date && study.date !== 'Unknown') {
        try {
          const date = new Date(study.date);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
    
    return Array.from(years).sort((a, b) => b - a); // Newest first
  }, [selectedPatient]);
  
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

  const handleShare = async (email) => {
    const { type, item } = shareModal;
    
    if (type === 'patient') {
      return await libraryService.sharePatient(item.id, email);
    } else if (type === 'study') {
      return await libraryService.shareStudy(item.id, email);
    }
    
    return { success: false, message: 'Invalid share type' };
  };

  // Prepare patient info data for modal
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

  // Prepare study info data for modal
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
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Tooltip title="Upload DICOM Files">
            <IconButton
              onClick={handleUpload}
            >
              <DriveFolderUploadIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Log Out">
          <IconButton
            onClick={handleLogout}
          >
            <LogoutIcon />
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
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: patientSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setPatientSearchQuery('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* Patient sort and filter controls */}
          <Box className={classes.sortContainer}>
            {/* Left side - Sort controls */}
            <Box className={classes.sortLeft}>
              <Typography className={classes.sortLabel}>Sort by:</Typography>
              <Tooltip title="A - Z">
                <Button
                  className={`${classes.sortButton} ${patientSort.key === 'name' && patientSort.direction === 'asc' && !isLoading && patients.length > 0 ? 'active' : ''}`}
                  onClick={() => setPatientSort({ key: 'name', direction: 'asc' })}
                  disabled={isLoading || patients.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Name
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortAlphabeticalAscending} size={1}/>
                  </span>
                </Button>
              </Tooltip>
              <Tooltip title="Z - A">
                <Button
                  className={`${classes.sortButton} ${patientSort.key === 'name' && patientSort.direction === 'desc' && !isLoading && patients.length > 0 ? 'active' : ''}`}
                  onClick={() => setPatientSort({ key: 'name', direction: 'desc' })}
                  disabled={isLoading || patients.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Name
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortAlphabeticalDescending} size={1.0}/>
                  </span>
                </Button>
              </Tooltip>
              <Tooltip title="Oldest - Youngest">
                <Button
                  className={`${classes.sortButton} ${patientSort.key === 'dob' && patientSort.direction === 'asc' && !isLoading && patients.length > 0 ? 'active' : ''}`}
                  onClick={() => setPatientSort({ key: 'dob', direction: 'asc' })}
                  disabled={isLoading || patients.length === 0}
                  size="small"
                  variant="outlined"
                >
                  DOB
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortNumericAscending} size={1}/>
                  </span>
                </Button>
              </Tooltip>
              <Tooltip title="Youngest - Oldest">
                <Button
                  className={`${classes.sortButton} ${patientSort.key === 'dob' && patientSort.direction === 'desc' && !isLoading && patients.length > 0 ? 'active' : ''}`}
                  onClick={() => setPatientSort({ key: 'dob', direction: 'desc' })}
                  disabled={isLoading || patients.length === 0}
                  size="small"
                  variant="outlined"
                >
                  DOB
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortNumericDescending} size={1}/>
                  </span>
                </Button>
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
                value={tempDobFrom}
                onChange={handleDobFromChange}
                onBlur={handleDobFromBlur}
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
                value={tempDobTo}
                onChange={handleDobToChange}
                onBlur={handleDobToBlur}
                disabled={isLoading || patients.length === 0}
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear(),
                }}
              />
              <Button
                className={classes.filterButton}
                onClick={handleApplyDobFilter}
                disabled={isLoading || patients.length === 0 || (!tempDobFrom && !tempDobTo)}
                size="small"
                variant="contained"
                color="primary"
              >
                Apply
              </Button>
              <Button
                className={classes.filterButton}
                onClick={handleClearDobFilter}
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
          ) : sortedPatients.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                No results match your current search and filters.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {sortedPatients.map((patient) => (
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
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share Patient">
                          <IconButton 
                            size="small"
                            onClick={(e) => handlePatientShare(e, patient)}
                          >
                            <ShareIcon />
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
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: studySearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setStudySearchQuery('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* Study sort controls */}
          <Box className={classes.sortContainer}>
            <Box className={classes.sortLeft}>
              <Typography className={classes.sortLabel}>Sort by:</Typography>
              <Tooltip title="Newest - Oldest">
                <Button
                  className={`${classes.sortButton} ${studySort.key === 'date' && studySort.direction === 'desc' && selectedPatient && selectedPatient.studies.length > 0 ? 'active' : ''}`}
                  onClick={() => setStudySort({ key: 'date', direction: 'desc' })}
                  disabled={!selectedPatient || selectedPatient.studies.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Date
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortNumericDescending} size={1}/>
                  </span>
                </Button>
              </Tooltip>
              <Tooltip title="Oldest - Newest">
                <Button
                  className={`${classes.sortButton} ${studySort.key === 'date' && studySort.direction === 'asc' && selectedPatient && selectedPatient.studies.length > 0 ? 'active' : ''}`}
                  onClick={() => setStudySort({ key: 'date', direction: 'asc' })}
                  disabled={!selectedPatient || selectedPatient.studies.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Date
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortNumericAscending} size={1}/>
                  </span>
                </Button>
              </Tooltip>
              {/* <Tooltip title="A - Z">
                <Button
                  className={`${classes.sortButton} ${studySort.key === 'description' && studySort.direction === 'asc' && selectedPatient && selectedPatient.studies.length > 0 ? 'active' : ''}`}
                  onClick={() => setStudySort({ key: 'description', direction: 'asc' })}
                  disabled={!selectedPatient || selectedPatient.studies.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Description
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortAlphabeticalAscending} size={1}/>
                  </span>
                </Button>
              </Tooltip>
              <Tooltip title="Z - A">
                <Button
                  className={`${classes.sortButton} ${studySort.key === 'description' && studySort.direction === 'desc' && selectedPatient && selectedPatient.studies.length > 0 ? 'active' : ''}`}
                  onClick={() => setStudySort({ key: 'description', direction: 'desc' })}
                  disabled={!selectedPatient || selectedPatient.studies.length === 0}
                  size="small"
                  variant="outlined"
                >
                  Description
                  <span className={classes.sortIcon}>
                    <Icon path={mdiSortAlphabeticalDescending} size={1}/>
                  </span>
                </Button>
              </Tooltip> */}
            </Box>
            
            {/* Study date filter - right aligned */}
            <Box className={classes.filterRight}>
              <Typography className={classes.filterLabel}>Filter:</Typography>
              <Typography className={classes.filterLabel}>From</Typography>
              <Select
                className={classes.filterInput}
                value={tempDateFromMonth}
                onChange={(e) => setTempDateFromMonth(e.target.value)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                displayEmpty
                size="small"
                variant="outlined"
              >
                <MenuItem value="">Month</MenuItem>
                <MenuItem value="1">Jan</MenuItem>
                <MenuItem value="2">Feb</MenuItem>
                <MenuItem value="3">Mar</MenuItem>
                <MenuItem value="4">Apr</MenuItem>
                <MenuItem value="5">May</MenuItem>
                <MenuItem value="6">Jun</MenuItem>
                <MenuItem value="7">Jul</MenuItem>
                <MenuItem value="8">Aug</MenuItem>
                <MenuItem value="9">Sep</MenuItem>
                <MenuItem value="10">Oct</MenuItem>
                <MenuItem value="11">Nov</MenuItem>
                <MenuItem value="12">Dec</MenuItem>
              </Select>
              <Select
                className={classes.filterInput}
                value={tempDateFromYear}
                onChange={(e) => setTempDateFromYear(e.target.value)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                displayEmpty
                size="small"
                variant="outlined"
              >
                <MenuItem value="">Year</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
              <Typography className={classes.filterToText}>To</Typography>
              <Select
                className={classes.filterInput}
                value={tempDateToMonth}
                onChange={(e) => setTempDateToMonth(e.target.value)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                displayEmpty
                size="small"
                variant="outlined"
              >
                <MenuItem value="">Month</MenuItem>
                <MenuItem value="1">Jan</MenuItem>
                <MenuItem value="2">Feb</MenuItem>
                <MenuItem value="3">Mar</MenuItem>
                <MenuItem value="4">Apr</MenuItem>
                <MenuItem value="5">May</MenuItem>
                <MenuItem value="6">Jun</MenuItem>
                <MenuItem value="7">Jul</MenuItem>
                <MenuItem value="8">Aug</MenuItem>
                <MenuItem value="9">Sep</MenuItem>
                <MenuItem value="10">Oct</MenuItem>
                <MenuItem value="11">Nov</MenuItem>
                <MenuItem value="12">Dec</MenuItem>
              </Select>
              <Select
                className={classes.filterInput}
                value={tempDateToYear}
                onChange={(e) => setTempDateToYear(e.target.value)}
                disabled={!selectedPatient || selectedPatient.studies.length === 0}
                displayEmpty
                size="small"
                variant="outlined"
              >
                <MenuItem value="">Year</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
              <Button
                className={classes.filterButton}
                onClick={handleApplyStudyDateFilter}
                disabled={
                  !selectedPatient || 
                  selectedPatient.studies.length === 0 ||
                  (tempDateFromMonth === '' && tempDateFromYear === '' && tempDateToMonth === '' && tempDateToYear === '')
                }
                size="small"
                variant="contained"
                color="primary"
              >
                Apply
              </Button>
              <Button
                className={classes.filterButton}
                onClick={handleClearStudyDateFilter}
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
          ) : sortedStudies.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                No studies match your search.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {sortedStudies.map((study) => (
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
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share Study">
                          <IconButton 
                            size="small"
                            onClick={(e) => handleStudyShare(e, study)}
                          >
                            <ShareIcon />
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
  );
};

export default Library;