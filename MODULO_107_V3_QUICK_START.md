# Módulo 107 v3.0 - Quick Start Guide

> **Para:** QA, DevOps, Product Managers
>
> **Objetivo:** Guía rápida de despliegue y verificación
>
> **Tiempo de lectura:** 5 minutos

---

## 🚀 Despliegue Rápido (5 pasos)

### 1️⃣ Aplicar Migración de Base de Datos
```bash
# La migración se aplica automáticamente al iniciar Spring Boot
# O ejecutar manualmente:

PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate << 'EOF'
\i backend/src/main/resources/db/migration/V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql
EOF

# Verificar:
SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 107;
```

### 2️⃣ Compilar Backend
```bash
cd backend
./gradlew clean build

# Esperado: BUILD SUCCESSFUL
```

### 3️⃣ Compilar Frontend
```bash
cd frontend
npm install  # si es necesario
npm run build

# Esperado: Webpack compilation complete
```

### 4️⃣ Iniciar Servidores
```bash
# Terminal 1 - Backend
cd backend && ./gradlew bootRun

# Terminal 2 - Frontend (opcional para testing)
cd frontend && npm start
```

### 5️⃣ Verificar Endpoints
```bash
# Reemplazar YOUR_JWT_TOKEN con un token válido

# Test 1: Listar pacientes
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes?page=0&size=10" | jq .total

# Test 2: Buscar pacientes
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes/buscar?dni=12345678" | jq .total

# Test 3: Obtener estadísticas
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/estadisticas" | jq .kpis.total_pacientes

# Todos deben retornar 200 OK
```

---

## 🧪 Pruebas Rápidas (5 minutos)

### Test 1: Navegación de Tabs
```
1. Abrir navegador: http://localhost:3000
2. Ir a Módulo 107 (Formulario 107)
3. Verificar que existen 5 tabs:
   ✓ Cargar Excel
   ✓ Historial
   ✓ Listado      [NUEVO]
   ✓ Búsqueda     [NUEVO]
   ✓ Estadísticas [NUEVO]
```

### Test 2: Listar Pacientes
```
1. Click en tab "Listado"
2. Verificar tabla con datos
3. Columnas esperadas:
   ✓ DNI
   ✓ Nombre
   ✓ Sexo
   ✓ Fecha Solicitud
   ✓ IPRESS
   ✓ Estado
```

### Test 3: Búsqueda
```
1. Click en tab "Búsqueda"
2. Ingresaré DNI "12345678"
3. Click "Buscar"
4. Verificar resultados en tabla
```

### Test 4: Estadísticas
```
1. Click en tab "Estadísticas"
2. Verificar 5 KPI cards:
   ✓ Total Pacientes
   ✓ Atendidos + tasa%
   ✓ Pendientes + vencidas
   ✓ Cancelados + abandono%
   ✓ Horas Promedio
3. Verificar tablas:
   ✓ Distribución por Estado
   ✓ Top 10 IPRESS
   ✓ Distribución por Especialidad
   ✓ Evolución Temporal
```

### Test 5: Performance
```bash
# Medir tiempo de respuesta
time curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes?page=0&size=100" > /dev/null

# Esperado: < 2 segundos
```

---

## ✅ Checklist de Go-Live

Antes de producción:

```
INFRAESTRUCTURA:
☐ Backup de bolsa_107_item realizado
☐ BD actualizada con migration script
☐ Backend compilado sin errores
☐ Frontend compilado sin errores

VALIDACIÓN:
☐ 3 endpoints responden 200 OK
☐ Búsqueda retorna resultados correctos
☐ Estadísticas muestran valores válidos
☐ Tab navigation funciona
☐ Performance < 2s

DOCUMENTACIÓN:
☐ Changelog v3.0.0 registrado
☐ Verificación guide creado
☐ Quick start guide visible
☐ Team notificado

ROLLBACK:
☐ Script de rollback documentado
☐ Backup de BD lista
☐ Fecha de rollback en calendario (si es necesario)
```

---

## 🔗 Enlaces Rápidos

### Documentación Completa:
- 📘 Resumen: `IMPLEMENTACION_MODULO_107_V3_RESUMEN.md`
- 📗 Verificación: `IMPLEMENTACION_MODULO_107_V3_VERIFICACION.md`
- 📙 Changelog: `checklist/01_Historial/01_changelog.md` (v3.0.0)

### Código:
- 🗄️ Migration: `backend/src/main/resources/db/migration/V3_3_0__*.sql`
- 🔧 Backend: `backend/src/main/java/com/styp/cenate/`
- 🎨 Frontend: `frontend/src/pages/roles/coordcitas/`

### Endpoints:
- 📋 `GET /api/bolsa107/pacientes` - Listar
- 🔍 `GET /api/bolsa107/pacientes/buscar` - Búsqueda
- 📊 `GET /api/bolsa107/estadisticas` - Dashboard

---

## 🆘 Troubleshooting Rápido

### ❌ Endpoint retorna 404

**Solución:** Backend no compiló los cambios
```bash
cd backend && ./gradlew clean build && ./gradlew bootRun
```

### ❌ Base de datos error

**Solución:** Migration script no se ejecutó
```bash
# Verificar si existen los índices:
SELECT * FROM pg_indexes WHERE tablename = 'dim_solicitud_bolsa'
AND indexname LIKE '%modulo107%';

# Si no existen, ejecutar script manualmente
```

### ❌ Frontend no carga componentes

**Solución:** npm no actualizó los cambios
```bash
cd frontend && npm install && npm start
```

### ❌ Búsqueda sin resultados

**Solución:** BD no tiene datos del Módulo 107
```sql
SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 107;
-- Debe retornar > 0
```

---

## 📊 KPIs Post-Despliegue

Monitorear durante primeros 24h:

| KPI | Target | Check |
|-----|--------|-------|
| Tiempo respuesta `/pacientes` | < 500ms | curl + time |
| Tiempo respuesta `/buscar` | < 1000ms | curl + time |
| Tiempo respuesta `/estadisticas` | < 2000ms | curl + time |
| Error rate | < 0.1% | Logs |
| Uptime | > 99.9% | Monitoring |

---

## 📞 Soporte Rápido

Si algo falla:

1. **Revisar logs backend:**
   ```
   backend/build/logs/cenate.log
   ```

2. **Revisar logs frontend:**
   ```
   Browser DevTools → Console
   ```

3. **Verificar BD:**
   ```sql
   SELECT * FROM dim_solicitud_bolsa LIMIT 5;
   ```

4. **Contactar equipo dev:**
   - Descripción: [QUÉ FALLÓ]
   - Error: [MENSAJE EXACTO]
   - Logs: [PASTE LOGS]
   - Reproducir: [PASO A PASO]

---

## ✨ Estado de Implementación

- ✅ Backend: LISTO
- ✅ Frontend: LISTO
- ✅ Base de Datos: LISTO
- ✅ Documentación: LISTO
- ✅ Testing: LISTO

**Status Global: READY FOR PRODUCTION**

---

**Última actualización:** 2026-01-29
**Versión:** 3.0.0
