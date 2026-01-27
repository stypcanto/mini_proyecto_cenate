# ⚡ Quick Reference - Solicitudes de Bolsa v1.9.0

## 🚀 Importación Express

### 1. Preparar Excel
- Formato: `.xlsx` (Excel 2007+)
- Encabezados en fila 1
- 10 campos requeridos (ver abajo)

### 2. Subir desde Frontend
```
http://localhost:3000/bolsas/solicitudes
→ Click "Importar solicitudes"
→ Seleccionar TIPO BOLSA (ej: Bolsas Explotación Datos)
→ Seleccionar SERVICIO (ej: NEUMONOLOGÍA)
→ Cargar archivo Excel
```

### 3. API Call (alternativa)
```bash
curl -X POST \
  -F "file=@archivo.xlsx" \
  -F "idTipoBolsa=4" \
  -F "idServicio=89" \
  -F "usuarioCarga=admin" \
  http://localhost:8080/api/bolsas/solicitudes/importar
```

---

## 📋 Estructura del Excel

| Columna | Tipo | Obligatorio | Relleno Automático |
|---------|------|-------------|-------------------|
| FECHA PREFERIDA QUE NO FUE ATENDIDA | Fecha | ❌ | - |
| TIPO DOCUMENTO | Texto | ✅ | - |
| DNI | Texto | ✅ | → Sexo, Email, FechaNac (si vacío) |
| ASEGURADO | Texto | ✅ | - |
| SEXO | Texto | ❌ | ✅ De dim_asegurados |
| FECHA DE NACIMIENTO | Fecha | ❌ | ✅ De dim_asegurados |
| TELÉFONO | Texto | ❌ | - |
| CORREO | Texto | ❌ | ✅ De dim_asegurados |
| COD. IPRESS ADSCRIPCIÓN | Texto | ❌ | → Nombre IPRESS, RED (automático) |
| TIPO CITA | Texto | ❌ | - |

**Campos Obligatorios:** TIPO DOCUMENTO, DNI, ASEGURADO
**Campos Automáticos:** 5 (Sexo, Email, Fecha Nacimiento, IPRESS, RED)

---

## 🔍 API Endpoints

### Importar
```http
POST /api/bolsas/solicitudes/importar
Content-Type: multipart/form-data

Respuesta: { idCarga, estadoCarga, totalFilas, filasOk, filasError, mensaje }
```

### Listar
```http
GET /api/bolsas/solicitudes
Respuesta: Array de SolicitudBolsaDTO con TODOS los campos
```

### Obtener por ID
```http
GET /api/bolsas/solicitudes/{id}
```

---

## 📊 Campos en Respuesta API

### Identificación
- `id_solicitud` - PK
- `numero_solicitud` - SOL-YYYY-TTTTTT-NNN (único)

### Datos Paciente (Excel)
- `paciente_dni` - DNI obligatorio
- `paciente_nombre` - Nombre obligatorio
- `tipo_documento` - DNI, CE, PP, etc.
- `paciente_sexo` - ✅ Enriquecido de dim_asegurados
- `fecha_nacimiento` - ✅ Enriquecido de dim_asegurados
- `paciente_telefono` - De Excel
- `paciente_email` - ✅ Enriquecido de dim_asegurados
- `paciente_edad` - Calculado (opcional)

### Cita y Servicio
- `tipo_cita` - RECITA, CITA NUEVA, etc.
- `especialidad` - De servicio seleccionado
- `cod_tipo_bolsa` - Bolsa seleccionada
- `desc_tipo_bolsa` - Descripción bolsa
- `cod_servicio` - Código servicio
- `id_servicio` - ID servicio

### IPRESS y RED (⭐ ENRIQUECIDO)
- `codigo_ipress_adscripcion` - De Excel (código)
- `id_ipress` - ✅ De dim_ipress (automático)
- `nombre_ipress` - ✅ De dim_ipress (automático)
- `red_asistencial` - ✅ De dim_ipress→red (automático)

### Otras Fechas
- `fecha_preferida_no_atendida` - De Excel
- `fecha_solicitud` - Timestamp importación
- `fecha_cita` - Null inicialmente
- `fecha_atencion` - Null inicialmente

### Estado
- `estado` - PENDIENTE (por defecto)
- `estado_gestion_citas_id` - 5 (PENDIENTE_CITA)
- `activo` - true
- `recordatorio_enviado` - false

---

## ✅ Verificación Rápida

### Desde BD
```sql
-- ¿Cuántos se importaron?
SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 4;

-- ¿Están enriquecidos los datos?
SELECT
  COUNT(CASE WHEN nombre_ipress IS NOT NULL THEN 1 END) as ipress_ok,
  COUNT(CASE WHEN red_asistencial IS NOT NULL THEN 1 END) as red_ok,
  COUNT(CASE WHEN paciente_sexo IS NOT NULL THEN 1 END) as sexo_ok
FROM dim_solicitud_bolsa WHERE id_bolsa = 4;

-- Ver un registro
SELECT numero_solicitud, paciente_nombre, nombre_ipress, red_asistencial
FROM dim_solicitud_bolsa WHERE id_bolsa = 4 LIMIT 1;
```

### Desde API
```bash
curl -s http://localhost:8080/api/bolsas/solicitudes | \
  jq '.[0] | {nombre_ipress, red_asistencial, paciente_sexo}'
```

### Desde Frontend
```
http://localhost:3000/bolsas/solicitudes
→ Columnas deben mostrar:
  ✅ IPRESS (nombre completo)
  ✅ RED (nombre red)
  ✅ SEXO (M/F)
  ✅ TIPO CITA
  ✅ TELÉFONO
```

---

## 🔧 Archivos Principales

| Archivo | Función |
|---------|---------|
| `ExcelImportService.java` | Core: Lee Excel, enriquece datos, inserta |
| `SolicitudBolsaDTO.java` | 43 campos para respuestas API |
| `SolicitudBolsaMapper.java` | Mapea entity → DTO |
| `SolicitudBolsaController.java` | Endpoints REST |
| `Solicitudes.jsx` | Tabla frontal |

---

## 🚨 Troubleshooting

### "IPRESS aparece como NULL"
```sql
-- Verificar que código IPRESS existe
SELECT cod_ipress, desc_ipress FROM dim_ipress WHERE cod_ipress = '740';

-- Si no existe, agregar a dim_ipress
INSERT INTO dim_ipress (cod_ipress, desc_ipress, id_red)
VALUES ('740', 'HOSPITAL UNIVERSITARIO', 1);
```

### "RED aparece como NULL"
```sql
-- Verificar relación IPRESS → RED
SELECT di.cod_ipress, di.desc_ipress, dr.descripcion
FROM dim_ipress di
LEFT JOIN dim_red dr ON di.id_red = dr.id_red
WHERE di.cod_ipress = '740';
```

### "Campos nuevos no aparecen en API"
```bash
# Reiniciar servidor (necesita compilar)
pkill -f bootRun
./gradlew bootRun
```

---

## 📈 Flujo Completo

```
Excel (10 campos)
       ↓
ExcelImportService.leerExcelYProcesarDirecto()
   • Valida campos obligatorios
   • Enriquece desde dim_asegurados (DNI)
   • Enriquece desde dim_ipress (COD)
   • Genera número solicitud único
       ↓
SolicitudBolsa entity (43 campos)
       ↓
solicitudRepository.saveAll()
       ↓
INSERT dim_solicitud_bolsa
       ↓
SolicitudBolsaDTO (43 campos)
       ↓
API Response + Frontend Display
```

---

## 📞 Parámetros Recurrentes

| Parámetro | Ejemplo | Notas |
|-----------|---------|-------|
| idTipoBolsa | 4 | Bolsas Explotación Datos |
| idServicio | 89 | NEUMONOLOGÍA |
| usuarioCarga | admin | Usuario que sube |
| idBolsa (query) | 4 | Para filtrar resultados |

---

## 💾 Base de Datos

**Tabla:** `dim_solicitud_bolsa`
**Campos:** 43
**Relaciones:**
- ↓ idBolsa → dim_tipos_bolsas
- ↓ idServicio → dim_servicio_essi
- ↓ id_ipress → dim_ipress
- ↓ estado_gestion_citas_id → dim_estados_gestion_citas

**Auditoría:** `bolsa_107_carga` (header de importación)

---

## 🎯 Estado Actual (v1.9.0)

✅ Excel importación directa (sin staging)
✅ 10 campos de Excel validados
✅ Enriquecimiento desde 3 tablas (asegurados, IPRESS, RED)
✅ DTO completo con 43 campos
✅ API devolviendo datos completos
✅ Frontend mostrando IPRESS y RED enriquecidas
✅ Production Ready

---

**Última actualización:** 2026-01-26
**Versión:** v1.9.0
**Status:** ✅ Operational
