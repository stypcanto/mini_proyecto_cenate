# 🚀 Guía de Compilación - CENATE Frontend

## ✅ Problema Resuelto

**Error anterior:**
```
Attempted import error: 'getPermisosByRol' is not exported from '../../api/permisosApi'
```

**Solución aplicada:**
- ✅ Agregadas funciones `getPermisosByRol` y `updatePermiso` en `permisosApi.js`
- ✅ Corregida función `getDetallePersonal` en `personal.js`
- ✅ Actualizado `AdminPersonalPanel.jsx` para usar `id_user` correcto

---

## 📋 Pasos para Compilar

### Opción 1: Desarrollo Local

```bash
cd frontend

# Instalar dependencias (solo primera vez o si cambió package.json)
npm install

# Verificar que todo esté correcto
chmod +x verify-build.sh
./verify-build.sh

# Si el script anterior pasa, iniciar en desarrollo
npm start
```

### Opción 2: Build de Producción

```bash
cd frontend

# Limpiar build anterior (recomendado)
rm -rf build/

# Crear build de producción
npm run build

# Si todo sale bien, verás:
# ✅ Compiled successfully.
# 
# File sizes after gzip:
#   ...
#   build/static/js/main.xxxxx.js
#   ...
```

### Opción 3: Docker Compose (Recomendado)

```bash
# Desde el directorio raíz del proyecto (donde está docker-compose.yml)
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate

# Detener contenedores anteriores
docker-compose down

# Limpiar imágenes antiguas (opcional pero recomendado)
docker system prune -f

# Compilar y levantar todo
docker-compose up --build

# Ver logs específicos del frontend
docker logs cenate-frontend -f
```

---

## 🔍 Verificar que Funcione

### 1. Frontend levantado
```bash
# Desarrollo
http://localhost:3000

# Producción (Docker)
http://localhost
```

### 2. Backend levantado
```bash
http://localhost:8080/api/health  # Si tienes endpoint de health
```

### 3. Probar login
```
Usuario: scantor
Password: admin123
```

### 4. Navegar a Panel de Personal
```
Ruta: /admin/personal
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O cambiar puerto
PORT=3001 npm start
```

### Error en Docker: "failed to solve"
```bash
# Limpiar cache de Docker
docker builder prune -af

# Reconstruir sin cache
docker-compose build --no-cache

# Levantar
docker-compose up
```

### Error: "Module not found: Can't resolve"
Verifica los imports en los archivos:
- `AdminPersonalPanel.jsx` → debe importar de `'../../api/personal'`
- `PermisosManagement.jsx` → debe importar de `'../../api/permisosApi'`

### Build exitoso pero página en blanco
```bash
# Verificar console del navegador (F12)
# Posibles causas:
# 1. Ruta de API incorrecta en .env
# 2. CORS bloqueado
# 3. Backend no está corriendo
```

---

## 📝 Cambios Realizados en Archivos

### 1. `permisosApi.js`
```javascript
// ✅ AGREGADO
export const getPermisosByRol = (rolId) => ...
export const updatePermiso = (permisoId, permiso) => ...
```

### 2. `personal.js`
```javascript
// ✅ CAMBIADO
export const getDetallePersonal = (idUser) => 
  safeFetch(`${API_BASE}/personal/detalle/${idUser}`, ...);

// ❌ REMOVIDO (ya no se usan)
// export const getDetalleCenate = ...
// export const getDetalleExterno = ...
```

### 3. `AdminPersonalPanel.jsx`
```javascript
// ✅ CORREGIDO
const handleVerDetalle = async (persona) => {
  const detalle = await getDetallePersonal(persona.id_user); // ✅ usa id_user
  // ...
};

// ❌ ANTES (incorrecto)
// getDetalleCenate(persona.id_personal) // ❌ id_personal no existe
```

### 4. `PersonalDetailCard.jsx`
```javascript
// ✅ CORREGIDO
const data = personal.personal; // ✅ estructura anidada
const isCenate = data.laboral?.area !== undefined;

// Muestra campos correctamente según estructura JSON del backend
```

---

## ✅ Checklist Final

Antes de compilar, verifica:

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] Base de datos PostgreSQL activa
- [ ] Frontend `node_modules` instalados
- [ ] Variables de entorno correctas (`.env`)
- [ ] Archivos actualizados:
  - [ ] `permisosApi.js`
  - [ ] `personal.js`
  - [ ] `AdminPersonalPanel.jsx`
  - [ ] `PersonalDetailCard.jsx`

---

## 🎯 Resultado Esperado

Si todo está correcto, deberías ver:

1. **Compilación exitosa**
   ```
   Compiled successfully!
   
   You can now view frontend_temp in the browser.
   Local: http://localhost:3000
   ```

2. **Panel de Personal funcionando**
   - ✅ Lista de personal (CENATE + EXTERNO)
   - ✅ Búsqueda y filtros
   - ✅ Botón "Ver Detalle" abre modal
   - ✅ Modal muestra información completa
   - ✅ Export a CSV funciona

3. **Sin errores en consola**
   - Abre DevTools (F12)
   - Tab "Console" debe estar limpia (sin errores rojos)

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Revisa los logs del backend:
   ```bash
   cd backend
   tail -f logs/spring.log
   ```

2. Revisa los logs de Docker:
   ```bash
   docker logs cenate-backend -f
   docker logs cenate-frontend -f
   ```

3. Verifica el archivo `build-output.log` generado por el script

---

**¡Listo para compilar! 🚀**

Ejecuta:
```bash
cd frontend
./verify-build.sh
```

O directamente:
```bash
npm run build
```
