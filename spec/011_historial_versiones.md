# Historial de Versiones - Sistema CENATE

> Registro completo de todas las versiones del Sistema de Telemedicina CENATE desde su primera versión

**Organización:** EsSalud - Centro Nacional de Telemedicina
**Desarrollador:** Ing. Styp Canto Rondón
**Última actualización:** 2025-12-29

---

## Índice de Versiones

| Versión | Fecha | Nombre | Tipo |
|---------|-------|--------|------|
| [v1.10.3](#v1103-2025-12-29) | 2025-12-29 | Fix: Eliminación de Usuarios con Disponibilidad Médica | Corrección |
| [v1.10.2](#v1102-2025-12-29) | 2025-12-29 | Selección de Correo para Recuperación | Feature |
| [v1.10.1](#v1101-2025-12-29) | 2025-12-29 | Selección de Correo Preferido | Feature |
| [v1.9.2](#v192-2025-12-23) | 2025-12-23 | Tokens de Recuperación Persistentes | Feature |
| [v1.9.1](#v191-2025-12-23) | 2025-12-23 | Selector de Red para Coordinadores | Feature |
| [v1.9.0](#v190-2025-12-23) | 2025-12-23 | Módulo de Red para Coordinadores | Major Feature |
| [v1.8.1](#v181-2025-12-23) | 2025-12-23 | Fix Usuarios Huérfanos | Corrección |
| [v1.8.0](#v180-2025-12-23) | 2025-12-23 | Mejoras en Auditoría | Feature |
| [v1.7.9](#v179-2025-12-23) | 2025-12-23 | Dashboard ChatBot Mejorado | Feature |
| [v1.7.8](#v178-2025-12-23) | 2025-12-23 | Integración ChatBot de Citas | Major Feature |
| [v1.7.7](#v177-2025-12-23) | 2025-12-23 | Documentación de Usuarios | Documentación |
| [v1.7.6](#v176-2025-12-23) | 2025-12-23 | Limpieza de Datos Huérfanos | Feature |
| [v1.7.5](#v175-2025-12-23) | 2025-12-23 | Panel de Activaciones Mejorado | Feature |
| [v1.7.4](#v174-2025-12-23) | 2025-12-23 | Gestión de Activaciones | Feature |
| [v1.7.3](#v173-2025-12-23) | 2025-12-23 | Búsqueda por Email | Feature |
| [v1.7.2](#v172-2025-12-23) | 2025-12-23 | Seguridad y UX | Mejora |
| [v1.7.1](#v171-2025-12-23) | 2025-12-23 | Configuración y Correcciones | Corrección |

---

## Versiones Detalladas

### v1.10.3 (2025-12-29)
**Nombre:** Fix: Eliminación de Usuarios con Disponibilidad Médica
**Tipo:** Corrección Crítica

#### Resumen
Solución a error crítico que impedía eliminar usuarios con registros de disponibilidad médica asociados.

#### Problema Resuelto
- Los SUPERADMIN no podían eliminar usuarios médicos con disponibilidad registrada
- Error de violación de clave foránea en base de datos
- Sistema mostraba mensaje genérico "No se pudo eliminar el usuario"

#### Solución Implementada
- Eliminación en cascada de `detalle_disponibilidad` antes de eliminar personal
- Eliminación en cascada de `disponibilidad_medica` antes de eliminar personal
- Uso consistente de `jdbcTemplate` para evitar conflictos con JPA
- Orden correcto de eliminación respetando restricciones de FK

#### Archivos Modificados
```
backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java
```

#### Impacto
✅ Eliminación completa de usuarios sin restricciones de disponibilidad médica
✅ Integridad referencial mantenida en base de datos
✅ Proceso de eliminación robusto y predecible

---

### v1.10.2 (2025-12-29)
**Nombre:** Selección de Correo para Recuperación de Contraseña
**Tipo:** Nueva Funcionalidad

#### Resumen
Permite al administrador elegir a qué correo (personal o institucional) enviar el enlace de recuperación de contraseña.

#### Problema Resuelto
- Sistema enviaba automáticamente sin consultar al administrador
- Usuarios tienen múltiples correos registrados
- Solo uno de los correos puede estar activo o accesible

#### Funcionalidad Agregada
**Modal de Selección de Correo:**
- Diálogo con opciones de radio buttons
- Correo Personal (si existe)
- Correo Institucional (si existe)
- Botón deshabilitado hasta seleccionar opción
- Envío solo al correo seleccionado

#### Cambios Técnicos

**Backend:**
- `UsuarioController.java` - Parámetro opcional `email` en `/reset-password`
- `PasswordTokenService.java` - Método sobrecargado para email específico

**Frontend:**
- `ActualizarModel.jsx` - Modal con selector de correo
- Estado `correoSeleccionado` para tracking
- Validación de selección obligatoria

**Base de Datos:**
- Sin cambios en esquema

#### API Endpoint
```
PUT /api/usuarios/id/{id}/reset-password?email={correo}
```

#### Configuración Requerida
```bash
export MAIL_USERNAME="cenateinformatica@gmail.com"
export MAIL_PASSWORD="nolq uisr fwdw zdly"
```

#### Tiempos de Entrega
- Gmail: 10-30 segundos
- Corporativo @essalud.gob.pe: 1-5 minutos

---

### v1.10.1 (2025-12-29)
**Nombre:** Selección de Correo Preferido para Notificaciones
**Tipo:** Nueva Funcionalidad

#### Resumen
Usuarios pueden elegir correo preferido (personal o institucional) para recibir notificaciones durante el registro.

#### Problema Resuelto
- Sistema enviaba solo a correo personal automáticamente
- Usuarios solo acceden a correo institucional en horas laborales
- Falta de flexibilidad en preferencias de comunicación

#### Funcionalidad Agregada
**Selector en Formulario de Registro:**
- Radio buttons para elegir correo preferido
- Opciones: PERSONAL (default) o INSTITUCIONAL
- Validación y fallback automático
- Deshabilita opción institucional si no se proporcionó

#### Cambios Técnicos

**Backend:**
- `AccountRequest.java` - Nuevo campo `emailPreferido`
- `SolicitudRegistroDTO.java` - Nuevo campo `emailPreferido`
- `AccountRequestService.java` - Método `obtenerCorreoPreferido()`

**Frontend:**
- `CrearCuenta.jsx` - Selector de correo preferido

**Base de Datos:**
```sql
ALTER TABLE account_requests
ADD COLUMN email_preferido VARCHAR(20) DEFAULT 'PERSONAL';
```

#### Script SQL
```
spec/scripts/007_agregar_email_preferido.sql
```

#### Puntos de Uso
1. Aprobación de solicitud - Envío de credenciales
2. Rechazo de solicitud - Notificación
3. Recuperación de contraseña - Enlaces
4. Cambio de contraseña - Notificaciones

---

### v1.9.2 (2025-12-23)
**Nombre:** Tokens de Recuperación Persistentes
**Tipo:** Mejora de Infraestructura

#### Resumen
Migración de tokens de recuperación desde memoria RAM a base de datos PostgreSQL.

#### Problema Resuelto
- Tokens se perdían al reiniciar servidor backend
- Enlaces enviados por correo quedaban invalidados
- Experiencia de usuario inconsistente

#### Solución Implementada
**Nueva Tabla en Base de Datos:**
```sql
CREATE TABLE segu_password_reset_tokens (
    id_token BIGSERIAL PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    tipo_accion VARCHAR(50),
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Archivos Creados
```
backend/src/main/java/com/styp/cenate/
├── model/PasswordResetToken.java
└── repository/PasswordResetTokenRepository.java
```

#### Archivos Modificados
- `PasswordTokenService.java` - Uso de BD en lugar de memoria
- `application.properties` - URL frontend configurable
- `ActualizarModel.jsx` - Nuevo botón "Enviar correo de recuperación"

#### Mejora UX
**Antes:** Botón amarillo "Resetear a @Cenate2025"
**Ahora:** Botón azul "Enviar correo de recuperación"

#### Configuración por Ambiente
| Ambiente | Variable | URL |
|----------|----------|-----|
| Desarrollo | (default) | `http://localhost:3000` |
| Producción | `FRONTEND_URL` | `http://10.0.89.239` |

#### Limpieza Automática
- Tokens expirados/usados eliminados cada hora via `@Scheduled`

---

### v1.9.1 (2025-12-23)
**Nombre:** Selector de Red para Coordinadores
**Tipo:** Mejora de Funcionalidad

#### Resumen
Permite asignar una Red automáticamente al usuario cuando se le asigna el rol COORDINADOR_RED.

#### Cambios Técnicos

**Backend:**
- `UsuarioUpdateRequest.java` - Nuevo campo `idRed`
- `UsuarioServiceImpl.java` - Lógica de asignación/remoción de Red
- Inyección de `RedRepository`

**Frontend:**
- `ActualizarModel.jsx` - Selector de Red al marcar COORDINADOR_RED
- Validación obligatoria de Red para el rol
- useEffect para inicializar Red existente

#### Flujo de Uso
1. Abrir modal de edición de usuario
2. Ir a pestaña "Roles"
3. Marcar checkbox "COORDINADOR_RED"
4. Selector "Asignar Red al Coordinador" aparece
5. Seleccionar Red (obligatorio)
6. Guardar cambios

#### Almacenamiento
```sql
-- Red guardada en dim_usuarios.id_red
UPDATE dim_usuarios SET id_red = ? WHERE id_user = ?;
```

---

### v1.9.0 (2025-12-23)
**Nombre:** Módulo de Red para Coordinadores
**Tipo:** Major Feature

#### Resumen
Nuevo módulo completo de Gestión de Red para Coordinadores, permitiendo visualizar personal externo, formularios y estadísticas de su red asignada.

#### Funcionalidades
- Dashboard de red con estadísticas consolidadas
- Visualización de personal externo por red
- Formularios de diagnóstico de la red
- Exportación a CSV
- Diseño responsive

#### Cambios Técnicos

**Backend - Archivos Creados:**
```
backend/src/main/java/com/styp/cenate/
├── api/red/RedDashboardController.java
├── service/red/RedDashboardService.java
├── service/red/impl/RedDashboardServiceImpl.java
└── dto/red/RedDashboardResponse.java
```

**Repositorios Modificados:**
- `PersonalExternoRepository` - Métodos por Red
- `IpressRepository` - Conteo por Red
- `FormDiagFormularioRepository` - Conteo por Red y Estado

**Frontend:**
- Nueva página: `frontend/src/pages/red/RedDashboard.jsx`
- Ruta: `/red/dashboard`

**Base de Datos:**
```sql
-- Agregar campo id_red a usuarios
ALTER TABLE dim_usuarios ADD COLUMN id_red BIGINT;

-- Nuevo rol
INSERT INTO dim_roles (desc_rol, nivel_jerarquico)
VALUES ('COORDINADOR_RED', 4);
```

#### Endpoints API
```
GET /api/red/mi-red          - Dashboard con info y estadísticas
GET /api/red/personal        - Personal externo de la red
GET /api/red/formularios     - Formularios de diagnóstico
```

#### Script SQL
```
spec/scripts/003_modulo_red_coordinador.sql
```

#### Documentación
```
spec/007_plan_modulo_red.md
```

---

### v1.8.1 (2025-12-23)
**Nombre:** Fix Usuarios Huérfanos
**Tipo:** Corrección

#### Resumen
Corrección de usuarios externos que podían hacer login pero no aparecían en búsquedas.

#### Problema Identificado
1. Búsqueda solo consultaba `dim_personal_cnt` (internos)
2. Usuarios externos están en `dim_personal_externo`
3. Datos huérfanos permitían login fantasma

#### Solución Implementada

**Métodos Mejorados:**
- `limpiarDatosHuerfanos()` - Desvincula personal externo antes de eliminar
- `eliminarUsuarioPendienteActivacion()` - Detecta tipo INTERNO/EXTERNO

**Orden de Eliminación:**
```sql
UPDATE dim_personal_externo SET id_user = NULL WHERE id_user = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_externo WHERE id_pers_ext = ?;
```

#### Usuarios Limpiados
- DNI 11111111 - Testing Testing
- DNI 32323232 - Tess Testing

#### Archivos Modificados
```
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
```

---

### v1.8.0 (2025-12-23)
**Nombre:** Mejoras en Auditoría
**Tipo:** Mejora de Funcionalidad

#### Resumen
Renombrado de módulo y corrección de visualización de usuarios en logs del sistema.

#### Cambios Principales

**1. Renombrado de Menú**
- "Logs del Sistema" → "Auditoría"
- Descripción actualizada: "Auditoría completa del sistema - Trazabilidad de acciones"

**2. Fix: Usuario N/A en Logs**

**Problema:** Registros mostraban "N/A" en lugar de usuario
**Causa:** Mapper usaba `view.getUsername()` del JOIN con dim_usuarios
**Solución:**
```java
String usuario = view.getUsuarioSesion();  // Prioridad 1
if (usuario == null || usuario.isBlank()) {
    usuario = view.getUsername();          // Prioridad 2
}
if (usuario == null || usuario.isBlank()) {
    usuario = "SYSTEM";                    // Fallback
}
```

**3. Mejoras en AdminDashboard - Actividad Reciente**

| Antes | Después |
|-------|---------|
| 5 actividades | 8 actividades |
| Códigos técnicos | Acciones legibles |
| Solo usuario | Usuario + nombre completo |
| Sin indicador | Indicador de estado (verde/rojo) |

#### Funciones Agregadas
- `formatAccionEjecutiva()` - Traduce acciones
- `getDetalleCorto()` - Resume detalles
- `getNombreCompleto()` - Obtiene nombre completo
- `getLogUsuario()` - Usuario con fallback

#### Archivos Modificados
```
backend/src/main/java/com/styp/cenate/service/mbac/impl/AuditoriaServiceImpl.java
frontend/src/pages/AdminDashboard.js
frontend/src/pages/admin/LogsDelSistema.jsx
spec/scripts/002_rename_logs_to_auditoria.sql
```

---

### v1.7.9 (2025-12-23)
**Nombre:** Dashboard ChatBot Mejorado
**Tipo:** Mejora de Funcionalidad

#### Resumen
Agregado de footer con versión del sistema en todas las páginas de la intranet.

#### Cambios Principales

**1. Footer con Versión en toda la Intranet**

| Ubicación | Archivo | Formato |
|-----------|---------|---------|
| Sidebar | `DynamicSidebar.jsx` | `v{VERSION.number}` |
| Intranet | `AppLayout.jsx` | Nombre + Organización + Versión |
| Login | `Login.js` | `CENATE v{VERSION.number}` |
| Registro | `CrearCuenta.jsx` | `CENATE v{VERSION.number}` |
| Recuperar | `PasswordRecovery.js` | `CENATE v{VERSION.number}` |
| Home | `FooterCenate.jsx` | Versión completa con links |

**2. Configuración Centralizada**
```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.9",
  name: "Dashboard ChatBot Mejorado",
  date: "2025-12-23",
  description: "..."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};
```

**3. Corrección de Estado en Dashboard de Citas**

**Problema:** Estado mostraba "N/A" en tabla
**Causa:** Mapeo incorrecto de campos
**Solución:**
```javascript
// Antes (incorrecto)
estado: c.cod_estado_cita || c.codEstadoCita

// Ahora (correcto)
estado: c.desc_estado_paciente || c.descEstadoPaciente
```

**4. Nueva Funcionalidad: Cambiar Estado de Citas**

Características:
- Columna "Acciones" con botón "Editar"
- Modal para seleccionar nuevo estado
- Catálogo desde `/api/v1/chatbot/estado-cita`
- Campo observación opcional
- Actualiza via `PUT /api/v1/chatbot/solicitud/estado/{id}`

**Estados Disponibles:**
- PENDIENTE
- RESERVADO
- CONFIRMADA
- CANCELADA
- NO_PRESENTADO
- ATENDIDO

#### Archivos Modificados
```
frontend/src/components/AppLayout.jsx
frontend/src/pages/chatbot/ChatbotBusqueda.jsx
```

---

### v1.7.8 (2025-12-23)
**Nombre:** Integración ChatBot de Citas
**Tipo:** Major Feature

#### Resumen
Integración completa del módulo ChatBot para solicitud de citas médicas, migrado desde HTML a componentes React.

#### Funcionalidades Principales

**1. Consulta de Paciente**
- Búsqueda por DNI
- Obtención de datos y servicios disponibles

**2. Disponibilidad**
- Visualización de fechas disponibles por servicio
- Slots de horarios con profesionales asignados

**3. Solicitud de Cita**
- Generación de solicitud con validación de conflictos
- Confirmación con número de solicitud

**4. Dashboard de Reportes**
- KPIs: Total citas, Reservadas, Pacientes únicos, Profesionales activos
- Filtros avanzados: Fecha, DNI, Área, Servicio, Estado
- Tabla paginada (10 registros/página)
- Exportación a CSV

#### Archivos Creados

**Servicio API:**
```
frontend/src/services/chatbotService.js
```

Funciones:
- `consultarPaciente(documento)`
- `getFechasDisponibles(codServicio)`
- `getSlotsDisponibles(fecha, codServicio)`
- `crearSolicitud(solicitud)`
- `buscarCitas(filtros)`
- `getKPIs(filtros)`

**Componentes React:**
```
frontend/src/pages/chatbot/ChatbotCita.jsx      - Wizard de 3 pasos
frontend/src/pages/chatbot/ChatbotBusqueda.jsx  - Dashboard de reportes
```

**Script SQL:**
```
spec/sql/chatbot_menu_setup.sql
```

#### Rutas Configuradas
```jsx
<Route path="/chatbot/cita" element={<ChatbotCita />} />
<Route path="/chatbot/busqueda" element={<ChatbotBusqueda />} />
```

#### Flujo del Wizard

**Paso 1: Consultar Paciente**
- Input: DNI/CE
- Endpoint: `GET /api/chatbot/documento/{doc}`
- Output: Datos + servicios disponibles

**Paso 2: Seleccionar Disponibilidad**
- 2a. Seleccionar servicio
  - `GET /api/v2/chatbot/disponibilidad/servicio?codServicio=`
- 2b. Seleccionar horario
  - `GET /api/v2/chatbot/disponibilidad/servicio-detalle?fecha_cita=&cod_servicio=`

**Paso 3: Confirmar Solicitud**
- Resumen de cita
- Campo observaciones
- `POST /api/v1/chatbot/solicitud`

#### Endpoints API Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{doc}` | Consultar paciente |
| GET | `/api/v2/chatbot/disponibilidad/servicio` | Fechas disponibles |
| GET | `/api/v2/chatbot/disponibilidad/servicio-detalle` | Slots horarios |
| POST | `/api/v1/chatbot/solicitud` | Crear solicitud |
| PUT | `/api/v1/chatbot/solicitud/estado/{id}` | Cambiar estado |
| GET | `/api/v1/chatbot/reportes/citas/buscar` | Búsqueda avanzada |

#### Iconos Agregados
```javascript
import { MessageSquare, Bot } from "lucide-react";
```

#### Documentación Técnica
```
spec/006_chatbot_citas_ANALYSIS.md
```

---

### v1.7.7 (2025-12-23)
**Nombre:** Documentación de Usuarios
**Tipo:** Documentación Técnica

#### Resumen
Creación de documentación completa del modelo de datos de usuarios.

#### Archivo Creado
```
spec/001_espec_users_bd.md
```

#### Contenido del Documento

**Secciones:**
1. Diagrama ERD - Relaciones entre tablas
2. Tablas Principales - Estructura detallada
3. Clasificación INTERNO/EXTERNO - Lógica de tipos
4. Flujo de Registro - Diagrama de secuencia
5. Estados de Usuario - Ciclo de vida
6. Cascada de Eliminación - Orden correcto
7. Roles del Sistema - 20 roles documentados
8. Endpoints API - Listado completo
9. Queries Diagnóstico - SQL útiles

**Tablas Documentadas:**
```
dim_usuarios          - Credenciales de acceso
dim_personal_cnt      - Datos personales (INTERNO y EXTERNO)
account_requests      - Solicitudes de registro
dim_origen_personal   - Clasificación (1=INTERNO, 2=EXTERNO)
rel_user_roles        - Relación usuario-rol (M:N)
dim_personal_prof     - Profesiones del personal
dim_personal_tipo     - Tipo de profesional
```

#### Limpieza de Base de Datos
- 11 solicitudes APROBADAS sin usuario creado eliminadas
- DNIs liberados: 99999999, 66666666, 12345679, etc.
- Correo cenate.analista@essalud.gob.pe desbloqueado

**Estado Final BD:**
- Usuarios totales: 100
- Pendientes activación: 90
- Solicitudes APROBADAS: 4 (válidas)
- Solicitudes RECHAZADAS: 21
- Datos huérfanos: 0

---

### v1.7.6 (2025-12-23)
**Nombre:** Limpieza de Datos Huérfanos
**Tipo:** Nueva Funcionalidad

#### Resumen
Sistema para diagnosticar y limpiar datos residuales que impiden re-registro de usuarios.

#### Problema Resuelto
Al eliminar usuarios quedaban datos huérfanos en:
- `dim_usuarios` - Usuario sin eliminar
- `dim_personal_cnt` - Personal sin usuario
- `dim_personal_prof` - Profesiones huérfanas
- `dim_personal_tipo` - Tipos huérfanos
- `account_requests` - Solicitudes en APROBADO

#### Nuevos Endpoints

**Verificar Datos Huérfanos:**
```
GET /api/admin/datos-huerfanos/{numDocumento}
```
Respuesta:
```json
{
  "usuariosEncontrados": 1,
  "personalesEncontrados": 1,
  "solicitudesActivas": 1,
  "puedeRegistrarse": false,
  "razonBloqueo": "..."
}
```

**Limpiar Datos Huérfanos:**
```
DELETE /api/admin/datos-huerfanos/{numDocumento}
```
Respuesta:
```json
{
  "usuariosEliminados": 1,
  "personalesEliminados": 1,
  "solicitudesActualizadas": 1,
  "totalRegistrosEliminados": 3
}
```

#### Nuevos Métodos en AccountRequestService
```java
public Map<String, Object> limpiarDatosHuerfanos(String numDocumento)
public Map<String, Object> verificarDatosExistentes(String numDocumento)
```

#### Orden de Eliminación (Tablas)
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_usuario = ?;
DELETE FROM dim_personal_prof WHERE id_pers = ?;
DELETE FROM dim_personal_tipo WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

#### Archivos Modificados
```
AccountRequestService.java
SolicitudRegistroController.java
```

---

### v1.7.5 (2025-12-23)
**Nombre:** Panel de Activaciones Mejorado
**Tipo:** Mejora de UI/UX

#### Resumen
Panel completo para gestión de usuarios pendientes de activación con funcionalidad de reenvío de correos.

#### Funcionalidades

**Nueva Pestaña en Aprobación de Solicitudes:**
- "Solicitudes de Registro" - Flujo original
- "Pendientes de Activación" - Nuevos usuarios sin activar

**Características del Panel:**

1. **Buscador Integrado**
   - Filtra por nombre, documento, correo
   - Contador de resultados

2. **Acciones por Usuario**
   - **Reenviar Email** - Genera nuevo token y envía correo
   - **Eliminar** - Elimina usuario para permitir re-registro

#### Endpoints Backend
```
GET /api/admin/usuarios/pendientes-activacion
POST /api/admin/usuarios/{idUsuario}/reenviar-activacion
```

#### Corrección de Lazy Loading
Uso de SQL directo para obtener email, evitando problemas de lazy loading con JPA.

---

### v1.7.4 (2025-12-23)
**Nombre:** Gestión de Activaciones
**Tipo:** Nueva Funcionalidad

#### Resumen
Permite eliminar usuarios aprobados que nunca activaron su cuenta.

#### Backend Controller
```java
@DeleteMapping("/admin/usuarios/{idUsuario}/pendiente-activacion")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<?> eliminarUsuarioPendiente(@PathVariable Long idUsuario)
```

#### Orden de Eliminación (FK Constraints)
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

#### Validación Mejorada: Re-registro
Usuarios pueden re-registrarse si solicitud anterior fue RECHAZADA.

```java
@Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.numDocumento = :numDoc AND a.estado IN ('PENDIENTE', 'APROBADO')")
boolean existsSolicitudActivaByNumDocumento(String numDocumento);
```

#### URL Frontend Configurable
```properties
app.frontend.url=${FRONTEND_URL:http://10.0.89.239}
```

---

### v1.7.3 (2025-12-23)
**Nombre:** Búsqueda por Email
**Tipo:** Mejora de Funcionalidad

#### Resumen
Filtro de búsqueda general ahora incluye campos de email.

#### Campos Agregados al Filtro
- Correo personal (`correo_personal`)
- Correo corporativo (`correo_corporativo`)
- Correo institucional (`correo_institucional`)

#### Nota Técnica
Backend usa `@JsonProperty` para serializar campos en **snake_case**.

---

### v1.7.2 (2025-12-23)
**Nombre:** Seguridad y UX
**Tipo:** Mejoras Múltiples

#### Cambios Principales

**1. Sistema de Versiones Centralizado**
```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.0",
  name: "Documentación y Arquitectura",
  date: "2025-12-23"
};
```

**2. Validación de Usuario en Login**
- Solo permite números y letras (DNI, pasaporte, CE)
- Conversión automática a mayúsculas
- maxLength={12}

**3. Corrección de Aprobación de Solicitudes**

**Problema:** Correo de bienvenida no se enviaba
**Causa:** `usuario.getNombreCompleto()` con lazy loading
**Solución:** Método sobrecargado con nombre completo explícito

**4. Flujo Seguro de Activación**
```
1. Admin aprueba solicitud
2. Sistema crea usuario con contraseña temporal ALEATORIA
3. Sistema genera token de activación (24h)
4. Sistema envía email con enlace: /cambiar-contrasena?token=xxx
5. Usuario configura su propia contraseña
6. Token se invalida después de usar
```

**⚠️ La contraseña NUNCA se envía en texto plano.**

---

### v1.7.1 (2025-12-23)
**Nombre:** Configuración y Correcciones
**Tipo:** Configuración Inicial

#### Configuración de Infraestructura

**Base de Datos Remota:**
- Servidor: `10.0.89.13:5432`
- Base de datos: `maestro_cenate`
- Usuario: `postgres`
- Contraseña: `Essalud2025`

**Email SMTP (Gmail):**
- Cuenta: `cenateinformatica@gmail.com`
- Contraseña de aplicación configurada
- Funcionalidades:
  - Recuperación de contraseña
  - Aprobación/rechazo de solicitudes

#### Correcciones de Bugs

**Frontend:**
- `apiClient.js` - Manejo de errores mejorado (`data.message` y `data.error`)
- `CrearCuenta.jsx` - Mostrar `err.message` correctamente

**Backend:**
- `AccountRequestService.java` - Validación de correo duplicado
- `AccountRequestRepository.java` - Método `existsByCorreoPersonal()`

#### Flujos Verificados

**1. Recuperación de Contraseña**
```
Usuario solicita → Sistema genera token → Usuario cambia contraseña
```

**2. Solicitud de Registro**
```
Usuario completa formulario → Admin aprueba/rechaza → Sistema envía email
```

---

## Estadísticas del Proyecto

### Por Tipo de Versión

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| Nueva Funcionalidad | 10 | 58.8% |
| Corrección/Fix | 4 | 23.5% |
| Mejora | 2 | 11.8% |
| Documentación | 1 | 5.9% |

### Evolución de Características

**Funcionalidades Principales Agregadas:**
1. Sistema de Auditoría completo
2. Módulo ChatBot de Citas
3. Módulo de Red para Coordinadores
4. Módulo de Disponibilidad Médica
5. Sistema de Recuperación de Contraseña
6. Gestión de Usuarios Pendientes
7. Limpieza de Datos Huérfanos
8. Selección de Correo Preferido

**Mejoras de Seguridad:**
- Tokens persistentes en BD
- Validación de usuarios mejorada
- Flujo seguro de activación
- Contraseñas nunca en texto plano

**Mejoras de UX:**
- Footer con versión en todas las páginas
- Selectores de correo para notificaciones
- Dashboard mejorado de actividad
- Exportación a CSV en múltiples módulos

---

## Contactos del Sistema

| Rol | Correo |
|-----|--------|
| Soporte Técnico | cenate.analista@essalud.gob.pe |
| Sistema (Envío) | cenateinformatica@gmail.com |

---

**Última actualización:** 2025-12-29
**Versión actual del sistema:** v1.10.3
**Desarrollado por:** Ing. Styp Canto Rondón
**Organización:** EsSalud - CENATE
