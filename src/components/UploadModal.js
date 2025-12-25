import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  LinearProgress,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dialogPaper: {
    minWidth: 400,
  },
  title: {
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
  },
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
  },
  percentageText: {
    textAlign: 'center',
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    fontSize: '1.2rem',
    color: theme.palette.primary.main,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  alert: {
    marginTop: theme.spacing(2),
  },
  statusText: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const UploadModal = ({ open, progress, status, message }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        className: classes.backdrop,
      }}
      PaperProps={{
        className: classes.dialogPaper,
      }}
    >
      <DialogTitle className={classes.title}>
        <Typography variant="h6">
          {status === 'uploading' && 'Uploading Files...'}
          {status === 'success' && 'Upload Complete'}
          {status === 'error' && 'Upload Failed'}
        </Typography>
      </DialogTitle>

      <DialogContent className={classes.content}>
        {status === 'uploading' && (
          <Box className={classes.progressContainer}>
            <Typography className={classes.percentageText}>
              {progress}% uploaded
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              className={classes.progressBar}
            />
            <Typography className={classes.statusText}>
              Please wait while we upload your files...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Alert severity="success" className={classes.alert}>
            {message || 'Files uploaded successfully!'}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" className={classes.alert}>
            {message || 'An error occurred during upload. Please try again.'}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;