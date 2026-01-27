# Historial de Cambios - CENATE

> Changelog detallado del proyecto

---

## v1.35.2 (2026-01-27) - Limpieza Arquitectónica: Eliminar dim_bolsa (Tabla Huérfana)

### 🗑️ Cambio de Limpieza Arquitectónica

**Problema Identificado:**
- Tabla `dim_bolsa` creada en v1.0.0 pero **NUNCA usada** en código
- No hay Entity Java, Service, Controller, ni referencia en Frontend
- `dim_solicitud_bolsa` usa `dim_tipos_bolsas`, NO `dim_bolsa`
- Tabla intermedia innecesaria causa confusión arquitectónica

**Solución:**
Eliminar tabla `dim_bolsa` y simplificar arquitectura:

**Antes (Innecesariamente complejo):**
```
dim_tipos_bolsas (CATÁLOGO)
     ↓
dim_bolsa (TABLA INTERMEDIA HUÉRFANA - nunca usada)
     ↓
dim_solicitud_bolsa (SOLICITUDES)
```

**Después (Simplificado v1.12.0):**
```
dim_tipos_bolsas (CATÁLOGO)
     ↓ (FK: id_bolsa)
dim_solicitud_bolsa (SOLICITUDES)
```

**Impacto:**
- ✅ Base de datos más limpia: -1 tabla, -5 índices, -12 columnas
- ✅ Arquitectura más clara y mantenible
- ✅ Sin impacto en funcionalidad (tabla nunca se usó)
- ✅ Auditoría completa mantenida via `dim_solicitud_bolsa` y `dim_historial_importacion_bolsa`

**Archivos Cambiados:**
- `backend/src/main/resources/db/migration/V3_0_6__cleanup_remove_unused_dim_bolsa.sql` (Nueva migración)
- `backend/src/main/java/com/styp/cenate/db/scripts/sql/051_crear_modulo_bolsas.sql` (Actualizado - notas de deprecación)
- `spec/backend/09_modules_bolsas/README.md` (Documentación actualizada)
- `spec/backend/002_changelog.md` (Este documento)

---

## v1.35.1 (2026-01-27) - Módulo Solicitudes de Bolsa v1.12.0 - Auto-Detección y Soft Delete

### 🎯 Resumen de Cambios

**Auto-detección inteligente de bolsas y servicios**
**Soft delete de solicitudes en lote**
**Corrección de fechas en importación Excel**
**Mensajes de error amigables al usuario**
**Logging y debugging mejorados**

### ✨ Nuevas Características

#### 1. Auto-Detección Inteligente (Frontend)
Extrae palabras clave del nombre del archivo Excel para seleccionar automáticamente:
- **Tipo de Bolsa:** Por coincidencia exacta con la PRIMERA palabra
- **Servicio/Especialidad:** Por coincidencia con CUALQUIER palabra (con fuzzy matching)

**Ejemplo:**
- Archivo: `BOLSA OTORRINO EXPLOTADOS 26012026.xlsx`
- Palabras extraídas: `["OTORRINO", "EXPLOTADOS"]`
- Bolsa auto-seleccionada: Que contenga "OTORRINO" ✅
- Servicio auto-seleccionado: Que contenga "EXPLOTADOS" o similar ✅

**Archivos Modificados:**
- `frontend/src/pages/bolsas/CargarDesdeExcel.jsx` (v1.12.0)
  - Nueva función `extraerTipoBolsaDelNombre()` - Extrae palabras clave
  - Mejorada `autoSeleccionarBolsa()` - Busca por palabra principal
  - Mejorada `autoSeleccionarServicio()` - Busca en todas las palabras
  - Mejorada `calcularSimilitud()` - Fuzzy matching

#### 2. Soft Delete en Lote
Borrado lógico de múltiples solicitudes manteniendo auditoría completa.

**Características:**
- Seleccionar y borrar solicitudes individuales
- Opción "Borrar TODAS" para lote completo
- Modal de confirmación con advertencia
- Transaccional y resiliente (continúa si una falla)
- Soft delete (no borra físicamente, solo marca inactivo)

**Archivos Modificados:**
- `frontend/src/pages/bolsas/Solicitudes.jsx` (v2.3.0)
  - Nueva función `borrarSolicitudesSeleccionadas()`
  - Nuevo state `seleccionarTodas` para "Select All"

- `backend/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java` (v1.8.0)
  - Nuevo endpoint `@PostMapping("/borrar")`
  - Conversión segura de tipos (Integer → Long)

- `backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java` (v1.8.0)
  - Nueva método `eliminarMultiples(List<Long> ids)`
  - Logging detallado por cada solicitud

- `frontend/src/services/bolsasService.js` (v1.0.1)
  - Nueva función `eliminarMultiplesSolicitudes(ids)`

#### 3. Corrección de Fechas en Excel
Problema: "FECHA PREFERIDA QUE NO FUE ATENDIDA" mostraba "N/A" en BD

Solución: Cambiar de `cellStr()` a `cellDateStr()` para detectar fechas Excel numéricos

**Archivos Modificados:**
- `backend/src/main/java/com/styp/cenate/service/form107/ExcelImportService.java` (v1.9.1)
  - Línea 241: `cellDateStr()` en método principal
  - Línea 419: `cellDateStr()` en método staging

#### 4. Mensajes de Error Amigables
Reemplazar mensajes técnicos por mensajes claros al usuario.

**Mapeo de Errores:**

| Error Técnico | Mensaje Amigable |
|---|---|
| "Ya se cargó este archivo hoy (mismo hash)" | "⚠️ Esta bolsa ya fue cargada anteriormente. Si deseas cargar una nueva versión, modifica el archivo o cambia su nombre." |
| Error 400 validación | "❌ El archivo no cumple con la estructura requerida. Verifica que tenga los 10 campos obligatorios." |
| Error 500 | "❌ Error interno del servidor. Por favor, intenta nuevamente." |
| Error 401 | "❌ Tu sesión ha expirado. Por favor, inicia sesión nuevamente." |

**Archivos Modificados:**
- `frontend/src/pages/bolsas/CargarDesdeExcel.jsx` (v1.12.0)
  - Mejorado bloque catch en `handleImport()`

#### 5. Logging y Debugging Mejorados
Logs detallados en consola y backend para facilitar diagnóstico.

**Ejemplo de logs frontend:**
```
🧠 Intentando auto-selección... tiposBolsas: 5, servicios: 12
📋 Tipos de bolsas disponibles: [BOLSAS_OTORRINO, BOLSAS_CARDIOLOGIA, ...]
✅ Bolsa auto-seleccionada ID: 2
📋 Servicios disponibles: [B01 - PEDIATRIA, B91 - OTORRINOLARINGOLOGIA, ...]
✅ Servicio/Especialidad auto-seleccionado ID: 12
```

### 🔧 Stack Técnico

**Frontend Changes:**
- React Hooks: `useState`, `useEffect`
- String manipulation para extracción de palabras clave
- Fuzzy matching algoritmo (distancia Levenshtein simplificada)

**Backend Changes:**
- JPA `@Transactional` para soft delete robusto
- Apache POI `cellDateStr()` para manejo de fechas Excel
- Logging con Slf4j para auditoría
- Conversión segura de tipos numéricos

### 📊 Validación

| Aspecto | Antes | Después |
|---------|-------|---------|
| Auto-detección de bolsa | Manual | Automático ✅ |
| Auto-detección de servicio | ENFERMERIA default ❌ | Inteligente ✅ |
| Fechas en FECHA PREFERIDA | N/A | Correctas ✅ |
| Mensajes de error | Técnicos confusos | Amigables ✅ |
| Borrado de solicitudes | Una a una | En lote ✅ |

### 📝 Documentación

Creado documento completo: `spec/backend/09_modules_bolsas/12_modulo_solicitudes_bolsa_v1.12.0.md`

Incluye:
- Arquitectura completa
- Flujos de importación y borrado
- Especificación de APIs
- Ejemplos de uso
- Mapeo de errores
- Tablas relacionadas

### ✅ Testing

Validado en entorno de desarrollo:
- ✅ Importación de 39 solicitudes desde Excel
- ✅ Auto-detección de OTORRINO y OTORRINOLARINGOLOGIA
- ✅ Borrado selectivo de solicitudes
- ✅ Borrado de todas las solicitudes
- ✅ Soft delete sin pérdida de datos

### 🚀 Deployment

1. Reconstruir backend: `./gradlew clean bootRun`
2. Reconstruir frontend: `npm start`
3. No se requieren cambios en BD (usa campos existentes)
4. Base de datos limpia automáticamente al reiniciar

### 📚 Referencias

- Documentación: `spec/backend/09_modules_bolsas/12_modulo_solicitudes_bolsa_v1.12.0.md`
- Código: `backend/src/main/java/com/styp/cenate/service/form107/ExcelImportService.java`
- Frontend: `frontend/src/pages/bolsas/CargarDesdeExcel.jsx`

---

## v1.9.2 (2025-12-23) - Tokens de Recuperacion Persistentes

### Problema Resuelto

Los tokens de recuperacion de contrasena se almacenaban en memoria y se perdian al reiniciar el backend, invalidando los enlaces enviados por correo.

### Solucion Implementada

**Persistencia en Base de Datos:**

Se creo una nueva tabla `segu_password_reset_tokens` para almacenar los tokens de forma permanente.

**Archivos Creados:**
```
backend/src/main/java/com/styp/cenate/
├── model/PasswordResetToken.java          # Entidad JPA
└── repository/PasswordResetTokenRepository.java  # Repositorio
```

**Archivos Modificados:**
- `PasswordTokenService.java` - Usa BD en lugar de memoria
- `application.properties` - URL frontend configurable por ambiente
- `ActualizarModel.jsx` - Nuevo boton "Enviar correo de recuperacion"

### Estructura de la Tabla

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

### Configuracion por Ambiente

| Ambiente | Variable | Frontend URL |
|----------|----------|--------------|
| Desarrollo | (default) | `http://localhost:3000` |
| Produccion | `FRONTEND_URL=http://10.0.89.239` | `http://10.0.89.239` |

### Mejora UX - Boton de Recuperacion

**Antes:** Boton amarillo "Resetear a @Cenate2025" (mostraba contrasena en texto plano)

**Ahora:** Boton azul "Enviar correo de recuperacion" con modal explicativo que indica:
- Se enviara un enlace seguro al correo del usuario
- El enlace expira en 24 horas
- El usuario configura su propia contrasena

### Flujo de Recuperacion

1. Admin abre modal de edicion de usuario
2. Clic en "Enviar correo de recuperacion"
3. Confirma en el modal
4. Usuario recibe correo con enlace
5. Usuario abre enlace y configura su nueva contrasena
6. Token se marca como usado en BD

### Limpieza Automatica

Los tokens expirados o usados se eliminan automaticamente cada hora mediante `@Scheduled`.

---

## v1.9.1 (2025-12-23) - Selector de Red para Coordinadores

### Mejoras en Asignacion de COORDINADOR_RED

Se agrego funcionalidad para asignar una Red automaticamente al usuario cuando se le asigna el rol `COORDINADOR_RED` desde el modal de edicion de usuarios.

### Cambios en Backend

**UsuarioUpdateRequest.java:**
- Nuevo campo `idRed` para recibir la Red asignada

**UsuarioServiceImpl.java:**
- Inyeccion de `RedRepository`
- Logica en `updateUser()` para asignar/quitar Red segun rol COORDINADOR_RED
- Actualizacion de `convertToResponse()` para incluir Red del usuario

### Cambios en Frontend

**ActualizarModel.jsx:**
- `handleRoleToggle()` ahora carga redes cuando se selecciona COORDINADOR_RED
- Nuevo selector de Red que aparece al seleccionar rol COORDINADOR_RED
- Validacion obligatoria de Red para COORDINADOR_RED
- Envio de `idRed` en datos de actualizacion de usuario
- useEffect para inicializar Red cuando usuario ya tiene el rol

### Flujo de Uso

1. Abrir modal de edicion de usuario
2. Ir a pestana "Roles"
3. Marcar checkbox de "COORDINADOR_RED"
4. Aparece selector "Asignar Red al Coordinador"
5. Seleccionar la Red (obligatorio)
6. Guardar cambios

La Red se guarda en `dim_usuarios.id_red` y el usuario podra acceder al modulo "Gestion de Red" viendo solo datos de su red asignada.

---

## v1.9.0 (2025-12-23) - Modulo de Red para Coordinadores

### Nuevo Modulo

Se agrego un nuevo modulo **Gestion de Red** para Coordinadores de Red que permite visualizar:
- Personal externo de las IPRESS de su red asignada
- Formularios de diagnostico de su red
- Estadisticas consolidadas (total IPRESS, personal, formularios)

### Cambios en Backend

**Modelo Usuario:**
- Nuevo campo `id_red` para asignar red directamente al usuario
- Relacion `@ManyToOne` con entidad `Red`

**Nuevo Rol:**
- `COORDINADOR_RED` (nivel jerarquico 4)

**Nuevos Endpoints:**
- `GET /api/red/mi-red` - Dashboard con info de la red y estadisticas
- `GET /api/red/personal` - Personal externo de la red
- `GET /api/red/formularios` - Formularios de diagnostico de la red

**Archivos Creados:**
```
backend/src/main/java/com/styp/cenate/
├── api/red/RedDashboardController.java
├── service/red/RedDashboardService.java
├── service/red/impl/RedDashboardServiceImpl.java
└── dto/red/RedDashboardResponse.java
```

**Repositorios Modificados:**
- `PersonalExternoRepository` - Nuevos metodos por Red
- `IpressRepository` - Conteo por Red
- `FormDiagFormularioRepository` - Conteo por Red y Estado

### Cambios en Frontend

**Nueva Pagina:**
- `frontend/src/pages/red/RedDashboard.jsx`
- Ruta: `/red/dashboard`

**Caracteristicas:**
- Header con info de la red y macroregion
- Cards de estadisticas (IPRESS, Personal, Formularios)
- Tabs para alternar entre Personal y Formularios
- Exportacion a CSV
- Diseno responsive

### Script SQL

**Archivo:** `spec/scripts/003_modulo_red_coordinador.sql`

Ejecutar con:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/003_modulo_red_coordinador.sql
```

### Asignar Red a Usuario

```sql
-- Asignar red a usuario
UPDATE dim_usuarios
SET id_red = (SELECT id_red FROM dim_red WHERE cod_red = 'RXXX' LIMIT 1)
WHERE name_user = 'DNI_USUARIO';

-- Asignar rol COORDINADOR_RED
INSERT INTO rel_user_roles (id_user, id_rol)
SELECT u.id_user, r.id_rol
FROM dim_usuarios u, dim_roles r
WHERE u.name_user = 'DNI_USUARIO'
AND r.desc_rol = 'COORDINADOR_RED'
ON CONFLICT DO NOTHING;
```

### Documentacion

- Plan detallado: `spec/007_plan_modulo_red.md`

---

## v1.8.1 (2025-12-23) - Fix Usuarios Huerfanos

### Problema Identificado

Los usuarios externos (IPRESS) podian hacer login pero no aparecian en la busqueda de "Gestion de Usuarios". Esto ocurria porque:

1. La busqueda solo consultaba `dim_personal_cnt` (internos)
2. Usuarios externos estan en `dim_personal_externo`
3. Al eliminar usuarios, quedaban datos huerfanos que permitian login

### Correccion: Limpieza de Personal Externo

Se mejoraron dos metodos en `AccountRequestService.java`:

**`limpiarDatosHuerfanos()`**
```java
// Ahora desvincula personal externo ANTES de eliminar usuario
UPDATE dim_personal_externo SET id_user = NULL WHERE id_user = ?;
// Luego elimina el usuario
DELETE FROM dim_usuarios WHERE id_user = ?;
// Finalmente elimina el personal externo
DELETE FROM dim_personal_externo WHERE id_pers_ext = ?;
```

**`eliminarUsuarioPendienteActivacion()`**
- Ahora detecta si el usuario es INTERNO o EXTERNO
- Limpia `dim_personal_externo` ademas de `dim_personal_cnt`
- Orden correcto: desvincular → eliminar usuario → eliminar personal

### Usuarios Huerfanos Limpiados

| DNI | Nombre | IPRESS | Accion |
|-----|--------|--------|--------|
| 11111111 | Testing Testing | P.M. QUEROBAMBA | Eliminado |
| 32323232 | Tess Testing | P.M. QUEROBAMBA | Eliminado |

### Tablas del Sistema de Personal

| Tabla | Tipo | Descripcion |
|-------|------|-------------|
| `dim_personal_cnt` | INTERNO | Personal de CENATE |
| `dim_personal_externo` | EXTERNO | Personal de IPRESS |
| `dim_usuarios` | Ambos | Credenciales de acceso |

**Nota:** La pagina "Gestion de Usuarios" (`/admin/users`) solo muestra personal INTERNO. Para gestionar personal externo, usar la opcion correspondiente del menu.

### Archivos Modificados

```
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
├── limpiarDatosHuerfanos() - Incluye dim_personal_externo
└── eliminarUsuarioPendienteActivacion() - Maneja ambos tipos de personal
```

---

## v1.8.0 (2025-12-23) - Mejoras en Auditoria

### Renombrado de Menu

El menu "Logs del Sistema" fue renombrado a **"Auditoría"** para reflejar mejor su funcion.

**Script SQL:**
```sql
-- spec/scripts/002_rename_logs_to_auditoria.sql
UPDATE dim_paginas_modulo
SET nombre_pagina = 'Auditoría',
    descripcion = 'Auditoría completa del sistema - Trazabilidad de acciones'
WHERE ruta_pagina = '/admin/logs';
```

### Fix: Usuario N/A en Logs

**Problema:** Los registros de auditoria mostraban "N/A" en lugar del nombre de usuario.

**Causa:** El mapper en `AuditoriaServiceImpl.java` usaba `view.getUsername()` que viene del JOIN con `dim_usuarios`. Los usuarios de sistema como "backend_user" no existen en esa tabla.

**Solucion:**
```java
// AuditoriaServiceImpl.java - mapToAuditoriaResponseDTO()
String usuario = view.getUsuarioSesion();  // Prioriza campo de audit_logs
if (usuario == null || usuario.isBlank()) {
    usuario = view.getUsername();
}
if (usuario == null || usuario.isBlank()) {
    usuario = "SYSTEM";  // Fallback para acciones del sistema
}
```

### Mejoras en AdminDashboard - Actividad Reciente

Se mejoro la seccion "Actividad Reciente" del dashboard administrativo:

| Antes | Despues |
|-------|---------|
| 5 actividades | 8 actividades |
| Acciones en codigo (LOGIN, INSERT) | Acciones legibles ("Inicio de sesión", "Registro creado") |
| Solo usuario | Usuario + nombre completo |
| Sin indicador visual | Indicador de estado (verde/rojo) |

**Funciones agregadas:**
- `formatAccionEjecutiva()` - Traduce acciones a formato ejecutivo
- `getDetalleCorto()` - Extrae detalle resumido
- `getNombreCompleto()` - Obtiene nombre completo del log
- `getLogUsuario()` - Obtiene usuario con fallback a "SYSTEM"

**Archivos modificados:**
```
backend/src/main/java/com/styp/cenate/service/mbac/impl/AuditoriaServiceImpl.java
frontend/src/pages/AdminDashboard.js
frontend/src/pages/admin/LogsDelSistema.jsx
spec/scripts/002_rename_logs_to_auditoria.sql (NUEVO)
```

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
