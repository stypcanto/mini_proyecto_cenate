# 📊 Guía: Cómo se Reportan Errores de Importación en Frontend

**Fecha:** 2026-01-28
**Versión:** v1.15.0
**Sistema:** Reporteo de Errores - Importación Excel Bolsas

---

## 📋 Resumen

Cuando el usuario intenta importar un archivo Excel desde `http://localhost:3000/bolsas/cargar-excel`, los errores se capturan y reportan a través de:

1. **Modal de Resultado** (PopUp visual principal)
2. **Consola del navegador** (logs técnicos detallados)
3. **Campos de validación** (en tiempo real, antes de enviar)
4. **Tabla detallada de errores** (para cada fila fallida - próxima implementación)

---

## 🔄 Flujo Completo de Reporte de Errores

```
Usuario selecciona archivo Excel
         ↓
CargarDesdeExcel.jsx lee archivo localmente
         ↓
validarEstructuraExcel() → Validaciones PRE-ENVÍO
         ↓
    SI HAY ERROR:
    → setImportStatus({ type: 'warning/error', message: '...', detalles: {...} })
    → Mostrar Alert/Card con detalles
    → DETENER - No enviar al servidor
         ↓
    SI VÁLIDO:
    → Habilitar botón "Importar"
    ↓
Usuario hace click "Importar"
         ↓
handleImport() ejecuta
    → FormData con file, idBolsa, idServicio, usuarioCarga
    → await bolsasService.importarSolicitudesDesdeExcel(formData)
         ↓
    SERVIDOR responde:
    {
      "filas_total": 100,
      "filas_ok": 95,
      "filas_error": 5,
      "errores": [
        { "fila": 5, "dni": "12345678", "error": "Formato de teléfono inválido" },
        { "fila": 12, "dni": "87654321", "error": "Solicitud duplicada detectada" },
        ...
      ],
      "mensaje": "Importación completada: 95 OK, 5 errores"
    }
         ↓
    try {
      const resultado = await bolsasService.importarSolicitudesDesdeExcel(formData)
      setImportStatus({
        type: 'success',
        message: resultado.mensaje,
        rowsProcessed: resultado.filasOk,
        totalRows: resultado.filas_total,
        failedRows: resultado.filasError,
        // ⚠️ DATOS DE ERRORES DISPONIBLES AQUÍ (no se muestran actualmente):
        errors: resultado.errores
      })
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: mensajeAmigable,
        originalError: error.message
      })
    }
         ↓
Mostrar Modal <ResultModal />
```

---

## 🎨 UI Components para Reporte de Errores

### 1. Modal Principal de Resultado (ResultModal)

**Ubicación:** `CargarDesdeExcel.jsx` líneas 865-972

**Estructura:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│    ✅ o ❌ (Animado: bounce si éxito, pulse si error)│
│                                                    │
│    "¡Importación Exitosa!"                         │
│    "o Error en Importación"                        │
│                                                    │
│    [Mensaje detallado del servidor]                │
│                                                    │
│    [Estadísticas si es éxito]                      │
│    ✅ Éxitosos: 95                                │
│    📊 Total: 100                                   │
│    ⚠️ Fallidos: 5                                 │
│                                                    │
│    [Asegurados Creados - si aplica]                │
│                                                    │
│    "⏱️ Redirigiendo en 5 segundos..."              │
│    [Barra de progreso]                             │
│                                                    │
│    [Botón Cerrar - solo en error]                  │
└────────────────────────────────────────────────────┘
```

**Estilos CSS:**
- Éxito: Borde verde, icono ✅ con bounce
- Error: Borde rojo, icono ❌ con pulse

---

### 2. Card de Validación PRE-ENVÍO (En vivo)

**Ubicación:** `CargarDesdeExcel.jsx` línea 1271-1322

**Se muestra cuando:**
- Usuario selecciona un archivo
- Se ejecuta validación automática
- Antes de enviar al servidor

**Estructura:**
```
┌─────────────────────────────────────────┐
│ ⚠️ VALIDACIÓN DE ARCHIVO              │
│                                         │
│ [Mensaje: estructura correcta/incorrecta]│
│                                         │
│ DETALLES:                               │
│ ✓ Columnas válidas: 11/11               │
│ ✓ Tiene headers: ✅ Sí                 │
│ ✓ Tiene datos: ✅ Sí                   │
│                                         │
│ RESULTADOS DE CARGA:                    │
│ ✅ Registros Exitosos: 95               │
│ 📊 Total Procesados: 100                │
│ ❌ Registros Fallidos: 5                │
└─────────────────────────────────────────┘
```

---

## 🔴 Tipos de Errores Reportados

### Por Backend (SolicitudBolsaServiceImpl v1.15.0)

#### 1. ❌ Validación de Teléfono (FIX #1)
```json
{
  "fila": 5,
  "dni": "12345678",
  "error": "Formato de teléfono inválido. Solo se permiten números, +, (), - y espacios | Valor: '+591-abc'"
}
```
**Mostrado en:** Modal + consola
**Log en backend:** `❌ Fila 5: Formato de teléfono inválido...`

---

#### 2. ⚠️ Duplicado Detectado (FIX #2)
```json
{
  "fila": 8,
  "dni": "87654321",
  "error": "DUPLICADO: ya existe solicitud para esta combinación (bolsa, paciente, servicio)"
}
```
**Mostrado en:** Modal + consola
**Log en backend:** `⚠️ [FILA 8] Solicitud duplicada detectada...`

---

#### 3. 📝 Campo Obligatorio Vacío
```json
{
  "fila": 12,
  "error": "DNI o COD. IPRESS ADSCRIPCIÓN vacío"
}
```
**Mostrado en:** Modal + consola
**Log en backend:** Log estándar con número de fila

---

#### 4. 🔄 Error de Actualización (FIX #3)
```json
{
  "fila": 15,
  "dni": "32985821",
  "error": "Error al actualizar solicitud existente: ..."
}
```
**Mostrado en:** Modal + consola
**Log en backend:** `❌ Error al intentar actualizar solicitud...`

---

#### 5. ⚡ Error General de Proceso
```json
{
  "fila": 20,
  "dni": "45678901",
  "error": "java.lang.NullPointerException: ..."
}
```
**Mostrado en:** Modal + consola (sin exponer stacktrace)
**Log en backend:** Error completo con stacktrace

---

## 📲 Flujo de Datos: Backend → Frontend

### Respuesta Exitosa del Servidor

```json
{
  "filas_total": 100,
  "filas_ok": 95,
  "filas_error": 5,
  "mensaje": "Importación completada: 95 OK, 5 errores",
  "errores": [
    {
      "fila": 5,
      "dni": "12345678",
      "error": "Formato de teléfono inválido..."
    },
    {
      "fila": 8,
      "dni": "87654321",
      "error": "DUPLICADO: ya existe solicitud..."
    },
    ...
  ],
  "aseguradosCreados": [
    {
      "nombre": "Juan Pérez",
      "dni": "99999999"
    },
    ...
  ]
}
```

**Campos mapeados al frontend:**
```javascript
setImportStatus({
  type: 'success',  // success, warning, error
  message: resultado.mensaje,
  rowsProcessed: resultado.filas_ok,
  totalRows: resultado.filas_total,  // = filas_ok + filas_error
  failedRows: resultado.filas_error,
  errors: resultado.errores,  // ⚠️ NO SE MUESTRA ACTUALMENTE
  aseguradosCreados: resultado.aseguradosCreados,
  showModal: true
})
```

---

## 🔍 Donde Ver los Errores en Tiempo Real

### 1. **Modal Principal (Recomendado)**
- **URL:** http://localhost:3000/bolsas/cargar-excel
- **Elemento:** PopUp modal con borde rojo
- **Información:** Mensaje general + estadísticas
- **Problema:** No muestra lista detallada de errores por fila

### 2. **Consola del Navegador (Developer Tools)**
- **Atajo:** F12 → Pestaña "Console"
- **Información:**
  - Objeto completo `resultado` con `errores` array
  - Logs de cada paso del import
  - Stacktraces de errores técnicos
- **Ventaja:** Acceso a datos completos de errores

**Ejemplo de log en consola:**
```
✅ Respuesta del servidor: {
  filas_total: 100,
  filas_ok: 95,
  filas_error: 5,
  errores: Array(5) [
    { fila: 5, dni: "12345678", error: "Formato de teléfono inválido..." },
    { fila: 8, dni: "87654321", error: "DUPLICADO: ya existe solicitud..." },
    ...
  ],
  ...
}
```

### 3. **Logs del Backend (Servidor)**
- **Ubicación:** `/logs/cenate.log` o consola donde corre `./gradlew bootRun`
- **Información:** Logs completos con stacktraces
- **Nivel:** DEBUG, INFO, WARN, ERROR

**Ejemplo:**
```
📤 Iniciando importación de Excel - Bolsa: 4, Servicio: 90, Usuario: admin
✅ [FILA 1] Solicitud guardada exitosamente | DNI: 46155443 | Bolsa: 4
❌ [FILA 5] Error procesando fila 5: Formato de teléfono inválido...
⚠️ [FILA 8] Solicitud duplicada detectada en fila 8
✅ [FILA 8] Solicitud actualizada exitosamente (UPDATE)
...
✅ Importación completada - Total: 100, OK: 95, Errores: 5
```

---

## 📈 Mejoras Planeadas para Reporteo de Errores

### ✅ PRÓXIMA FASE: Tabla Expandible de Errores

Cuando implementemos esto, el Modal mostrará:

```
┌──────────────────────────────────────────────┐
│ "¡Importación Exitosa con advertencias!"    │
│                                              │
│ ✅ Éxitosos: 95                            │
│ ⚠️ Fallidos: 5                             │
│                                              │
│ [▼] DETALLES DE ERRORES (5 registros)       │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ Fila 5: Formato de teléfono inválido     ││
│ │ DNI: 12345678                            ││
│ │ Detalle: Valor: '+591-abc'               ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ Fila 8: Solicitud duplicada detectada    ││
│ │ DNI: 87654321                            ││
│ │ Detalle: ya existe para bolsa 4           ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ...                                          │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Cómo Implementar el Reporteo Detallado de Errores

Si quieres que el frontend muestre la tabla detallada de errores, necesitas:

### 1. **Actualizar el Modal (CargarDesdeExcel.jsx)**

```jsx
// En ResultModal, agregar sección de errores detallados:
{importStatus.errors && importStatus.errors.length > 0 && (
  <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200 max-h-60 overflow-y-auto">
    <h3 className="font-bold text-red-900 mb-3">
      ❌ Detalles de Errores ({importStatus.errors.length})
    </h3>
    <div className="space-y-2 text-sm">
      {importStatus.errors.map((err, idx) => (
        <div key={idx} className="bg-white p-3 rounded border-l-4 border-red-400">
          <div className="font-semibold text-gray-800">Fila {err.fila}</div>
          <div className="text-xs text-gray-600">DNI: {err.dni}</div>
          <div className="text-red-700 mt-1">⚠️ {err.error}</div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 2. **Asegurar que el Backend Devuelva `errores`**

✅ **Ya está hecho en v1.15.0:**
- `SolicitudBolsaServiceImpl.importarDesdeExcel()` construye `resultado.put("errores", errores)` (línea 192)
- El controlador devuelve el mapa completo

---

## 📞 Casos de Uso Comunes

### Caso 1: "¿Por qué fallaron 5 filas?"

**Solución:**
1. Abre DevTools (F12) → Console
2. Busca el último `✅ Respuesta del servidor:`
3. Expande `errores` array
4. Lee detalle de cada fila fallida

**Ejemplo:**
```javascript
// Desde la consola:
console.log(resultado.errores)
// Output:
[
  { fila: 5, dni: "12345678", error: "Formato de teléfono inválido..." },
  { fila: 8, dni: "87654321", error: "DUPLICADO: ya existe..." },
  ...
]
```

### Caso 2: "¿Se crearon nuevos pacientes?"

**Solución:**
- Mira en el Modal bajo la sección "Pacientes Creados"
- Muestra nombre + DNI de cada nuevo asegurado creado

### Caso 3: "¿Qué error específico en la línea 25?"

**Solución:**
1. DevTools → Network → última solicitud POST `/importar`
2. Pestaña "Response"
3. Busca en el array `errores` la entrada con `"fila": 25`

---

## 🎯 Resumen de Cambios (v1.15.0)

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Errores por fila** | No disponibles | ✅ Array completo `errores` |
| **Información en Modal** | Resumen solo | ✅ Resumen + estadísticas + pacientes creados |
| **Detalles técnicos** | En logs del servidor | ✅ Disponibles en console.log |
| **DNI en error** | No siempre disponible | ✅ Siempre incluido (FIX #4) |
| **Validación pre-envío** | Básica | ✅ Completa con estructura de 11 campos |

---

## 📝 Próximos Pasos

1. **Implementar tabla expandible de errores en el Modal** (next sprint)
   - Código: Agregar sección en `ResultModal`
   - Tiempo: ~30 minutos

2. **Exportar errores a CSV**
   - Permitir al usuario descargar lista de errores
   - Útil para filas muy grandes (>1000)

3. **Reintento selectivo**
   - Permitir editar y reimportar solo las filas que fallaron
   - Requiere cambios en el controlador

---

**Documento completado:** 2026-01-28
**Estado:** ✅ Detallado y listo para consulta
