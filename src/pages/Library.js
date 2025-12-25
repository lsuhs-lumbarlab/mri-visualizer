import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { Info as InfoIcon, Share as ShareIcon } from '@material-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import libraryService from '../services/libraryService';
import InfoModal from '../components/InfoModal';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpload = () => {
    // Placeholder for Step 6
    console.log('Upload clicked - will implement in Step 6');
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
    // Placeholder for Step 5
    console.log('Patient share clicked:', patient);
  };

  const handleStudyClick = (study) => {
    // Navigate to viewer with studyId AND patientId in state
    navigate(`/viewer/${study.id}`, {
      state: { patientId: selectedPatient.id }
    });
  };

  const handleStudyInfo = (e, study) => {
    e.stopPropagation(); // Prevent card click
    setStudyInfoModal({ open: true, study });
  };

  const handleStudyShare = (e, study) => {
    e.stopPropagation(); // Prevent card click
    // Placeholder for Step 5
    console.log('Study share clicked:', study);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Prepare patient info data for modal
  const getPatientInfoData = (patient) => {
    if (!patient) return {};
    return {
      'Name': patient.name,
      'Date of Birth': formatDate(patient.dob),
      'Patient ID': patient.phiSummary.patientId,
      'Sex': patient.phiSummary.sex,
      'Age': `${patient.phiSummary.age} years`,
      'Address': patient.metadata.address,
      'Phone': patient.metadata.phone,
      'Email': patient.metadata.email,
    };
  };

  // Prepare study info data for modal
  const getStudyInfoData = (study) => {
    if (!study) return {};
    return {
      'Description': study.description,
      'Study Date': formatDate(study.date),
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
          >
            UPLOAD
          </Button>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogout}
        >
          LOG OUT
        </Button>
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
                No DICOM studies available yet. Click 'Upload' to add your first study.
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
                          DOB: {formatDate(patient.dob)}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          MRN: {patient.phiSummary.patientId}
                        </Typography>
                        <Typography className={classes.phiInfo}>
                          {patient.phiSummary.sex} • {patient.phiSummary.age} years old
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
                          Date: {formatDate(study.date)}
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
    </Box>
  );
};

export default Library;