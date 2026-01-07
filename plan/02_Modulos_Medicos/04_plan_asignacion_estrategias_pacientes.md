# Plan: Asignación Dinámica de Estrategias a Pacientes

> **Versión:** 1.0.0
> **Fecha:** 2026-01-06
> **Módulo:** Trazabilidad Clínica + Reportería
> **Alcance:** Enfermería, Medicina, Reportería

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Modelo de Datos](#modelo-de-datos)
3. [Lógica de Negocio](#lógica-de-negocio)
4. [Requerimientos Backend](#requerimientos-backend)
5. [Requerimientos Frontend](#requerimientos-frontend)
6. [Reportería](#reportería)
7. [Checklist de Implementación](#checklist-de-implementación)
8. [Casos de Uso](#casos-de-uso)

---

## Resumen Ejecutivo

### Problema

Cuando un médico/enfermero atiende a un paciente, necesita:
- ✅ **Asignarlo a una estrategia** (CENACRON, TELECAM, TELETARV, etc.)
- ✅ **Permitir múltiples estrategias** simultáneas por paciente
- ✅ **Registrar la duración** de cada asignación
- ✅ **Generar reportes** de atenciones contabilizadas por estrategia

### Solución

**Tabla intermedia `paciente_estrategia`** que vincula:
- Paciente ↔ Estrategia (relación N:M)
- Registra: Fecha asignación, Fecha desvinculación, Usuario asigno, Estado
- Permite trazabilidad completa con historial

### Flujo Visual

```
PACIENTE JUAN PEREZ (DNI: 22672403)
   │
   ├─→ CENACRON        (01/01 - 15/01) ✅ COMPLETADO   → 14 días
   │
   ├─→ TELECAM         (15/01 - Activo) 🟢 ACTIVO      → 5+ días
   │
   └─→ TELETARV        (20/01 - Activo) 🟢 ACTIVO      → 0+ días

REPORTE: "Paciente estuvo en CENACRON 14 días (COMPLETADO),
          actualmente en TELECAM y TELETARV"
```

---

## Modelo de Datos

### 1. Nueva Tabla: `paciente_estrategia`

**Propósito:** Registrar la asignación de pacientes a estrategias con trazabilidad completa

```sql
CREATE TABLE paciente_estrategia (
    id_asignacion BIGSERIAL PRIMARY KEY,

    -- Relaciones
    id_paciente BIGINT NOT NULL,
    id_estrategia BIGINT NOT NULL,
    id_atencion_asignacion BIGINT,      -- En qué atención se asignó
    id_usuario_asigno BIGINT,           -- Quién asignó (médico/enfermera)

    -- Fecha de asignación (CUÁNDO se marcó en la atención)
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Fecha de desvinculación (CUÁNDO se marcó como inactivo)
    fecha_desvinculacion TIMESTAMP,

    -- Estado actual de la asignación
    estado VARCHAR(20) NOT NULL,        -- ACTIVO, INACTIVO, COMPLETADO

    -- Motivo de desvinculación
    observacion_desvinculacion TEXT,

    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones
    CONSTRAINT fk_pac_est_paciente
        FOREIGN KEY (id_paciente)
        REFERENCES dim_asegurado(id_asegurado)
        ON DELETE CASCADE,

    CONSTRAINT fk_pac_est_estrategia
        FOREIGN KEY (id_estrategia)
        REFERENCES dim_estrategia_institucional(id_estrategia),

    CONSTRAINT fk_pac_est_atencion
        FOREIGN KEY (id_atencion_asignacion)
        REFERENCES atenciones_enfermeria(id_atencion_enf),

    CONSTRAINT fk_pac_est_usuario
        FOREIGN KEY (id_usuario_asigno)
        REFERENCES personal_profesional(id_personal),

    -- No permitir duplicados ACTIVOS de la misma estrategia
    CONSTRAINT unique_pac_est_activo
        UNIQUE (id_paciente, id_estrategia, estado)
        WHERE estado = 'ACTIVO'
);

-- ÍNDICES para performance
CREATE INDEX idx_pac_est_paciente ON paciente_estrategia(id_paciente);
CREATE INDEX idx_pac_est_estrategia ON paciente_estrategia(id_estrategia);
CREATE INDEX idx_pac_est_estado ON paciente_estrategia(estado);
CREATE INDEX idx_pac_est_activos
    ON paciente_estrategia(id_paciente, estado)
    WHERE estado = 'ACTIVO';
```

### 2. Vista: Estrategias Activas del Paciente

```sql
CREATE OR REPLACE VIEW vw_paciente_estrategias_activas AS
SELECT
    pe.id_asignacion,
    pe.id_paciente,
    pe.id_estrategia,
    dei.sigla,
    dei.desc_estrategia,
    pe.fecha_asignacion,
    CURRENT_DATE - pe.fecha_asignacion::DATE AS dias_activo,
    pe.estado
FROM paciente_estrategia pe
JOIN dim_estrategia_institucional dei ON pe.id_estrategia = dei.id_estrategia
WHERE pe.estado = 'ACTIVO'
ORDER BY pe.id_paciente, pe.fecha_asignacion DESC;
```

### 3. Vista: Historial de Estrategias por Paciente

```sql
CREATE OR REPLACE VIEW vw_historial_estrategias_paciente AS
SELECT
    pe.id_paciente,
    dei.sigla,
    dei.desc_estrategia,
    pe.fecha_asignacion,
    pe.fecha_desvinculacion,
    CASE
        WHEN pe.fecha_desvinculacion IS NULL THEN CURRENT_DATE
        ELSE pe.fecha_desvinculacion::DATE
    END - pe.fecha_asignacion::DATE AS dias_en_estrategia,
    pe.estado,
    pp.nombre_completo AS asignado_por,
    pe.observacion_desvinculacion
FROM paciente_estrategia pe
JOIN dim_estrategia_institucional dei ON pe.id_estrategia = dei.id_estrategia
LEFT JOIN personal_profesional pp ON pe.id_usuario_asigno = pp.id_personal
ORDER BY pe.id_paciente, pe.fecha_asignacion DESC;
```

---

## Lógica de Negocio

### RN-1: Estados de la Asignación

```
ACTIVO
  ├─ Paciente sigue siendo atendido
  ├─ fecha_desvinculacion = NULL
  └─ Puede cambiar a: INACTIVO o COMPLETADO

INACTIVO
  ├─ Se desvinculó voluntariamente
  ├─ fecha_desvinculacion = (fecha del cambio)
  └─ Puede cambiar a: ACTIVO (reactivación)

COMPLETADO
  ├─ Terminó el programa/tratamiento
  ├─ fecha_desvinculacion = (fecha del cambio)
  └─ Puede cambiar a: INACTIVO (solo para reporte)
```

### RN-2: Asignación Única Activa por Estrategia

```sql
-- NO permitir 2 asignaciones ACTIVAS a la misma estrategia
-- Un paciente solo puede estar ACTIVO en una estrategia a la vez
CONSTRAINT unique_pac_est_activo
    UNIQUE (id_paciente, id_estrategia, estado)
    WHERE estado = 'ACTIVO'
```

### RN-3: Múltiples Estrategias Simultáneas (Diferentes)

```
✅ PERMITIDO:
   Paciente X:
   - CENACRON (ACTIVO) desde 01/01
   - TELECAM (ACTIVO) desde 15/01
   (Mismo paciente, ESTRATEGIAS DIFERENTES, ambas ACTIVAS)

❌ NO PERMITIDO:
   Paciente X:
   - CENACRON (ACTIVO) desde 01/01
   - CENACRON (ACTIVO) desde 15/01
   (Misma estrategia, dos veces ACTIVA = VIOLA constraint)
```

### RN-4: Reactivación Permitida

```
✅ PERMITIDO:
   - CENACRON (INACTIVO) desde 01/01 hasta 15/01
   - CENACRON (ACTIVO) desde 20/01
   (Nueva asignación = nuevo registro = permitido)
```

---

## Requerimientos Backend

### Entidades y DTOs

**Archivo:** `backend/src/main/java/com/styp/cenate/model/PacienteEstrategia.java`

```java
@Entity
@Table(name = "paciente_estrategia",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"id_paciente", "id_estrategia", "estado"},
           where = "estado = 'ACTIVO'"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteEstrategia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAsignacion;

    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @ManyToOne
    @JoinColumn(name = "id_estrategia", nullable = false)
    private EstrategiaInstitucional estrategia;

    @Column(name = "id_atencion_asignacion")
    private Long idAtencionAsignacion;

    @Column(name = "id_usuario_asigno")
    private Long idUsuarioAsigno;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDateTime fechaAsignacion;

    @Column(name = "fecha_desvinculacion")
    private LocalDateTime fechaDesvinculacion;

    @Column(name = "estado", nullable = false)
    private String estado; // ACTIVO, INACTIVO, COMPLETADO

    @Column(name = "observacion_desvinculacion", columnDefinition = "TEXT")
    private String observacionDesvinculacion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isActiva() {
        return "ACTIVO".equals(estado);
    }

    public long getDiasEnEstrategia() {
        LocalDate desde = fechaAsignacion.toLocalDate();
        LocalDate hasta = fechaDesvinculacion != null
            ? fechaDesvinculacion.toLocalDate()
            : LocalDate.now();
        return java.time.temporal.ChronoUnit.DAYS.between(desde, hasta);
    }
}
```

### Endpoints REST Requeridos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pacientes/{idPaciente}/estrategias` | Asignar paciente a estrategia |
| GET | `/api/pacientes/{idPaciente}/estrategias` | Obtener estrategias (activas + historial) |
| PUT | `/api/pacientes/{idPaciente}/estrategias/{idAsignacion}/desasignar` | Desasignar de estrategia |
| GET | `/api/estrategias` | Listar estrategias disponibles |
| GET | `/api/reportes/atenciones-por-estrategia` | Reporte consolidado |

---

## Requerimientos Frontend

### Componentes React Requeridos

| Componente | Ubicación | Descripción |
|-----------|-----------|-------------|
| `SelectorEstrategia.jsx` | `src/components/` | Selector para asignar estrategia |
| `HistorialEstrategias.jsx` | `src/components/` | Muestra activas + historial |
| Integración en modal | `RegistroAtencionClinica.jsx` | Incluir selector en formulario |

---

## Reportería

### Endpoint: Reporte de Atenciones por Estrategia

```
GET /api/reportes/atenciones-por-estrategia

Parámetros:
  ?fechaInicio=2026-01-01
  &fechaFin=2026-01-31
  &idEstrategia=1          (opcional)
  &estado=ACTIVO           (opcional)

Respuesta:
{
    "periodo": "01/01/2026 - 31/01/2026",
    "estrategias": [
        {
            "sigla": "CENACRON",
            "totalPacientes": 45,
            "totalAtenciones": 120,
            "diasPromedio": 14.5,
            "estado": "ACTIVO"
        }
    ]
}
```

---

## ✅ Checklist de Implementación

### FASE 1: BASE DE DATOS (1 día)

- [ ] **1.1** Crear script SQL con tabla `paciente_estrategia`
- [ ] **1.2** Crear índices para performance
- [ ] **1.3** Crear vistas (activas + historial)
- [ ] **1.4** Ejecutar script en BD de desarrollo
- [ ] **1.5** Verificar constraints funcionan correctamente
- [ ] **1.6** Validar que no permite duplicados activos

**Criterio de Aceptación:**
- ✅ Tabla existe en BD
- ✅ Constraint UNIQUE funciona
- ✅ Vistas retornan datos correctamente

---

### FASE 2: BACKEND - MODELO (1 día)

- [ ] **2.1** Crear entidad JPA `PacienteEstrategia.java`
- [ ] **2.2** Crear DTO `AsignarEstrategiaRequest.java`
- [ ] **2.3** Crear DTO `PacienteEstrategiaResponse.java`
- [ ] **2.4** Crear Repository `PacienteEstrategiaRepository.java`
- [ ] **2.5** Crear queries nativas si es necesario

**Criterio de Aceptación:**
- ✅ Entidad compila sin errores
- ✅ Repository tiene métodos necesarios
- ✅ DTOs cumplen con validaciones Jakarta

---

### FASE 3: BACKEND - SERVICIO (1 día)

- [ ] **3.1** Crear Service `PacienteEstrategiaService.java`
  - [ ] **3.1.1** Método `asignarEstrategia()`
  - [ ] **3.1.2** Método `desasignarEstrategia()`
  - [ ] **3.1.3** Método `obtenerEstrategiasActivas()`
  - [ ] **3.1.4** Método `obtenerHistorialEstrategias()`
  - [ ] **3.1.5** Método `validarAsignacionUnica()`

- [ ] **3.2** Implementar validaciones de negocio
  - [ ] **3.2.1** No permitir duplicados activos
  - [ ] **3.2.2** Validar que id_paciente existe
  - [ ] **3.2.3** Validar que id_estrategia existe
  - [ ] **3.2.4** Registrar auditoría

- [ ] **3.3** Integrar con `AuditLogService`

**Criterio de Aceptación:**
- ✅ Service compila
- ✅ Validaciones funcionan
- ✅ Transacciones ACID correctas

---

### FASE 4: BACKEND - CONTROLLERS (1 día)

- [ ] **4.1** Crear Controller `PacienteEstrategiaController.java`
  - [ ] **4.1.1** POST `/api/pacientes/{id}/estrategias` - Asignar
  - [ ] **4.1.2** GET `/api/pacientes/{id}/estrategias` - Obtener
  - [ ] **4.1.3** PUT `/api/pacientes/{id}/estrategias/{id}/desasignar` - Desasignar

- [ ] **4.2** Crear Controller `EstrategiaController.java`
  - [ ] **4.2.1** GET `/api/estrategias` - Listar todas

- [ ] **4.3** Crear Controller `ReporteEstrategiaController.java`
  - [ ] **4.3.1** GET `/api/reportes/atenciones-por-estrategia`

- [ ] **4.4** Agregar seguridad (MBAC)
  - [ ] **4.4.1** Solo ADMIN/MEDICO/ENFERMERIA pueden asignar
  - [ ] **4.4.2** Solo ADMIN/COORDINADOR pueden ver reportes

**Criterio de Aceptación:**
- ✅ Endpoints responden correctamente
- ✅ Validaciones de seguridad funcionan
- ✅ Respuestas JSON bien formadas

---

### FASE 5: FRONTEND - COMPONENTES (1 día)

- [ ] **5.1** Crear `SelectorEstrategia.jsx`
  - [ ] **5.1.1** Cargar listado de estrategias desde API
  - [ ] **5.1.2** Mostrar estrategias activas del paciente
  - [ ] **5.1.3** Selector para elegir estrategia
  - [ ] **5.1.4** Botón "Asignar a Estrategia"
  - [ ] **5.1.5** Manejo de errores

- [ ] **5.2** Crear `HistorialEstrategias.jsx`
  - [ ] **5.2.1** Mostrar estrategias activas (badges verdes)
  - [ ] **5.2.2** Mostrar historial completo (tabla)
  - [ ] **5.2.3** Mostrar días en cada estrategia
  - [ ] **5.2.4** Mostrar estado (ACTIVO/INACTIVO/COMPLETADO)

- [ ] **5.3** Integración en Modal de Atención
  - [ ] **5.3.1** Agregar `SelectorEstrategia` a `RegistroAtencionClinica.jsx`
  - [ ] **5.3.2** Refrescar historial después de asignar
  - [ ] **5.3.3** Mostrar confirmación visual

**Criterio de Aceptación:**
- ✅ Componentes compilan sin errores
- ✅ Hacen llamadas API correctas
- ✅ UX es clara e intuitiva

---

### FASE 6: FRONTEND - REPORTERÍA (1 día)

- [ ] **6.1** Crear página `ReporteEstrategias.jsx`
  - [ ] **6.1.1** Filtros por fecha (fecha_inicio, fecha_fin)
  - [ ] **6.1.2** Filtro por estrategia (dropdown)
  - [ ] **6.1.3** Filtro por estado (ACTIVO/INACTIVO/COMPLETADO)

- [ ] **6.2** Mostrar datos en tabla
  - [ ] **6.2.1** Columna: Estrategia (SIGLA)
  - [ ] **6.2.2** Columna: Total Pacientes
  - [ ] **6.2.3** Columna: Total Atenciones
  - [ ] **6.2.4** Columna: Promedio días
  - [ ] **6.2.5** Columna: Estado

- [ ] **6.3** Funcionalidad de expansión
  - [ ] **6.3.1** Mostrar detalle de pacientes por estrategia
  - [ ] **6.3.2** Mostrar duración (fecha_inicio - fecha_fin)
  - [ ] **6.3.3** Contar atenciones por paciente

- [ ] **6.4** Exportación de datos
  - [ ] **6.4.1** Botón "Descargar Excel"
  - [ ] **6.4.2** Botón "Descargar PDF"

**Criterio de Aceptación:**
- ✅ Reportes se generan correctamente
- ✅ Filtros funcionan
- ✅ Datos son precisos

---

### FASE 7: TESTING & QA (1 día)

- [ ] **7.1** Testing Backend
  - [ ] **7.1.1** Prueba unitaria: Asignar estrategia
  - [ ] **7.1.2** Prueba unitaria: Desasignar estrategia
  - [ ] **7.1.3** Prueba unitaria: No permite duplicados activos
  - [ ] **7.1.4** Prueba integración: APIs funcionan end-to-end

- [ ] **7.2** Testing Frontend
  - [ ] **7.2.1** Prueba: Selector carga estrategias
  - [ ] **7.2.2** Prueba: Se puede asignar estrategia
  - [ ] **7.2.3** Prueba: Se puede desasignar estrategia
  - [ ] **7.2.4** Prueba: Historial actualiza correctamente

- [ ] **7.3** Testing Reportería
  - [ ] **7.3.1** Prueba: Reporte agrupa por estrategia
  - [ ] **7.3.2** Prueba: Calcula totales correctamente
  - [ ] **7.3.3** Prueba: Filtros funcionan
  - [ ] **7.3.4** Prueba: Exportación genera archivo

- [ ] **7.4** Testing de Seguridad
  - [ ] **7.4.1** Solo usuarios autorizados pueden asignar
  - [ ] **7.4.2** Solo ADMIN/COORDINADOR ven reportes completos
  - [ ] **7.4.3** Auditoría registra todas las acciones

**Criterio de Aceptación:**
- ✅ Todas las pruebas pasan
- ✅ No hay regresiones
- ✅ Performance es aceptable

---

### FASE 8: DOCUMENTACIÓN (0.5 día)

- [ ] **8.1** Documentar endpoints en Swagger/OpenAPI
- [ ] **8.2** Crear guía de usuario (cómo asignar estrategias)
- [ ] **8.3** Crear guía de interpretación de reportes
- [ ] **8.4** Actualizar CLAUDE.md con instrucciones

**Criterio de Aceptación:**
- ✅ Documentación completa
- ✅ Screenshots de UI
- ✅ Ejemplos de API

---

### FASE 9: DEPLOYMENT (0.5 día)

- [ ] **9.1** Ejecutar script SQL en BD producción
- [ ] **9.2** Compilar y empaquetar Backend
- [ ] **9.3** Compilar y empaquetar Frontend
- [ ] **9.4** Realizar smoke tests en producción
- [ ] **9.5** Actualizar documentación de releases

**Criterio de Aceptación:**
- ✅ Código deployado en producción
- ✅ Smoke tests pasan
- ✅ Usuarios pueden usar la funcionalidad

---

## Casos de Uso

### UC-1: Asignación Inicial

```
ACTOR: Enfermero
ESCENARIO: Atender paciente por primera vez

1. Enfermero abre modal de paciente JUAN PEREZ
2. Registra observaciones de enfermería
3. Ve selector de estrategia
4. Elige: CENACRON
5. Clickea "Asignar a Estrategia"
6. Sistema inserta:
   - id_paciente = 1
   - id_estrategia = 1 (CENACRON)
   - estado = ACTIVO
   - fecha_asignacion = 2026-01-06 10:30
   - id_usuario_asigno = 123 (ID enfermero)
7. En historial aparece: ✅ CENACRON (0 días)
```

### UC-2: Múltiples Estrategias Simultáneas

```
ACTOR: Médico
ESCENARIO: Paciente asignado a CENACRON, se agrega a TELECAM

1. Paciente JUAN en CENACRON (01/01, 10 días activo)
2. Médico lo atiende (11/01)
3. Lo asigna también a TELECAM
4. Base de datos:
   - Registro 1: CENACRON (ACTIVO, 10+ días)
   - Registro 2: TELECAM (ACTIVO, 0 días)
5. En historial aparece:
   ✅ CENACRON (10 días)
   ✅ TELECAM (0 días)
6. Reporte contabiliza:
   - Atenciones de CENACRON: N
   - Atenciones de TELECAM: M
```

### UC-3: Desasignación y Reactivación

```
ACTOR: Coordinador
ESCENARIO: Paciente completa CENACRON, se desasigna, luego se reactiva

1. Después de 20 días, coordinador marca:
   "Desasignar de CENACRON - COMPLETADO"
2. Sistema actualiza:
   - estado = COMPLETADO
   - fecha_desvinculacion = 2026-01-26

3. Meses después, médico lo atiende nuevamente
   y lo asigna a CENACRON nuevamente
4. Sistema crea NUEVO registro:
   - Registro 1: CENACRON (COMPLETADO, 20 días)
   - Registro 2: CENACRON (ACTIVO, 0 días)
5. Reporte muestra:
   - CENACRON: 2 períodos (20 días + 0+ días)
   - Total: 20+ días
```

### UC-4: Reporte Consolidado

```
ACTOR: Gerente de reportería
ESCENARIO: Generar reporte de atenciones por estrategia

1. Accede a: /reportes/atenciones-por-estrategia
2. Filtra por fecha: 01/01/2026 - 31/01/2026
3. Sistema retorna:

   CENACRON:
   - 45 pacientes
   - 120 atenciones
   - Promedio: 2.67 atenciones/paciente
   - Promedio días: 14.5

   TELECAM:
   - 32 pacientes
   - 80 atenciones
   - Promedio: 2.5 atenciones/paciente
   - Promedio días: 8.3

4. Descarga reporte en Excel/PDF
```

---

## Timeline Total

```
SEMANA 1:
Lunes    (1 día)   → FASE 1-2: BD + Modelo
Martes   (1 día)   → FASE 3: Servicio
Miércoles(1 día)   → FASE 4: Controllers
Jueves   (1 día)   → FASE 5: Frontend Componentes
Viernes  (0.5 día) → FASE 6: Frontend Reportería

SEMANA 2:
Lunes    (0.5 día) → FASE 7: Testing
Martes   (0.5 día) → FASE 8: Documentación
Miércoles(0.5 día) → FASE 9: Deployment

TOTAL: ~5.5 días de trabajo
```

---

## Notas Técnicas Importantes

✅ **Múltiples Estrategias:** Un paciente puede estar en varias simultáneamente (solo diferentes)
✅ **Reactivación:** Permite volver a asignar tras desasignación (nuevo registro)
✅ **Trazabilidad:** Registra quién asignó, cuándo, y por cuánto tiempo
✅ **Reportería:** Central para análisis de estrategias
✅ **Performance:** Índices optimizados en campos frecuentemente consultados
✅ **Auditoría:** Todas las acciones se registran en tabla de auditoría

---

*EsSalud Perú - CENATE | Módulo de Trazabilidad Clínica*
*v1.0.0 - 2026-01-06*
