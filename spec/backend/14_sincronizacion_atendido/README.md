# Sincronización Automática de Estado ATENDIDO

> **Módulo:** Sincronización Citas (Chatbot ↔ Bolsas)
> **Versiones:** v1.43.0 (Core) + v1.43.1 (Metrics) + v1.44.0 (Batch Optimization)
> **Status:** ✅ Production Ready
> **Última Actualización:** 2026-02-05

---

## 📋 Resumen Ejecutivo

Sincronización automática bidireccional de estado ATENDIDO entre dos sistemas de gestión de citas:

- **solicitud_cita** (módulo chatbot): Médico marca cita como ATENDIDO (id_estado_cita = 4)
- **dim_solicitud_bolsa** (módulo bolsas): Universo de pacientes (id_estado_cita = 2 = ATENDIDO_IPRESS)

**Beneficios:**
- ✅ Automático (médico NO hace nada extra)
- ✅ Tolerante a fallos (si falla sync, no falla la atención)
- ✅ Optimizado (batch: N→1 BD calls)
- ✅ Monitoreable (Micrometer metrics)
- ✅ Zero API changes (optimización interna)

---

## 🏗️ Arquitectura

### Flujo de Sincronización

```
Médico marca cita ATENDIDO (solicitud_cita.id_estado_cita = 4)
           ↓
SolicitudCitaServiceImpl.actualizarEstado()
           ↓
Detecta estado = 4 (CITA_ATENDIDO)
           ↓
SincronizacionBolsaService.sincronizarEstadoAtendido()
           ├─ Buscar paciente en dim_solicitud_bolsa por DNI
           ├─ Si no existe → return false (log WARNING, auditar)
           ├─ Si existe 1+ bolsas activas:
           │  ├─ Para cada bolsa (skip si ya ATENDIDO):
           │  │  ├─ Actualizar estado_gestion_citas_id = 2
           │  │  ├─ Guardar fecha, hora, médico
           │  │  ├─ Registrar auditoría
           │  │  └─ Auditar evento
           │  └─ Batch save: saveAll() ← v1.44.0 optimization
           └─ Retorna true
           ↓
Médico ve ATENDIDO en ambos sistemas ✅
```

### Dos Niveles de Tablas

| Sistema | Tabla | Campo Estado | Valor ATENDIDO | Uso |
|---------|-------|--------------|----------------|-----|
| **Chatbot** | `solicitud_cita` | `id_estado_cita` | `4` | Registro de cita del médico |
| **Bolsas** | `dim_solicitud_bolsa` | `estado_gestion_citas_id` | `2` | Universo de pacientes a contactar |

**Relación:** DNI-based linking (sin FK formal) para máxima flexibilidad

---

## 🔧 Componentes Técnicos

### 1. SincronizacionBolsaService (Interface)

```java
public interface SincronizacionBolsaService {
    /**
     * Sincroniza estado ATENDIDO de solicitud_cita a dim_solicitud_bolsa
     * @return true si se sincronizó, false si paciente no existe en bolsas
     * @throws SincronizacionException si error técnico
     */
    boolean sincronizarEstadoAtendido(SolicitudCita solicitudCita);
}
```

### 2. SincronizacionBolsaServiceImpl

**Responsabilidades:**
- Buscar paciente en bolsas por DNI
- Actualizar múltiples bolsas (si existen)
- Registrar auditoría en cada paso
- Registrar métricas
- Manejar excepciones (3-tier)

**Inyecciones:**
- `SolicitudBolsaRepository` - acceso a dim_solicitud_bolsa
- `UsuarioRepository` - obtener usuario autenticado
- `AuditLogService` - auditoría centralizada
- `MeterRegistry` - métricas Prometheus

### 3. SolicitudCitaServiceImpl Hook

En método `actualizarEstado()`:

```java
// ✨ v1.43.0: SINCRONIZACIÓN AUTOMÁTICA
if (estado.equals(EstadosCitaConstants.CITA_ATENDIDO)) {
    log.info("🔄 Detectado estado ATENDIDO, sincronizando...");
    try {
        boolean sincronizado = sincronizacionBolsaService.sincronizarEstadoAtendido(solicitud);
        if (sincronizado) {
            log.info("✅ Sincronización exitosa");
        } else {
            log.warn("⚠️  Paciente no encontrado en bolsas");
        }
    } catch (Exception e) {
        // NO FALLAR: la atención médica ya ocurrió
        log.error("❌ Error sync (pero se marcó ATENDIDO): {}", e.getMessage());
    }
}
```

### 4. EstadosCitaConstants

Centraliza estados para evitar magic numbers:

```java
public class EstadosCitaConstants {
    // solicitud_cita states
    public static final Long CITA_ATENDIDO = 4L;

    // dim_solicitud_bolsa states
    public static final Long BOLSA_ATENDIDO_IPRESS = 2L;
    // ... otros estados
}
```

---

## 📊 Versiones

### v1.43.0 - Core Feature

**Commits:** 3 (core + fixes + tests)

**Implementación:**
- Sincronización automática hook
- Tolerance design (no falla si sync falla)
- Database index: `idx_solicitud_bolsa_paciente_dni_activo`
- 7 unit tests (coverage completo)
- 5 architectural fixes (AuditLog, constants, exception handling)

**Files:**
- `SincronizacionBolsaService.java` (interface)
- `SincronizacionBolsaServiceImpl.java` (implementation)
- `SincronizacionException.java` (custom exception)
- `EstadosCitaConstants.java` (constants)
- Modified: `SolicitudCitaServiceImpl.java` (hook)

### v1.43.1 - Micrometer Metrics

**Commit:** 1

**Métricas Implementadas:**

```
Counter: sincronizacion.atendido.intentos
         └─ Total de intentos de sincronización

Counter: sincronizacion.atendido.exitosas
         └─ Sincronizaciones exitosas

Counter: sincronizacion.atendido.fallos
         └─ Fallos (esperados + críticos)

Counter: sincronizacion.atendido.noEncontrados
         └─ Pacientes DNI no encontrados

Timer: sincronizacion.atendido.duracion [ms]
       ├─ Tags:
       │  ├─ resultado: [exitosa, no_encontrado, fallo_esperado, error_critico]
       │  ├─ registros_actualizados: N
       │  └─ excepcion: nombre excepción (errors)

Gauge: sincronizacion.atendido.registros.procesados
       └─ Cantidad de registros procesados
```

**Prometheus Endpoint:**
```
GET /actuator/prometheus
```

### v1.44.0 - Batch Optimization

**Commit:** 1

**Optimización:**
- De `save()` individual a `saveAll()` batch
- Reduce BD roundtrips: N → 1
- Single transaction (all-or-nothing)
- Backward compatible

**Performance:**
- 1 bolsa: 0% improvement (1 BD call)
- 2 bolsas: 50% improvement (2 → 1 BD calls)
- 5 bolsas: 80% improvement (5 → 1 BD calls)
- N bolsas: (N-1)/N improvement

**Added Metric:**
```
Gauge: sincronizacion.atendido.batch.size
       └─ Tamaño del batch en última ejecución
```

---

## 🧪 Tests (7 Casos Completos)

### TC-01: Single Bolsa
```
Entrada: 1 paciente con 1 bolsa activa
Esperado: Estado cambia a ATENDIDO_IPRESS
          1 saveAll() call con 1 registro
          Auditoría registrada
Status: ✅ PASS
```

### TC-02: Multiple Bolsas (v1.44.0 KEY TEST)
```
Entrada: 1 paciente con 2 bolsas activas
Esperado: Ambas bolsas actualizadas
          1 saveAll() call con 2 registros (batch!)
          Auditoría por bolsa
Status: ✅ PASS (batch optimization validated)
```

### TC-03: Patient DNI Not Found
```
Entrada: 1 paciente DNI no existe en bolsas
Esperado: Retorna false
          No saveAll() call
          Log WARNING
          Auditoría de "no encontrado"
Status: ✅ PASS
```

### TC-04: Already ATENDIDO (Skip)
```
Entrada: Bolsa ya está en estado ATENDIDO_IPRESS
Esperado: Skip actualización
          No saveAll() call
          Log INFO
Status: ✅ PASS
```

### TC-05: Database Error
```
Entrada: saveAll() lanza RuntimeException
Esperado: Lanza SincronizacionException
          Auditoría de error crítico
          Log ERROR
Status: ✅ PASS
```

### TC-06: Personal is Null
```
Entrada: SolicitudCita.personal = null
Esperado: idPersonal queda null en bolsa
          Sync continúa
          saveAll() llamado
Status: ✅ PASS
```

### TC-07: No Security Context
```
Entrada: Sin autenticación en SecurityContextHolder
Esperado: Usuario auditado como "SISTEMA"
          Sync completa sin fallar
Status: ✅ PASS
```

---

## 📈 Métricas & Monitoreo

### Prometheus Queries

```promql
# Total de intentos
rate(sincronizacion_atendido_intentos_total[5m])

# Tasa de éxito
rate(sincronizacion_atendido_exitosas_total[5m])

# Tasa de fallo
rate(sincronizacion_atendido_fallos_total[5m])

# Duración promedio
histogram_quantile(0.95, rate(sincronizacion_atendido_duracion_seconds_bucket[5m]))

# Batch size promedio
avg(sincronizacion_atendido_batch_size)
```

### Grafana Dashboard Recommendations

1. **Success Rate Panel**
   - Query: exitosas / intentos
   - Alert: < 95%

2. **Duration Panel**
   - Query: 95th percentile
   - Alert: > 500ms

3. **Batch Size Panel**
   - Query: average batch size
   - Context: 1.0 = optimal (sin multi-bolsas)

4. **Error Rate Panel**
   - Query: fallos / intentos
   - Alert: > 1%

---

## 🔒 Tolerancia a Fallos

**Diseño:** Si la sincronización falla, NO falla la operación principal

```java
try {
    sincronizacionBolsaService.sincronizarEstadoAtendido(solicitud);
} catch (Exception e) {
    // NO FALLAR: la atención médica ya ocurrió (es un hecho del mundo real)
    log.error("Sync falló pero se marca ATENDIDO: {}", e.getMessage());
    // Auditar el error
    // Return success (la atención ocurrió)
}
```

**Justificación:**
- La atención médica ya sucedió en el mundo real
- El registro de solicitud_cita es lo más importante
- Bolsas es un sistema secundario de seguimiento
- Mejor tener sincronización parcial que perder datos de atención

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Antes (Manual) | Después (Auto v1.43.0) | Con Batch (v1.44.0) |
|---------|--|--|--|
| **Sincronización** | Manual (médico debe actualizar bolsas) | Automática | Automática + Optimizada |
| **BD Calls (2 bolsas)** | N/A | 2 | 1 ← 50% mejora |
| **Auditoría** | No sistemática | Centralizada AuditLog | + Métricas Prometheus |
| **Tolerancia Fallos** | N/A | Sí (no falla atención) | Sí (idem) |
| **Transacciones** | N/A | Múltiples | 1 única ← All-or-nothing |
| **Monitoreo** | N/A | Logs | + Prometheus metrics |

---

## 🚀 Deployment

### Prerequisites

```yaml
Database: PostgreSQL 14+ (10.0.89.241:5432)
Framework: Spring Boot 3.5.6
Java: 17+
Dependencies:
  - micrometer-registry-prometheus ✅ (ya presente)
  - lombok ✅
  - spring-data-jpa ✅
```

### Installation Steps

1. **Código Java**
   - Los 5 commits están aplicados
   - Build: `./gradlew clean build`

2. **Database Index**
   - Script: `spec/database/06_scripts/001_sincronizacion_indices.sql`
   - Ejecutar: `psql -h 10.0.89.241 -U postgres -d maestro_cenate < ...`

3. **Prometheus Configuration**
   - Endpoint: `GET /actuator/prometheus` (ya habilitado)
   - No requiere configuración adicional

4. **Verificación**
   - Tests: `./gradlew test --tests SincronizacionBolsaServiceImplTest`
   - Resultado esperado: ✅ 7/7 PASS
   - Build time: ~2-5s

---

## 📚 Referencias

### Arquitectura General
- [`spec/architecture/README.md`](../../architecture/README.md)
- [`spec/backend/README.md`](../README.md)

### Módulos Relacionados
- Gestión de Citas: [`spec/backend/13_gestion_citas_endpoints.md`](../13_gestion_citas_endpoints.md)
- Módulo Bolsas: [`spec/backend/09_modules_bolsas/README.md`](../09_modules_bolsas/README.md)
- Auditoría: [`spec/backend/12_audit_email_system.md`](../12_audit_email_system.md)

### Monitoreo
- Metrics: [`spec/backend/10_performance_monitoring/README.md`](../10_performance_monitoring/README.md)
- Prometheus: [Prometheus Documentation](https://prometheus.io/)

---

## 👥 Histórico

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **v1.44.0** | 2026-02-05 | Batch optimization (saveAll) |
| **v1.43.1** | 2026-02-05 | Micrometer metrics |
| **v1.43.0** | 2026-02-05 | Core feature + tests + architectural fixes |

---

**Última Revisión:** 2026-02-05
**Autor:** Claude Haiku 4.5
**Status:** ✅ Production Ready
