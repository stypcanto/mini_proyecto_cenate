# ⚡ QUICK START - Colección Postman

## 📥 Importar en 3 pasos

### Paso 1: Importar Colección
1. Abre Postman
2. **Import** → Selecciona `CENATE-Bolsas-Modulo107.postman_collection.json`

### Paso 2: Importar Entorno
1. Click ⚙️ (Manage Environments)
2. **Import** → Selecciona `CENATE-Entorno.postman_environment.json`
3. Selecciona "CENATE - Desarrollo" en el dropdown superior

### Paso 3: Hacer Login
1. Abre carpeta **"🔐 AUTENTICACIÓN"**
2. Haz clic en **"Login"**
3. Click **"Send"**
4. ✅ Token guardado automáticamente

---

## 🧪 Probar Endpoints

### Módulo 107 - Listar Pacientes
```
GET /api/bolsas/modulo107/pacientes?page=0&size=10

✅ Response: {total, page, size, totalPages, pacientes[]}
```

### Módulo 107 - Buscar
```
GET /api/bolsas/modulo107/pacientes/buscar?page=0&size=10

Parámetros opcionales:
  - dni=12345678
  - nombre=Juan
  - codigoIpress=0001
  - estadoId=1
  - fechaDesde=2026-01-01T00:00:00Z
  - fechaHasta=2026-01-31T23:59:59Z

✅ Response: {total, page, size, totalPages, pacientes[]}
```

### Módulo 107 - Estadísticas
```
GET /api/bolsas/modulo107/estadisticas

✅ Response: {kpis, distribucion_estado[], distribucion_especialidad[], top_10_ipress[], evolucion_temporal[]}
```

---

## 📊 Carpetas Disponibles

### 🔐 Autenticación
- `Login` - Obtener JWT token

### 📦 Módulo 107 v3.0 (NUEVO)
- `1️⃣ Listar Pacientes`
- `2️⃣ Buscar Pacientes (Sin Filtros)`
- `2️⃣ Buscar por DNI`
- `2️⃣ Buscar por Nombre`
- `2️⃣ Buscar por IPRESS`
- `2️⃣ Buscar por Estado`
- `2️⃣ Buscar por Rango de Fechas`
- `3️⃣ Obtener Estadísticas`

### 📊 Bolsas de Pacientes (Existentes)
- `Listar Todas las Bolsas`
- `Obtener Detalles de Bolsa`
- `Listar Solicitudes de Bolsa`
- `Health Check`

---

## 🚀 Prueba Rápida

**Ejecuta estas 3 requests en orden:**

1. **Login** → Copy token
2. **Listar Pacientes** → Verify response
3. **Estadísticas** → Check KPIs

---

## ⚙️ Variables Disponibles

```
{{base_url}}      = http://localhost:8080
{{username}}      = 44914706
{{password}}      = @Styp654321
{{jwt_token}}     = Auto-filled after login
```

---

## 🔗 Archivos en /spec/coleccion-postman/

```
📁 coleccion-postman/
├── CENATE-Bolsas-Modulo107.postman_collection.json  ← IMPORTAR ESTO
├── CENATE-Entorno.postman_environment.json           ← IMPORTAR ESTO
├── README.md                                          ← Lee para detalle
└── QUICK-START.md                                     ← Este archivo
```

---

## ✅ Tests Incluidos

Cada request contiene tests automáticos que se ejecutan al hacer Send:

```
✅ Status code 200
✅ Estructura JSON correcta
✅ Propiedades requeridas presentes
```

---

## 🆘 Si falla...

### "Connection refused"
```bash
cd backend && ./gradlew bootRun
```

### "401 Unauthorized"
```
Vuelve a hacer Login (paso 3)
```

### "403 Forbidden"
```
Usuario sin permisos
Usa: 44914706 / @Styp654321
```

---

**¡Listo! Empieza a probar 🚀**
