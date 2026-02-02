# 📋 Módulo de Gestión de Citas v1.42.0

> **Gestión de Pacientes Asignados - Frontend**
> **Versión:** v1.42.0 (con Auditoría de Cambios de Estado)
> **Estado:** ✅ Producción
> **Última actualización:** 2026-02-02

---

## 📌 Descripción General

Módulo completo para gestionar pacientes asignados y citas en el sistema CENATE. Permite a usuarios con rol **GESTOR DE CITAS** visualizar, actualizar estados y gestionar información de contacto de pacientes.

## 🎯 Funcionalidades Principales

### 1. ✅ Visualización de Pacientes Asignados
- **Ubicación:** `/citas/gestion-asegurado`
- **Endpoint:** `GET /api/bolsas/solicitudes/mi-bandeja`
- **Datos mostrados:**
  - DNI del paciente
  - Nombre completo
  - Edad, género
  - Especialidad médica
  - IPRESS (institución prestadora)
  - Tipo de cita
  - Teléfono y WhatsApp
  - Estado actual de la cita
  - Fecha de asignación

### 2. ✅ Dropdown de Estados (11 opciones)
**Endpoint:** `PATCH /api/bolsas/solicitudes/{id}/estado?nuevoEstadoCodigo={CODIGO}`

**Estados disponibles:**
```
✓ PENDIENTE_CITA    - Paciente nuevo que ingresó a la bolsa
✓ CITADO            - Paciente agendado para atención
✓ ATENDIDO_IPRESS   - Paciente recibió atención en institución
✓ NO_CONTESTA       - Paciente no responde a las llamadas
✓ NO_DESEA          - Paciente rechaza la atención
✓ APAGADO           - Teléfono del paciente apagado
✓ TEL_SIN_SERVICIO  - Línea telefónica sin servicio
✓ NUM_NO_EXISTE     - Teléfono registrado no existe
✓ SIN_VIGENCIA      - Seguro del paciente no vigente
✓ HC_BLOQUEADA      - Historia clínica bloqueada en sistema
✓ REPROG_FALLIDA    - No se pudo reprogramar la cita
```

**Características:**
- Dropdown interactivo en la columna "Estado"
- Actualización en tiempo real
- Refresco automático de datos tras cambio
- Validación de permisos GESTOR DE CITAS
- Toast de confirmación

### 3. ✅ Modal de Actualizar Teléfono
**Endpoint:** `PATCH /api/bolsas/solicitudes/{id}/actualizar-telefonos`

**Campos:**
- Teléfono Principal (requerido si no hay alterno)
- Teléfono Alterno (requerido si no hay principal)
- Validación: al menos uno obligatorio

**Características:**
- Modal modal con datos del paciente
- Campos pre-poblados con valores actuales
- Botones Cancelar y Guardar
- Toast de confirmación
- Refresco de tabla tras guardar

---

## 🏗️ Arquitectura Frontend

### Ubicación del componente:
```
frontend/src/pages/roles/citas/GestionAsegurado.jsx
```

### Estados principales:
```javascript
const [pacientesAsignados, setPacientesAsignados] = useState([]);
const [modalTelefono, setModalTelefono] = useState({
  visible: false,
  paciente: null,
  telefonoPrincipal: "",
  telefonoAlterno: "",
  saving: false
});
const [estadoEditando, setEstadoEditando] = useState(null);
const [nuevoEstado, setNuevoEstado] = useState("");
```

### Funciones clave:
```javascript
// Obtener pacientes asignados
fetchPacientesAsignados()

// Abrir/cerrar modal de teléfono
abrirModalTelefono(paciente)
cerrarModalTelefono()

// Guardar teléfono
guardarTelefono()

// Actualizar estado de cita
actualizarEstado(pacienteId, nuevoEstadoCodigo)
```

### Importaciones críticas:
```javascript
import { getToken } from "../../../constants/auth";  // Token desde auth.token
import { Edit2, ChevronDown } from "lucide-react";   // Icons
import toast from "react-hot-toast";                  // Notificaciones
```

---

## 🛠️ Arquitectura Backend

### Entidades JPA:
**DimEstadosGestionCitas.java**
```java
@Entity
@Table(name = "dim_estados_gestion_citas")
public class DimEstadosGestionCitas {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita")
    private Long idEstado;

    @Column(name = "cod_estado_cita", unique = true)
    private String codigoEstado;

    @Column(name = "desc_estado_cita")
    private String descripcionEstado;

    @Column(name = "stat_estado_cita")
    private String statusEstado;
}
```

### Repositorio:
**DimEstadosGestionCitasRepository.java**
```java
@Repository
public interface DimEstadosGestionCitasRepository
    extends JpaRepository<DimEstadosGestionCitas, Long> {
    Optional<DimEstadosGestionCitas> findByCodigoEstado(String codigoEstado);
    List<DimEstadosGestionCitas> findByStatusEstado(String statusEstado);
}
```

### Endpoints:

#### 1. Obtener pacientes asignados
```
GET /api/bolsas/solicitudes/mi-bandeja
Autorización: JWT Token (GESTOR DE CITAS)
Respuesta: {
  "total": 1,
  "solicitudes": [{
    "id_solicitud": 9916,
    "paciente_nombre": "MAMANI CCOSI DIEGO JESUS",
    "paciente_dni": "46183586",
    "especialidad": "NEUROLOGIA",
    "desc_ipress": "CAP III SURQUILLO",
    "paciente_telefono": "987654321",
    "desc_estado_cita": "PENDIENTE",
    ...
  }],
  "mensaje": "Se encontraron 1 solicitud(es) asignada(s)"
}
```

#### 2. Cambiar estado de cita
```
PATCH /api/bolsas/solicitudes/{id}/estado?nuevoEstadoCodigo=CITADO
Autorización: GESTOR DE CITAS, COORDINADOR GESTION DE CITAS, ADMIN, SUPERADMIN
Respuesta: {
  "mensaje": "Estado actualizado exitosamente",
  "idSolicitud": 9916,
  "nuevoEstadoCodigo": "CITADO",
  "nuevoEstadoId": 2
}
```

#### 3. Actualizar teléfono
```
PATCH /api/bolsas/solicitudes/{id}/actualizar-telefonos
Content-Type: application/json
Body: {
  "pacienteTelefono": "987654321",
  "pacienteTelefonoAlterno": "912345678"
}
Respuesta: {
  "mensaje": "Teléfonos actualizados correctamente",
  "solicitud": {
    "idSolicitud": 9916,
    "pacienteTelefono": "987654321",
    "pacienteTelefonoAlterno": "912345678"
  }
}
```

---

## 🔐 Seguridad y Autorización

### Roles permitidos:
- ✓ SUPERADMIN - Acceso completo
- ✓ ADMIN - Acceso completo
- ✓ COORDINADOR GESTION DE CITAS - Cambiar estados
- ✓ GESTOR DE CITAS - Ver y actualizar sus pacientes

### Validaciones:
```java
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR GESTION DE CITAS', 'GESTOR DE CITAS')")
public ResponseEntity<?> cambiarEstado(Long id, String nuevoEstadoCodigo)
```

### Token:
- Se obtiene desde `localStorage` con clave `auth.token`
- Se envía en header: `Authorization: Bearer {TOKEN}`
- Validación en cada request

---

## 📊 Base de Datos

### Tabla: dim_estados_gestion_citas
```sql
CREATE TABLE dim_estados_gestion_citas (
  id_estado_cita BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  cod_estado_cita TEXT NOT NULL UNIQUE,
  desc_estado_cita TEXT NOT NULL,
  stat_estado_cita TEXT NOT NULL DEFAULT 'A',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Datos:
INSERT INTO dim_estados_gestion_citas (cod_estado_cita, desc_estado_cita, stat_estado_cita) VALUES
  ('CITADO', 'Citado - Paciente agendado para atención', 'A'),
  ('ATENDIDO_IPRESS', 'Atendido por IPRESS - Paciente recibió atención en institución', 'A'),
  ('NO_CONTESTA', 'No contesta - Paciente no responde a las llamadas', 'A'),
  ('SIN_VIGENCIA', 'Sin vigencia de Seguro - Seguro del paciente no vigente', 'A'),
  ('APAGADO', 'Apagado - Teléfono del paciente apagado', 'A'),
  ('NO_DESEA', 'No desea - Paciente rechaza la atención', 'A'),
  ('REPROG_FALLIDA', 'Reprogramación Fallida - No se pudo reprogramar la cita', 'A'),
  ('NUM_NO_EXISTE', 'Número no existe - Teléfono registrado no existe', 'A'),
  ('HC_BLOQUEADA', 'Historia clínica bloqueada - HC del paciente bloqueada en sistema', 'A'),
  ('TEL_SIN_SERVICIO', 'Teléfono sin servicio - Línea telefónica sin servicio', 'A'),
  ('PENDIENTE_CITA', 'Paciente nuevo que ingresó a la bolsa', 'A');
```

---

## 🐛 Fixes Realizados

### Issue 1: Token no se encontraba
**Problema:** Frontend buscaba `localStorage.getItem("token")`
**Solución:** Usar `getToken()` desde `constants/auth` que busca en `auth.token`

### Issue 2: Estado endpoint no encontraba rol
**Problema:** `@PreAuthorize("hasAnyRole('GESTOR_DE_CITAS')")`
**Solución:** Cambiar a `'GESTOR DE CITAS'` (con espacios, como en base de datos)

### Issue 3: Mismatch en parámetros
**Problema:** Frontend enviaba body JSON, backend esperaba query parameter
**Solución:** Cambiar a `?nuevoEstadoCodigo=...` en URL

### Issue 4: Código estado vs ID
**Problema:** Frontend enviaba código (CITADO), backend esperaba ID (2)
**Solución:** Backend busca el ID por código en `DimEstadosGestionCitasRepository`

---

## 📱 Testing

### Flujo de prueba:
1. Navegar a `/citas/gestion-asegurado`
2. Ver paciente asignado: MAMANI CCOSI DIEGO JESUS
3. Hacer clic en dropdown "Estado"
4. Seleccionar estado: SIN_VIGENCIA
5. Verificar en logs: "Estado actualizado en solicitud..."
6. Hacer clic en botón "📱 Teléfono"
7. Ingresar número: 987654321
8. Hacer clic en "Guardar"
9. Verificar que tabla se actualiza con nuevo teléfono

### Resultados:
✅ Dropdown funciona correctamente
✅ Estados se actualizan en BD
✅ Modal de teléfono abre y cierra
✅ Teléfono se persiste en BD
✅ Toast de confirmación aparece
✅ Tabla se refresca automáticamente

---

## 📦 Archivos Modificados

```
Frontend:
✓ frontend/src/pages/roles/citas/GestionAsegurado.jsx
✓ frontend/src/pages/roles/citas/DashboardCitas.jsx (menor)

Backend:
✓ backend/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java
✓ backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java (minor logs)

Nuevos:
✓ backend/src/main/java/com/styp/cenate/model/bolsas/DimEstadosGestionCitas.java
✓ backend/src/main/java/com/styp/cenate/repository/bolsas/DimEstadosGestionCitasRepository.java
```

---

## 🔐 Auditoría de Cambios de Estado (v1.42.0 - IMPLEMENTADO ✅)

### Funcionalidad

El sistema captura automáticamente **quién cambió el estado** de cada paciente y **cuándo lo hizo**. Esta información se muestra en dos nuevas columnas:

**Columnas Implementadas:**
- **"Fecha Cambio Estado"** - Timestamp ISO del cambio (ej: `2/2/2026, 1:25:07`)
- **"Usuario Cambio Estado"** - Nombre completo del gestor (ej: `Jhonatan Test Test`)

### Visualización

```
Tabla GestionAsegurado.jsx
┌────────────────────────────┬──────────────────────────┐
│ Fecha Cambio Estado        │ Usuario Cambio Estado    │
├────────────────────────────┼──────────────────────────┤
│ 2/2/2026, 1:25:07          │ Jhonatan Test Test       │
│ 2/2/2026, 1:29:13          │ Jhonatan Test Test       │
│ —                          │ —                        │ (sin cambios)
└────────────────────────────┴──────────────────────────┘
```

### Cómo Funciona

1. **Al cambiar estado:**
   - Click en "Editar estado" → Seleccionar nuevo estado
   - Backend registra: `fecha_cambio_estado = NOW()` y `usuario_cambio_estado_id = currentUser.id`

2. **Visualización:**
   - Frontend obtiene datos de `/api/bolsas/solicitudes/mi-bandeja`
   - Mapea campos: `fecha_cambio_estado` y `nombre_usuario_cambio_estado`
   - Muestra en tabla con formato legible

3. **Datos Persistentes:**
   - Se guarda en BD: `dim_solicitud_bolsa.fecha_cambio_estado`
   - Relación con usuario: `dim_solicitud_bolsa.usuario_cambio_estado_id → segu_usuario`
   - Nombre completo desde: `segu_usuario → segu_personal_cnt.nombre_completo`

### Cambios en Frontend (GestionAsegurado.jsx)

**Nuevas columnas en tabla:**
```javascript
<columnheader>Fecha Cambio Estado</columnheader>
<columnheader>Usuario Cambio Estado</columnheader>
```

**Mapeo de datos:**
```javascript
// Mostrar timestamp de cambio
const fechaCambio = solicitud.fecha_cambio_estado
  ? new Date(solicitud.fecha_cambio_estado).toLocaleString()
  : "—";

// Mostrar nombre completo del usuario
const usuarioNombre = solicitud.nombre_usuario_cambio_estado || "—";
```

### Cambios en Backend

**SolicitudBolsaRepository.java:**
- SQL queries actualizadas para incluir auditoría
- LEFT JOINs a `segu_usuario` + `segu_personal_cnt`
- Métodos: `findAllWithBolsaDescriptionPaginado()`, `findAllWithFiltersAndPagination()`

**SolicitudBolsaServiceImpl.java:**
- `mapFromResultSet()` mapea 3 índices nuevos:
  - `row[31]` → `fechaCambioEstado`
  - `row[32]` → `usuarioCambioEstadoId`
  - `row[33]` → `nombreUsuarioCambioEstado`

**Endpoints que lo usan:**
- `GET /api/bolsas/solicitudes/mi-bandeja` - Respuesta incluye auditoría
- `GET /api/bolsas/solicitudes` - Todas las solicitudes con auditoría
- `GET /api/bolsas/solicitudes?filters=...` - Filtradas con auditoría

### Rastreo Completo

Ahora es posible:
✅ Ver **quién** hizo cada cambio de estado
✅ Ver **cuándo** se realizó cada cambio
✅ Reportes de velocidad de gestión por usuario
✅ Auditoría completa para compliance regulatorio
✅ Debugging de problemas con datos históricos

---

## 🚀 Próximos Pasos

1. **Persistencia del estado display:** ✅ IMPLEMENTADO en v1.42.0
2. **Auditoría:** ✅ IMPLEMENTADO en v1.42.0
3. **Validaciones:** Agregar reglas de transición entre estados
4. **Notificaciones:** Alertar a paciente cuando estado cambia
5. **Reportes:** Dashboard con estadísticas de estados y gestores

---

## 📚 Referencias

- [`spec/backend/09_modules_bolsas/README.md`](../backend/09_modules_bolsas/README.md) - Módulo Bolsas
- [`spec/frontend/README.md`](../frontend/README.md) - Componentes Frontend
- [`spec/database/README.md`](../database/README.md) - Esquema Base de Datos
- CLAUDE.md - Project Instructions

---

**Versión:** v1.42.0 (con Auditoría de Cambios)
**Autor:** Claude Haiku 4.5
**Fecha:** 2026-02-02
**Status:** ✅ Producción
