import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import FeatureFlagProvider from './featureFlags/FeatureFlagProvider';
import BasketProvider from './basket/BasketProvider';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeatureFlagProvider>
        <BasketProvider>
          <App />
        </BasketProvider>
      </FeatureFlagProvider>
    </BrowserRouter>
  </React.StrictMode>
);
