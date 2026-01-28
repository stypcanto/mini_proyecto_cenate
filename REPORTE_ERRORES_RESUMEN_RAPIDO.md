# ⚡ Resumen Rápido: Cómo Reportan Errores

---

## 🎯 Cuando Pruebas la Importación

### ✅ SI TODO VA BIEN
```
Modal Verde ✅
├─ "¡Importación Exitosa!"
├─ "Importación completada: 95 OK, 5 errores"
├─ Estadísticas:
│  ├─ ✅ Éxitosos: 95
│  ├─ 📊 Total: 100
│  └─ ⚠️ Fallidos: 5
├─ Pacientes Creados (si hay nuevos)
└─ Redirige a tabla en 5 segundos
```

---

### ❌ SI HAY ERRORES

**Modal Rojo ❌**
```
├─ "Error en Importación"
├─ Mensaje: "El archivo no cumple con la estructura..."
└─ Botón "Cerrar"
```

**PERO LOS DETALLES COMPLETOS ESTÁN EN:**
- 📱 Consola del Navegador (F12 → Console)
- 🖥️ Logs del Servidor (backend)

---

## 🔍 DÓNDE VER ERRORES DETALLADOS

### 1️⃣ Consola del Navegador (FÁCIL)
```bash
F12  # Abrir DevTools
→ Pestaña "Console"
→ Busca: "✅ Respuesta del servidor:"
→ Expande "errores" array
```

**Verás:**
```json
{
  "errores": [
    {
      "fila": 5,
      "dni": "12345678",
      "error": "Formato de teléfono inválido. Solo se permiten números, +, (), - y espacios | Valor: '+591-abc'"
    },
    {
      "fila": 8,
      "dni": "87654321",
      "error": "DUPLICADO: ya existe solicitud para esta combinación (bolsa, paciente, servicio)"
    }
  ]
}
```

### 2️⃣ Logs del Servidor (TÉCNICO)
```bash
# En la terminal donde corre: ./gradlew bootRun

✅ [FILA 1] Solicitud guardada exitosamente | DNI: 46155443
❌ [FILA 5] Error procesando fila 5: Formato de teléfono inválido...
⚠️ [FILA 8] Solicitud duplicada detectada en fila 8
📱 [TEL_FIJO] Actualizado: '555666777' → '987654321'
✅ [FILA 8] Solicitud actualizada exitosamente (UPDATE)
```

---

## 🐛 Errores Comunes (v1.15.0)

| Error | Significa | Solución |
|-------|-----------|----------|
| `Formato de teléfono inválido` | Teléfono con caracteres raros (+59-abc) | Validar solo números, +, (), - |
| `DUPLICADO: ya existe solicitud` | Intentaste reimportar lo mismo | Normal - backend intenta UPDATE automático |
| `DNI o COD. IPRESS vacío` | Falta campo obligatorio | Revisar Excel |
| `Error al actualizar solicitud` | Fallo el UPDATE fallback (FIX #3) | Ver logs del servidor |
| `Formato de teléfono inválido` | Teléfono con caracteres raros (+59-abc) | Validar solo números, +, (), - |

---

## 📊 Estructura de Respuesta del Backend

```javascript
// Lo que retorna: /api/bolsas/solicitudes/importar

{
  "filas_total": 100,           // Total de filas procesadas
  "filas_ok": 95,               // ✅ Guardadas/actualizadas exitosamente
  "filas_error": 5,             // ❌ Con error
  "mensaje": "Importación completada: 95 OK, 5 errores",

  "errores": [                  // ⚠️ LISTA DETALLADA DE ERRORES
    {
      "fila": 5,                // Número de fila en Excel
      "dni": "12345678",        // DNI del paciente (si disponible)
      "error": "Formato de..."  // Mensaje de error específico
    },
    ...
  ],

  "aseguradosCreados": [        // Nuevos pacientes creados
    {
      "nombre": "Juan Pérez",
      "dni": "99999999"
    }
  ]
}
```

---

## 🎨 Visual en Frontend

### Durante la carga
```
┌─────────────────────────────────┐
│  ⏳ Importando...                 │
│                                 │
│  Procesando archivo...          │
└─────────────────────────────────┘
```

### Después (si todo OK)
```
┌──────────────────────────────────┐
│  ✅ ¡Importación Exitosa!        │
│                                  │
│  Importación completada:         │
│  95 OK, 5 errores                │
│                                  │
│  ✅ Éxitosos: 95                │
│  📊 Total: 100                   │
│  ⚠️ Fallidos: 5                 │
│                                  │
│  👤 Pacientes Creados (2)        │
│  ├─ Juan Pérez (DNI: 99999999)   │
│  └─ María García (DNI: 88888888) │
│                                  │
│  ⏱️ Redirigiendo en 5 segundos...│
│  ████████░░░░░░░░░░░░░░░░░      │
└──────────────────────────────────┘
```

### Después (si hay error general)
```
┌──────────────────────────────────┐
│  ❌ Error en Importación         │
│                                  │
│  El archivo no cumple con la    │
│  estructura requerida.           │
│                                  │
│  [Cerrar]                        │
└──────────────────────────────────┘
```

---

## 🔧 5 Critical Fixes (v1.15.0) - Impacto en Errores

### FIX #1: Validación de Teléfonos ✅
```
Detecta: Teléfono con caracteres inválidos
Reporte: "Fila X: Formato de teléfono inválido"
Cuándo: ANTES de procesar
```

### FIX #2: Detección de Duplicados ✅
```
Detecta: Solicitud ya existe
Reporte: "DUPLICADO: ya existe solicitud para esta combinación"
Cuándo: ANTES de intentar INSERT
```

### FIX #3: Manejo de Constraint ✅
```
Detecta: Violación de constraint unique
Acción: Intenta UPDATE automáticamente
Reporte: "Solicitud actualizada exitosamente (UPDATE)"
Cuándo: Si INSERT falla
```

### FIX #4: DNI en Logs ✅
```
Antes: Error sin DNI en catch block
Ahora: Siempre incluye DNI del paciente
Reporte: { "fila": X, "dni": "12345678", "error": "..." }
```

### FIX #5: Métodos Repository ✅
```
Métodos nuevos:
- existsByIdBolsaAndPacienteIdAndIdServicio()
- findByIdBolsaAndPacienteIdAndIdServicio()
Uso: Detectan duplicados eficientemente
```

---

## ⚡ Checklist cuando Pruebas

- [ ] Subir archivo Excel válido
  - ✅ Esperado: Modal verde, todas filas OK

- [ ] Subir Excel con teléfono inválido (ej: "+591-abc")
  - ✅ Esperado: Fila falla, mensaje en consola con FIX #1

- [ ] Subir el MISMO archivo dos veces
  - ✅ Esperado: Filas duplicadas detectadas, FIX #3 intenta UPDATE
  - ✅ Resultado: 2da importación = actualización de datos

- [ ] Abrir F12 Console después de cada test
  - ✅ Busca: "✅ Respuesta del servidor:"
  - ✅ Expande: "errores" array para ver detalles completos

---

## 📋 Datos Disponibles en Consola

```javascript
// Copiar y pegar en consola (F12):
// Después de hacer una importación:

console.table(resultado.errores)  // Ver tabla de errores
console.log(resultado)             // Ver respuesta completa
```

**Output ejemplo:**
```
┌────────┬──────────┬──────────────────────────────────────────┐
│ (index)│   fila   │                  error                   │
├────────┼──────────┼──────────────────────────────────────────┤
│   0    │    5     │ Formato de teléfono inválido...          │
│   1    │    8     │ DUPLICADO: ya existe solicitud...        │
│   2    │   12     │ DNI o COD. IPRESS ADSCRIPCIÓN vacío      │
│   3    │   15     │ Error al actualizar solicitud...         │
│   4    │   20     │ java.lang.NullPointerException...        │
└────────┴──────────┴──────────────────────────────────────────┘
```

---

## 🎯 TL;DR

**En el Modal ves:**
- Número total de éxito/error
- Nombre de pacientes creados

**En F12 Console ves (todos los errores):**
- Cada fila que falló
- DNI exacto
- Mensaje de error detallado

**En Backend Logs ves:**
- Paso a paso de cada operación
- Logs de validación (FIX #1)
- Logs de duplicados (FIX #2)
- Logs de UPDATE (FIX #3)

---

**Last Updated:** 2026-01-28
**Version:** v1.15.0
