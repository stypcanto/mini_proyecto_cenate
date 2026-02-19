# 🎧 Implementación: Módulo Mesa de Ayuda - v1.64.0 (2026-02-18)

## ✅ COMPLETADO

### 1. **Fase 1: Base de Datos (SQL)**
Archivo SQL creado: `spec/database/06_scripts/2026-02-18_crear_modulo_mesa_ayuda.sql`

**Pasos a ejecutar:**

```bash
# 1. Conectarse a la base de datos PostgreSQL
psql -U usuario -d nombre_bd -h localhost

# 2. Ejecutar el script SQL
\i 'spec/database/06_scripts/2026-02-18_crear_modulo_mesa_ayuda.sql'

# 3. Verificar que la tabla se creó
SELECT * FROM dim_ticket_mesa_ayuda LIMIT 1;

# 4. Verificar que el módulo se insertó
SELECT id, nombre_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Mesa de Ayuda';
```

**IMPORTANTE:** Después de obtener el ID del módulo Mesa de Ayuda (ID_MODULO), ejecutar:

```sql
-- Insertar páginas del módulo (REEMPLAZA ID_MODULO con el valor real)
INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
SELECT ID_MODULO, 'Bienvenida', '/mesa-ayuda/bienvenida', 'Home', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/bienvenida'
);

INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
SELECT ID_MODULO, 'Lista de Tickets', '/mesa-ayuda/tickets', 'ListChecks', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/tickets'
);

INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
SELECT ID_MODULO, 'FAQs', '/mesa-ayuda/faqs', 'HelpCircle', true, 3
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/faqs'
);
```

---

### 2. **Fase 2: Backend (Spring Boot)**

#### 2.1 Entidades JPA
✅ Creado: `backend/src/main/java/com/styp/cenate/model/mesaayuda/TicketMesaAyuda.java`
- Entidad completa con ciclos de vida (PrePersist, PreUpdate)
- 16 campos incluyendo soft-delete

#### 2.2 DTOs
✅ Creados:
- `backend/src/main/java/com/styp/cenate/dto/mesaayuda/TicketMesaAyudaRequestDTO.java` - Para crear tickets
- `backend/src/main/java/com/styp/cenate/dto/mesaayuda/TicketMesaAyudaResponseDTO.java` - Para responder (GET/PUT)
- `backend/src/main/java/com/styp/cenate/dto/mesaayuda/ResponderTicketDTO.java` - Para responder tickets

#### 2.3 Repository
✅ Creado: `backend/src/main/java/com/styp/cenate/repository/mesaayuda/TicketMesaAyudaRepository.java`
- 12 métodos de consulta
- Soporte para filtros por estado, prioridad, médico, rango de fechas
- Métodos para estadísticas y KPIs

#### 2.4 Service
✅ Creado: `backend/src/main/java/com/styp/cenate/service/mesaayuda/TicketMesaAyudaService.java`
- Lógica de negocio completa
- Métodos para: crear, obtener, responder, cambiar estado, eliminar, obtener KPIs
- Manejo de transacciones
- Cálculo de campos derivados (horasDesdeCreacion)

#### 2.5 Controller
✅ Creado: `backend/src/main/java/com/styp/cenate/controller/mesaayuda/TicketMesaAyudaController.java`
- 8 endpoints REST:
  - `POST /api/mesa-ayuda/tickets` - Crear ticket
  - `GET /api/mesa-ayuda/tickets` - Listar con paginación
  - `GET /api/mesa-ayuda/tickets/{id}` - Obtener por ID
  - `GET /api/mesa-ayuda/tickets/medico/{idMedico}` - Tickets del médico
  - `GET /api/mesa-ayuda/tickets/activos` - Tickets activos
  - `PUT /api/mesa-ayuda/tickets/{id}/responder` - Responder ticket
  - `PUT /api/mesa-ayuda/tickets/{id}/estado` - Cambiar estado
  - `DELETE /api/mesa-ayuda/tickets/{id}` - Eliminar (soft-delete)
  - `GET /api/mesa-ayuda/kpis` - Obtener KPIs
- Manejo de excepciones
- Validación de datos

---

### 3. **Fase 3: Frontend**

#### 3.1 Servicio API
✅ Creado: `frontend/src/services/mesaAyudaService.js`
- Métodos para todos los endpoints del backend
- Manejo de parámetros de paginación y filtros

#### 3.2 Componentes
✅ Creados:

**Modales:**
- `frontend/src/pages/mesa-ayuda/components/CrearTicketModal.jsx` - Para crear tickets
  - Pre-carga datos del médico y paciente
  - Campos: Título, Descripción, Prioridad
  - Validaciones en cliente
  - Estados: ABIERTO

- `frontend/src/pages/mesa-ayuda/components/ResponderTicketModal.jsx` - Para responder
  - Muestra detalles completos del ticket
  - Campo de respuesta
  - Cambio de estado (EN_PROCESO, RESUELTO, CERRADO)
  - Información de médico y paciente

**Páginas:**
- `frontend/src/pages/mesa-ayuda/BienvenidaMesaAyuda.jsx` - Página de bienvenida
  - 5 KPI Cards: Total, Abiertos, En Proceso, Resueltos, Tasa Resolución
  - Tabla de tickets recientes
  - Navegación a lista completa

- `frontend/src/pages/mesa-ayuda/ListaTickets.jsx` - Página principal
  - Tabla completa de tickets con paginación
  - Filtros por: Estado, Prioridad, Búsqueda (título, DNI, médico, paciente)
  - Botones de acción: Responder
  - Badges de colores por estado y prioridad
  - Integración con modal ResponderTicketModal

- `frontend/src/pages/mesa-ayuda/FAQsMesaAyuda.jsx` - Página de FAQs
  - 10 preguntas frecuentes
  - Acordeón expandible
  - Sección de contacto

#### 3.3 Integración en MisPacientes.jsx
✅ Modificado: `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
- Agregado import de `HelpCircle` de lucide-react
- Agregado import del `CrearTicketModal`
- Agregados 2 estados de control: `showTicketModal`, `pacienteTicket`
- Agregado botón azul de ayuda junto al botón de ver detalles
- Al hacer clic abre el modal para crear ticket con datos pre-cargados

#### 3.4 Registro de Rutas
✅ Modificado: `frontend/src/config/componentRegistry.js`
- Agregadas 3 rutas:
  - `/mesa-ayuda/bienvenida` → BienvenidaMesaAyuda
  - `/mesa-ayuda/tickets` → ListaTickets
  - `/mesa-ayuda/faqs` → FAQsMesaAyuda

#### 3.5 Icono en Sidebar
✅ Verificado: `frontend/src/components/DynamicSidebar.jsx`
- Ya existe mapeo para "ayuda" → Headphones (línea 751)
- El módulo "Mesa de Ayuda" mostrará automáticamente el icono correcto

---

## 🚀 PRÓXIMOS PASOS

### Paso 1: Ejecutar SQL en la BD
```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate
psql -U usuario -d nombre_bd < spec/database/06_scripts/2026-02-18_crear_modulo_mesa_ayuda.sql
```

### Paso 2: Compilar Backend (Opcional, ya compilado)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

### Paso 3: Iniciar Frontend
```bash
cd frontend
npm start
```

### Paso 4: Verificación Manual
1. **Navegar a Módulo Mesa de Ayuda:**
   - URL: http://localhost:3000/mesa-ayuda/bienvenida
   - Debería mostrar KPIs (inicialmente vacíos)

2. **Crear un Ticket desde MisPacientes:**
   - URL: http://localhost:3000/roles/medico/pacientes
   - Haz clic en el icono azul de ayuda junto a un paciente
   - Completa el formulario y envía
   - El ticket debería aparecer en `/mesa-ayuda/tickets`

3. **Responder Ticket:**
   - Ve a `/mesa-ayuda/tickets`
   - Haz clic en "Responder" en una fila
   - Completa la respuesta y selecciona estado
   - El ticket debería actualizarse

4. **Verificar KPIs:**
   - Regresa a `/mesa-ayuda/bienvenida`
   - Los KPIs deberían mostrar los datos actualizados

---

## 📊 Endpoints API Disponibles

### Crear Ticket (MEDICO)
```
POST /api/mesa-ayuda/tickets
Content-Type: application/json

{
  "titulo": "Error al cargar paciente",
  "descripcion": "No puedo cargar datos del paciente",
  "prioridad": "ALTA",
  "idMedico": 1,
  "nombreMedico": "Dr. Juan Pérez",
  "idSolicitudBolsa": 123,
  "dniPaciente": "12345678",
  "nombrePaciente": "Juan Doe",
  "especialidad": "Cardiología",
  "ipress": "Hospital Central"
}
```

### Obtener Todos los Tickets (MESA_DE_AYUDA)
```
GET /api/mesa-ayuda/tickets?page=0&size=20&estado=ABIERTO
```

### Responder Ticket (MESA_DE_AYUDA)
```
PUT /api/mesa-ayuda/tickets/1/responder
Content-Type: application/json

{
  "respuesta": "El problema fue resuelto. Intenta recargar la página.",
  "estado": "RESUELTO",
  "idPersonalMesa": 5,
  "nombrePersonalMesa": "María García"
}
```

### Obtener KPIs
```
GET /api/mesa-ayuda/kpis
```

Respuesta:
```json
{
  "totalTickets": 15,
  "ticketsAbiertos": 3,
  "ticketsEnProceso": 5,
  "ticketsResueltos": 6,
  "ticketsCerrados": 1,
  "tasaResolucion": 40.0
}
```

---

## 🔐 Control de Acceso (MBAC)

El acceso está controlado a través de las páginas registradas en `dim_paginas_sistema`:
- **Médicos:** Pueden ver el botón "Crear Ticket" en MisPacientes
- **Mesa de Ayuda:** Pueden ver `/mesa-ayuda/tickets` y responder
- **SuperAdmin:** Control total

Configurar en MBAC si es necesario:
- Rol `MESA_DE_AYUDA` con permisos en `/mesa-ayuda/*`
- Rol `MEDICO` con permisos en `/roles/medico/*`

---

## 📝 Estados del Ticket

| Estado | Descripción | Quién cambia | Color |
|--------|-------------|-------------|-------|
| **ABIERTO** | Recién creado, sin respuesta | Sistema | 🔴 Rojo |
| **EN_PROCESO** | Mesa de Ayuda está trabajando | Mesa de Ayuda | 🟡 Amarillo |
| **RESUELTO** | Problema solucionado | Mesa de Ayuda | 🟢 Verde |
| **CERRADO** | Ticket finalizado | Mesa de Ayuda | ⚪ Gris |

---

## 🔍 Campos de Ticket

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | BIGSERIAL | Sí | ID único |
| titulo | VARCHAR(255) | Sí | Título del ticket |
| descripcion | TEXT | Sí | Descripción detallada |
| estado | VARCHAR(50) | Sí | Estado del ticket |
| prioridad | VARCHAR(20) | Sí | Prioridad (ALTA, MEDIA, BAJA) |
| id_medico | BIGINT | No | ID del médico que creó |
| nombre_medico | VARCHAR(255) | No | Nombre del médico (denormalizado) |
| id_solicitud_bolsa | BIGINT | No | Referencia a bolsa |
| dni_paciente | VARCHAR(15) | No | DNI del paciente |
| nombre_paciente | VARCHAR(255) | No | Nombre del paciente |
| especialidad | VARCHAR(255) | No | Especialidad médica |
| ipress | VARCHAR(255) | No | IPRESS del paciente |
| respuesta | TEXT | No | Respuesta de Mesa de Ayuda |
| id_personal_mesa | BIGINT | No | ID de quien respondió |
| nombre_personal_mesa | VARCHAR(255) | No | Nombre de quien respondió |
| fecha_creacion | TIMESTAMP | Sí | Cuándo se creó |
| fecha_actualizacion | TIMESTAMP | Sí | Última actualización |
| fecha_respuesta | TIMESTAMP | No | Cuándo se respondió |
| deleted_at | TIMESTAMP | No | Soft-delete |

---

## 🐛 Troubleshooting

### Problema: "Módulo Mesa de Ayuda no aparece en el sidebar"
**Solución:** Verificar que el módulo está en `dim_modulos_sistema` con `activo = true`

### Problema: "Botón de crear ticket no aparece en MisPacientes"
**Solución:** Verificar que `HelpCircle` está importado en MisPacientes.jsx

### Problema: "Error al crear ticket: 400 Bad Request"
**Solución:** Verificar que `idMedico` está siendo enviado correctamente desde el frontend

### Problema: "Modal no abre al clic"
**Solución:** Verificar que el estado `showTicketModal` se está seteando correctamente

---

## 📋 Checklist de Verificación

- [ ] Tabla `dim_ticket_mesa_ayuda` creada en BD
- [ ] Módulo insertado en `dim_modulos_sistema`
- [ ] Páginas insertadas en `dim_paginas_sistema`
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] Rutas registradas en componentRegistry.js
- [ ] Botón de ayuda visible en MisPacientes
- [ ] Modal de crear ticket abre correctamente
- [ ] Ticket se crea y aparece en `/mesa-ayuda/tickets`
- [ ] Responder ticket actualiza estado correctamente
- [ ] KPIs se calculan correctamente
- [ ] FAQs se muestran correctamente
- [ ] Paginación funciona en ListaTickets
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda funciona (título, DNI, médico, paciente)
- [ ] Soft-delete funciona (no elimina físicamente)

---

## 🎯 Versión

- **v1.64.0** - Módulo Mesa de Ayuda (2026-02-18)
- **Última actualización:** 2026-02-18

---

## 👨‍💻 Desarrollador

- **Implementado por:** Claude Code (IA Assistant)
- **Basado en plan:** Plan: Módulo Mesa de Ayuda - CENATE
- **Proyecto:** CENATE - Sistema de Telemedicina

---

**¡Implementación completada! 🚀**
