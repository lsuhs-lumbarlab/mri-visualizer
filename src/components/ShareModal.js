import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import { Close as CloseIcon } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2, 2, 2, 3),
  },
  titleText: {
    flex: 1,
  },
  closeButton: {
    color: theme.palette.grey[500],
    padding: theme.spacing(0.5),
  },
  content: {
    paddingTop: theme.spacing(2),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
}));

const ShareModal = ({ open, onClose, onShare, title, itemType }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleShare = async () => {
    // Clear previous messages
    setError('');
    setSuccessMessage('');

    // Validate email
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Call share function
    setIsLoading(true);
    try {
      const result = await onShare(email.trim());
      
      if (result.success) {
        setSuccessMessage(`${itemType} shared successfully with ${email}`);
        // Clear email and close after delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to share. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleShare();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.titleText}>
          {title || 'SHARE WITH'}
        </Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className={classes.content}>
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" className={classes.alert}>
            {successMessage}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Email Address"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          placeholder="example@email.com"
        />
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleShare} 
          color="primary" 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'SHARE'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;