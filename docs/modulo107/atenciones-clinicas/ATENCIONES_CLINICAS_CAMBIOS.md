# 📋 Módulo 107 - Atenciones Clínicas - Documentación de Cambios

## 🎯 Fecha de Última Actualización
**02 de Febrero de 2026**

## 📝 Resumen Ejecutivo

Este documento detalla todos los cambios realizados en el módulo 107 (Atenciones Clínicas) para mejorar la visualización de datos relacionados y la funcionalidad de filtros.

---

## ✨ Características Implementadas

### 1. Mapeo de Descripción de Estados
**Objetivo:** Mostrar la descripción completa del estado en lugar del código

**Cambios Backend:**
- **Entidad:** `AtencionClinica107.java`
  - Agregada relación `@ManyToOne` con `EstadoGestionCita`
  - Permite acceso automático a `descEstadoCita`

- **DTO:** `AtencionClinica107DTO.java`
  - Agregado campo: `String estadoDescripcion`
  - Se envía al frontend la descripción completa del estado

- **Servicio:** `AtencionClinica107ServiceImpl.java`
  - Actualizado método `toDTO()`
  - Extrae descripción desde relación o consulta repositorio como fallback
  - Inyectado `EstadoGestionCitaRepository`

**Cambios Frontend:**
- **Componente:** `Modulo107AtencionesClinics.jsx`
  - Usa `atencion.estadoDescripcion` para mostrar descripción
  - Muestra "Sin estado" si no hay descripción disponible
  - Colores dinámicos según contenido del estado

**Resultado:**
```
❌ Antes:  PENDIENTE
✅ Después: Paciente nuevo que ingresó a la bolsa
           CITADO
           NO_CONTESTA
```

---

### 2. Visualización del Nombre de IPRESS
**Objetivo:** Mostrar el nombre/descripción de la IPRESS en lugar del ID

**Cambios Backend:**
- **Entidad:** `AtencionClinica107.java`
  - Agregada relación `@ManyToOne` con `Ipress`
  - `@JoinColumn(name = "id_ipress", insertable = false, updatable = false)`

- **DTO:** `AtencionClinica107DTO.java`
  - Agregado campo: `String ipressNombre`

- **Servicio:** `AtencionClinica107ServiceImpl.java`
  - Método `toDTO()` extrae `ipressNombre` desde relación `ipress.getDescIpress()`

**Cambios Frontend:**
- **Componente:** `Modulo107AtencionesClinics.jsx`
  - Muestra `atencion.ipressNombre` en la columna IPRESS

**Resultado:**
```
❌ Antes:  342
✅ Después: POL. CHINCHA (o el nombre correspondiente de IPRESS)
```

---

### 3. Colores Diferenciados para Derivaciones
**Objetivo:** Diferenciar visualmente las 3 derivaciones internas disponibles

**Cambios Frontend:**
- **Componente:** `Modulo107AtencionesClinics.jsx`
  - Lógica de colores en renderizado de derivación:

| Derivación | Color |
|-----------|-------|
| PSICOLOGIA CENATE | 🔴 Rosa/Pink (`bg-pink-100 text-pink-700`) |
| NUTRICION CENATE | 🟢 Verde/Green (`bg-green-100 text-green-700`) |
| MEDICINA CENATE | 🔵 Azul/Blue (`bg-blue-100 text-blue-700`) |
| Otros | ⚫ Gris/Gray (`bg-gray-100 text-gray-700`) |

**Código:**
```jsx
const derivacion = atencion.derivacionInterna;
let bgColor = "bg-gray-100";
let textColor = "text-gray-700";

if (derivacion === "PSICOLOGIA CENATE") {
  bgColor = "bg-pink-100";
  textColor = "text-pink-700";
} else if (derivacion === "NUTRICION CENATE") {
  bgColor = "bg-green-100";
  textColor = "text-green-700";
} else if (derivacion === "MEDICINA CENATE") {
  bgColor = "bg-blue-100";
  textColor = "text-blue-700";
}
```

---

### 4. Filtro por Derivación Interna (Corrección)
**Objetivo:** Permitir filtrar las atenciones por derivación interna

**Problema Identificado:**
- El servicio frontend estaba buscando `filtros.derivacion`
- El componente enviaba `filtros.derivacionInterna`
- Desajuste de nombres de propiedades

**Solución:**
- **Archivo:** `atencionesClinicasService.js`
  - Corregido: Busca `filtros.derivacionInterna`
  - Envía al backend como parámetro: `derivacion`

**Backend - Especificación:**
- **Archivo:** `AtencionClinica107Specification.java`
  - Método `conDerivacionInterna()` con comparación **case-insensitive**
  - Usa `cb.equal(cb.upper(root.get("derivacionInterna")), derivacion.toUpperCase())`
  - También actualizado método `conEspecialidad()` con igual lógica

**Resultado:**
```
✅ Ahora filtra correctamente por:
   - PSICOLOGIA CENATE
   - NUTRICION CENATE
   - MEDICINA CENATE
```

---

## 🗂️ Archivos Modificados

### Backend

1. **Entidades:**
   - `src/main/java/com/styp/cenate/model/AtencionClinica107.java`
     - Agregada relación con `EstadoGestionCita`
     - Agregada relación con `Ipress`

2. **DTOs:**
   - `src/main/java/com/styp/cenate/dto/AtencionClinica107DTO.java`
     - Agregado: `estadoDescripcion`
     - Agregado: `ipressNombre`

3. **Servicios:**
   - `src/main/java/com/styp/cenate/service/atenciones_clinicas/AtencionClinica107ServiceImpl.java`
     - Inyectado `EstadoGestionCitaRepository`
     - Actualizado método `toDTO()` con mapeo de descripción e IPRESS

4. **Specifications:**
   - `src/main/java/com/styp/cenate/service/specification/AtencionClinica107Specification.java`
     - Actualizado `conDerivacionInterna()` - case-insensitive
     - Actualizado `conEspecialidad()` - case-insensitive

5. **Controladores:**
   - `src/main/java/com/styp/cenate/api/atenciones_clinicas/AtencionClinica107PublicController.java`
     - Agregados logs de debug para filtros

### Frontend

1. **Componentes:**
   - `src/pages/roles/coordcitas/Modulo107AtencionesClinics.jsx`
     - Actualizado renderizado de Estado (usa `estadoDescripcion`)
     - Actualizado renderizado de IPRESS (muestra nombre)
     - Agregada lógica de colores para derivaciones
     - Agregados logs de debug

2. **Servicios:**
   - `src/services/atencionesClinicasService.js`
     - Corregido parámetro `derivacionInterna` → `derivacion`

---

## 🔍 Detalles Técnicos

### Relaciones JPA Implementadas

#### 1. AtencionClinica107 → EstadoGestionCita
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "estado_gestion_citas_id", insertable = false, updatable = false)
private EstadoGestionCita estadoGestionCita;
```

**Beneficios:**
- Acceso automático a `descEstadoCita`
- Lazy loading para optimizar queries
- No permite inserción/actualización a través de esta relación (solo lectura)

#### 2. AtencionClinica107 → Ipress
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "id_ipress", insertable = false, updatable = false)
private Ipress ipress;
```

**Beneficios:**
- Acceso automático a `descIpress` (nombre de la IPRESS)
- Permite enriquecer datos sin queries adicionales

### Especificaciones Case-Insensitive
```java
// Antes (sensible a mayúsculas/minúsculas):
cb.equal(root.get("derivacionInterna"), derivacion)

// Después (case-insensitive):
cb.equal(cb.upper(root.get("derivacionInterna")), derivacion.toUpperCase())
```

**Ventaja:**
- Funciona independientemente de cómo estén almacenados los datos en BD
- Frontend puede enviar cualquier combinación de mayúsculas/minúsculas

---

## 📊 Flujo de Datos - Antes y Después

### Estado
```
Frontend selecciona: "Todos los estados"
                     ↓
Backend devuelve en DTO: 
{
  estado: "PENDIENTE",
  estadoDescripcion: null  ❌ ANTES
  estadoDescripcion: "Paciente nuevo que ingresó a la bolsa" ✅ DESPUÉS
}
                     ↓
Frontend muestra: "Sin estado" ❌ ANTES
                  "Paciente nuevo que ingresó a la bolsa" ✅ DESPUÉS
```

### IPRESS
```
Frontend muestra:
  id_ipress: 342 ❌ ANTES
  ipressNombre: "POL. CHINCHA" ✅ DESPUÉS
```

### Filtro Derivación
```
Frontend envía: ?derivacion=PSICOLOGIA CENATE
Backend recibe en DTO: derivacionInterna = "PSICOLOGIA CENATE"
Specification aplica: upper('PSICOLOGIA CENATE') = upper('PSICOLOGIA CENATE') ✅
Resultado: Solo registros con esa derivación
```

---

## 🧪 Pruebas Realizadas

### ✅ Prueba 1: Visualización de Estado
- Abrió lista de atenciones
- Verificó que muestra descripción completa del estado
- Estado correcto: "Paciente nuevo que ingresó a la bolsa"

### ✅ Prueba 2: Visualización de IPRESS
- Verificó que muestra nombre de IPRESS en lugar de ID
- Ejemplo: "POL. CHINCHA"

### ✅ Prueba 3: Colores de Derivación
- PSICOLOGIA CENATE → Rosa/Pink ✓
- NUTRICION CENATE → Verde/Green ✓
- MEDICINA CENATE → Azul/Blue ✓

### ✅ Prueba 4: Filtro por Derivación
- Selecciona "PSICOLOGIA CENATE"
- Muestra solo registros con esa derivación
- Cuenta de registros correcta

---

## 📌 Notas Importantes

### Performance
- Se usa **FetchType.LAZY** para las relaciones
- Las descripciones se cargan bajo demanda
- Fallback al repositorio si la relación no está cargada

### Case-Insensitivity
- Los filtros ahora funcionan independientemente de mayúsculas/minúsculas
- Recomendación: Mantener datos en base de datos en MAYÚSCULAS para consistencia

### Datos Derivados
- `estadoDescripcion` se calcula en el servidor (DTO)
- `ipressNombre` se calcula en el servidor (DTO)
- El frontend solo consume, no calcula

---

## 🔧 Mantenimiento Futuro

### Si se agregan nuevas derivaciones:
1. Actualizar base de datos
2. Actualizar colores en `Modulo107AtencionesClinics.jsx` (si se necesitan colores específicos)
3. El filtro funcionará automáticamente (case-insensitive)

### Si se cambian nombres de campos:
- Asegurarse de actualizar:
  - Relaciones `@JoinColumn`
  - Métodos getter en entidades
  - Mapeos en `toDTO()`

---

## 📞 Contacto de Soporte

Para dudas o cambios futuros en este módulo, referirse a:
- Backend: Equipo de APIs - Módulo 107
- Frontend: Equipo de UI - Módulo 107

---

**Documento generado:** 02 de Febrero de 2026  
**Versión:** 1.0  
**Estado:** Completado ✅
