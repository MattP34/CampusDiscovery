/**
 * File for creating the server for serving client side files.
 */

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Welcome from './welcome';
import Configuration from './configuration';
import Events from './events';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<Welcome/>} />
          <Route path='/configuration' element={<Configuration/>} />
          <Route path='/events' element={<Events/>} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
);
