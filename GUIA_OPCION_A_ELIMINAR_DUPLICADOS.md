# GUÍA OPCIÓN A: Eliminar Duplicados en Excel

**Objetivo:** Limpiar los 49 DNI duplicados del archivo OTORRINO
**Tiempo estimado:** 5 minutos
**Resultado esperado:** Archivo con 400 DNI únicos (449 → 400 registros)

---

## 🎯 Paso 1: Abrir el Archivo

1. Ve a tu carpeta de Descargas
2. Busca: `BOLSA OTORRINO EXPLOTADATOS 26012026.xlsx`
3. **Abre con Microsoft Excel** (o LibreOffice Calc)

**Verifica:** Debes ver 449 filas de datos (header + 448 registros)

---

## 📋 Paso 2: Seleccionar los Datos (Incluyendo Header)

1. **Click en la celda A1** (FECHA PREFERIDA...)
2. **Presiona Ctrl+Shift+End** para seleccionar todos los datos hasta el final
   - O: selecciona manualmente desde A1 hasta K449

**Resultado:** Todas las columnas (A-K) y todas las filas (1-449) estarán resaltadas

---

## 🗑️ Paso 3: Eliminar Duplicados (Excel)

### **OPCIÓN 3A: Excel (Microsoft Office)**

1. Ir a pestaña: **Datos** (Data)
2. Buscar botón: **Eliminar duplicados** (Remove Duplicates)
3. Se abrirá un cuadro de diálogo
4. **Marcar SOLO la columna "DNI"** (Columna C)
5. Click **OK**

```
✅ Las filas con DNI repetido se eliminarán automáticamente
```

**Verificar resultado:** El archivo debería mostrar ~400 filas (header + 399 registros)

---

## 🗑️ Paso 3 Alternativo: Eliminar Duplicados (LibreOffice Calc)

### **OPCIÓN 3B: LibreOffice Calc**

1. Seleccionar todos los datos (A1:K449)
2. Ir a: **Datos** → **Más filtros** → **Filtro estándar**
3. Crear un filtro por DNI sin duplicados
4. O usar: **Datos** → **Filtro avanzado**

**Alternativa más simple:**
1. Seleccionar datos
2. **Datos** → **Eliminar duplicados** (si existe el botón)
3. Elegir columna DNI
4. Click OK

---

## 💾 Paso 4: Guardar con Nuevo Nombre

1. **Archivo** → **Guardar Como** (Save As)
2. **Nombre:** `BOLSA_OTORRINO_LIMPIO_26012026.xlsx`
3. **Formato:** Excel 2007-365 (.xlsx)
4. **Guardar**

```
✅ Guardará con nuevo nombre, el original queda intacto
```

---

## 📊 Paso 5: Verificar el Resultado

Antes de cargar, verifica:

1. **Abre el archivo limpio** `BOLSA_OTORRINO_LIMPIO_26012026.xlsx`
2. **Cuenta las filas:**
   - Header: 1 fila
   - Datos: ~399-400 filas
   - Total: ~400-401 (incluyendo header)

3. **Verifica que no hay DNI repetidos:**
   - Selecciona columna C (DNI)
   - **Datos** → **Filtro** → **Filtro automático**
   - Busca en el dropdown si hay duplicados

---

## 🚀 Paso 6: Cargar en el Aplicativo

1. Abre la UI del CENATE
2. Ve a: **Módulo Bolsas** → **Cargar desde Excel**
3. Selecciona: `BOLSA_OTORRINO_LIMPIO_26012026.xlsx`
4. Bolsa: (selecciona la correspondiente, ej: OTORRINO)
5. Especialidad: (selecciona)
6. **Click: CARGAR**

---

## ✅ Resultado Esperado

```json
{
  "exitosos": 400,
  "fallidos": 0,
  "creados": 5,
  "mensaje": "✅ Importación completada exitosamente"
}
```

---

## 🔍 Troubleshooting

| Problema | Solución |
|----------|----------|
| "No se encuentra botón Eliminar duplicados" | LibreOffice: Usa **Datos > Filtro avanzado** |
| Sigue teniendo errores de duplicados | Verifica que seleccionaste SOLO columna DNI |
| Archivo no guarda cambios | Usa **Guardar Como** con nuevo nombre |
| Carga falla nuevamente | Contacta: hash_archivo aún bloqueado en BD |

---

## 📞 Si la Carga Falla Otra Vez

Si después de limpiar el Excel la carga sigue fallando con el error de `hash_archivo`:

```
ERROR: duplicate key value violates unique constraint "dim_historial_carga_bolsas_hash_archivo_key"
```

**Contactar a administrador para:**
```sql
-- Limpiar el registro anterior
DELETE FROM dim_historial_carga_bolsas WHERE id_carga = 95;
```

Luego reintentar con el archivo limpio.

---

## ✨ Resumen

```
ANTES:  449 filas (400 DNI únicos + 49 duplicados) → ❌ FALLA
DESPUÉS: ~400 filas (400 DNI únicos) → ✅ ÉXITO
```

**¡Listo! Sígueme cuando termines el paso 6.** ✨
