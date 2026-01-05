# Guía de Integración: Horarios y Disponibilidad Médica

**Versión:** 1.0.0
**Fecha:** 2026-01-03
**Propósito:** Guía rápida para integrar nuevos módulos con el sistema existente de horarios

---

## 🎯 PROPÓSITO DE ESTA GUÍA

Esta guía explica **cómo integrar** nuevos módulos (como disponibilidad médica, solicitud de turnos, o trazabilidad clínica) con el sistema existente de horarios de CENATE.

---

## 📊 COMPARACIÓN RÁPIDA: DOS SISTEMAS DE HORARIOS

### Sistema Existente: `ctr_horario` (Carga Operativa)

```
Propósito: Generar slots de citas para el chatbot
Usuario: Coordinadores/Administradores
Flujo: Carga mensual → Validación técnica → Slots disponibles
Salida: vw_slots_disponibles_chatbot
```

**Ejemplo de uso:**
```sql
-- Coordinador carga horario de enero 2026 para Dr. Juan Pérez
INSERT INTO ctr_horario (periodo, id_pers, id_area, id_servicio)
VALUES ('202601', 123, 5, 10);

-- Detalle: Lunes 6 turno mañana, Martes 7 turno tarde
INSERT INTO ctr_horario_det (id_ctr_horario, fecha_dia, id_horario, id_tip_turno)
VALUES
    (456, '2026-01-06', 1, 1),  -- M4 (4 horas mañana)
    (456, '2026-01-07', 2, 1);  -- T4 (4 horas tarde)

-- Resultado: Chatbot tiene slots cada 15 min de 07:00-11:00 el lunes 6
```

### Nuevo Sistema: `disponibilidad_medica` (Declaración Voluntaria)

```
Propósito: Médicos declaran su disponibilidad con validación de 150 horas
Usuario: Médicos + Coordinadores
Flujo: Médico declara → Envía (>=150h) → Coordinador revisa → Aprueba
Salida: Disponibilidad aprobada para planificación
```

**Ejemplo de uso:**
```sql
-- Dr. Juan Pérez declara disponibilidad de enero 2026 en Cardiología
INSERT INTO disponibilidad_medica (id_pers, id_servicio, periodo, estado)
VALUES (123, 10, '202601', 'BORRADOR');

-- Detalle: 20 días × 8h = 160 horas (cumple mínimo)
INSERT INTO detalle_disponibilidad (id_disponibilidad, fecha, turno, horas)
VALUES
    (789, '2026-01-06', 'MT', 8.00),  -- Turno completo
    (789, '2026-01-07', 'MT', 8.00);
    -- ... 18 días más

-- Médico envía: UPDATE disponibilidad_medica SET estado = 'ENVIADO' ...
-- Coordinador revisa: UPDATE disponibilidad_medica SET estado = 'REVISADO' ...
```

---

## 🔗 ESTRATEGIAS DE INTEGRACIÓN

### Opción 1: Sistemas Independientes (✅ Recomendado)

**Ventajas:**
- Sin riesgo de afectar sistema productivo
- Cada sistema mantiene su propósito específico
- Fácil de implementar y mantener

**Desventajas:**
- Posible duplicación de datos
- Coordinadores deben consultar ambos sistemas

**Flujo:**
```
┌─────────────────────────────────┐
│  MÉDICO declara disponibilidad  │
│  (disponibilidad_medica)        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  COORDINADOR revisa y aprueba   │
│  (marca como REVISADO)          │
└──────────────┬──────────────────┘
               │
               ▼ (referencia manual)
┌─────────────────────────────────┐
│  COORDINADOR carga horario      │
│  (ctr_horario + ctr_horario_det)│
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  SISTEMA genera slots           │
│  (vw_slots_disponibles_chatbot) │
└─────────────────────────────────┘
```

**Implementación:**
```java
// Backend: Coordinador puede ver disponibilidades aprobadas
@GetMapping("/coordinador/disponibilidades-revisadas")
public ResponseEntity<?> obtenerDisponibilidadesRevisadas(
    @RequestParam String periodo) {

    List<DisponibilidadResponse> disponibilidades =
        disponibilidadService.listarRevisadasPorPeriodo(periodo);

    // Coordinador usa esto como referencia para cargar ctr_horario
    return ResponseEntity.ok(disponibilidades);
}

// Frontend: Panel del coordinador muestra ambos sistemas
<div className="grid grid-cols-2 gap-4">
    <DisponibilidadesRevisadas periodo={periodo} />
    <HorariosC argados periodo={periodo} />
</div>
```

### Opción 2: Sincronización Unidireccional

**Ventajas:**
- Reduce duplicación
- Automatiza carga de horarios
- Médicos tienen visibilidad directa de slots

**Desventajas:**
- Requiere mapeo complejo de datos
- Riesgo de inconsistencias
- Difícil mantenimiento

**Flujo:**
```
┌─────────────────────────────────┐
│  MÉDICO declara y envía (>=150h)│
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  COORDINADOR marca REVISADO     │
└──────────────┬──────────────────┘
               │
               ▼ TRIGGER automático
┌─────────────────────────────────┐
│  SISTEMA genera ctr_horario     │
│  desde disponibilidad_medica    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  SISTEMA genera slots           │
└─────────────────────────────────┘
```

**Implementación (ejemplo trigger):**
```sql
-- Trigger al marcar REVISADO
CREATE OR REPLACE FUNCTION fn_sincronizar_horario_aprobado()
RETURNS TRIGGER AS $$
DECLARE
    v_id_ctr_horario BIGINT;
    v_id_horario BIGINT;
    v_id_tip_turno BIGINT;
BEGIN
    -- Solo si cambia a REVISADO
    IF NEW.estado = 'REVISADO' AND OLD.estado <> 'REVISADO' THEN

        -- Obtener id_tip_turno de TRN_CHATBOT
        SELECT id_tip_turno INTO v_id_tip_turno
        FROM dim_tipo_turno
        WHERE cod_tip_turno = 'TRN_CHATBOT' AND stat_tip_turno = 'A';

        -- Crear encabezado en ctr_horario
        INSERT INTO ctr_horario (periodo, id_pers, id_area, id_servicio, id_reg_lab)
        SELECT
            NEW.periodo,
            NEW.id_pers,
            p.id_area,
            NEW.id_servicio,
            p.id_reg_lab
        FROM dim_personal_cnt p
        WHERE p.id_pers = NEW.id_pers
        RETURNING id_ctr_horario INTO v_id_ctr_horario;

        -- Crear detalles desde detalle_disponibilidad
        INSERT INTO ctr_horario_det (id_ctr_horario, fecha_dia, id_horario, id_tip_turno)
        SELECT
            v_id_ctr_horario,
            dd.fecha,
            CASE
                WHEN dd.turno = 'M' THEN (SELECT id_horario FROM dim_horario WHERE cod_horario = 'M4' LIMIT 1)
                WHEN dd.turno = 'T' THEN (SELECT id_horario FROM dim_horario WHERE cod_horario = 'T4' LIMIT 1)
                WHEN dd.turno = 'MT' THEN (SELECT id_horario FROM dim_horario WHERE cod_horario = 'MT8' LIMIT 1)
            END,
            v_id_tip_turno
        FROM detalle_disponibilidad dd
        WHERE dd.id_disponibilidad = NEW.id_disponibilidad;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sincronizar_horario_aprobado
AFTER UPDATE ON disponibilidad_medica
FOR EACH ROW
EXECUTE FUNCTION fn_sincronizar_horario_aprobado();
```

### Opción 3: Migración Total (❌ No Recomendado)

**Concepto:** Reemplazar `ctr_horario` con `disponibilidad_medica`

**Por qué NO:**
- ❌ `ctr_horario` es sistema productivo crítico para chatbot
- ❌ Requiere migración de datos históricos
- ❌ Alto riesgo de downtime
- ❌ Pérdida de funcionalidad específica (rendimiento_horario, catálogos)

---

## 💡 CASOS DE USO COMUNES

### Caso 1: Dashboard del Coordinador

**Requisito:** Mostrar disponibilidades declaradas vs horarios cargados

```javascript
// Frontend: CoordinadorDashboard.jsx
const CoordinadorDashboard = () => {
    const [periodo, setPeriodo] = useState('202601');
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [horariosCargados, setHorariosCargados] = useState([]);

    useEffect(() => {
        // Cargar disponibilidades REVISADAS
        disponibilidadService.listarRevisadasPorPeriodo(periodo)
            .then(res => setDisponibilidades(res.data));

        // Cargar horarios del sistema existente (endpoint nuevo a crear)
        horariosService.listarPorPeriodo(periodo)
            .then(res => setHorariosCargados(res.data));
    }, [periodo]);

    return (
        <div className="grid grid-cols-2 gap-6">
            <Card title="Disponibilidades Aprobadas">
                <Table data={disponibilidades} />
            </Card>
            <Card title="Horarios Cargados (Chatbot)">
                <Table data={horariosCargados} />
            </Card>
        </div>
    );
};
```

### Caso 2: Validación de Consistencia

**Requisito:** Alertar si médico declaró disponibilidad pero no tiene horario cargado

```sql
-- Query de validación
SELECT
    dm.id_pers,
    p.num_doc_pers,
    CONCAT(p.ape_pater_pers, ' ', p.ape_mater_pers, ', ', p.nom_pers) AS nombre_completo,
    dm.periodo,
    dm.total_horas AS horas_declaradas,
    COALESCE(ch.horas_totales, 0) AS horas_cargadas,
    CASE
        WHEN ch.id_ctr_horario IS NULL THEN '⚠️ SIN HORARIO CARGADO'
        WHEN dm.total_horas > ch.horas_totales + 10 THEN '⚠️ DIFERENCIA SIGNIFICATIVA'
        ELSE '✅ OK'
    END AS estado_validacion
FROM disponibilidad_medica dm
JOIN dim_personal_cnt p ON p.id_pers = dm.id_pers
LEFT JOIN ctr_horario ch ON ch.periodo = dm.periodo
    AND ch.id_pers = dm.id_pers
    AND ch.id_servicio = dm.id_servicio
WHERE dm.estado = 'REVISADO'
  AND dm.periodo = '202601'
ORDER BY estado_validacion DESC, nombre_completo;
```

```java
// Backend: Endpoint de validación
@GetMapping("/coordinador/validar-consistencia")
public ResponseEntity<?> validarConsistencia(@RequestParam String periodo) {
    List<Map<String, Object>> inconsistencias =
        jdbcTemplate.queryForList(SQL_VALIDACION, periodo);

    return ResponseEntity.ok(Map.of(
        "periodo", periodo,
        "total", inconsistencias.size(),
        "inconsistencias", inconsistencias
    ));
}
```

### Caso 3: Consulta de Disponibilidad vs Slots

**Requisito:** Médico ve su disponibilidad declarada y slots reales generados

```javascript
// Frontend: MiDisponibilidad.jsx
const MiDisponibilidad = () => {
    const [periodo, setPeriodo] = useState('202601');
    const [miDisponibilidad, setMiDisponibilidad] = useState(null);
    const [misSlotsReales, setMisSlotsReales] = useState([]);

    useEffect(() => {
        // Disponibilidad declarada
        disponibilidadService.obtenerMiDisponibilidad(periodo)
            .then(res => setMiDisponibilidad(res.data));

        // Slots reales del chatbot (endpoint nuevo a crear)
        slotsService.obtenerMisSlots(periodo)
            .then(res => setMisSlotsReales(res.data));
    }, [periodo]);

    return (
        <div>
            <h2>Mi Disponibilidad Declarada</h2>
            {miDisponibilidad && (
                <div>
                    <p>Estado: <Badge>{miDisponibilidad.estado}</Badge></p>
                    <p>Total horas: {miDisponibilidad.totalHoras}</p>
                </div>
            )}

            <h2>Slots Generados en Chatbot</h2>
            <p className="text-sm text-gray-600">
                Estos slots son los que los pacientes verán disponibles
            </p>
            <Timeline slots={misSlotsReales} />
        </div>
    );
};
```

### Caso 4: Reportes Comparativos

**Requisito:** Generar reporte mensual de disponibilidades vs carga real

```sql
-- Reporte comparativo mensual
WITH declarado AS (
    SELECT
        dm.id_pers,
        dm.id_servicio,
        dm.periodo,
        dm.total_horas AS horas_declaradas,
        dm.estado
    FROM disponibilidad_medica dm
    WHERE dm.periodo = '202601'
),
cargado AS (
    SELECT
        ch.id_pers,
        ch.id_servicio,
        ch.periodo,
        ch.horas_totales AS horas_cargadas
    FROM ctr_horario ch
    WHERE ch.periodo = '202601'
),
slots_usados AS (
    SELECT
        sc.id_pers,
        COUNT(*) AS total_citas,
        SUM(
            CASE
                WHEN est.cod_estado IN ('ATENDIDO', 'CONFIRMADO') THEN 1
                ELSE 0
            END
        ) AS citas_efectivas
    FROM solicitud_cita sc
    JOIN dim_estado_cita est ON est.id_estado_cita = sc.id_estado_cita
    WHERE TO_CHAR(sc.fecha_cita, 'YYYYMM') = '202601'
    GROUP BY sc.id_pers
)
SELECT
    p.num_doc_pers,
    CONCAT(p.ape_pater_pers, ' ', p.ape_mater_pers, ', ', p.nom_pers) AS nombre_completo,
    s.desc_servicio AS especialidad,
    d.horas_declaradas,
    c.horas_cargadas,
    su.total_citas,
    su.citas_efectivas,
    ROUND((su.citas_efectivas::numeric / NULLIF(c.horas_cargadas, 0)) * 100, 2) AS tasa_efectividad,
    d.estado AS estado_declaracion
FROM dim_personal_cnt p
LEFT JOIN declarado d ON d.id_pers = p.id_pers
LEFT JOIN cargado c ON c.id_pers = p.id_pers AND c.id_servicio = d.id_servicio
LEFT JOIN slots_usados su ON su.id_pers = p.id_pers
LEFT JOIN dim_servicio_essi s ON s.id_servicio = COALESCE(d.id_servicio, c.id_servicio)
WHERE d.id_pers IS NOT NULL OR c.id_pers IS NOT NULL
ORDER BY nombre_completo;
```

---

## 🛠️ ENDPOINTS NUEVOS A CREAR

### Para Coordinadores

```java
// HorariosController.java (nuevo)
@RestController
@RequestMapping("/api/horarios")
public class HorariosController {

    // Listar horarios del sistema existente
    @GetMapping("/periodo/{periodo}")
    public ResponseEntity<?> listarPorPeriodo(@PathVariable String periodo) {
        // Query a ctr_horario + ctr_horario_det
    }

    // Validar consistencia disponibilidad vs horarios
    @GetMapping("/validar-consistencia/{periodo}")
    public ResponseEntity<?> validarConsistencia(@PathVariable String periodo) {
        // Query comparativo
    }

    // Obtener slots generados por profesional
    @GetMapping("/slots/profesional/{idPers}")
    public ResponseEntity<?> obtenerSlotsPorProfesional(
        @PathVariable Long idPers,
        @RequestParam String fechaInicio,
        @RequestParam String fechaFin) {
        // Query a vw_slots_disponibles_chatbot
    }
}
```

### Para Médicos

```java
// MisSlotsController.java (nuevo)
@RestController
@RequestMapping("/api/mis-slots")
public class MisSlotsController {

    // Ver mis slots generados en el chatbot
    @GetMapping
    public ResponseEntity<?> obtenerMisSlots(@RequestParam String periodo) {
        Long idPers = obtenerIdPersAutenticado();
        // Query a vw_slots_disponibles_chatbot filtrando por id_pers
    }

    // Estadísticas de uso de slots
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas(@RequestParam String periodo) {
        // Total slots generados vs slots usados vs slots disponibles
    }
}
```

---

## 📋 CHECKLIST DE INTEGRACIÓN

### Para Disponibilidad Médica

- [ ] ✅ Crear tablas `disponibilidad_medica` + `detalle_disponibilidad`
- [ ] ✅ Implementar backend (Service + Controller)
- [ ] ✅ Implementar frontend (Médico + Coordinador)
- [ ] ⚠️ Decidir estrategia de integración (Opción 1/2/3)
- [ ] ⚠️ Si Opción 2: Crear trigger de sincronización
- [ ] ⚠️ Crear endpoints de consulta a `ctr_horario`
- [ ] ⚠️ Implementar validación de consistencia
- [ ] ⚠️ Crear reportes comparativos
- [ ] ⚠️ Testing integral

### Para Solicitud de Turnos

- [ ] Consultar disponibilidades REVISADAS
- [ ] Consultar slots disponibles en chatbot
- [ ] Validar que médico tenga horario cargado
- [ ] Generar solicitud en ambos sistemas (si aplica)

### Para Trazabilidad Clínica

- [ ] Validar que atención sea en horario declarado
- [ ] Relacionar atención con slot reservado
- [ ] Auditar discrepancias

---

## 🔍 QUERIES ÚTILES PARA DEBUGGING

### Ver disponibilidad + horario de un médico

```sql
SELECT
    'DISPONIBILIDAD' AS tipo,
    dm.periodo,
    dm.id_servicio,
    dm.total_horas AS horas,
    dm.estado,
    NULL AS slots_generados
FROM disponibilidad_medica dm
WHERE dm.id_pers = 123 AND dm.periodo = '202601'

UNION ALL

SELECT
    'HORARIO CARGADO' AS tipo,
    ch.periodo,
    ch.id_servicio,
    ch.horas_totales AS horas,
    NULL AS estado,
    (SELECT COUNT(*) FROM ctr_horario_det d WHERE d.id_ctr_horario = ch.id_ctr_horario) AS slots_generados
FROM ctr_horario ch
WHERE ch.id_pers = 123 AND ch.periodo = '202601'

UNION ALL

SELECT
    'SLOTS CHATBOT' AS tipo,
    TO_CHAR(s.fecha_cita, 'YYYYMM') AS periodo,
    s.id_servicio,
    NULL AS horas,
    NULL AS estado,
    COUNT(*) AS slots_generados
FROM vw_slots_disponibles_chatbot s
WHERE s.id_pers = 123
  AND TO_CHAR(s.fecha_cita, 'YYYYMM') = '202601'
GROUP BY TO_CHAR(s.fecha_cita, 'YYYYMM'), s.id_servicio;
```

### Detectar médicos con disponibilidad pero sin slots

```sql
SELECT
    p.num_doc_pers,
    CONCAT(p.ape_pater_pers, ' ', p.nom_pers) AS nombre,
    dm.periodo,
    dm.total_horas AS horas_declaradas,
    COALESCE(slots.total_slots, 0) AS slots_generados
FROM disponibilidad_medica dm
JOIN dim_personal_cnt p ON p.id_pers = dm.id_pers
LEFT JOIN (
    SELECT id_pers, TO_CHAR(fecha_cita, 'YYYYMM') AS periodo, COUNT(*) AS total_slots
    FROM vw_slots_disponibles_chatbot
    GROUP BY id_pers, TO_CHAR(fecha_cita, 'YYYYMM')
) slots ON slots.id_pers = dm.id_pers AND slots.periodo = dm.periodo
WHERE dm.estado = 'REVISADO'
  AND dm.periodo = '202601'
  AND COALESCE(slots.total_slots, 0) = 0;
```

---

## 📚 RECURSOS ADICIONALES

### Documentación relacionada

1. **Modelo existente detallado:** `spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`
2. **Plan disponibilidad médica:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
3. **Guía operativa original:** Ver PDF del administrador de BD

### Scripts SQL útiles

- Todos los scripts de validación están en `01_modelo_horarios_existente.md` sección 7
- Scripts de creación de tablas en `spec/04_BaseDatos/06_scripts/`

---

## ⚠️ ADVERTENCIAS IMPORTANTES

1. **NO modificar `ctr_horario` directamente** sin validar con el equipo de chatbot
2. **NO eliminar datos** de `ctr_horario` en producción sin backup
3. **Validar siempre** que existe `TRN_CHATBOT` activo antes de cargar horarios
4. **Consultar primero** `rendimiento_horario` para entender capacidad de slots
5. **Testing exhaustivo** antes de sincronización automática (Opción 2)

---

**Fin de la guía**

*Esta guía debe actualizarse cada vez que se implemente una nueva integración con el sistema de horarios.*

---

*EsSalud Perú - CENATE | Ing. Styp Canto Rondón*
*Versión 1.0.0 | 2026-01-03*
