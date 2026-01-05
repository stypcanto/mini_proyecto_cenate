# Analisis Tecnico: Sistema de Citas ChatBot CENATE

> **Fecha:** 2025-12-23
> **Version:** 1.0
> **Autor:** Agente Arquitecto
> **Estado:** Analisis Completado

---

## 1. Problema

### Descripcion del Requerimiento

Se requiere integrar un sistema de chatbot para solicitud de citas medicas desarrollado externamente (`chatbot-erick`) al proyecto principal `mini_proyecto_cenate`. El sistema permite a pacientes:

1. **Consultar su informacion** mediante documento de identidad
2. **Ver servicios disponibles** basados en su historial de atenciones
3. **Seleccionar fecha y horario** de cita disponible
4. **Generar solicitud de cita** con confirmacion automatica

### Alcance Funcional

| Funcionalidad | Descripcion |
|---------------|-------------|
| Consulta de paciente | Validar documento, obtener datos y cobertura |
| Historial de atenciones | Mostrar servicios donde fue atendido (CENATE y global) |
| Disponibilidad | Listar fechas y slots horarios por servicio |
| Solicitud de cita | Crear reserva con validacion de conflictos |
| Dashboard reportes | KPIs, busqueda avanzada, graficos |

### Reglas de Negocio Identificadas

1. Solo pacientes con cobertura activa pueden solicitar citas
2. No se permiten citas duplicadas (mismo profesional, fecha, hora)
3. Estado inicial de solicitud: `RESERVADO`
4. Pacientes nuevos vs recurrentes tienen flujos diferenciados
5. Servicios mostrados dependen del historial del paciente

---

## 2. Impacto Arquitectural

### 2.1 Backend (Spring Boot)

#### Componentes YA Integrados

El codigo backend **ya esta integrado** en el proyecto principal:

```
backend/src/main/java/com/styp/cenate/
├── api/chatbot/
│   ├── ChatBotController.java          # Consulta paciente y atenciones
│   ├── DisponibilidadController.java   # API v1 disponibilidad
│   ├── Disponibilidad2Controller.java  # API v2 disponibilidad (recomendada)
│   ├── SolicitudController.java        # CRUD solicitudes
│   ├── EstadoCitaController.java       # Catalogo estados
│   └── CitaDashboardController.java    # Reportes y busqueda
│
├── service/chatbot/
│   ├── IChatBotService.java
│   ├── ChatBotServiceImpl.java
│   ├── solicitudcita/
│   │   ├── ISolicitudCitaService.java
│   │   └── SolicitudCitaServiceImpl.java
│   ├── atenciones/
│   │   ├── IAtencionesServicioCenateService.java
│   │   └── AtencionesServicioCenateServiceImpl.java
│   ├── disponibilidad/
│   │   ├── VwFechasDisponiblesChatbotService.java
│   │   └── VwSlotsDisponiblesChatbotService.java
│   └── reporte/
│       ├── CitaDashboardService.java
│       └── CitaDashboardServiceImpl.java
│
├── model/chatbot/
│   ├── SolicitudCita.java              # Entidad principal
│   ├── DimEstadoCita.java              # Estados de cita
│   ├── VwFechasDisponiblesChatbot.java # Vista fechas
│   └── VwSlotsDisponiblesChatbot.java  # Vista slots
│
├── repository/chatbot/
│   ├── SolicitudCitaRepository.java
│   ├── DimEstadoCitaRepository.java
│   ├── VwFechasDisponiblesChatbotRepository.java
│   └── VwSlotsDisponiblesChatbotRepository.java
│
├── dto/chatbot/
│   ├── SolicitudCitaRequestDTO.java
│   ├── SolicitudCitaResponseDTO.java
│   └── VwFechasDisponiblesChatbotDto.java
│
└── mapper/
    └── SolicitudCitaMapper.java
```

#### Endpoints REST Disponibles

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{doc}` | Consultar paciente |
| GET | `/api/chatbot/atencioncenate?documento=` | Atenciones CENATE |
| GET | `/api/chatbot/atencionglobal/{doc}` | Atenciones globales |
| GET | `/api/v2/chatbot/disponibilidad/servicio?codServicio=` | Fechas disponibles |
| GET | `/api/v2/chatbot/disponibilidad/servicio-detalle?fecha_cita=&cod_servicio=` | Slots horarios |
| POST | `/api/v1/chatbot/solicitud` | Crear solicitud |
| PUT | `/api/v1/chatbot/solicitud/{id}` | Actualizar solicitud |
| PUT | `/api/v1/chatbot/solicitud/estado/{id}` | Cambiar estado |
| GET | `/api/v1/chatbot/solicitud/paciente/{doc}` | Solicitudes del paciente |
| GET | `/api/v1/chatbot/estado-cita` | Catalogo de estados |
| GET | `/api/v1/chatbot/reportes/dashboard/kpis` | KPIs dashboard |
| GET | `/api/v1/chatbot/reportes/citas/buscar` | Busqueda avanzada |

#### Dependencias Verificadas

Todas las dependencias necesarias **ya estan** en `build.gradle`:
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- postgresql
- modelmapper
- lombok

### 2.2 Frontend (React)

#### Estado Actual

El frontend del chatbot existe como **archivos HTML independientes**:

```
chatbot-erick/
├── cita.html       # Interfaz principal (React embebido)
└── busqueda.html   # Dashboard de reportes (React embebido)
```

#### Necesidad de Integracion

Estos archivos **NO estan integrados** al proyecto React principal. Opciones:

| Opcion | Descripcion | Esfuerzo |
|--------|-------------|----------|
| A) Migrar a componentes React | Convertir HTML a componentes `.jsx` | Alto |
| B) Iframe embebido | Cargar HTML existente en iframe | Bajo |
| C) Servir estatico | Exponer HTML como paginas independientes | Minimo |

**Recomendacion:** Opcion A (Migrar a componentes React) para consistencia con el resto del sistema.

#### Estructura Propuesta para Frontend

```
frontend/src/
├── pages/chatbot/
│   ├── ChatbotCita.jsx           # Wizard de 3 pasos
│   ├── ChatbotBusqueda.jsx       # Dashboard reportes
│   └── components/
│       ├── PacienteForm.jsx      # Paso 1
│       ├── ServicioSelector.jsx  # Paso 2a
│       ├── DisponibilidadGrid.jsx# Paso 2b
│       ├── ConfirmacionCita.jsx  # Paso 3
│       ├── KpiCards.jsx          # Dashboard KPIs
│       └── CitasTable.jsx        # Tabla resultados
│
├── services/
│   └── chatbotService.js         # API calls chatbot
│
└── hooks/
    └── useChatbot.js             # Estado del wizard
```

### 2.3 Base de Datos (PostgreSQL)

#### Objetos Requeridos

| Tipo | Nombre | Estado |
|------|--------|--------|
| Tabla | `solicitud_cita` | **Verificar existencia** |
| Tabla | `dim_estado_cita` | **Verificar existencia** |
| Vista | `vw_fechas_disponibles_chatbot` | **Verificar existencia** |
| Vista | `vw_slots_disponibles_chatbot` | **Verificar existencia** |
| Vista | `vw_solicitud_cita_det` | **Verificar existencia** |

#### Esquema de Tabla `solicitud_cita`

```sql
CREATE TABLE solicitud_cita (
    id_solicitud        BIGSERIAL PRIMARY KEY,
    periodo             VARCHAR(6) NOT NULL,        -- YYYYMM
    fecha_cita          DATE NOT NULL,
    hora_cita           TIME NOT NULL,
    doc_paciente        VARCHAR(12) NOT NULL,
    nombres_paciente    VARCHAR(200),
    sexo                CHAR(1),
    edad                INTEGER,
    telefono            VARCHAR(12),
    fecha_solicitud     TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualiza     TIMESTAMPTZ DEFAULT NOW(),
    observacion         TEXT,
    id_estado_cita      BIGINT REFERENCES dim_estado_cita(id_estado),
    id_pers             BIGINT REFERENCES dim_personal_cnt(id_pers),
    id_area_hosp        BIGINT REFERENCES dim_area_hospitalaria(id_area_hosp),
    id_servicio         BIGINT REFERENCES dim_servicio_essi(id_servicio),
    id_actividad        INTEGER REFERENCES dim_actividad_essi(id_actividad),
    id_subactividad     INTEGER REFERENCES dim_subactividad_essi(id_subactividad)
);

-- Indices recomendados
CREATE INDEX idx_solicitud_doc_paciente ON solicitud_cita(doc_paciente);
CREATE INDEX idx_solicitud_fecha ON solicitud_cita(fecha_cita);
CREATE INDEX idx_solicitud_estado ON solicitud_cita(id_estado_cita);
CREATE INDEX idx_solicitud_personal_fecha_hora ON solicitud_cita(id_pers, fecha_cita, hora_cita);
```

#### Esquema de Tabla `dim_estado_cita`

```sql
CREATE TABLE dim_estado_cita (
    id_estado       BIGSERIAL PRIMARY KEY,
    estado          VARCHAR(50) NOT NULL UNIQUE,
    descripcion     VARCHAR(200)
);

-- Datos iniciales
INSERT INTO dim_estado_cita (estado, descripcion) VALUES
('PENDIENTE', 'Solicitud creada, pendiente de revision'),
('RESERVADO', 'Cita reservada, esperando confirmacion'),
('CONFIRMADA', 'Cita confirmada por el paciente'),
('CANCELADA', 'Cita cancelada'),
('NO_PRESENTADO', 'Paciente no se presento'),
('ATENDIDO', 'Paciente fue atendido');
```

---

## 3. Propuesta de Solucion

### Arquitectura de Integracion

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND REACT                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ App.js (Router)                                             ││
│  │   ├── /chatbot/cita      → ChatbotCita.jsx                 ││
│  │   └── /chatbot/busqueda  → ChatbotBusqueda.jsx             ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ chatbotService.js                                           ││
│  │   - consultarPaciente(documento)                            ││
│  │   - obtenerDisponibilidad(codServicio)                      ││
│  │   - obtenerSlots(fecha, codServicio)                        ││
│  │   - crearSolicitud(data)                                    ││
│  │   - buscarCitas(filtros)                                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SPRING BOOT                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Controllers (api/chatbot/)                                  ││
│  │   └── ChatBotController, SolicitudController, etc.          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Services (service/chatbot/)                                 ││
│  │   └── ChatBotServiceImpl, SolicitudCitaServiceImpl          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Repositories (repository/chatbot/)                          ││
│  │   └── SolicitudCitaRepository, VwFechasRepository           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       POSTGRESQL                                │
│   ┌──────────────────┐  ┌──────────────────────────────────┐   │
│   │ solicitud_cita   │  │ vw_fechas_disponibles_chatbot    │   │
│   │ dim_estado_cita  │  │ vw_slots_disponibles_chatbot     │   │
│   └──────────────────┘  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Principios de Diseno

1. **Separacion de capas:** Controller → Service → Repository
2. **DTOs:** Nunca exponer entidades JPA directamente
3. **Validacion:** Jakarta Validation en DTOs + validacion de negocio en Services
4. **Inmutabilidad:** Vistas de BD como entidades @Immutable
5. **Consistencia:** Seguir patrones existentes del proyecto

---

## 4. Plan de Implementacion

### Fase 1: Verificacion de Base de Datos

**Objetivo:** Confirmar que todos los objetos de BD existen y funcionan

#### Tareas:

1. **Verificar tabla `solicitud_cita`**
   - Confirmar estructura y constraints
   - Validar FK a tablas relacionadas

2. **Verificar tabla `dim_estado_cita`**
   - Confirmar datos iniciales cargados

3. **Verificar vistas**
   - `vw_fechas_disponibles_chatbot`
   - `vw_slots_disponibles_chatbot`
   - `vw_solicitud_cita_det`

4. **Crear indices si no existen**

#### Comandos de verificacion:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('solicitud_cita', 'dim_estado_cita');

-- Verificar vistas
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%chatbot%';

-- Verificar estados
SELECT * FROM dim_estado_cita;
```

---

### Fase 2: Pruebas de Backend

**Objetivo:** Validar que los endpoints funcionan correctamente

#### Tareas:

1. **Iniciar backend**
   ```bash
   cd backend && ./gradlew bootRun
   ```

2. **Probar endpoint de paciente**
   ```bash
   curl http://localhost:8080/api/chatbot/documento/44914706
   ```

3. **Probar disponibilidad**
   ```bash
   curl "http://localhost:8080/api/v2/chatbot/disponibilidad/servicio?codServicio=AM3"
   ```

4. **Probar creacion de solicitud**
   ```bash
   curl -X POST http://localhost:8080/api/v1/chatbot/solicitud \
     -H "Content-Type: application/json" \
     -d '{
       "periodo": "202512",
       "docPaciente": "44914706",
       "telefono": "999888777",
       "fechaCita": "2025-12-26",
       "horaCita": "09:00:00",
       "idServicio": 82,
       "idActividad": 6,
       "idSubactividad": 472,
       "idAreaHospitalaria": 1,
       "idPersonal": 171
     }'
   ```

5. **Verificar Swagger UI**
   - Acceder a: http://localhost:8080/swagger-ui.html

---

### Fase 3: Integracion Frontend

**Objetivo:** Migrar interfaces HTML a componentes React

#### Tareas:

1. **Crear servicio API**
   - Archivo: `frontend/src/services/chatbotService.js`
   - Funciones: consultarPaciente, obtenerDisponibilidad, crearSolicitud, etc.

2. **Crear pagina ChatbotCita.jsx**
   - Wizard de 3 pasos
   - Estado manejado con useState/useReducer
   - Integracion con chatbotService

3. **Crear pagina ChatbotBusqueda.jsx**
   - Dashboard con KPIs
   - Tabla de resultados paginada
   - Filtros de busqueda

4. **Agregar rutas en App.js**
   ```jsx
   <Route path="/chatbot/cita" element={<ChatbotCita />} />
   <Route path="/chatbot/busqueda" element={<ChatbotBusqueda />} />
   ```

5. **Agregar menu en DynamicSidebar.jsx**
   - Seccion: "Chatbot Citas"
   - Items: "Solicitar Cita", "Buscar Citas"

---

### Fase 4: Seguridad y Permisos

**Objetivo:** Configurar acceso MBAC si es necesario

#### Consideraciones:

| Endpoint | Acceso |
|----------|--------|
| `/api/chatbot/*` | Publico (pacientes externos) |
| `/api/v1/chatbot/reportes/*` | Restringido (ADMIN, COORDINADOR) |

#### Tareas:

1. **Configurar SecurityConfig.java**
   - Permitir acceso publico a endpoints de paciente
   - Proteger endpoints de reportes

2. **Agregar permisos MBAC (si aplica)**
   - Pagina: `/chatbot/busqueda`
   - Acciones: `ver`, `exportar`

---

### Fase 5: Testing y QA

**Objetivo:** Validar funcionamiento end-to-end

#### Tareas:

1. **Pruebas manuales**
   - Flujo completo de solicitud de cita
   - Busqueda y filtrado de citas
   - Casos de error (paciente no existe, horario ocupado)

2. **Pruebas con datos reales**
   - Usar credenciales de prueba: `44914706` / `@Cenate2025`
   - Validar datos de paciente retornados

3. **Pruebas de carga (opcional)**
   - Verificar rendimiento de vistas de disponibilidad

---

## 5. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Vistas de BD no existen | Media | Alto | Solicitar scripts DDL al DBA |
| Datos de prueba insuficientes | Baja | Medio | Crear datos de prueba |
| Conflictos de CORS | Baja | Bajo | Ya configurado en properties |
| Performance en disponibilidad | Media | Medio | Verificar indices en vistas |

---

## 6. Dependencias Externas

| Dependencia | Responsable | Estado |
|-------------|-------------|--------|
| Scripts DDL de vistas | DBA | Pendiente verificar |
| Datos en dim_estado_cita | DBA | Pendiente verificar |
| Configuracion de servicios | Administrador | Pendiente verificar |

---

## 7. Checklist de Validacion

- [ ] Tabla `solicitud_cita` existe y tiene estructura correcta
- [ ] Tabla `dim_estado_cita` existe con datos iniciales
- [ ] Vista `vw_fechas_disponibles_chatbot` existe y retorna datos
- [ ] Vista `vw_slots_disponibles_chatbot` existe y retorna datos
- [ ] Backend inicia sin errores
- [ ] Swagger UI accesible
- [ ] Endpoint consulta paciente funciona
- [ ] Endpoint disponibilidad retorna datos
- [ ] Endpoint crear solicitud funciona
- [ ] Frontend React integrado con rutas
- [ ] Menu lateral actualizado
- [ ] Permisos configurados (si aplica)

---

## 8. Proximos Pasos Inmediatos

1. **Verificar objetos de BD** - Ejecutar queries de verificacion
2. **Probar backend** - Iniciar y probar endpoints con curl/Postman
3. **Migrar frontend** - Convertir cita.html a componente React
4. **Integrar al sistema** - Agregar rutas y menu

---

## 9. Archivos Creados (Fase 3 y 4)

### Frontend React

| Archivo | Descripcion |
|---------|-------------|
| `frontend/src/services/chatbotService.js` | Servicio API para endpoints del chatbot |
| `frontend/src/pages/chatbot/ChatbotCita.jsx` | Wizard de 3 pasos para solicitar citas |
| `frontend/src/pages/chatbot/ChatbotBusqueda.jsx` | Dashboard con KPIs, filtros y tabla |

### Rutas Agregadas en App.js

```jsx
// Rutas del ChatBot
<Route path="/chatbot/cita" element={<ChatbotCita />} />
<Route path="/chatbot/busqueda" element={<ChatbotBusqueda />} />
```

### Iconos Agregados en DynamicSidebar.jsx

```javascript
// Nuevos iconos para el menu
'MessageSquare': MessageSquare,
'Bot': Bot,
```

### Script SQL para Menu Dinamico

| Archivo | Descripcion |
|---------|-------------|
| `spec/sql/chatbot_menu_setup.sql` | Script para agregar modulo y permisos en BD |

---

*Documento generado por Agente Arquitecto - Sistema CENATE*
