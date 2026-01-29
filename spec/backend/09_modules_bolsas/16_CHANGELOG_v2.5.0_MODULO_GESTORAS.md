# 📋 CHANGELOG v2.5.0 - Módulo Gestoras

> **Módulo de Bolsas - Soporte Completo para Gestoras de Citas**
> **Versión:** v2.5.0 | **Status:** ✅ Production Ready
> **Fecha:** 2026-01-29
> **Cambios:** 3 características principales + 8 endpoints nuevos/modificados

---

## 🎯 Resumen Ejecutivo

La versión v2.5.0 introduce soporte completo para **gestoras de citas** (rol GESTOR_DE_CITAS), permitiendo que:

1. **Administradores** asignen solicitudes a gestoras con permisos expandidos
2. **Gestoras** accedan a su panel personal "Mi Bandeja" para ver sus solicitudes
3. **Gestoras** cambien el estado de solicitudes a "Atendido" (completadas)

### Impacto:
- ✅ **Flujo completo:** Admin asigna → Gestora ve → Gestora marca atendida
- ✅ **Aislamiento:** Cada gestora solo ve sus solicitudes asignadas
- ✅ **Seguridad:** Control de acceso basado en usuario actual
- ✅ **Auditoría:** Registro de cambios de estado

---

## 🆕 Características Principales

### 1️⃣ Permisos Expandidos para Asignación (Backend)

**Endpoint:** `PATCH /api/bolsas/solicitudes/{id}/asignar?idGestora={id}`

**Cambio:**
- **Antes (v2.4.0):** `@CheckMBACPermission` solo
- **Ahora (v2.5.0):** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS')")`

**Beneficio:** Coordinadores de gestión de citas ahora pueden asignar gestoras sin ser SUPERADMIN

**Implementación:**
```java
// SolicitudBolsaController.java
@PatchMapping("/{id}/asignar")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS')")
@CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "asignar")
public ResponseEntity<?> asignarGestora(@PathVariable Long id,
                                         @RequestParam(value = "idGestora", required = false) Long idGestora)
```

---

### 2️⃣ Módulo "Mi Bandeja" para Gestoras (Backend + Frontend)

#### Backend: Nuevo Endpoint
```
GET /api/bolsas/solicitudes/mi-bandeja
```

**Protección:**
- `@PreAuthorize("hasAnyRole('GESTOR_DE_CITAS')")`
- Solo gestoras pueden acceder

**Respuesta:**
```json
{
  "total": 15,
  "solicitudes": [
    {
      "idSolicitud": 101,
      "numeroSolicitud": "SOL-001",
      "pacienteNombre": "Juan García López",
      "pacienteDni": "12345678",
      "especialidad": "Cardiología",
      "pacienteTelefono": "987654321",
      "fechaSolicitud": "2026-01-25T10:30:00-05:00",
      "estadoGestionCitasId": 1,
      "responsableGestoraId": 42,
      "fechaAsignacion": "2026-01-28T14:20:00-05:00"
    },
    // ... más solicitudes
  ],
  "mensaje": "Se encontraron 15 solicitud(es) asignada(s)"
}
```

**Servicio:**
```java
// SolicitudBolsaServiceImpl.java - v2.5.0
@Override
@Transactional(readOnly = true)
public List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora() {
  // 1. Obtener usuario autenticado del SecurityContextHolder
  // 2. Validar que exista en BD
  // 3. Buscar solicitudes donde responsable_gestora_id = usuario.id
  // 4. Retornar DTOs enriquecidos
}
```

#### Frontend: Nuevo Componente
```
/bolsas/mi-bandeja
```

**Archivo:** `frontend/src/pages/bolsas/MiBandeja.jsx` (v1.0.0 - NUEVO)

**Características:**
- 📬 Dashboard personalizado para gestoras
- 🔍 Búsqueda por nombre, DNI, especialidad
- 📊 Estadísticas rápidas (Total, Pendientes, Atendidas, Canceladas)
- ✅ Botón "Marcar Atendido" (solo si no está completada)
- 🎨 UI profesional con TailwindCSS
- ♿ Accesible y responsivo

**Estados en Mi Bandeja:**
| Estado | Color | Ícono |
|--------|-------|-------|
| PENDIENTE | Yellow | ⏳ |
| ATENDIDO | Green | ✅ |
| CANCELADO | Red | ❌ |
| DERIVADO | Blue | 🔄 |

**Estadísticas Rápidas:**
```
┌─────────────────────────────────────┐
│ Total: 15  Pendientes: 8           │
│ Atendidas: 5  Canceladas: 2        │
└─────────────────────────────────────┘
```

---

### 3️⃣ Cambiar Estado a "Atendido" (Backend + Frontend)

#### Backend: Endpoint Actualizado
```
PATCH /api/bolsas/solicitudes/{id}/estado?nuevoEstadoId=3
```

**Protección Expandida (v2.5.0):**
- `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS', 'GESTOR_DE_CITAS')")`

**Estado ID 3 = "ATENDIDO"** (en dim_estados_gestion_citas)

**Request:**
```bash
PATCH http://localhost:8080/api/bolsas/solicitudes/101/estado?nuevoEstadoId=3
Authorization: Bearer {token}
```

**Response:**
```json
{
  "mensaje": "Estado actualizado exitosamente",
  "idSolicitud": 101,
  "nuevoEstadoId": 3
}
```

#### Frontend: Confirmación Modal + Actualización
```javascript
// MiBandeja.jsx
const marcarComoAtendido = async (solicitud) => {
  // 1. Mostrar modal de confirmación
  // 2. Llamar: cambiarEstado(idSolicitud, 3)
  // 3. Actualizar estado local
  // 4. UI refleja cambio inmediato
}
```

---

## 📊 Endpoints Nuevos y Modificados

### Nuevos Endpoints (v2.5.0)

| Método | Ruta | Descripción | Roles Permitidos | Status |
|--------|------|-------------|-----------------|--------|
| GET | `/api/bolsas/solicitudes/mi-bandeja` | Obtener solicitudes asignadas a gestora actual | GESTOR_DE_CITAS | ✅ NEW |

### Endpoints Modificados (v2.5.0)

| Método | Ruta | Cambio | Roles Permitidos (antes → ahora) | Status |
|--------|------|--------|----------------------------------|--------|
| PATCH | `/{id}/asignar` | @PreAuthorize añadido | ADMIN → ADMIN, SUPERADMIN, COORD_GESTION_CITAS | ✅ EXPANDED |
| PATCH | `/{id}/estado` | @PreAuthorize expandido | ADMIN → ADMIN, SUPERADMIN, COORD_GESTION_CITAS, GESTOR_DE_CITAS | ✅ EXPANDED |

---

## 🔧 Cambios Técnicos

### Backend Files Modificados

#### 1. SolicitudBolsaController.java
```java
// NEW: Import
import org.springframework.security.access.prepost.PreAuthorize;

// MODIFIED: asignarGestora() endpoint
@PatchMapping("/{id}/asignar")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS')") // NEW
@CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "asignar")
public ResponseEntity<?> asignarGestora(...)

// MODIFIED: cambiarEstado() endpoint
@PatchMapping("/{id}/estado")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS', 'GESTOR_DE_CITAS')") // NEW
public ResponseEntity<?> cambiarEstado(...)

// NEW: obtenerMiBandeja() endpoint
@GetMapping("/mi-bandeja")
@PreAuthorize("hasAnyRole('GESTOR_DE_CITAS')")
public ResponseEntity<?> obtenerMiBandeja()
```

#### 2. SolicitudBolsaServiceImpl.java
```java
// NEW: Imports
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// NEW: Method
@Override
@Transactional(readOnly = true)
public List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora()

// NEW: Helper Method
private SolicitudBolsaDTO mapSolicitudBolsaToDTO(SolicitudBolsa solicitud)
```

#### 3. SolicitudBolsaService.java (Interface)
```java
// NEW: Method signature
List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora();
```

#### 4. SolicitudBolsaRepository.java
```java
// NEW: Query method
List<SolicitudBolsa> findByResponsableGestoraIdAndActivoTrue(Long gestoraId);
```

### Frontend Files Modificados

#### 1. MiBandeja.jsx (NUEVO)
```javascript
// NEW: Complete component for gestoras dashboard
- useState: solicitudes, isLoading, error, filtroEstado, filtro búsqueda
- useEffect: cargarDatos() on mount
- Methods: marcarComoAtendido(), abrirModalConfirmacion()
- Features: Search, Filter, Stats, Mark as Attended
- Security: Protected by role GESTOR_DE_CITAS
```

#### 2. bolsasService.js
```javascript
// NEW: Methods added to default export
export const obtenerMiBandeja = async () => {
  const response = await apiClient.get(`${API_BASE_URL}/solicitudes/mi-bandeja`);
  return response;
};

export const cambiarEstado = async (id, nuevoEstadoId) => {
  const response = await apiClient.patch(
    `${API_BASE_URL}/solicitudes/${id}/estado`,
    {},
    { params: { nuevoEstadoId } }
  );
  return response;
};
```

#### 3. componentRegistry.js
```javascript
// NEW: Route registration
'/bolsas/mi-bandeja': {
  component: lazy(() => import('../pages/bolsas/MiBandeja')),
  requiredAction: 'ver',
  requiredRoles: ['GESTOR_DE_CITAS'],
}
```

---

## 🔒 Control de Acceso

### Matriz de Permisos v2.5.0

| Acción | SUPERADMIN | ADMIN | COORDINADOR_GESTION_DE_CITAS | GESTOR_DE_CITAS | OTROS |
|--------|-----------|-------|------------------------------|-----------------|-------|
| **Ver Solicitudes** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Asignar Gestora** | ✅ | ✅ | ✅ ⭐ | ❌ | ❌ |
| **Ver Mi Bandeja** | ❌ | ❌ | ❌ | ✅ ⭐ | ❌ |
| **Marcar Atendido** | ✅ | ✅ | ✅ | ✅ ⭐ | ❌ |
| **Cambiar Estado** | ✅ | ✅ | ✅ | ✅ ⭐ | ❌ |

### Flujo de Autenticación

1. **Login:** Usuario obtiene JWT token
2. **Request:** Browser envía token en Authorization header
3. **SecurityFilter:** JwtAuthenticationFilter valida token → extrae username
4. **SecurityContext:** Usuario autenticado cargado con roles
5. **Endpoint:** @PreAuthorize valida rol antes de ejecutar
6. **Service:** SecurityContextHolder.getContext().getAuthentication() obtiene usuario actual
7. **Repository:** Filtra datos por usuario (responsable_gestora_id = current_user_id)

---

## 📱 UI/UX - Mi Bandeja

### Estructura de Pantalla
```
┌─────────────────────────────────────────────────────┐
│ 📬 Mi Bandeja  [Subheader info]                     │
├─────────────────────────────────────────────────────┤
│ ┌──────┐┌──────┐┌──────┐┌──────┐                  │
│ │Total ││Pend. ││Atend.││Canc. │  [Estadísticas]  │
│ │  15  ││  8   ││  5   ││  2   │                  │
│ └──────┘└──────┘└──────┘└──────┘                  │
├─────────────────────────────────────────────────────┤
│ [🔍 Busca por nombre, DNI o especialidad...]      │
├─────────────────────────────────────────────────────┤
│ PACIENTE      │ DNI    │ ESPECIALIDAD │ TELÉFONO  │
│───────────────┼────────┼──────────────┼───────────│
│ Juan García   │ 123... │ Cardiología  │ 9876...   │
│ Estado: ⏳    │ Fecha  │ Solicitud    │           │
│ [Marcar Atendido] ✅                              │
├─────────────────────────────────────────────────────┤
│ María López   │ 456... │ Oftalmología │ 9654...   │
│ Estado: ✅ ATENDIDO     [No aplica acción]       │
└─────────────────────────────────────────────────────┘
```

### Colores y Estados
```
┌──────────────────────────────────────┐
│ PENDIENTE     ⏳ Yellow   (Accionable) │
│ ATENDIDO      ✅ Green     (Completo) │
│ CANCELADO     ❌ Red      (Inactivo)  │
│ DERIVADO      🔄 Blue     (En tránsito) │
└──────────────────────────────────────┘
```

---

## 🧪 Casos de Uso Testeados

### Caso 1: Admin Asigna Gestora ✅
```
1. Admin navega a /bolsas/solicitudes
2. Selecciona solicitud → Click "Asignar"
3. Abre modal con gestoras disponibles
4. Selecciona "María - GESTOR DE CITAS"
5. Click "Guardar"
6. ✅ Solicitud asignada a María
7. ✅ fecha_asignacion = NOW()
```

### Caso 2: Gestora ve Mi Bandeja ✅
```
1. Gestora (María) login exitoso
2. Navega a /bolsas/mi-bandeja
3. Sistema autentica: username = "maria"
4. Service: SecurityContextHolder obtiene maria
5. Busca en BD: WHERE responsable_gestora_id = maria.id
6. ✅ Muestra 15 solicitudes asignadas a María
7. ✅ Otras gestoras solo ven las suyas
```

### Caso 3: Gestora Marca Atendido ✅
```
1. Gestora ve solicitud "Juan García" en estado PENDIENTE
2. Click "Marcar Atendido"
3. Modal: "¿Marcar a Juan García como atendido?"
4. Click "Confirmar"
5. PATCH /solicitudes/101/estado?nuevoEstadoId=3
6. ✅ estado_gestion_citas_id = 3 (ATENDIDO)
7. ✅ UI actualiza: Estado ahora es ✅ ATENDIDO
8. ✅ Botón desaparece (no editable)
```

### Caso 4: Autorización Fallida ✅
```
1. MÉDICO intenta acceder a /bolsas/mi-bandeja
2. Sistema valida: hasRole('GESTOR_DE_CITAS') = false
3. ✅ Redirect a /unauthorized (403 Forbidden)
```

---

## 📈 Impacto

### Beneficios Funcionales
- ✅ Flujo completo: Asignar → Ver → Marcar Atendido
- ✅ Gestoras tienen panel personalizado
- ✅ Mejor seguimiento del estado
- ✅ Reduce carga de coordinadores
- ✅ Auditoría automática de cambios

### Beneficios Técnicos
- ✅ SecurityContextHolder para aislamiento de datos
- ✅ @Transactional para consistencia
- ✅ DTOs para serialización limpia
- ✅ Endpoints RESTful bien definidos
- ✅ Código testeable y mantenible

### Beneficios de Negocios
- ✅ Roles claramente definidos
- ✅ Escalable: Fácil agregar más gestoras
- ✅ Seguro: Sin data leakage entre usuarios
- ✅ Auditable: Todos los cambios registrados
- ✅ UX mejorada: Dashboard intuitivo

---

## 🔄 Compatibilidad

### Backwards Compatibility
- ✅ Todos los endpoints anteriores funcionan igual
- ✅ DTOs ampliados (responsableGestoraId, fechaAsignacion) son opcionales
- ✅ Código anterior puede ignorar nuevos campos
- ✅ Nuevos endpoints no afectan existentes

### Versiones de Dependencias
```
Java: 17 (no cambios)
Spring Boot: 3.5.6 (no cambios)
React: 19 (no cambios)
PostgreSQL: 14 (no cambios)
TailwindCSS: 3.4.18 (no cambios)
```

---

## 🐛 Notas Conocidas

1. **Estado ID Hardcoded:** En MiBandeja.jsx, estado "Atendido" usa ID=3. Podría ser dinámico si se requiere.

2. **Búsqueda No Paginada:** Mi Bandeja carga todos los registros. Para >100 gestoras, considerar paginación.

3. **Zona Horaria:** Usa zona horaria del servidor. Verificar si necesita conversión a hora local (Lima).

4. **Caché:** Sin caché en endpoints. Con muchos usuarios, considerar Redis.

---

## ✅ Checklist de Validación

- [x] Endpoints probados en Postman
- [x] Frontend desplegado en localhost:3000
- [x] Roles validados en BD
- [x] Permisos verificados por rol
- [x] Modal de confirmación funciona
- [x] Estado actualiza en tiempo real
- [x] Búsqueda filtra correctamente
- [x] Estadísticas contadores OK
- [x] Gestoras solo ven sus solicitudes
- [x] Documentación actualizada

---

## 📚 Referencias

- **Código Backend:** `src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java`
- **Código Service:** `src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java`
- **Código Frontend:** `frontend/src/pages/bolsas/MiBandeja.jsx`
- **Rutas:** `frontend/src/config/componentRegistry.js`
- **API Service:** `frontend/src/services/bolsasService.js`

---

## 📞 Información

**Desarrollador:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Fecha:** 2026-01-29
**Versión:** v2.5.0
**Status:** ✅ Production Ready
