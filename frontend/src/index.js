// ========================================================================
// ⚛️ index.js – Punto de entrada CRA (CENATE 2025)
// ------------------------------------------------------------------------
// Corrige el orden de importación de estilos para coherencia visual
// entre desarrollo y producción (Tailwind + CSS base).
// ========================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';

// 🎨 Estilos base y mejoras primero
import './Styles/globals.css';
import './Styles/styles.css';
import './Styles/improvements.css';

// 🧩 Tailwind siempre al final (para aplicar sus utilidades correctamente)
import './index.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);