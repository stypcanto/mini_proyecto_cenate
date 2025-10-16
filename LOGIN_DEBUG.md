# 🔧 Diagnóstico y Solución - Error de Login Frontend

## 🔍 Problema Detectado

El backend funciona correctamente (login con curl exitoso), pero el frontend muestra error.

### Posibles Causas

1. **CORS bloqueado**: El navegador bloquea la petición por política CORS
2. **URL incorrecta**: La URL del API no está configurada correctamente
3. **userId null**: El backend retorna `"userId": null` que puede causar problemas

---

## ✅ Soluciones

### 1. Verificar Consola del Navegador

Abre las DevTools del navegador (F12) y ve a la pestaña "Console" y "Network":

```
F12 → Console
F12 → Network → Filtrar por "login"
```

**Busca:**
- ❌ `CORS error` → Ver solución CORS abajo
- ❌ `Failed to fetch` → Ver solución de red abajo
- ❌ `404 Not Found` → Verificar URL del API
- ❌ `401 Unauthorized` → Credenciales incorrectas

### 2. Solución CORS (Más Probable)

El backend Spring Boot debe tener configuración CORS correcta:

**Archivo:** `backend/src/main/java/styp/com/cenate/config/WebConfig.java`

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost",
                    "http://10.0.89.239:5173"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 3. Verificar SecurityConfig

**Archivo:** `backend/src/main/java/styp/com/cenate/security/SecurityConfig.java`

Asegúrate de que el endpoint `/api/auth/login` esté permitido sin autenticación:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/public/**").permitAll()
    // ... resto de configuración
);
```

### 4. Corregir userId null en Backend

**Problema:** La respuesta del login tiene `"userId": null`

**Solución:** Actualizar el método de login para incluir el userId

**Archivo:** `AuthController.java` o `AuthService.java`

```java
// En el método de login, asegúrate de incluir el userId
LoginResponse response = LoginResponse.builder()
    .token(jwt)
    .username(userDetails.getUsername())
    .nombreCompleto(usuario.getNombreCompleto())
    .userId(usuario.getIdUser()) // ← AGREGAR ESTA LÍNEA
    .rolPrincipal(rolPrincipal)
    .roles(roles)
    .permisos(permisos)
    .build();
```

---

## 🧪 Pruebas de Diagnóstico

### Test 1: Verificar que el backend responde

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}'
```

**Esperado:** Status 200 + JSON con token

### Test 2: Verificar CORS desde navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({username:'scantor',password:'admin123'})
})
.then(r => r.json())
.then(d => console.log('✅ Respuesta:', d))
.catch(e => console.error('❌ Error:', e))
```

### Test 3: Verificar .env del frontend

```bash
cat frontend/.env.development
```

**Debe contener:**
```
REACT_APP_API_URL=http://localhost:8080/api
```

### Test 4: Verificar que el frontend use la URL correcta

```bash
grep -r "API_BASE" frontend/src/config/
```

---

## 🚀 Solución Rápida - Reiniciar Todo

Si nada de lo anterior funciona:

```bash
# 1. Detener todo
docker-compose down
pkill -f spring-boot
pkill -f react

# 2. Limpiar caché
cd frontend
rm -rf node_modules/.cache
rm -rf build

# 3. Reiniciar backend
cd ../backend
./mvnw clean
./mvnw spring-boot:run

# En otra terminal:
# 4. Reiniciar frontend
cd frontend
npm start
```

---

## 📋 Checklist de Verificación

Marca cada punto que verifiques:

- [ ] Backend corriendo en http://localhost:8080
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Consola del navegador sin errores CORS
- [ ] Consola del navegador sin errores 404
- [ ] Network tab muestra petición a `/api/auth/login`
- [ ] Respuesta del backend incluye `token` y `userId`
- [ ] CORS configurado en backend
- [ ] SecurityConfig permite `/api/auth/**`
- [ ] `.env` tiene `REACT_APP_API_URL` correcto

---

## 🐛 Errores Comunes y Soluciones

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solución:**
```java
// En SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}

// Y en el método SecurityFilterChain:
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

### Error: "Failed to fetch"

**Causa:** Backend no está corriendo o URL incorrecta

**Solución:**
```bash
# Verificar que el backend esté activo
curl http://localhost:8080/actuator/health

# Si no responde, reiniciar:
cd backend
./mvnw spring-boot:run
```

### Error: "Network Error"

**Causa:** Firewall o proxy bloqueando la conexión

**Solución:**
```bash
# Verificar firewall
sudo ufw status  # Linux
# O en macOS:
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

---

## 📞 Información de Debug

Para obtener más información, activa el modo debug:

**Backend (application.properties):**
```properties
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

**Frontend (Login.jsx):**
Agregar más logs:
```javascript
const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔐 Intentando login con:', { username, password: '***' });
    
    try {
        const data = await loginUser(username, password);
        console.log('✅ Login exitoso:', data);
        // ...
    } catch (err) {
        console.error('❌ Error completo:', err);
        console.error('❌ Stack:', err.stack);
        // ...
    }
};
```

---

## 🎯 Solución Final Recomendada

**Ejecuta este comando para verificar todo:**

```bash
#!/bin/bash

echo "🔍 Diagnóstico del sistema de login..."
echo ""

# 1. Verificar backend
echo "1️⃣ Verificando backend..."
curl -s http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq -r '.token' > /dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Backend responde correctamente"
else
    echo "   ❌ Backend no responde - Iniciar con: ./mvnw spring-boot:run"
fi

# 2. Verificar frontend
echo "2️⃣ Verificando frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Frontend está activo"
else
    echo "   ❌ Frontend no activo - Iniciar con: npm start"
fi

# 3. Verificar .env.development
echo "3️⃣ Verificando configuración..."
if grep -q "REACT_APP_API_URL" frontend/.env.development 2>/dev/null; then
    echo "   ✅ .env configurado"
    cat frontend/.env.development | grep API_URL
else
    echo "   ❌ .env no encontrado o incorrecto"
fi

echo ""
echo "Abre el navegador en http://localhost:3000 y revisa la consola (F12)"
```

Guarda este script como `check-login.sh` y ejecútalo:

```bash
chmod +x check-login.sh
./check-login.sh
```
