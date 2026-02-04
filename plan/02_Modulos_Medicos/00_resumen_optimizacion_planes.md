# Resumen: Optimización de Planes de Módulos Médicos

**Fecha:** 2026-01-03
**Responsable:** Ing. Styp Canto Rondón
**Versión:** 1.0.0

---

## 📋 CONTEXTO

### Situación Inicial

Existían **3 documentos separados** relacionados con horarios y disponibilidad médica:

1. **Plan 01** - `01_plan_disponibilidad_turnos.md` (v1.0.0)
   - Módulo de declaración de disponibilidad médica
   - 762 líneas, 0% implementado
   - Estados: BORRADOR → ENVIADO → REVISADO
   - Sin integración con sistema de horarios existente

2. **Plan 02** - `02_plan_solicitud_turnos.md` (v1.2)
   - Sistema de solicitud de turnos IPRESS
   - 446 líneas, **100% implementado**
   - Sistema independiente para instituciones externas

3. **Nueva Propuesta** - Integración con `ctr_horario` (chatbot)
   - Plan de 11 días creado por agente arquitecto
   - Sincronización con sistema productivo de slots
   - Documentación de 3 archivos en `spec/04_BaseDatos/07_horarios_sistema/`

### Pregunta del Usuario

> "esta nueva propuesta puede fusionarse o reemplazar a estos planes? 01_plan_disponibilidad_turnos.md y 02_plan_solicitud_turnos.md, como arquitecto quiero que optimices planes"

---

## 🎯 DECISIÓN ARQUITECTÓNICA

### ✅ OPCIÓN EJECUTADA: Fusionar Integración con Plan 01

**Razones:**

1. **Plan 02 es independiente y completo:**
   - 100% implementado en producción
   - Propósito diferente: IPRESS solicitan turnos a CENATE
   - Flujo: Institución Externa → Coordinador Red → Asignación
   - **No debe modificarse**

2. **Plan 01 complementa naturalmente la integración:**
   - 0% implementado, en fase de diseño
   - Mismo propósito: Médicos declaran su disponibilidad
   - Flujo natural: Declaración → Revisión → Sincronización → Chatbot
   - Beneficio de fusión: **Plan unificado** sin redundancias

3. **Beneficios de la fusión:**
   - ✅ Elimina documentación duplicada
   - ✅ Un solo flujo cohesivo de principio a fin
   - ✅ Implementación coordinada (12 días en vez de 11+10)
   - ✅ Única fuente de verdad para disponibilidad médica

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### ANTES de la Optimización

```
plan/02_Modulos_Medicos/
├── 01_plan_disponibilidad_turnos.md (v1.0.0) ← 762 líneas
│   └── Declaración médica BÁSICA (sin chatbot)
│
├── 02_plan_solicitud_turnos.md (v1.2) ← 446 líneas
│   └── Solicitud IPRESS (100% implementado)
│
└── Nueva propuesta por separado ← Plan de 11 días
    └── Integración con ctr_horario (chatbot)
```

**Problemas identificados:**
- ⚠️ Dos planes separados para un mismo flujo
- ⚠️ Riesgo de implementar disponibilidad médica sin integración
- ⚠️ Documentación duplicada entre Plan 01 y propuesta
- ⚠️ Coordinación compleja entre 2 implementaciones

### DESPUÉS de la Optimización

```
plan/02_Modulos_Medicos/
├── 00_resumen_optimizacion_planes.md (NUEVO) ← Este documento
│   └── Explica la decisión arquitectónica
│
├── 01_plan_disponibilidad_turnos.md (v2.0.0) ← 1,760 líneas
│   ├── Declaración médica (original)
│   └── Integración chatbot (fusionado) ← ¡OPTIMIZADO!
│
└── 02_plan_solicitud_turnos.md (v1.2) ← SIN CAMBIOS
    └── Solicitud IPRESS (100% implementado, independiente)
```

**Ventajas logradas:**
- ✅ Plan unificado y cohesivo
- ✅ Implementación coordinada (12 días)
- ✅ Documentación consolidada
- ✅ Separación clara: médicos (Plan 01) vs IPRESS (Plan 02)

---

## 🔄 CAMBIOS REALIZADOS EN PLAN 01 (v2.0.0)

### Estadísticas

| Métrica | Antes (v1.0.0) | Después (v2.0.0) | Cambio |
|---------|----------------|------------------|--------|
| **Líneas** | 762 | 1,760 | +998 (+131%) |
| **Secciones** | 11 | 13 | +2 |
| **Archivos Backend** | 14 | 27 | +13 |
| **Archivos Frontend** | 3 | 6 | +3 |
| **Días Implementación** | 10 | 12 | +2 |
| **Fases** | 6 | 7 | +1 |
| **Estados Workflow** | 3 | 4 | +1 (SINCRONIZADO) |

### Nuevos Componentes Agregados

#### 1. Modelo de Datos (Sección 3)

**Nueva tabla:**
```sql
CREATE TABLE sincronizacion_horario_log (
    id_sincronizacion BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL,
    id_ctr_horario BIGINT,
    tipo_operacion VARCHAR(20),  -- CREACION, ACTUALIZACION
    resultado VARCHAR(20),        -- EXITOSO, FALLIDO, PARCIAL
    detalles_operacion JSONB,    -- Log detallado
    usuario_sincronizacion VARCHAR(50),
    fecha_sincronizacion TIMESTAMP,
    errores TEXT
);
```

**Nueva vista comparativa:**
```sql
CREATE OR REPLACE VIEW vw_disponibilidad_vs_horario AS
SELECT
    dm.id_disponibilidad,
    dm.total_horas AS horas_declaradas,
    COALESCE(SUM(h.horas), 0) AS horas_cargadas_chatbot,
    dm.id_ctr_horario_generado,
    dm.fecha_sincronizacion,
    CASE
        WHEN dm.id_ctr_horario_generado IS NULL THEN 'SIN_HORARIO_CARGADO'
        WHEN ABS(dm.total_horas - SUM(h.horas)) > 10 THEN 'DIFERENCIA_SIGNIFICATIVA'
        ELSE 'CONSISTENTE'
    END AS estado_validacion
FROM disponibilidad_medica dm
LEFT JOIN ctr_horario_det chd ON [...]
WHERE dm.estado IN ('REVISADO', 'SINCRONIZADO');
```

**Columnas agregadas a `disponibilidad_medica`:**
- `fecha_sincronizacion TIMESTAMP WITH TIME ZONE`
- `id_ctr_horario_generado BIGINT` (FK a ctr_horario)

#### 2. Backend - Nuevos Componentes (Sección 4)

**Entidades de integración (7 nuevas):**
- `CtrHorario.java` - Tabla de slots del chatbot
- `CtrHorarioDet.java` - Detalle de cada slot
- `DimHorario.java` - Catálogo de horarios (158, 131, 200A)
- `DimTipoTurno.java` - Tipos de turno (TRN_CHATBOT)
- `SincronizacionHorarioLog.java` - Log de sincronizaciones
- `DimArea.java` - Áreas de atención
- `CtrPeriodo.java` - Periodos de carga

**DTOs (3 nuevos):**
- `SincronizacionRequest.java`
- `SincronizacionResponse.java`
- `ComparativoDisponibilidadHorarioResponse.java`

**Servicio crítico de integración:**
```java
@Service
public class IntegracionHorarioServiceImpl {

    public SincronizacionResponse sincronizarDisponibilidadAHorario(
        Long idDisponibilidad,
        Long idArea
    ) {
        // 1. Validar estado REVISADO
        // 2. Mapear turnos: M→158, T→131, MT→200A
        // 3. Crear/actualizar ctr_horario con tipo TRN_CHATBOT
        // 4. Generar ctr_horario_det (slots)
        // 5. Actualizar estado a SINCRONIZADO
        // 6. Registrar log JSONB
        // 7. Retornar resultado con estadísticas
    }

    private Long mapearTurnoAHorario(String turno) {
        String codHorario = switch(turno) {
            case "M" -> "158";   // 6h mañana
            case "T" -> "131";   // 6h tarde
            case "MT" -> "200A"; // 12h completo
            default -> throw new IllegalArgumentException();
        };
        return dimHorarioRepository.findByCodHorario(codHorario)
            .orElseThrow().getIdHorario();
    }
}
```

**Controlador (1 nuevo):**
```java
@RestController
@RequestMapping("/api/integracion-horarios")
public class IntegracionHorarioController {

    @PostMapping("/sincronizar")
    public ResponseEntity<?> sincronizarDisponibilidad(...)

    @GetMapping("/comparativo/{idDisponibilidad}")
    public ResponseEntity<?> obtenerComparativo(...)

    @GetMapping("/comparativo/periodo/{periodo}")
    public ResponseEntity<?> obtenerComparativosPorPeriodo(...)

    @GetMapping("/historial/{idDisponibilidad}")
    public ResponseEntity<?> obtenerHistorial(...)
}
```

#### 3. Frontend - Nuevos Componentes (Sección 5)

**Servicio de integración:**
```javascript
// integracionHorarioService.js
export const sincronizar = (request) =>
    api.post('/integracion-horarios/sincronizar', request);

export const obtenerComparativo = (idDisponibilidad) =>
    api.get(`/integracion-horarios/comparativo/${idDisponibilidad}`);
```

**Modal de sincronización:**
```jsx
const ModalSincronizacion = ({ disponibilidad, onSincronizar, onClose }) => {
    // 1. Seleccionar área de atención
    // 2. Mostrar resumen pre-sincronización
    // 3. Confirmar operación
    // 4. Mostrar resultado con estadísticas
};
```

**Vista comparativa:**
```jsx
const ComparativoDisponibilidadHorario = ({ periodo }) => {
    // Tabla comparativa:
    // - Médico
    // - Especialidad
    // - Horas declaradas
    // - Horas en chatbot
    // - Slots generados
    // - Estado validación
};
```

#### 4. Integración con Sistema Existente (Sección 6 - NUEVA)

**Estrategia:** Sistemas Independientes con Sincronización Manual Opcional

**Flujo completo:**
```
1. Médico declara disponibilidad → estado BORRADOR
2. Envía a coordinador → estado ENVIADO
3. Coordinador revisa/ajusta → estado REVISADO
4. Coordinador sincroniza (OPCIONAL) → estado SINCRONIZADO
5. Se genera ctr_horario + ctr_horario_det
6. Slots aparecen en vw_slots_disponibles_chatbot
7. Chatbot muestra slots a pacientes
```

**Reglas de negocio añadidas:**
- RN-06: Integración opcional con chatbot
- Solo disponibilidades en estado REVISADO pueden sincronizarse
- Sincronización manual controlada por coordinador
- Log JSONB completo de cada operación
- Vista comparativa para validación

#### 5. Plan de Implementación Actualizado (Sección 7)

**Nueva duración:** 12 días (era 10)

**Nueva fase agregada:**
- **Fase 6** (Días 10-11): Integración con Horarios Chatbot
  - Implementar servicio de sincronización
  - Crear endpoints de integración
  - Desarrollar componentes React de comparación
  - Testing de sincronización

#### 6. Riesgos Añadidos (Sección 9)

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Inconsistencia entre sistemas | Media | Alto | Vista comparativa + validaciones |
| Error en mapeo de turnos | Baja | Crítico | Validación automática M/T/MT → cod_horario |
| Sincronización duplicada | Media | Medio | Validación estado REVISADO, log único |
| Slots no aparecen en chatbot | Media | Alto | Validar tipo TRN_CHATBOT, query de prueba |

---

## 📚 DOCUMENTACIÓN RELACIONADA

### Creada Previamente (Base para Fusión)

1. **`spec/04_BaseDatos/07_horarios_sistema/README.md`**
   - Índice y guía de uso de documentación de horarios
   - Comparación rápida: sistema existente vs nuevo módulo

2. **`spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`**
   - Modelo completo de `ctr_horario` y tablas relacionadas
   - 50+ consultas SQL de validación y troubleshooting
   - Checklist operativo para carga de horarios

3. **`spec/04_BaseDatos/07_horarios_sistema/02_guia_integracion_horarios.md`**
   - 3 estrategias de integración (elegimos Opción 1)
   - Ejemplos de código Java, SQL y React
   - Casos de uso comunes
   - Endpoints necesarios

### Actualizada en Esta Optimización

4. **`plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0)**
   - Plan unificado: Disponibilidad + Integración
   - 1,760 líneas, 35 archivos a crear
   - Implementación de 12 días en 7 fases

### Creada en Esta Optimización

5. **`plan/02_Modulos_Medicos/00_resumen_optimizacion_planes.md` (Este documento)**
   - Explica la decisión arquitectónica
   - Compara antes vs después
   - Documenta cambios realizados

---

## 🎯 RESULTADOS DE LA OPTIMIZACIÓN

### Antes: Fragmentación

```
Desarrollador 1: Lee Plan 01 (disponibilidad)
Desarrollador 2: Lee propuesta integración
Coordinación: ¿Cuándo se implementan?
Riesgo: Implementar Plan 01 sin integración
```

### Después: Cohesión

```
Desarrollador: Lee Plan 01 v2.0.0 (TODO incluido)
Implementación: 12 días coordinados
Resultado: Disponibilidad + Integración + Chatbot = Sistema completo
```

### Métricas de Éxito

| Objetivo | Resultado |
|----------|-----------|
| Eliminar redundancia | ✅ 1 plan en vez de 2 separados |
| Mantener Plan 02 independiente | ✅ Sin cambios (100% implementado) |
| Unificar flujo médico | ✅ BORRADOR → ENVIADO → REVISADO → SINCRONIZADO |
| Documentar integración | ✅ Sección 6 completa + componentes |
| Incrementar cobertura | ✅ +13 archivos backend, +3 frontend |
| Plan de implementación | ✅ 12 días cohesivos en 7 fases |

---

## ⚠️ IMPORTANTE: NO CONFUNDIR

### Sistema 1: Disponibilidad + Integración (Plan 01 v2.0.0)

**Propósito:** Médicos declaran disponibilidad → Coordinadores sincronizan → Chatbot

**Tablas principales:**
- `disponibilidad_medica` (nueva)
- `detalle_disponibilidad` (nueva)
- `sincronizacion_horario_log` (nueva)
- `ctr_horario` (existente, destino)
- `ctr_horario_det` (existente, destino)

**Usuarios:** Médicos + Coordinadores

**Estado:** 0% implementado (Plan v2.0.0 listo para iniciar)

### Sistema 2: Solicitud de Turnos IPRESS (Plan 02 v1.2)

**Propósito:** IPRESS externas solicitan turnos a CENATE

**Tablas principales:**
- `solicitud_turnos`
- `detalle_solicitud_turnos`
- `estado_solicitud`

**Usuarios:** Coordinadores de Red + Instituciones Externas

**Estado:** 100% implementado y en producción

---

## 📋 CHECKLIST PARA FUTURA IMPLEMENTACIÓN

### Antes de Iniciar (Preparación)

- [ ] Leer `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0) completo
- [ ] Leer `spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`
- [ ] Leer `spec/04_BaseDatos/07_horarios_sistema/02_guia_integracion_horarios.md`
- [ ] Verificar acceso a base de datos `maestro_cenate` (10.0.89.241)
- [ ] Confirmar existencia de tipos de turno TRN_CHATBOT en `dim_tipo_turno`
- [ ] Confirmar catálogo de horarios (158, 131, 200A) en `dim_horario`

### Durante Implementación (12 días)

- [ ] Día 1-2: Modelo de datos + migraciones SQL
- [ ] Día 3-4: Entidades JPA + repositorios base
- [ ] Día 5-6: Servicios de disponibilidad (sin integración)
- [ ] Día 7-8: API REST + frontend básico
- [ ] Día 9: Workflow completo (BORRADOR → ENVIADO → REVISADO)
- [ ] Día 10-11: **Integración con horarios** (sincronización, log, vista comparativa)
- [ ] Día 12: Testing integral + documentación

### Después de Implementación (Validación)

- [ ] Crear disponibilidad de prueba
- [ ] Enviar → Revisar → Sincronizar
- [ ] Verificar creación de `ctr_horario` y `ctr_horario_det`
- [ ] Ejecutar query de `vw_slots_disponibles_chatbot`
- [ ] Validar que slots aparecen en chatbot
- [ ] Revisar logs de `sincronizacion_horario_log` (JSONB)
- [ ] Comparar horas declaradas vs horas cargadas
- [ ] Actualizar `checklist/01_Historial/01_changelog.md`

---

## 🔗 REFERENCIAS CRUZADAS

| Documento | Propósito | Cuándo Usar |
|-----------|-----------|-------------|
| Este documento | Decisión arquitectónica | Entender por qué se optimizó así |
| `01_plan_disponibilidad_turnos.md` (v2.0.0) | Plan de implementación completo | Implementar el módulo |
| `02_plan_solicitud_turnos.md` (v1.2) | Sistema IPRESS (independiente) | Trabajar con solicitudes externas |
| `spec/04_BaseDatos/07_horarios_sistema/` | Sistema chatbot existente | Debugging, validaciones SQL |

---

## 📝 HISTORIAL DE VERSIONES

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0.0 | 2026-01-03 | Creación inicial post-optimización | Ing. Styp Canto Rondón |

---

## 📧 CONTACTO

Para dudas sobre esta optimización:
- **Arquitecto/Developer Lead:** Ing. Styp Canto Rondón
- **Referencia:** Decisión aprobada 2026-01-03

---

*Esta documentación es parte del proyecto CENATE - Sistema de Telemedicina EsSalud Perú*
