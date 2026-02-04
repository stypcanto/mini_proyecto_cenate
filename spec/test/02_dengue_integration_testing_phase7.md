# 🧪 Phase 7: Integration Testing & UAT - Dengue Module
## CENATE v1.37.4

**Versión:** 1.0.0
**Fecha:** 2026-01-29
**Status:** ✅ En Ejecución
**Responsable:** QA Team

---

## 📋 Tabla de Contenidos

1. [Estrategia de Pruebas](#estrategia-de-pruebas)
2. [Alcance de Pruebas](#alcance-de-pruebas)
3. [Smoke Tests](#smoke-tests)
4. [Integration Tests](#integration-tests)
5. [Icon Verification Tests](#icon-verification-tests)
6. [Navigation Tests](#navigation-tests)
7. [Permission Tests](#permission-tests)
8. [API Tests](#api-tests)
9. [Performance Tests](#performance-tests)
10. [Defect Tracking](#defect-tracking)

---

## 🎯 Estrategia de Pruebas

### Objetivo General
Validar que el módulo Dengue funcione correctamente con:
- ✅ Iconos semánticos en menú y subpáginas
- ✅ Navegación funcional entre secciones
- ✅ Permisos de acceso según roles
- ✅ Integración API backend-frontend
- ✅ Rendimiento bajo carga

### Niveles de Pruebas
| Nivel | Tipo | Herramientas | Criterio |
|-------|------|-------------|----------|
| 1 | **Smoke Tests** | Manual + Playwright | Funcionalidad básica |
| 2 | **Integration Tests** | Playwright | Flujos end-to-end |
| 3 | **API Tests** | Postman/cURL | Contratos endpoint |
| 4 | **Permission Tests** | Manual | MBAC y roles |
| 5 | **Performance Tests** | JMeter | 100 usuarios concurrentes |

### Risk Assessment
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Icons no cargan desde BD | BAJO | MEDIO | Fallback hardcoded ✅ |
| API retorna null para iconos | BAJO | BAJO | Frontend maneja null ✅ |
| Permisos MBAC bloquean acceso | BAJO | ALTO | Verificación previa ✅ |
| Performance degradación | MUY BAJO | MEDIO | Monitoreo v1.37.3 ✅ |

---

## 📊 Alcance de Pruebas

### IN SCOPE (Incluido en Dengue v1.37.4)
- [x] Menú principal Dengue con icono 🦟
- [x] Subpáginas: Cargar Excel, Listar Casos, Buscar, Resultados
- [x] Icons para cada subpágina (Upload, List, Search, BarChart3)
- [x] Navegación entre componentes
- [x] API menu-usuario retorna estructura correcta
- [x] Base de datos almacena iconos en dim_paginas_modulo
- [x] Renderizado frontend de iconos con fallback
- [x] Permisos MBAC aplicados al menú
- [x] Auditoría de accesos de navegación

### OUT OF SCOPE (Próximas fases)
- [ ] Video conferencia (solo planificación)
- [ ] Módulo de reportes avanzados
- [ ] Integración SMS/Email
- [ ] Mobile app nativa

---

## ✅ Smoke Tests

### Test 1.1: Backend Inicia Correctamente
**Objetivo:** Verificar que el servidor Spring Boot inicia sin errores

```bash
# Ejecutar
cd backend && ./gradlew bootRun

# Verificar
curl http://localhost:8080/api/healthcheck
# Respuesta esperada: 200 OK {"status":"UP"}
```

**Criterio de Aceptación:**
- ✅ Log: "Tomcat started on port(s): 8080"
- ✅ Endpoint /api/healthcheck retorna 200
- ✅ Base de datos conectada
- ✅ Migrations ejecutadas

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 1.2: Frontend Inicia Correctamente
**Objetivo:** Verificar que la aplicación React carga sin errores

```bash
# Ejecutar
cd frontend && npm start

# Verificar en navegador
open http://localhost:3000
```

**Criterio de Aceptación:**
- ✅ Página carga sin errores en consola
- ✅ Logo CENATE visible
- ✅ Formulario de login funcional
- ✅ No hay errores de compilación

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 1.3: Acceso a API Menu
**Objetivo:** Verificar que el endpoint de menú retorna estructura correcta

```bash
# Token JWT válido (reemplazar con token real)
JWT_TOKEN="eyJhbGc..."

curl -X GET http://localhost:8080/api/menu-usuario/usuario/1 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta Esperada:**
```json
{
  "paginas": [
    {
      "idPagina": 1,
      "nombrePagina": "Dengue",
      "rutaPagina": "/dengue",
      "icono": "Bug",
      "orden": 1,
      "subpaginas": [
        {
          "idPagina": 101,
          "nombrePagina": "Cargar Excel",
          "rutaPagina": "/dengue/cargar-excel",
          "icono": "Upload"
        }
      ]
    }
  ]
}
```

**Criterio de Aceptación:**
- ✅ HTTP 200 OK
- ✅ Campo `icono` presente (no null)
- ✅ Subpáginas incluidas
- ✅ Estructura válida JSON

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 1.4: Database Connectivity
**Objetivo:** Verificar conexión y datos en PostgreSQL

```bash
# Conectar a BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate

# Verificar tablas
SELECT id_pagina, nombre_pagina, icono FROM dim_paginas_modulo
WHERE id_modulo = 1 ORDER BY orden;
```

**Datos Esperados:**
```
id_pagina | nombre_pagina  | icono
---------|----------------|-------
    1    | Dengue         | Bug
  101    | Cargar Excel   | Upload
  102    | Listar Casos   | List
  103    | Buscar         | Search
  104    | Resultados     | BarChart3
```

**Criterio de Aceptación:**
- ✅ Tabla dim_paginas_modulo existe
- ✅ Columna icono existe
- ✅ 5 páginas Dengue con iconos correctos
- ✅ No hay valores NULL en icono

**Resultado:** [ ] PASS [ ] FAIL

---

## 🔗 Integration Tests

### Test 2.1: Menú Carga con Iconos Correctos
**Objetivo:** Verificar renderizado visual del menú en sidebar

**Pasos:**
1. Iniciar sesión con credenciales válidas
2. Ir a dashboard
3. Inspeccionar sidebar left

**Verificaciones:**
- ✅ Item "Dengue" visible con icono 🦟 (Bug)
- ✅ Submenú expandible
- ✅ 4 subpáginas listadas:
  - 📤 Cargar Excel (Upload)
  - 📋 Listar Casos (List)
  - 🔍 Buscar (Search)
  - 📊 Resultados (BarChart3)
- ✅ Iconos renderizados correctamente

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 2.2: Navegación a Subpáginas
**Objetivo:** Verificar que todos los enlaces funcionan

**Pasos:**
1. Click en "Dengue" (expande submenú)
2. Click en "Cargar Excel"
3. Verificar que carga página de carga de Excel

**Verificaciones por subpágina:**
- ✅ URL cambia correctamente
- ✅ Componente se renderiza
- ✅ No hay errores en consola
- ✅ Icono en breadcrumb es correcto
- ✅ Título de página es correcto

**Resultado por subpágina:**
- [ ] Cargar Excel - PASS/FAIL
- [ ] Listar Casos - PASS/FAIL
- [ ] Buscar - PASS/FAIL
- [ ] Resultados - PASS/FAIL

---

### Test 2.3: Flujo Completo de Usuario
**Objetivo:** Smoke test de flujo típico

**Pasos:**
1. Login → Dashboard
2. Click Dengue → Cargar Excel
3. Verificar interfaz de carga
4. Retornar a Dengue → Listar Casos
5. Verificar tabla de casos
6. Retornar a Dengue → Buscar
7. Verificar formulario de búsqueda

**Criterio de Aceptación:**
- ✅ Todas las navegaciones funcionan
- ✅ Iconos consistentes en cada página
- ✅ No hay errores 404
- ✅ Breadcrumb actualiza correctamente

**Resultado:** [ ] PASS [ ] FAIL

---

## 🎨 Icon Verification Tests

### Test 3.1: Icono Principal Dengue
**Objetivo:** Verificar que Bug icon (🦟) aparece correctamente

```javascript
// Browser console test
document.querySelector('[href="/dengue"]')?.querySelector('svg')?.getAttribute('data-icon')
// Esperado: "bug" o componente LucideIcon
```

**Verificaciones:**
- ✅ Icono visible en sidebar
- ✅ Dimensiones correctas (20x20px)
- ✅ Color correcto (hereda de TailwindCSS)
- ✅ Hover state funciona
- ✅ No hay fallback a imagen genérica

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 3.2: Iconos Subpáginas
**Objetivo:** Verificar cada subpágina tiene icono correcto

| Subpágina | Icono Esperado | Verificar |
|-----------|---|---|
| Cargar Excel | Upload (📤) | [ ] |
| Listar Casos | List (📋) | [ ] |
| Buscar | Search (🔍) | [ ] |
| Resultados | BarChart3 (📊) | [ ] |

**Test por Subpágina:**
```javascript
// En consola del navegador
// Para Cargar Excel
document.querySelector('[href="/dengue/cargar-excel"]')?.querySelector('svg')
// Debe ser SVG Upload icon
```

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 3.3: Fallback Behavior
**Objetivo:** Verificar que hay fallback si API retorna null

**Pasos:**
1. Editar API para retornar icono=null
2. Recargar página
3. Verificar que icono aún aparece (hardcoded)

**Verificaciones:**
- ✅ Si icono API es null, usa getPageIcon() hardcoded
- ✅ Si nombre no en hardcoded, usa Folder por defecto
- ✅ No aparece icono roto o broken image

**Resultado:** [ ] PASS [ ] FAIL

---

## 🧭 Navigation Tests

### Test 4.1: Sidebar Navigation
**Objetivo:** Verificar navegación en sidebar

**Pasos:**
1. Abrir sidebar
2. Expandir Dengue
3. Click cada subpágina

**Verificaciones:**
- ✅ Active state destaca página actual
- ✅ URL actualiza
- ✅ Componente carga
- ✅ Icono permanece visible
- ✅ Breadcrumb actualiza

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 4.2: Breadcrumb Navigation
**Objetivo:** Verificar navegación con breadcrumb

**Pasos:**
1. Navegar a /dengue/cargar-excel
2. Verificar breadcrumb: Home > Dengue > Cargar Excel
3. Click en "Dengue" en breadcrumb
4. Debe volver a /dengue

**Verificaciones:**
- ✅ Breadcrumb muestra ruta completa
- ✅ Cada nivel es clickeable
- ✅ Navegación funciona
- ✅ Iconos en breadcrumb correctos

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 4.3: Back Button Navigation
**Objetivo:** Verificar navegación con botón back del navegador

**Pasos:**
1. Navegar Dengue → Cargar Excel → Listar Casos
2. Click back (3 veces)
3. Verificar stack de navegación correcto

**Verificaciones:**
- ✅ Back button funciona
- ✅ Estado anterior se restaura
- ✅ URL es correcta
- ✅ Scroll position preservado (si aplica)

**Resultado:** [ ] PASS [ ] FAIL

---

## 🔐 Permission Tests

### Test 5.1: Rol SUPERADMIN - Acceso Total
**Objetivo:** Verificar que SUPERADMIN ve todo

**Usuario:** admin@cenate.gob.pe
**Rol:** SUPERADMIN

**Pasos:**
1. Login con SUPERADMIN
2. Verificar sidebar

**Verificaciones:**
- ✅ Menú Dengue visible
- ✅ Todas 4 subpáginas visibles
- ✅ Todos los módulos accesibles
- ✅ Gestión de usuarios visible

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 5.2: Rol MEDICO - Acceso Parcial
**Objetivo:** Verificar que MEDICO solo ve lo suyo

**Usuario:** medico@cenate.gob.pe
**Rol:** MEDICO

**Pasos:**
1. Login con MEDICO
2. Verificar sidebar

**Verificaciones:**
- ✅ Menú Dengue visible (si tiene permiso)
- ✅ Opciones administrativas OCULTAS
- ✅ Dashboard y disponibilidad visibles
- ✅ Gestión de usuarios NO visible

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 5.3: Rol COORDINADOR - Acceso Coordinación
**Objetivo:** Verificar que COORDINADOR ve coordinación

**Usuario:** coordinador@cenate.gob.pe
**Rol:** COORDINADOR

**Pasos:**
1. Login con COORDINADOR
2. Verificar sidebar

**Verificaciones:**
- ✅ Menú Dengue visible
- ✅ Agenda visible
- ✅ Asignaciones visibles
- ✅ Opciones ADMIN NO visibles

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 5.4: Acceso Directo a URL Restringida
**Objetivo:** Verificar que no se puede acceder directo sin permiso

**Pasos:**
1. Logout
2. Navegar directamente a: http://localhost:3000/dengue/cargar-excel
3. Debe redirigir a login

**Verificaciones:**
- ✅ Redirección a /login
- ✅ Mensaje de "sesión expirada"
- ✅ Después de login, acceso permitido (si tiene permisos)

**Resultado:** [ ] PASS [ ] FAIL

---

## 🔌 API Tests

### Test 6.1: GET /api/menu-usuario/usuario/{id}
**Objetivo:** Verificar contrato del endpoint de menú

**Método:** GET
**URL:** http://localhost:8080/api/menu-usuario/usuario/1
**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Respuesta Esperada (200):**
```json
{
  "id": 1,
  "nombre": "Admin User",
  "paginas": [
    {
      "idPagina": 1,
      "nombrePagina": "Dengue",
      "rutaPagina": "/dengue",
      "orden": 1,
      "icono": "Bug",
      "activo": true,
      "subpaginas": [
        {
          "idPagina": 101,
          "nombrePagina": "Cargar Excel",
          "rutaPagina": "/dengue/cargar-excel",
          "orden": 1,
          "icono": "Upload",
          "activo": true
        },
        {
          "idPagina": 102,
          "nombrePagina": "Listar Casos",
          "rutaPagina": "/dengue/listar-casos",
          "orden": 2,
          "icono": "List",
          "activo": true
        },
        {
          "idPagina": 103,
          "nombrePagina": "Buscar",
          "rutaPagina": "/dengue/buscar",
          "orden": 3,
          "icono": "Search",
          "activo": true
        },
        {
          "idPagina": 104,
          "nombrePagina": "Resultados",
          "rutaPagina": "/dengue/resultados",
          "orden": 4,
          "icono": "BarChart3",
          "activo": true
        }
      ]
    }
  ]
}
```

**Test Cases:**

#### 6.1.1: Status Code Verificación
- [ ] HTTP 200 OK - PASS/FAIL

#### 6.1.2: Headers Verificación
- [ ] Content-Type: application/json - PASS/FAIL
- [ ] CORS headers correctos - PASS/FAIL

#### 6.1.3: Body Structure
- [ ] Objeto usuario presente - PASS/FAIL
- [ ] Array paginas presente - PASS/FAIL
- [ ] Array subpaginas presente - PASS/FAIL

#### 6.1.4: Icon Data
- [ ] pagina.icono = "Bug" - PASS/FAIL
- [ ] subpagina[0].icono = "Upload" - PASS/FAIL
- [ ] subpagina[1].icono = "List" - PASS/FAIL
- [ ] subpagina[2].icono = "Search" - PASS/FAIL
- [ ] subpagina[3].icono = "BarChart3" - PASS/FAIL

#### 6.1.5: Data Integrity
- [ ] idPagina != null - PASS/FAIL
- [ ] nombrePagina != null - PASS/FAIL
- [ ] rutaPagina válida - PASS/FAIL
- [ ] orden secuencial - PASS/FAIL

---

### Test 6.2: Autenticación Required
**Objetivo:** Verificar que endpoint requiere autenticación

**Pasos:**
1. GET /api/menu-usuario/usuario/1 SIN token
2. Esperado: 401 Unauthorized

```bash
curl -X GET http://localhost:8080/api/menu-usuario/usuario/1 \
  -H "Content-Type: application/json"
# Esperado: 401
```

**Verificaciones:**
- ✅ HTTP 401 Unauthorized
- ✅ Mensaje de error claro
- ✅ No expone información sensible

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 6.3: Response Time
**Objetivo:** Verificar rendimiento del endpoint

```bash
# Medir tiempo de respuesta
time curl -X GET http://localhost:8080/api/menu-usuario/usuario/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Criterios:**
- ✅ < 200ms (ideal)
- ✅ < 500ms (aceptable)
- ✅ >= 500ms (fallido)

**Resultado:** [ ] PASS (tiempo: ___ ms) [ ] FAIL

---

## 📈 Performance Tests

### Test 7.1: Concurrent Users
**Objetivo:** Verificar rendimiento con usuarios concurrentes

```bash
# Usar JMeter con 100 usuarios simulados
jmeter -n -t dengue-load-test.jmx -l results.jtl
```

**Métricas esperadas (100 usuarios):**
- ✅ Promedio respuesta: < 500ms
- ✅ Percentil 95: < 1000ms
- ✅ Error rate: < 0.1%
- ✅ Throughput: > 50 req/sec

**Resultado:** [ ] PASS [ ] FAIL

---

### Test 7.2: Memory Leak Detection
**Objetivo:** Verificar que no hay memory leaks

**Pasos:**
1. Monitorear memoria durante 30 min
2. Hacer 1000 requests
3. Verificar que memoria se libera

**Criterios:**
- ✅ Memoria estable después de GC
- ✅ No hay crecimiento gradual
- ✅ Heap no excede 512MB

**Resultado:** [ ] PASS [ ] FAIL

---

## 🐛 Defect Tracking

### Formato de Reporte
```markdown
## Defecto #[ID]
**Severidad:** CRÍTICA | ALTA | MEDIA | BAJA
**Componente:** Backend | Frontend | Database
**Descripción:** [Descripción clara]
**Pasos para Reproducir:**
1. ...
2. ...
**Resultado Esperado:** ...
**Resultado Actual:** ...
**Ambiente:** Desarrollo | Staging | Producción
**Reportado:** [Nombre] - [Fecha]
**Estado:** ABIERTO | CERRADO | EN REVISIÓN
```

### Defectos Encontrados

---

## 📋 Summary Checklist

### Smoke Tests
- [ ] Test 1.1: Backend inicia
- [ ] Test 1.2: Frontend inicia
- [ ] Test 1.3: API menu responde
- [ ] Test 1.4: Database conectada

### Integration Tests
- [ ] Test 2.1: Menú carga con iconos
- [ ] Test 2.2: Navegación a subpáginas
- [ ] Test 2.3: Flujo completo usuario

### Icon Tests
- [ ] Test 3.1: Icono Dengue (Bug)
- [ ] Test 3.2: Iconos subpáginas
- [ ] Test 3.3: Fallback behavior

### Navigation Tests
- [ ] Test 4.1: Sidebar navigation
- [ ] Test 4.2: Breadcrumb navigation
- [ ] Test 4.3: Back button

### Permission Tests
- [ ] Test 5.1: SUPERADMIN acceso
- [ ] Test 5.2: MEDICO acceso
- [ ] Test 5.3: COORDINADOR acceso
- [ ] Test 5.4: URL restringida

### API Tests
- [ ] Test 6.1: Endpoint menu
- [ ] Test 6.2: Autenticación
- [ ] Test 6.3: Response time

### Performance Tests
- [ ] Test 7.1: Concurrent users
- [ ] Test 7.2: Memory leaks

---

## 📝 Sign-Off

**Tester:** ___________________
**Fecha:** ___________________
**Resultado Final:** [ ] PASS [ ] FAIL

**Defectos Críticos Encontrados:** ______
**Defectos Abiertos:** ______

**Aprobado para Producción:** [ ] SÍ [ ] NO

**Notas:**
```
[Espacio para notas adicionales]
```

---

**Versión:** 1.0.0
**Última actualización:** 2026-01-29
**Mantenedor:** QA Team - CENATE v1.37.4+
