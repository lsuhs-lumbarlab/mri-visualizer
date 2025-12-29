import {
  Paper,
  Button,
  Typography,
} from '@material-ui/core';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2d2d2d',
    margin: '0 auto',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 80,
    color: '#4caf50',
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    color: '#ffffff',
    fontWeight: 600,
  },
  message: {
    marginBottom: theme.spacing(4),
    color: '#cccccc',
  },
  button: {
    height: 48,
  },
}));

const SignUpSuccess = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <CheckCircleIcon className={classes.successIcon} />
        
        <Typography variant="h4" className={classes.title}>
          Account Created!
        </Typography>
        
        <Typography variant="body1" className={classes.message}>
          Your account has been created successfully. You can now sign in with your credentials.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleGoToLogin}
        >
          Go to Sign In
        </Button>
      </Paper>
    </div>
  );
};

export default SignUpSuccess;