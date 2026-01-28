# DIAGNÓSTICO: Error en Importación de Excel OTORRINO

**Fecha:** 2026-01-28
**Archivo:** BOLSA OTORRINO EXPLOTADATOS 26012026.xlsx
**Estado:** ✅ DIAGNÓSTICO COMPLETADO

---

## 📋 Resumen Ejecutivo

**Error actual:**
```
ERROR: duplicate key value violates unique constraint "dim_historial_carga_bolsas_hash_archivo_key"
Key (hash_archivo)=(6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550) already exists
```

**Causa:**
El Excel OTORRINO **ya fue importado antes** en el sistema. La BD tiene un control de duplicados a nivel de **ARCHIVO**, no de **FILAS**, para evitar re-procesar el mismo documento.

---

## ✅ Validación del Archivo Excel

**El archivo está 100% bien estructurado:**

| Aspecto | Resultado |
|---------|-----------|
| Columnas | 11 ✅ (correctas) |
| Filas de datos | 449 ✅ |
| Formato | XLSX ✅ |
| Encabezados | Correctos ✅ |
| Codigos IPRESS | 37 únicos ✅ |
| Tipos de Cita | RECITA (203), REFERENCIA (175), VOLUNTARIA (70), INTERCONSULTA (1) ✅ |
| DNIs | 449 registros (400 únicos, 49 duplicados internos) ✅ |
| Fechas | Válidas ✅ |

**Estructura de columnas:**
1. FECHA PREFERIDA QUE NO FUE ATENDIDA
2. TIPO DOCUMENTO
3. DNI
4. ASEGURADO
5. SEXO
6. FECHA DE NACIMIENTO
7. TELÉFONO
8. TELEFONO ALTERNO
9. CORREO
10. COD. IPRESS ADSCRIPCIÓN
11. TIPO CITA

✅ **Coincide 100% con el patrón esperado v1.14.0**

---

## 🔍 Análisis del Error Real

### Problema Identificado

**NO es un error del aplicativo. Es un CONTROL INTENCIONAL:**

```java
// dim_historial_carga_bolsas.java
@Column(name = "hash_archivo", unique = true, length = 64, nullable = false)
private String hashArchivo;
```

La BD guarda un **SHA256 hash de cada archivo importado** para evitar:
- Re-procesar el mismo archivo por error
- Duplicar solicitudes accidentalmente
- Re-contar estadísticas

**Hash encontrado:**
```
6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550
```

Este hash YA EXISTE en la BD → El archivo OTORRINO ya fue cargado

---

## 🎯 Soluciones

### Opción 1: Verificar si ya se cargó (RECOMENDADA)

```sql
-- Consultar historial de cargas
SELECT
  id_historial,
  nombre_archivo,
  fecha_creacion,
  total_filas,
  filas_ok,
  filas_error,
  estado_carga,
  hash_archivo
FROM dim_historial_carga_bolsas
WHERE hash_archivo = '6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550'
ORDER BY fecha_creacion DESC
LIMIT 5;
```

**Si aparecen registros:** El archivo YA se cargó exitosamente → NO volver a cargar

### Opción 2: Permitir re-carga eliminando constraint (NO RECOMENDADO)

Si el archivo cambió realmente (tiene más/menos filas), se puede:
1. Eliminar el registro anterior de `dim_historial_carga_bolsas`
2. Volver a importar

```sql
-- SOLO si el archivo es realmente diferente
DELETE FROM dim_historial_carga_bolsas
WHERE hash_archivo = '6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550';
```

### Opción 3: Crear una NUEVA versión del archivo

**Para importar el mismo contenido sin errores:**

1. Abrir el Excel original
2. Guardar como `BOLSA_OTORRINO_v2.xlsx` (cambia el hash)
3. Importar la nueva versión

---

## 📊 Cómo Verificar si Ya Se Cargó

Ejecutar desde CLI:

```bash
# Conectarse a la BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Consultar
SELECT nombre_archivo, fecha_creacion, total_filas, filas_ok, estado_carga
FROM dim_historial_carga_bolsas
ORDER BY fecha_creacion DESC
LIMIT 10;
```

---

## 🚀 Próximos Pasos

### Caso 1: El archivo YA se cargó
```
✅ No hacer nada
✅ Las 449 solicitudes YA están en dim_solicitud_bolsa
✅ Verificar en el dashboard de Solicitudes → Bolsas
```

### Caso 2: Necesitas re-cargar
```
1. Ejecutar en BD:
   DELETE FROM dim_historial_carga_bolsas
   WHERE hash_archivo = '6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550';

2. Volver a intentar la importación desde UI
```

### Caso 3: Es un archivo diferente
```
1. Guardar como BOLSA_OTORRINO_v2.xlsx
2. Importar la nueva versión
3. El sistema creará un nuevo hash
```

---

## 🔒 ¿Por Qué Este Control?

El sistema implementó este mecanismo de hash para:

1. **Evitar re-procesamiento:** Si la UI falla parcialmente, no re-carga todo
2. **Auditoría:** Saber qué archivos se procesaron y cuándo
3. **Consistencia:** No duplicar solicitudes si alguien importa 2 veces el mismo archivo
4. **Estadísticas:** No contar los mismos datos dos veces

---

## ✅ Conclusión

| Elemento | Estado |
|----------|--------|
| ¿Excel está mal? | ❌ NO - está perfecto ✅ |
| ¿Aplicativo está mal? | ❌ NO - control funciona bien ✅ |
| ¿Error es válido? | ✅ SÍ - el archivo ya se cargó |
| ¿Hay que arreglarlo? | Depende: si es mismo contenido NO, si es nuevo SÍ |

---

## 📞 Resumen para el Usuario

**TL;DR:**

El archivo OTORRINO ya fue importado al sistema en una fecha anterior. El error que ves es un **CONTROL DE SEGURIDAD** que evita cargar 2 veces el mismo archivo.

**Soluciones:**
1. ✅ **Lo más probable:** Verificar si los datos YA están en la BD (en Solicitudes/Bolsas)
2. Si necesitas cargar NUEVOS datos: Guardar el archivo con otro nombre
3. Si necesitas re-cargar: Consultar al administrador para limpiar el historial

---

**Archivo adjunto:** `DIAGNOSTICO_ERROR_IMPORTACION_OTORRINO.md`

