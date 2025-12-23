# Historial de Cambios - CENATE

> Changelog detallado del proyecto

---

## v1.7.9 (2025-12-23) - Dashboard ChatBot Mejorado

### Footer con Version del Sistema en toda la Intranet

Se agrego un footer visible en todas las paginas de la intranet mostrando la version del sistema.

**Ubicaciones del footer con version:**

| Ubicacion | Archivo | Contenido |
|-----------|---------|-----------|
| Sidebar | `DynamicSidebar.jsx` | `v{VERSION.number}` |
| Intranet (todas las paginas) | `AppLayout.jsx` | Nombre, organizacion, version |
| Login | `Login.js` | `CENATE v{VERSION.number}` |
| Crear Cuenta | `CrearCuenta.jsx` | `CENATE v{VERSION.number}` |
| Recuperar Contrasena | `PasswordRecovery.js` | `CENATE v{VERSION.number}` |
| Home (publico) | `FooterCenate.jsx` | Version completa con links |

**Archivo de configuracion centralizado:**

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

**Archivo modificado:**

```
frontend/src/components/AppLayout.jsx
├── Importado VERSION y APP_INFO desde config/version.js
└── Agregado footer al final del contenido con version dinamica
```

---

### Correccion de mapeo de estado en Dashboard de Citas

Se corrigio el mapeo del campo estado en `ChatbotBusqueda.jsx` que mostraba "N/A" y se agrego funcionalidad para cambiar el estado de las citas.

**Problema resuelto:**

El campo "Estado" en la tabla de citas mostraba "N/A" porque el frontend buscaba campos incorrectos (`cod_estado_cita`, `codEstadoCita`) cuando el backend retorna `descEstadoPaciente`.

**Correccion aplicada:**

```javascript
// Antes (incorrecto)
estado: c.cod_estado_cita || c.codEstadoCita || c.estadoPaciente || c.estado

// Ahora (correcto)
estado: c.desc_estado_paciente || c.descEstadoPaciente || c.estadoPaciente || c.estado
```

### Nueva funcionalidad: Cambiar Estado de Citas

Se agrego columna de acciones con boton para cambiar el estado de las citas.

**Caracteristicas:**

| Funcionalidad | Descripcion |
|---------------|-------------|
| Columna Acciones | Nueva columna en tabla con boton "Editar" |
| Modal de Estado | Formulario para seleccionar nuevo estado |
| Catalogo de Estados | Carga desde `/api/v1/chatbot/estado-cita` |
| Observacion | Campo opcional para registrar motivo del cambio |
| Actualizacion | Llama a `PUT /api/v1/chatbot/solicitud/estado/{id}` |

**Estados disponibles:**
- PENDIENTE
- RESERVADO
- CONFIRMADA
- CANCELADA
- NO_PRESENTADO
- ATENDIDO

**Archivos modificados:**

```
frontend/src/pages/chatbot/ChatbotBusqueda.jsx
├── Corregido normalizeCita() - mapeo de estado
├── Corregido actualizarOpciones() - opciones de filtro
├── Corregido calcularKPIs() - conteo de reservadas
├── Agregado estado para modal (modalEstado, nuevoEstado, etc.)
├── Agregado cargarCatalogoEstados() - cargar estados del backend
├── Agregado abrirModalEstado() / cerrarModalEstado()
├── Agregado cambiarEstadoCita() - llamada API
├── Agregado columna "Acciones" en thead
├── Agregado boton "Editar" en cada fila
└── Agregado Modal de cambio de estado
```

---

## v1.7.8 (2025-12-23) - Integracion ChatBot de Citas

### Sistema de Solicitud de Citas Medicas via ChatBot

Se integro el modulo de ChatBot desarrollado externamente (`chatbot-erick`) al proyecto principal React, migrando los archivos HTML a componentes React siguiendo los patrones del sistema.

**Funcionalidades principales:**

| Funcionalidad | Descripcion |
|---------------|-------------|
| Consulta de paciente | Buscar por DNI, obtener datos y servicios disponibles |
| Disponibilidad | Ver fechas y horarios disponibles por servicio |
| Solicitud de cita | Generar solicitud con validacion de conflictos |
| Dashboard reportes | KPIs, filtros avanzados, tabla paginada, exportar CSV |

### Archivos Creados

**Servicio API:**
```
frontend/src/services/chatbotService.js
```

Funciones disponibles:
- `consultarPaciente(documento)` - Consultar datos del paciente
- `getFechasDisponibles(codServicio)` - Obtener fechas disponibles
- `getSlotsDisponibles(fecha, codServicio)` - Obtener horarios disponibles
- `crearSolicitud(solicitud)` - Crear solicitud de cita
- `buscarCitas(filtros)` - Buscar citas con filtros
- `getKPIs(filtros)` - Obtener KPIs del dashboard
- Y mas...

**Componentes React:**
```
frontend/src/pages/chatbot/ChatbotCita.jsx     - Wizard de 3 pasos
frontend/src/pages/chatbot/ChatbotBusqueda.jsx - Dashboard de reportes
```

**Script SQL para menu dinamico:**
```
spec/sql/chatbot_menu_setup.sql
```

### Rutas Configuradas

```jsx
// App.js - Nuevas rutas protegidas
<Route path="/chatbot/cita" element={<ChatbotCita />} />
<Route path="/chatbot/busqueda" element={<ChatbotBusqueda />} />
```

### Flujo del Wizard (ChatbotCita.jsx)

```
Paso 1: Consultar Paciente
├── Input: Numero de documento (DNI/CE)
├── Endpoint: GET /api/chatbot/documento/{doc}
└── Output: Datos del paciente + servicios disponibles

Paso 2: Seleccionar Disponibilidad
├── 2a. Seleccionar servicio
│   ├── Endpoint: GET /api/v2/chatbot/disponibilidad/servicio?codServicio=
│   └── Output: Lista de fechas disponibles
├── 2b. Seleccionar horario
│   ├── Endpoint: GET /api/v2/chatbot/disponibilidad/servicio-detalle?fecha_cita=&cod_servicio=
│   └── Output: Lista de slots con profesionales

Paso 3: Confirmar Solicitud
├── Resumen de cita seleccionada
├── Campo de observaciones
├── Endpoint: POST /api/v1/chatbot/solicitud
└── Output: Confirmacion con numero de solicitud
```

### Dashboard de Reportes (ChatbotBusqueda.jsx)

**KPIs mostrados:**
- Total de citas
- Citas reservadas
- Pacientes unicos
- Profesionales activos

**Filtros disponibles:**
- Fecha inicio/fin
- Periodo (YYYYMM)
- DNI Paciente
- DNI Personal
- Area hospitalaria
- Servicio
- Estado

**Funcionalidades:**
- Tabla paginada (10 registros por pagina)
- Exportar a CSV
- Mostrar/Ocultar filtros
- Badges de estado con colores

### Iconos Agregados

```javascript
// DynamicSidebar.jsx - Nuevos iconos de Lucide
import { MessageSquare, Bot } from "lucide-react";

const iconMap = {
  // ... iconos existentes
  'MessageSquare': MessageSquare,
  'Bot': Bot,
};
```

### Endpoints Backend Utilizados

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{doc}` | Consultar paciente |
| GET | `/api/chatbot/atencioncenate` | Atenciones CENATE |
| GET | `/api/chatbot/atencionglobal/{doc}` | Atenciones globales |
| GET | `/api/v2/chatbot/disponibilidad/servicio` | Fechas disponibles |
| GET | `/api/v2/chatbot/disponibilidad/servicio-detalle` | Slots horarios |
| POST | `/api/v1/chatbot/solicitud` | Crear solicitud |
| PUT | `/api/v1/chatbot/solicitud/{id}` | Actualizar solicitud |
| PUT | `/api/v1/chatbot/solicitud/estado/{id}` | Cambiar estado |
| GET | `/api/v1/chatbot/solicitud/paciente/{doc}` | Solicitudes del paciente |
| GET | `/api/v1/chatbot/estado-cita` | Catalogo de estados |
| GET | `/api/v1/chatbot/reportes/citas/buscar` | Busqueda avanzada |

### Configuracion del Menu (Base de Datos)

Para activar el menu en el sidebar, ejecutar:

```sql
-- Crear modulo
INSERT INTO dim_modulos_sistema (nombre, icono, orden, activo)
VALUES ('ChatBot Citas', 'Bot', 15, true);

-- Crear paginas
INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, orden, activo)
SELECT id_modulo, 'Solicitar Cita', '/chatbot/cita', 1, true
FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, orden, activo)
SELECT id_modulo, 'Dashboard Citas', '/chatbot/busqueda', 2, true
FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

-- Asignar permisos (ver script completo en spec/sql/chatbot_menu_setup.sql)
```

### Documentacion Tecnica

Se creo documento de analisis arquitectural completo:
```
spec/006_chatbot_citas_ANALYSIS.md
```

Contenido:
- Analisis de impacto (Backend, Frontend, BD)
- Propuesta de solucion
- Plan de implementacion por fases
- Diagramas de arquitectura
- Esquemas de tablas SQL
- Checklist de validacion

---

## v1.7.7 (2025-12-23) - Documentacion de Usuarios

### Especificacion tecnica del sistema de usuarios

Se creo documentacion completa del modelo de datos de usuarios en:
`spec/001_espec_users_bd.md`

**Contenido del documento:**

| Seccion | Descripcion |
|---------|-------------|
| Diagrama ERD | Relaciones entre tablas de usuarios |
| Tablas principales | dim_usuarios, dim_personal_cnt, account_requests |
| Clasificacion INTERNO/EXTERNO | Logica por id_origen y codigo Java |
| Flujo de registro | Diagrama de secuencia completo |
| Estados de usuario | Ciclo de vida de solicitudes y usuarios |
| Cascada de eliminacion | Orden correcto para evitar FK errors |
| Roles del sistema | 20 roles con tipos asignados |
| Endpoints API | Todos los endpoints de usuarios |
| Queries diagnostico | SQL utiles para debugging |

**Tablas documentadas:**

```
dim_usuarios          - Credenciales de acceso
dim_personal_cnt      - Datos personales (INTERNO y EXTERNO)
account_requests      - Solicitudes de registro
dim_origen_personal   - Clasificacion (1=INTERNO, 2=EXTERNO)
rel_user_roles        - Relacion usuario-rol (M:N)
dim_personal_prof     - Profesiones del personal
dim_personal_tipo     - Tipo de profesional
```

**Logica de clasificacion INTERNO/EXTERNO:**

```java
// Por id_origen en dim_personal_cnt:
// id_origen = 1 -> INTERNO
// id_origen = 2 -> EXTERNO

// Por existencia en tablas:
if (personalCnt != null) tipoPersonal = "INTERNO";
else if (personalExterno != null) tipoPersonal = "EXTERNO";
else tipoPersonal = "SIN_CLASIFICAR";
```

### Limpieza de base de datos

Se ejecuto limpieza de 11 solicitudes APROBADAS sin usuario creado:

**DNIs liberados:**
- 99999999, 66666666, 12345679, 56321456, 98575642
- 14851616, 45151515, 54544545, 45415156, 99921626, 87654321

**Correo liberado:** cenate.analista@essalud.gob.pe (estaba bloqueado)

**Estado final de la BD:**

| Metrica | Valor |
|---------|-------|
| Usuarios totales | 100 |
| Pendientes activacion | 90 |
| Solicitudes APROBADAS | 4 (validas) |
| Solicitudes RECHAZADAS | 21 |
| Datos huerfanos | 0 |
| DNIs duplicados | 0 |

---

## v1.7.6 (2025-12-23) - Limpieza de Datos Huerfanos

### Sistema de limpieza de datos residuales

Se mejoro el proceso de eliminacion de usuarios y se agregaron nuevos endpoints para diagnosticar y limpiar datos huerfanos que impiden el re-registro de usuarios.

**Problema resuelto:**

Cuando un usuario era eliminado (ej: desde "Pendientes de Activacion"), podian quedar datos huerfanos en las siguientes tablas:
- `dim_usuarios` - Usuario sin eliminar
- `dim_personal_cnt` - Personal sin usuario asociado
- `dim_personal_prof` - Profesiones del personal
- `dim_personal_tipo` - Tipos de profesional
- `account_requests` - Solicitudes en estado APROBADO

Esto impedia que el usuario volviera a registrarse con el mismo DNI.

**Mejoras al proceso de eliminacion:**

El metodo `eliminarUsuarioPendienteActivacion()` ahora tambien elimina:
- `dim_personal_prof` - Profesiones asociadas al personal
- `dim_personal_tipo` - Tipos de profesional asociados

**Nuevos endpoints:**

```java
// Verificar datos existentes para un DNI (GET)
GET /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEncontrados, personalesEncontrados, solicitudesActivas, puedeRegistrarse, razonBloqueo }

// Limpiar todos los datos huerfanos de un DNI (DELETE)
DELETE /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEliminados, personalesEliminados, solicitudesActualizadas, totalRegistrosEliminados }
```

**Nuevos metodos en AccountRequestService:**

```java
public Map<String, Object> limpiarDatosHuerfanos(String numDocumento)
public Map<String, Object> verificarDatosExistentes(String numDocumento)
```

**Tablas afectadas en la limpieza (orden correcto):**
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

**Archivos modificados:**
- `AccountRequestService.java` - Mejorado eliminacion, nuevos metodos
- `SolicitudRegistroController.java` - Nuevos endpoints

---

## v1.7.5 (2025-12-23) - Panel de Activaciones Mejorado

### Panel completo para gestion de usuarios pendientes de activacion

**Nueva pestana en Aprobacion de Solicitudes:**

Se agrego una segunda pestana "Pendientes de Activacion" en `AprobacionSolicitudes.jsx` que muestra usuarios aprobados que aun no han configurado su contrasena.

**Caracteristicas del panel:**

1. **Pestanas de navegacion:**
   - "Solicitudes de Registro" - Flujo original de aprobacion
   - "Pendientes de Activacion" - Lista usuarios con `requiere_cambio_password = true`

2. **Buscador integrado:**
   - Filtra por nombre completo, documento, correo
   - Muestra contador de resultados filtrados

3. **Acciones por usuario:**
   - **Reenviar Email**: Genera nuevo token y envia correo de activacion
   - **Eliminar**: Elimina usuario para permitir re-registro

**Endpoints del backend:**
```java
GET /api/admin/usuarios/pendientes-activacion
POST /api/admin/usuarios/{idUsuario}/reenviar-activacion
```

**Correccion de Lazy Loading:**
El metodo ahora usa SQL directo para obtener el email, evitando problemas de lazy loading con JPA.

---

## v1.7.4 (2025-12-23) - Gestion de Activaciones

### Nueva funcionalidad: Eliminar usuarios pendientes de activacion

Permite al administrador eliminar usuarios que fueron aprobados pero nunca activaron su cuenta.

**Backend Controller:**
```java
@DeleteMapping("/admin/usuarios/{idUsuario}/pendiente-activacion")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<?> eliminarUsuarioPendiente(@PathVariable Long idUsuario)
```

**Tablas afectadas (orden correcto para evitar FK constraints):**
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

### Validacion mejorada: Permitir re-registro

Ahora los usuarios pueden volver a registrarse si su solicitud anterior fue RECHAZADA.

```java
// Solo bloquea si hay solicitud PENDIENTE o APROBADO (no RECHAZADO)
@Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.numDocumento = :numDoc AND a.estado IN ('PENDIENTE', 'APROBADO')")
boolean existsSolicitudActivaByNumDocumento(String numDocumento);
```

### URL del Frontend configurable para emails

```properties
app.frontend.url=${FRONTEND_URL:http://10.0.89.239}
```

---

## v1.7.3 (2025-12-23) - Busqueda por Email

### Busqueda de usuarios por correo electronico

El filtro de busqueda general ahora incluye campos de email:
- Correo personal (`correo_personal`)
- Correo corporativo (`correo_corporativo`)
- Correo institucional (`correo_institucional`)

**Nota importante sobre serializacion:**
El backend usa `@JsonProperty` para serializar campos en **snake_case**.

---

## v1.7.2 (2025-12-23) - Seguridad y UX

### Sistema de Versiones Centralizado

```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.0",
  name: "Documentacion y Arquitectura",
  date: "2025-12-23"
};
```

### Validacion de Usuario en Login

- Solo permite numeros y letras (DNI, pasaporte, carnet extranjeria)
- Automaticamente convierte a mayusculas
- maxLength={12}

### Correccion de Aprobacion de Solicitudes

**Problema:** El correo de bienvenida no se enviaba al aprobar solicitudes.
**Causa:** `usuario.getNombreCompleto()` intentaba acceder a `personalCnt` con lazy loading.
**Solucion:** Nuevo metodo sobrecargado que acepta nombre completo explicito.

### Flujo Seguro de Activacion

```
1. Admin aprueba solicitud
2. Sistema crea usuario con contrasena temporal ALEATORIA
3. Sistema genera token de activacion (24h)
4. Sistema envia email con enlace: /cambiar-contrasena?token=xxx
5. Usuario configura su propia contrasena
6. Token se invalida despues de usar
```

**La contrasena NUNCA se envia en texto plano.**

---

## v1.7.1 (2025-12-23) - Configuracion y Correcciones

### Configuracion de Infraestructura

**Base de Datos Remota:**
- Servidor: `10.0.89.13:5432`
- Base de datos: `maestro_cenate`
- Usuario: `postgres` / Contrasena: `Essalud2025`

**Email SMTP (Gmail):**
- Cuenta: `cenateinformatica@gmail.com`
- Contrasena de aplicacion configurada
- Funcionalidades: Recuperacion de contrasena, aprobacion/rechazo de solicitudes

### Correcciones de Bugs

- `apiClient.js`: Corregido manejo de errores para leer tanto `data.message` como `data.error`
- `CrearCuenta.jsx`: Corregido para mostrar `err.message`
- `AccountRequestService.java`: Agregada validacion de correo electronico duplicado
- `AccountRequestRepository.java`: Agregado metodo `existsByCorreoPersonal()`

### Flujos Verificados

1. **Recuperacion de Contrasena:** Usuario solicita -> Sistema genera token -> Usuario cambia contrasena
2. **Solicitud de Registro:** Usuario externo completa formulario -> Admin aprueba/rechaza -> Sistema envia email

---

## Contactos del Sistema

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |
