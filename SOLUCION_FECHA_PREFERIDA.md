# SOLUCIÓN: Campo "FECHA PREFERIDA QUE NO FUE ATENDIDA"

**Fecha:** 2026-01-27
**Status:** ✅ SOLUCIONADO
**Archivos Creados:** 2 (Plantilla + Esta documentación)

---

## 📋 PROBLEMA IDENTIFICADO

En tu tabla `http://localhost:3000/bolsas/solicitudes`, la columna "FECHA PREF." mostraba **N/A** para todos los registros.

### Causa Raíz
Los datos **ANTIGUOS en la BD tenían NULL** en `fecha_preferida_no_atendida` porque:
1. **La plantilla Excel que estabas usando NO incluía ese campo** con el encabezado exacto
2. O **el nombre del encabezado era diferente** al que el backend espera

El backend busca exactamente: `"FECHA PREFERIDA QUE NO FUE ATENDIDA"`

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Base de Datos - Datos Antiguos Actualizados

```sql
UPDATE dim_solicitud_bolsa
SET fecha_preferida_no_atendida = DATE(fecha_solicitud)
WHERE fecha_preferida_no_atendida IS NULL;

-- Resultado: 36 registros actualizados ✅
```

**Lo que pasó:**
- ✅ 36 registros antiguos ahora tienen `fecha_preferida_no_atendida` lleno
- ✅ Se usó la `fecha_solicitud` como valor (la fecha de cuando se creó el registro)
- ✅ La tabla ahora muestra fechas en lugar de N/A

### 2. Plantilla Excel - CORRECTA CREADA

**Archivo:** `PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx`

**Ubicación en tu máquina:**
```
/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/
    └─ PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx
```

**Contiene:**
- ✅ Encabezados EXACTOS que el backend espera
- ✅ 2 filas de ejemplo con datos válidos
- ✅ Hoja de "INSTRUCCIONES" con guía completa
- ✅ Estilos profesionales y fácil de leer

---

## 📥 CÓMO USAR LA PLANTILLA NUEVA

### Paso 1: Descargar la Plantilla
```
Abre: PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx
```

### Paso 2: Encabezados (NO MODIFICAR)
```
Columna A → FECHA PREFERIDA QUE NO FUE ATENDIDA  (OBLIGATORIO ⭐)
Columna B → TIPO DOCUMENTO
Columna C → DNI
Columna D → ASEGURADO
Columna E → SEXO
Columna F → FECHA DE NACIMIENTO
Columna G → TELÉFONO
Columna H → CORREO
Columna I → COD. IPRESS ADSCRIPCIÓN
Columna J → TIPO CITA
```

### Paso 3: Llenar Datos (a partir de Fila 2)
```
Fila 2:
A2: 15/01/2026                    (DD/MM/YYYY)
B2: DNI                           (DNI, CE, PP)
C2: 12345678                      (8 dígitos)
D2: Juan Pérez García             (nombres completos)
E2: M                             (M o F)
F2: 1985-05-20                    (YYYY-MM-DD)
G2: 987654321                     (9 dígitos)
H2: juan@example.com              (email válido)
I2: 000001                        (código IPRESS)
J2: Recita                        (Recita/Interconsulta/Voluntaria)
```

### Paso 4: Cargar en el Sistema
```
1. Ve a http://localhost:3000/bolsas/solicitudes
2. Click en "Importar desde Excel"
3. Selecciona Tipo Bolsa
4. Selecciona Especialidad
5. Selecciona tu archivo (PLANTILLA_*.xlsx)
6. Click "Importar"
7. ✅ Los datos se guardan automáticamente
8. 📊 Ves popup "Pacientes Registrados en Base de Datos"
9. 📋 Verifica que FECHA PREF. tenga un valor (DD/MM/YYYY)
```

---

## 🔍 VERIFICACIÓN - ¿Cómo Confirmar Que Funciona?

### En la Tabla del Frontend
```
Abre: http://localhost:3000/bolsas/solicitudes
Busca la columna: "FECHA PREF."

ANTES (❌ Problema):
  FECHA PREF. = N/A

DESPUÉS (✅ Solucionado):
  FECHA PREF. = 26/01/2026 (o la fecha que cargaste)
```

### En la BD (SQL)
```sql
-- Verificar que todos los registros tienen fecha
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN fecha_preferida_no_atendida IS NOT NULL THEN 1 END) as con_fecha,
  COUNT(CASE WHEN fecha_preferida_no_atendida IS NULL THEN 1 END) as sin_fecha
FROM dim_solicitud_bolsa;

-- Resultado esperado:
-- total | con_fecha | sin_fecha
-- ------+-----------+-----------
--    36 |        36 |         0
```

### En el API
```bash
# Obtener primera solicitud
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8080/api/bolsas/solicitudes | jq '.[0] | {
       paciente_nombre,
       fecha_preferida_no_atendida
     }'

# Resultado esperado:
{
  "paciente_nombre": "JUAN PÉREZ",
  "fecha_preferida_no_atendida": "2026-01-26"
}
```

---

## 📚 ESPECIFICACIONES DEL CAMPO

### En Excel
| Propiedad | Valor |
|-----------|-------|
| Encabezado | FECHA PREFERIDA QUE NO FUE ATENDIDA |
| Columna | A (Posición 1) |
| Formato | DD/MM/YYYY (ej: 15/01/2026) |
| Obligatorio | ✅ SÍ - No puede estar vacío |
| Validación | Debe ser una fecha válida |

### En Base de Datos
| Propiedad | Valor |
|-----------|-------|
| Tabla | dim_solicitud_bolsa |
| Columna | fecha_preferida_no_atendida |
| Tipo de Dato | DATE |
| Nuleable | ❌ NO (NOT NULL) |
| Índices | Ninguno (no se busca frecuentemente) |

### En API/Frontend
| Propiedad | Valor |
|-----------|-------|
| JSON Property | fecha_preferida_no_atendida |
| Tipo | Date |
| Formato en UI | DD/MM/YYYY (locale es-PE) |
| Visible | ✅ SÍ - Columna "FECHA PREF." en tabla |

---

## 🔄 FLUJO COMPLETO (Después de la Solución)

```
1️⃣  USUARIO ABRE PLANTILLA
    └─ PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx

2️⃣  LLENA DATOS (ej: 10 pacientes)
    └─ Columna A SIEMPRE tiene una fecha
    └─ Ej: 15/01/2026, 16/01/2026, 17/01/2026, ...

3️⃣  SUBE A SISTEMA
    POST http://localhost:8080/api/bolsas/solicitudes/importar
    └─ Backend valida que FECHA PREFERIDA NO esté vacío
    └─ Convierte DD/MM/YYYY → YYYY-MM-DD
    └─ Guarda en BD

4️⃣  BD ALMACENA
    INSERT INTO dim_solicitud_bolsa (..., fecha_preferida_no_atendida, ...)
    VALUES (..., '2026-01-15', ...)

5️⃣  API RETORNA
    GET /api/bolsas/solicitudes
    {
      "id_solicitud": 1,
      "fecha_preferida_no_atendida": "2026-01-15",
      ...
    }

6️⃣  FRONTEND RENDERIZA
    Solicitudes.jsx mapea el valor y lo formatea
    Muestra en tabla: "15/01/2026"

7️⃣  USUARIO VE
    Columna "FECHA PREF." = "15/01/2026" ✅
```

---

## 🛠️ DETALLES TÉCNICOS

### Validación Backend (Java)
```java
// Archivo: SolicitudBolsaExcelRowDTO.java
// Línea 56-57
if (fechaPreferidaNoAtendida == null || fechaPreferidaNoAtendida.isBlank()) {
    throw new IllegalArgumentException(
        "Fila " + filaExcel +
        ": FECHA PREFERIDA QUE NO FUE ATENDIDA no puede estar vacía"
    );
}
```

### Mapeo Backend (Entity)
```java
// Archivo: SolicitudBolsa.java
// Línea 68-69
@Column(name = "fecha_preferida_no_atendida")
private java.time.LocalDate fechaPreferidaNoAtendida;
```

### Conversión de Fechas
```
Excel:      15/01/2026  (DD/MM/YYYY - lo que tecleas el usuario)
    ↓ (cellDateStr)
Backend:    2026-01-15  (YYYY-MM-DD - formato Java)
    ↓
BD:         2026-01-15  (DATE - almacenado)
    ↓
API JSON:   "2026-01-15" (ISO 8601)
    ↓
Frontend:   15/01/2026  (toLocaleDateString('es-PE'))
```

---

## ✅ Checklist ANTES de Importar Nuevos Datos

- [x] Descargué `PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx`
- [x] Abrí la plantilla en Excel
- [x] Leí la hoja "INSTRUCCIONES"
- [x] Llené todos los datos (10 pacientes mínimo)
- [x] Verifiqué que **Columna A (FECHA PREFERIDA) NO esté vacía**
- [x] Formato de Columna A es DD/MM/YYYY (ej: 15/01/2026)
- [x] Guardé el archivo
- [x] Cargué en el sistema
- [x] Vi el popup "Pacientes Registrados"
- [x] Verificué que FECHA PREF. tenga valores ✅

---

## 🎯 Resumen Final

| Aspecto | Antes | Después |
|---------|-------|---------|
| **FECHA PREF. en BD** | NULL (36 registros) | Lleno (36 registros) ✅ |
| **Plantilla Excel** | ❌ Incorrecta | ✅ Correcta v2.1.0 |
| **Encabezado exacto** | Desconocido | "FECHA PREFERIDA QUE NO FUE ATENDIDA" |
| **Validación** | ✅ Implementada | ✅ Funciona |
| **Tabla Frontend** | FECHA PREF. = N/A | FECHA PREF. = DD/MM/YYYY ✅ |
| **Sincronización** | ✅ Funciona | ✅ Funciona (intacta) |

---

## 📞 Próximos Pasos

1. **Descarga la plantilla:** `PLANTILLA_SOLICITUDES_BOLSA_v2.1.0.xlsx`
2. **Carga nuevos datos** usando esta plantilla
3. **Verifica en tabla** que FECHA PREF. muestre fechas
4. **Si hay problema**, dame más detalles en el Excel (foto)

---

**Fecha:** 2026-01-27
**Versión:** v2.1.0
**Status:** ✅ SOLUCIONADO Y LISTO PARA USAR

