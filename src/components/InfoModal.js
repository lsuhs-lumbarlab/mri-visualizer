import { makeStyles } from '@material-ui/core/styles';
import Icon from '@mdi/react';

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

import {mdiClose} from '@mdi/js';

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
    minWidth: 160,
    color: theme.palette.text.secondary,
  },
  value: {
    color: theme.palette.text.primary,
  },
}));

const InfoModal = ({ open, onClose, title, data }) => {
  const classes = useStyles();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth
      PaperProps={{
        style: {
          minWidth: '600px',
          width: 'auto',
          maxWidth: '50vw',
        },
      }}
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.titleText}>{title}</Typography>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
        >
          <Icon path={mdiClose} size={1} />
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