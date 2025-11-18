# 🎯 Guía Rápida - Aplicar Correcciones al Backend

## ✅ ¿Qué se ha corregido?

He identificado y corregido **4 problemas críticos** en tu backend:

1. ❌ **Ruta incorrecta**: `/api/mbac/permisos` → ✅ `/api/permisos`
2. ❌ **Endpoint esperaba ID numérico** → ✅ Ahora acepta username o ID
3. ❌ **Errores genéricos poco informativos** → ✅ Mensajes detallados con timestamps
4. ❌ **Falta soporte para username** → ✅ Todos los endpoints soportan username

---

## 🚀 Pasos para Aplicar las Correcciones

### Opción 1: Usando el Script Automatizado (Recomendado)

```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend

# Dar permisos de ejecución
chmod +x compilar_y_probar.sh

# Ejecutar script maestro (compila y prueba)
./compilar_y_probar.sh
```

Este script hace todo automáticamente:
- ✅ Limpia el build anterior
- ✅ Compila el proyecto
- ✅ Verifica que el JAR se creó correctamente
- ✅ Detecta si el servidor está corriendo
- ✅ Ejecuta tests de las APIs (si lo deseas)

---

### Opción 2: Paso a Paso Manual

#### 1. Compilar el Proyecto

```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend

# Limpiar y compilar (sin tests)
./gradlew clean build -x test
```

**Resultado esperado:**
```
BUILD SUCCESSFUL in Xs
5 actionable tasks: 5 executed
```

#### 2. Verificar el JAR creado

```bash
ls -lh build/libs/cenate-0.0.1-SNAPSHOT.jar
```

Deberías ver un archivo de aproximadamente 80-100 MB.

#### 3. Reiniciar el Servidor

**Si estás usando Docker:**
```bash
docker-compose restart cenate-backend
```

**Si estás usando Gradle directamente:**
```bash
./gradlew bootRun
```

**Si estás usando el JAR:**
```bash
java -jar build/libs/cenate-0.0.1-SNAPSHOT.jar
```

#### 4. Ejecutar Tests de APIs

```bash
chmod +x test_permisos_corregidos.sh
./test_permisos_corregidos.sh
```

---

## 🧪 Verificación Rápida (Manual)

Si prefieres verificar manualmente con curl:

### 1. Obtener Token JWT
```bash
export JWT_TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"@Rodrigo28"}' | jq -r '.token')

echo $JWT_TOKEN
```

### 2. Test Health Check
```bash
curl -X GET "http://localhost:8080/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

**Resultado esperado:**
```json
{
  "status": "UP",
  "service": "PermisosController RBAC",
  "version": "1.0",
  "timestamp": "2025-10-27T..."
}
```

### 3. Test Permisos por Username
```bash
curl -X GET "http://localhost:8080/api/permisos/usuario/scantor" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

**Resultado esperado:** Array con permisos del usuario

### 4. Test Verificación de Permiso
```bash
curl -X POST "http://localhost:8080/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idUser": 1,
    "rutaPagina": "/roles/medico/pacientes",
    "accion": "ver"
  }' | jq .
```

**Resultado esperado:**
```json
{
  "idUser": 1,
  "rutaPagina": "/roles/medico/pacientes",
  "accion": "ver",
  "permitido": true
}
```

---

## 📊 Endpoints Corregidos

| Antes | Después | Estado |
|-------|---------|--------|
| `/api/mbac/permisos/health` | `/api/permisos/health` | ✅ Corregido |
| `/api/mbac/permisos/usuario/{id}` (solo ID) | `/api/permisos/usuario/{userIdentifier}` (ID o username) | ✅ Corregido |
| `/api/mbac/permisos/verificar` | `/api/permisos/check` | ✅ Corregido |
| `/api/mbac/permisos/usuario/{id}/modulos` | `/api/permisos/usuario/{userIdentifier}/modulos` | ✅ Corregido |

---

## 📝 Archivos Modificados

- ✅ `PermisosController.java` - Rutas y lógica corregida
- ✅ `GlobalExceptionHandler.java` - Manejo de errores mejorado
- ✅ `CORRECCIONES_APLICADAS.md` - Documentación detallada
- ✅ `compilar_y_probar.sh` - Script automatizado (nuevo)
- ✅ `test_permisos_corregidos.sh` - Tests de APIs (nuevo)

---

## ⚠️ Notas Importantes

1. **No se requieren cambios en la base de datos**
2. **Las correcciones son 100% compatibles con tu código existente**
3. **El frontend no necesita cambios** (ya está configurado correctamente)
4. **La advertencia de API deprecada en SecurityConfig** es normal y no afecta funcionalidad

---

## 🐛 Si Encuentras Errores

### Error: "Permission denied" al ejecutar scripts
```bash
chmod +x compilar_y_probar.sh
chmod +x test_permisos_corregidos.sh
```

### Error: "Command not found: jq"
```bash
brew install jq
```

### Error: "JAVA_HOME not set"
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Error: Puerto 8080 ocupado
```bash
# Encontrar proceso
lsof -i :8080

# Matar proceso
kill -9 <PID>
```

---

## ✅ Checklist de Verificación

- [ ] Proyecto compilado exitosamente
- [ ] JAR creado en `build/libs/`
- [ ] Servidor reiniciado
- [ ] Health check responde correctamente
- [ ] Permisos por username funcionan
- [ ] Permisos por ID funcionan
- [ ] Verificación POST /check funciona
- [ ] Módulos accesibles funcionan

---

## 🎉 ¡Listo!

Una vez que todas las verificaciones pasen, tu backend estará completamente funcional y listo para integrarse con el frontend React.

Para más detalles técnicos, consulta **CORRECCIONES_APLICADAS.md**
