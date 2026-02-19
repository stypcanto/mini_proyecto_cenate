# 🎫 Modulo de Mesa de Ayuda (v1.65.0)

> **Sistema de Telemedicina CENATE - EsSalud Peru**
> **Fecha de Creacion:** 2026-02-18
> **Ultima Actualizacion:** 2026-02-19
> **Version Modulo:** 1.2.0
> **Status:** Production Ready

---

## Descripcion General

El **Modulo de Mesa de Ayuda** permite a los medicos generar tickets de soporte directamente desde su panel de pacientes (MisPacientes), y al personal de Mesa de Ayuda gestionar, responder y dar seguimiento a dichos tickets.

El modulo permite:
- **Medicos:** Crear tickets vinculados a un paciente desde MisPacientes, ver estado del ticket en la columna de la tabla
- **Personal Mesa de Ayuda:** Listar, filtrar, responder y cambiar estado de tickets
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
|  |                  |  |                  |                    |
|  | - Crear ticket   |  | - Listar tickets |                   |
|  | - Ver estado     |  | - Filtrar        |                   |
|  | - Ver numero     |  | - Responder      |                   |
|  |   ticket         |  | - Cambiar estado |                   |
|  +------------------+  +------------------+                   |
|           |                     |                              |
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
Medico (MisPacientes)          Mesa de Ayuda (ListaTickets)
       |                                |
       | 1. Click icono ticket          |
       | 2. Selecciona motivo           |
       | 3. Agrega observaciones        |
       | 4. Click "Crear Ticket"        |
       |-----> POST /tickets ---------> |
       |                                | 5. Ve ticket ABIERTO
       | 6. Badge aparece               | 6. Click "Responder"
       |    en columna                  | 7. Escribe respuesta
       |    (ABIERTO - ambar)           | 8. Cambia estado
       |                                |-----> PUT /tickets/{id}/responder
       | 9. Badge actualiza             |
       |    (RESUELTO - verde)          |
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
| `estado` | VARCHAR | ABIERTO, EN_PROCESO, RESUELTO, CERRADO |
| `prioridad` | VARCHAR | ALTA, MEDIA, BAJA |
| `id_medico` | BIGINT | FK al medico que crea el ticket |
| `nombre_medico` | VARCHAR | Nombre denormalizado del medico |
| `id_solicitud_bolsa` | BIGINT | FK a la solicitud de bolsa del paciente |
| `dni_paciente` | VARCHAR | DNI del paciente |
| `nombre_paciente` | VARCHAR | Nombre denormalizado del paciente |
| `especialidad` | VARCHAR | Especialidad del medico |
| `ipress` | VARCHAR | IPRESS del paciente |
| `respuesta` | TEXT | Respuesta del personal de mesa |
| `id_personal_mesa` | BIGINT | FK al personal que responde |
| `nombre_personal_mesa` | VARCHAR | Nombre de quien responde |
| `numero_ticket` | VARCHAR | Numero unico formato XXXX-YYYY (ej: 0001-2026) |
| `id_motivo` | BIGINT | FK al motivo predefinido |
| `observaciones` | TEXT | Observaciones adicionales del medico |
| `fecha_creacion` | TIMESTAMP | Fecha/hora creacion (hora Peru UTC-5) |
| `fecha_actualizacion` | TIMESTAMP | Fecha/hora ultima actualizacion (hora Peru) |
| `fecha_respuesta` | TIMESTAMP | Fecha/hora de la respuesta (hora Peru) |
| `deleted_at` | TIMESTAMP | Soft delete |

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
ABIERTO -----> EN_PROCESO -----> RESUELTO -----> CERRADO
  (ambar)       (azul)           (verde)         (gris)
```

- **ABIERTO:** Ticket recien creado, pendiente de atencion
- **EN_PROCESO:** Personal de mesa esta trabajando en el ticket
- **RESUELTO:** Ticket atendido y respondido
- **CERRADO:** Ticket finalizado (cerrado permanentemente)

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
  "estado": "ABIERTO",
  "prioridad": "MEDIA",
  "nombreMedico": "Test Doctor 1",
  "dniPaciente": "07888772",
  "nombrePaciente": "ARIAS CUBILLAS MARIA",
  "especialidad": "CARDIOLOGIA",
  "ipress": "CAP II LURIN",
  "respuesta": null,
  "nombrePersonalMesa": null,
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
```

### Zona Horaria

Todas las fechas se registran en **hora Peru (America/Lima, UTC-5)**:

```java
private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

// En @PrePersist y @PreUpdate de la entidad
fechaCreacion = LocalDateTime.now(ZONA_PERU);
fechaActualizacion = LocalDateTime.now(ZONA_PERU);

// En el servicio al responder
ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));

// En el calculo de horas transcurridas
long horas = ChronoUnit.HOURS.between(ticket.getFechaCreacion(), LocalDateTime.now(ZONA_PERU));
```

### Numeracion Automatica de Tickets

Los tickets se numeran con formato `XXXX-YYYY` donde:
- `XXXX` = Secuencial con padding de 4 digitos (0001, 0002, ...)
- `YYYY` = Ano actual (2026)

La secuencia se reinicia cada ano usando la tabla `dim_secuencia_tickets`.

### Seguridad (SecurityConfig)

```java
// Endpoints publicos (sin token):
"/api/mesa-ayuda/motivos"           // Catalogo de motivos
"/api/mesa-ayuda/siguiente-numero"  // Preview numero ticket

// Endpoints autenticados (requieren JWT):
// Todos los demas bajo /api/mesa-ayuda/** via .anyRequest().authenticated()
```

---

## Frontend - Archivos

### Estructura

```
frontend/src/
+-- pages/mesa-ayuda/
|   +-- ListaTickets.jsx                       # Tabla de tickets (Mesa de Ayuda)
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

### MisPacientes.jsx - Integracion con Tickets

#### Estado y Carga de Tickets

```javascript
const [ticketsMedico, setTicketsMedico] = useState({});  // Mapa DNI -> ticket mas reciente

const cargarTicketsMedico = async (idMedico) => {
  const result = await mesaAyudaService.obtenerPorMedico(idMedico, 0, 500);
  const tickets = result?.data?.content || [];
  const mapa = {};
  for (const t of tickets) {
    // Guardar solo el ticket mas reciente por DNI (mayor ID)
    if (t.dniPaciente && (!mapa[t.dniPaciente] || t.id > mapa[t.dniPaciente].id)) {
      mapa[t.dniPaciente] = t;
    }
  }
  setTicketsMedico(mapa);
};
```

#### Columna "TICKET MESA DE AYUDA"

Muestra dos elementos:
1. **Badge de estado** (si existe ticket para el paciente):
   - ABIERTO: ambar (`bg-amber-100 text-amber-800`)
   - EN_PROCESO: azul (`bg-blue-100 text-blue-800`)
   - RESUELTO: verde (`bg-green-100 text-green-800`)
   - CERRADO: gris (`bg-gray-100 text-gray-600`)
   - Formato: `0001-2026 . ABIERTO`

2. **Boton crear ticket** (siempre visible, icono Ticket de lucide-react)

#### Recarga Automatica

Los tickets se recargan en dos momentos:
- Al obtener `doctorInfo` (carga inicial)
- Despues de crear un ticket exitosamente (`onSuccess` del modal)

### ListaTickets.jsx - Vista Mesa de Ayuda

#### Columnas de la Tabla

| Columna | Descripcion |
|---------|-------------|
| ID | Numero incremental (#1, #2, ...) |
| Titulo | Titulo del ticket (truncado con ...) |
| Medico | Nombre del medico que creo el ticket |
| Paciente | Nombre del paciente |
| Estado | Badge con color (ABIERTO, EN_PROCESO, RESUELTO, CERRADO) |
| Prioridad | Badge (ALTA, MEDIA, BAJA) |
| Fecha y Hora | Formato: DD/MM/YYYY, HH:mm (hora Peru) |
| Accion | Boton "Responder" (si ABIERTO/EN_PROCESO) o "Resuelto" verde (si RESUELTO/CERRADO) |

#### Filtros

- **Busqueda:** Por titulo, DNI, medico, paciente
- **Estado:** Todos, Abiertos, En Proceso, Resueltos, Cerrados
- **Prioridad:** Todas, Alta, Media, Baja

### mesaAyudaService.js - Servicio Frontend

Todos los metodos de escritura envian `auth = true` para incluir el token JWT:

```javascript
crearTicket:      apiClient.post(endpoint, data, true)    // auth=true
responderTicket:  apiClient.put(endpoint, data, true)     // auth=true
cambiarEstado:    apiClient.put(endpoint, data, true)     // auth=true
eliminarTicket:   apiClient.delete(endpoint, true)        // auth=true
```

Los metodos GET de catalogo (motivos, siguiente-numero) son publicos y no requieren token.

### CrearTicketModal.jsx - Modal de Creacion

#### Campos del Formulario

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Solicitud a Mesa de Ayuda | Select (combo) | Si | Motivo predefinido |
| Titulo del Ticket | Input (readonly) | Auto | Auto-generado desde motivo |
| Observaciones | Textarea | No | Detalle adicional del medico |
| Prioridad | Select | Si | ALTA, MEDIA (default), BAJA |

#### Datos Pre-cargados

- **Medico:** ID, nombre, especialidad (desde `doctorInfo`)
- **Paciente:** DNI, nombre, IPRESS, idSolicitudBolsa (desde fila de la tabla)
- **Numero ticket:** Preview del siguiente numero (desde API)
- **Motivos:** Lista de motivos activos (desde API)

### ResponderTicketModal.jsx - Modal de Respuesta

#### Informacion Mostrada

- Titulo del ticket con badges (estado actual + prioridad)
- Datos del medico, paciente, IPRESS
- Fecha de creacion y tiempo abierto (horas)
- Descripcion del ticket

#### Campos del Formulario

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Cambiar Estado | Select | Si | En Proceso, Resuelto, Cerrado |
| Respuesta | Textarea | Si | Respuesta o solucion al problema |

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

## Fixes Aplicados

### v1.64.0 (2026-02-18) - Implementacion Inicial

- Crear tickets desde MisPacientes con motivos predefinidos
- Numeracion automatica XXXX-YYYY
- ListaTickets con filtros y paginacion
- ResponderTicketModal para personal de mesa

### v1.64.1 (2026-02-18) - Fix variable response

- Correccion de variable `response` no definida en CrearTicketModal

### v1.65.0 (2026-02-19) - Estado de Tickets en MisPacientes + Fixes Criticos

- **Nuevo:** Badge de estado del ticket en columna "TICKET MESA DE AYUDA"
- **Nuevo:** Mapa `ticketsMedico` (DNI -> ticket mas reciente) con recarga automatica
- **Fix:** `mesaAyudaService.js` - Agregar `auth = true` en POST, PUT, DELETE (el token JWT no se enviaba, causando 403 enmascarado como 404)
- **Fix:** `GestionPacienteServiceImpl.java` - Agregar `idPersonal` al response de `/medico/info` (se necesita para crear tickets)
- **Fix:** `CrearTicketModal.jsx` - `descripcion` usa observaciones o titulo como fallback (evita error `@NotBlank`)
- **Fix:** Zona horaria Peru (America/Lima, UTC-5) en todas las fechas de tickets
- **Fix:** Columna "Fecha y Hora" muestra formato DD/MM/YYYY, HH:mm
- **Fix:** Accion "Resuelto" con boton verde en vez de texto gris "Cerrado"

---

## Rutas Frontend

| Ruta | Componente | Rol |
|------|-----------|-----|
| `/mesa-ayuda/tickets` | ListaTickets | MESA_DE_AYUDA |
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
