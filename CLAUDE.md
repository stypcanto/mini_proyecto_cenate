# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.16.1** (2026-01-03)

---

## ¿Qué es CENATE?

**CENATE es el Centro Nacional de Telemedicina** del Seguro Social de Salud (EsSalud) en Perú. Coordina atenciones médicas remotas para 4.6M asegurados a través de 414 IPRESS a nivel nacional.

### Propósito del Sistema

CENATE permite:
- **Planificación y registro** de atenciones de telemedicina
- **Coordinación de atención médica especializada** desde CENATE hacia IPRESS
- **Gestión de turnos médicos** según disponibilidad del personal
- **Administración de personal** (regímenes 728, CAS, Locador)
- **Trazabilidad completa** de atenciones por paciente/servicio
- **Control de accesos y auditoría** de operaciones
- **Firma digital** para documentos

**IMPORTANTE:** Este sistema **NO realiza videollamadas**. Su función es **planificar, registrar y coordinar** atenciones.

---

## Documentación Completa

### 📚 Especificaciones Técnicas (`spec/`)

| Tema | Archivo | Descripción |
|------|---------|-------------|
| **API Backend** | `spec/01_Backend/01_api_endpoints.md` | Endpoints REST documentados |
| **Normalización Excel** | `spec/01_Backend/04_auto_normalizacion_excel_107.md` | Importación masiva Bolsa 107 |
| **Arquitectura** | `spec/03_Arquitectura/01_diagramas_sistema.md` | Diagramas del sistema |
| **Modelo Usuarios** | `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md` | Estructura de usuarios |
| **⭐ Auditoría** | `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md` | Guía completa de auditoría |
| **Acceso Sensible** | `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/` | Auditoría de datos críticos |
| **Análisis BD** | `spec/04_BaseDatos/04_analisis_estructura/` | Análisis completo de BD |
| **Plan Limpieza** | `spec/04_BaseDatos/05_plan_limpieza/` | Plan limpieza BD |
| **Scripts SQL** | `spec/04_BaseDatos/06_scripts/` | 17+ scripts SQL |
| **Troubleshooting** | `spec/05_Troubleshooting/01_guia_problemas_comunes.md` | Solución de problemas |

### 📋 Planificación (`plan/`)

| Módulo | Archivo | Estado |
|--------|---------|--------|
| **Auditoría** | `plan/01_Seguridad_Auditoria/01_plan_auditoria.md` | ✅ Implementado |
| **Seguridad Auth** | `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md` | ✅ Implementado |
| **Disponibilidad Turnos** | `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` | ✅ Implementado |
| **Solicitud Turnos** | `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` | 🔄 En desarrollo |
| **Módulo Red** | `plan/03_Infraestructura/01_plan_modulo_red.md` | 📋 Pendiente |
| **Firma Digital** | `plan/05_Firma_Digital/01_plan_implementacion.md` | ✅ Implementado |

### ✅ Historial y Reportes (`checklist/`)

| Tipo | Archivo | Descripción |
|------|---------|-------------|
| **⭐ Changelog** | `checklist/01_Historial/01_changelog.md` | Historial completo de versiones |
| **Versiones** | `checklist/01_Historial/02_historial_versiones.md` | Resumen de releases |
| **Reporte Disponibilidad** | `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md` | Testing disponibilidad médica |
| **Checklist Firma** | `checklist/03_Checklists/01_checklist_firma_digital.md` | Checklist firma digital |
| **Análisis Chatbot** | `checklist/04_Analisis/01_analisis_chatbot_citas.md` | Análisis chatbot citas |

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                    # 📚 Documentación técnica
│   ├── 01_Backend/          # API, endpoints, lógica
│   ├── 02_Frontend/         # React (próximamente)
│   ├── 03_Arquitectura/     # Diagramas, flujos
│   ├── 04_BaseDatos/        # Modelo, auditoría, scripts
│   └── 05_Troubleshooting/  # Guía de problemas
│
├── plan/                    # 📋 Planificación
│   ├── 01_Seguridad_Auditoria/
│   ├── 02_Modulos_Medicos/
│   ├── 03_Infraestructura/
│   ├── 04_Integraciones/
│   └── 05_Firma_Digital/
│
├── checklist/               # ✅ Logs, reportes, análisis
│   ├── 01_Historial/        # Changelog, versiones
│   ├── 02_Reportes_Pruebas/
│   ├── 03_Checklists/
│   └── 04_Analisis/
│
├── backend/                 # Spring Boot (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/             # Controllers REST
│       ├── service/         # Lógica de negocio
│       ├── model/           # Entidades JPA (51)
│       ├── repository/      # JPA Repositories (48)
│       ├── dto/             # Data Transfer Objects
│       ├── security/        # JWT + MBAC
│       └── exception/       # Manejo de errores
│
├── frontend/                # React (puerto 3000)
│   └── src/
│       ├── components/      # UI reutilizable
│       ├── context/         # AuthContext, PermisosContext
│       ├── pages/           # Vistas (31+)
│       └── services/        # API services
│
└── CLAUDE.md               # ⭐ Este archivo (guía rápida)
```

---

## Configuración de Desarrollo

### Variables de Entorno - Backend

```bash
# PostgreSQL (servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT (mínimo 32 caracteres)
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Email SMTP (Servidor Corporativo EsSalud)
MAIL_HOST=172.20.0.227
MAIL_PORT=25
MAIL_USERNAME=cenate.contacto@essalud.gob.pe
MAIL_PASSWORD=essaludc50
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS=true

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos Desarrollo

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start
```

### Credenciales de Prueba

```
Username: 44914706
Password: @Cenate2025
```

---

## Despliegue en Producción (Docker)

### ⚠️ PASOS DE INICIO (IMPORTANTE)

Cada vez que reinicies la Mac o Docker:

```bash
# 1. Iniciar relay SMTP (permite a Docker conectar al servidor corporativo)
./start-smtp-relay.sh

# 2. Iniciar Docker
docker-compose up -d

# 3. Verificar
docker-compose ps
docker logs cenate-backend --tail=20
```

### Arquitectura Docker

```
┌─────────────────────────────────────────┐
│       SERVIDOR PRODUCCIÓN               │
│                                          │
│  ┌────────────┐    ┌──────────────┐     │
│  │  frontend  │───▶│   backend    │     │
│  │ (nginx:80) │/api│ (spring:8080)│     │
│  └────────────┘    └──────────────┘     │
│                          │               │
└──────────────────────────┼───────────────┘
                           │
                           ▼
              PostgreSQL (10.0.89.13:5432)
```

### Comandos Docker

```bash
# Construir y levantar
docker-compose up -d --build

# Solo frontend
docker-compose build frontend && docker-compose up -d frontend

# Solo backend
docker-compose build backend && docker-compose up -d backend

# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down
```

---

## Módulos Principales

### 1. Auditoría

📖 **Documentación completa:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`

**Resumen:**
- Tabla `audit_logs` con índices optimizados
- Vista `vw_auditoria_modular_detallada`
- Servicios integrados: Usuario, Auth, Disponibilidad
- Frontend: LogsDelSistema.jsx con filtros avanzados

**Endpoints:**
```
GET /api/auditoria/busqueda-avanzada
```

### 2. Disponibilidad de Turnos Médicos

📋 **Plan:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
📊 **Reporte:** `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`

**Resumen:**
- Médicos declaran disponibilidad mensual (M/T/MT)
- Validación 150 horas mínimas
- Estados: BORRADOR → ENVIADO → REVISADO
- Cálculo automático según régimen laboral

**Endpoints:**
```
GET  /api/disponibilidad/mis-disponibilidades
POST /api/disponibilidad
PUT  /api/disponibilidad/{id}/enviar
PUT  /api/disponibilidad/{id}/revisar
```

### 3. Firma Digital

📋 **Plan:** `plan/05_Firma_Digital/01_plan_implementacion.md`
✅ **Checklist:** `checklist/03_Checklists/01_checklist_firma_digital.md`

**Resumen:**
- Gestión de tokens y certificados digitales
- Solo para personal interno CAS/728
- Estados: PENDIENTE → ENTREGADO
- Tracking de vigencia de certificados

**Endpoints:**
```
POST /api/firma-digital
GET  /api/firma-digital/personal/{id}
PUT  /api/firma-digital/{id}/actualizar-entrega
GET  /api/firma-digital/pendientes
```

### 4. Bolsa 107 (Importación Masiva)

📖 **Arquitectura:** `spec/01_Backend/04_auto_normalizacion_excel_107.md`

**Resumen:**
- Importación masiva desde Excel (14 columnas)
- Validación automática de formato
- Detección de duplicados por hash
- Trazabilidad de errores por fila

**Endpoints:**
```
POST   /api/import-excel/pacientes
GET    /api/import-excel/cargas
GET    /api/import-excel/pacientes/{id}/datos
DELETE /api/import-excel/cargas/{id}
GET    /api/import-excel/cargas/{id}/exportar
```

### 5. Pacientes de 107 (Gestión y Visualización)

**Ubicación:** Coordinador de Gestión de Citas → Pacientes de 107
**Ruta:** `/roles/coordcitas/pacientes-107`
**Versión:** v1.15.2

**Resumen:**
- Dashboard de estadísticas de pacientes importados
- Filtros avanzados (DNI, nombre, teléfono, derivación, departamento)
- Visualización centralizada de pacientes de Bolsa 107
- Selección múltiple para acciones masivas
- Integración con WhatsApp para contacto rápido
- Cálculo automático de edad desde fecha de nacimiento

**Estadísticas visualizadas:**
- Total de pacientes
- Pacientes por derivación (Psicología, Medicina, **Nutrición**)
- Pacientes por ubicación (Lima, Provincia)

**Componentes Frontend:**
- `PacientesDe107.jsx` (650+ líneas)
- 5 tarjetas de estadísticas con gradientes
- Tabla con badges de colores
- Buscador en tiempo real

**Componentes Backend:**
- `Bolsa107Controller.java`
- Repository: `Bolsa107ItemRepository`
- Modelo: `Bolsa107Item`

**Endpoints:**
```
GET /api/bolsa107/pacientes
GET /api/bolsa107/pacientes/por-derivacion?derivacion={tipo}
GET /api/bolsa107/estadisticas
```

**Permisos:**
- SUPERADMIN: Todos los permisos
- ADMIN: Todos los permisos

### 6. Asignación Automática de Roles

📖 **Changelog v1.13.0:** `checklist/01_Historial/01_changelog.md`

**Resumen:**
- Asignación automática según IPRESS al aprobar solicitud
- Notificaciones en tiempo real (campanita)
- Panel de gestión de usuarios pendientes
- Polling cada 30 segundos

**Endpoints:**
```
GET /api/usuarios/pendientes-rol
GET /api/usuarios/pendientes-rol/lista
```

### 7. Asignación de Pacientes a Admisionistas

**Ubicación:**
- Coordinadores: Pacientes de 107 → Botón "Asignar"
- Admisionistas: Menú → Asignación de Pacientes
**Rutas:**
- `/roles/coordcitas/pacientes-107` (coordinadores)
- `/roles/admision/asignacion-pacientes` (admisionistas)
**Versión:** v1.14.2

**Resumen:**
- Los coordinadores pueden asignar pacientes de Bolsa 107 a usuarios con rol ADMISION
- Los admisionistas tienen una bandeja personal con sus pacientes asignados
- Modal inteligente con búsqueda de admisionistas
- Registro de fecha de asignación automático
- Integración con WhatsApp para contacto directo

**Flujo de Trabajo:**
1. Coordinador accede a "Pacientes de 107"
2. Clic en botón "Asignar" (icono UserPlus) en la fila del paciente
3. Se abre modal con lista de todos los usuarios ADMISION
4. Búsqueda por nombre, DNI o correo del admisionista
5. Selección del admisionista (visual con checkmark)
6. Confirmación → Paciente asignado
7. Admisionista ve el paciente en su bandeja personal

**Componentes Backend:**
- `Bolsa107Controller.java` - Endpoints de asignación
- `UsuarioController.java` - Endpoint lista de admisionistas
- Tabla: `bolsa_107_item` con columnas:
  - `id_admisionista_asignado` (FK a dim_usuarios)
  - `fecha_asignacion_admisionista` (TIMESTAMP)

**Componentes Frontend:**
- `AsignarAdmisionistaModal.jsx` (229 líneas)
  - Lista de admisionistas con avatares
  - Búsqueda en tiempo real
  - Selección visual elegante
- `AsignacionDePacientes.jsx` (419 líneas)
  - Dashboard personal del admisionista
  - Estadísticas: Total, Psicología, Medicina, Lima, Provincia
  - Tabla completa de pacientes asignados
  - Botón WhatsApp por paciente
  - Búsqueda y filtros por derivación/ubicación
- `PacientesDe107.jsx` (modificado)
  - Botón "Asignar" en columna de acciones
  - Integración con modal de asignación

**Endpoints:**
```
GET  /api/usuarios/admisionistas
     → Lista usuarios con rol ADMISION

POST /api/bolsa107/asignar-admisionista
     Body: { id_item: Long, id_admisionista: Long }
     → Asigna paciente a admisionista

GET  /api/bolsa107/mis-asignaciones
     → Lista pacientes asignados al usuario logueado
```

**Base de Datos:**
```sql
-- Columnas agregadas a bolsa_107_item
ALTER TABLE bolsa_107_item
  ADD COLUMN id_admisionista_asignado BIGINT,
  ADD COLUMN fecha_asignacion_admisionista TIMESTAMP WITH TIME ZONE;

-- Foreign key
ALTER TABLE bolsa_107_item
  ADD CONSTRAINT fk_bolsa107_admisionista
  FOREIGN KEY (id_admisionista_asignado)
  REFERENCES dim_usuarios(id_user) ON DELETE SET NULL;

-- Índice para búsquedas
CREATE INDEX ix_bolsa107_admisionista
  ON bolsa_107_item(id_admisionista_asignado)
  WHERE id_admisionista_asignado IS NOT NULL;
```

**Permisos (MBAC):**
- Página ID: 73 - "Asignación de Pacientes"
- Módulo: Coordinador de Gestión de Citas (ID: 41)
- Rol ADMISION: puede_ver = true, puede_exportar = true

**Script SQL:**
```bash
spec/04_BaseDatos/06_scripts/020_agregar_menu_asignacion_pacientes.sql
```

### 8. Sistema de Notificaciones de Cumpleaños

**Versión:** v1.15.10
📖 **Changelog:** `checklist/01_Historial/01_changelog.md` (v1.15.10)

**Resumen:**
- Notificaciones de cumpleaños integradas en el header principal
- Campanita con badge animado (solo ADMIN/SUPERADMIN)
- Panel desplegable con lista de cumpleañeros del día
- Polling automático cada 5 minutos
- Diseño institucional integrado

**Ubicación:**
- Header superior derecho (entre tema y perfil de usuario)
- Panel desplegable desde la campanita

**Características:**

| Funcionalidad | Detalles |
|--------------|----------|
| **Acceso** | Solo ADMIN y SUPERADMIN |
| **Endpoint Count** | `GET /api/notificaciones/count` |
| **Endpoint Lista** | `GET /api/notificaciones/cumpleanos` |
| **Polling** | Cada 5 minutos (300,000 ms) |
| **Badge** | Número rojo animado (máx "9+") |
| **Panel** | Componente `NotificacionesPanel.jsx` |
| **Origen Datos** | Tabla `dim_personal_cnt` |
| **Filtro** | Estado ACTIVO + fecha nacimiento = hoy |

**Flujo de Trabajo:**

1. **Usuario ADMIN/SUPERADMIN inicia sesión**
2. **Header consulta** → `GET /api/notificaciones/count`
3. **Si hay cumpleaños hoy:**
   - Badge rojo aparece con número
   - Punto pulsante indica notificación
4. **Click en campanita:**
   - Panel se abre → `GET /api/notificaciones/cumpleanos`
   - Muestra lista de cumpleañeros:
     - Avatar (foto o iniciales)
     - Nombre completo
     - Profesión
     - Mensaje: "X cumple Y años hoy"
     - Emoji 🎂
5. **Polling continúa cada 5 minutos**

**Componentes Backend:**
- `NotificacionController.java` (`/api/notificacion/`)
  - Endpoints REST con seguridad `@PreAuthorize`
- `NotificacionServiceImpl.java` (`/service/notificacion/`)
  - Lógica de negocio: filtrado en memoria de personal activo
  - Cálculo de edad y construcción de mensajes
- `NotificacionResponse.java` (`/dto/`)
  - DTO con campos: tipo, título, mensaje, id_personal, nombre_completo, profesión, fecha, foto_url, icono
- `PersonalCnt.java` (`/model/`)
  - Entidad con `fechNaciPers` (LocalDate)

**Componentes Frontend:**
- `Header_template.jsx` (`/components/Header/`)
  - **MODIFICADO** para integrar notificaciones
  - Estados: `showNotificaciones`, `cantidadNotificaciones`
  - Polling con `useEffect` y `setInterval`
  - Botón campanita con badge animado
- `NotificacionesPanel.jsx` (`/components/`)
  - Panel desplegable con diseño institucional
  - Overlay oscuro al abrir
  - Lista de cumpleañeros con avatares
  - Footer con contador

**Endpoints:**
```
GET /api/notificaciones/count
    → Retorna: Integer (cantidad de cumpleaños hoy)
    → Seguridad: ADMIN o SUPERADMIN

GET /api/notificaciones/cumpleanos
    → Retorna: List<NotificacionResponse>
    → Seguridad: ADMIN o SUPERADMIN
```

**Ejemplo de Respuesta:**
```json
{
  "cantidad": 1,
  "cumpleanos": [
    {
      "tipo": "CUMPLEANOS",
      "titulo": "¡Feliz Cumpleaños! 🎂",
      "mensaje": "Carolina Alvarez Mejía cumple 26 años hoy",
      "id_personal": 198,
      "nombre_completo": "Carolina Alvarez Mejía",
      "profesion": "Personal médico",
      "fecha": "2000-01-02",
      "foto_url": null,
      "icono": "🎂"
    }
  ]
}
```

**Archivos Modificados:**
- `frontend/src/components/Header/Header_template.jsx`
  - Líneas 11-16: Importaciones (Bell, NotificacionesPanel)
  - Líneas 27-28: Estados de notificaciones
  - Líneas 95-117: Polling y función de carga
  - Líneas 189-205: Botón campanita con badge
  - Líneas 368-372: Renderizado del panel

**Diseño Visual:**
```
┌────────────────────────────────────────────────┐
│  [Logo]  [Título]        [🔔¹] [👤 Usuario]  │  ← Header
└────────────────────────────────────────────────┘
                              ↓ (click)
                    ┌──────────────────────┐
                    │ 🎂 Cumpleaños de Hoy │
                    ├──────────────────────┤
                    │ 👤 Carolina Álvarez  │
                    │    Personal médico   │
                    │    Cumple 26 años    │
                    ├──────────────────────┤
                    │ 1 cumpleaños hoy     │
                    └──────────────────────┘
```

**Beneficios:**
- 🎂 Celebrar cumpleaños del equipo proactivamente
- 🔔 Notificaciones visibles sin salir del sistema
- 📊 Datos actualizados desde base de datos central
- 🎨 Diseño integrado con identidad institucional
- ⚡ Performance optimizado con polling de 5 minutos

**Próximas Mejoras:**
- Query SQL optimizado (evitar `findAll()` + filtros en memoria)
- WebSocket para actualizaciones en tiempo real
- Tabla de auditoría para notificaciones leídas
- Cache con TTL para reducir carga a BD
- Más tipos de notificaciones (alertas, recordatorios, avisos)

---

### 9. Optimizaciones de Performance - Gestión de Usuarios

**Versión:** v1.14.2

**Problemas Solucionados:**

1. **Carga excesiva de datos al filtrar**
   - **Antes:** Cargaba 1000 usuarios con cualquier filtro (3-5 segundos)
   - **Ahora:**
     - Búsqueda por DNI (solo números): 500 usuarios (0.5-1 seg)
     - Búsqueda por nombre/texto: 100 usuarios (0.3-0.5 seg)
     - Sin filtros: 7 usuarios paginados (instantáneo)

2. **Debouncing del buscador**
   - **Antes:** Cada tecla disparaba una búsqueda (8 búsquedas para "ADMISION")
   - **Ahora:** Espera 300ms después de dejar de escribir (1 sola búsqueda)

3. **Indicador visual de búsqueda**
   - **Antes:** Mostraba "No se encontraron usuarios" durante el debounce
   - **Ahora:** Muestra spinner "Buscando..." mientras espera

**Mejoras de Performance:**

| Escenario | Antes | Ahora | Mejora |
|-----------|-------|-------|--------|
| Filtro por ROL | ~3-5 seg | ~0.3-0.5 seg | **10x más rápido** |
| Búsqueda por DNI | ~3-5 seg | ~0.5-1 seg | **5x más rápido** |
| Búsqueda por nombre | 8 requests | 1 request | **8x menos carga** |

**Archivos Modificados:**
- `UsersManagement.jsx` (1671 líneas)
  - Estado `isSearching` para UX mejorada
  - Debouncing de 300ms
  - Detección automática de búsqueda por DNI (regex `/^\d+$/`)
  - Carga inteligente según tipo de búsqueda
- `UsersTable.jsx`
  - Prop `isSearching` para mostrar estado de búsqueda
  - Spinner mientras espera debounce
- `UsersCards.jsx`
  - Prop `isSearching` para vista de tarjetas
  - Mismo comportamiento que tabla

**Código Clave:**
```javascript
// Debouncing automático
useEffect(() => {
  if (searchTerm !== debouncedSearchTerm) {
    setIsSearching(true);
  }

  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
    setIsSearching(false);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm, debouncedSearchTerm]);

// Carga inteligente según tipo de búsqueda
const isDNISearch = /^\d+$/.test(searchTerm);
const sizeToLoad = isDNISearch ? 500 : (hasActiveFilters ? 100 : pageSize);
```

**Búsqueda Mejorada:**
- Búsqueda exacta para DNI (sin convertir a minúsculas)
- Búsqueda case-insensitive para texto
- Campos soportados:
  - `username` / `nameUser` (DNI)
  - `numero_documento` / `num_doc_pers` (DNI alternativo)
  - `nombre_completo` (nombre)
  - `nombre_ipress` / `descIpress` (institución)
  - `correo_personal` / `correoPersonal` (email)
  - `correo_corporativo` / `correo_institucional` (email)

---

### 10. Gestión de Asegurado - Programación ESSI

**Ubicación:** Gestión de Citas → Gestión del Asegurado
**Ruta:** `/roles/citas/gestion-asegurado`
**Versión:** v1.16.0 (2026-01-03)

**Resumen:**
Sistema completo para gestionar pacientes asignados a gestores de citas, incluyendo programación de atenciones en ESSI con asignación automática de profesionales de salud.

**Funcionalidades Principales:**

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Modal Editar Gestión** | Actualización de datos de contacto del paciente | ✅ Implementado |
| **Selector de Profesional** | Dropdown con autocompletado de DNI y especialidad | ✅ Implementado |
| **Limpiar Asignación** | Botón para eliminar profesional asignado | ✅ Implementado |
| **Campos de Contacto** | Teléfono principal, alterno y correo | ✅ Implementado |
| **Especialidades Médicas** | Query optimizado con especialidades reales | ✅ Implementado |

#### Modal "Editar Gestión" - Campos Editables

```
┌─────────────────────────────────────────────────┐
│  Editar Gestión                            [X]  │
│  Nombre Paciente - DNI: 12345678                │
├─────────────────────────────────────────────────┤
│  [Tipo de Apoyo ▼]      [Gestora ▼]            │
│  [Tel. móvil principal] [Tel. alterno]          │
│  [Correo Electrónico]   [IPRESS (solo lectura)] │
│  [Observaciones...                             ]│
│                                                  │
│               [Cancelar]  [Guardar Cambios]     │
└─────────────────────────────────────────────────┘
```

**Campos del Modal:**
- ✅ **Tipo de Apoyo** - Dropdown editable (PROGRAMAR EN ESSI, OTROS, etc.)
- ✅ **Gestora** - Dropdown con usuarios del sistema
- ✅ **Teléfono móvil principal** - Input editable
- ✅ **Teléfono celular o fijo alterno** - Input editable (NUEVO v1.16.0)
- ✅ **Correo Electrónico** - Input editable (NUEVO v1.16.0)
- ❌ **IPRESS** - Solo lectura (muestra IPRESS de afiliación del paciente)
- ✅ **Observaciones** - Textarea editable

#### Programación ESSI - Tabla de Gestión

**Columnas visibles cuando Tipo de Apoyo = "PROGRAMAR EN ESSI":**

| Columna | Tipo | Comportamiento | Versión |
|---------|------|----------------|---------|
| **Fecha Programación** | Date input | Editable inline | v1.15.x |
| **Turno** | Select (M/T/MT) | Editable inline | v1.15.x |
| **Profesional** | Select | Autocompletado DNI + Especialidad | ✅ v1.16.0 |
| **DNI Prof.** | Input (8 dígitos) | Autocompletado desde profesional | ✅ v1.16.0 |
| **Especialidad** | Input text | Autocompletado desde profesional | ✅ v1.16.0 |

**Mejoras UI/UX v1.16.0:**

1. **Select de Profesionales Mejorado**
   - ❌ **Antes:** Datalist con duplicación de nombres
   ```
   Andrea Lucia Gálvez Gastelú
   Andrea Lucia Gálvez Gastelú - ESPECIALIDADES  ← Duplicado horrible
   ```
   - ✅ **Ahora:** Select limpio con formato profesional
   ```
   Andrea Lucia Gálvez Gastelú • MEDICINA INTERNA
   Angela Mercedes Veliz Franco • CARDIOLOGIA
   Ángel Eduardo Villareal Giraldo • PEDIATRÍA
   ```

2. **Autocompletado Inteligente**
   - Selección de profesional → Autocompleta DNI y Especialidad
   - Guardado automático en base de datos
   - Actualización optimista en UI (sin recargar)

3. **Botón Limpiar Asignación** (Nuevo v1.16.0)
   - Icono: `XCircle` morado
   - Ubicación: Columna ACCIONES
   - Función: Limpia profesional, DNI y especialidad simultáneamente
   - Confirmación antes de limpiar
   - Visible solo cuando hay profesional asignado

**Componentes Backend:**

| Archivo | Ubicación | Cambios v1.16.0 |
|---------|-----------|-----------------|
| `Bolsa107ItemRepository.java` | `/repository/form107/` | ✅ Query mejorado con especialidades |
| `Bolsa107Controller.java` | `/api/form107/` | ✅ Endpoints actualizados |
| `Bolsa107Item.java` | `/model/form107/` | ✅ Campos: `telCelular`, `correoElectronico` |

**Query SQL Optimizado - Especialidades Médicas:**

```sql
-- ANTES (solo mostraba área general)
SELECT
    p.id_pers,
    p.num_doc_pers,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers as nombre_completo,
    a.desc_area,  -- TELECONSULTAS, TELEURGENCIA, etc.
    p.id_area
FROM dim_personal_cnt p
LEFT JOIN dim_area a ON p.id_area = a.id_area
WHERE p.stat_pers = 'A'
AND p.id_area IN (1, 2, 3, 6, 7, 13)

-- AHORA (muestra especialidad médica real)
SELECT DISTINCT
    p.id_pers,
    p.num_doc_pers,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers as nombre_completo,
    COALESCE(s.desc_servicio, prof.desc_prof, a.desc_area) as desc_area,
    p.id_area
FROM dim_personal_cnt p
LEFT JOIN dim_area a ON p.id_area = a.id_area
LEFT JOIN dim_personal_prof pp ON p.id_pers = pp.id_pers AND pp.stat_pers_prof = 'A'
LEFT JOIN dim_profesiones prof ON pp.id_prof = prof.id_prof
LEFT JOIN dim_servicio_essi s ON pp.id_servicio = s.id_servicio
WHERE p.stat_pers = 'A'
AND p.id_area IN (1, 2, 3, 6, 7, 13)
ORDER BY nombre_completo
```

**Prioridad del COALESCE:**
1. `s.desc_servicio` → Especialidad médica (CARDIOLOGIA, MEDICINA INTERNA, PEDIATRÍA)
2. `prof.desc_prof` → Profesión (MEDICO, ENFERMERA, PSICOLOGO)
3. `a.desc_area` → Área de trabajo (TELECONSULTAS, TELEURGENCIA)

**Componentes Frontend:**

| Archivo | Ubicación | Líneas Modificadas | Cambios |
|---------|-----------|-------------------|---------|
| `GestionAsegurado.jsx` | `/pages/roles/citas/` | 828-867 | ✅ Select profesional con autocompletado |
| `GestionAsegurado.jsx` | `/pages/roles/citas/` | 873-905 | ✅ Inputs DNI y Especialidad controlados |
| `GestionAsegurado.jsx` | `/pages/roles/citas/` | 570-604 | ✅ Función `handleLimpiarProfesional` |
| `GestionAsegurado.jsx` | `/pages/roles/citas/` | 975-985 | ✅ Botón limpiar en ACCIONES |
| `GestionAsegurado.jsx` | `/pages/roles/citas/` | 1240-1383 | ✅ Modal Editar con nuevos campos |

**Endpoints:**

```bash
# Obtener profesionales de salud con especialidades
GET /api/bolsa107/profesionales-salud
→ Retorna: List<Map<String, Object>>
→ Campos: id_pers, num_doc_pers, nombre_completo, desc_area

# Actualizar datos de contacto del paciente
PUT /api/bolsa107/paciente/{id}
Body: {
  telefono: "987654321",
  telCelular: "956123456",
  correoElectronico: "paciente@email.com",
  observaciones: "..."
}
→ Actualiza: teléfonos, correo, observaciones

# Actualizar programación ESSI
PUT /api/bolsa107/paciente/{id}
Body: {
  profesional: "Andrea Lucia Gálvez Gastelú",
  dni_profesional: "46205941",
  especialidad: "MEDICINA INTERNA"
}
→ Autocompleta y guarda asignación de profesional
```

**Base de Datos - Cambios:**

```sql
-- Tabla: bolsa_107_item (existente, columnas agregadas)
ALTER TABLE bolsa_107_item
ADD COLUMN IF NOT EXISTS tel_celular VARCHAR(30),
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(100);

-- Índices para performance
CREATE INDEX IF NOT EXISTS ix_bolsa107_tel_celular
  ON bolsa_107_item(tel_celular) WHERE tel_celular IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_bolsa107_correo
  ON bolsa_107_item(correo_electronico) WHERE correo_electronico IS NOT NULL;
```

**Flujo de Trabajo - Asignación de Profesional:**

```
1. Gestor accede a tabla de gestión
2. Selecciona tipo de apoyo "PROGRAMAR EN ESSI"
3. Columnas de programación se vuelven editables
4. Click en dropdown "Profesional"
   └─> Lista ordenada: "Nombre • Especialidad"
5. Selecciona profesional
   ├─> DNI se autocompleta (num_doc_pers)
   ├─> Especialidad se autocompleta (desc_servicio)
   └─> Guardado automático en BD
6. Si necesita limpiar:
   └─> Click en botón morado XCircle → Confirmación → Limpia los 3 campos
```

**Archivos Modificados - Resumen:**

```
backend/
├── src/main/java/com/styp/cenate/
│   ├── repository/form107/Bolsa107ItemRepository.java  (Query mejorado)
│   ├── api/form107/Bolsa107Controller.java             (Endpoints actualizados)
│   └── model/form107/Bolsa107Item.java                 (Campos nuevos)

frontend/
└── src/pages/roles/citas/
    └── GestionAsegurado.jsx                             (1671 líneas, múltiples mejoras)
```

**Beneficios v1.16.0:**
- 🎯 **UX mejorada:** Select limpio vs datalist duplicado
- ⚡ **Autocompletado:** DNI y especialidad automáticos
- 🧹 **Limpieza rápida:** Botón para resetear asignación
- 📞 **Más contacto:** Teléfono alterno y correo
- 🏥 **Especialidades reales:** CARDIOLOGIA, PEDIATRÍA, etc.
- 💾 **Sin recargar:** Actualización optimista en tiempo real

**Testing:**
- ✅ Selección de profesional autocompleta DNI y especialidad
- ✅ Botón limpiar resetea los 3 campos simultáneamente
- ✅ Modal de edición guarda campos de contacto correctamente
- ✅ IPRESS mostrado como solo lectura (no editable)
- ✅ Especialidades médicas reales se muestran en dropdown

---

### 11. Gestión de Tipos Profesionales

**Ubicación:** Administración → Usuarios → Tab "Tipo de Profesional"
**Ruta:** `/admin/users` (Tab: Tipo de Profesional)
**Versión:** v1.16.0 (2026-01-03)

**Resumen:**
Sistema CRUD completo para gestionar los tipos profesionales del sistema CENATE (ADMINISTRATIVO, ASISTENCIAL, PRACTICANTE, etc.). Permite crear, editar, activar/desactivar y eliminar tipos de personal.

**Funcionalidades Principales:**

| Característica | Descripción | Estado |
|----------------|-------------|--------|
| **Listar Tipos** | Tabla con todos los tipos profesionales | ✅ Implementado |
| **Crear Tipo** | Modal para agregar nuevos tipos | ✅ Implementado |
| **Editar Tipo** | Actualizar descripción y estado | ✅ Implementado |
| **Toggle Estado** | Activar/Desactivar tipos (A/I) | ✅ Implementado |
| **Eliminar Tipo** | Borrado con confirmación | ✅ Implementado |
| **Búsqueda** | Filtrado en tiempo real | ✅ Implementado |
| **Validaciones** | No permite duplicados | ✅ Implementado |

**Componentes Backend:**
- **Controller:** `TipoProfesionalController.java` (`/api/admin/tipos-profesionales`)
- **Service:** `TipoProfesionalServiceImpl.java`
- **Repository:** `TipoProfesionalRepository.java`
- **Model:** `TipoProfesional.java` (Tabla: `dim_tipo_personal`)

**Componentes Frontend:**
- **CRUD:** `TipoProfesionalCRUD.jsx` (592 líneas)
- **Service:** `tipoProfesionalService.js` (90 líneas)

**Endpoints:**

```bash
GET    /api/admin/tipos-profesionales
       → Obtener todos los tipos profesionales
       → Seguridad: ADMIN o SUPERADMIN

GET    /api/admin/tipos-profesionales/activos
       → Obtener solo tipos activos (estado = 'A')
       → Seguridad: ADMIN o SUPERADMIN

GET    /api/admin/tipos-profesionales/{id}
       → Obtener tipo profesional por ID
       → Seguridad: ADMIN o SUPERADMIN

POST   /api/admin/tipos-profesionales
       Body: { descTipPers: "TÉCNICO", statTipPers: "A" }
       → Crear nuevo tipo profesional
       → Seguridad: ADMIN o SUPERADMIN

PUT    /api/admin/tipos-profesionales/{id}
       Body: { descTipPers: "TÉCNICO", statTipPers: "I" }
       → Actualizar tipo profesional existente
       → Seguridad: ADMIN o SUPERADMIN

DELETE /api/admin/tipos-profesionales/{id}
       → Eliminar tipo profesional
       → Seguridad: ADMIN o SUPERADMIN
```

**Base de Datos:**

```sql
-- Tabla: dim_tipo_personal
CREATE TABLE dim_tipo_personal (
    id_tip_pers   BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    desc_tip_pers TEXT NOT NULL UNIQUE,
    stat_tip_pers TEXT NOT NULL DEFAULT 'A',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_stat_tip_pers CHECK (stat_tip_pers IN ('A', 'I')),
    CONSTRAINT ck_desc_tip_pers_trim CHECK (BTRIM(desc_tip_pers) <> '')
);

-- Índices
CREATE UNIQUE INDEX ux_desc_tip_pers ON dim_tipo_personal(desc_tip_pers);
CREATE UNIQUE INDEX uq_dim_tipo_personal_desc ON dim_tipo_personal(desc_tip_pers);
```

**Características UI/UX:**

- 🎨 **Diseño institucional:** Gradientes azules (0A5BA9 → 2563EB)
- 🔍 **Búsqueda en tiempo real:** Filtrado por nombre
- 🎯 **Modal de 2 columnas:** Formulario limpio y organizado
- ⚡ **Toggle de estado:** Switch animado para activar/desactivar
- 🗑️ **Confirmación de eliminación:** Modal de seguridad
- ✨ **Validaciones:** Evita duplicados y nombres vacíos
- 🔄 **Botón Actualizar:** Recarga datos manualmente
- 📊 **Tabla ordenada:** Por descripción alfabéticamente
- 💡 **Tooltips:** Ayudas visuales en botones de acción

**Ejemplos de Uso:**

```bash
# Crear nuevo tipo profesional
curl -X POST http://localhost:8080/api/admin/tipos-profesionales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"descTipPers":"TÉCNICO","statTipPers":"A"}'

# Listar todos los tipos
curl -X GET http://localhost:8080/api/admin/tipos-profesionales \
  -H "Authorization: Bearer $TOKEN"

# Actualizar estado a inactivo
curl -X PUT http://localhost:8080/api/admin/tipos-profesionales/4 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"descTipPers":"TÉCNICO","statTipPers":"I"}'
```

**Permisos (MBAC):**
- Acceso: Solo ADMIN y SUPERADMIN
- Path base: `/api/admin/tipos-profesionales`
- No requiere permisos de página específica (validado por rol)

**Validaciones:**
- ✅ Descripción obligatoria (no vacía, sin espacios)
- ✅ Descripción única (no permite duplicados)
- ✅ Estado: Solo 'A' (Activo) o 'I' (Inactivo)
- ✅ Conversión automática a mayúsculas
- ✅ Trim de espacios en blanco

**Testing:**
- ✅ CRUD completo funcional
- ✅ Validaciones de duplicados
- ✅ Toggle de estado animado
- ✅ Modal de confirmación de eliminación
- ✅ Búsqueda en tiempo real
- ✅ Carga de datos desde backend exitosa

---

## Glosario Rápido

| Término | Definición |
|---------|-----------|
| **CENATE** | Centro Nacional de Telemedicina |
| **IPRESS** | Institución Prestadora de Servicios de Salud |
| **ESSI** | Sistema de información de EsSalud |
| **MBAC** | Module-Based Access Control |
| **Bolsa 107** | Módulo de importación masiva de pacientes |
| **Régimen 728** | Personal nombrado (4h/4h/8h) |
| **Régimen CAS** | Contrato Administrativo (4h/4h/8h) |
| **Locador** | Locación de servicios (6h/6h/12h) |

---

## Instrucciones para Claude

### 🔍 Al Investigar o Responder Preguntas

1. **SIEMPRE consulta la documentación detallada primero:**
   - Backend: `spec/01_Backend/`
   - Base de datos: `spec/04_BaseDatos/`
   - Planes: `plan/`
   - Changelog: `checklist/01_Historial/01_changelog.md`

2. **Referencias específicas:**
   - Auditoría → `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
   - Disponibilidad → `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
   - Firma Digital → `plan/05_Firma_Digital/01_plan_implementacion.md`
   - Bolsa 107 → `spec/01_Backend/04_auto_normalizacion_excel_107.md`

3. **NO repitas información que ya existe en los documentos detallados**

### 💻 Al Implementar Nuevas Funcionalidades

1. **Análisis previo:**
   - Leer archivos relacionados existentes
   - Evaluar impacto en backend, frontend, BD
   - Consultar patrones similares en el código

2. **Seguir patrones arquitectónicos:**
   - Controller → Service → Repository
   - Usar DTOs, nunca exponer entidades
   - Integrar AuditLogService para auditoría
   - Agregar permisos MBAC si aplica

3. **Validación en 3 capas:**
   - Frontend (validación UX)
   - Backend DTO (validación de negocio)
   - Base de datos (CHECK constraints)

4. **Documentación obligatoria:**
   - Actualizar `checklist/01_Historial/01_changelog.md`
   - Crear/actualizar documentos en `spec/` si es necesario
   - Agregar scripts SQL a `spec/04_BaseDatos/06_scripts/`

### ✏️ Al Modificar Código Existente

1. **LEER archivos antes de modificar**
2. **Mantener consistencia** con estilo existente
3. **No sobreingeniería:** Solo cambios necesarios
4. **Respetar separación de capas**
5. **Probar cambios** antes de confirmar

### 🔐 Seguridad y Buenas Prácticas

1. **NUNCA** exponer credenciales en código
2. **SIEMPRE** usar variables de entorno
3. **Prevenir:** SQL injection, XSS, CSRF
4. **Auditar:** Todas las acciones críticas
5. **Validar:** Permisos MBAC en endpoints sensibles

### 📝 Formato de Código

**Backend (Java):**
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) {
    // Auditar acción
    auditLogService.registrarEvento(...);

    // Lógica de negocio
    return ResponseEntity.ok(...);
}
```

**Frontend (React):**
```jsx
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

### 📦 Formato de Respuesta API

```javascript
// Éxito
{
  "status": 200,
  "data": { ... },
  "message": "Operación exitosa"
}

// Error
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "validationErrors": { "campo": "error" }
}
```

---

## Scripts SQL Importantes

```bash
# Conectar a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Ejecutar script
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/[nombre_script].sql

# Scripts disponibles en: spec/04_BaseDatos/06_scripts/
# - 001_audit_view_and_indexes.sql (Auditoría)
# - 005_disponibilidad_medica.sql (Disponibilidad)
# - 015_crear_tabla_firma_digital_personal.sql (Firma Digital)
# - 016_crear_tablas_bolsa_107.sql (Bolsa 107)
# ... y más (17+ scripts)
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios, auditoría |
| MEDICO | Dashboard médico, disponibilidad, pacientes |
| COORDINADOR | Agenda, asignaciones, revisión turnos |
| COORDINADOR_ESPECIALIDADES | Asignación de médicos |
| COORDINADOR_RED | Solicitudes IPRESS, turnos |
| ENFERMERIA | Atenciones, seguimiento pacientes |
| EXTERNO | Formulario diagnóstico |
| INSTITUCION_EX | Acceso limitado IPRESS externa |

---

## Contactos

| Rol | Correo |
|-----|--------|
| Soporte técnico | cenate.analista@essalud.gob.pe |
| Sistema (envío emails) | cenateinformatica@gmail.com |

---

## Índice de Documentación por Tema

### 🔐 Seguridad y Auditoría
- Guía completa: `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- Plan seguridad: `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`
- Acceso sensible: `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/`

### 👨‍⚕️ Módulos Médicos
- Disponibilidad: `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
- Solicitud turnos: `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md`

### 💾 Base de Datos
- Modelo usuarios: `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
- Análisis estructura: `spec/04_BaseDatos/04_analisis_estructura/`
- Plan limpieza: `spec/04_BaseDatos/05_plan_limpieza/`
- Scripts SQL: `spec/04_BaseDatos/06_scripts/`

### 📊 Importación y Reportes
- Bolsa 107: `spec/01_Backend/04_auto_normalizacion_excel_107.md`

### ✍️ Firma Digital
- Plan implementación: `plan/05_Firma_Digital/01_plan_implementacion.md`
- Checklist: `checklist/03_Checklists/01_checklist_firma_digital.md`

### 📜 Historial y Versiones
- **⭐ Changelog completo:** `checklist/01_Historial/01_changelog.md`
- Versiones: `checklist/01_Historial/02_historial_versiones.md`

---

*EsSalud Perú - CENATE | Desarrollado por Ing. Styp Canto Rondón*
*Versión 1.14.1 | 2026-01-02*
