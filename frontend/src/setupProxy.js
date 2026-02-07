/**
 * setupProxy.js - Configuración de proxy para Create React App (desarrollo)
 *
 * Añade middleware para establecer headers HTTP permisivos que permitan
 * acceso a micrófono y cámara en iframes embebidos (como Jitsi)
 *
 * Este archivo es automáticamente detectado y aplicado por Create React App
 * durante el desarrollo (npm start).
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Middleware para añadir headers permisivos ANTES de procesar cualquier ruta
  app.use((req, res, next) => {
    // 🎬 Permissions-Policy: Permite micrófono, cámara y otros permisos en embedded contexts
    res.setHeader('Permissions-Policy',
      'microphone=*, ' +
      'camera=*, ' +
      'geolocation=*, ' +
      'display-capture=*, ' +
      'accelerometer=*, ' +
      'gyroscope=*, ' +
      'magnetometer=*, ' +
      'usb=*, ' +
      'payment=*, ' +
      'ambient-light-sensor=*'
    );

    // 🎬 Feature-Policy: Versión deprecada pero aún soportada en algunos navegadores
    res.setHeader('Feature-Policy',
      'microphone \'self\' *; ' +
      'camera \'self\' *; ' +
      'geolocation \'self\' *; ' +
      'display-capture \'self\' *; ' +
      'accelerometer \'self\' *; ' +
      'gyroscope \'self\' *; ' +
      'magnetometer \'self\' *; ' +
      'usb \'self\' *; ' +
      'payment \'self\' *; ' +
      'ambient-light-sensor \'self\' *'
    );

    // ✅ X-Frame-Options: ALLOWALL para permitir ser embebida en iframes
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    // 📝 Headers adicionales útiles
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
  });

  // Proxy para API requests al backend (opcional - si es necesario)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
      onError: (err, req, res) => {
        console.error('❌ Error en proxy del API:', err.message);
      },
    })
  );
};
