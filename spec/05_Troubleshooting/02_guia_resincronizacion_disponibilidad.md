# Guía Técnica: Resincronización de Disponibilidad Médica

> **Problema Resuelto**: BUG #4 - Resincronización no funcional
> **Componente**: Backend (Spring Boot + JPA/Hibernate)
> **Fecha Resolución**: 2026-01-04
> **Versión**: v1.17.0
> **Autor**: Ing. Styp Canto Rondón

---

## 📚 Índice

1. [Contexto del Problema](#contexto-del-problema)
2. [Síntomas y Evidencia](#síntomas-y-evidencia)
3. [Análisis de Causa Raíz](#análisis-de-causa-raíz)
4. [Intentos de Solución Fallidos](#intentos-de-solución-fallidos)
5. [Solución Final Implementada](#solución-final-implementada)
6. [Explicación Técnica Detallada](#explicación-técnica-detallada)
7. [Implementación Paso a Paso](#implementación-paso-a-paso)
8. [Verificación y Testing](#verificación-y-testing)
9. [Lecciones Aprendidas](#lecciones-aprendidas)
10. [Prevención de Problemas Similares](#prevención-de-problemas-similares)

---

## 🎯 Contexto del Problema

### Sistema Afectado

**Módulo**: Disponibilidad Médica + Integración Chatbot

**Flujo Normal**:
1. Médico crea disponibilidad (estado BORRADOR)
2. Médico envía (estado ENVIADO)
3. Coordinador marca como REVISADO
4. Coordinador sincroniza → crea registros en `ctr_horario` y `ctr_horario_det`
5. Chatbot genera 864 slots a partir de `ctr_horario_det`

**Flujo Problemático (Resincronización)**:
- Médico modifica disponibilidad ya sincronizada (ejemplo: cambia turnos)
- Coordinador necesita **resincronizar** para actualizar horarios del chatbot
- Sistema debe **eliminar** detalles anteriores y **crear** nuevos detalles
- **AQUÍ FALLABA**: La transacción se abortaba por errores de duplicados

### Tablas Involucradas

```sql
-- Tabla 1: Disponibilidad creada por médico
disponibilidad_medica (
    id_disponibilidad SERIAL PRIMARY KEY,
    pk_personal INTEGER,
    periodo VARCHAR(6),
    estado VARCHAR(20),
    horas_totales NUMERIC(5,2)
)

-- Tabla 2: Detalles de disponibilidad (18 días)
disponibilidad_detalle (
    id_detalle SERIAL PRIMARY KEY,
    id_disponibilidad INTEGER REFERENCES disponibilidad_medica,
    fecha DATE,
    turno VARCHAR(2)  -- 'M', 'T', 'MT'
)

-- Tabla 3: Horario sincronizado para chatbot
ctr_horario (
    id_ctr_horario SERIAL PRIMARY KEY,
    pk_personal INTEGER,
    periodo VARCHAR(6),
    horas_totales NUMERIC(5,2),
    id_disponibilidad INTEGER REFERENCES disponibilidad_medica
)

-- Tabla 4: Detalles de horario chatbot (18 días)
ctr_horario_det (
    id_ctr_horario_det SERIAL PRIMARY KEY,
    id_ctr_horario INTEGER REFERENCES ctr_horario,
    fecha_dia DATE,
    horario_dia INTEGER,  -- 158 (M), 131 (T), 200A (MT)
    horas NUMERIC(4,2),
    id_tipo_turno INTEGER  -- Debe ser TRN_CHATBOT
)
```

---

## 🔴 Síntomas y Evidencia

### Error Observado

```
ERROR: current transaction is aborted, commands ignored until end of transaction block

org.postgresql.util.PSQLException: ERROR: current transaction is aborted, commands ignored until end of transaction block
    at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2675)
    at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2365)
    at com.styp.cenate.service.integracion.IntegracionHorarioServiceImpl.sincronizar(IntegracionHorarioServiceImpl.java:145)
```

### Resultado de la Operación

```json
{
  "resultado": "ERROR",
  "tipoOperacion": "ACTUALIZACION",
  "detalles_procesados": 18,
  "detalles_creados": 1,       // ❌ Debería ser 18
  "detalles_con_error": 17,    // ❌ 17 inserts fallaron
  "horas_sincronizadas": 12,   // ❌ Debería ser 216h
  "errores": [
    "Unable to bind parameter #2 - fecha_dia: 2026-01-07",
    "Unable to bind parameter #2 - fecha_dia: 2026-01-08",
    ...
  ]
}
```

### Evidencia en Logs

```
2026-01-04 09:30:15 INFO  IntegracionHorarioServiceImpl - 🔄 Modo ACTUALIZACION detectado - Horario #316 tiene 18 detalles anteriores
2026-01-04 09:30:15 INFO  IntegracionHorarioServiceImpl - 🗑️ Ejecutando DELETE masivo de detalles anteriores
2026-01-04 09:30:15 DEBUG Hibernate - delete from ctr_horario_det where id_ctr_horario=?
2026-01-04 09:30:15 INFO  IntegracionHorarioServiceImpl - ✅ Detalles anteriores eliminados
2026-01-04 09:30:15 INFO  IntegracionHorarioServiceImpl - 📝 Insertando 18 detalles nuevos...
2026-01-04 09:30:15 ERROR Hibernate - ERROR: duplicate key value violates unique constraint "ctr_horario_det_pkey"
2026-01-04 09:30:15 ERROR Hibernate - Detail: Key (id_ctr_horario_det)=(6850) already exists.
2026-01-04 09:30:15 ERROR IntegracionHorarioServiceImpl - ❌ Error al sincronizar: current transaction is aborted
```

### Datos en Base de Datos

```sql
-- Antes de resincronizar: 18 detalles correctos
SELECT COUNT(*) FROM ctr_horario_det WHERE id_ctr_horario = 316;
-- Resultado: 18

-- Después de resincronizar: Solo 1 detalle (los demás no se insertaron)
SELECT COUNT(*) FROM ctr_horario_det WHERE id_ctr_horario = 316;
-- Resultado: 1  ❌ PROBLEMA

-- Verificar IDs de detalles que quedaron "huérfanos"
SELECT id_ctr_horario_det FROM ctr_horario_det WHERE id_ctr_horario = 316;
-- Resultado: Solo ID 6869 existe (el primero insertado antes del error)
```

---

## 🔍 Análisis de Causa Raíz

### Problema Fundamental: Desincronización del Persistence Context

JPA/Hibernate mantiene un **persistence context** (contexto de persistencia) que es una caché de primer nivel donde trackea el estado de todas las entidades cargadas en memoria.

**Ciclo de vida de una entidad JPA**:
```
NEW → MANAGED → DETACHED → REMOVED
```

El problema ocurre cuando ejecutamos operaciones que **modifican la base de datos directamente** (bulk operations) sin actualizar el persistence context.

### Código Problemático Original

```java
// IntegracionHorarioServiceImpl.java (ANTES DEL FIX)

@Transactional
public SincronizacionResponse sincronizar(Long idDisponibilidad) {
    // PASO 1: Cargar horario existente (entidad MANAGED)
    CtrHorario horario = ctrHorarioRepository.findByIdDisponibilidad(idDisponibilidad)
        .orElseThrow(() -> new NotFoundException("Horario no encontrado"));

    // PASO 2: Detectar que es ACTUALIZACION
    String tipoOperacion = "ACTUALIZACION";
    log.info("🔄 Modo ACTUALIZACION - {} detalles anteriores", horario.getDetalles().size());

    // PASO 3: DELETE masivo (AQUÍ ESTÁ EL PROBLEMA)
    ctrHorarioDetRepository.deleteByHorario(horario);  // ❌ SQL directo
    log.info("🗑️ Detalles eliminados");

    // PASO 4: INSERT nuevos detalles
    for (DisponibilidadDetalle detalle : disponibilidad.getDetalles()) {
        CtrHorarioDet nuevoDetalle = new CtrHorarioDet();
        // ... configurar detalle ...
        horario.getDetalles().add(nuevoDetalle);  // ❌ Colección aún tiene refs anteriores
    }

    // PASO 5: Guardar (FALLA AQUÍ)
    ctrHorarioRepository.save(horario);  // ❌ ConstraintViolationException
}
```

### ¿Por qué Falla?

#### 1. DELETE masivo no actualiza persistence context

```java
// Método en repository (Spring Data JPA derived query)
void deleteByHorario(CtrHorario horario);

// Se traduce a SQL DIRECTO:
DELETE FROM ctr_horario_det WHERE id_ctr_horario = 316;

// PERO:
// - Las entidades en memoria (horario.getDetalles()) siguen "MANAGED"
// - Hibernate NO sabe que fueron eliminadas de BD
// - El persistence context cree que aún existen
```

#### 2. INSERT posterior detecta duplicados

```java
// Al intentar INSERT de nuevos detalles:
for (DisponibilidadDetalle detalle : disponibilidad.getDetalles()) {
    CtrHorarioDet nuevoDetalle = new CtrHorarioDet();
    nuevoDetalle.setIdCtrHorarioDet(null);  // Hibernate generará nuevo ID
    nuevoDetalle.setFechaDia(detalle.getFecha());
    // ...
    horario.getDetalles().add(nuevoDetalle);
}

// Hibernate detecta:
// - Colección horario.getDetalles() aún tiene referencias a entidades viejas
// - Nuevos elementos agregados a la misma colección
// - Al flush(), intenta:
//   1. UPDATE de entidades viejas (que ya no existen en BD) → ERROR
//   2. INSERT de entidades nuevas (algunos IDs ya existen) → ERROR
```

#### 3. Transacción se aborta

```
ERROR: current transaction is aborted, commands ignored until end of transaction block
```

Esto significa que PostgreSQL detectó un error y marcó toda la transacción como abortada. Cualquier comando posterior (INSERT/UPDATE/DELETE) es rechazado hasta que haya un ROLLBACK.

### Diagrama del Problema

```
┌─────────────────────────────────────────────────────────────────┐
│ PERSISTENCE CONTEXT (Memoria JPA)                              │
├─────────────────────────────────────────────────────────────────┤
│ horario.getDetalles() = [                                      │
│   CtrHorarioDet(id=6850, fecha=2026-01-06, estado=MANAGED),   │
│   CtrHorarioDet(id=6851, fecha=2026-01-07, estado=MANAGED),   │
│   ...                                                           │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   DELETE FROM ctr_horario_det
                   WHERE id_ctr_horario = 316
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BASE DE DATOS (PostgreSQL)                                     │
├─────────────────────────────────────────────────────────────────┤
│ ctr_horario_det: (vacía, 18 registros eliminados)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ⚠️ DESINCRONIZACIÓN: Persistence context cree que
           aún hay 18 detalles, pero BD está vacía
                              ↓
                   INSERT nuevos detalles
                              ↓
        ❌ ERROR: Hibernate intenta UPDATE de entidades
           que no existen → ConstraintViolationException
```

---

## ❌ Intentos de Solución Fallidos

### Intento #1: Agregar @Modifying Annotation

**Razonamiento**: La documentación de Spring Data JPA indica que métodos DELETE/UPDATE personalizados requieren `@Modifying`.

**Código**:
```java
// CtrHorarioDetRepository.java
import org.springframework.data.jpa.repository.Modifying;

@Modifying(clearAutomatically = true, flushAutomatically = true)
void deleteByHorario(CtrHorario horario);
```

**Parámetros**:
- `clearAutomatically = true`: Limpia el persistence context después de ejecutar la query
- `flushAutomatically = true`: Fuerza un flush antes de ejecutar la query

**Resultado**: ❌ **FALLÓ** - Mismo error persistió

**Por qué no funcionó**:
- `clearAutomatically` limpia el persistence context **DESPUÉS** del DELETE
- Pero los INSERT se ejecutan en la **MISMA TRANSACCIÓN**
- Hibernate aún tiene referencias a las entidades viejas en la colección `horario.getDetalles()`
- El clear no afecta las colecciones ya cargadas

---

### Intento #2: Usar JPQL DELETE Explícito

**Razonamiento**: Tal vez el problema es que Spring Data JPA genera mal el SQL. Usar JPQL explícito podría ayudar.

**Código**:
```java
// CtrHorarioDetRepository.java
@Modifying(clearAutomatically = true)
@Query("DELETE FROM CtrHorarioDet d WHERE d.horario = :horario")
int deleteByHorario(@Param("horario") CtrHorario horario);
```

**Cambios**:
- Query explícita en JPQL
- Retorno `int` para saber cuántos registros se eliminaron

**Resultado**: ❌ **FALLÓ** - Nuevo error diferente

**Error Observado**:
```
org.hibernate.ObjectNotFoundException: Unable to find com.styp.cenate.model.CtrHorarioDet with id 6850
```

**Por qué no funcionó**:
- JPQL DELETE ejecuta SQL directo: `DELETE FROM ctr_horario_det WHERE id_ctr_horario = ?`
- Persistence context NO se actualiza
- Hibernate intenta acceder a entidades que ya no existen en BD
- La colección `horario.getDetalles()` aún apunta a entidades que tienen IDs que ya no existen

**Logs del error**:
```
2026-01-04 10:15:23 DEBUG Hibernate - DELETE FROM ctr_horario_det WHERE id_ctr_horario=?
2026-01-04 10:15:23 INFO  IntegracionHorarioServiceImpl - 🗑️ Eliminados 18 registros
2026-01-04 10:15:23 DEBUG Hibernate - Iniciando flush() para persistence context
2026-01-04 10:15:23 ERROR Hibernate - Unable to find CtrHorarioDet with id 6850
2026-01-04 10:15:23 ERROR IntegracionHorarioServiceImpl - ObjectNotFoundException
```

---

### Intento #3: Agregar entityManager.clear() Manual

**Razonamiento**: Si limpiar el persistence context no se hace automáticamente, forzarlo manualmente podría resolver.

**Código**:
```java
@PersistenceContext
private EntityManager entityManager;

@Transactional
public SincronizacionResponse sincronizar(Long idDisponibilidad) {
    CtrHorario horario = ...;

    // DELETE masivo
    ctrHorarioDetRepository.deleteByHorario(horario);

    // Limpiar persistence context manualmente
    entityManager.clear();  // Desacopla TODAS las entidades

    // INSERT nuevos detalles
    for (DisponibilidadDetalle detalle : disponibilidad.getDetalles()) {
        // ...
    }

    ctrHorarioRepository.save(horario);
}
```

**Resultado**: ❌ **FALLÓ** - Error diferente

**Nuevo Error**:
```
org.hibernate.HibernateException: identifier of an instance of CtrHorario was altered from 316 to null
```

**Por qué no funcionó**:
- `entityManager.clear()` desacopla **TODAS** las entidades, incluyendo el objeto `horario`
- Al hacer `save(horario)`, Hibernate cree que es una **nueva entidad** (sin ID)
- Intenta INSERT en lugar de UPDATE
- Conflicto con el ID auto-generado

---

## ✅ Solución Final Implementada

### Enfoque: Entity-Level DELETE + Flush Manual

**Idea clave**: En lugar de DELETE masivo (bulk operation), eliminar cada entidad **una por una** usando el método `repository.delete(entity)`, permitiendo que JPA trackee correctamente los cambios.

### Código de la Solución

```java
// IntegracionHorarioServiceImpl.java (DESPUÉS DEL FIX)

@PersistenceContext
private EntityManager entityManager;

@Transactional
public SincronizacionResponse sincronizar(Long idDisponibilidad) {
    // ... pasos anteriores ...

    // ========== PASO 5: Limpiar detalles anteriores (MODO ACTUALIZACION) ==========
    if ("ACTUALIZACION".equals(tipoOperacion)) {
        int cantidadAnterior = horario.getDetalles().size();
        log.info("🔄 Modo ACTUALIZACION detectado - Horario #{} tiene {} detalles anteriores",
            horario.getIdCtrHorario(), cantidadAnterior);

        // SOLUCIÓN: Eliminar uno por uno para tracking correcto de entidades
        List<CtrHorarioDet> detallesAEliminar = new ArrayList<>(horario.getDetalles());
        for (CtrHorarioDet detalle : detallesAEliminar) {
            ctrHorarioDetRepository.delete(detalle);  // Entity-level DELETE
        }
        log.info("🗑️ Eliminados {} detalles uno por uno", detallesAEliminar.size());

        // Limpiar colección en memoria
        horario.getDetalles().clear();

        // Flush para aplicar deletes antes de los inserts
        entityManager.flush();
        log.debug("💾 Flush aplicado - Cambios persistidos en BD");

        log.info("✅ Limpieza completada - Listo para insertar nuevos detalles");
    }

    // ========== PASO 6: Crear nuevos detalles ==========
    int detallesCreados = 0;
    int detallesConError = 0;
    List<String> errores = new ArrayList<>();

    for (DisponibilidadDetalle detDisp : disponibilidad.getDetalles()) {
        try {
            CtrHorarioDet nuevoDetalle = new CtrHorarioDet();
            // ... configurar detalle ...
            horario.getDetalles().add(nuevoDetalle);
            detallesCreados++;
        } catch (Exception e) {
            detallesConError++;
            errores.add("Error en fecha " + detDisp.getFecha() + ": " + e.getMessage());
        }
    }

    log.info("✅ PASO 6: Creados {}/{} detalles nuevos ({} errores)",
        detallesCreados, disponibilidad.getDetalles().size(), detallesConError);

    // ========== PASO 7: Guardar horario con nuevos detalles ==========
    ctrHorarioRepository.save(horario);

    // ========== PASO 8: Registrar en log de auditoría ==========
    sincronizacionHorarioLogRepository.save(log);

    return SincronizacionResponse.builder()
        .resultado("EXITOSO")
        .tipoOperacion(tipoOperacion)
        .detallesProcesados(disponibilidad.getDetalles().size())
        .detallesCreados(detallesCreados)
        .detallesConError(detallesConError)
        .horasSincronizadas(horario.getHorasTotales())
        .errores(errores)
        .build();
}
```

---

## 🧠 Explicación Técnica Detallada

### ¿Por qué Funciona Esta Solución?

#### 1. Entity-Level DELETE Trackea Correctamente

```java
for (CtrHorarioDet detalle : detallesAEliminar) {
    ctrHorarioDetRepository.delete(detalle);
}
```

Cuando llamamos a `repository.delete(entity)`:
- Hibernate marca la entidad como **REMOVED** en el persistence context
- **NO ejecuta SQL inmediatamente** (espera al flush)
- Mantiene tracking del estado de la entidad

#### 2. Clear de Colección Elimina Referencias

```java
horario.getDetalles().clear();
```

- Elimina todas las referencias de la colección en memoria
- La próxima vez que agreguemos elementos, será una colección limpia
- **IMPORTANTE**: Esto se hace DESPUÉS de iterar (usamos copia `detallesAEliminar`)

#### 3. Flush Manual Sincroniza BD con Persistence Context

```java
entityManager.flush();
```

- Fuerza a Hibernate a ejecutar todos los DELETE pendientes
- **ANTES** de ejecutar los INSERT
- Evita violaciones de constraint de clave primaria

#### 4. INSERT Funciona Correctamente

```java
for (DisponibilidadDetalle detDisp : disponibilidad.getDetalles()) {
    CtrHorarioDet nuevoDetalle = new CtrHorarioDet();
    // ... configurar ...
    horario.getDetalles().add(nuevoDetalle);  // Colección limpia
}
```

- La colección está limpia (no hay referencias viejas)
- Nuevas entidades con estado **NEW** (sin ID)
- Hibernate generará nuevos IDs automáticamente
- No hay conflictos de duplicados

### Diagrama de la Solución

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: Cargar horario con detalles                           │
├─────────────────────────────────────────────────────────────────┤
│ horario = CtrHorario(id=316, detalles=[d1, d2, ...d18])      │
│ Estado: MANAGED                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: Copiar detalles y DELETE uno por uno                  │
├─────────────────────────────────────────────────────────────────┤
│ detallesAEliminar = new ArrayList<>(horario.getDetalles())   │
│ for (detalle : detallesAEliminar) {                           │
│   repository.delete(detalle)  → marca REMOVED                 │
│ }                                                              │
│ Persistence context: [d1=REMOVED, d2=REMOVED, ...d18=REMOVED]│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: Limpiar colección en memoria                          │
├─────────────────────────────────────────────────────────────────┤
│ horario.getDetalles().clear()                                 │
│ Colección ahora: []                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: Flush manual (sincronizar con BD)                     │
├─────────────────────────────────────────────────────────────────┤
│ entityManager.flush()                                         │
│ → Ejecuta: DELETE FROM ctr_horario_det WHERE id=6850         │
│ → Ejecuta: DELETE FROM ctr_horario_det WHERE id=6851         │
│ → ... (18 DELETE individuales)                               │
│ BD ahora: ctr_horario_det = []                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 5: INSERT nuevos detalles                                │
├─────────────────────────────────────────────────────────────────┤
│ for (detDisp : disponibilidad.getDetalles()) {               │
│   nuevoDetalle = new CtrHorarioDet()  → estado NEW           │
│   horario.getDetalles().add(nuevoDetalle)                    │
│ }                                                              │
│ Colección: [n1=NEW, n2=NEW, ...n18=NEW]                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASO 6: Save final (flush automático al commit)               │
├─────────────────────────────────────────────────────────────────┤
│ ctrHorarioRepository.save(horario)                            │
│ → Ejecuta: INSERT INTO ctr_horario_det VALUES (...)          │
│ → 18 INSERT exitosos                                         │
│ BD final: ctr_horario_det = [n1, n2, ...n18] ✅             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementación Paso a Paso

### Paso 1: Agregar EntityManager al Service

```java
// IntegracionHorarioServiceImpl.java

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service
@Transactional
@Slf4j
public class IntegracionHorarioServiceImpl implements IntegracionHorarioService {

    @PersistenceContext
    private EntityManager entityManager;  // ← AGREGAR ESTO

    // ... resto del código ...
}
```

**¿Por qué?**: Necesitamos acceso directo al EntityManager para ejecutar `flush()` manualmente.

---

### Paso 2: Modificar Lógica de DELETE en Método sincronizar()

**Antes** (código problemático):
```java
if ("ACTUALIZACION".equals(tipoOperacion)) {
    ctrHorarioDetRepository.deleteByHorario(horario);  // ❌ Bulk DELETE
}
```

**Después** (código corregido):
```java
if ("ACTUALIZACION".equals(tipoOperacion)) {
    int cantidadAnterior = horario.getDetalles().size();
    log.info("🔄 Modo ACTUALIZACION detectado - Horario #{} tiene {} detalles anteriores",
        horario.getIdCtrHorario(), cantidadAnterior);

    // Copiar detalles antes de iterar
    List<CtrHorarioDet> detallesAEliminar = new ArrayList<>(horario.getDetalles());

    // DELETE uno por uno
    for (CtrHorarioDet detalle : detallesAEliminar) {
        ctrHorarioDetRepository.delete(detalle);
    }
    log.info("🗑️ Eliminados {} detalles uno por uno", detallesAEliminar.size());

    // Limpiar colección
    horario.getDetalles().clear();

    // Flush manual
    entityManager.flush();
    log.debug("💾 Flush aplicado - Cambios persistidos en BD");

    log.info("✅ Limpieza completada - Listo para nuevos detalles");
}
```

---

### Paso 3: Verificar que Repository Tiene delete() Método

Spring Data JPA proporciona automáticamente el método `delete(Entity)` para cualquier repository que extienda `JpaRepository`.

```java
// CtrHorarioDetRepository.java

public interface CtrHorarioDetRepository extends JpaRepository<CtrHorarioDet, Long> {
    // delete(CtrHorarioDet) ya está disponible por herencia de JpaRepository
    // No necesitas agregarlo manualmente
}
```

---

### Paso 4: Agregar Logging Detallado para Debugging

```java
// Antes del DELETE
log.debug("Detalles a eliminar: {}", detallesAEliminar.stream()
    .map(d -> String.format("ID=%d, Fecha=%s", d.getIdCtrHorarioDet(), d.getFechaDia()))
    .collect(Collectors.joining(", ")));

// Después del DELETE
log.debug("Estado persistence context después de DELETE: {} entidades managed",
    entityManager.getEntityManagerFactory().getPersistenceUnitUtil()
        .getIdentifier(horario) != null ? "horario aún managed" : "horario detached");

// Después del flush
log.debug("Estado BD después de flush - Cantidad detalles: {}",
    ctrHorarioDetRepository.countByHorario(horario));
```

---

## ✅ Verificación y Testing

### Test Unitario Simplificado

```java
@SpringBootTest
@Transactional
class IntegracionHorarioServiceTest {

    @Autowired
    private IntegracionHorarioService integracionService;

    @Autowired
    private CtrHorarioDetRepository detRepository;

    @Test
    void testResincronizacion_debeEliminarYCrearDetalles() {
        // ARRANGE
        Long idDisponibilidad = 2L;  // Disponibilidad ya sincronizada

        // Verificar estado inicial
        CtrHorario horario = ctrHorarioRepository.findByIdDisponibilidad(idDisponibilidad).get();
        int detallesInicial = horario.getDetalles().size();
        assertEquals(18, detallesInicial);

        // Modificar disponibilidad (ejemplo: cambiar 3 turnos MT → M)
        // ...

        // ACT
        SincronizacionResponse response = integracionService.sincronizar(idDisponibilidad);

        // ASSERT
        assertEquals("EXITOSO", response.getResultado());
        assertEquals("ACTUALIZACION", response.getTipoOperacion());
        assertEquals(18, response.getDetallesProcesados());
        assertEquals(18, response.getDetallesCreados());
        assertEquals(0, response.getDetallesConError());

        // Verificar en BD
        horario = ctrHorarioRepository.findByIdDisponibilidad(idDisponibilidad).get();
        assertEquals(18, horario.getDetalles().size());
        assertEquals(198, horario.getHorasTotales());  // Cambió de 216h
    }

    @Test
    void testResincronizacion_noDebeDejarEntidadesHuerfanas() {
        // ARRANGE
        Long idDisponibilidad = 2L;

        // ACT
        integracionService.sincronizar(idDisponibilidad);

        // ASSERT - No debe haber detalles con horario nulo
        long detallesHuerfanos = detRepository.count(
            (root, query, cb) -> cb.isNull(root.get("horario"))
        );
        assertEquals(0, detallesHuerfanos);
    }
}
```

### Test de Integración con BD Real

```bash
# 1. Crear disponibilidad inicial
curl -X POST http://localhost:8080/api/disponibilidad \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "periodo": "202601",
    "idServicio": 101,
    "detalles": [
      {"fecha": "2026-01-06", "turno": "MT"},
      {"fecha": "2026-01-07", "turno": "MT"},
      ... (18 días MT)
    ]
  }'

# Response: {"idDisponibilidad": 2}

# 2. Sincronizar por primera vez
curl -X POST http://localhost:8080/api/integracion-horario/sincronizar \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"idDisponibilidad": 2}'

# Response: {"resultado": "EXITOSO", "tipoOperacion": "CREACION"}

# 3. Verificar creación en BD
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c \
  "SELECT COUNT(*) FROM ctr_horario_det WHERE id_ctr_horario = (SELECT id_ctr_horario FROM ctr_horario WHERE id_disponibilidad = 2);"

# Resultado: 18 ✅

# 4. Modificar disponibilidad (cambiar primeros 3 días)
curl -X PUT http://localhost:8080/api/disponibilidad/2 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "periodo": "202601",
    "idServicio": 101,
    "detalles": [
      {"fecha": "2026-01-06", "turno": "M"},   ← Cambio
      {"fecha": "2026-01-07", "turno": "M"},   ← Cambio
      {"fecha": "2026-01-08", "turno": "M"},   ← Cambio
      {"fecha": "2026-01-09", "turno": "MT"},
      ... (resto MT)
    ]
  }'

# 5. RESINCRONIZAR (el momento crítico)
curl -X POST http://localhost:8080/api/integracion-horario/resincronizar \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"idDisponibilidad": 2}'

# Response esperada:
{
  "resultado": "EXITOSO",
  "tipoOperacion": "ACTUALIZACION",
  "detallesProcesados": 18,
  "detallesCreados": 18,     ← ✅ DEBE SER 18
  "detallesConError": 0,     ← ✅ DEBE SER 0
  "horasSincronizadas": 198
}

# 6. Verificar actualización en BD
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c \
  "SELECT COUNT(*), SUM(horas) FROM ctr_horario_det WHERE id_ctr_horario = (SELECT id_ctr_horario FROM ctr_horario WHERE id_disponibilidad = 2);"

# Resultado: count=18, sum=198 ✅
```

---

## 🎓 Lecciones Aprendidas

### 1. Bulk Operations vs Entity-Level Operations

**Cuándo usar Bulk Operations (deleteBy*, updateBy*)**:
- ✅ DELETE/UPDATE masivo de datos que **NO** están relacionados con entidades en memoria
- ✅ Operaciones de limpieza/mantenimiento fuera de lógica transaccional compleja
- ✅ Cuando **NO** habrá INSERT/UPDATE posterior en la misma transacción

**Cuándo EVITAR Bulk Operations**:
- ❌ DELETE seguido de INSERT en misma transacción
- ❌ Cuando las entidades están cargadas en persistence context
- ❌ Cuando necesitas tracking preciso de estados de entidades

### 2. Flush Manual vs Flush Automático

**Flush Automático** ocurre en:
- Antes de ejecutar query nativa
- Al finalizar la transacción (commit)
- Al llamar explícitamente a `entityManager.flush()`

**Usar Flush Manual** cuando:
- ✅ Necesitas sincronizar BD ANTES de operaciones posteriores
- ✅ Quieres verificar constraints de BD inmediatamente
- ✅ Estás debugging problemas de sincronización

### 3. Persistence Context es Stateful

El persistence context **NO es una simple caché**. Es un gestor de estado con reglas complejas:
- Trackea ciclo de vida de entidades (NEW, MANAGED, DETACHED, REMOVED)
- Mantiene identidad de objetos (same ID = same object reference)
- Se sincroniza con BD en momentos específicos (flush)

**Implicaciones**:
- No asumas que BD refleja inmediatamente tus cambios en memoria
- No asumas que operaciones SQL directas actualizan el persistence context
- Usa `entityManager.contains(entity)` para verificar si entidad está managed

### 4. Clear vs Flush

```java
// entityManager.clear()
// - Desacopla TODAS las entidades del persistence context
// - Convierte todas las entidades MANAGED → DETACHED
// - Útil cuando necesitas recargar entidades frescas
// - PELIGROSO en medio de transacción (puedes perder cambios)

// entityManager.flush()
// - Sincroniza persistence context con BD
// - NO desacopla entidades (siguen MANAGED)
// - Fuerza ejecución de INSERT/UPDATE/DELETE pendientes
// - SEGURO en cualquier momento
```

### 5. Debugging de Problemas JPA

**Herramientas útiles**:

1. **Logging de Hibernate**:
```properties
# application.properties
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.level.org.hibernate.engine.internal.StatefulPersistenceContext=DEBUG
```

2. **Inspección de Persistence Context**:
```java
// Verificar si entidad está managed
boolean isManaged = entityManager.contains(entity);

// Obtener estado de entidad
Object identifier = entityManager.getEntityManagerFactory()
    .getPersistenceUnitUtil()
    .getIdentifier(entity);

// Contar entidades managed
PersistenceUnitUtil util = entityManager.getEntityManagerFactory().getPersistenceUnitUtil();
```

3. **SQL Logging en PostgreSQL**:
```sql
-- Habilitar logging de queries lentas
ALTER DATABASE maestro_cenate SET log_min_duration_statement = 0;

-- Ver queries en tiempo real
SELECT pid, query, state FROM pg_stat_activity WHERE datname = 'maestro_cenate';
```

---

## 🛡️ Prevención de Problemas Similares

### Checklist de Validación

Antes de implementar operaciones DELETE/INSERT en misma transacción:

- [ ] ¿Usaré bulk DELETE (`deleteBy*`)?
  - Si SÍ: ¿Hay INSERT posterior? → Considerar entity-level DELETE

- [ ] ¿Las entidades están cargadas en memoria (MANAGED)?
  - Si SÍ: ¿Necesito limpiar colecciones? → Usar `collection.clear()`

- [ ] ¿Ejecuto INSERT después de DELETE?
  - Si SÍ: ¿Agregué `entityManager.flush()` entre ellos?

- [ ] ¿Tengo constraints de clave primaria/foránea?
  - Si SÍ: ¿Verifiqué orden de operaciones (DELETE antes de INSERT)?

### Patrón Recomendado

```java
@Transactional
public void actualizarEntidadesRelacionadas(Long padreId, List<DetalleDTO> nuevosDetalles) {
    // PASO 1: Cargar entidad padre con detalles
    Padre padre = padreRepository.findById(padreId)
        .orElseThrow(() -> new NotFoundException("Padre no encontrado"));

    // PASO 2: Guardar referencia a detalles anteriores
    List<Detalle> detallesViejos = new ArrayList<>(padre.getDetalles());

    // PASO 3: DELETE entity-level (uno por uno)
    for (Detalle detalleViejo : detallesViejos) {
        detalleRepository.delete(detalleViejo);
    }

    // PASO 4: Limpiar colección en memoria
    padre.getDetalles().clear();

    // PASO 5: Flush manual para sincronizar DELETE
    entityManager.flush();

    // PASO 6: INSERT nuevos detalles
    for (DetalleDTO dto : nuevosDetalles) {
        Detalle nuevoDetalle = new Detalle();
        // ... mapear DTO ...
        padre.getDetalles().add(nuevoDetalle);
    }

    // PASO 7: Save final (flush automático al commit)
    padreRepository.save(padre);
}
```

### Alternativas Arquitectónicas

Si frecuentemente necesitas reemplazar colecciones completas, considera:

1. **Soft Delete**:
```java
@Entity
class Detalle {
    private LocalDateTime deletedAt;  // NULL = activo, NOT NULL = eliminado

    @PrePersist
    protected void onCreate() {
        deletedAt = null;
    }
}

// Queries automáticas que excluyen eliminados
@Where(clause = "deleted_at IS NULL")
```

2. **Versionado de Detalles**:
```java
@Entity
class Detalle {
    private Integer version;  // Incrementa con cada actualización
}

// Al "actualizar", marcar versión vieja como obsoleta e insertar nueva
```

3. **Tabla de Auditoría Separada**:
```sql
CREATE TABLE ctr_horario_det_history (
    id_history SERIAL PRIMARY KEY,
    id_ctr_horario_det INTEGER,
    fecha_dia DATE,
    horario_dia INTEGER,
    horas NUMERIC(4,2),
    version INTEGER,
    vigente BOOLEAN DEFAULT TRUE
);

-- INSERT nuevos detalles marca vigente=FALSE en viejos
```

---

## 📚 Referencias

### Documentación Oficial

1. **Hibernate ORM User Guide**
   - [Chapter 11: Persistence Context](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#pc)
   - [Chapter 13: Batch Processing](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#batch)

2. **Spring Data JPA Reference**
   - [Modifying Queries](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.modifying-queries)
   - [Entity State Management](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.entity-persistence)

3. **JPA Specification (JSR 338)**
   - [Section 3.2: Entity Instance's Life Cycle](https://download.oracle.com/otn-pub/jcp/persistence-2_1-fr-eval-spec/JavaPersistence.pdf)

### Artículos Técnicos

1. Vlad Mihalcea - "Bulk vs Entity-Level Operations in JPA"
2. Thorben Janssen - "JPA Flush Modes Explained"
3. Baeldung - "Hibernate EntityManager Persistence Context"

---

## 🔖 Metadatos

**Archivo**: `spec/05_Troubleshooting/02_guia_resincronizacion_disponibilidad.md`
**Versión**: 1.0.0
**Última actualización**: 2026-01-04
**Autor**: Ing. Styp Canto Rondón
**Tags**: JPA, Hibernate, Spring Boot, Persistence Context, DELETE, INSERT, Troubleshooting
**Relacionado con**:
- BUG #4 (changelog v1.17.0)
- `backend/src/main/java/com/styp/cenate/service/integracion/IntegracionHorarioServiceImpl.java:91-110`
- `checklist/02_Reportes_Pruebas/02_reporte_integracion_chatbot.md`

---

*Documento técnico generado con fines de referencia futura y transferencia de conocimiento*
