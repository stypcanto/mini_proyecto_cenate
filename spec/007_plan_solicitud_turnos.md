# Plan: Módulo de Solicitud de Turnos por Telemedicina

> **Versión:** 1.0 | **Fecha:** 2025-12-23 | **Estado:** En desarrollo

## Resumen

Implementar un sistema CMS donde el Coordinador Médico crea periodos mensuales de solicitud, los usuarios IPRESS (rol EXTERNO) llenan el formulario desde su módulo, y la información se consolida en un nuevo módulo "Programación CENATE".

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FLUJO GENERAL DEL SISTEMA                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  COORDINADOR MÉDICO                    USUARIO IPRESS (EXTERNO)         │
│  ─────────────────                     ────────────────────────          │
│  1. Crea periodo mensual               1. Ve periodos activos           │
│  2. Define especialidades              2. Datos auto-detectados (perfil)│
│  3. Activa el periodo                  3. Solicita turnos x especialidad│
│  4. Monitorea respuestas               4. Envía formulario              │
│                      ↓                           ↓                       │
│              ┌───────────────────────────────────────────┐               │
│              │         BASE DE DATOS                      │               │
│              │  - periodo_solicitud_turno                 │               │
│              │  - solicitud_turno_ipress                  │               │
│              │  - detalle_solicitud_turno                 │               │
│              └───────────────────────────────────────────┘               │
│                                    ↓                                     │
│                        MÓDULO PROGRAMACIÓN CENATE                        │
│                        ─────────────────────────                         │
│                        - Vista consolidada por mes                       │
│                        - Filtros: Red, IPRESS, Especialidad              │
│                        - Estadísticas y exportación                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Modelo de Datos

### Tabla 1: `periodo_solicitud_turno`
Administra los periodos de captura creados por el Coordinador.

```sql
CREATE TABLE periodo_solicitud_turno (
    id_periodo SERIAL PRIMARY KEY,
    periodo VARCHAR(6) NOT NULL,              -- YYYYMM (ej: "202601")
    descripcion VARCHAR(100) NOT NULL,        -- "Enero 2026"
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'BORRADOR',    -- BORRADOR, ACTIVO, CERRADO
    instrucciones TEXT,                       -- Nota importante para IPRESS
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla 2: `solicitud_turno_ipress`
Registra cada respuesta de una IPRESS a un periodo.

```sql
CREATE TABLE solicitud_turno_ipress (
    id_solicitud SERIAL PRIMARY KEY,
    id_periodo INTEGER REFERENCES periodo_solicitud_turno(id_periodo),
    id_pers INTEGER REFERENCES dim_personal_cnt(id_pers),  -- Usuario que envía (auto-detectado)
    -- Los siguientes se obtienen automáticamente del perfil del usuario:
    -- id_red: desde dim_ipress.id_red donde id_ipress = dim_personal_cnt.id_ipress
    -- id_ipress: desde dim_personal_cnt.id_ipress
    -- email: desde dim_personal_cnt.email_pers o email_corp_pers
    -- nombre: desde dim_personal_cnt.nom_pers + apellidos
    -- telefono: desde dim_personal_cnt.movil_pers
    estado VARCHAR(20) DEFAULT 'ENVIADO',     -- BORRADOR, ENVIADO, REVISADO
    fecha_envio TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_periodo, id_pers)               -- Un usuario solo puede responder una vez por periodo
);
```

**Nota:** No almacenamos Red, IPRESS, email, nombre, teléfono porque estos datos ya existen en `dim_personal_cnt` y `dim_ipress`. Se obtienen mediante JOINs al consultar.

### Tabla 3: `detalle_solicitud_turno`
Detalle de turnos solicitados por especialidad.

```sql
CREATE TABLE detalle_solicitud_turno (
    id_detalle SERIAL PRIMARY KEY,
    id_solicitud INTEGER REFERENCES solicitud_turno_ipress(id_solicitud) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES dim_servicio_essi(id_servicio),
    turnos_solicitados INTEGER DEFAULT 0,
    turno_preferente VARCHAR(100),            -- "Mañana", "Tarde", etc.
    dia_preferente VARCHAR(200),              -- "Lunes, Miércoles"
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Componentes a Implementar

### BACKEND (Spring Boot)

#### 1. Entidades JPA
| Archivo | Ubicación |
|---------|-----------|
| `PeriodoSolicitudTurno.java` | `backend/src/main/java/com/styp/cenate/model/` |
| `SolicitudTurnoIpress.java` | `backend/src/main/java/com/styp/cenate/model/` |
| `DetalleSolicitudTurno.java` | `backend/src/main/java/com/styp/cenate/model/` |

#### 2. Repositories
| Archivo | Ubicación |
|---------|-----------|
| `PeriodoSolicitudTurnoRepository.java` | `backend/src/main/java/com/styp/cenate/repository/` |
| `SolicitudTurnoIpressRepository.java` | `backend/src/main/java/com/styp/cenate/repository/` |
| `DetalleSolicitudTurnoRepository.java` | `backend/src/main/java/com/styp/cenate/repository/` |

#### 3. DTOs
| Archivo | Ubicación |
|---------|-----------|
| `PeriodoSolicitudTurnoDTO.java` | `backend/src/main/java/com/styp/cenate/dto/` |
| `SolicitudTurnoIpressDTO.java` | `backend/src/main/java/com/styp/cenate/dto/` |
| `DetalleSolicitudTurnoDTO.java` | `backend/src/main/java/com/styp/cenate/dto/` |
| `ProgramacionCenateResumenDTO.java` | `backend/src/main/java/com/styp/cenate/dto/` |

#### 4. Services
| Archivo | Ubicación |
|---------|-----------|
| `PeriodoSolicitudTurnoService.java` | `backend/src/main/java/com/styp/cenate/service/solicitudturno/` |
| `PeriodoSolicitudTurnoServiceImpl.java` | `backend/src/main/java/com/styp/cenate/service/solicitudturno/` |
| `SolicitudTurnoIpressService.java` | `backend/src/main/java/com/styp/cenate/service/solicitudturno/` |
| `SolicitudTurnoIpressServiceImpl.java` | `backend/src/main/java/com/styp/cenate/service/solicitudturno/` |

#### 5. Controllers
| Archivo | Ubicación |
|---------|-----------|
| `PeriodoSolicitudTurnoController.java` | `backend/src/main/java/com/styp/cenate/api/solicitudturno/` |
| `SolicitudTurnoIpressController.java` | `backend/src/main/java/com/styp/cenate/api/solicitudturno/` |
| `ProgramacionCenateController.java` | `backend/src/main/java/com/styp/cenate/api/programacion/` |

---

### FRONTEND (React)

#### 1. Módulo Coordinador - CMS de Periodos
| Archivo | Ubicación |
|---------|-----------|
| `GestionPeriodosSolicitud.jsx` | `frontend/src/pages/roles/coordinador/` |

**Funcionalidades:**
- CRUD de periodos (crear, editar, eliminar)
- Activar/desactivar periodo
- Ver estadísticas de respuestas
- Ver detalle de respuestas por IPRESS

#### 2. Módulo IPRESS (Externo) - Formulario de Solicitud
| Archivo | Ubicación |
|---------|-----------|
| `FormularioSolicitudTurnos.jsx` | `frontend/src/pages/roles/externo/` |

**Funcionalidades:**
- Ver periodos activos
- **Todos los datos auto-detectados del perfil del usuario** (solo lectura):
  - Red e IPRESS
  - Email de contacto
  - Nombre del coordinador de telesalud
  - Teléfono de contacto
- Solicitar turnos por cada especialidad (25 especialidades)
- Especificar turno y día preferente por especialidad (opcional)
- Guardar borrador / Enviar

**Nota importante:** Los datos se obtienen automáticamente del perfil del usuario logueado:
- `dim_personal_cnt.id_ipress` → IPRESS del usuario
- `dim_ipress.id_red` → Red de la IPRESS
- `dim_personal_cnt.email_pers` o `email_corp_pers` → Email de contacto
- `dim_personal_cnt.nom_pers + ape_pater_pers + ape_mater_pers` → Nombre completo
- `dim_personal_cnt.movil_pers` → Teléfono
- Se muestran como campos informativos (no editables) en el header del formulario

#### 3. Módulo Programación CENATE (Independiente)
| Archivo | Ubicación |
|---------|-----------|
| `ProgramacionCenateDashboard.jsx` | `frontend/src/pages/programacion/` |
| `ProgramacionCenateDetalle.jsx` | `frontend/src/pages/programacion/` |

**Funcionalidades:**
- Vista consolidada mes a mes
- Filtros: Periodo, Red, IPRESS, Especialidad
- Tabla resumen de turnos solicitados
- Exportar a CSV/Excel
- Estadísticas generales

#### 4. Services Frontend
| Archivo | Ubicación |
|---------|-----------|
| `periodoSolicitudService.js` | `frontend/src/services/` |
| `solicitudTurnoService.js` | `frontend/src/services/` |
| `programacionCenateService.js` | `frontend/src/services/` |

---

## Endpoints API

### Periodos (Coordinador)
```
GET    /api/periodos-solicitud             - Listar todos los periodos
GET    /api/periodos-solicitud/activos     - Listar periodos activos
GET    /api/periodos-solicitud/{id}        - Obtener periodo por ID
POST   /api/periodos-solicitud             - Crear periodo
PUT    /api/periodos-solicitud/{id}        - Actualizar periodo
PUT    /api/periodos-solicitud/{id}/estado - Cambiar estado (ACTIVO/CERRADO)
DELETE /api/periodos-solicitud/{id}        - Eliminar periodo
GET    /api/periodos-solicitud/{id}/estadisticas - Estadísticas del periodo
```

### Solicitudes IPRESS (Externo)
```
GET    /api/solicitudes-turno/mi-ipress                    - Datos IPRESS del usuario actual (auto-detectado)
GET    /api/solicitudes-turno/periodo/{idPeriodo}          - Listar por periodo
GET    /api/solicitudes-turno/ipress/{idIpress}            - Listar por IPRESS
GET    /api/solicitudes-turno/{id}                         - Obtener por ID
POST   /api/solicitudes-turno                              - Crear solicitud (usa IPRESS del usuario)
POST   /api/solicitudes-turno/borrador                     - Guardar borrador
PUT    /api/solicitudes-turno/{id}                         - Actualizar
PUT    /api/solicitudes-turno/{id}/enviar                  - Enviar solicitud
GET    /api/solicitudes-turno/periodo/{idPeriodo}/existe   - Verificar si ya existe para mi IPRESS
```

**Nota:** El endpoint `POST /api/solicitudes-turno` obtiene automáticamente el `id_ipress` del usuario autenticado desde `SecurityContextHolder` → `Usuario` → `PersonalCnt` → `id_ipress`.

### Programación CENATE
```
GET    /api/programacion-cenate/resumen                    - Resumen general
GET    /api/programacion-cenate/periodo/{idPeriodo}        - Consolidado por periodo
GET    /api/programacion-cenate/exportar/{idPeriodo}       - Exportar a CSV
GET    /api/programacion-cenate/estadisticas/{idPeriodo}   - Estadísticas detalladas
```

---

## Especialidades a Incluir (25)

Basado en el formulario actual de Microsoft Forms:
1. Cardiología
2. Endocrinología
3. Enfermedades Infecciosas y Tropicales
4. Gastroenterología
5. Geriatría
6. Ginecología Teleconsultas
7. Ginecología Telecolposcopia
8. Hematología
9. Medicina Familiar y Comunitaria
10. Medicina Física y Rehabilitación
11. Medicina Interna
12. Nefrología
13. Neumología
14. Neurología
15. Neurología Pediátrica
16. Oftalmología Adulto
17. Ortopedia y Traumatología
18. Otorrinolaringología
19. Pediatría
20. Psiquiatría
21. Reumatología
22. Terapia Física
23. Terapia de Lenguaje
24. Urología
25. (Otras según dim_servicio_essi donde esCenate = true)

---

## Permisos MBAC

### Nuevas páginas en BD
```sql
-- Página para Coordinador
INSERT INTO dim_paginas (ruta_pagina, desc_pagina, stat_pagina)
VALUES ('/coordinador/gestion-periodos', 'Gestión de Periodos de Solicitud', 'A');

-- Página para Externo
INSERT INTO dim_paginas (ruta_pagina, desc_pagina, stat_pagina)
VALUES ('/externo/solicitud-turnos', 'Solicitud de Turnos por Telemedicina', 'A');

-- Páginas para Programación CENATE
INSERT INTO dim_paginas (ruta_pagina, desc_pagina, stat_pagina)
VALUES ('/programacion/dashboard', 'Programación CENATE - Dashboard', 'A');

INSERT INTO dim_paginas (ruta_pagina, desc_pagina, stat_pagina)
VALUES ('/programacion/detalle', 'Programación CENATE - Detalle', 'A');
```

### Menú en BD
```sql
-- Menú para Coordinador (agregar a módulo existente)
INSERT INTO dim_modulos (desc_modulo, url_modulo, icono_modulo, orden_modulo, stat_modulo)
VALUES ('Gestión Periodos', '/roles/coordinador/gestion-periodos', 'Calendar', 5, 'A');

-- Menú para Externo (agregar a módulo existente)
INSERT INTO dim_modulos (desc_modulo, url_modulo, icono_modulo, orden_modulo, stat_modulo)
VALUES ('Solicitud Turnos', '/roles/externo/solicitud-turnos', 'FileText', 4, 'A');

-- Nuevo módulo independiente: Programación CENATE
INSERT INTO dim_modulos (desc_modulo, url_modulo, icono_modulo, orden_modulo, stat_modulo)
VALUES ('Programación CENATE', '/programacion/dashboard', 'BarChart3', 1, 'A');
```

---

## Flujo de Estados

### Periodo
```
BORRADOR → ACTIVO → CERRADO
    ↑___________↓ (puede reactivarse)
```

### Solicitud IPRESS
```
(nuevo) → BORRADOR → ENVIADO → REVISADO
                ↑________↓ (puede editar antes de revisar)
```

---

## Archivos a Modificar

### App.js (agregar rutas)
```javascript
// Coordinador
<Route path="/roles/coordinador/gestion-periodos" element={<GestionPeriodosSolicitud />} />

// Externo
<Route path="/roles/externo/solicitud-turnos" element={<FormularioSolicitudTurnos />} />

// Programación CENATE
<Route path="/programacion/dashboard" element={<ProgramacionCenateDashboard />} />
<Route path="/programacion/detalle/:idPeriodo" element={<ProgramacionCenateDetalle />} />
```

### DynamicSidebar.jsx
El menú se carga dinámicamente desde BD según permisos MBAC. No requiere modificación de código si los módulos se insertan en BD.

---

## Orden de Implementación

### Fase 1: Backend - Base de Datos y Entidades
- [ ] 1. Crear script SQL con las 3 tablas
- [ ] 2. Crear entidades JPA
- [ ] 3. Crear repositories
- [ ] 4. Crear DTOs

### Fase 2: Backend - Services y Controllers
- [ ] 5. Crear services para PeriodoSolicitudTurno
- [ ] 6. Crear services para SolicitudTurnoIpress
- [ ] 7. Crear controllers con endpoints
- [ ] 8. Agregar auditoría a las acciones

### Fase 3: Frontend - Módulo Coordinador
- [ ] 9. Crear GestionPeriodosSolicitud.jsx
- [ ] 10. Crear periodoSolicitudService.js
- [ ] 11. Agregar ruta en App.js
- [ ] 12. Insertar menú en BD

### Fase 4: Frontend - Módulo IPRESS
- [ ] 13. Crear FormularioSolicitudTurnos.jsx
- [ ] 14. Crear solicitudTurnoService.js
- [ ] 15. Agregar ruta en App.js
- [ ] 16. Insertar menú en BD

### Fase 5: Frontend - Módulo Programación CENATE
- [ ] 17. Crear ProgramacionCenateDashboard.jsx
- [ ] 18. Crear ProgramacionCenateDetalle.jsx
- [ ] 19. Crear programacionCenateService.js
- [ ] 20. Agregar rutas en App.js
- [ ] 21. Insertar menú en BD

### Fase 6: Permisos y Testing
- [ ] 22. Insertar páginas y permisos en BD
- [ ] 23. Asignar permisos a roles correspondientes
- [ ] 24. Testing integral

---

## Archivos Críticos Existentes (Referencia)

| Propósito | Archivo |
|-----------|---------|
| Entidad IPRESS | `backend/src/main/java/com/styp/cenate/model/Ipress.java` |
| Entidad Red | `backend/src/main/java/com/styp/cenate/model/Red.java` |
| Entidad Especialidad | `backend/src/main/java/com/styp/cenate/model/DimServicioEssi.java` |
| Entidad PersonalCnt | `backend/src/main/java/com/styp/cenate/model/PersonalCnt.java` |
| Service de referencia | `backend/src/main/java/com/styp/cenate/service/ipress/IpressServiceImpl.java` |
| Controller referencia | `backend/src/main/java/com/styp/cenate/api/entidad/IpressController.java` |
| CRUD Frontend referencia | `frontend/src/pages/admin/components/ProfesionCRUD.jsx` |
| CMS Frontend referencia | `frontend/src/pages/admin/DashboardMedicoCMS.jsx` |
| Formulario complejo referencia | `frontend/src/pages/roles/externo/FormularioDiagnostico.jsx` |
| Service Frontend referencia | `frontend/src/services/profesionService.js` |
| App.js rutas | `frontend/src/App.js` |

---

*Documentación técnica CENATE | Última actualización: 2025-12-23*
