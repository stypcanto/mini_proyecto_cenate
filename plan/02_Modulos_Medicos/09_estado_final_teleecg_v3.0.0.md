# 🫀 Estado Final del Módulo TeleECG v3.0.0

> **Módulo de Envío y Gestión de Electrocardiogramas (ECG)**
> **Estado**: ✅ COMPLETADO (v3.0.0 | 2026-01-20)
> **Versión**: 3.0.0 - Refactoring Estados + Transformación por Rol + PADOMI (Carga Múltiple + Carrusel) + **🤖 ML Dataset Supervisado**
> **Última actualización**: 2026-01-20
> **🎯 Destacado**:
> - 📸 PADOMI - Carga Múltiple de Imágenes + Carrusel interactivo
> - 🤖 ML Dataset - Evaluación Supervisada (NORMAL/ANORMAL) para entrenar modelos

---

## 📋 Tabla de Contenidos

1. [Overview del Módulo](#overview-del-módulo)
2. [¿Qué Cambió en v3.0.0?](#qué-cambió-en-v300)
3. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
4. [Sistema de Transformación de Estados](#sistema-de-transformación-de-estados)
5. [Flujo de Negocio Completo](#flujo-de-negocio-completo)
6. [📸 PADOMI - Carga Múltiple + Carrusel](#-padomi---carga-múltiple-de-imágenes--carrusel) ⭐ **NUEVO**
7. [🤖 ML Dataset Supervisado - Evaluación Médica](#-ml-dataset-supervisado---evaluación-médica-v300) ⭐ **NUEVO v3.0.0**
8. [Acceso por Rol](#acceso-por-rol)
9. [API REST Endpoints](#api-rest-endpoints)
10. [Frontend Components](#frontend-components)
11. [Sistema de Permisos MBAC](#sistema-de-permisos-mbac)
12. [Validaciones y Restricciones](#validaciones-y-restricciones)
13. [Configuración del Sistema](#configuración-del-sistema)
14. [Troubleshooting](#troubleshooting)

---

## Overview del Módulo

### ¿Qué es TeleECG?

**TeleECG** es el módulo de CENATE que permite a **IPRESS externas** (Instituciones Prestadoras de Servicios de Salud):

✅ **Enviar** imágenes de electrocardiogramas (ECG/EKG) a CENATE (individual o batch)
✅ **Carga múltiple** (PADOMI): 4-10 imágenes en un solo envío
✅ **Gestionar** sus propios envíos (eliminar, ver, descargar)
✅ **Seguimiento** de estado con transformación según rol del usuario
✅ **Observaciones** para detallar rechazos y observaciones
✅ **Subsanamiento** automático de imágenes rechazadas
✅ **Carrusel interactivo** para visualizar y comparar múltiples imágenes
✅ **Auditoría** completa de todas las acciones
✅ **Almacenamiento** seguro en filesystem con verificación SHA256

### Características Principales

| Característica | Descripción | Estado |
|---|---|---|
| **Subida individual** | Carga única de ECG en JPEG/PNG (máx 5MB) | ✅ Activo |
| **Subida batch (PADOMI)** | Carga múltiple 4-10 imágenes en un envío | ✅ NUEVO en v3.0.0 |
| **Validación de archivos** | MIME type, tamaño (máx 5MB), magic bytes | ✅ Activo |
| **Almacenamiento** | Filesystem local `/opt/cenate/teleekgs/` | ✅ Activo |
| **Integridad** | SHA256 + verificación post-escritura | ✅ Activo |
| **Detección de duplicados** | Evita cargar la misma imagen 2 veces | ✅ Activo |
| **Estados de ECG (v3.0.0)** | ENVIADA, OBSERVADA, ATENDIDA (transformados por rol) | ✅ Activo |
| **Observaciones** | Campo de texto para detallar rechazos | ✅ NUEVO en v3.0.0 |
| **Subsanamiento** | Rastreo automático de imágenes reenviadas | ✅ NUEVO en v3.0.0 |
| **Visualización Carrusel** | Navegación fluida entre múltiples imágenes del paciente | ✅ NUEVO en v3.0.0 |
| **Zoom y rotación** | Herramientas para inspeccionar detalles de ECG | ✅ NUEVO en v3.0.0 |
| **Expiración automática** | 30 días desde envío + limpieza 2am | ✅ Activo |
| **Auditoría** | Registro de TODAS las acciones (usuario, IP, timestamp) | ✅ Activo |
| **Transformación por Rol** | Estados diferentes según rol del usuario | ✅ NUEVO en v3.0.0 |
| **Permisos MBAC** | Control granular por rol (ver, crear, editar, eliminar) | ✅ Activo |
| **Cascading Delete** | Eliminación de imagen + auditoría relacionada | ✅ Activo |

---

## ¿Qué Cambió en v3.0.0?

### Cambio de Estados (Breaking Change)

#### Antes (v2.0.0)
```
PENDIENTE ──→ PROCESADA ──→ (fin)
        ├──→ RECHAZADA ──→ (fin)
        └──→ VINCULADA ──→ (fin)
```

#### Ahora (v3.0.0)
```
BD Interno:
ENVIADA ──→ ATENDIDA ──→ (fin)
    ├──→ OBSERVADA ──→ (fin, con observaciones)
    └──→ [espera reenvío] ──→ nueva imagen

UI - Usuario EXTERNO (IPRESS/PADOMI):
ENVIADA ✈️ ──→ ATENDIDA ✅
    ├──→ RECHAZADA ❌ (= OBSERVADA en BD)

UI - Personal CENATE:
PENDIENTE ⏳ (= ENVIADA en BD) ──→ ATENDIDA ✅
    ├──→ OBSERVADA 👁️ (= OBSERVADA en BD)
```

### Nuevos Campos en Base de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_imagen_anterior` | FK (auto-ref) | Referencia a imagen anterior rechazada |
| `fue_subsanado` | BOOLEAN | ¿Fue rechazada y se reenvió una nueva? |
| `observaciones` | TEXT | Notas sobre el estado (rechazos, problemas) |

### Nueva Capa: Transformación de Estados

```java
TeleECGEstadoTransformer.java
├─ transformarEstado(imagen, usuario)
├─ esExterno(usuario)
├─ obtenerSimboloEstado(estado)
├─ obtenerColorEstado(estado)
└─ obtenerDescripcionEstado(estado)
```

**Lógica de Transformación**:
- Si usuario es EXTERNO (rol INSTITUCION_EX, EXTERNO): Mostrar estados externos
- Si usuario es CENATE: Mostrar estados internos
- El estado en BD siempre es uno de: ENVIADA, OBSERVADA, ATENDIDA

### Nuevas Acciones en API

| Acción | Antes | Ahora (v3.0.0) | Descripción |
|--------|-------|----------------|-------------|
| **Aceptar** | PROCESAR | ATENDER | Marca como ATENDIDA |
| **Rechazar** | RECHAZAR | OBSERVAR | Marca como OBSERVADA + guarda observaciones |
| **Reenvío** | - | REENVIADO | Marca imagen anterior como fue_subsanado=true |

---

## Arquitectura de Base de Datos

### 📊 Diagrama de Relaciones (v3.0.0)

```
┌─────────────────────────────────────────────────────────────┐
│                 Tablas Principales TeleECG v3.0.0           │
└─────────────────────────────────────────────────────────────┘

dim_usuarios ◄─────┐
    (id_user)      │
                   ├──► tele_ecg_imagenes ◄──── dim_ipress
                   │         (id_imagen)
                   │         NEW: id_imagen_anterior (FK auto-ref)
                   │         NEW: fue_subsanado (BOOLEAN)
                   │         NEW: observaciones (TEXT)
                   └──┐
                      │
┌─────────────────────┘
│
├─► tele_ecg_auditoria
│        (id_auditoria)
│        FK: id_imagen → tele_ecg_imagenes (ON DELETE CASCADE)
│        FK: id_usuario → dim_usuarios
│
├─► tele_ecg_estadisticas
│        (id_estadistica)
│        Desnormalizado para performance
│
└─► dim_paginas_modulo / segu_permisos_rol_pagina
         Para control de acceso MBAC
```

### 🗄️ Tabla: `tele_ecg_imagenes` (v3.0.0)

**Campos actualizados**:

```sql
CREATE TABLE tele_ecg_imagenes (
  -- 🆔 Identificadores
  id_imagen SERIAL PRIMARY KEY,

  -- 👤 Paciente
  num_doc_paciente VARCHAR(20) NOT NULL,
  nombres_paciente VARCHAR(100),
  apellidos_paciente VARCHAR(100),

  -- 🏥 IPRESS
  codigo_ipress VARCHAR(50) NOT NULL,
  nombre_ipress VARCHAR(200),

  -- 📁 Archivo
  nombre_archivo VARCHAR(255) NOT NULL,
  extension VARCHAR(10) CHECK (extension IN ('jpg', 'png')),
  mime_type VARCHAR(50),
  size_bytes BIGINT,
  sha256 VARCHAR(64) UNIQUE,

  -- ⏱️ Estados (v3.0.0)
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA')),
  -- DEFAULT: 'ENVIADA' cuando se sube

  -- NEW in v3.0.0: Subsanamiento
  id_imagen_anterior BIGINT,
  FOREIGN KEY (id_imagen_anterior) REFERENCES tele_ecg_imagenes(id_imagen) ON DELETE SET NULL,
  fue_subsanado BOOLEAN NOT NULL DEFAULT false,

  -- NEW in v3.0.0: Observaciones
  observaciones TEXT,  -- Razón de rechazo o notas

  -- 📅 Fechas
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_recepcion TIMESTAMP,
  fecha_expiracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',

  -- 🔒 Almacenamiento
  storage_tipo VARCHAR(20) DEFAULT 'FILESYSTEM',
  storage_ruta TEXT,

  -- 👤 Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teleecg_estado ON tele_ecg_imagenes(estado);
CREATE INDEX idx_teleecg_imagen_anterior ON tele_ecg_imagenes(id_imagen_anterior);
```

---

## Sistema de Transformación de Estados

### 🔄 Flujo de Transformación

```javascript
API Backend
   ↓
[obtener imagen con estado BD: ENVIADA/OBSERVADA/ATENDIDA]
   ↓
[TeleECGEstadoTransformer.transformarEstado(imagen, usuario)]
   ├─ ¿Usuario es EXTERNO?
   │  ├─ SI:  ENVIADA → ENVIADA, OBSERVADA → RECHAZADA, ATENDIDA → ATENDIDA
   │  └─ NO:  ENVIADA → PENDIENTE, OBSERVADA → OBSERVADA, ATENDIDA → ATENDIDA
   ↓
[DTO con: estado (BD), estadoTransformado (UI), observaciones, fue_subsanado]
   ↓
Frontend
   ↓
[mostrar estadoTransformado según rol del usuario]
```

### 📋 Tabla de Transformación Completa

| Estado BD | Usuario EXTERNO | CENATE | Emoji Externo | Emoji CENATE |
|-----------|-----------------|--------|---------------|--------------|
| ENVIADA | ENVIADA | PENDIENTE | ✈️ | ⏳ |
| OBSERVADA | RECHAZADA | OBSERVADA | ❌ | 👁️ |
| ATENDIDA | ATENDIDA | ATENDIDA | ✅ | ✅ |

### 🎨 Colores Tailwind

| Estado | Clase Tailwind | RGB |
|--------|----------------|-----|
| ENVIADA/PENDIENTE | `bg-yellow-100 text-yellow-800` | #FEFCE8 / #713F12 |
| OBSERVADA | `bg-purple-100 text-purple-800` | #FAF5FF / #581C87 |
| ATENDIDA | `bg-green-100 text-green-800` | #F0FDF4 / #15803D |
| RECHAZADA | `bg-red-100 text-red-800` | #FEF2F2 / #7F1D1D |

### ⚙️ Detalle: TeleECGEstadoTransformer

```java
@Component
@Slf4j
public class TeleECGEstadoTransformer {

    // Roles externos (PADOMI, IPRESS)
    private static final List<String> ROLES_EXTERNOS = Arrays.asList(
        "INSTITUCION_EX",  // ID 18
        "EXTERNO"          // ID 15
    );

    public String transformarEstado(TeleECGImagen imagen, Usuario usuario) {
        boolean esUsuarioExterno = usuario != null && esExterno(usuario);
        return transformarEstado(imagen.getEstado(), esUsuarioExterno);
    }

    public String transformarEstado(String estadoBD, boolean esUsuarioExterno) {
        if (esUsuarioExterno) {
            return transformarParaExterno(estadoBD);
        } else {
            return transformarParaCENATE(estadoBD);
        }
    }

    private String transformarParaExterno(String estadoBD) {
        return switch (estadoBD) {
            case "ENVIADA" -> "ENVIADA";
            case "OBSERVADA" -> "RECHAZADA";  // Mapeo clave
            case "ATENDIDA" -> "ATENDIDA";
            default -> estadoBD;
        };
    }

    private String transformarParaCENATE(String estadoBD) {
        return switch (estadoBD) {
            case "ENVIADA" -> "PENDIENTE";    // Mapeo clave
            case "OBSERVADA" -> "OBSERVADA";
            case "ATENDIDA" -> "ATENDIDA";
            default -> estadoBD;
        };
    }

    public boolean esExterno(Usuario usuario) {
        // Verifica si usuario tiene rol INSTITUCION_EX (ID 18) o EXTERNO (ID 15)
        for (Rol rol : usuario.getRoles()) {
            if (rol.getIdRol() != null && (rol.getIdRol() == 18 || rol.getIdRol() == 15)) {
                return true;
            }
            if (rol.getNombreRol() != null && ROLES_EXTERNOS.contains(rol.getNombreRol())) {
                return true;
            }
        }
        return false;
    }
}
```

---

## Flujo de Negocio Completo

### 📸 1. Usuario EXTERNO sube ECG

```
Usuario IPRESS
    ↓
POST /api/teleekgs/upload {archivo, numDoc, nombres, apellidos}
    ↓
Backend:
├─ Valida archivo (MIME, tamaño, magic bytes)
├─ Genera SHA256 para detección de duplicados
├─ Guarda en /opt/cenate/teleekgs/YYYYMMDD_xxxxxxxx.jpg
├─ Crea registro en BD con estado = ENVIADA
├─ Registra auditoría
└─ Transforma estado: ENVIADA → ENVIADA (para EXTERNO)
    ↓
Response: {
  idImagen: 12345,
  estado: "ENVIADA",
  estadoTransformado: "ENVIADA",  // Externo ve
  nombreArchivo: "12345_20260120_143052_a7f3.jpg"
}
    ↓
Frontend:
├─ Muestra "✈️ ENVIADA" en amarillo
├─ Badge: bg-yellow-100 text-yellow-800
└─ Usuario puede: Ver, Descargar, Eliminar
```

### 🔍 2. CENATE revisa y observa

```
Personal CENATE
    ↓
GET /api/teleekgs/listar
    ↓
Backend:
├─ Recupera imágenes con estado ENVIADA
├─ Transforma estado: ENVIADA → PENDIENTE (para CENATE)
└─ Retorna con estadoTransformado = "PENDIENTE"
    ↓
Frontend:
├─ Muestra "⏳ PENDIENTE" en amarillo
├─ Botones: Ver, Descargar, Procesar, Rechazar
└─ CENATE elige acción
```

### ✅ 3a. CENATE Acepta (ATENDER)

```
CENATE hace clic en "Procesar"
    ↓
PUT /api/teleekgs/{id}/procesar {
  accion: "ATENDER",
  observaciones: ""
}
    ↓
Backend:
├─ Obtiene imagen
├─ Verifica estado actual = ENVIADA
├─ Actualiza: estado = ATENDIDA
├─ Guarda timestamp fecha_recepcion
├─ Registra auditoría: accion=ATENDER
└─ Transforma estado: ATENDIDA → ATENDIDA (igual para ambos)
    ↓
Frontend (ambos roles):
├─ Muestra "✅ ATENDIDA" en verde
└─ Ya no puede: Procesar ni Rechazar
```

### ❌ 3b. CENATE Rechaza (OBSERVAR)

```
CENATE hace clic en "Rechazar"
    ↓
PUT /api/teleekgs/{id}/procesar {
  accion: "OBSERVAR",
  observaciones: "Imagen de baja calidad, reenvía una más clara"
}
    ↓
Backend:
├─ Obtiene imagen
├─ Verifica estado actual = ENVIADA o PENDIENTE
├─ Actualiza: estado = OBSERVADA
├─ Guarda: observaciones = "Imagen de baja calidad..."
├─ Registra auditoría: accion=OBSERVAR
└─ Transforma estado:
    ├─ Para EXTERNO: OBSERVADA → RECHAZADA ❌
    └─ Para CENATE: OBSERVADA → OBSERVADA 👁️
    ↓
Frontend (EXTERNO):
├─ Muestra "❌ RECHAZADA" en rojo
├─ Muestra observaciones en callout
└─ Botones: Ver, Descargar, Eliminar

Frontend (CENATE):
├─ Muestra "👁️ OBSERVADA" en púrpura
├─ Muestra observaciones
└─ Ya no puede: Procesar ni Rechazar
```

### 🔄 4. Usuario EXTERNO Reenvía (Subsanamiento)

```
Usuario IPRESS ve "❌ RECHAZADA" + observaciones
    ↓
Sube NUEVA imagen
    ↓
POST /api/teleekgs/upload {
  archivo: [nueva imagen mejorada],
  numDocPaciente: "12345678"  // Mismo paciente
}
    ↓
Backend:
├─ Procesa nueva imagen normalmente
├─ Estado nuevo = ENVIADA
├─ Detecta que hay imagen anterior OBSERVADA
├─ Marca imagen anterior: fue_subsanado = true
├─ Guarda: id_imagen_anterior = [ID de la rechazada]
├─ Registra auditoría: accion=REENVIADO, ref_imagen_anterior
└─ Transforma nuevo estado: ENVIADA → ENVIADA
    ↓
Frontend (EXTERNO):
├─ Muestra "✈️ ENVIADA" en amarillo (nueva imagen)
├─ Muestra "✅ Subsanada (hay una versión mejorada)" en verde
└─ CENATE verá la nueva imagen cuando refresque

Frontend (CENATE):
├─ Muestra "⏳ PENDIENTE" en amarillo (nueva imagen)
├─ Vieja imagen marca: "✅ Subsanada (hay una versión mejorada)"
└─ Puede procesar la nueva
```

---

## 📸 PADOMI - Carga Múltiple de Imágenes + Carrusel

### ¿Qué es PADOMI?

**PADOMI** (Programa de Atención Domiciliaria) envía **múltiples ECGs del mismo paciente en un solo envío** (4-10 imágenes). Esto permite:
- Análisis integral de múltiples derivaciones del ECG
- Visualización comparativa en carrusel
- Mejor diagnóstico médico
- Flujo simplificado de carga

### Requisitos PADOMI

| Parámetro | Mínimo | Máximo | Descripción |
|-----------|--------|--------|-------------|
| **Imágenes por envío** | 4 | 10 | Todas asociadas al mismo paciente |
| **Tamaño por imagen** | - | 5 MB | JPEG o PNG |
| **Formato aceptado** | JPEG, PNG | - | Validación MIME type |

### Flujo Completo PADOMI

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. PADOMI selecciona 4-10 ECGs del mismo paciente                │
│    (ej: Derivaciones I, II, III, aVR, aVL, aVF, V1-V6)          │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend: UploadImagenECG.jsx                                 │
│    - Grid de previews (4 columnas)                               │
│    - Números en cada preview (1, 2, 3, ..., 10)                 │
│    - Botón "+" para agregar más (si < 10)                       │
│    - Botón "✕" (hover) para remover individual                  │
│    - Indicador: "X imágenes cargadas"                           │
│    - Tamaño total: "XX.XX MB"                                    │
│    - Botón: "Cargar 4 ECGs" (habilitado cuando >= 4)             │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. POST /api/teleekgs/upload-multiple                           │
│    - FormData con múltiples archivos                             │
│    - numDocPaciente, nombresPaciente, apellidosPaciente          │
│    - array de archivos (field name: "archivos")                  │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend: TeleECGController.subirMultiplesImagenes()          │
│    - Valida: 4 <= cantidad <= 10                                 │
│    - Procesa cada archivo individualmente                        │
│    - Guarda con estado = ENVIADA                                 │
│    - Aplica transformación de estado por rol                     │
│    - Retorna: { total, idImagenes, imagenes }                    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Frontend: Éxito                                               │
│    ✅ "4 ECGs cargados exitosamente"                             │
│    - Muestra IDs de las imágenes                                 │
│    - Auto-reset del formulario                                   │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Visualización en ListarImagenesECG                            │
│    - PADOMI ve las 4 imágenes en la lista                        │
│    - Hace clic en "Ver" en cualquiera de ellas                   │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Frontend: CarrouselECGModal se abre                           │
│    - Carga todas las imágenes del paciente                       │
│    - Convierte a base64 para previsualizacion                    │
│    - Muestra primera imagen al frente                            │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Carrusel: Interactividad Completa                             │
│    ◀ ▶ Navegación anterior/siguiente                            │
│    🔍 Zoom: 0.5x → 3x (botones +/-)                             │
│    ↻  Rotación: 90° incremental                                  │
│    ↻  Restaurar: Reset a 100% y 0°                              │
│    📋 Panel: Thumbnails de todas las imágenes                    │
│    ℹ️  Detalles: Estado, observaciones, fecha, tamaño             │
│    💾 Descargar: Individual de cada imagen                       │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Frontend - PADOMI

#### 1. UploadImagenECG.jsx (ACTUALIZADO)

**Cambios principales**:
- Estado: `archivos[]` y `previews[]` (arrays, no singles)
- Función: `agregarArchivos()` - Procesa múltiples archivos a la vez
- Función: `removerArchivo(index)` - Elimina específica
- Grid de previews con números
- Validación: 4 mín, 10 máx
- Endpoint: `subirMultiplesImagenes(formData)`

**Lógica de agregación**:
```javascript
// Permite agregar archivos multiple veces (drag-drop o click)
archivo1 → preview1 (en grid)
archivo2 → preview2 (en grid)
...
archivo4 → ¡Botón habilitado!
```

#### 2. CarrouselECGModal.jsx (NUEVO)

**Características**:
- Header: Paciente + cantidad total
- Visor central: Imagen actual
- Panel lateral: Thumbnails + detalles
- Controles: Zoom, rotación, restaurar
- Navegación: ◀ ▶ o click en thumbnail
- Indicador: "X de Y"
- Botón: Descargar individual

**Props**:
```jsx
<CarrouselECGModal
  imagenes={[...]}  // Array de DTOs con contenidoImagen base64
  paciente={{
    numDoc: "12345678",
    nombres: "Juan",
    apellidos: "Pérez"
  }}
  onClose={() => {...}}
  onDescargar={(imagen) => {...}}
/>
```

**Estadosindicadores en carrusel**:
- Estado transformado (ENVIADA, PENDIENTE, etc)
- Observaciones si existen
- Badge "✅ Subsanada" si fue reenvío
- Color por estado (amarillo, verde, rojo, etc)

#### 3. ListarImagenesECG.jsx (ACTUALIZADO)

**Nueva lógica**:
```javascript
// Al hacer clic en "Ver":
1. obtenerImagenesPaciente(numDoc)
   → GET /api/teleekgs/listar?numDocPaciente=X&size=100
   → Retorna todas las imágenes del paciente

2. abrirCarousel(imagen)
   → Para cada imagen, carga: GET /preview/{id}
   → Convierte a base64
   → Abre CarrouselECGModal con todas las imágenes

3. Estado: carouselAbierto, imagenesCarousel, pacienteCarousel
```

### API Endpoint - PADOMI

#### POST /api/teleekgs/upload-multiple

**Validaciones**:
- ✅ Mínimo 4 archivos
- ✅ Máximo 10 archivos
- ✅ Cada archivo: <= 5MB, JPEG/PNG
- ✅ Mismo paciente (numDocPaciente)

**Request**:
```
POST /api/teleekgs/upload-multiple
Content-Type: multipart/form-data

numDocPaciente: "12345678"
nombresPaciente: "Juan"
apellidosPaciente: "Pérez"
archivos: [file1, file2, file3, file4, ...]
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "4 imágenes subidas exitosamente",
  "code": "200",
  "data": {
    "total": 4,
    "numDocPaciente": "12345678",
    "idImagenes": [101, 102, 103, 104],
    "imagenes": [
      {
        "idImagen": 101,
        "estado": "ENVIADA",
        "estadoTransformado": "ENVIADA",
        "numDocPaciente": "12345678",
        "nombreArchivo": "ecg_1.jpg",
        ...
      },
      ...
    ]
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Mínimo 4 imágenes requeridas (PADOMI)",
  "code": "400",
  "data": null
}
```

### Backend: TeleECGController

```java
@PostMapping("/upload-multiple")
@CheckMBACPermission(pagina = "/teleekgs/upload", accion = "crear")
public ResponseEntity<?> subirMultiplesImagenes(
    @RequestParam("numDocPaciente") String numDocPaciente,
    @RequestParam("nombresPaciente") String nombresPaciente,
    @RequestParam("apellidosPaciente") String apellidosPaciente,
    @RequestParam("archivos") MultipartFile[] archivos,
    HttpServletRequest request)
```

**Algoritmo**:
```java
1. Validar cantidad: 4 <= archivos.length <= 10
2. Para cada archivo:
   a. Crear SubirImagenECGDTO
   b. Llamar teleECGService.subirImagenECG()
   c. Guardar resultado en lista
   d. Si error en archivo X: continuar con X+1
3. Si resultados.isEmpty(): retornar ERROR
4. Construir response con todos los IDs
5. Aplicar transformación de estado por rol
6. Retornar 200 OK con datos
```

### Uso en Pantallas

#### Pantalla 1: UploadImagenECG (PADOMI)
```
┌──────────────────────────────────────────────┐
│ 📤 Envío de Electrocardiogramas              │
│ Centro Nacional de Telemedicina - EsSalud    │
├──────────────────────────────────────────────┤
│                                              │
│ Información del Paciente                     │
│ [DNI: 12345678] [Nombres] [Apellidos]       │
│                                              │
│ Selecciona las Imágenes del ECG (4/10) *   │
│ ⚠️ Mínimo 4 imágenes requeridas              │
│                                              │
│ Arrastra tus imágenes aquí o haz clic        │
│ JPEG o PNG | Máximo 5MB cada una             │
│ 4-10 imágenes                                │
│                                              │
│ [Preview1] [Preview2] [Preview3] [Preview4] │
│    (1)       (2)        (3)        (4)      │
│ [Preview5] [+]                               │
│    (5)                                        │
│                                              │
│ 4 imagen(es) seleccionada(s)                 │
│ Tamaño total: 2.34 MB                        │
│                                              │
│ [Cargar 4 ECGs] [Limpiar]                   │
│                                              │
│ ✅ ECGs Cargados Exitosamente!              │
│ Todas las imágenes se asociaron al paciente │
│ IDs: 101, 102, 103, 104                     │
└──────────────────────────────────────────────┘
```

#### Pantalla 2: ListarImagenesECG
```
┌──────────────────────────────────────────────────────────┐
│ ECGs Recibidas - CENATE                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ DNI │ Paciente   │ Estado  │ Vigencia │ Tamaño │ Acciones
├──────────────────────────────────────────────────────────┤
│ 12345678 │ Juan Pérez │ ⏳ PENDIENTE │ 25d │ 2.3MB │ 👁️ ⬇️ ✅ ❌ 🗑️ │
│                                                          │
│ Información PADOMI:                                      │
│ Este paciente tiene 4 ECGs del mismo envío →             │
│ Al hacer clic en "Ver" (👁️), abre el carrusel             │
└──────────────────────────────────────────────────────────┘
```

#### Pantalla 3: Carrusel (CarrouselECGModal)
```
┌─────────────────────────────────────────────────────────────┐
│ ✕ ECGs de Juan Pérez | DNI: 12345678 | Total: 4 imágenes   │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│ Thumbnails       │  [IMAGEN ACTUAL - 2 de 4]               │
│                  │                                          │
│ [1][2][3][4]     │  ◀  [ECG Grande]  ▶                     │
│                  │                                          │
│                  │  Zoom: [−] 100% [+]  ↻ Restaurar        │
│                  │                                          │
├──────────────────┤                                          │
│                  │  Tamaño: 0.58MB                          │
│ Estado: ⏳PEND.  │  Tipo: image/jpeg                        │
│ Archivo: ecg2.jpg│  Enviado: 20/01/26 10:30                │
│ Vigencia: 25d    │                                          │
│                  │  [Descargar]                             │
└──────────────────┴──────────────────────────────────────────┘
Página 2 de 4  [← Anterior] [Siguiente →] [Cerrar]
```

### Archivo PADOMI: Flujo de Estados

Cuando PADOMI carga 4 ECGs:

```
Imagen 1 (Derivación I):    ENVIADA → (CENATE ve) PENDIENTE
Imagen 2 (Derivación II):   ENVIADA → (CENATE ve) PENDIENTE
Imagen 3 (Derivación III):  ENVIADA → (CENATE ve) PENDIENTE
Imagen 4 (Derivación aVR):  ENVIADA → (CENATE ve) PENDIENTE

Todas pueden ser:
- Procesadas juntas (ATENDER)
- Rechazadas juntas (OBSERVAR + observaciones)
- Reenviadas juntas (nuevas imágenes)
```

### Casos de Uso PADOMI

#### ✅ Caso 1: Análisis Integral ECG
```
PADOMI envía 6 derivaciones del ECG de un paciente
CENATE revisa todas en el carrusel
CENATE puede hacer zoom en cada una para analizar
CENATE procesa todas como grupo (estado actualiza todas)
```

#### ✅ Caso 2: Rechazo por Mala Calidad
```
PADOMI envía 4 ECGs
CENATE ve que 2 están borrosas
CENATE rechaza TODO el envío con observaciones:
  "Derivaciones III y aVR muy borrosas, reenvía más claras"
PADOMI ve: "❌ RECHAZADA - Derivaciones III y aVR muy borrosas..."
PADOMI reenvía 4 nuevas imágenes
Vieja imagen: "✅ Subsanada (hay una versión mejorada)"
```

#### ✅ Caso 3: Seguimiento Comparativo
```
Primer envío (Día 1): 4 derivaciones
CENATE procesa las 4
Segundo envío (Día 3): 4 derivaciones del mismo paciente
PADOMI puede usar carrusel para comparar visualmente
Ambos envíos quedan en BD con histórico completo
```

---

## 🤖 ML Dataset Supervisado - Evaluación Médica (v3.0.0)

### ¿Qué es el Sistema de Evaluación?

**Nuevo en v3.0.0**: Sistema de **dataset supervisado** donde médicos de CENATE evalúan cada ECG como **NORMAL** o **ANORMAL** con una justificación médica detallada. Esto crea un dataset etiquetado para entrenar modelos de Machine Learning en el futuro.

**Enfoque en 2 fases**:
- **Fase 1 (AHORA)**: Colección manual de evaluaciones etiquetadas con descripciones médicas
- **Fase 2 (Cuando +100 casos)**: Entrenar modelo ML (CNN/ResNet50) para predicción automática

### ¿Por Qué?

```
Problema: CENATE recibe cientos de ECGs pero no hay histórico de evaluaciones
Solución: Crear dataset supervisado (imagen + label NORMAL/ANORMAL + justificación)
Beneficio: Entrenar IA que aprenda a clasificar ECGs automáticamente
Timeline: Fase 1 NOW (coleccción) → Fase 2 LATER (entrenamiento ML)
```

### Nuevos Campos en Base de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `evaluacion` | VARCHAR(20) | NORMAL, ANORMAL, SIN_EVALUAR (default) |
| `descripcion_evaluacion` | TEXT | Justificación médica (10-1000 chars) |
| `id_usuario_evaluador` | BIGINT (FK) | Médico que evaluó |
| `fecha_evaluacion` | TIMESTAMP | Cuándo se evaluó |

**Migración SQL**: `spec/04_BaseDatos/06_scripts/038_teleecg_campos_evaluacion_v3.sql`

### Nuevas Vistas Analytics

```sql
-- View 1: Estadísticas de evaluaciones
vw_tele_ecg_evaluaciones_estadisticas
  SELECT cantidad, sin_evaluar, normales, anormales, promedio_descripcion_chars

-- View 2: Dataset completo para ML (exportable)
vw_tele_ecg_dataset_ml
  SELECT id_imagen, paciente, evaluacion, descripcion_evaluacion,
         evaluado_por, fecha_evaluacion, storage_ruta, sha256
  WHERE evaluacion IN ('NORMAL', 'ANORMAL')
  ORDER BY fecha_evaluacion DESC
```

### Nueva Tabla: Audit Log

```sql
CREATE TABLE tele_ecg_evaluacion_log (
  id_log BIGSERIAL PRIMARY KEY,
  id_imagen BIGINT NOT NULL,
  evaluacion_anterior VARCHAR(20),
  evaluacion_nueva VARCHAR(20),
  descripcion_anterior TEXT,
  descripcion_nueva TEXT,
  id_usuario_cambio BIGINT,
  fecha_cambio TIMESTAMP,
  ip_origen VARCHAR(45)
);
```

Rastreo completo de cambios en evaluaciones para auditoría.

### Flujo Completo de Evaluación

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CENATE Admin navega a TeleECG → Recibidas                    │
│    - Ve tabla con ECGs enviados desde PADOMI                    │
│    - Nueva columna: "Evaluación" (NORMAL/ANORMAL/Sin evaluar)   │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Médico ve ECG sin evaluar (columna gris "Sin evaluar")       │
│    - Hace clic en botón 🟣 "Evaluar" (solo visible si sin eval) │
│    - Modal se abre: ModalEvaluacionECG                          │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Modal: Información del Paciente + Evaluación                 │
│                                                                 │
│    📋 Información del ECG:                                      │
│    • Paciente: Rodriguez, Luis Enrique                          │
│    • DNI: 85475985                                              │
│    • IPRESS: PADOMI                                             │
│    • Fecha de Envío: 10/01/2026 14:30                           │
│                                                                 │
│    ¿Cómo evalúas este ECG? *                                   │
│    [✅ NORMAL]  [⚠️ ANORMAL]  (botones toggleables)             │
│                                                                 │
│    Descripción - ¿Por qué? (Mín 10, Máx 1000) *                │
│    ┌─────────────────────────────────────────┐                 │
│    │ Ritmo sinusal regular, frecuencia 70... │                 │
│    └─────────────────────────────────────────┘                 │
│    Contador: 45/1000 caracteres                                │
│    ✓ Mínimo 10 caracteres alcanzado                            │
│                                                                 │
│    [Cancelar] [Guardar Evaluación] (deshabilitado si incomplete)
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend: PUT /api/teleekgs/{idImagen}/evaluar                │
│                                                                 │
│    Payload:                                                     │
│    {                                                            │
│      "evaluacion": "NORMAL",                                    │
│      "descripcion": "Ritmo sinusal regular, frecuencia 70..."  │
│    }                                                            │
│                                                                 │
│    Backend:                                                     │
│    ✓ Valida: evaluacion IN ('NORMAL', 'ANORMAL')               │
│    ✓ Valida: descripcion 10-1000 chars                          │
│    ✓ Previene: ECGs expirados (>30 días)                       │
│    ✓ Guarda: evaluacion, descripcion, usuario, timestamp       │
│    ✓ Audita: Registra evaluación en audit log                  │
│    ✓ Retorna: TeleECGImagenDTO con campos evaluación populados │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Frontend: Toast Success + Auto-Reload Tabla                  │
│                                                                 │
│    ✅ "ECG evaluada como NORMAL"                                │
│                                                                 │
│    Tabla se recarga automáticamente:                            │
│    Columna "Evaluación" ahora muestra: ✅ NORMAL (verde)        │
│    Botón 🟣 "Evaluar" desaparece (ya fue evaluada)             │
│    Médico puede evaluar siguiente ECG sin evaluar              │
└─────────────────────────────────────────────────────────────────┘
```

### Tabla de TeleECGRecibidas - Nueva Columna

```
┌────────┬──────────────────┬────────────┬────────────┬────────┬──────────┬────────────┬──────────┐
│  DNI   │    Paciente      │   IPRESS   │   Fecha    │ Tamaño │  Estado  │ Evaluación │ Acciones │
├────────┼──────────────────┼────────────┼────────────┼────────┼──────────┼────────────┼──────────┤
│854756  │Rodriguez, Luis   │  PADOMI    │ 10/01/2026 │ 2.5MB  │ ⏳PEND   │ ✅ NORMAL  │ 👁️ ⬇️ ✅ │
│854756  │Rodriguez, Luis   │  PADOMI    │ 10/01/2026 │ 2.5MB  │ ⏳PEND   │ ⚠️ ANORMAL │ 👁️ ⬇️ ✅ │
│854756  │Rodriguez, Luis   │  PADOMI    │ 10/01/2026 │ 2.5MB  │ ⏳PEND   │ ✅ NORMAL  │ 👁️ ⬇️ ✅ │
│854756  │Rodriguez, Luis   │  PADOMI    │ 10/01/2026 │ 2.5MB  │ ⏳PEND   │ ⏳ S/eval  │ 👁️ ⬇️ 🟣 │
└────────┴──────────────────┴────────────┴────────────┴────────┴──────────┴────────────┴──────────┘

Colores Evaluación:
• ✅ NORMAL   → Verde  (bg-green-100, text-green-800)
• ⚠️ ANORMAL  → Amarillo (bg-yellow-100, text-yellow-800)
• ⏳ S/eval   → Gris    (bg-gray-100, text-gray-600)
```

### API Endpoint: Evaluar ECG

```http
PUT /api/teleekgs/{idImagen}/evaluar
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "evaluacion": "NORMAL",  // o "ANORMAL"
  "descripcion": "Ritmo sinusal regular, sin arritmias, intervalo QT normal"
}

Response (200 OK):
{
  "status": 200,
  "data": {
    "idImagen": 12345,
    "evaluacion": "NORMAL",
    "descripcionEvaluacion": "Ritmo sinusal regular...",
    "usuarioEvaluadorNombre": "Dr. Carlos López",
    "fechaEvaluacion": "2026-01-20T14:35:00",
    "estado": "ENVIADA",
    "estadoTransformado": "PENDIENTE",
    ...
  },
  "message": "Evaluación guardada exitosamente"
}

Response (400 Bad Request):
{
  "status": 400,
  "error": "ValidationException",
  "message": "Descripción debe tener mínimo 10 caracteres"
}

Response (404 Not Found):
{
  "status": 404,
  "error": "ResourceNotFoundException",
  "message": "ECG no encontrada: 12345"
}
```

### Frontend Components - ML Evaluation

#### 1. ModalEvaluacionECG.jsx (NUEVO)

**Ubicación**: `frontend/src/components/teleecgs/ModalEvaluacionECG.jsx`

**Props**:
```jsx
<ModalEvaluacionECG
  isOpen={boolean}
  ecg={objeto ECG}
  onClose={() => {...}}
  onConfirm={(evaluacion, descripcion) => {...}}
  loading={boolean}
/>
```

**Features**:
- ✅ Botones NORMAL (verde) / ANORMAL (amarillo)
- ✅ Textarea con contador en tiempo real (0/1000)
- ✅ Validación: mín 10, máx 1000 caracteres
- ✅ Submit deshabilitado si datos incompletos
- ✅ Loading spinner durante guardado
- ✅ Muestra info del paciente (DNI, IPRESS, fecha)

#### 2. TeleECGRecibidas.jsx (ACTUALIZADO)

**Cambios principales**:
- ✅ Función helper `getEvaluacionBadge(evaluacion)` para renderizar colores
- ✅ Nueva columna `<th>Evaluación</th>` entre Estado y Acciones
- ✅ Celda con `{getEvaluacionBadge(ecg.evaluacion)}`
- ✅ Botón 🟣 "Evaluar" solo visible si `!ecg.evaluacion || ecg.evaluacion === "SIN_EVALUAR"`
- ✅ Handler `handleEvaluar(ecg)` abre modal
- ✅ Handler `handleConfirmarEvaluacion(evaluacion, descripcion)` envía al backend
- ✅ Auto-reload de tabla tras guardar

```javascript
// Función helper para badge
const getEvaluacionBadge = (evaluacion) => {
  const badges = {
    NORMAL: (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" /> NORMAL
      </span>
    ),
    ANORMAL: (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3" /> ANORMAL
      </span>
    ),
    SIN_EVALUAR: (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Clock className="w-3 h-3" /> Sin evaluar
      </span>
    ),
  };
  return badges[evaluacion] || badges.SIN_EVALUAR;
};
```

#### 3. teleecgService.js (ACTUALIZADO)

**Nuevo método**:
```javascript
evaluarImagen: async (idImagen, evaluacion, descripcion) => {
  const payload = {
    evaluacion,
    descripcion,
  };
  return await apiClient.put(
    `/teleekgs/${idImagen}/evaluar`,
    payload,
    true
  );
}
```

### Backend Implementation

#### DTO: EvaluacionECGDTO

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionECGDTO {

  @NotNull(message = "Evaluación es requerida")
  @NotBlank(message = "Evaluación no puede estar vacía")
  @Size(min = 1, max = 20)
  private String evaluacion;  // NORMAL o ANORMAL

  @NotNull(message = "Descripción es requerida")
  @NotBlank(message = "Descripción no puede estar vacía")
  @Size(min = 10, max = 1000, message = "Descripción debe tener 10-1000 caracteres")
  private String descripcion;  // Justificación médica
}
```

#### Service Method: TeleECGService.evaluarImagen()

```java
public TeleECGImagenDTO evaluarImagen(
    Long idImagen,
    String evaluacion,
    String descripcion,
    Long idUsuarioEvaluador,
    String ipCliente) {

  // 1. Validar evaluacion
  if (!evaluacion.matches("^(NORMAL|ANORMAL)$")) {
    throw new ValidationException("Evaluación debe ser NORMAL o ANORMAL");
  }

  // 2. Validar descripcion
  if (descripcion.length() < 10) {
    throw new ValidationException("Descripción debe tener mínimo 10 caracteres");
  }
  if (descripcion.length() > 1000) {
    throw new ValidationException("Descripción no puede exceder 1000 caracteres");
  }

  // 3. Obtener imagen
  TeleECGImagen imagen = teleECGImagenRepository
    .findById(idImagen)
    .orElseThrow(() -> new ResourceNotFoundException("ECG no encontrada: " + idImagen));

  // 4. Validar no expirada
  if (imagen.getFechaExpiracion() != null &&
      imagen.getFechaExpiracion().isBefore(LocalDateTime.now())) {
    throw new ValidationException("ECG ha expirado y no puede ser evaluada");
  }

  // 5. Guardar evaluación
  imagen.setEvaluacion(evaluacion);
  imagen.setDescripcionEvaluacion(descripcion);
  imagen.setUsuarioEvaluador(usuarioRepository.findById(idUsuarioEvaluador).orElse(null));
  imagen.setFechaEvaluacion(LocalDateTime.now());

  teleECGImagenRepository.save(imagen);

  // 6. Auditar
  registrarAuditoria(
    imagen,
    idUsuarioEvaluador,
    "EVALUAR",
    ipCliente,
    String.format("Evaluada como %s", evaluacion)
  );

  // 7. Retornar DTO
  return convertirADTO(imagen);
}
```

#### DTO Conversion: convertirADTO()

**En TeleECGService.java**:
```java
// Agregar campos de evaluación a la conversión
dto.setEvaluacion(imagen.getEvaluacion());
dto.setDescripcionEvaluacion(imagen.getDescripcionEvaluacion());

if (imagen.getUsuarioEvaluador() != null) {
  usuarioRepository.findById(imagen.getUsuarioEvaluador().getIdUser())
    .ifPresent(usuario -> {
      dto.setUsuarioEvaluadorNombre(usuario.getNameUser());
    });
}

dto.setFechaEvaluacion(imagen.getFechaEvaluacion());
```

### Casos de Uso

#### ✅ Caso 1: Evaluación Correcta

```
1. Médico abre modal
2. Selecciona NORMAL
3. Escribe: "Ritmo sinusal regular, sin arritmias, QT normal"
4. Clic "Guardar"
5. ✅ Éxito: Columna muestra "✅ NORMAL" en verde
6. Botón 🟣 desaparece
7. Médico continúa evaluando siguiente ECG
```

#### ✅ Caso 2: Evaluación Anormal

```
1. Médico abre modal
2. Selecciona ANORMAL
3. Escribe: "Taquicardia sinusal (110 bpm), cambios isquémicos V1-V3"
4. Clic "Guardar"
5. ✅ Éxito: Columna muestra "⚠️ ANORMAL" en amarillo
```

#### ❌ Caso 3: Validación Fallida

```
1. Médico selecciona NORMAL
2. Escribe: "Bueno" (solo 5 caracteres)
3. Intenta enviar
4. ❌ Error: "Descripción debe tener mínimo 10 caracteres"
5. Botón "Guardar" deshabilitado
6. Médico agrega más detalle
7. ✅ Éxito: Ahora sí guarda
```

### Estadísticas y Analytics

```sql
-- Ver estadísticas de evaluaciones
SELECT
  evaluacion,
  COUNT(*) as total,
  AVG(LENGTH(descripcion_evaluacion)) as promedio_chars
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
  AND fecha_expiracion >= CURRENT_TIMESTAMP
GROUP BY evaluacion;

-- Resultado esperado:
-- evaluacion | total | promedio_chars
-- NORMAL     | 45    | 67.5
-- ANORMAL    | 23    | 84.2
-- SIN_EVALUAR| 12    | null
```

### Roadmap Phase 2: ML Training

Cuando se alcancen **+100 evaluaciones** (etiquetas NORMAL/ANORMAL):

```
1. ✅ Exportar dataset:
   SELECT * FROM vw_tele_ecg_dataset_ml WHERE evaluacion IN ('NORMAL', 'ANORMAL');

2. 📊 Características del dataset:
   - Imagen (de storage_ruta)
   - Label: NORMAL o ANORMAL
   - Descripción médica (para análisis)
   - Metadata: paciente, IPRESS, fecha

3. 🤖 Entrenar modelo (Python):
   - CNN o ResNet50 pre-trained
   - Data augmentation
   - Cross-validation
   - Confusion matrix

4. 📈 Integración en producción:
   - Crear endpoint: POST /api/teleekgs/{id}/predecir
   - Mostrar predicción con confidence score
   - A/B testing: manual vs ML

5. 🔄 Feedback loop:
   - Nuevas evaluaciones → reentrenamiento
   - Fine-tuning continuo
   - Monitoreo de drift
```

---

## Acceso por Rol

### 👥 Roles y Permisos v3.0.0

| Rol | Ver | Subir | Procesar | Rechazar | Eliminar | Estados que Ve |
|-----|-----|-------|----------|----------|----------|----------------|
| **EXTERNO** | ✅ | ✅ | ❌ | ❌ | ✅ | ENVIADA, RECHAZADA, ATENDIDA |
| **INSTITUCIÓN_EX** | ✅ | ✅ | ❌ | ❌ | ✅ | ENVIADA, RECHAZADA, ATENDIDA |
| **CENATE (COORDINADOR)** | ✅ | ❌ | ✅ | ✅ | ❌ | PENDIENTE, OBSERVADA, ATENDIDA |
| **CENATE (ADMIN)** | ✅ | ❌ | ✅ | ✅ | ✅ | PENDIENTE, OBSERVADA, ATENDIDA |

### 📊 Vista de Estadísticas por Rol

**Usuario EXTERNO (IPRESS)**:
```
┌─────────────────────────────────┐
│ Total ECGs      │ 150            │
├─────────────────────────────────┤
│ Enviadas ✈️      │ 45  (30%)      │
│ Atendidas ✅     │ 98  (65%)      │
│ Rechazadas ❌    │ 7   (5%)       │
└─────────────────────────────────┘
```

**Personal CENATE**:
```
┌─────────────────────────────────┐
│ Total ECGs      │ 450            │
├─────────────────────────────────┤
│ Pendientes ⏳   │ 120 (27%)      │
│ Observadas 👁️  │ 45  (10%)      │
│ Atendidas ✅     │ 285 (63%)      │
└─────────────────────────────────┘
```

---

## API REST Endpoints

### 📤 Subir Imagen

```http
POST /api/teleekgs/upload
Content-Type: multipart/form-data

Query Parameters:
- numDocPaciente: "12345678"
- nombresPaciente: "Juan"
- apellidosPaciente: "Pérez"

Body:
- archivo: <binary file>

Response (200 OK):
{
  "data": {
    "idImagen": 12345,
    "numDocPaciente": "12345678",
    "nombresPaciente": "Juan",
    "apellidosPaciente": "Pérez",
    "estado": "ENVIADA",           // BD
    "estadoTransformado": "ENVIADA", // UI (para usuario actual)
    "nombreArchivo": "12345_20260120_143052_a7f3.jpg",
    "fechaEnvio": "2026-01-20T14:30:52",
    "fechaExpiracion": "2026-02-19T14:30:52",
    "diasRestantes": 30
  }
}
```

### 📋 Listar Imágenes

```http
GET /api/teleekgs/listar?page=0&size=20&estado=PENDIENTE
Authorization: Bearer <token>

Response (200 OK):
{
  "data": {
    "content": [
      {
        "idImagen": 12345,
        "numDocPaciente": "12345678",
        "estado": "ENVIADA",                    // BD
        "estadoTransformado": "PENDIENTE",     // UI (transformado para CENATE)
        "observaciones": null,
        "fueSubsanado": false,
        "idImagenAnterior": null,
        "nombreArchivo": "12345_20260120_143052_a7f3.jpg",
        "fechaEnvio": "2026-01-20T14:30:52",
        "diasRestantes": 30,
        "vigencia": "VIGENTE"
      }
    ],
    "totalPages": 5,
    "totalElements": 87
  }
}
```

### 👁️ Obtener Detalles

```http
GET /api/teleekgs/{idImagen}/detalles
Authorization: Bearer <token>

Response (200 OK):
{
  "data": {
    "idImagen": 12345,
    "estado": "OBSERVADA",                     // BD
    "estadoTransformado": "RECHAZADA",        // UI (para usuario EXTERNO)
    "observaciones": "Imagen de baja calidad, reenvía más clara",
    "fueSubsanado": false,
    "idImagenAnterior": null,
    // ... más campos
  }
}
```

### ✏️ Procesar/Rechazar Imagen

```http
PUT /api/teleekgs/{idImagen}/procesar
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "accion": "ATENDER",  // o "OBSERVAR"
  "observaciones": "Imagen clara y válida" // solo para OBSERVAR
}

Response (200 OK):
{
  "data": {
    "idImagen": 12345,
    "estado": "ATENDIDA",  // o "OBSERVADA"
    "estadoTransformado": "ATENDIDA",  // transformado
    "observaciones": "Imagen clara y válida",
    "fechaRecepcion": "2026-01-20T14:35:00"
  }
}
```

### 🗑️ Eliminar Imagen

```http
DELETE /api/teleekgs/{idImagen}
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Imagen eliminada correctamente",
  "deletedRecords": {
    "imagenes": 1,
    "auditorias": 5  // cascading delete
  }
}
```

### 📊 Obtener Estadísticas

```http
GET /api/teleekgs/estadisticas
Authorization: Bearer <token>

Response (200 OK):
{
  "data": {
    "totalImagenesCargadas": 450,
    // Para EXTERNO:
    "totalEnviadas": 120,
    "totalAtendidas": 310,
    "totalRechazadas": 20,
    // Para CENATE:
    "totalPendientes": 120,      // ENVIADA
    "totalObservadas": 20,        // OBSERVADA
    "totalAtendidas": 310         // ATENDIDA
  }
}
```

---

## Frontend Components

### 📁 Estructura de Componentes (v3.0.0)

```
frontend/src/
├── components/teleecgs/
│   ├── ListaECGsPacientes.jsx          ✅ Actualizado v3.0.0
│   │   └─ Muestra estados transformados
│   │   └─ Botones ATENDER/OBSERVAR
│   │   └─ Muestra observaciones y subsanado
│   │
│   ├── VisorECGModal.jsx               ✅ Actualizado v3.0.0
│   │   └─ Colores para nuevos estados
│   │
│   ├── UploadECGForm.jsx               ✅ Actualizado v3.0.0
│   │   └─ Respuesta con estadoTransformado
│   │
│   └── ProcesarECGModal.jsx            ✅ Actualizado
│       └─ Solicita observaciones
│
├── components/teleekgs/
│   ├── UploadImagenECG.jsx             ✅ Actualizado v3.0.0
│   │   └─ Muestra estado transformado en respuesta
│   │
│   ├── ListarImagenesECG.jsx           ✅ Actualizado v3.0.0
│   │   └─ Estados nuevos con colores
│   │   └─ Botones ATENDER/OBSERVAR
│   │   └─ Muestra observaciones
│   │
│   └── DetallesImagenECG.jsx           ✅ Actualizado v3.0.0
│       └─ Verifica PENDIENTE/ENVIADA para botones
│
├── pages/roles/externo/teleecgs/
│   ├── TeleECGDashboard.jsx            ✅ Actualizado v3.0.0
│   │   └─ Stats: Enviadas/Atendidas/Rechazadas
│   │
│   └── TeleECGEstadisticas.jsx         ✅ Actualizado v3.0.0
│       └─ Gráficos con nuevos estados
│
├── pages/teleecg/
│   ├── TeleECGRecibidas.jsx            ✅ Actualizado v3.0.0
│   │   └─ Stats: Pendientes/Observadas/Atendidas
│   │   └─ Botones ATENDER/OBSERVAR
│   │   └─ Muestra observaciones
│   │
│   └── TeleECGEstadisticas.jsx         ✅ Actualizado v3.0.0
│       └─ Gráficos sin Vinculadas
│
└── services/
    ├── teleecgService.js               ✅ Actualizado v3.0.0
    │   └─ Acciones: ATENDER, OBSERVAR
    │
    └── teleekgService.js               ✅ Soporta v3.0.0
        └─ procesarImagen() con nuevas acciones
```

### 🎨 Colores y Badges (v3.0.0)

```jsx
// Colores por estado (Tailwind)
const estadoColores = {
  "ENVIADA": "bg-yellow-100 text-yellow-800",      // Externa ve ✈️
  "PENDIENTE": "bg-yellow-100 text-yellow-800",    // CENATE ve ⏳
  "OBSERVADA": "bg-purple-100 text-purple-800",    // CENATE ve 👁️
  "RECHAZADA": "bg-red-100 text-red-800",          // Externa ve ❌
  "ATENDIDA": "bg-green-100 text-green-800"        // Ambos ✅
};

// Ejemplo: Badge en tabla
<span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColores[estadoTransformado]}`}>
  {getEmoji(estadoTransformado)} {estadoTransformado}
</span>

// Si hay observaciones
{observaciones && (
  <div className="text-xs text-gray-600 mt-1 p-1 bg-gray-50 rounded">
    <p className="font-medium">💬 {observaciones}</p>
  </div>
)}

// Si fue subsanado
{fueSubsanado && (
  <div className="text-xs text-green-600 mt-1 p-1 bg-green-50 rounded">
    ✅ Subsanada (hay una versión mejorada)
  </div>
)}
```

---

## Sistema de Permisos MBAC

### 🔐 Permisos por Rol (v3.0.0)

```java
// INSTITUCION_EX / EXTERNO
POST /api/teleekgs/upload         ✅ Ver, Subir, Descargar, Eliminar
GET  /api/teleekgs/listar         ✅ Solo sus propias imágenes
GET  /api/teleekgs/{id}/detalles  ✅ Solo sus propias imágenes
GET  /api/teleekgs/{id}/preview   ✅ Solo sus propias imágenes
GET  /api/teleekgs/{id}/descargar ✅ Solo sus propias imágenes
DELETE /api/teleekgs/{id}         ✅ Solo sus propias imágenes

// COORDINADOR_RED / ENFERMERIA / ADMIN
GET  /api/teleekgs/listar         ✅ TODAS las imágenes
GET  /api/teleekgs/{id}/detalles  ✅ TODAS las imágenes
PUT  /api/teleekgs/{id}/procesar  ✅ ATENDER o OBSERVAR
GET  /api/teleekgs/estadisticas   ✅ Vistas consolidadas
```

### 📋 Matriz de Permisos

| Acción | EXTERNO | CENATE |
|--------|---------|--------|
| Ver propias | ✅ | ✅ |
| Ver todas | ❌ | ✅ |
| Subir | ✅ | ❌ |
| Aceptar (ATENDER) | ❌ | ✅ |
| Rechazar (OBSERVAR) | ❌ | ✅ |
| Eliminar propias | ✅ | ❌ |
| Eliminar cualquiera | ❌ | ✅ |

---

## Validaciones y Restricciones

### 📝 Validaciones en Upload

```javascript
✅ Tipo MIME: image/jpeg, image/png
✅ Magic bytes: verificar firma de archivo
✅ Tamaño: máximo 5MB
✅ DNI: exactamente 8 dígitos
✅ Duplicados: SHA256 debe ser único
✅ Nombre archivo: auto-generado (no usar input del usuario)
```

### 🔄 Validaciones en Procesar

```javascript
✅ Estado actual debe ser ENVIADA para ATENDER u OBSERVAR
✅ Observaciones: máximo 500 caracteres
✅ Transacción atómica: actualizar estado + auditoría
✅ Cascading delete si se elimina
```

### 🎯 Restricciones de Estado

```
ENVIADA ──[ATENDER]──> ATENDIDA (fin)
    │
    └──[OBSERVAR]──> OBSERVADA (fin, espera reenvío)

Solo admin puede eliminar imágenes OBSERVADA
Usuario EXTERNO puede reenviar (nueva imagen)
```

---

## Configuración del Sistema

### 🗂️ Almacenamiento Filesystem

```bash
# Ruta base
/opt/cenate/teleekgs/

# Estructura
/opt/cenate/teleekgs/
├── 2026-01-20/                    # Por fecha
│   ├── 12345678_143052_a7f3.jpg   # numDoc_HHmmss_random.jpg
│   └── 87654321_150230_b2d5.png
├── 2026-01-21/
│   └── ...
```

### ⚙️ Variables de Entorno

```bash
# Backend
TELEECG_STORAGE_PATH=/opt/cenate/teleekgs
TELEECG_MAX_FILE_SIZE=5242880  # 5MB en bytes
TELEECG_EXPIRATION_DAYS=30
TELEECG_CLEANUP_TIME=02:00     # 2am UTC

# Frontend
REACT_APP_API_URL=http://localhost:8080
REACT_APP_MAX_FILE_SIZE=5242880
```

### 🔧 Configuración de Permisos

```sql
-- Insertar páginas y permisos (si no existen)
INSERT INTO dim_paginas_modulo (id_pagina, nombre_pagina, path_pagina)
VALUES (101, 'TeleECG', '/teleekgs');

INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, accion)
VALUES
  (15, 101, 'ver'),       -- EXTERNO: ver
  (15, 101, 'crear'),     -- EXTERNO: subir
  (15, 101, 'eliminar'),  -- EXTERNO: eliminar propias
  (18, 101, 'ver'),       -- INSTITUCION_EX: ver
  (3, 101, 'ver'),        -- ADMIN: ver todo
  (3, 101, 'editar'),     -- ADMIN: procesar
  (3, 101, 'eliminar');   -- ADMIN: eliminar
```

---

## Troubleshooting

### ❌ Problema: Médico no ve pacientes recién asignados en "Mis Pacientes"

**Causa (SOLUCIONADO en v1.63.2)**: El filtro de rango de fechas estaba configurado por defecto a `'hoy'` (solo mostrar pacientes asignados hoy), pero cuando el coordinador asignaba un paciente en un día anterior, el médico no lo veía al ingresar al día siguiente.

**Histórico**:
- **v1.63.1**: Se reportó el problema (Dra. Zumaeta no veía pacientes asignados el día anterior)
- **v1.63.2**: ✅ **SOLUCIONADO**

**Solución implementada** (MisPacientes.jsx línea 122):

```javascript
// ANTES (v1.63.1)
const [filtroRangoFecha, setFiltroRangoFecha] = useState('hoy');

// DESPUÉS (v1.63.2 ✅)
const [filtroRangoFecha, setFiltroRangoFecha] = useState('todos');
```

**Impacto**:
- ✅ Médicos ahora ven TODOS los pacientes asignados al cargar la página
- ✅ Pueden filtrar por fecha manualmente si desean
- ✅ Pacientes asignados ayer/días anteriores son visibles inmediatamente
- ✅ KPI cards siempre coinciden con la tabla mostrada

**Componentes afectados**:
- `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx` (línea 122)

---

### ❌ Problema: "Imagen de baja calidad" pero usuario EXTERNO no ve el mensaje

**Causa**: CENATE rechazó (OBSERVAR) pero EXTERNO no ve observaciones en rechazo

**Solución**:
```javascript
// Frontend debe mostrar observaciones cuando estado = RECHAZADA
if (ecg.estadoTransformado === "RECHAZADA" && ecg.observaciones) {
  <div className="text-red-600 mt-2">
    <p className="font-medium">Motivo del rechazo:</p>
    <p>{ecg.observaciones}</p>
  </div>
}
```

### ❌ Problema: Usuario EXTERNO ve "PENDIENTE" en lugar de "ENVIADA"

**Causa**: Frontend no está usando `estadoTransformado`

**Solución**:
```javascript
// INCORRECTO
<span>{ecg.estado}</span>

// CORRECTO
<span>{ecg.estadoTransformado || ecg.estado}</span>
```

### ❌ Problema: Botón "Procesar" aparece en estado ATENDIDA

**Causa**: No verificar ambos estados (antiguo + nuevo)

**Solución**:
```javascript
// INCORRECTO
{ecg.estado === "PENDIENTE" && <button>Procesar</button>}

// CORRECTO
{(ecg.estadoTransformado === "PENDIENTE" ||
  ecg.estado === "PENDIENTE" ||
  ecg.estado === "ENVIADA") && <button>Procesar</button>}
```

### ❌ Problema: Imagen rechazada desaparece de la lista

**Causa**: Filtro en listar está filtrando por estado incorrecto

**Solución**:
```javascript
// Usar estadoTransformado en filtros frontend
const filtrado = imagenes.filter(img =>
  !filtroEstado || img.estadoTransformado === filtroEstado
);
```

### ❌ Problema: "Subsanada (hay versión mejorada)" no aparece

**Causa**: `fue_subsanado` no está en la respuesta del API

**Solución**:
```javascript
// Backend TeleECGService.convertirADTO()
if (imagen.getImagenAnterior() != null && imagen.getImagenAnterior().getIdImagen() != null) {
  dto.setIdImagenAnterior(imagen.getImagenAnterior().getIdImagen());
}
dto.setFueSubsanado(imagen.getFueSubsanado() != null ? imagen.getFueSubsanado() : false);
```

---

## Resumen de Cambios v3.0.0

### 🎯 Cambios Principales

| Aspecto | Antes (v2.0.0) | Ahora (v3.0.0) | Impacto |
|---------|---|---|---|
| **Estados** | PENDIENTE, PROCESADA, RECHAZADA, VINCULADA | ENVIADA, OBSERVADA, ATENDIDA | Breaking Change |
| **Transformación** | No existe | Sí, por rol | UI dinámica |
| **Observaciones** | No existe | Sí (TEXT) | Mejor feedback |
| **Subsanamiento** | No existe | Sí (FK + bool) | Rastreo de reenvíos |
| **Carga de imágenes** | 1 por vez | 1 o batch 4-10 (PADOMI) | ⭐ NUEVO |
| **Visualización** | Ver individual | Carrusel interactivo (PADOMI) | ⭐ NUEVO |
| **Zoom/Rotación** | No existe | Sí en carrusel | ⭐ NUEVO |
| **Acciones API** | PROCESAR, RECHAZAR | ATENDER, OBSERVAR, REENVIADO | Semántica mejorada |
| **Backend** | 5 archivos | 6 archivos (+1 nuevo) | +TeleECGEstadoTransformer |
| **Frontend** | 5 componentes | 11 componentes | +CarrouselECGModal |

### 📊 Estadísticas

- **Archivos Backend Modificados**: 6
  - TeleECGController.java (nuevo endpoint /upload-multiple)
  - TeleECGService.java
  - TeleECGImagen.java
  - TeleECGImagenDTO.java
  - TeleECGEstadoTransformer.java ⭐ NUEVO
  - SubirImagenECGDTO.java

- **Archivos Frontend Modificados**: 10
  - UploadImagenECG.jsx ⭐ ACTUALIZADO (carga múltiple)
  - ListarImagenesECG.jsx ⭐ ACTUALIZADO (integración carrusel)
  - ListaECGsPacientes.jsx
  - TeleECGDashboard.jsx (EXTERNO)
  - TeleECGRecibidas.jsx (CENATE)
  - TeleECGEstadisticas.jsx
  - VisorECGModal.jsx
  - DetallesImagenECG.jsx
  - teleecgService.js ⭐ ACTUALIZADO (nuevo método)
  - CarrouselECGModal.jsx ⭐ NUEVO

- **Nuevo Componente Frontend**: CarrouselECGModal.jsx (PADOMI)
- **Nuevo Endpoint Backend**: POST /api/teleekgs/upload-multiple
- **Campos BD Nuevos**: 3 (id_imagen_anterior, fue_subsanado, observaciones)
- **Líneas de Código Agregadas**: ~3500+
- **Compatibilidad Backward**: Parcial (requiere migración)

### 🎯 Features PADOMI (v3.0.0)

- ⭐ **Carga Batch**: 4-10 imágenes en un envío
- ⭐ **Carrusel Interactivo**: Navegación fluida entre imágenes
- ⭐ **Zoom Dinámico**: 0.5x a 3x
- ⭐ **Rotación**: 90° incremental
- ⭐ **Thumbnails**: Panel lateral con todas las imágenes
- ⭐ **Detalles**: Estado, observaciones, fecha, tamaño por imagen
- ⭐ **Descarga Individual**: Descargar cada imagen desde carrusel
- ⭐ **Validación Frontend**: Prevención de envíos incompletos

---

## Migración desde v2.0.0

### 📋 Pasos de Migración

```bash
# 1. Ejecutar script SQL
psql -U postgres -d maestro_cenate -f spec/04_BaseDatos/06_scripts/037_refactor_teleecg_estados_v3_fixed.sql

# 2. Compilar backend
cd backend && ./gradlew clean build

# 3. Compilar frontend
cd frontend && npm run build

# 4. Verificar datos
SELECT COUNT(*), estado FROM tele_ecg_imagenes GROUP BY estado;
-- Debería mostrar: ENVIADA, OBSERVADA, ATENDIDA (no PENDIENTE, PROCESADA, etc.)
```

### ⚠️ Puntos Críticos

1. **No hay rollback**: Script SQL es irreversible
2. **Datos existentes**: Se migran automáticamente
3. **API cambios**: Acciones PROCESAR/RECHAZAR → ATENDER/OBSERVAR
4. **Frontend**: Requiere actualización de componentes
5. **Permisos**: Revisar MBAC después de migración

---

## 📚 Documentación Relacionada

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **Guía Rápida v3.0.0** | Referencia rápida con ejemplos de código | `spec/01_Backend/09_teleecg_v3.0.0_guia_rapida.md` |
| **Changelog v1.24.0** | Registro de PADOMI (carga múltiple) | `checklist/01_Historial/01_changelog.md` |
| **Changelog v1.22.0** | Registro de cambios v3.0.0 (estados) | `checklist/01_Historial/01_changelog.md` |
| **Análisis v2.0.0** | Análisis arquitectónico anterior | `plan/02_Modulos_Medicos/07_analisis_completo_teleecg_v2.0.0.md` |
| **Estado v2.0.0** | Estado final anterior | `plan/02_Modulos_Medicos/08_estado_final_teleecg_v2.0.0.md` |

## Soporte y Contacto

Para reportes de bugs en v3.0.0:
- **Changelog**: `checklist/01_Historial/01_changelog.md` (ver v1.22.0 y v1.24.0)
- **Módulo**: TeleECG v3.0.0
- **Versión Actual**: 3.0.0 (2026-01-20)
- **Feature Destacada**: PADOMI - Carga múltiple 4-10 imágenes + Carrusel interactivo

---

**Última actualización**: 2026-01-20
**Versión**: 3.0.0
**Estado**: ✅ COMPLETADO (incluyendo PADOMI v1.24.0)
