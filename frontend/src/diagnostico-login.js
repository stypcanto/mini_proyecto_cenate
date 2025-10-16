// ========================================================================
// 🔍 DIAGNÓSTICO Y FIX - Frontend Login Issue
// ========================================================================
// Este script verifica la conectividad entre frontend y backend
// ========================================================================

console.log("🔍 DIAGNÓSTICO DE LOGIN - CENATE");
console.log("================================\n");

// 1. Verificar variables de entorno
console.log("1️⃣ Variables de Entorno:");
console.log("   REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
console.log("   NODE_ENV:", process.env.NODE_ENV);
console.log("");

// 2. Verificar configuración de API
import { API_BASE } from './config/api';
console.log("2️⃣ API Base URL:");
console.log("   API_BASE:", API_BASE);
console.log("");

// 3. Test de conectividad
const testBackendConnection = async () => {
  console.log("3️⃣ Probando conectividad con backend...");
  
  try {
    // Test simple sin autenticación
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        username: "scantor",
        password: "admin123"
      })
    });

    console.log("   Status:", response.status);
    console.log("   Status Text:", response.statusText);
    
    const data = await response.json();
    console.log("   Response:", data);
    
    if (data.token) {
      console.log("   ✅ LOGIN EXITOSO!");
      console.log("   Token recibido:", data.token.substring(0, 50) + "...");
    } else {
      console.log("   ❌ Sin token en respuesta");
    }
    
  } catch (error) {
    console.error("   ❌ ERROR:", error.message);
    console.error("   Detalles:", error);
  }
};

// 4. Verificar CORS
const checkCORS = async () => {
  console.log("\n4️⃣ Verificando CORS...");
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "OPTIONS",
    });
    
    console.log("   CORS Headers:");
    console.log("   Access-Control-Allow-Origin:", response.headers.get('Access-Control-Allow-Origin'));
    console.log("   Access-Control-Allow-Methods:", response.headers.get('Access-Control-Allow-Methods'));
    console.log("   Access-Control-Allow-Headers:", response.headers.get('Access-Control-Allow-Headers'));
    
  } catch (error) {
    console.error("   ❌ Error en verificación CORS:", error.message);
  }
};

// Ejecutar diagnóstico
(async () => {
  await testBackendConnection();
  await checkCORS();
  
  console.log("\n📋 RESUMEN:");
  console.log("   1. Verifica que el backend esté corriendo en http://localhost:8080");
  console.log("   2. Verifica que CORS esté habilitado en el backend");
  console.log("   3. Abre la consola del navegador (F12) para ver errores");
  console.log("   4. Revisa la pestaña Network para ver las peticiones HTTP");
})();

export {};
