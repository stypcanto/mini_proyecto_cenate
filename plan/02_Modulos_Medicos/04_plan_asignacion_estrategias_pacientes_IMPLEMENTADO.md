# ✅ Módulo de Asignación de Estrategias a Pacientes - IMPLEMENTADO

> **Versión:** 1.0.0
> **Fecha:** 2026-01-06
> **Estado:** ✅ IMPLEMENTACIÓN COMPLETADA
> **Módulo:** Asignación de Estrategias (CENACRON, TELECAM, TELETARV, etc.)

---

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente el módulo completo para **asignar pacientes a estrategias institucionales** durante atenciones médicas y de enfermería. El sistema permite:

✅ Asignar múltiples estrategias simultáneamente a un paciente
✅ Solo UNA asignación ACTIVA por estrategia (validado en BD)
✅ Tracking completo de duración y cambios de estado
✅ Reportería y análisis de pacientes por estrategia
✅ API REST con seguridad RBAC (Role-Based Access Control)
✅ Componentes React modernos con Framer Motion

---

## 🏗️ Arquitectura Implementada

### Base de Datos (PostgreSQL)

**Tabla Principal:** `paciente_estrategia`
```sql
CREATE TABLE paciente_estrategia (
    id_asignacion BIGSERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(255) NOT NULL,  -- Referencia a asegurados
    id_estrategia BIGINT NOT NULL,        -- Referencia a dim_estrategia_institucional
    id_atencion_asignacion BIGINT,        -- Atención donde se asignó
    id_usuario_asigno BIGINT,             -- Quién asignó
    fecha_asignacion TIMESTAMP,
    fecha_desvinculacion TIMESTAMP,
    estado VARCHAR(20) NOT NULL,          -- ACTIVO, INACTIVO, COMPLETADO
    observacion_desvinculacion TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Índices Creados:**
- `idx_pac_est_paciente` - Búsquedas por paciente
- `idx_pac_est_estrategia` - Búsquedas por estrategia
- `idx_pac_est_activos` - Estrategias activas (índice más crítico)
- `idx_pac_est_fecha_estado` - Búsquedas por rango de fechas
- `idx_pac_est_atencion` - Joins con atenciones
- `idx_pac_est_activo_unico` - **UNIQUE parcial** - Garantiza una sola ACTIVA

**Vistas Creadas:**
1. `vw_paciente_estrategias_activas` - Para UI (estrategias activas)
2. `vw_historial_estrategias_paciente` - Historial completo
3. `vw_pacientes_por_estrategia` - Reportería por estrategia
4. `vw_atenciones_por_estrategia` - Análisis de efectividad

### Backend (Spring Boot Java)

#### Entidad JPA
- **Ubicación:** `src/main/java/com/styp/cenate/model/PacienteEstrategia.java`
- **Características:**
  - Mapeo automático con `@Entity` y `@Table`
  - Relaciones `@ManyToOne` con `EstrategiaInstitucional` y `DimUsuarios`
  - Métodos `@Transient` para cálculos (getDiasEnEstrategia, isActivo, etc.)
  - Auditoría automática con `@CreationTimestamp` y `@UpdateTimestamp`

#### DTOs (Data Transfer Objects)

1. **AsignarEstrategiaRequest**
   - Ubicación: `src/main/java/com/styp/cenate/dto/AsignarEstrategiaRequest.java`
   - Campos: `pkAsegurado`, `idEstrategia`, `idAtencionAsignacion`, `observacion`
   - Validaciones: Jakarta Bean Validation

2. **PacienteEstrategiaResponse**
   - Ubicación: `src/main/java/com/styp/cenate/dto/PacienteEstrategiaResponse.java`
   - Retorna: Todos los datos de la asignación con datos calculados

3. **DesasignarEstrategiaRequest**
   - Ubicación: `src/main/java/com/styp/cenate/dto/DesasignarEstrategiaRequest.java`
   - Campos: `nuevoEstado` (INACTIVO/COMPLETADO), `observacionDesvinculacion`

#### Repository
- **Ubicación:** `src/main/java/com/styp/cenate/repository/PacienteEstrategiaRepository.java`
- **11 métodos de consulta personalizados:**
  - `findEstrategiasActivasByPaciente()` - Estrategias activas
  - `findHistorialEstrategiasByPaciente()` - Historial completo
  - `findHistorialEstrategiasByPacientePaginado()` - Con paginación
  - `existsAsignacionActiva()` - Validación de duplicados
  - `findAsignacionActiva()` - Obtener asignación activa
  - `findPacientesActivosPorEstrategia()` - Pacientes de estrategia
  - `findPacientesActivosPorEstrategiaPaginado()` - Con paginación
  - `findAsignacionesPorRangoFechas()` - Reportería por fechas
  - `contarPacientesPorEstrategiaYEstado()` - Conteo
  - `findByEstado()` - Filtrar por estado
  - `findByEstadoPaginado()` - Con paginación

#### Servicio
- **Interface:** `src/main/java/com/styp/cenate/service/PacienteEstrategiaService.java`
- **Implementación:** `src/main/java/com/styp/cenate/service/impl/PacienteEstrategiaServiceImpl.java`
- **8 métodos públicos:**
  - `asignarEstrategia()` - Con validación ÚNICA
  - `desasignarEstrategia()` - Cambio de estado
  - `obtenerEstrategiasActivas()` - Estrategias activas
  - `obtenerHistorialEstrategias()` - Historial
  - `obtenerHistorialEstrategiasPaginado()` - Con paginación
  - `obtenerAsignacion()` - Detalle específico
  - `tieneAsignacionActiva()` - Verificación
  - `obtenerPacientesActivosPorEstrategia()` - Pacientes
  - `obtenerPacientesActivosPorEstrategiaPaginado()` - Paginado
  - `contarPacientesActivosPorEstrategia()` - Conteo

#### Controller REST
- **Ubicación:** `src/main/java/com/styp/cenate/api/PacienteEstrategiaController.java`
- **Base URL:** `/api/paciente-estrategia`
- **7 Endpoints Implementados:**

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/` | Asignar estrategia | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| PUT | `/{id}/desasignar` | Desasignar estrategia | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/{id}` | Obtener asignación | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/paciente/{pk}/activas` | Estrategias activas | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/paciente/{pk}/historial` | Historial completo | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/estrategia/{id}` | Pacientes de estrategia | COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/paciente/{pk}/verificar/{id}` | Verificar asignación | MEDICO, ENFERMERIA, COORDINADOR, ADMIN, SUPERADMIN |
| GET | `/estrategia/{id}/contar` | Contar pacientes | COORDINADOR, ADMIN, SUPERADMIN |

### Frontend (React)

#### Servicio de API
- **Ubicación:** `src/services/estrategiaService.js`
- **Características:**
  - 8 métodos para consumir API
  - Interceptor de JWT automático
  - Manejo de errores
  - Async/await

#### Componentes React

1. **SelectorEstrategia.jsx**
   - Ubicación: `src/components/estrategia/SelectorEstrategia.jsx`
   - Props: `pkAsegurado`, `estrategias`, `onEstrategiaAsignada`, `disabled`
   - Características:
     - Muestra estrategias activas
     - Modal para seleccionar nueva
     - Validación de duplicados
     - Animaciones con Framer Motion

2. **HistorialEstrategias.jsx**
   - Ubicación: `src/components/estrategia/HistorialEstrategias.jsx`
   - Props: `pkAsegurado`, `onEstrategiaDesasignada`
   - Características:
     - Resumen de activas/pausadas/completadas
     - Historial detallado
     - Desasignación con confirmación
     - Información de duración

---

## 🚀 Guía de Uso

### Para Desarrolladores Backend

#### 1. Verificar instalación
```bash
cd backend
./gradlew build
```

#### 2. Ejecutar migración
La migración de Flyway se ejecuta automáticamente:
```
V3.0.0__crear_modulo_paciente_estrategia.sql
```

#### 3. Inyectar dependencias
```java
@RestController
public class MiController {
    @Autowired
    private PacienteEstrategiaService pacienteEstrategiaService;
}
```

#### 4. Usar el servicio
```java
// Asignar
PacienteEstrategiaResponse response = pacienteEstrategiaService.asignarEstrategia(
    request,
    usuarioId
);

// Obtener activas
List<PacienteEstrategiaResponse> activas =
    pacienteEstrategiaService.obtenerEstrategiasActivas(pkAsegurado);

// Desasignar
PacienteEstrategiaResponse updated =
    pacienteEstrategiaService.desasignarEstrategia(id, request);
```

### Para Desarrolladores Frontend

#### 1. Importar componentes
```jsx
import SelectorEstrategia from "@/components/estrategia/SelectorEstrategia";
import HistorialEstrategias from "@/components/estrategia/HistorialEstrategias";
```

#### 2. Usar en página
```jsx
export default function AtencionEnfermeria() {
  const [estrategias, setEstrategias] = useState([]);

  return (
    <div className="space-y-6">
      {/* Selector */}
      <SelectorEstrategia
        pkAsegurado={paciente.pk}
        estrategias={estrategias}
        onEstrategiaAsignada={(data) => {
          console.log("Asignada:", data);
        }}
      />

      {/* Historial */}
      <HistorialEstrategias
        pkAsegurado={paciente.pk}
        onEstrategiaDesasignada={(data) => {
          console.log("Desasignada:", data);
        }}
      />
    </div>
  );
}
```

#### 3. Consumir API directamente
```jsx
import EstrategiaService from "@/services/estrategiaService";

// Asignar
const response = await EstrategiaService.asignarEstrategia({
  pkAsegurado: "44914706",
  idEstrategia: 1,
  observacion: "Paciente seleccionado"
});

// Obtener activas
const activas = await EstrategiaService.obtenerEstrategiasActivas("44914706");

// Desasignar
const result = await EstrategiaService.desasignarEstrategia(idAsignacion, {
  nuevoEstado: "COMPLETADO",
  observacionDesvinculacion: "Programa completado"
});
```

---

## 📊 Casos de Uso

### Caso 1: Asignar estrategia durante atención médica
```
1. Médico atiende a paciente
2. Hace clic en "Agregar Nueva Estrategia"
3. Selecciona CENACRON
4. Confirma asignación
5. Sistema crea registro en BD con timestamp
6. Validación ÚNICA previene duplicados
```

### Caso 2: Pausar estrategia temporalmente
```
1. Paciente está en estrategia ACTIVA
2. Enfermería hace clic en botón Desasignar
3. Selecciona estado INACTIVO
4. Agrega observación
5. Sistema actualiza fecha_desvinculacion
6. Paciente puede reactivarse después
```

### Caso 3: Completar estrategia
```
1. Paciente completó programa
2. Coordinador desasigna con estado COMPLETADO
3. Se registra como finalizada
4. No se puede reactivar
5. Aparece en historial de completadas
```

### Caso 4: Reportería de pacientes por estrategia
```
1. Coordinador accede a GET /estrategia/{id}
2. Obtiene lista de pacientes ACTIVOS
3. Ve cuántos días lleva cada uno
4. Puede generar reportes
```

---

## 🔒 Seguridad Implementada

✅ **JWT Authentication** - Token en header Authorization
✅ **RBAC** - Solo roles específicos pueden asignar/desasignar
✅ **UNIQUE Constraint** - DB previene duplicados ACTIVOS
✅ **Input Validation** - Jakarta Bean Validation en DTOs
✅ **SQL Injection Prevention** - Queries parametrizadas
✅ **CORS** - Configurado para desarrollo y producción
✅ **Transactional** - ACID compliance en operaciones críticas

---

## 📈 Performance

| Operación | Índice Utilizado | Tiempo Esperado |
|-----------|------------------|-----------------|
| Obtener estrategias activas | `idx_pac_est_activos` | < 10ms |
| Historial completo | `idx_pac_est_paciente` | < 50ms |
| Verificar duplicado | `idx_pac_est_activo_unico` | < 5ms |
| Búsqueda por fecha | `idx_pac_est_fecha_estado` | < 20ms |

---

## 🔄 Flujo de Datos

```
Frontend (React)
    ↓
EstrategiaService (API Client)
    ↓
REST API (Spring Boot)
    ↓
PacienteEstrategiaService (Business Logic)
    ↓
PacienteEstrategiaRepository (JPA)
    ↓
PostgreSQL (Database)
```

---

## ✅ Checklist de Validación

- [x] Tabla `paciente_estrategia` creada
- [x] Índices optimizados
- [x] Vistas para reportería
- [x] Entidad JPA mapeada
- [x] DTOs creados
- [x] Validaciones añadidas
- [x] Repository con 11 métodos
- [x] Servicio implementado
- [x] 7 Endpoints REST
- [x] RBAC configurado
- [x] React components creados
- [x] Service.js de API
- [x] Animaciones Framer Motion
- [x] Manejo de errores
- [x] Documentación completada

---

## 🔗 Archivos Generados

### Backend
- `backend/src/main/resources/db/migration/V3.0.0__crear_modulo_paciente_estrategia.sql`
- `backend/src/main/java/com/styp/cenate/model/PacienteEstrategia.java`
- `backend/src/main/java/com/styp/cenate/dto/AsignarEstrategiaRequest.java`
- `backend/src/main/java/com/styp/cenate/dto/PacienteEstrategiaResponse.java`
- `backend/src/main/java/com/styp/cenate/dto/DesasignarEstrategiaRequest.java`
- `backend/src/main/java/com/styp/cenate/repository/PacienteEstrategiaRepository.java`
- `backend/src/main/java/com/styp/cenate/service/PacienteEstrategiaService.java`
- `backend/src/main/java/com/styp/cenate/service/impl/PacienteEstrategiaServiceImpl.java`
- `backend/src/main/java/com/styp/cenate/api/PacienteEstrategiaController.java`

### Frontend
- `frontend/src/services/estrategiaService.js`
- `frontend/src/components/estrategia/SelectorEstrategia.jsx`
- `frontend/src/components/estrategia/HistorialEstrategias.jsx`

---

## 📝 Notas Adicionales

### Extensibilidad Futura
- Agregar análisis ML de efectividad de estrategias
- Notificaciones automáticas de cambios de estado
- Exportar reportes a Excel/PDF
- Integración con sistema de alerta temprana

### Métricas Recomendadas
- Duración promedio por estrategia
- Tasa de completación vs abandono
- Pacientes por coordinador asignador
- Efectividad por combinación de estrategias

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar los comentarios en el código
2. Consultar documentación técnica en `spec/04_BaseDatos/`
3. Ver ejemplos en componentes React

---

**Generado por:** Claude Code
**Versión:** 1.0.0
**Fecha:** 2026-01-06
**Módulo:** CENATE - Asignación de Estrategias
**Status:** ✅ IMPLEMENTACIÓN COMPLETADA
