import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Typography } from '@material-ui/core';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
}));

const Library = () => {
  const classes = useStyles();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpload = () => {
    // Placeholder for Step 6
    console.log('Upload clicked - will implement in Step 6');
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
          <Box className={classes.emptyState}>
            <Typography variant="h6" className={classes.emptyStateText}>
              No DICOM studies available yet. Click 'Upload' to add your first study.
            </Typography>
          </Box>
        </Box>

        {/* Right Pane - Study List */}
        <Box className={classes.pane}>
          <Box className={classes.emptyState}>
            <Typography variant="body1" className={classes.emptyStateText}>
              Select a patient to view their studies
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Library;