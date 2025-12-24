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
  MenuItem,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Visibility, VisibilityOff, ArrowBack } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  },
  title: {
    marginBottom: theme.spacing(3),
    textAlign: 'center',
    fontWeight: 600,
    color: '#ffffff',
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
  backLink: {
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
  successAlert: {
    marginBottom: theme.spacing(2),
  },
}));

const userTypes = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'patient', label: 'Patient' },
];

const SignUp = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    userType: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    userType: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // User type validation
    if (!formData.userType) {
      newErrors.userType = 'Please select a user type';
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
    
    // Call signup
    setIsLoading(true);
    const result = await signup({
      username: formData.username,
      password: formData.password,
      userType: formData.userType,
    });
    setIsLoading(false);
    
    if (result.success) {
      // Redirect to success page
      navigate('/signup/success');
    } else {
      setApiError(result.error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
          Create Account
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
            select
            label="User Type"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            error={!!errors.userType}
            helperText={errors.userType}
            className={classes.textField}
            variant="outlined"
            disabled={isLoading}
          >
            {userTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

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
            autoComplete="new-password"
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

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            className={classes.textField}
            variant="outlined"
            autoComplete="new-password"
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleConfirmPasswordVisibility}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              'Create Account'
            )}
          </Button>
        </form>

        <Box className={classes.backLink}>
          <Typography variant="body2" component="span" style={{ color: '#ffffff' }}>
            Already have an account?{' '}
          </Typography>
          <Button
            color="primary"
            className={classes.linkButton}
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default SignUp;