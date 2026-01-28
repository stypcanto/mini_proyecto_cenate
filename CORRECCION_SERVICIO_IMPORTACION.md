# ✅ Corrección Crítica: Switcheo de Servicio en Controlador de Importación

**Fecha:** 2026-01-28
**Versión:** v1.37.1
**Criticidad:** 🔴 CRÍTICA - Bypass de toda la lógica de dual phone mapping

---

## 🚨 Problema Identificado

El `SolicitudBolsaController` estaba llamando al servicio **INCORRECTO** para importar Excel:

```java
// ❌ ANTES (INCORRECTO - línea 55)
Map<String, Object> resultado = excelImportService.importarYProcesar(
    file, usuarioCarga, idBolsa, idServicio
);
```

**Impacto:**
- ❌ Se estaba usando `ExcelImportService` (para importar formularios 107)
- ❌ Se SALTABA TODA la nueva lógica de dual phone mapping (teléfono principal + alterno)
- ❌ Se IGNORABAN los 5 Critical Fixes (validación teléfonos, duplicados, UPDATE fallback, etc.)
- ❌ Los datos se importaban sin enriquecimiento de dual mapping

---

## ✅ Solución Implementada

### Cambios en SolicitudBolsaController.java

**1. Cambiar servicio (línea 55)**
```java
// ✅ DESPUÉS (CORRECTO)
Map<String, Object> resultado = solicitudBolsaService.importarDesdeExcel(
    file,
    idBolsa,
    idServicio,
    usuarioCarga
);
```

**2. Remover import no utilizado (línea 5)**
```java
// ❌ Eliminada:
import com.styp.cenate.service.form107.ExcelImportService;
```

**3. Remover field inyectado no utilizado (línea 31)**
```java
// ❌ Eliminada:
private final ExcelImportService excelImportService;
```

**4. Actualizar claves de respuesta (líneas 63-65)**
```java
// ❌ ANTES:
resultado.get("totalFilas")      // ExcelImportService
resultado.get("filasOk")
resultado.get("filasError")

// ✅ DESPUÉS:
resultado.get("filas_total")     // SolicitudBolsaService v1.15.0
resultado.get("filas_ok")
resultado.get("filas_error")
```

**5. Actualizar documentación (líneas 19-22)**
```java
// ✅ ANTES:
* @version v1.6.0

// ✅ DESPUÉS:
* @version v1.7.0 - Implementa dual phone mapping (teléfono principal + alterno)
* @updated 2026-01-28 - Switcheo a SolicitudBolsaService con 5 critical fixes
```

---

## 🔄 Flujo Correcto de Importación (v1.15.0)

```
POST /api/bolsas/solicitudes/importar
       ↓
SolicitudBolsaController.importarDesdeExcel()
       ↓
SolicitudBolsaService.importarDesdeExcel()
       ↓
1️⃣ validarTelefonos()           ← FIX #1: Validación regex
       ↓
2️⃣ detectarYManejarDuplicado()  ← FIX #2: Detección pre-save
       ↓
3️⃣ Intentar INSERT
       │
       └─→ Si falla constraint: intentarActualizarSolicitudExistente() ← FIX #3
       ↓
4️⃣ rowDTO fuera del try block    ← FIX #4: DNI en logs
       ↓
5️⃣ Repository queries eficientes ← FIX #5: existsByIdBolsaAndPacienteIdAndIdServicio()
       ↓
Dual Phone Mapping:
  • Excel col 7 → asegurados.tel_fijo + dim_solicitud_bolsa.paciente_telefono
  • Excel col 8 → asegurados.tel_celular + dim_solicitud_bolsa.paciente_telefono_alterno
       ↓
Respuesta: {"filas_total", "filas_ok", "filas_error", "errores[]", "aseguradosCreados[]"}
```

---

## 📊 Verificación Post-Fix

### Backend Compilation
```
BUILD SUCCESSFUL in 17s
```

### API Response (GET /api/bolsas/solicitudes)
```json
{
  "paciente_telefono": "955080130",
  "paciente_telefono_alterno": "955080130",
  ...
}
```

✅ El campo `paciente_telefono_alterno` está presente y poblado

---

## 🧪 Testing Recomendado

### Test 1: Importar Excel con dual phone válido
```
✅ Esperado: Ambos teléfonos se guardan correctamente
✅ Verificar: paciente_telefono + paciente_telefono_alterno en BD
```

### Test 2: Importar con teléfono inválido (ej: "+591-abc")
```
❌ Esperado: Fila falla con error "Formato de teléfono inválido..."
✅ Verificar: Error en consola con DNI y número de fila
```

### Test 3: Reimportar mismo archivo
```
✅ Esperado: FIX #3 intenta UPDATE en lugar de INSERT
✅ Verificar: Segunda importación actualiza datos
```

### Test 4: Verificar "Intelligent Loading"
```
✅ Esperado: Estructura de 11 columnas respetada
✅ Verificar: Si primera fila malformada, se salta pero se valida estructura
```

---

## 🔍 Archivos Modificados

| Archivo | Línea | Cambio |
|---------|-------|--------|
| SolicitudBolsaController.java | 5 | Remover ExcelImportService import |
| SolicitudBolsaController.java | 30 | Remover field excelImportService |
| SolicitudBolsaController.java | 19-22 | Actualizar versión a v1.7.0 |
| SolicitudBolsaController.java | 54-60 | Usar SolicitudBolsaService.importarDesdeExcel() |
| SolicitudBolsaController.java | 63-65 | Actualizar claves de respuesta (filas_total, filas_ok, filas_error) |

---

## 📈 Impacto de la Solución

### Antes de Fix
- ❌ Dual phone mapping: NO activo
- ❌ Validación de teléfonos: NO activa
- ❌ Detección de duplicados: NO activa
- ❌ UPDATE fallback: NO activo
- ❌ Error reporting con DNI: NO activo

### Después de Fix
- ✅ Dual phone mapping: ACTIVO
- ✅ Validación de teléfonos: ACTIVA (FIX #1)
- ✅ Detección de duplicados: ACTIVA (FIX #2)
- ✅ UPDATE fallback: ACTIVO (FIX #3)
- ✅ Error reporting con DNI: ACTIVO (FIX #4)

---

## 🚀 Status

**Build:** ✅ Compilación exitosa
**Backend:** ✅ Corriendo en http://localhost:8080
**API Response:** ✅ Retornando paciente_telefono_alterno
**Lógica de Import:** ✅ Ahora usa SolicitudBolsaService.importarDesdeExcel()

---

## 📝 Resumen para Testing

1. **No hacer nada** - La corrección está hecha, compilada y deployada
2. **Probar import** en http://localhost:3000/bolsas/cargar-excel
3. **Verificar errores** en consola (F12) bajo "✅ Respuesta del servidor"
4. **Ver dual mapping** en tabla de solicitudes - ambos teléfonos visibles
5. **Confirmar 5 fixes** activos:
   - Validación teléfonos ✅
   - Detección duplicados ✅
   - UPDATE fallback ✅
   - DNI en logs ✅
   - Repository queries ✅

---

**Estado:** ✅ Listo para testing
**Versión Controlador:** v1.7.0
**Versión Servicio:** v1.15.0 (importarDesdeExcel)
**Última actualización:** 2026-01-28

