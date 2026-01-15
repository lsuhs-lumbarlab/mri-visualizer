import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '@mdi/react';

import {
  mdiEye, 
  mdiEyeOff  
} from '@mdi/js';

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a', // Dark background
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2d2d2d', // Darker paper background
    margin: '0 auto', // Ensure centering
  },
  title: {
    marginBottom: theme.spacing(3),
    textAlign: 'center',
    fontWeight: 600,
    color: '#ffffff', // White text for dark mode
  },
  form: {
    width: '100%',
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 48,
  },
  signupLink: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  linkButton: {
    textTransform: 'none',
    padding: 0,
    minWidth: 'auto',
  },
  errorAlert: {
    marginBottom: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authState } = useAuth();

  // Get the page user was trying to access (from ProtectedRoute)
  const from = location.state?.from || '/library';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [authState.isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setApiError('');
    
    // Validate
    if (!validateForm()) {
      return;
    }
    
    // Call login
    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  // Allow Enter key to submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" className={classes.title}>
            DICOM Viewer
          </Typography>
          
          <Typography variant="h6" style={{ marginBottom: 24, textAlign: 'center', color: '#ffffff' }}>
            Sign In
          </Typography>

          {apiError && (
            <Alert severity="error" className={classes.errorAlert}>
              {apiError}
            </Alert>
          )}

          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              error={!!errors.email}
              helperText={errors.email}
              className={classes.textField}
              variant="outlined"
              autoComplete="email"
              disabled={isLoading}
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              error={!!errors.password}
              helperText={errors.password}
              className={classes.textField}
              variant="outlined"
              autoComplete="current-password"
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? 'Hide Password' : 'Show Password'}>
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <Icon path={mdiEyeOff} size={1} /> : <Icon path={mdiEye} size={1} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submitButton}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Log In'}
            </Button>

            <Box className={classes.signupLink}>
              <Typography variant="body2" style={{ color: '#b0b0b0' }}>
                Don't have an account?{' '}
                <Button
                  color="primary"
                  className={classes.linkButton}
                  onClick={handleSignupClick}
                  disabled={isLoading}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </form>
      </Paper>
    </div>
  );
};

export default Login;