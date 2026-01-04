# 🐛 Bug Report: Detalles de Disponibilidad No Se Persisten

**Fecha:** 2026-01-03
**Módulo:** Disponibilidad Médica
**Severidad:** 🔴 **CRÍTICA** - Impide funcionamiento básico del módulo
**Estado:** 🟡 Identificado - Solución propuesta

---

## 📋 Resumen del Problema

Al crear una nueva disponibilidad médica mediante el endpoint `POST /api/disponibilidad`, la disponibilidad se crea exitosamente PERO los detalles diarios (tabla `detalle_disponibilidad`) NO se persisten en la base de datos, resultando en:

- ❌ `totalHoras` = 0 (debería ser 180h para 18 días MT)
- ❌ `horasAsistenciales` = 0 (debería ser 144h)
- ❌ `horasSanitarias` = 0 (debería ser 36h para 728/CAS)
- ❌ `detalles` = [] (debería tener 18 elementos)

---

## 🧪 Pasos para Reproducir

### 1. Request de Prueba

```bash
POST /api/disponibilidad
Authorization: Bearer <token>
Content-Type: application/json

{
  "idPers": 1,
  "periodo": "202601",
  "idServicio": 1,
  "idEspecialidad": 1,
  "turnos": [
    {"fecha": "2026-01-05", "turno": "MT"},
    {"fecha": "2026-01-06", "turno": "MT"},
    ... (18 días en total)
  ],
  "observaciones": "Test: 18 días MT"
}
```

### 2. Respuesta Observada

```json
{
  "idDisponibilidad": 1,
  "totalHoras": 0,          ← DEBERÍA SER 180
  "horasAsistenciales": 0,  ← DEBERÍA SER 144
  "horasSanitarias": 0,     ← DEBERÍA SER 36
  "detalles": [],           ← DEBERÍA TENER 18 ELEMENTOS
  "cumpleMinimo": false     ← DEBERÍA SER true
}
```

### 3. Verificación en Base de Datos

```sql
SELECT COUNT(*) FROM detalle_disponibilidad WHERE id_disponibilidad = 1;
-- Resultado: 0 (debería ser 18)
```

---

## 🔍 Análisis Técnico

### Código Afectado

**Archivo:** `backend/src/main/java/com/styp/cenate/service/disponibilidad/DisponibilidadMedicaServiceImpl.java`

**Método:** `crear()` líneas 57-110

### Flujo de Ejecución

```java
@Override
public DisponibilidadMedicaDTO crear(DisponibilidadRequestDTO request) {
    // 1. Crear disponibilidad con Builder
    DisponibilidadMedica disponibilidad = DisponibilidadMedica.builder()
        .personal(personal)
        .servicio(servicio)
        .periodo(request.getPeriodo())
        .estado("BORRADOR")
        .horasRequeridas(...)
        .observaciones(...)
        .build();  // ← Lista 'detalles' queda NULL

    // 2. Agregar detalles a la lista
    calcularYAgregarDetalles(disponibilidad, request.getTurnos(), personal);
    // ← Este método llama a disponibilidad.addDetalle() que agrega a la lista

    // 3. Guardar
    disponibilidad = disponibilidadRepository.save(disponibilidad);
    // ← Aquí se guarda pero los detalles no se persisten

    return convertirADTO(disponibilidad);
}
```

### Causa Raíz

**Problema con @Builder.Default de Lombok**

```java
// En DisponibilidadMedica.java línea 79-86
@OneToMany(
    mappedBy = "disponibilidadMedica",
    cascade = CascadeType.ALL,  ← Cascade configurado correctamente
    orphanRemoval = true,
    fetch = FetchType.LAZY
)
@Builder.Default
private List<DetalleDisponibilidad> detalles = new ArrayList<>();
```

**El problema:**
- Cuando usas `.builder()`, Lombok NO respeta el `@Builder.Default` si no especificas explícitamente el campo en el builder
- La lista `detalles` queda `null` en lugar de `new ArrayList<>`
- Luego, cuando `addDetalle()` verifica `if (detalles == null) { detalles = new ArrayList<>(); }` (línea 247), SÍ inicializa la lista
- Los detalles se agregan correctamente a la lista en memoria
- **PERO** cuando JPA persiste la entidad, como la lista fue creada DESPUÉS del builder y ANTES del `@PrePersist`, JPA puede no detectarla como "dirty" para el cascade

---

## ✅ Solución Propuesta

### Opción 1: Inicializar Explícitamente la Lista (RÁPIDA - RECOMENDADA)

**Modificar:** `DisponibilidadMedicaServiceImpl.java` línea 82-89

```java
// ANTES
DisponibilidadMedica disponibilidad = DisponibilidadMedica.builder()
    .personal(personal)
    .servicio(servicio)
    .periodo(request.getPeriodo())
    .estado("BORRADOR")
    .horasRequeridas(...)
    .observaciones(...)
    .build();

// DESPUÉS
DisponibilidadMedica disponibilidad = DisponibilidadMedica.builder()
    .personal(personal)
    .servicio(servicio)
    .periodo(request.getPeriodo())
    .estado("BORRADOR")
    .horasRequeridas(...)
    .observaciones(...)
    .detalles(new ArrayList<>())  // ← AGREGAR ESTA LÍNEA
    .build();
```

### Opción 2: Guardar Primero, Luego Agregar Detalles (MÁS SEGURA)

```java
@Override
public DisponibilidadMedicaDTO crear(DisponibilidadRequestDTO request) {
    // 1. Crear y guardar disponibilidad SIN detalles
    DisponibilidadMedica disponibilidad = DisponibilidadMedica.builder()
        .personal(personal)
        .servicio(servicio)
        .periodo(request.getPeriodo())
        .estado("BORRADOR")
        .horasRequeridas(...)
        .observaciones(...)
        .build();

    disponibilidad = disponibilidadRepository.save(disponibilidad);  // ← Guardar primero
    disponibilidadRepository.flush();  // ← Asegurar que tenga ID

    // 2. Ahora agregar detalles a la entidad PERSISTIDA
    calcularYAgregarDetalles(disponibilidad, request.getTurnos(), personal);

    // 3. Guardar de nuevo (los detalles se persisten por cascade)
    disponibilidad = disponibilidadRepository.save(disponibilidad);

    return convertirADTO(disponibilidad);
}
```

### Opción 3: Usar `@PostConstruct` en la Entidad

**Modificar:** `DisponibilidadMedica.java`

```java
@PostConstruct  // ← Agregar esto
private void init() {
    if (this.detalles == null) {
        this.detalles = new ArrayList<>();
    }
}
```

---

## 📊 Impacto

### Funcionalidades Afectadas

- ❌ Creación de disponibilidad médica
- ❌ Cálculo de horas (asistenciales + sanitarias)
- ❌ Validación de 150 horas mínimas
- ❌ Envío a revisión (siempre falla porque totalHoras = 0)
- ❌ Sincronización con chatbot (no hay turnos para sincronizar)
- ❌ Reportes estadísticos por periodo

### Severidad

**🔴 CRÍTICA** - El módulo completo es INUTILIZABLE hasta que se corrija este bug.

---

## 🧪 Plan de Testing Post-Fix

Después de aplicar la solución, ejecutar estos tests:

### Test 1: Crear Disponibilidad 728/CAS - 18 días MT

**Esperado:**
- ✅ `totalHoras` = 180
- ✅ `horasAsistenciales` = 144 (18 días × 8h)
- ✅ `horasSanitarias` = 36 (18 días × 2h)
- ✅ `detalles.length` = 18
- ✅ `cumpleMinimo` = true

### Test 2: Crear Disponibilidad Locador - 13 días MT

**Esperado:**
- ✅ `totalHoras` = 156 (13 × 12h + 0h sanitarias)
- ✅ `horasAsistenciales` = 156
- ✅ `horasSanitarias` = 0 (Locador NO tiene horas sanitarias)
- ✅ `detalles.length` = 13
- ✅ `cumpleMinimo` = true

### Test 3: Enviar Disponibilidad

**Esperado:**
- ✅ Estado cambia de BORRADOR → ENVIADO
- ✅ `fechaEnvio` IS NOT NULL
- ✅ Validación de 150h pasa correctamente

### Test 4: Verificación Base de Datos

```sql
-- Debe retornar 18
SELECT COUNT(*) FROM detalle_disponibilidad WHERE id_disponibilidad = 1;

-- Debe retornar datos coherentes
SELECT
    horas_asistenciales,
    horas_sanitarias,
    total_horas
FROM disponibilidad_medica
WHERE id_disponibilidad = 1;
```

---

## 🎯 Recomendación

**Aplicar Opción 1 INMEDIATAMENTE** porque:
- ✅ Cambio mínimo (1 línea)
- ✅ Bajo riesgo
- ✅ Fácil de revertir
- ✅ Compatible con el código existente
- ✅ No requiere cambios en la entidad

Si Opción 1 no funciona, entonces aplicar Opción 2 como fallback.

---

## 📝 Actualización de Checklist

**Tarea 11 de Fase 2:** Marcar como BLOQUEADA hasta resolver este bug.

```markdown
- [ ] **Tarea 11:** Probar endpoints con Postman/cURL
  - ⚠️ **BLOQUEADA por BUG #001** - Detalles no se persisten
  - Ver: checklist/02_Reportes_Pruebas/02_bug_disponibilidad_detalles.md
```

---

*Reportado por: Claude Code Testing*
*Fecha: 2026-01-03*
*Versión afectada: v2.0.0 (Disponibilidad Médica)*
