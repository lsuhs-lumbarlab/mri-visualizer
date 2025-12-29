import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
  infoRow: {
    display: 'flex',
    marginBottom: theme.spacing(1.5),
  },
  label: {
    fontWeight: 600,
    minWidth: 150,
    color: theme.palette.text.secondary,
  },
  value: {
    color: theme.palette.text.primary,
  },
}));

const InfoModal = ({ open, onClose, title, data }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.titleText}>{title}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {data && Object.entries(data).map(([key, value]) => (
          <Box key={key} className={classes.infoRow}>
            <Typography className={classes.label}>{key}:</Typography>
            <Typography className={classes.value}>{value || 'N/A'}</Typography>
          </Box>
        ))}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;