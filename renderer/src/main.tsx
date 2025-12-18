import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './pages/App';
import Reminder from './pages/Reminder';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reminder" element={<Reminder />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
