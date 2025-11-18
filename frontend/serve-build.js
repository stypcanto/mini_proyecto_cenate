const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy para /api
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true
}));

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'build')));

// Manejar rutas de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Proxy /api -> http://localhost:8080`);
});
