import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import FeatureFlagProvider from './featureFlags/FeatureFlagProvider';
import BasketProvider from './basket/BasketProvider';
import LanguageProvider from './language/LanguageProvider';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeatureFlagProvider>
        <LanguageProvider>
          <BasketProvider>
            <App />
          </BasketProvider>
        </LanguageProvider>
      </FeatureFlagProvider>
    </BrowserRouter>
  </React.StrictMode>
);
