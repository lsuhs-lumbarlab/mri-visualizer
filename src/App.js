import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUpSuccess from './pages/SignUpSuccess';
import ViewerApp from './pages/ViewerApp';
import Library from './pages/Library';

// Root redirect component - redirects based on auth state
function RootRedirect() {
  const { authState } = useAuth();
  
  if (authState.isLoading) {
    return null; // Let AuthProvider handle loading state
  }
  
  return authState.isAuthenticated ? (
    <Navigate to="/library" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root route - redirect based on auth */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/success" element={<SignUpSuccess />} />
            
            {/* Protected routes */}
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewer/:studyId"
              element={
                <ProtectedRoute>
                  <ViewerApp />
                </ProtectedRoute>
              }
            />
            {/* Legacy route for backwards compatibility */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <ViewerApp />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;