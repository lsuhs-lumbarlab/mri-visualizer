import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';
import { 
  Info as InfoIcon, 
  Share as ShareIcon,
  CreateNewFolder as CreateNewFolderIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import libraryService from '../services/libraryService';
import { formatDicomDate } from '../utils/dateTimeFormatter';
import InfoModal from '../components/InfoModal';
import ShareModal from '../components/ShareModal';
import UploadModal from '../components/UploadModal';
import { isDicomFile } from '../services/dicomLoader';

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
    padding: theme.spacing(2, 3),
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
}));

const Library = () => {
  const classes = useStyles();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
      message: `Uploading ${dicomFiles.length} DICOM files...`,
    });

    try {
      // Upload files to backend
      const response = await libraryService.uploadDicomFiles(
        dicomFiles,
        (progress) => {
          setUploadModal(prev => ({
            ...prev,
            progress: progress,
          }));
        }
      );

      if (response.success) {
        setUploadModal({
          open: true,
          progress: 100,
          status: 'success',
          message: 'Files uploaded successfully!',
        });

        // Reload patients after successful upload
        setTimeout(async () => {
          await loadPatients();
          setUploadModal({ open: false, progress: 0, status: 'uploading', message: '' });
        }, 2000);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadModal({
        open: true,
        progress: 0,
        status: 'error',
        message: error.message || 'Upload failed. Please try again.',
      });

      // Auto-close error modal after 3 seconds
      setTimeout(() => {
        setUploadModal({ open: false, progress: 0, status: 'uploading', message: '' });
      }, 3000);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleStudyClick = (study) => {
    // Navigate to viewer with studyInstanceUID and pass patientId for back navigation
    navigate(`/viewer/${study.metadata.studyInstanceUID}`, {
      state: { patientId: selectedPatient?.id }
    });
  };

  const handlePatientInfo = (e, patient) => {
    e.stopPropagation();
    setPatientInfoModal({ open: true, patient });
  };

  const handleStudyInfo = (e, study) => {
    e.stopPropagation();
    setStudyInfoModal({ open: true, study });
  };

  const handlePatientShare = (e, patient) => {
    e.stopPropagation();
    setShareModal({ open: true, type: 'patient', item: patient });
  };

  const handleStudyShare = (e, study) => {
    e.stopPropagation();
    setShareModal({ open: true, type: 'study', item: study });
  };

  const handleShare = async (shareData) => {
    try {
      const response = await libraryService.createShareLink({
        itemType: shareModal.type,
        itemId: shareModal.item.id,
        ...shareData,
      });

      if (response.success) {
        alert(`Share link created: ${response.data.shareUrl}`);
        setShareModal({ open: false, type: null, item: null });
      } else {
        throw new Error(response.error || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Failed to create share link. Please try again.');
    }
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
      'Address': patient.metadata.address || 'N/A',
      'Phone': patient.metadata.phone || 'N/A',
      'Email': patient.metadata.email || 'N/A',
    };
  };

  // Prepare study info data for modal
  const getStudyInfoData = (study) => {
    if (!study) return {};
    return {
      'Description': study.description,
      'Study Date': study.date,
      'Modality': study.modality,
      'Accession Number': study.metadata.accessionNumber,
      'Study Instance UID': study.metadata.studyInstanceUID,
      'Referring Physician': study.metadata.referringPhysician,
    };
  };

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Tooltip title="Upload DICOM Files">
            <IconButton
              className={classes.iconButton}
              onClick={handleUpload}
            >
              {/* <CreateNewFolderIcon /> */}
              <DriveFolderUploadIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box className={classes.headerRight}>
          <Tooltip title="Logout">
            <IconButton
              className={classes.iconButton}
              onClick={handleLogout}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content - Two Panes */}
      <Box className={classes.content}>
        {/* Left Pane - Patient List */}
        <Box className={classes.pane}>
          <Typography variant="h6" className={classes.paneTitle}>
            Patients
          </Typography>
          
          {isLoading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : patients.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography variant="h6" className={classes.emptyStateText}>
                No DICOM studies available yet. Click the upload icon to add your first study.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {patients.map((patient) => (
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
                          MRN: {patient.phiSummary.patientId}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          {patient.phiSummary.sex} • {patient.phiSummary.age ? patient.phiSummary.age : 'N/A'}
                        </Typography>
                      </Box>
                      <Box className={classes.cardActions}>
                        <IconButton 
                          size="small"
                          onClick={(e) => handlePatientInfo(e, patient)}
                        >
                          <InfoIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={(e) => handlePatientShare(e, patient)}
                        >
                          <ShareIcon />
                        </IconButton>
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
          
          {!selectedPatient ? (
            <Box className={classes.emptyState}>
              <Typography variant="body1" className={classes.emptyStateText}>
                Select a patient to view their studies
              </Typography>
            </Box>
          ) : (
            <Box className={classes.scrollableList}>
              {selectedPatient.studies.map((study) => (
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
                          Accession: {study.metadata.accessionNumber}
                        </Typography>
                      </Box>
                      <Box className={classes.cardActions}>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleStudyInfo(e, study)}
                        >
                          <InfoIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleStudyShare(e, study)}
                        >
                          <ShareIcon />
                        </IconButton>
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