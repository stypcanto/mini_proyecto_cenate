# 🏗️ ANÁLISIS ARQUITECTURAL COMPLETO
## Módulo de Asignación de Bolsas de Pacientes a Gestoras de Citas

**Fecha:** 2026-01-29
**Versión Analizada:** v2.3.0 (SolicitudBolsa) | Frontend v2.3.0 (Solicitudes.jsx)
**Revisor:** Claude Sonnet 4.5 (Architecture Specialist)
**Status:** ✅ **APROBADO PARA IMPLEMENTACIÓN**

---

## 🎯 RESUMEN EJECUTIVO

### Conclusiones Principales

**Lo que está BIEN:**
- ✅ Estructura de capas (Controller → Service → Repository)
- ✅ DTOs creados y validados
- ✅ Endpoints definidos
- ✅ Frontend con modal UI

**Lo que FALTA (CRÍTICO):**

| # | Problema | Impacto | Prioridad |
|---|----------|---------|-----------|
| 1 | BD sin campos `responsable_gestora_id`, `fecha_asignacion` | 🔴 ALTO | P0 |
| 2 | Método `asignarGestora()` lanza excepción | 🔴 ALTO | P0 |
| 3 | Falta validación MBAC (@CheckMBACPermission) | 🔴 CRÍTICO | P0 |
| 4 | Sin auditoría integrada | 🟡 MEDIO | P1 |
| 5 | DTO con campo redundante (gestoraNombre) | 🟢 BAJO | P2 |

---

## 📊 VIOLATIONS ENCONTRADAS

### 🔴 VIOLACIÓN 1: Campos Eliminados en Entidad
- **Archivo:** `SolicitudBolsa.java`
- **Problema:** `responsable_gestora_id` y `fecha_asignacion` fueron eliminados en v2.1.0
- **Impacto:** Método `asignarGestora()` no puede persistir asignaciones

### 🔴 VIOLACIÓN 2: Método No Implementado (Liskov Substitution Principle)
- **Archivo:** `SolicitudBolsaServiceImpl.java` líneas 658-664
- **Problema:** Lanza `UnsupportedOperationException` en método de interfaz pública
- **Impacto:** Endpoint devuelve 500 al ser llamado

### 🔴 VIOLACIÓN 3: Falta Validación MBAC
- **Archivo:** `SolicitudBolsaController.java` línea 193
- **Problema:** Cualquier usuario autenticado puede asignar gestoras
- **Impacto:** Escalamiento de privilegios (riesgo de seguridad)

### 🟡 VIOLACIÓN 4: DTO con Datos Redundantes
- **Archivo:** `AsignarGestoraRequest.java`
- **Problema:** Campo `gestoraNombre` puede obtenerse desde BD
- **Impacto:** Riesgo de inconsistencia de datos

---

## 🏗️ INDEPENDENCIA MÓDULO 107

**Status:** ✅ **BIEN SEPARADOS**

- ✅ Tablas distintas
- ✅ Endpoints distintos
- ⚠️ Lógica duplicada (recomendar servicio común en fase 3)

---

## 📋 PLAN DE IMPLEMENTACIÓN (14 horas)

### **FASE 1: Fundación (4 horas) - P0**
1. ✅ Migration SQL: agregar campos a BD
2. ✅ Actualizar entidad `SolicitudBolsa.java`
3. ✅ Implementar `asignarGestora()` en Service
4. ✅ Agregar `@CheckMBACPermission` al endpoint

### **FASE 2: Integración (6 horas) - P1**
5. Cargar lista de gestoras en frontend
6. Implementar modal completo
7. Crear trigger de auditoría en BD
8. Integrar con `AuditLogService`

### **FASE 3: Testing (3 horas) - P1**
9. Tests unitarios
10. Tests de integración
11. Validar permisos MBAC

### **FASE 4: Documentación (1 hora) - P2**
12. Changelog + documentación

---

## ✅ RECOMENDACIONES CRÍTICAS

### Recomendación 1: Restaurar Campos en BD
```sql
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN responsable_gestora_id BIGINT NULL,
ADD COLUMN fecha_asignacion TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_gestora
FOREIGN KEY (responsable_gestora_id)
REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL;

CREATE INDEX idx_solicitud_gestora
ON dim_solicitud_bolsa(responsable_gestora_id)
WHERE activo = true;
```

### Recomendación 2: Implementar Servicio Completo
Ver archivo `02_PLAN_IMPLEMENTACION.md` para código detallado

### Recomendación 3: Validación MBAC
```java
@PatchMapping("/{id}/asignar")
@CheckMBACPermission(modulo = "BOLSAS", accion = "ASIGNAR_GESTORA")
public ResponseEntity<?> asignarGestora(...)
```

---

## 📈 IMPACT ANALYSIS

| Área | Impacto | Nivel |
|------|---------|-------|
| **Database** | +2 columnas, +1 FK, +1 índice, +1 trigger | MEDIO |
| **Backend** | +60 líneas (servicio implementado) | BAJO |
| **Frontend** | +50 líneas (modal, handlers) | BAJO |
| **API Calls** | +2 nuevas queries (validar gestora) | BAJO |
| **Tests** | +15 test cases | MEDIO |

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

- ✅ Validación de rol GESTOR_DE_CITAS
- ✅ Validación de usuario activo
- ✅ Permiso MBAC requerido
- ✅ Auditoría de cambios
- ✅ FK constraint con ON DELETE SET NULL

---

**Status:** ✅ APROBADO
**Fecha Aprobación:** 2026-01-29
**Revisor:** Architect-Reviewer Agent
**Próximo Paso:** Iniciar FASE 1 (Fundación)
