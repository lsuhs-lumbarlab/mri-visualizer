import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme/theme';
import SignUpSuccess from './pages/SignUpSuccess';

function TestSignUpSuccess() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <SignUpSuccess />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default TestSignUpSuccess;