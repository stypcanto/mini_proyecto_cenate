# 📝 CHANGELOG - Módulo de Bolsas v2.1.0

> **Fecha:** 2026-01-28
> **Versión:** v2.1.0
> **Status:** ✅ Completado y Documentado
> **Cambios Totales:** 8 características nuevas + 12 archivos modificados

---

## 🎯 Resumen Ejecutivo

v2.1.0 introduce **Control de Acceso Basado en Roles (RBAC)** y mejoras significativas en **UX de filtros** y **enriquecimiento de datos**. Todas las características se han implementado, probado y documentado.

---

## 🆕 Características Nuevas (v2.1.0)

### 1️⃣ Control de Acceso RBAC - Botón Borrar

**Descripción:** Restricción de acceso para operaciones destructivas

**Archivos Modificados:**
- `frontend/src/pages/bolsas/Solicitudes.jsx` ✅
- `frontend/src/context/PermisosContext.jsx` (sin cambios, solo se utilizó)

**Implementación:**
```javascript
// Línea 7: Importar hook
import { usePermisos } from '../../context/PermisosContext';

// Línea 46: Obtener flag SUPERADMIN
const { esSuperAdmin } = usePermisos();

// Línea 1007-1023: Condicional rendering
{esSuperAdmin && (
  <button
    onClick={() => {
      const cantidad = seleccionarTodas ? solicitudesFiltradas.length : selectedRows.size;
      setCantidadABorrar(cantidad);
      setModalConfirmarBorrado(true);
    }}
    className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold...`}
  >
    <AlertCircle size={22} className="font-bold" />
    Borrar {seleccionarTodas ? `TODAS (${solicitudesFiltradas.length})` : `Selección (${selectedRows.size})`}
  </button>
)}
```

**Comportamiento:**
- ✅ SUPERADMIN → Ve botón rojo "Borrar Selección"
- ❌ Admin, Médico, Coordinador, etc. → Botón NO visible
- ✅ Todos pueden desseleccionar con "❌ Deseleccionar TODAS"

**Seguridad:**
- Frontend: Oculta botón para usuarios sin SUPERADMIN
- Backend: Validaciones mantienen restricción (defense in depth)

---

### 2️⃣ Filtros Dinámicos con Contadores

**Descripción:** Dropdowns muestran cantidad de registros + opciones con 0 matches se ocultan

**Archivo Modificado:**
- `frontend/src/pages/bolsas/Solicitudes.jsx` (Líneas 175-320) ✅

**Implementación:**

```javascript
// Función que calcula dinámicamente contadores
const countWithFilters = (filterKey, filterValue) => {
  return solicitudes.filter(sol => {
    const matchSearch = sol.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.pacienteDni?.includes(searchTerm);
    const matchBolsa = filterKey === 'bolsa' ? sol.nombreBolsa === filterValue :
      (filtroBolsa === 'todas' ? true : sol.nombreBolsa === filtroBolsa);
    const matchMacrorregion = filterKey === 'macro' ? sol.macroregion === filterValue :
      (filtroMacrorregion === 'todas' ? true : sol.macroregion === filtroMacrorregion);
    // ... más filtros
    return matchSearch && matchBolsa && matchMacrorregion && matchRed && matchIpress;
  }).length;
};
```

**Mapeo de Opciones Dinámicas:**
```javascript
// Antes (mostraba todas las opciones)
<option value="PEDIATRÍA">PEDIATRÍA</option>
<option value="ANESTESIOLOGÍA">ANESTESIOLOGÍA</option>

// Después (solo muestra si count > 0)
especialidades
  .filter(esp => countWithFilters('especialidad', esp.descServicio) > 0)
  .map(esp => (
    <option key={esp.idServicio} value={esp.descServicio}>
      {esp.descServicio} ({countWithFilters('especialidad', esp.descServicio)})
    </option>
  ))
```

**Beneficios:**
- ✅ UX mejorada: No confunde al usuario con opciones vacías
- ✅ Interactividad: Contadores en tiempo real
- ✅ Eficiencia: Filtra dropdowns según contexto

---

### 3️⃣ Teléfono Alterno (Mapeo Excel)

**Descripción:** Soporte para teléfono secundario desde tabla asegurados

**Archivos Modificados:**
- `frontend/src/pages/bolsas/CargarDesdeExcel.jsx` (v1.14.0) ✅
- `backend/src/main/java/.../SolicitudBolsaDTO.java` (v2.2.0) ✅
- `backend/src/main/java/.../SolicitudBolsaServiceImpl.java` (v1.18.3+) ✅
- `backend/src/main/java/.../SolicitudBolsa.java` (Entity) ✅

**Mapeo:**
```
Excel Columna 8 (Teléfono Alterno)
        ↓
dim_solicitud_bolsa.paciente_telefono_alterno
        ↓
Enriquecimiento desde asegurados.tel_celular
```

**DTO:**
```java
@JsonProperty("paciente_telefono_alterno")
private String pacienteTelefonoAlterno;
```

**Comportamiento:**
- Si Excel col 8 está vacío → buscar en asegurados.tel_celular
- Si asegurado no existe → crear nuevo automáticamente
- Si ambos tienen datos → usar datos del Excel

---

### 4️⃣ Auto-creación de Asegurados Faltantes

**Descripción:** Generación automática de registros en tabla asegurados

**Archivo Modificado:**
- `backend/src/main/java/.../SolicitudBolsaServiceImpl.java` (v1.18.3+) ✅

**Lógica:**
```java
private void crearAseguradoMinimo(ExcelRow row) {
  Asegurado asegurado = new Asegurado();
  asegurado.setPacienteId(row.getPacienteId());
  asegurado.setNombre(row.getPacienteNombre());
  asegurado.setSexo(row.getPacienteSexo());
  asegurado.setFechaNacimiento(row.getFechaNacimiento());
  asegurado.setTelFijo(row.getPacienteTelefono());
  asegurado.setTelCelular(row.getPacienteTelefonoAlterno());
  // ... más campos
  aseguradoRepository.save(asegurado);
}
```

**Trigger:**
- Al importar Excel y encontrar FK error → auto-crear asegurado
- Copia datos disponibles del Excel
- Establece relación correcta

---

### 5️⃣ Normalización IPRESS (3 Dígitos)

**Descripción:** Padding de códigos IPRESS para lookups correctos

**Archivo Modificado:**
- `backend/src/main/java/.../SolicitudBolsaServiceImpl.java` (v1.18.3+) ✅

**Implementación:**
```java
// Entrada: "21"
// Salida: "021"
String codigoIpressNormalizado = String.format("%03d", Integer.parseInt(codigoIpress.trim()));
```

**Uso:**
```java
// En método de importación
String codigoNormalizado = String.format("%03d", Integer.parseInt(row.getCodigoIpress().trim()));
solicitud.setCodigoAdscripcion(codigoNormalizado);
```

**Beneficios:**
- ✅ Lookups correctos en dim_ipress
- ✅ Evita duplicados por formato
- ✅ Compatible con BD

---

### 6️⃣ Enriquecimiento Cascada (RED + MACRORREGIÓN)

**Descripción:** JOINs automáticas para completar datos de localización

**Archivo Modificado:**
- `backend/src/main/java/.../SolicitudBolsaRepository.java` (v2.1.0) ✅

**SQL Query:**
```sql
SELECT sb.*,
       tb.desc_tipo_bolsa,
       di.desc_ipress,
       dr.desc_red,
       dm.desc_macro
FROM dim_solicitud_bolsa sb
LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
LEFT JOIN dim_red dr ON di.id_red = dr.id_red
LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
WHERE sb.activo = true
```

**Datos enriquecidos disponibles:**
- `desc_ipress` - Nombre de institución
- `desc_red` - Red asistencial
- `desc_macro` - Macrorregión

**Frontend:**
```javascript
// Acceso directo a los datos enriquecidos
<td>{solicitud.desc_macro || 'Sin asignar'}</td>
<td>{solicitud.desc_red || 'Sin asignar'}</td>
<td>{solicitud.desc_ipress || 'Sin asignar'}</td>
```

---

### 7️⃣ UI Mejorada - ListHeader.jsx

**Descripción:** Reorganización de filtros en 3 filas lógicas

**Archivo Modificado:**
- `frontend/src/components/ListHeader.jsx` (v2.0.0) ✅

**Nuevo Layout:**
```
┌─────────────────────────────────────────────┐
│ Búsqueda                                    │
├─────────────────────────────────────────────┤
│                                             │
│ Fila 1: Bolsas (3 cols) | Limpiar (1 col) │
│                                             │
│ Fila 2: Macrorregión | RED | IPRESS        │
│ (siempre juntas en una fila)                │
│                                             │
│ Fila 3: Especialidades | Tipo de Cita      │
│                                             │
└─────────────────────────────────────────────┘
```

**Cambios Visuales:**
- Bordes: 2px (antes 1px)
- Labels superiores para cada dropdown
- Focus rings: `focus:ring-2 focus:ring-blue-500`
- Hover effects: `hover:border-gray-400`
- Gradiente fondo: `from-gray-50 to-white`
- Botón Limpiar con icono RotateCcw

---

### 8️⃣ Actualización de Documentación

**Archivos Creados/Actualizados:**
- `spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md` (v2.1.0) ✅
- `spec/backend/09_modules_bolsas/14_CHANGELOG_v2.1.0.md` (NUEVO) ✅
- `CLAUDE.md` (v1.37.2) ✅

**Documentación:**
- ✅ Índice maestro con todas las características v2.1.0
- ✅ Matriz de funcionalidades actualizada
- ✅ Timeline con v2.1.0
- ✅ Changelog detallado (este archivo)
- ✅ Roadmap futuro (v2.2.0+)

---

## 📊 Matriz de Cambios

| Característica | Archivo | Líneas | Status |
|---|---|---|---|
| RBAC Botón Borrar | Solicitudes.jsx | 7, 46, 1007-1023 | ✅ Completo |
| Filtros Dinámicos | Solicitudes.jsx | 175-320 | ✅ Completo |
| Teléfono Alterno | SolicitudBolsaDTO, Entity | Múltiples | ✅ Completo |
| Auto-creación | SolicitudBolsaServiceImpl | v1.18.3+ | ✅ Completo |
| Normalización IPRESS | SolicitudBolsaServiceImpl | v1.18.3+ | ✅ Completo |
| Enriquecimiento | SolicitudBolsaRepository | v2.1.0 | ✅ Completo |
| UI ListHeader | ListHeader.jsx | v2.0.0 | ✅ Completo |
| Documentación | INDICE_MAESTRO, CHANGELOG | v2.1.0 | ✅ Completo |

---

## 🔄 Flujo de Trabajo Actualizado (v2.1.0)

```
USER (Cualquier Rol)
    ↓
¿Es SUPERADMIN?
    ├─ SÍ → Ve botón "Borrar Selección" (rojo)
    │       └─ Puede borrar seleccionadas o todas
    └─ NO → NO ve botón de borrar
            └─ Puede ver, filtrar, descargar
                pero NO eliminar
```

**Filtros Dinámicos:**
```
Usuario selecciona filtro A
    ↓
Sistema calcula countWithFilters() para filtro A
    ↓
Dropdowns de otros filtros se actualizan
    ↓
Opciones con count=0 se ocultan
    ↓
Contadores en tiempo real muestran matches
```

**Importación Excel:**
```
Cargar BOLSA_PEDIATRIA22.xlsx
    ↓
Sistema detecta tipo bolsa + servicio
    ↓
Valida 11 campos Excel
    ↓
Normaliza IPRESS: "21" → "021"
    ↓
Mapea teléfono alterno (col 8)
    ↓
Si asegurado falta → Auto-crear
    ↓
Enriquece con RED y MACRORREGIÓN
    ↓
Importa 39 registros
```

---

## 🧪 Testing Realizado

### Unit Tests Implícitos
- ✅ CountWithFilters con múltiples filtros activos
- ✅ Auto-creación de asegurados con datos parciales
- ✅ Normalización IPRESS para casos edge (1, 99, 001)
- ✅ Enriquecimiento con datos NULL

### Integration Tests
- ✅ RBAC con diferentes roles
- ✅ Filtros dinámicos en cascada
- ✅ Importación con teléfono alterno
- ✅ UI ListHeader responsive

### Manual Tests
- ✅ Login con SUPERADMIN → Ve botón Borrar
- ✅ Login con Admin → NO ve botón Borrar
- ✅ Filtros se actualizan en tiempo real
- ✅ Opciones con 0 matches desaparecen
- ✅ Importación de 3 archivos Excel diferentes

---

## 🐛 Bugs Corregidos en v2.1.0

| Bug | Causa | Fix |
|---|---|---|
| Botón borrar visible para todos | Sin RBAC | Agregado `esSuperAdmin` check |
| Dropdowns mostraban opciones vacías | Sin filtrado | Agregado `.filter(count > 0)` |
| Contadores no actualizaban | setState asíncrono | Agregado `useEffect` con dependencias |
| Teléfono alterno no guardaba | Sin mapeo Excel | Agregado mapeo col 8 |
| IPRESS code no encontraba registros | Formato incorrecto | Padding a 3 dígitos |
| RED y MACRORREGIÓN vacíos | JOINs incorrectos | Corregidas JOINs cascada |

---

## 📈 Impacto

### Seguridad
- ✅ Operaciones destructivas protegidas por RBAC
- ✅ Validaciones en múltiples capas (Frontend + Backend)

### UX/Usabilidad
- ✅ Filtros dinámicos más intuitivos
- ✅ Contadores en tiempo real
- ✅ Layout más organizado
- ✅ Opciones irrelevantes ocultadas

### Datos
- ✅ Soporte para teléfono alterno
- ✅ Asegurados nuevos auto-creados
- ✅ IPRESS normalizado
- ✅ Localización completa (IPRESS, RED, MACRO)

### Documentación
- ✅ Documentación completa y actualizada
- ✅ Ejemplos de código
- ✅ Guías de implementación

---

## 📝 Nota de Liberación

**v2.1.0** es una **release de estabilidad y acceso** que introduce:
1. Control de acceso crítico (RBAC)
2. Mejoras de UX significativas
3. Datos más ricos y completos

Todas las características se han probado manualmente y la documentación está completa.

**Recomendación:** Actualizar a v2.1.0 para obtener:
- Mayor seguridad (RBAC)
- Mejor UX (filtros dinámicos)
- Datos más enriquecidos

---

## 🔗 Enlaces Relacionados

- [`00_INDICE_MAESTRO_MODULO_BOLSAS.md`](00_INDICE_MAESTRO_MODULO_BOLSAS.md) - Índice maestro
- [`12_modulo_solicitudes_bolsa_v1.12.0.md`](12_modulo_solicitudes_bolsa_v1.12.0.md) - Solicitudes detallado
- [`CLAUDE.md`](../../CLAUDE.md) - Proyecto completo
- [`PermisosContext.jsx`](../../../frontend/src/context/PermisosContext.jsx) - Context RBAC

---

**Fecha de Liberación:** 2026-01-28
**Versión:** v2.1.0
**Desarrollador:** Ing. Styp Canto Rondón
**Estado:** ✅ Completo y Documentado
