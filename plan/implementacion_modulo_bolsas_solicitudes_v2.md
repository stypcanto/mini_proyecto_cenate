# Análisis Técnico: Integración Frontend-Backend Módulo Solicitudes Bolsas v2.0

**Documento:** Feature Analysis - Integración de Solicitudes.jsx con Backend (Versión Actualizada)
**Versión:** v2.0.0 (Con integración de endpoints existentes + tabla asegurados)
**Fecha:** 2026-01-22
**Agente:** Architect (Sistema de Análisis Técnico)
**Status:** PLAN DE IMPLEMENTACIÓN ACTUALIZADO

---

## 📋 Cambios en v2.0 vs v1.0

### ✅ Principales Actualizaciones

```
v1.0 → v2.0 CAMBIOS:

1. BASE DE DATOS:
   ❌ paciente_id → ✅ asegurado_id (FK a pacientes_asegurados)
   ✅ Si asegurado no existe → Crear automáticamente

2. ENDPOINTS EXTERNOS:
   ✅ Usar /api/gestion-pacientes/asegurado/{dni} (GET asegurado)
   ✅ Usar /api/gestion-pacientes (POST crear asegurado)
   ✅ Usar /api/ipress/{id} (GET datos IPRESS)
   ✅ Usar /api/redes/{id} (GET datos Red)
   ✅ Usar /api/admin/estados-gestion-citas (GET estados)

3. SIMPLIFICACIÓN:
   ✅ No crear nuevos endpoints para IPRESS/Redes
   ✅ No crear tabla de asegurados (YA EXISTE)
   ✅ Reutilizar endpoints existentes
   ✅ Reducir 2-3 fases del plan original
```

---

## 🏗️ ARQUITECTURA ACTUALIZADA

### Endpoint Ecosystem

```
FRONTEND: Solicitudes.jsx
    │
    ├─→ GET /api/bolsas/solicitudes
    │   └─ Obtiene lista completa de solicitudes
    │
    ├─→ GET /api/gestion-pacientes/asegurado/{dni}
    │   └─ Obtiene datos asegurado (si existe) o devuelve null
    │
    ├─→ POST /api/gestion-pacientes
    │   └─ Crea asegurado si no existe (con datos mínimos)
    │
    ├─→ GET /api/ipress/{id}
    │   └─ Obtiene datos de IPRESS por ID
    │
    ├─→ GET /api/redes/{id}
    │   └─ Obtiene datos de Red por ID
    │
    ├─→ GET /api/admin/estados-gestion-citas/todos
    │   └─ Obtiene catálogo de 10 estados
    │
    ├─→ PUT /api/bolsas/solicitudes/{id}
    │   └─ Actualiza solicitud (cambiar teléfono, asignar gestora)
    │
    ├─→ GET /api/bolsas/solicitudes/pendientes
    │   └─ Obtiene solo solicitudes pendientes
    │
    └─→ [Nuevos para Bolsas]
        ├─ PATCH /api/bolsas/solicitudes/{id}/asignar
        ├─ PUT /api/bolsas/solicitudes/{id}/cambiar-telefono
        ├─ GET /api/bolsas/solicitudes/exportar
        └─ POST /api/bolsas/solicitudes/{id}/recordatorio
```

### Flujo de Datos Mejorado

```
┌──────────────────────────────────────────────────────────────────┐
│ USUARIO: Coordinador de Gestión de Citas                         │
│ URL: http://localhost:3000/bolsas/solicitudes                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND: Solicitudes.jsx                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. Carga inicial:                                                 │
│    GET /api/bolsas/solicitudes                                   │
│    └─ Array de solicitudes con asegurado_id, ipress_id, red_id  │
│                                                                   │
│ 2. Enriquecimiento de datos:                                      │
│    Para cada solicitud:                                           │
│    ├─ GET /api/ipress/{ipress_id} → nombreIpress                │
│    ├─ GET /api/redes/{red_id} → nombreRed                       │
│    └─ GET /api/admin/estados-gestion-citas/{estado_id} → desc   │
│                                                                   │
│ 3. Búsqueda por DNI:                                              │
│    GET /api/gestion-pacientes/asegurado/{dni}                    │
│    └─ Si existe → datos asegurado                                │
│    └─ Si no existe → null → crear asegurado                      │
│                                                                   │
│ 4. Crear asegurado si no existe:                                  │
│    POST /api/gestion-pacientes                                   │
│    Body: {dni, nombre, sexo, edad, telefonoContacto, etc}       │
│    └─ Retorna asegurado_id                                       │
│                                                                   │
│ 5. Acciones sobre solicitud:                                      │
│    ├─ Cambiar teléfono:                                          │
│    │  PUT /api/bolsas/solicitudes/{id}                           │
│    │  {pacienteTelefono: nuevoTelefono}                          │
│    │                                                              │
│    ├─ Asignar a gestora:                                         │
│    │  PATCH /api/bolsas/solicitudes/{id}/asignar                 │
│    │  {responsableGestoraId, responsableGestoraNombre}           │
│    │                                                              │
│    ├─ Enviar recordatorio:                                       │
│    │  POST /api/bolsas/solicitudes/{id}/recordatorio             │
│    │  {tipo: 'WHATSAPP' | 'EMAIL'}                               │
│    │                                                              │
│    └─ Exportar CSV:                                              │
│       GET /api/bolsas/solicitudes/exportar?ids=1,2,3            │
│       ResponseType: blob → guarda como archivo                   │
│                                                                   │
│ 6. Estadísticas:                                                  │
│    Calculadas en memoria con Array.filter()                      │
│    ├─ Total: solicitudes.length                                  │
│    ├─ Pendientes: estado === 'PENDIENTE'                         │
│    ├─ Citados: estadoGestion === 'CITADO'                        │
│    ├─ Atendidos: estadoGestion === 'ATENDIDO_IPRESS'            │
│    └─ Observados: otros estados                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓ JSON + JWT
┌──────────────────────────────────────────────────────────────────┐
│ BACKEND: Multiple Controllers                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ BolsasController:                                                 │
│ ├─ GET /api/bolsas/solicitudes                                   │
│ ├─ GET /api/bolsas/solicitudes/pendientes                        │
│ ├─ PUT /api/bolsas/solicitudes/{id}                              │
│ ├─ PATCH /api/bolsas/solicitudes/{id}/asignar [NEW]              │
│ ├─ PUT /api/bolsas/solicitudes/{id}/cambiar-telefono [NEW]       │
│ ├─ GET /api/bolsas/solicitudes/exportar [NEW]                    │
│ └─ POST /api/bolsas/solicitudes/{id}/recordatorio [NEW]          │
│                                                                   │
│ GestionPacientesController:                                       │
│ ├─ GET /api/gestion-pacientes/asegurado/{dni}                    │
│ └─ POST /api/gestion-pacientes (crear si no existe)              │
│                                                                   │
│ IpressController:                                                 │
│ ├─ GET /api/ipress/{id}                                          │
│ └─ GET /api/ipress/activas                                       │
│                                                                   │
│ RedController:                                                    │
│ └─ GET /api/redes/{id}                                           │
│                                                                   │
│ EstadosGestionCitasController:                                    │
│ └─ GET /api/admin/estados-gestion-citas/todos                    │
│                                                                   │
│ Servicios:                                                        │
│ ├─ SolicitudBolsasService                                         │
│ ├─ GestionPacientesService                                        │
│ ├─ IpressService                                                  │
│ ├─ RedService                                                     │
│ └─ EstadosGestionCitasService                                     │
│                                                                   │
│ Security:                                                         │
│ ├─ @PreAuthorize("hasRole('COORDINADOR_GESTION_CITAS')")         │
│ ├─ @CheckMBACPermission                                          │
│ └─ AuditLogService                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓ JPA
┌──────────────────────────────────────────────────────────────────┐
│ DATABASE: PostgreSQL                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ dim_solicitud_bolsa                                               │
│ ├─ id_solicitud (PK)                                              │
│ ├─ asegurado_id (FK) → pacientes_asegurados                      │
│ ├─ id_bolsa (FK) → dim_bolsa                                     │
│ ├─ estado_gestion_citas_id (FK) → dim_estados_gestion_citas      │
│ ├─ ipress_id (FK) → dim_ipress                                   │
│ ├─ red_id (FK) → dim_red                                         │
│ ├─ responsable_gestora_id (FK) → usuarios                        │
│ └─ Datos denormalizados: paciente_dni, paciente_nombre, teléfono │
│                                                                   │
│ pacientes_asegurados (YA EXISTE)                                  │
│ ├─ id_asegurado (PK)                                              │
│ ├─ numero_documento (dni)                                         │
│ ├─ apellido_nombres                                               │
│ ├─ sexo                                                           │
│ ├─ edad                                                           │
│ └─ telefono_contacto                                              │
│                                                                   │
│ dim_ipress, dim_red, dim_bolsa, dim_estados_gestion_citas        │
│ └─ Ya existen con datos iniciales                                │
│                                                                   │
│ dim_asignacion_bolsa_gestora [NEW]                                │
│ └─ Auditoría de distribuciones                                    │
│                                                                   │
│ dim_cambios_telefono [NEW]                                        │
│ └─ Historial de cambios de teléfono                               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 MAPEO DE DATOS

### Flujo de Creación de Solicitud

```
ENTRADA: Paciente desde Bolsa 107, Dengue, etc.

1. VALIDAR ASEGURADO:
   GET /api/gestion-pacientes/asegurado/{dni}

   IF asegurado existe:
      asegurado_id = response.idAsegurado
      Usar datos existentes

   ELSE:
      POST /api/gestion-pacientes
      {
        numeroDocumento: dni,
        apellidoNombres: nombre,
        sexo: sexo,
        edadCalculada: edad,
        telefonoContacto: telefono
      }
      asegurado_id = response.idAsegurado
      ✅ Asegurado CREADO

2. CREAR SOLICITUD:
   POST /api/bolsas/solicitudes
   {
     aseguradoId: asegurado_id,
     pacienteDni: dni,
     pacienteNombre: nombre,
     pacienteTelefono: telefono,
     pacienteSexo: sexo,
     especialidad: especialidad,
     ipressId: ipress_id,
     redId: red_id,
     idBolsa: bolsa_id,
     estado: 'PENDIENTE',
     estadoGestionCitasId: 1 (por defecto)
   }

   ✅ Solicitud CREADA

3. RESULTADO:
   Solicitud lista para distribución al Coordinador
```

### Tabla dim_solicitud_bolsa - Relaciones Actualizadas

```
CREATE TABLE dim_solicitud_bolsa (
  id_solicitud BIGSERIAL PRIMARY KEY,

  -- Asegurado (paciente existente en sistema)
  asegurado_id BIGINT NOT NULL,
  FOREIGN KEY (asegurado_id) REFERENCES pacientes_asegurados(id_asegurado),

  -- Datos denormalizados para búsqueda rápida
  paciente_dni VARCHAR(20) NOT NULL,
  paciente_nombre VARCHAR(255) NOT NULL,
  paciente_telefono VARCHAR(20),
  paciente_sexo VARCHAR(20),

  -- Referencias a maestros
  id_bolsa BIGINT NOT NULL,
  FOREIGN KEY (id_bolsa) REFERENCES dim_bolsa(id_bolsa),

  ipress_id BIGINT NOT NULL,
  FOREIGN KEY (ipress_id) REFERENCES dim_ipress(id_ipress),

  red_id BIGINT NOT NULL,
  FOREIGN KEY (red_id) REFERENCES dim_red(id_red),

  estado_gestion_citas_id BIGINT NOT NULL DEFAULT 1,
  FOREIGN KEY (estado_gestion_citas_id) REFERENCES dim_estados_gestion_citas(id_estado),

  especialidad VARCHAR(255),

  -- Gestión
  responsable_gestora_id BIGINT,
  FOREIGN KEY (responsable_gestora_id) REFERENCES usuarios(id_usuario),

  -- Estados
  estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA

  -- Auditoría
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_asignacion TIMESTAMP WITH TIME ZONE,
  fecha_estado TIMESTAMP WITH TIME ZONE,

  -- Indicadores
  diferimiento INTEGER,
  semaforo VARCHAR(20),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX idx_solicitud_asegurado ON dim_solicitud_bolsa(asegurado_id);
CREATE INDEX idx_solicitud_dni ON dim_solicitud_bolsa(paciente_dni);
CREATE INDEX idx_solicitud_ipress ON dim_solicitud_bolsa(ipress_id);
CREATE INDEX idx_solicitud_red ON dim_solicitud_bolsa(red_id);
CREATE INDEX idx_solicitud_bolsa ON dim_solicitud_bolsa(id_bolsa);
CREATE INDEX idx_solicitud_estado_gestion ON dim_solicitud_bolsa(estado_gestion_citas_id);
CREATE INDEX idx_solicitud_gestora ON dim_solicitud_bolsa(responsable_gestora_id);
CREATE INDEX idx_solicitud_fecha_asignacion ON dim_solicitud_bolsa(fecha_asignacion);
```

---

## 📋 PLAN DE 4 FASES (SIMPLIFICADO)

### **FASE 1: Backend - Nuevos Endpoints** (2 commits)

```
1.1 Endpoint PATCH /api/bolsas/solicitudes/{id}/asignar
    Método: asignarAGestora()

    Lógica:
    ├─ Validar solicitud existe
    ├─ Validar gestora existe y tiene rol GESTORA_CITAS
    ├─ Actualizar:
    │  ├─ responsable_gestora_id = gestorId
    │  ├─ fecha_asignacion = ahora
    │  └─ estado = APROBADA (si era PENDIENTE)
    ├─ Registrar auditoría
    └─ Retornar SolicitudBolsaDTO

1.2 Endpoint PUT /api/bolsas/solicitudes/{id}/cambiar-telefono [PARTE DE UPDATE EXISTENTE]
    Método: actualizarSolicitud() (REUTILIZAR)

    Lógica:
    ├─ Validar teléfono formato: +51\d{9}
    ├─ Guardar historial en dim_cambios_telefono
    ├─ Actualizar paciente_telefono
    ├─ Registrar auditoría
    └─ Retornar SolicitudBolsaDTO

    NOTA: Este endpoint YA EXISTE como PUT /api/bolsas/solicitudes/{id}
    Solo necesitamos usarlo desde frontend

1.3 Endpoint GET /api/bolsas/solicitudes/exportar [NUEVO]
    Método: exportarCSV()

    Lógica:
    ├─ Recibir array de IDs
    ├─ Obtener solicitudes con JOINS a ipress, red, estados
    ├─ Generar CSV con columnas
    ├─ Retornar blob con Content-Type: text/csv
    └─ Nombre: bolsas_{fecha}.csv

1.4 Endpoint POST /api/bolsas/solicitudes/{id}/recordatorio [NUEVO]
    Método: enviarRecordatorio()

    Lógica:
    ├─ Validar solicitud existe
    ├─ Validar estado_gestion_citas = CITADO
    ├─ Obtener datos paciente:
    │  ├─ Teléfono (para WA)
    │  └─ Email (si existe)
    ├─ Enviar según tipo:
    │  ├─ Si WHATSAPP → notificationService.enviarWA()
    │  └─ Si EMAIL → notificationService.enviarEmail()
    ├─ Registrar auditoría
    └─ Actualizar recordatorio_enviado = true

Commits:
  - Commit 1: Implementar asignarAGestora() + exportarCSV()
  - Commit 2: Implementar enviarRecordatorio() + agregar endpoints a controller
```

### **FASE 2: Frontend - Integración API** (2-3 commits)

```
2.1 bolsasService.js - Agregar métodos
    ├─ asignarAGestora(id, gestorId, gestoraNombre)
    ├─ cambiarTelefono(id, nuevoTelefono) [USA PUT existente]
    ├─ descargarCSV(ids)
    ├─ enviarRecordatorio(id, tipo)
    ├─ obtenerEstadosGestion() → /api/admin/estados-gestion-citas/todos
    ├─ obtenerAsegurado(dni) → /api/gestion-pacientes/asegurado/{dni}
    ├─ crearAsegurado(datos) → POST /api/gestion-pacientes
    ├─ obtenerIpress(id) → /api/ipress/{id}
    └─ obtenerRed(id) → /api/redes/{id}

2.2 Solicitudes.jsx - Reemplazar mock data
    ├─ Remover mock data (8 pacientes)
    ├─ cargarSolicitudes() → GET /api/bolsas/solicitudes
    ├─ cargarEstados() → GET /api/admin/estados-gestion-citas/todos
    ├─ useEffect para carga inicial y sincronización
    └─ Cache local de IPRESS, Redes, Estados para no hacer N+1 calls

2.3 Solicitudes.jsx - Implementar handlers
    ├─ handleCambiarTelefono(id, nuevoTelefono)
    │  ├─ Validar teléfono
    │  ├─ Mostrar modal de confirmación
    │  ├─ PUT /api/bolsas/solicitudes/{id}
    │  ├─ Actualizar tabla local
    │  └─ Mostrar toast éxito/error
    │
    ├─ handleAsignarGestora(id, gestorId)
    │  ├─ Mostrar modal con dropdown de gestoras
    │  ├─ PATCH /api/bolsas/solicitudes/{id}/asignar
    │  ├─ Actualizar tabla local
    │  └─ Mostrar toast
    │
    ├─ handleDescargarCSV(ids)
    │  ├─ Si sin selección: usar todos filtrados
    │  ├─ GET /api/bolsas/solicitudes/exportar?ids=...
    │  ├─ Guardar blob como archivo .csv
    │  └─ Mostrar toast
    │
    ├─ handleEnviarRecordatorio(id)
    │  ├─ Mostrar radio buttons: WHATSAPP | EMAIL
    │  ├─ POST /api/bolsas/solicitudes/{id}/recordatorio
    │  └─ Mostrar toast
    │
    └─ handleBuscarAsegurado(dni)
       ├─ GET /api/gestion-pacientes/asegurado/{dni}
       ├─ Si no existe:
       │  └─ POST /api/gestion-pacientes (crear)
       └─ Mostrar datos en modal

2.4 Solicitudes.jsx - Error handling + Loading
    ├─ Estados: isLoading, error, isLoadingAccion, successMessage
    ├─ Spinner durante cargarSolicitudes()
    ├─ Alert rojo si error
    ├─ Toast verde para éxito
    ├─ Deshabilitar botones durante carga
    ├─ Modal de confirmación para cambios críticos
    └─ Retry automático en fallos de red

Commits:
  - Commit 1: bolsasService.js con todos los métodos
  - Commit 2: Reemplazar mock data + cargar estados/ipress/redes
  - Commit 3: Implementar handlers + error handling
```

### **FASE 3: Base de Datos - Auditoría** (1 commit)

```
3.1 Crear tablas de auditoría

    dim_asignacion_bolsa_gestora:
    ├─ id_asignacion BIGSERIAL PRIMARY KEY
    ├─ id_solicitud BIGINT FK → dim_solicitud_bolsa
    ├─ gestora_id BIGINT FK → usuarios
    ├─ coordinador_id BIGINT FK → usuarios
    ├─ fecha_asignacion TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)
    ├─ notas_auditoria TEXT
    └─ índices: (id_solicitud), (gestora_id), (fecha_asignacion)

    dim_cambios_telefono:
    ├─ id BIGSERIAL PRIMARY KEY
    ├─ id_solicitud BIGINT FK → dim_solicitud_bolsa
    ├─ usuario_id BIGINT FK → usuarios
    ├─ telefono_anterior VARCHAR(20)
    ├─ telefono_nuevo VARCHAR(20) NOT NULL
    ├─ razon_cambio VARCHAR(255)
    ├─ fecha_cambio TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)
    └─ índices: (id_solicitud), (fecha_cambio)

    dim_solicitud_bolsa UPDATE:
    ├─ Cambiar paciente_id → asegurado_id
    ├─ Agregar FK a pacientes_asegurados
    └─ Ejecutar migración Flyway

Migración:
  - Archivo: V3_0_5__crear_auditorias_bolsas_v2.sql
  - Contenido: CREATE TABLE + índices + datos iniciales (si aplica)

Commit:
  - Commit 1: Crear tablas de auditoría + migración Flyway
```

### **FASE 4: Testing + Documentación** (1-2 commits)

```
4.1 Testing Backend
    ├─ SolicitudBolsasServiceTest.java
    │  ├─ testAsignarAGestora_exitoso()
    │  ├─ testAsignarAGestora_validaGestora()
    │  ├─ testCambiarTelefono_telefonoInvalido()
    │  ├─ testExportarCSV_generaArchivoValido()
    │  └─ testEnviarRecordatorio_validaEstado()
    │
    ├─ BolsasControllerTest.java
    │  ├─ testAsignarAGestora_requierePermiso()
    │  └─ testCambiarTelefono_retorna200()
    │
    └─ GestionPacientesIntegrationTest.java
       ├─ testCrearAseguradoSiNoExiste()
       └─ testObtenerAseguradoPorDNI()

4.2 Testing Frontend
    ├─ Solicitudes.test.jsx
    │  ├─ Renderiza tabla correctamente
    │  ├─ Carga datos de API
    │  ├─ Filtros funcionan
    │  ├─ Búsqueda funciona
    │  ├─ Cambia teléfono
    │  ├─ Asigna a gestora
    │  ├─ Descarga CSV
    │  └─ Envía recordatorio

4.3 Testing E2E
    ├─ Cargar página /bolsas/solicitudes
    ├─ Buscar paciente por DNI
    ├─ Cambiar teléfono
    ├─ Asignar a gestora
    ├─ Descargar CSV
    ├─ Enviar recordatorio
    └─ Verificar auditoría en BD

4.4 Documentación
    ├─ Actualizar spec/01_Backend/08_modulo_bolsas_pacientes_completo.md
    ├─ Actualizar CLAUDE.md
    ├─ Actualizar changelog
    ├─ Documentar cambios en BD
    └─ Ejemplos cURL de endpoints

Commits:
  - Commit 1: Tests backend + frontend
  - Commit 2: Actualizar documentación
```

---

## 📊 ESFUERZO ESTIMADO (ACTUALIZADO)

| Fase | Commits | Horas | Días |
|------|---------|-------|------|
| 1. Backend - Nuevos Endpoints | 2 | 6-8 | 1 |
| 2. Frontend - Integración API | 3 | 10-12 | 1.5 |
| 3. Base de Datos | 1 | 2-3 | 0.5 |
| 4. Testing + Docs | 2 | 6-8 | 1 |
| **TOTAL** | **8** | **24-31** | **4-5** |

**REDUCCIÓN vs v1.0:** -5 commits, -8 horas (27% más eficiente)

---

## 🎯 ENDPOINTS REUTILIZADOS

```
✅ IPRESS (Ya existen)
└─ GET /api/ipress/{id}
└─ GET /api/ipress (obtener todas)

✅ REDES (Ya existen)
└─ GET /api/redes/{id}
└─ GET /api/redes (obtener todas)

✅ ESTADOS GESTIÓN (Ya existen)
└─ GET /api/admin/estados-gestion-citas/todos
└─ GET /api/admin/estados-gestion-citas/{id}

✅ GESTIÓN PACIENTES (Ya existen)
└─ GET /api/gestion-pacientes/asegurado/{dni}
└─ POST /api/gestion-pacientes (crear asegurado)
└─ GET /api/gestion-pacientes (obtener todos)

✅ BOLSAS (Ya existen)
└─ GET /api/bolsas/solicitudes
└─ GET /api/bolsas/solicitudes/pendientes
└─ PUT /api/bolsas/solicitudes/{id} (actualizar)
└─ GET /api/bolsas/solicitudes/{id}

❌ NUEVOS ENDPOINTS A CREAR
├─ PATCH /api/bolsas/solicitudes/{id}/asignar
├─ GET /api/bolsas/solicitudes/exportar
└─ POST /api/bolsas/solicitudes/{id}/recordatorio
```

---

## 🔒 SEGURIDAD

```
✅ Autenticación:
   └─ JWT con expiración 1 hora

✅ Autorización:
   ├─ @PreAuthorize("hasRole('COORDINADOR_GESTION_CITAS')")
   ├─ Validar que gestora tiene rol GESTORA_CITAS antes de asignar
   └─ Validar que asegurado existe antes de crear solicitud

✅ Validación:
   ├─ Teléfono: regex +51\d{9}
   ├─ DNI: numérico, 8 dígitos
   ├─ Nombres: no vacío, < 255 caracteres
   └─ IDs: validar que existen en BD

✅ Auditoría:
   ├─ AuditLogService: quién, cuándo, qué, dónde
   ├─ dim_asignacion_bolsa_gestora: historial distribuciones
   └─ dim_cambios_telefono: historial cambios teléfono

✅ Protección de datos:
   ├─ No exponer contraseñas
   ├─ Sanitizar datos sensibles
   ├─ HTTPS en producción
   └─ Encriptación en reposo (si aplica)
```

---

## ⚠️ RIESGOS MITIGADOS (v2.0)

| Riesgo | Mitigación | Estado |
|--------|-----------|--------|
| Endpoints no existen | Reutilizar existentes | ✅ |
| Asegurado no existe | Crear automáticamente en backend | ✅ |
| N+1 queries | Cache local en frontend (IPRESS, Redes) | ✅ |
| Performance 150+ | Paginación + 8 índices | ✅ |
| Datos inconsistentes | Transacciones READ_COMMITTED | ✅ |
| Permisos no validados | Tests de autorización | ✅ |
| Auditoría incompleta | Tablas de auditoría + AuditLogService | ✅ |
| Teléfono inválido | Validación regex + BD | ✅ |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Revisar y aprobar plan v2.0
2. ✅ Crear rama `feature/bolsas-integration-v2`
3. ✅ Iniciar Fase 1 (Backend - 2 commits)
4. ✅ Iniciar Fase 2 (Frontend - 3 commits)
5. ✅ Iniciar Fase 3 (Base de Datos - 1 commit)
6. ✅ Iniciar Fase 4 (Testing - 2 commits)
7. ✅ Code review y QA
8. ✅ Merge a main y Deploy

---

## 📄 DOCUMENTOS RELACIONADOS

- **Principal:** `plan/implementacion_modulo_bolsas_solicitudes_v2.md` (Este documento)
- **Módulo Bolsas:** `spec/01_Backend/08_modulo_bolsas_pacientes_completo.md`
- **Resumen Integral:** `spec/01_Backend/06_resumen_modulo_bolsas_completo.md`
- **v1.0 (Anterior):** `plan/implementacion_modulo_bolsas_solicitudes_v1.md`

---

**Status:** ✅ **PLAN v2.0 LISTO PARA IMPLEMENTAR**

**Documento:** Análisis Técnico - Agent Architect
**Versión:** v2.0.0 (Con endpoints existentes + tabla asegurados)
**Fecha:** 2026-01-22

**Mejoras vs v1.0:**
- ✅ Reutilización de 5+ endpoints existentes
- ✅ Integración con tabla `pacientes_asegurados`
- ✅ Creación automática de asegurados
- ✅ 27% menos esfuerzo (8 vs 13 commits)
- ✅ Simplificación de 6 a 4 fases
- ✅ Mejor aprovechamiento de arquitectura existente

¿Aprobamos el plan v2.0 e iniciamos con **Fase 1**? 🚀
