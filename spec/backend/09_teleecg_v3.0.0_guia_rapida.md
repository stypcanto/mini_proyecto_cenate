# 🫀 TeleECG v3.0.0 - Guía Rápida

> **Guía rápida para desarrolladores**
> **Versión**: 3.0.0 (2026-01-20)

---

## 🚀 Resumen Ejecutivo

TeleECG v3.0.0 introduce un **sistema de transformación de estados según rol del usuario**. La misma imagen puede tener diferentes estados según quién la mire:

- **Usuario EXTERNO (IPRESS)** ve: `ENVIADA ✈️`, `RECHAZADA ❌`, `ATENDIDA ✅`
- **Personal CENATE** ve: `PENDIENTE ⏳`, `OBSERVADA 👁️`, `ATENDIDA ✅`

**Internamente en BD**: Siempre es uno de `ENVIADA`, `OBSERVADA`, `ATENDIDA`

---

## 🎨 Estados en 30 segundos

| Estado BD | Externo | CENATE | Acción |
|-----------|---------|--------|--------|
| ENVIADA | ENVIADA ✈️ | PENDIENTE ⏳ | Espera revisión |
| OBSERVADA | RECHAZADA ❌ | OBSERVADA 👁️ | Con observaciones |
| ATENDIDA | ATENDIDA ✅ | ATENDIDA ✅ | Completo |

---

## 🔧 Para Backend Developers

### Archivo Clave: TeleECGEstadoTransformer.java

```java
// Inyectar en tu servicio/controller
@Autowired
private TeleECGEstadoTransformer estadoTransformer;

// Usar así:
String estadoTransformado = estadoTransformer.transformarEstado(
  imagen,
  usuarioActual  // null = asumir externo
);

// O directo con rol:
String estado = estadoTransformer.transformarEstado(
  "ENVIADA",     // estado BD
  true           // true = usuario externo, false = CENATE
);
// Retorna: "ENVIADA" (externo) o "PENDIENTE" (CENATE)
```

### Acciones en API (PUT /procesar)

```java
switch (accion) {
  case "ATENDER":
    imagen.setEstado("ATENDIDA");
    imagen.setFechaRecepcion(LocalDateTime.now());
    break;

  case "OBSERVAR":
    imagen.setEstado("OBSERVADA");
    imagen.setObservaciones(observaciones);  // NUEVO
    break;

  case "REENVIADO":
    imagenAnterior.setFueSubsanado(true);    // NUEVO
    break;
}
```

### DTO Importante: TeleECGImagenDTO

```java
// Nuevos campos en v3.0.0:
private String estadoTransformado;    // El estado que ve el usuario
private Long idImagenAnterior;        // FK a imagen rechazada anterior
private Boolean fueSubsanado;         // ¿Fue rechazada y reenvió nueva?
private String observaciones;         // Razón de rechazo/notas
```

---

## 🎬 Para Frontend Developers

### Cambios Clave

**Antes**:
```jsx
<span>{ecg.estado}</span>  // Muestra: PENDIENTE, PROCESADA, etc.
```

**Ahora**:
```jsx
// ✅ CORRECTO - Usa estado transformado
<span>{ecg.estadoTransformado || ecg.estado}</span>

// Con colores
const colorMap = {
  "ENVIADA": "bg-yellow-100",
  "PENDIENTE": "bg-yellow-100",
  "OBSERVADA": "bg-purple-100",
  "RECHAZADA": "bg-red-100",
  "ATENDIDA": "bg-green-100"
};

<span className={colorMap[ecg.estadoTransformado || ecg.estado]}>
  {ecg.estadoTransformado || ecg.estado}
</span>
```

### Mostrar Observaciones

```jsx
{ecg.observaciones && (
  <div className="text-xs text-gray-600 p-1 bg-gray-50 rounded">
    <p className="font-medium">💬 {ecg.observaciones}</p>
  </div>
)}
```

### Mostrar Subsanado

```jsx
{ecg.fueSubsanado && (
  <div className="text-xs text-green-600 p-1 bg-green-50 rounded">
    ✅ Subsanada (hay una versión mejorada)
  </div>
)}
```

### Botones de Acción

```jsx
// Mostrar Procesar/Rechazar SOLO si está pendiente
{(ecg.estadoTransformado === "PENDIENTE" ||
  ecg.estado === "PENDIENTE" ||
  ecg.estado === "ENVIADA") && (
  <>
    <button onClick={() => procesarImagen(ecg.idImagen)}>
      ✅ Procesar
    </button>
    <button onClick={() => rechazarImagen(ecg.idImagen)}>
      ❌ Rechazar
    </button>
  </>
)}
```

### Servicio (teleecgService.js)

```javascript
// ✅ Actualizado en v3.0.0
procesarImagen: async (idImagen, observaciones = "") => {
  return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
    accion: "ATENDER",          // Antes: PROCESAR
    observaciones
  }, true);
}

rechazarImagen: async (idImagen, motivo = "") => {
  return apiClient.put(`/teleekgs/${idImagen}/procesar`, {
    accion: "OBSERVAR",         // Antes: RECHAZAR
    observaciones: motivo       // Antes: motivo
  }, true);
}

// ✅ NUEVO v3.0.0: Cargar múltiples imágenes (PADOMI requirement)
subirMultiplesImagenes: async (formData) => {
  return fetch(`${API_BASE_URL}/teleekgs/upload-multiple`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
    credentials: "include"
  });
}
```

---

## 📸 PADOMI - Carga Múltiple de Imágenes

### Requisito
- **Mínimo**: 4 imágenes por envío
- **Máximo**: 10 imágenes por envío
- **Asociación**: Todas las imágenes se asocian al mismo paciente

### Componentes Nuevos
1. **UploadImagenECG.jsx** - Permite seleccionar 4-10 imágenes
2. **CarrouselECGModal.jsx** - Visualización en carrusel con navegación
3. **POST /api/teleekgs/upload-multiple** - Backend endpoint

### Frontend: Enviar Múltiples Imágenes

```javascript
// FormData con múltiples archivos
const formData = new FormData();
formData.append("numDocPaciente", "12345678");
formData.append("nombresPaciente", "Juan");
formData.append("apellidosPaciente", "Pérez");

// Agregar múltiples archivos con el mismo nombre de campo
archivos.forEach(archivo => {
  formData.append("archivos", archivo);
});

// Enviar
const response = await fetch(
  `/api/teleekgs/upload-multiple`,
  { method: "POST", body: formData }
);

// Respuesta incluye:
// - total: número de imágenes cargadas
// - idImagenes: array de IDs
// - imagenes: array de DTOs
```

### Visualización en Carrusel

```jsx
import CarrouselECGModal from "./CarrouselECGModal";

<CarrouselECGModal
  imagenes={todasLasImagenesDelPaciente}
  paciente={{ numDoc: "12345678", nombres: "Juan", apellidos: "Pérez" }}
  onClose={() => setAbierto(false)}
  onDescargar={(imagen) => descargar(imagen)}
/>
```

**Características del carrusel**:
- Navegación anterior/siguiente
- Thumbnails en panel lateral
- Zoom/rotación para cada imagen
- Detalles de la imagen actual
- Descargar individual

---

## 📊 Cómics de Flujo

### Flujo: Usuario EXTERNO Sube + CENATE Rechaza

```
[IPRESS sube imagen]
    ↓
Imagen: estado=ENVIADA (BD)
    ↓
[IPRESS lo ve como]
    "✈️ ENVIADA - En espera"
    ↓
[CENATE lo ve como]
    "⏳ PENDIENTE - En bandeja"
    ↓
[CENATE rechaza con observaciones]
    "Imagen borrosa, reenvía más clara"
    ↓
Imagen: estado=OBSERVADA (BD), observaciones="Imagen borrosa..."
    ↓
[IPRESS lo ve como]
    "❌ RECHAZADA - Con razón"
    💬 "Imagen borrosa, reenvía más clara"
    ↓
[IPRESS reenvía nueva imagen]
    ↓
Nueva imagen: estado=ENVIADA, fue_subsanado=false
Vieja imagen: fue_subsanado=true, id_imagen_anterior=null
    ↓
[CENATE ve ambas]
    Vieja: "👁️ OBSERVADA ✅ Subsanada"
    Nueva: "⏳ PENDIENTE - esperando revisión"
```

---

## 🚨 Common Mistakes

### ❌ Mistake #1: Usar estado directo

```javascript
// MALO
if (ecg.estado === "PENDIENTE") { ... }  // No funciona para EXTERNO

// BUENO
if ((ecg.estadoTransformado || ecg.estado) === "PENDIENTE") { ... }
```

### ❌ Mistake #2: No mostrar observaciones

```javascript
// MALO - Usuario no ve por qué fue rechazado
<span>{ecg.estado}</span>

// BUENO
<div>
  <span>{ecg.estadoTransformado || ecg.estado}</span>
  {ecg.observaciones && <p>Razón: {ecg.observaciones}</p>}
</div>
```

### ❌ Mistake #3: Permitir acciones en estado incorrecto

```javascript
// MALO - Permite procesar ATENDIDA
{ecg.estado === "ENVIADA" && <button>Procesar</button>}

// BUENO - Verifica PENDIENTE (CENATE) o ENVIADA (puede ser antiguo)
{(ecg.estadoTransformado === "PENDIENTE" ||
  ecg.estado === "PENDIENTE" ||
  ecg.estado === "ENVIADA") && <button>Procesar</button>}
```

---

## 📝 SQL Migración

```sql
-- Ejecutar UNA SOLA VEZ
psql -U postgres -d maestro_cenate -f spec/04_BaseDatos/06_scripts/037_refactor_teleecg_estados_v3_fixed.sql

-- Verificar (debería mostrar solo ENVIADA, OBSERVADA, ATENDIDA)
SELECT DISTINCT estado FROM tele_ecg_imagenes;
```

---

## 🧪 Testing Checklist

### Backend

- [ ] Upload: crea imagen con `estado=ENVIADA`
- [ ] Listar: retorna `estadoTransformado` según usuario
- [ ] Procesar: ATENDER → `estado=ATENDIDA`
- [ ] Rechazar: OBSERVAR → `estado=OBSERVADA` + `observaciones`
- [ ] Reenvío: nueva imagen + vieja marca `fue_subsanado=true`
- [ ] Cascading delete: elimina imagen + auditorías
- [ ] Permisos MBAC: EXTERNO no puede procesar

### Frontend (EXTERNO)

- [ ] Upload: ve "✈️ ENVIADA" en amarillo
- [ ] Listar: ve solo sus imágenes
- [ ] Rechazada: ve "❌ RECHAZADA" + observaciones
- [ ] Reenvío: ve "✅ Subsanada" en vieja imagen
- [ ] NO puede: procesar ni rechazar
- [ ] Botones: Ver, Descargar, Eliminar

### Frontend (CENATE)

- [ ] Listar: ve todas las imágenes
- [ ] Pendiente: ve "⏳ PENDIENTE" en amarillo
- [ ] Procesar: ATENDER → "✅ ATENDIDA"
- [ ] Rechazar: abre modal pidiendo observaciones
- [ ] Observaciones: aparecen en tabla
- [ ] Subsanado: ve badge "✅ Subsanada"

---

## 📚 Referencias

- **Documentación completa**: `plan/02_Modulos_Medicos/09_estado_final_teleecg_v3.0.0.md`
- **Changelog**: `checklist/01_Historial/01_changelog.md` (buscar v1.22.0)
- **Script SQL**: `spec/04_BaseDatos/06_scripts/037_refactor_teleecg_estados_v3_fixed.sql`
- **Servicio Backend**: `backend/src/main/java/com/styp/cenate/service/teleekgs/TeleECGEstadoTransformer.java`

---

## ❓ FAQ

**P: ¿Qué pasa con las imágenes antiguas (v2.0.0)?**
R: Script SQL las migra automáticamente:
- PENDIENTE → ENVIADA
- PROCESADA → ATENDIDA
- RECHAZADA → OBSERVADA
- VINCULADA → ATENDIDA

**P: ¿Puedo mezclar v2.0.0 y v3.0.0?**
R: No. Debes migrar completamente. El script es irreversible.

**P: ¿Qué cambió en el API?**
R: Las acciones en PUT /procesar:
- PROCESAR → ATENDER
- RECHAZAR → OBSERVAR
- Nuevo: REENVIADO

**P: ¿El usuario EXTERNO puede ver observaciones?**
R: Sí. Cuando ve "❌ RECHAZADA", puede expandir para ver observaciones.

**P: ¿Cómo sé qué rol tiene el usuario?**
R: TeleECGEstadoTransformer.esExterno(usuario) verifica rol.

---

**Versión**: 3.0.0 | **Fecha**: 2026-01-20
