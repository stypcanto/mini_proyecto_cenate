# Modulo de Mesa de Ayuda (v1.65.2)

> **Sistema de Telemedicina CENATE - EsSalud Peru**
> **Fecha de Creacion:** 2026-02-18
> **Ultima Actualizacion:** 2026-02-19
> **Version Modulo:** 1.3.0
> **Status:** Production Ready

---

## Descripcion General

El **Modulo de Mesa de Ayuda** permite a los medicos generar tickets de soporte directamente desde su panel de pacientes (MisPacientes), y al personal de Mesa de Ayuda gestionar, responder y dar seguimiento a dichos tickets.

El modulo permite:
- **Medicos:** Crear tickets vinculados a un paciente desde MisPacientes, ver estado del ticket en la columna de la tabla
- **Personal Mesa de Ayuda:** Listar, filtrar, responder, asignar personal y cambiar estado de tickets
- **Administradores:** Gestionar motivos predefinidos y ver KPIs

---

## Arquitectura

### Componentes Principales

```
+-------------------------------------------------------------+
|                   MODULO MESA DE AYUDA                       |
+-------------------------------------------------------------+
|                                                               |
|  +------------------+  +------------------+                   |
|  |  Medico          |  |  Mesa de Ayuda   |                   |
|  |  MisPacientes    |  |  ListaTickets    |                   |
|  |                  |  |  (Tablero)       |                   |
|  | - Crear ticket   |  | - Listar tickets |                   |
|  | - Ver estado     |  | - Filtrar        |                   |
|  | - Ver numero     |  | - Responder      |                   |
|  |   ticket         |  | - Asignar personal|                  |
|  +------------------+  | - Ver detalle    |                   |
|           |            +------------------+                   |
|           +--------+------------+                              |
|                    |                                           |
|             +------v-----------+                               |
|             |  API REST        |                               |
|             |  /api/mesa-ayuda |                               |
|             +------+-----------+                               |
|                    |                                           |
|        +-----------+-----------+                               |
|        v                       v                               |
|  +--------------+      +------------------+                    |
|  |  PostgreSQL  |      |  Spring Boot     |                    |
|  |  3 tablas    |      |  Service Layer   |                    |
|  +--------------+      +------------------+                    |
|                                                               |
+-------------------------------------------------------------+
```

### Flujo del Ticket

```
Medico (MisPacientes)          Mesa de Ayuda (Tablero de Tickets)
       |                                |
       | 1. Click icono ticket          |
       | 2. Selecciona motivo           |
       | 3. Agrega observaciones        |
       | 4. Click "Crear Ticket"        |
       |-----> POST /tickets ---------> |
       |                                | 5. Ve ticket NUEVO
       | 6. Badge aparece               | 6. Asigna personal
       |    en columna                  | 7. Click "Responder"
       |    (NUEVO - amarillo)          | 8. Escribe respuesta
       |                                | 9. Cambia estado
       |                                |-----> PUT /tickets/{id}/responder
       | 10. Badge actualiza            |
       |    (RESUELTO - verde)          | ** TICKET BLOQUEADO **
       |    (no modificable)            | (no se puede cambiar estado
       |                                |  ni reasignar personal)
```

---

## Base de Datos

### Tablas

#### `dim_ticket_mesa_ayuda` (Tabla principal)

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | BIGINT PK | ID auto-generado |
| `titulo` | VARCHAR | Titulo del ticket (auto-generado desde motivo) |
| `descripcion` | TEXT | Descripcion detallada |
| `estado` | VARCHAR | NUEVO, EN_PROCESO, RESUELTO |
| `prioridad` | VARCHAR | ALTA, MEDIA, BAJA |
| `id_medico` | BIGINT | FK al medico que crea el ticket |
| `nombre_medico` | VARCHAR | Nombre denormalizado del medico |
| `id_solicitud_bolsa` | BIGINT | FK a la solicitud de bolsa del paciente |
| `tipo_documento` | VARCHAR | Tipo de documento (DNI, CE, etc.) |
| `dni_paciente` | VARCHAR | DNI del paciente |
| `nombre_paciente` | VARCHAR | Nombre denormalizado del paciente |
| `especialidad` | VARCHAR | Especialidad del medico |
| `ipress` | VARCHAR | IPRESS del paciente |
| `respuesta` | TEXT | Respuesta del personal de mesa |
| `id_personal_mesa` | BIGINT | FK al personal que responde |
| `nombre_personal_mesa` | VARCHAR | Nombre de quien responde |
| `id_personal_asignado` | BIGINT | FK al personal asignado al ticket (v1.65.1) |
| `nombre_personal_asignado` | VARCHAR | Nombre del personal asignado (v1.65.1) |
| `fecha_asignacion` | TIMESTAMP | Fecha/hora de asignacion (v1.65.1) |
| `numero_ticket` | VARCHAR | Numero unico formato XXXX-YYYY (ej: 0001-2026) |
| `id_motivo` | BIGINT | FK al motivo predefinido |
| `observaciones` | TEXT | Observaciones adicionales del medico |
| `fecha_creacion` | TIMESTAMP | Fecha/hora creacion (hora Peru UTC-5) |
| `fecha_actualizacion` | TIMESTAMP | Fecha/hora ultima actualizacion (hora Peru) |
| `fecha_respuesta` | TIMESTAMP | Fecha/hora de la respuesta (hora Peru) |
| `deleted_at` | TIMESTAMP | Soft delete |

**CHECK constraints:**
```sql
estado VARCHAR(50) DEFAULT 'NUEVO' CHECK (estado IN ('NUEVO', 'EN_PROCESO', 'RESUELTO'))
prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA'))
```

#### `dim_motivos_mesa_ayuda` (Catalogo de motivos)

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | BIGINT PK | ID auto-generado |
| `codigo` | VARCHAR | Codigo unico (ej: PS_CITAR_ADICIONAL) |
| `descripcion` | VARCHAR | Texto completo del motivo |
| `activo` | BOOLEAN | Si el motivo esta disponible |
| `orden` | INTEGER | Orden de aparicion en el combo |

#### `dim_secuencia_tickets` (Secuencia anual)

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | BIGINT PK | ID auto-generado |
| `anio` | INTEGER | Ano de la secuencia (ej: 2026) |
| `contador` | INTEGER | Ultimo numero asignado |

### Estados del Ticket

```
NUEVO -----> EN_PROCESO -----> RESUELTO (BLOQUEADO)
(amarillo)    (naranja)         (verde)
```

- **NUEVO:** Ticket recien creado, pendiente de atencion
- **EN_PROCESO:** Personal de mesa esta trabajando en el ticket
- **RESUELTO:** Ticket atendido y respondido (estado final, no modificable)

**Reglas de negocio:**
- Un ticket RESUELTO **no puede** cambiar de estado
- Un ticket RESUELTO **no puede** ser reasignado ni desasignado
- Esto protege la produccion del personal asignado

### Migracion de Estados (v1.65.2)

Migracion Flyway `V4_6_0__migrar_estados_mesa_ayuda.sql`:
```sql
-- Migrar datos existentes
UPDATE dim_ticket_mesa_ayuda SET estado = 'NUEVO' WHERE estado = 'ABIERTO';
UPDATE dim_ticket_mesa_ayuda SET estado = 'RESUELTO' WHERE estado = 'CERRADO';

-- Actualizar CHECK constraint
ALTER TABLE dim_ticket_mesa_ayuda DROP CONSTRAINT IF EXISTS dim_ticket_mesa_ayuda_estado_check;
ALTER TABLE dim_ticket_mesa_ayuda ALTER COLUMN estado SET DEFAULT 'NUEVO';
ALTER TABLE dim_ticket_mesa_ayuda ADD CONSTRAINT dim_ticket_mesa_ayuda_estado_check
    CHECK (estado IN ('NUEVO', 'EN_PROCESO', 'RESUELTO'));
```

---

## API REST

### Endpoints

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `POST` | `/api/mesa-ayuda/tickets` | JWT | Crear ticket (medico) |
| `GET` | `/api/mesa-ayuda/tickets` | JWT | Listar todos (paginado) |
| `GET` | `/api/mesa-ayuda/tickets/{id}` | JWT | Obtener ticket por ID |
| `GET` | `/api/mesa-ayuda/tickets/medico/{idMedico}` | JWT | Tickets del medico (paginado) |
| `GET` | `/api/mesa-ayuda/tickets/activos` | JWT | Tickets activos (paginado) |
| `PUT` | `/api/mesa-ayuda/tickets/{id}/responder` | JWT | Responder ticket |
| `PUT` | `/api/mesa-ayuda/tickets/{id}/estado` | JWT | Cambiar estado |
| `PUT` | `/api/mesa-ayuda/tickets/{id}/asignar` | JWT | Asignar personal (v1.65.1) |
| `PUT` | `/api/mesa-ayuda/tickets/{id}/desasignar` | JWT | Desasignar personal (v1.65.1) |
| `GET` | `/api/mesa-ayuda/personal` | JWT | Listar personal Mesa de Ayuda (v1.65.1) |
| `DELETE` | `/api/mesa-ayuda/tickets/{id}` | JWT | Eliminar (soft delete) |
| `GET` | `/api/mesa-ayuda/kpis` | JWT | Obtener KPIs |
| `GET` | `/api/mesa-ayuda/motivos` | Publico | Obtener motivos predefinidos |
| `GET` | `/api/mesa-ayuda/siguiente-numero` | Publico | Preview siguiente numero ticket |

### Request - Crear Ticket (POST /tickets)

```json
{
  "idMotivo": 3,
  "titulo": "PROFESIONAL DE SALUD SOLICITA CONTACTAR CON EL PACIENTE PARA EVITAR DESERCION",
  "descripcion": "Observaciones del medico o titulo del motivo como fallback",
  "observaciones": "Detalle adicional opcional",
  "prioridad": "MEDIA",
  "idMedico": 672,
  "nombreMedico": "Test Doctor 1",
  "idSolicitudBolsa": 7100,
  "tipoDocumento": "DNI",
  "dniPaciente": "07888772",
  "nombrePaciente": "ARIAS CUBILLAS MARIA",
  "especialidad": "CARDIOLOGIA",
  "ipress": "CAP II LURIN"
}
```

### Response - Ticket Creado (201 CREATED)

```json
{
  "id": 2,
  "titulo": "PROFESIONAL DE SALUD SOLICITA CONTACTAR CON EL PACIENTE...",
  "descripcion": "Observaciones del medico",
  "estado": "NUEVO",
  "prioridad": "MEDIA",
  "nombreMedico": "Test Doctor 1",
  "tipoDocumento": "DNI",
  "dniPaciente": "07888772",
  "nombrePaciente": "ARIAS CUBILLAS MARIA",
  "especialidad": "CARDIOLOGIA",
  "ipress": "CAP II LURIN",
  "respuesta": null,
  "nombrePersonalMesa": null,
  "idPersonalAsignado": null,
  "nombrePersonalAsignado": null,
  "fechaCreacion": "2026-02-19T00:50:26",
  "fechaRespuesta": null,
  "fechaActualizacion": "2026-02-19T00:50:26",
  "horasDesdeCreacion": 0,
  "idMotivo": 3,
  "nombreMotivo": "PROFESIONAL DE SALUD SOLICITA CONTACTAR...",
  "observaciones": "Detalle adicional",
  "numeroTicket": "0001-2026"
}
```

### Request - Responder Ticket (PUT /tickets/{id}/responder)

```json
{
  "respuesta": "Se contacto al paciente exitosamente",
  "estado": "RESUELTO",
  "idPersonalMesa": 288,
  "nombrePersonalMesa": "Jorge Test Test"
}
```

### Request - Asignar Personal (PUT /tickets/{id}/asignar)

```json
{
  "idPersonalAsignado": 288,
  "nombrePersonalAsignado": "Jorge Test Test"
}
```

---

## Backend - Archivos

### Estructura

```
backend/src/main/java/com/styp/cenate/
+-- api/
|   +-- TicketMesaAyudaController.java        # Controller REST
+-- service/mesaayuda/
|   +-- TicketMesaAyudaService.java            # Logica de negocio
+-- model/mesaayuda/
|   +-- TicketMesaAyuda.java                   # Entidad JPA
|   +-- DimMotivosMesaAyuda.java               # Entidad motivos
|   +-- DimSecuenciaTickets.java               # Entidad secuencia
+-- dto/mesaayuda/
|   +-- TicketMesaAyudaRequestDTO.java         # DTO entrada (crear)
|   +-- TicketMesaAyudaResponseDTO.java        # DTO salida
|   +-- ResponderTicketDTO.java                # DTO responder
|   +-- MotivoMesaAyudaDTO.java                # DTO motivos
+-- repository/mesaayuda/
|   +-- TicketMesaAyudaRepository.java         # Repository tickets
|   +-- MotivoMesaAyudaRepository.java         # Repository motivos
|   +-- SecuenciaTicketsRepository.java        # Repository secuencia

backend/src/main/resources/db/migration/
+-- V4_5_0__agregar_personal_asignado_mesa_ayuda.sql  # Columnas asignacion
+-- V4_6_0__migrar_estados_mesa_ayuda.sql              # Migracion estados
```

### Validaciones de Negocio (Backend)

| Accion | Validacion | Error |
|--------|-----------|-------|
| Cambiar estado | Ticket RESUELTO no puede cambiar | "No se puede cambiar el estado de un ticket ya resuelto" |
| Asignar personal | Ticket RESUELTO no puede reasignarse | "No se puede reasignar un ticket ya resuelto" |
| Desasignar | Ticket RESUELTO no puede desasignarse | "No se puede desasignar un ticket ya resuelto" |
| Responder | No puede cambiar a estado NUEVO | "No se puede cambiar a estado NUEVO desde una respuesta" |
| Cambiar estado | Solo acepta NUEVO, EN_PROCESO, RESUELTO | "Estado no valido" |

### Zona Horaria

Todas las fechas se registran en **hora Peru (America/Lima, UTC-5)**:

```java
private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");
```

### Numeracion Automatica de Tickets

Los tickets se numeran con formato `XXXX-YYYY` donde:
- `XXXX` = Secuencial con padding de 4 digitos (0001, 0002, ...)
- `YYYY` = Ano actual (2026)

La secuencia se reinicia cada ano usando la tabla `dim_secuencia_tickets`.

---

## Frontend - Archivos

### Estructura

```
frontend/src/
+-- pages/mesa-ayuda/
|   +-- ListaTickets.jsx                       # Tablero de Tickets (Mesa de Ayuda)
|   +-- BienvenidaMesaAyuda.jsx                # Pagina de bienvenida
|   +-- FAQsMesaAyuda.jsx                      # Preguntas frecuentes
|   +-- components/
|       +-- CrearTicketModal.jsx               # Modal crear ticket (desde MisPacientes)
|       +-- ResponderTicketModal.jsx           # Modal responder ticket (Mesa de Ayuda)
+-- pages/roles/medico/pacientes/
|   +-- MisPacientes.jsx                       # Tabla de pacientes (columna ticket)
+-- services/
|   +-- mesaAyudaService.js                    # Servicio API Mesa de Ayuda
```

### ListaTickets.jsx - Tablero de Tickets (v1.65.2)

#### Header
- Titulo: "Tablero de Tickets" con icono Zap (rayo amarillo)
- Contador de tickets: badge gris con total de tickets filtrados
- Subtitulo: "Gestiona los tickets creados por medicos y proporciona soporte"

#### Diseno UI Estandarizado
- **Header tabla:** Color `#0a5ba9` (mismo que HeaderCenate) con texto blanco en mayusculas
- **Bordes tabla:** Redondeados (`rounded-xl`) con sombra elegante (`shadow-lg`)
- **Boton Refrescar:** Color `#0a5ba9` (estandarizado con el header)

#### Columnas de la Tabla

| Columna | Descripcion |
|---------|-------------|
| Info | Icono Eye (ojito) - abre modal de detalle |
| Codigo Ticket | Numero formato XXXX-YYYY (enlace azul) |
| Medico | Nombre del medico que creo el ticket |
| Especialidad | Especialidad medica |
| Fecha y Hora de Registro | Formato: DD/MM/YYYY, HH:mm |
| Tipo Doc. | Tipo de documento (DNI, CE, etc.) |
| N Documento | Numero de documento del paciente |
| Nombre del Asegurado | Nombre del paciente |
| Motivo de Incidencia | Motivo predefinido (truncado 3 lineas) |
| Estado de Atencion | Badge con icono y chevron (ver abajo) |
| Prioridad | Badge (ALTA, MEDIA, BAJA) |
| Personal Asignado | Avatar + nombre + dropdown asignacion |
| Accion | Boton "Responder" o badge "Resuelto" |

#### Badges de Estado de Atencion

| Estado | Label | Color | Icono | Interactivo |
|--------|-------|-------|-------|-------------|
| NUEVO | Nuevo | Amarillo (`bg-yellow-50 border-yellow-300`) | Clock | Si (chevron) |
| EN_PROCESO | En Proceso | Naranja (`bg-orange-50 border-orange-300`) | PlayCircle | Si (chevron) |
| RESUELTO | Resuelto | Verde (`bg-green-50 border-green-300`) | CheckCircle2 | No (bloqueado) |

#### Dropdown Asignacion de Personal
- **Posicionamiento:** `position: fixed` (no se corta por overflow de tabla)
- **Apertura:** Hacia arriba desde el click (`bottom-full`)
- **Header:** "Asignar personal" en gris
- **Items:** Avatar con inicial + nombre completo
- **Opcion desasignar:** Texto rojo al final (solo si hay asignado)
- **Backdrop:** Overlay invisible para cerrar al click fuera
- **Bloqueado:** No se abre si el ticket es RESUELTO

#### Modal Detalle de Ticket (v1.65.2)
Al hacer click en el icono Eye se abre un modal con 3 tarjetas:

1. **Informacion del Solicitante:**
   - Avatar con inicial del medico
   - Nombre del medico
   - Especialidad
   - Categoria (motivo predefinido en badge oscuro)

2. **Descripcion del Problema:**
   - Texto de observaciones o descripcion del ticket

3. **Datos del Paciente:**
   - Nombre del paciente (card teal)
   - Tipo y numero de documento (con icono)
   - IPRESS (con icono)

Footer: Boton "Ocultar detalles" con chevron hacia arriba

#### Filtros

- **Busqueda:** Por titulo, DNI, medico, paciente
- **Estado:** Todos, Nuevos, En Proceso, Resueltos
- **Prioridad:** Todas, Alta, Media, Baja

### MisPacientes.jsx - Integracion con Tickets

#### Columna "TICKET MESA DE AYUDA"

Muestra dos elementos:
1. **Badge de estado** (si existe ticket para el paciente):
   - NUEVO: ambar (`bg-amber-100 text-amber-800`)
   - EN_PROCESO: azul (`bg-blue-100 text-blue-800`)
   - RESUELTO: verde (`bg-green-100 text-green-800`)
   - Formato: `0001-2026 . NUEVO`

2. **Boton crear ticket** (siempre visible, icono Ticket de lucide-react)

### ResponderTicketModal.jsx

#### Campos del Formulario

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Cambiar Estado | Select | Si | En Proceso, Resuelto |
| Respuesta | Textarea | Si | Respuesta o solucion al problema |

### mesaAyudaService.js - Servicio Frontend

```javascript
crearTicket:        apiClient.post(endpoint, data, true)    // auth=true
responderTicket:    apiClient.put(endpoint, data, true)     // auth=true
cambiarEstado:      apiClient.put(endpoint, data, true)     // auth=true
asignarTicket:      apiClient.put(endpoint, data, true)     // auth=true (v1.65.1)
desasignarTicket:   apiClient.put(endpoint, null, true)     // auth=true (v1.65.1)
obtenerPersonalMesaAyuda: apiClient.get(endpoint, true)     // auth=true (v1.65.1)
eliminarTicket:     apiClient.delete(endpoint, true)        // auth=true
```

---

## Motivos Predefinidos (v1.64.0)

| ID | Codigo | Descripcion |
|----|--------|-------------|
| 1 | PS_CITAR_ADICIONAL | Profesional de salud / licenciado solicita citar paciente adicional |
| 2 | PS_ACTUALIZAR_LISTADO | Profesional de salud solicita actualizar listado de pacientes drive / essi |
| 3 | PS_CONTACTAR_PACIENTE | Profesional de salud solicita contactar con el paciente para evitar desercion |
| 4 | PS_ELIMINAR_EXCEDENTE | Profesional de salud solicita eliminar paciente excedente |
| 5 | PS_ENVIAR_ACTO_MEDICO | Profesional de salud solicita enviar por mensaje nro de acto medico / receta / referencia / laboratorio / examenes |
| 6 | PS_ENVIO_IMAGENES | Profesional de salud solicita envio de imagenes / resultados del paciente |
| 7 | PS_CITA_ADICIONAL | Profesional de salud solicita programacion de cita adicional |

---

## Historial de Versiones

### v1.65.2 (2026-02-19) - Rediseno UI + Estados BD + Modal Detalle

- **Nuevo:** Renombrar "Lista de Tickets" a "Tablero de Tickets" con icono Zap y contador
- **Nuevo:** Header tabla color `#0a5ba9` (estandarizado con HeaderCenate), texto blanco mayusculas
- **Nuevo:** Bordes redondeados (`rounded-xl`) y sombra elegante en tabla
- **Nuevo:** Badges de estado con iconos (Clock, PlayCircle, CheckCircle2) y chevron
- **Nuevo:** Columna "Info" con icono Eye al inicio de la tabla
- **Nuevo:** Modal detalle ticket con 3 tarjetas (Solicitante, Descripcion, Paciente)
- **Nuevo:** Dropdown asignacion personal con `position: fixed` (no se corta por overflow)
- **Cambio:** Migracion estados BD: ABIERTO -> NUEVO, CERRADO fusionado con RESUELTO
- **Cambio:** 3 estados finales: NUEVO, EN_PROCESO, RESUELTO (antes 4)
- **Cambio:** Ticket RESUELTO bloqueado (no se puede cambiar estado ni reasignar)
- **Cambio:** Columna "Estado" renombrada a "Estado de Atencion"
- **Cambio:** Boton Refrescar con color estandarizado `#0a5ba9`
- **Migracion:** `V4_6_0__migrar_estados_mesa_ayuda.sql` (CHECK constraint actualizado)

### v1.65.1 (2026-02-19) - Asignacion de Personal

- **Nuevo:** Columnas `id_personal_asignado`, `nombre_personal_asignado`, `fecha_asignacion`
- **Nuevo:** Endpoints asignar/desasignar ticket y listar personal Mesa de Ayuda
- **Nuevo:** Dropdown con avatares para asignar personal desde la tabla
- **Migracion:** `V4_5_0__agregar_personal_asignado_mesa_ayuda.sql`

### v1.65.0 (2026-02-19) - Estado de Tickets en MisPacientes

- **Nuevo:** Badge de estado del ticket en columna "TICKET MESA DE AYUDA"
- **Nuevo:** Mapa `ticketsMedico` (DNI -> ticket mas reciente) con recarga automatica
- **Fix:** `mesaAyudaService.js` - Agregar `auth = true` en POST, PUT, DELETE
- **Fix:** `GestionPacienteServiceImpl.java` - Agregar `idPersonal` al response de `/medico/info`
- **Fix:** `CrearTicketModal.jsx` - `descripcion` usa observaciones o titulo como fallback
- **Fix:** Zona horaria Peru (America/Lima, UTC-5) en todas las fechas

### v1.64.1 (2026-02-18) - Numeracion Automatica

- Numeracion automatica XXXX-YYYY con secuencia anual
- Fix variable `response` no definida en CrearTicketModal

### v1.64.0 (2026-02-18) - Implementacion Inicial

- Crear tickets desde MisPacientes con motivos predefinidos
- ListaTickets con filtros y paginacion
- ResponderTicketModal para personal de mesa
- 3 tablas: tickets, motivos, secuencia

---

## Rutas Frontend

| Ruta | Componente | Rol |
|------|-----------|-----|
| `/mesa-ayuda/tickets` | ListaTickets (Tablero) | MESA_DE_AYUDA |
| `/mesa-ayuda/bienvenida` | BienvenidaMesaAyuda | MESA_DE_AYUDA |
| `/mesa-ayuda/faqs` | FAQsMesaAyuda | MESA_DE_AYUDA |
| `/roles/medico/pacientes` | MisPacientes (columna ticket) | MEDICO |

---

## Proximos Pasos

- **Semaforizacion:** Colorear tickets segun tiempo sin respuesta (verde < 2h, amarillo < 8h, rojo > 8h)
- **Notificaciones:** Alertar al personal de mesa cuando se crea un ticket
- **Historial:** Mostrar historial de tickets por paciente en MisPacientes
- **Dashboard KPIs:** Graficos de tickets por estado, tiempo promedio de respuesta, tickets por medico
- **Exportacion:** Exportar lista de tickets a Excel
