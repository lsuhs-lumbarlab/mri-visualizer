import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@material-ui/core';

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (authState.isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  // Store the current location in state so we can redirect back after login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;