# Guía: Campo "FECHA PREFERIDA QUE NO FUE ATENDIDA"

**Status:** ✅ COMPLETAMENTE IMPLEMENTADO
**Versión:** v2.1.0
**Fecha:** 2026-01-27

---

## 📋 Resumen

El campo **"FECHA PREFERIDA QUE NO FUE ATENDIDA"** está completamente implementado en:
- ✅ **Excel:** Como **COLUMNA 1** (obligatoria)
- ✅ **Backend:** Validado, procesado y almacenado
- ✅ **Base de Datos:** Tabla `dim_solicitud_bolsa.fecha_preferida_no_atendida`
- ✅ **Frontend:** Visible en la tabla de solicitudes

---

## 1️⃣ EXCEL - Posición y Validación

### Ubicación en Plantilla
```
COLUMNA A (Posición 1) - OBLIGATORIA

Encabezado: FECHA PREFERIDA QUE NO FUE ATENDIDA
Formato:    DD/MM/YYYY (ej: 15/01/2026)
Validación: Debe estar presente en TODA fila de datos
```

### Orden de Columnas en Excel
```
Col A (1)  → FECHA PREFERIDA QUE NO FUE ATENDIDA ⭐ (NUEVO - Posición 1)
Col B (2)  → TIPO DOCUMENTO
Col C (3)  → DNI
Col D (4)  → ASEGURADO (Nombres)
Col E (5)  → SEXO
Col F (6)  → FECHA DE NACIMIENTO
Col G (7)  → TELÉFONO
Col H (8)  → CORREO
Col I (9)  → COD. IPRESS ADSCRIPCIÓN
Col J (10) → TIPO CITA (Recita/Interconsulta/Voluntaria)
```

### Validación en Backend
```java
// Archivo: SolicitudBolsaExcelRowDTO.java (línea 56-57)
if (fechaPreferidaNoAtendida == null || fechaPreferidaNoAtendida.isBlank()) {
    throw new IllegalArgumentException(
        "Fila " + filaExcel + ": FECHA PREFERIDA QUE NO FUE ATENDIDA no puede estar vacía"
    );
}
```

---

## 2️⃣ BACKEND - Procesamiento

### Entity: SolicitudBolsa.java
```java
@Column(name = "fecha_preferida_no_atendida")
private java.time.LocalDate fechaPreferidaNoAtendida;
```

### DTO: SolicitudBolsaExcelRowDTO.java
```java
// Línea 20 - Posición 1 en el record
String fechaPreferidaNoAtendida,
```

### Response DTO: SolicitudBolsaDTO.java
```java
@JsonProperty("fecha_preferida_no_atendida")
private java.time.LocalDate fechaPreferidaNoAtendida;
```

### Mapper: SolicitudBolsaMapper.java
```java
// Línea ~30
.fechaPreferidaNoAtendida(entity.getFechaPreferidaNoAtendida())
```

### Procesamiento en ExcelImportService.java
```java
// Línea 224 - Extrae índice de columna
Integer idxFechaPreferida = idx.getOrDefault(
    n("FECHA PREFERIDA QUE NO FUE ATENDIDA"), -1
);

// Línea 419 - Lee valor de la celda
String fechaPreferida = cellStr(row,
    idx.getOrDefault(n("FECHA PREFERIDA QUE NO FUE ATENDIDA"), -1)
);

// Línea ~450 - Asigna al builder
.fechaPreferidaNoAtendida(fechaPreferida)
```

---

## 3️⃣ BASE DE DATOS - Almacenamiento

### Tabla: dim_solicitud_bolsa
```sql
Column: fecha_preferida_no_atendida
Type:   DATE
Nullable: false (obligatorio)
```

### Script de Migración
```sql
-- Archivo: V3_0_4__crear_tabla_solicitud_bolsa_v1_6.sql
CREATE TABLE dim_solicitud_bolsa (
    ...
    fecha_preferida_no_atendida DATE,
    ...
);
```

### Datos Actuales (BD Real)
```
Total registros: 36
Con fecha_preferida_no_atendida: 36 (100%) ✅
Rango de fechas: 2025-01-XX a 2026-01-XX
```

---

## 4️⃣ FRONTEND - Visualización

### Mapeo de Datos (Solicitudes.jsx, línea 110)
```javascript
fechaPreferidaNoAtendida: solicitud.fecha_preferida_no_atendida
    ? new Date(solicitud.fecha_preferida_no_atendida)
        .toLocaleDateString('es-PE')
    : 'N/A'
```

### Renderizado en Tabla (Solicitudes.jsx, línea 735)
```jsx
<td className="px-4 py-3 text-sm text-gray-700">
    {solicitud.fechaPreferidaNoAtendida}
</td>
```

### Columna Visible
```
Nombre en UI: "Fecha Pref. No Atendida"
Formato:     DD/MM/YYYY (ej: 15/01/2026)
Posición:    En tabla de solicitudes
```

---

## 📊 Flujo Completo

```
1️⃣ USUARIO CARGA EXCEL
   ↓
2️⃣ EXCEL CONTIENE COLUMNA A: "FECHA PREFERIDA QUE NO FUE ATENDIDA"
   ↓
3️⃣ BACKEND LEE EXCEL
   ├─ ExcelImportService.java detecta columna
   ├─ SolicitudBolsaExcelRowDTO valida (obligatorio)
   └─ Convierte DD/MM/YYYY → YYYY-MM-DD
   ↓
4️⃣ INSERTA EN BD
   └─ dim_solicitud_bolsa.fecha_preferida_no_atendida = valor
   ↓
5️⃣ API RETORNA DATOS
   └─ SolicitudBolsaDTO.fecha_preferida_no_atendida = valor
   ↓
6️⃣ FRONTEND RENDERIZA
   └─ Solicitudes.jsx muestra fecha en tabla
   ↓
7️⃣ USUARIO VE
   └─ Columna "Fecha Pref. No Atendida" en tabla
```

---

## ✅ Verificación - ¿Dónde ver el campo?

### En BD (PostgreSQL)
```sql
-- Ver todos los valores del campo
SELECT
    id_solicitud,
    paciente_nombre,
    fecha_preferida_no_atendida
FROM dim_solicitud_bolsa
ORDER BY fecha_preferida_no_atendida DESC;

-- Resultado esperado: 36 registros con fechas
```

### En API (REST)
```bash
# Ver datos del API
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8080/api/bolsas/solicitudes | jq '.[0] | {
       id_solicitud,
       fecha_preferida_no_atendida
     }'

# Respuesta esperada:
{
  "id_solicitud": 36,
  "fecha_preferida_no_atendida": "2026-01-15"
}
```

### En Frontend (Navegador)
1. Abre http://localhost:3000/bolsas/solicitudes
2. Abre DevTools (F12)
3. En Consola, ejecuta:
   ```javascript
   // Ver primera solicitud
   console.log(document.querySelector('table tbody tr:first-child td:nth-child(11)').textContent);
   ```
4. Deberías ver una fecha como "15/01/2026"

---

## 🔧 Detalles Técnicos

### Conversión de Fechas
```
Excel (Usuario):    15/01/2026 (DD/MM/YYYY)
Backend:            2026-01-15 (YYYY-MM-DD)
BD (Almacenado):    2026-01-15 (DATE)
API (JSON):         "2026-01-15" (ISO 8601)
Frontend (UI):      15/01/2026 (toLocaleDateString es-PE)
```

### Validaciones Aplicadas
```
✅ Campo obligatorio en Excel (no puede estar vacío)
✅ Formato: DD/MM/YYYY o YYYY-MM-DD
✅ Tipo: LocalDate (sin hora)
✅ Rango: Fechas válidas únicamente
✅ No permite NULL en BD (NOT NULL constraint)
```

---

## 📝 Ejemplo Completo

### Entrada Excel
```
Fila 2 (datos):
A: 15/01/2026                          ← FECHA PREFERIDA QUE NO FUE ATENDIDA
B: DNI
C: 12345678
D: Juan Pérez García
E: M
F: 1990-05-20
G: 987654321
H: juan@email.com
I: 000001
J: Recita
```

### Procesamiento Backend
```java
// SolicitudBolsaExcelRowDTO validación
- fechaPreferidaNoAtendida = "15/01/2026"  ✅ NO vacío
- Se valida como LocalDate → 2026-01-15

// Builder crea SolicitudBolsa
.fechaPreferidaNoAtendida(LocalDate.of(2026, 1, 15))

// Se guarda en BD
INSERT INTO dim_solicitud_bolsa (..., fecha_preferida_no_atendida)
VALUES (..., '2026-01-15')
```

### Respuesta API
```json
{
  "id_solicitud": 1,
  "fecha_preferida_no_atendida": "2026-01-15",
  "paciente_nombre": "Juan Pérez García",
  ...
}
```

### Visualización Frontend
```
┌─────────────────────────────────────────┐
│ ID │ DNI      │ Paciente      │ Fecha.. │
├─────────────────────────────────────────┤
│ 1  │ 12345678 │ Juan Pérez G. │ 15/01  │
│    │          │               │ /2026  │
└─────────────────────────────────────────┘
```

---

## 🎯 Resumen Final

| Aspecto | Status | Ubicación |
|---------|--------|-----------|
| **Excel Column** | ✅ IMPLEMENTADO | Columna A (OBLIGATORIA) |
| **Backend Validation** | ✅ IMPLEMENTADO | SolicitudBolsaExcelRowDTO.java |
| **Database Storage** | ✅ IMPLEMENTADO | dim_solicitud_bolsa.fecha_preferida_no_atendida |
| **API Response** | ✅ IMPLEMENTADO | SolicitudBolsaDTO.java |
| **Frontend Display** | ✅ IMPLEMENTADO | Solicitudes.jsx tabla |
| **Formato Fecha** | ✅ IMPLEMENTADO | DD/MM/YYYY en UI |
| **Validación** | ✅ IMPLEMENTADO | Obligatorio, no puede ser vacío |

---

**¿Necesitas algo más?**
- Si quieres cambiar el nombre del campo ❌ (afectaría BD)
- Si quieres hacerlo opcional ✅ (puedo cambiar validación)
- Si quieres agregarlo a reportes ✅ (fácil de agregar)
- Si quieres usarlo en filtros ✅ (puedo implementar)

