import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
// import TestLogin from './TestLogin';
import TestSignUp from './TestSignUp';  // Test SignUp page

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TestSignUp />
  </React.StrictMode>
);