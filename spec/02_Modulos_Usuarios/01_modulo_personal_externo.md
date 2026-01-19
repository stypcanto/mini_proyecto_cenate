# 📋 Módulo Personal Externo - CENATE 2026

**Versión:** v1.18.0
**Fecha:** 7 de Enero, 2026
**Estado:** ✅ Implementado
**Autor:** Equipo CENATE

---

## 📖 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Arquitectura del Módulo](#arquitectura-del-módulo)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Base de Datos](#base-de-datos)
7. [Endpoints REST](#endpoints-rest)
8. [Seguridad y Auditoría](#seguridad-y-auditoría)
9. [Testing](#testing)
10. [Notas de Implementación](#notas-de-implementación)
11. [Configuración de Módulos por IPRESS](#configuración-de-módulos-por-ipress-nuevo)

---

## 📌 Descripción General

El **Módulo Personal Externo** es el centro de control para usuarios con rol **INSTITUCION_EX** (Personal de Instituciones Externas/IPRESS).

**Propósito:** Permitir que instituciones prestadoras de servicios de salud (IPRESS) gestionen:
- Formularios de diagnóstico situacional
- Solicitud de turnos de telemedicina
- Gestión de modalidades de atención

**Usuario Objetivo:** Personal administrativo de IPRESS afiliadas a EsSalud

---

## ✨ Características Principales

### 1. 👋 Página de Bienvenida Personalizada
- Saludo personalizado por género
- Información de la IPRESS asignada
- Datos del usuario (DNI, Rol, Estado)
- 3 tarjetas de acceso rápido a funcionalidades

**Ruta:** `/roles/externo/bienvenida`
**Componente:** `BienvenidaExterno.jsx`

### 2. 📝 Formulario de Diagnóstico
- Diagnóstico situacional de telesalud
- Cumplimiento normativo NTS Nº 235-MINSA
- Guardado automático de progreso
- Validaciones en frontend y backend

**Ruta:** `/roles/externo/formulario-diagnostico`
**Componente:** `FormularioDiagnostico.jsx`

### 3. 📅 Solicitud de Turnos
- Solicitar turnos de telemedicina
- Para pacientes específicos
- Integración con disponibilidad médica
- Confirmación y estado de solicitud

**Ruta:** `/roles/externo/solicitud-turnos`
**Componente:** `FormularioSolicitudTurnos.jsx`

### 4. ⚙️ Gestión de Modalidad de Atención (NUEVO)
- Actualizar modalidad de atención de IPRESS
- Modalidades soportadas:
  - TELECONSULTA
  - TELECONSULTORIO
  - MIXTA (con detalles de horarios/especialidades)
  - NO SE BRINDA SERVICIO
- Validación de detalles para modalidad MIXTA
- Auditoría completa de cambios

**Ruta:** `/roles/externo/gestion-modalidad`
**Componente:** `GestionModalidadAtencion.jsx`
**Versión:** v1.18.0

---

## 🏗️ Arquitectura del Módulo

### Backend Stack

```
IpressController
    ↓
IpressService (Interface)
    ↓
IpressServiceImpl
    ↓
Repositories:
  - IpressRepository
  - ModalidadAtencionRepository
  - PersonalExternoRepository
  - UsuarioRepository
  - AuditLogService
```

### Frontend Stack

```
BienvenidaExterno.jsx
    ↓
    ├─ ipressService (API calls)
    ├─ AuthContext (User info)
    └─ useNavigate (Routing)

GestionModalidadAtencion.jsx
    ↓
    ├─ ipressService
    ├─ modalidadAtencionService
    ├─ AuthContext
    └─ useState (Form state)
```

---

## 🔧 Funcionalidades Implementadas

### Bienvenida Externo (v1.18.0)
| Feature | Status | Detalles |
|---------|--------|----------|
| Saludo personalizado | ✅ | Por género (M/F) |
| Card IPRESS | ✅ | Código, Red, Modalidad actual |
| Info Usuario | ✅ | DNI, Rol, Estado |
| Acceso rápido | ✅ | 3 tarjetas clickeables |
| Carga datos vivos | ✅ | API `/ipress/mi-ipress` |

### Gestión de Modalidad de Atención (v1.18.0)
| Feature | Status | Detalles |
|---------|--------|----------|
| Obtener IPRESS del usuario | ✅ | GET `/api/ipress/mi-ipress` |
| Listar modalidades activas | ✅ | GET `/api/modalidades-atencion/activas` |
| Actualizar modalidad | ✅ | PATCH `/api/ipress/mi-modalidad` |
| Validar MIXTA | ✅ | Requiere detalles de ambas modalidades |
| Limpiar detalles | ✅ | Solo si NO es MIXTA |
| Auditoría | ✅ | Módulo: GESTION_IPRESS_EXTERNO |
| Condicional UI | ✅ | Mostrar/ocultar textareas según modalidad |

---

## 👥 Flujo de Usuario

```
┌─────────────────┐
│   Login (DNI)   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Validar Credenciales     │
│ (Backend + JWT)          │
└────────┬─────────────────┘
         │
         ▼ (INSTITUCION_EX rol)
┌────────────────────────────────┐
│ /roles/externo/bienvenida      │
│ (BienvenidaExterno.jsx)        │
│                                │
│ Muestra:                       │
│ - Saludo personalizado         │
│ - Datos IPRESS                 │
│ - 3 opciones rápidas           │
└────────────┬───────────────────┘
             │
    ┌────────┴────────┬────────────┐
    ▼                 ▼            ▼
┌─────────────┐ ┌──────────┐ ┌─────────────────┐
│Formulario   │ │Solicitud │ │Gestión Modalidad│
│Diagnóstico  │ │de Turnos │ │de Atención      │
└─────────────┘ └──────────┘ └─────────────────┘
```

---

## 💾 Base de Datos

### Tablas Principales

#### `dim_ipress` (Instituciones Prestadoras)
```sql
- id_ipress (PK)
- cod_ipress
- desc_ipress
- id_mod_aten (FK → dim_modalidad_atencion)
- detalles_teleconsulta (TEXT, NULLABLE)
- detalles_teleconsultorio (TEXT, NULLABLE)
- id_red (FK → dim_red)
- ... (otros campos)
```

#### `dim_modalidad_atencion` (Modalidades de Atención)
```sql
- id_mod_aten (PK)
- desc_mod_aten (TELECONSULTA, TELECONSULTORIO, MIXTA, NO SE BRINDA SERVICIO)
- stat_mod_aten (A/I)
```

#### `dim_personal_externo` (Personal Externo)
```sql
- id_pers (PK)
- id_user (FK → dim_usuarios)
- id_ipress (FK → dim_ipress)
```

#### `permisos_modulares` (Permisos de Usuario)
```sql
- id_permiso (PK)
- id_user (FK)
- id_pagina = 90 (Gestión Modalidad)
- id_modulo = 20 (Personal Externo)
- puede_ver = true
- puede_editar = true
```

#### `dim_paginas_modulo` (Páginas)
```sql
- id_pagina = 90
- id_modulo = 20
- nombre_pagina = "Gestión de Modalidad de Atención"
- ruta_pagina = "/roles/externo/gestion-modalidad"
- orden = 4
```

---

## 🔌 Endpoints REST

### Obtener IPRESS del Usuario
```
GET /api/ipress/mi-ipress
Authorization: Bearer {JWT}
Roles: INSTITUCION_EX, ADMIN, SUPERADMIN

Response (200):
{
  "status": 200,
  "data": {
    "idIpress": 3,
    "codIpress": "281",
    "descIpress": "H.I ALTO MAYO",
    "nombreModalidadAtencion": "TELECONSULTA",
    "red": { ... },
    "detallesTeleconsulta": null,
    "detallesTeleconsultorio": null
  },
  "message": "IPRESS obtenida exitosamente"
}
```

### Actualizar Modalidad de Atención
```
PATCH /api/ipress/mi-modalidad
Authorization: Bearer {JWT}
Content-Type: application/json
Roles: INSTITUCION_EX, ADMIN, SUPERADMIN

Request Body:
{
  "idModAten": 3,
  "detallesTeleconsulta": "Lunes-Viernes 8AM-5PM",
  "detallesTeleconsultorio": "Lunes-Viernes 2PM-6PM"
}

Response (200):
{
  "status": 200,
  "data": { ... IPRESS actualizada ... },
  "message": "Modalidad de atención actualizada exitosamente"
}

Errores:
- 400: Validación MIXTA falla
- 401: No autenticado
- 403: Sin permisos
- 404: IPRESS no asignada al usuario
- 404: Modalidad no existe o inactiva
```

### Listar Modalidades Activas
```
GET /api/modalidades-atencion/activas
Authorization: No requerido (Public)

Response (200):
[
  {
    "idModAten": 1,
    "descModAten": "TELECONSULTA",
    "statModAten": "A",
    "createdAt": "2025-..."
  },
  ...
]
```

---

## 🔐 Seguridad y Auditoría

### Autenticación
- ✅ JWT obligatorio para todos los endpoints
- ✅ Token validado en SecurityContextHolder
- ✅ Roles verificados con @PreAuthorize

### Autorización (MBAC)
- ✅ Solo usuarios con rol INSTITUCION_EX pueden acceder
- ✅ Permisos de página verificados en BD
- ✅ Validación tanto en frontend como backend

### Validación de Datos
| Nivel | Validación |
|-------|-----------|
| **Frontend** | DTOs con @NotNull, @Size, @Valid |
| **Backend** | DTO validation + business logic |
| **BD** | CHECK constraints + Foreign keys |

### Auditoría
```
Tabla: audit_logs
Campos:
  - action: "ACTUALIZAR_MODALIDAD"
  - modulo: "GESTION_IPRESS_EXTERNO"
  - usuario: "84151616"
  - detalle: "Se actualizó la modalidad de atención..."
  - estado: "SUCCESS"
  - fecha_hora: (timestamp)
```

**Ejemplo de auditoría registrada:**
```sql
SELECT * FROM audit_logs
WHERE action = 'ACTUALIZAR_MODALIDAD'
ORDER BY fecha_hora DESC LIMIT 2;

-- ID 4258: Updated to TELECONSULTA at 2026-01-07 19:31:35
-- ID 4257: Updated to MIXTA at 2026-01-07 19:31:01
```

---

## 🧪 Testing

### Test Cases Completados

#### 1. Carga de Página ✅
- Página carga sin errores
- Menú dinámico se renderiza
- API calls exitosos

#### 2. Dropdown Modalidades ✅
- Todas las 4 opciones se renderizan
- Selección funciona correctamente
- Condicional MIXTA funciona

#### 3. Actualización MIXTA ✅
- PATCH request enviado correctamente
- Detalles se guardan en BD
- Modalidad Actual se actualiza en UI
- Response 200 OK

#### 4. Actualización No-MIXTA ✅
- PATCH request exitoso
- Detalles se limpian (NULL)
- Dados persisten correctamente

#### 5. Botón Recargar ✅
- GET request a `/ipress/mi-ipress`
- Datos se recargan correctamente
- Mensajes de éxito se muestran

#### 6. Persistencia en BD ✅
```sql
SELECT * FROM dim_ipress WHERE id_ipress = 3;
-- id_mod_aten = 1 (TELECONSULTA) ✅
-- detalles_teleconsulta = NULL ✅
```

#### 7. Auditoría ✅
```sql
SELECT * FROM audit_logs
WHERE action = 'ACTUALIZAR_MODALIDAD';
-- 2 registros encontrados con estado SUCCESS ✅
```

#### 8. Menú Dinámico ✅
- Opción aparece en submódulo
- Link es clickeable
- Navegación funciona

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **DTO Pattern:**
   - Nunca exponemos entidades JPA directamente
   - ActualizarModalidadIpressRequest valida datos

2. **Validación en 3 Capas:**
   - Frontend: DTOs React + validación UX
   - Backend: DTO validation + business logic
   - BD: Foreign keys + Check constraints

3. **Condicional MIXTA:**
   - UI muestra/oculta textareas según modalidad
   - Backend requiere ambos detalles si MIXTA
   - Si NO MIXTA, detalles se limpian a NULL

4. **Seguridad:**
   - SecurityContextHolder obtiene usuario autenticado
   - Usuario solo puede editar SU IPRESS asignada
   - No permite especificar ID de IPRESS arbitraria

5. **Auditoría:**
   - Módulo GESTION_IPRESS_EXTERNO
   - Acción ACTUALIZAR_MODALIDAD
   - Registra IPRESS ID y nueva modalidad ID

### Bugs Encontrados y Resueltos

| Bug | Causa | Solución | Version |
|-----|-------|----------|---------|
| `apiClient.patch is not a function` | PATCH method no existía | Agregado PATCH method a apiClient.js | v1.18.0 |
| Campo name mismatch | Component usaba idModalidadAtencion | Changed to idModAten (replace_all) | v1.18.0 |
| Permisos usuario no configurados | Usuario 59 sin permiso en tabla | INSERT en permisos_modulares | v1.18.0 |

### Archivos Creados/Modificados

**Backend (4 archivos):**
- ✅ `ActualizarModalidadIpressRequest.java` (NUEVO)
- ✅ `IpressController.java` (modificado)
- ✅ `IpressService.java` (modificado)
- ✅ `IpressServiceImpl.java` (modificado)

**Frontend (3 archivos):**
- ✅ `GestionModalidadAtencion.jsx` (NUEVO)
- ✅ `BienvenidaExterno.jsx` (NUEVO v1.18.0)
- ✅ `apiClient.js` (modificado - agregado PATCH)
- ✅ `componentRegistry.js` (modificado)
- ✅ `ipressService.js` (modificado)

**Base de Datos:**
- ✅ `033_agregar_pagina_gestion_modalidad.sql`
- ✅ Permiso usuario 59 agregado (v1.18.0)

---

---

## 🎛️ Configuración de Módulos por IPRESS (NUEVO)

### ⭐ Documento Completo

**Ver:** `spec/02_Modulos_Usuarios/02_configuracion_modulos_ipress.md`

Este documento detalla:
- Cómo funciona el sistema de activación de módulos por IPRESS
- Tabla de control `ipress_modulos_config`
- Backend (Repository, Service, Controller, DTO)
- Frontend (Service, Component)
- Casos de uso y procedimientos administrativos
- FAQ

### Resumen Rápido

Cada IPRESS tiene su propia configuración de módulos en la tabla `ipress_modulos_config`:

```sql
SELECT * FROM ipress_modulos_config WHERE id_ipress = 413;
-- Resultado: 4 módulos, todos habilitados para PADOMI
```

**Página de Bienvenida** carga dinámicamente solo los módulos `habilitado = true`:

```javascript
const modulos = await ipressService.obtenerModulosDisponibles();
// Retorna solo módulos activos para la IPRESS del usuario
```

### Caso: TELEECG Exclusivo para PADOMI (v1.20.1)

**Configuración Actual:**

| Módulo | IPRESS | Habilitado |
|--------|--------|-----------|
| TELEECG | PADOMI (413) | ✅ true |
| TELEECG | Hospital Central (14) | ❌ false |
| TELEECG | Otros 18 hospitales | ❌ false |

**Cómo cambió:**

```sql
-- Línea 1-3: Deshabilitar en todas EXCEPTO PADOMI
UPDATE ipress_modulos_config
SET habilitado = false
WHERE modulo_codigo = 'TELEECG' AND id_ipress != 413;

-- Línea 5-7: Confirmar en PADOMI
UPDATE ipress_modulos_config
SET habilitado = true
WHERE modulo_codigo = 'TELEECG' AND id_ipress = 413;
```

**Impacto Inmediato:**
- ✅ Usuarios PADOMI ven TELEECG → bienvenida actualizada
- ❌ Usuarios otros hospitales no ven TELEECG
- ⚡ Sin necesidad de redeploy

**Script Completo:** `spec/04_BaseDatos/06_scripts/034_teleecg_exclusivo_padomi.sql`

---

## 📞 Contacto y Soporte

**Equipo CENATE**
Centro Nacional de Telemedicina
EsSalud - Seguro Social de Salud, Perú

**Issues/Bugs:**
Reportar en: [GitHub Issues](https://github.com/anthropics/claude-code/issues)

---

**Última actualización:** 19 de Enero, 2026 (v1.20.1 - TELEECG exclusivo PADOMI)
**Siguiente revisión:** Cuando nuevas funcionalidades se agreguen
