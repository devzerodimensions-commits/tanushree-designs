import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/base.css';
import './styles/site.css';

// The font stylesheet ships as media="print" so it cannot block the first
// paint; enable it as soon as the bundle runs.
for (const link of document.querySelectorAll('link[data-font-css]')) {
  link.media = 'all';
}

import App from './App.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  </React.StrictMode>
);
