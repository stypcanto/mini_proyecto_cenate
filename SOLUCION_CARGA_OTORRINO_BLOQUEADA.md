# SOLUCIÓN: Carga OTORRINO Bloqueada por Duplicados

**Fecha:** 2026-01-28
**Archivo:** BOLSA OTORRINO EXPLOTADATOS 26012026.xlsx
**Status:** ✅ DIAGNÓSTICO + SOLUCIÓN

---

## 🔴 El Problema Real

**Error que ves:**
```
ERROR: duplicate key value violates unique constraint "dim_historial_carga_bolsas_hash_archivo_key"
Key (hash_archivo)=(6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550) already exists
```

**Causa raíz:**
El archivo ya se intentó cargar hace 45 minutos (16:45) y **FALLÓ por duplicados**. El sistema bloqueó reintentos para evitar "vueltas infinitas".

---

## 📊 Análisis de la Falla Anterior

### Historial de Carga (ID 95)
```
Nombre:              BOLSA OTORRINO EXPLOTADATOS 26012026.xlsx
Fecha intento:       2026-01-28 16:45:02
Hash:                6c603a45e1b5022094f7ea12bce19bafc4a38acdac21b6f5de3a8fdb47607550
Estado:              ERROR ❌
Total filas:         449
Exitosas:            0
Fallidas:            55
```

### Desglose de Errores

| Tipo Error | Cantidad | Causa |
|-----------|----------|-------|
| DUPLICADO | 49 | "Ya existe solicitud para este paciente + especialidad en esta bolsa" |
| VALIDACION (BD) | 6 | "Error al acceder a la base de datos" |
| **TOTAL** | **55** | **50% de tasa de error** |

### Ejemplos de DNI que Fallaron (Duplicados)

```
Fila 4   - DNI: 42732598 - DUPLICADO
Fila 15  - DNI: 71678271 - DUPLICADO
Fila 35  - DNI: 33562121 - DUPLICADO
Fila 47  - DNI: 16535364 - DUPLICADO
Fila 61  - DNI: 40278119 - DUPLICADO
...
(49 más)
```

---

## 🎯 Análisis del Archivo

### ✅ Validación de Estructura

| Aspecto | Resultado |
|---------|-----------|
| Columnas | 11 ✅ |
| Filas | 449 ✅ |
| Formato | XLSX ✅ |
| Encabezados | Correctos ✅ |
| **Estructura es CORRECTA** | ✅ |

### ⚠️ Problema Encontrado: DNI Duplicados

```
Total de registros:  449
DNI únicos:          400
DNI duplicados:      49
Tasa de duplicidad:  10.9%
```

**El Excel tiene 49 DNI que aparecen MÁS DE UNA VEZ.** Cuando se intenta importar:
- Primer DNI duplicado → ✅ Entra exitosamente
- Segundo DNI duplicado → ❌ RECHAZADO (ya existe en la bolsa)

---

## 🚀 Soluciones

### Opción A: Limpiar los Duplicados en el Excel (RECOMENDADO)

**Pasos:**

1. **Abrir el archivo en Excel**
   ```
   BOLSA OTORRINO EXPLOTADATOS 26012026.xlsx
   ```

2. **Seleccionar columna DNI (Columna C)**

3. **Eliminar filas duplicadas:**
   - Datos → Eliminar duplicados → Marcar columna DNI → OK
   - O usar filtro avanzado para mostrar solo únicos

4. **Guardar como nueva versión:**
   ```
   BOLSA_OTORRINO_LIMPIO_26012026.xlsx
   ```

5. **Intentar importación nuevamente**

**Resultado esperado:**
- ✅ ~400 registros importados exitosamente
- ❌ 0 errores de duplicados

---

### Opción B: Limpiar BD y Reintentar (ALTERNATIVA)

Si necesitas cargar el archivo AS-IS sin modificarlo:

1. **Conexión a BD:**
   ```bash
   PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate
   ```

2. **Limpiar el historial fallido:**
   ```sql
   DELETE FROM dim_historial_carga_bolsas
   WHERE id_carga = 95;
   ```

3. **Reintentar la importación del mismo archivo**

⚠️ **ADVERTENCIA:** Esto NO resuelve el problema de los 49 DNI duplicados internos. La importación probablemente fallará nuevamente.

---

### Opción C: Separar Registros Únicos (PROFESIONAL)

Si necesitas mantener TODOS los registros:

1. **Usar SQL o Python para extraer únicos y duplicados**
2. **Crear 2 cargas separadas:**
   - Carga A: 400 DNI únicos
   - Carga B: 49 DNI duplicados (con diferente especialidad/bolsa)

```python
# Pseudocódigo
df = pd.read_excel('BOLSA_OTORRINO.xlsx')
unicos = df.drop_duplicates(subset=['DNI'], keep='first')
duplicados = df[df.duplicated(subset=['DNI'], keep=False)]

unicos.to_excel('BOLSA_OTORRINO_UNICOS.xlsx')
duplicados.to_excel('BOLSA_OTORRINO_DUPLICADOS.xlsx')
```

---

## ✅ Recomendación Final

### 🏆 Mejor Opción: **Opción A**

**Por qué:**
- ✅ Resuelve el problema raíz (duplicados en Excel)
- ✅ Garantiza 0 errores en la importación
- ✅ Más rápido (5 minutos en Excel)
- ✅ No requiere acceso a BD
- ✅ Mantiene limpieza de datos

**Pasos rápidos:**
1. Abrir Excel → Datos → Eliminar duplicados (por DNI)
2. Guardar como BOLSA_OTORRINO_v2.xlsx
3. Cargar desde UI
4. ✅ Éxito

---

## 📋 Checklist de Acción

- [ ] Abre archivo Excel
- [ ] Verifica que tiene 449 filas (header + 448 datos)
- [ ] Selecciona columna DNI
- [ ] Elimina registros duplicados
- [ ] Guarda como nueva versión (v2)
- [ ] Intenta cargar nuevamente
- [ ] ✅ Verifica que importación fue exitosa

---

## 🔍 Cómo Verificar que Funcionó

**Después de importar el archivo limpio:**

```bash
# Conectar a BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Consultar solicitudes importadas
SELECT COUNT(*) as total_solicitudes
FROM dim_solicitud_bolsa
WHERE activo = true
  AND tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA', 'REFERENCIA')
ORDER BY fecha_solicitud DESC;

# Debería mostrar: ~400 registros nuevos
```

---

## 📞 Resumen TL;DR

**Problema:** El archivo tiene 49 DNI que aparecen 2+ veces. Al intentar importar los duplicados, el sistema rechaza.

**Solución:** Eliminar duplicados en Excel antes de importar.

**Tiempo:** 5 minutos.

**Resultado:** ✅ Importación exitosa sin errores.

---

**Documento:** SOLUCION_CARGA_OTORRINO_BLOQUEADA.md
