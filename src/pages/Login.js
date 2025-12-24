import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
    const result = await login(formData.username, formData.password);
    setIsLoading(false);
    
    if (result.success) {
      // Redirect to viewer
      navigate('/app');
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
            MRI Visualizer
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
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              error={!!errors.username}
              helperText={errors.username}
              className={classes.textField}
              variant="outlined"
              autoComplete="username"
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
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Box className={classes.signupLink}>
            <Typography variant="body2" component="span" style={{ color: '#ffffff' }}>
              Don't have an account?{' '}
            </Typography>
            <Button
              color="primary"
              className={classes.linkButton}
              onClick={handleSignupClick}
              disabled={isLoading}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>
    </div>
  );
};

export default Login;