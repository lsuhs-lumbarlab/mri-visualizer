import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import SignUp from './pages/SignUp';

function TestSignUp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <SignUp />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default TestSignUp;