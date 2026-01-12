import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Ensure a slash exists before the hash for hash-routing when deployed under a subpath
(function normalizeSlashBeforeHash() {
  const { pathname, hash, search } = window.location;

  // If we have a hash route, and pathname doesn't end with '/', normalize it.
  // Example: /mri-visualizer#/library -> /mri-visualizer/#/library
  if (hash && !pathname.endsWith('/')) {
    window.history.replaceState(null, '', `${pathname}/${search}${hash}`);
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);