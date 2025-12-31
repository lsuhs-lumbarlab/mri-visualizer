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
    console.log('🚫 Unauthorized access attempt to:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('✅ Authorized access to:', location.pathname);
  // Render the protected component
  return children;
};

export default ProtectedRoute;