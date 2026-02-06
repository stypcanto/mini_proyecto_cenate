# 🎨 Componentes del Módulo TeleEKG

**Versión:** v1.51.0
**Última actualización:** 2026-02-06

---

## 📦 Frontend Components

### UploadImagenECG.jsx
**Ubicación:** `frontend/src/components/teleecgs/UploadImagenECG.jsx`

```javascript
Props:
- onSuccess?: (response) => void

State:
- archivos: File[]
- previews: string[]
- numDocPaciente: string
- datosCompletos: { nombres, apellidos, sexo, codigo }

Features:
✅ Drag & drop (desktop)
✅ File picker (mobile)
✅ 4-10 imágenes JPEG/PNG
✅ Máximo 5MB cada
✅ Preview grid
✅ Validación DNI
✅ useNavigate + redirect a /teleekgs/listar
✅ State passing (mensaje + DNI)

Líneas de cambio:
- Línea 2: +useNavigate import
- Línea 20: +navigate variable
- Línea 236-245: +navigate() call con state
```

### RegistroPacientes.jsx
**Ubicación:** `frontend/src/pages/roles/externo/teleecgs/RegistroPacientes.jsx`

```javascript
Props:
- None

State:
- ecgs: TeleECG[]
- filteredEcgs: TeleECG[]
- loading: boolean
- searchTerm: string
- filterEstado: string
- selectedEKG: TeleECG
- showVisor: boolean

Features:
✅ useLocation para detectar redirección
✅ Auto-filtrado por DNI
✅ Toast de confirmación
✅ Tabla responsive (desktop/mobile)
✅ Botón "Ver en CENATE" (nueva pestaña)
✅ Preview de imágenes
✅ Descarga de archivos

Líneas de cambio:
- Línea 1: +useLocation import
- Línea 2: +ExternalLink import
- Línea 3: +toast import
- Línea 24-47: +useLocation + detectar redirect
- Línea 287-325: +botón "Ver en CENATE"
```

### TeleECGDashboard.jsx
**Ubicación:** `frontend/src/pages/roles/externo/teleecgs/TeleECGDashboard.jsx`

```javascript
Props:
- None

State:
- loading: boolean
- ecgs: TeleECG[]
- stats: Statistics
- selectedEKG: TeleECG
- showVisor: boolean

Features:
✅ Breadcrumb integrado
✅ Estadísticas en cards
✅ Grid de imágenes agrupadas
✅ Modals para preview
✅ Integración con UploadImagenECG

Líneas de cambio:
- Línea 15: +TeleEKGBreadcrumb import
- Línea 229: +<TeleEKGBreadcrumb />
```

### TeleECGRecibidas.jsx
**Ubicación:** `frontend/src/pages/teleecg/TeleECGRecibidas.jsx`

```javascript
Props:
- None

State:
- loading: boolean
- ecgs: TeleECG[]
- stats: Statistics
- selectedEKG: TeleECG
- showVisor: boolean
- showEvaluacionModal: boolean
- ecgParaEvaluar: TeleECG
- evaluandoImagen: boolean
- filtros: { IPRESS, estado, dateRange }

Features:
✅ Breadcrumb integrado
✅ Auto-refresh cada 30 segundos
✅ Estadísticas en tiempo real
✅ Tabla consolidada por paciente
✅ Estados transformados (ENVIADA → PENDIENTE)
✅ Modal de evaluación
✅ Filtros avanzados

Líneas de cambio:
- Línea 21: +TeleEKGBreadcrumb import
- Línea 72-85: +auto-refresh setInterval
- Línea 427: +<TeleEKGBreadcrumb />
```

### 🆕 TeleEKGBreadcrumb.jsx
**Ubicación:** `frontend/src/components/teleecgs/TeleEKGBreadcrumb.jsx` (NUEVO)

```javascript
Props:
- None (usa useLocation)

Features:
✅ 3 pasos: Upload → Listar → Recibidas
✅ Detecta página actual vía useLocation
✅ Estados visuales: Azul (actual), Verde (completado), Gris (pendiente)
✅ Links navegables
✅ Barra de progreso
✅ Responsive

Estructura:
- ChevronRight separadores
- Links con React Router
- Progress bar con width dinámico
- Colores gradiente
```

### VisorECGModal.jsx
**Ubicación:** `frontend/src/components/teleecgs/VisorECGModal.jsx`

```javascript
Props:
- ecg: TeleECG (imagen a mostrar)
- onClose: () => void
- onDescargar: () => void

Features:
✅ Preview de imagen en base64
✅ Zoom in/out
✅ Descarga
✅ Información de paciente
✅ Cierre con ESC o botón
```

### ModalEvaluacionECG.jsx
**Ubicación:** `frontend/src/components/teleecgs/ModalEvaluacionECG.jsx`

```javascript
Props:
- isOpen: boolean
- imagen: TeleECG
- onClose: () => void
- onGuardar: (resultado, descripcion) => Promise

Features:
✅ Selección: NORMAL / ANORMAL
✅ Campo descripción (opcional)
✅ Validaciones
✅ Loading state
✅ Toast de confirmación
```

### CarrouselECGModal.jsx
**Ubicación:** `frontend/src/components/teleecgs/CarrouselECGModal.jsx`

```javascript
Props:
- imagenes: TeleECG[]
- onClose: () => void
- indiceInicial: number

Features:
✅ Navegar entre imágenes
✅ Flechas + teclado (arrow keys)
✅ Contador (1/5)
✅ Zoom
✅ Descarga individual
```

---

## 🏗️ Backend Components

### TeleECGController.java
**Ubicación:** `backend/src/main/java/com/styp/cenate/api/TeleECGController.java`

```java
Endpoints:

POST /api/teleekgs/upload-multiple
├─ Request: MultipartFile[], numDocPaciente, etc.
├─ Response: { success, data: [imagenes] }
├─ Permission: @CheckMBACPermission(roles="EXTERNO")
└─ Líneas: ~50

GET /api/teleekgs/listar
├─ Query: page, size, filtros
├─ Response: Page<TeleECGImagenDTO>
├─ Permission: @CheckMBACPermission(roles="EXTERNO")
└─ Líneas: ~40

GET /api/teleekgs/agrupar-por-asegurado
├─ Query: filtros
├─ Response: { data: [pacientes agrupados] }
├─ Permission: @CheckMBACPermission(roles="ADMIN,COORDINADOR_RED")
└─ Líneas: ~40

GET /api/teleekgs/estadisticas
├─ Response: { total, pendientes, observadas, atendidas }
├─ Permission: Public
└─ Líneas: ~30

PUT /api/teleekgs/{id}/evaluar
├─ Request: { resultado, descripcion }
├─ Response: { success }
├─ Permission: @CheckMBACPermission(roles="ADMIN")
└─ Líneas: ~50

GET /api/teleekgs/preview/{id}
├─ Response: imagen base64
├─ Permission: Public
└─ Líneas: ~20
```

### TeleECGService.java
**Ubicación:** `backend/src/main/java/com/styp/cenate/service/teleekgs/TeleECGService.java`

```java
Métodos principales:

+ guardarImagenes(List<MultipartFile>, String): List<TeleECGImagen>
  ├─ Comprime imágenes
  ├─ Convierte a base64
  ├─ Inserta en BD
  └─ Registra auditoría

+ buscarImagenes(filtros): Page<TeleECGImagenDTO>
  ├─ Aplica filtros
  ├─ Pagina resultados
  ├─ Transforma estados
  └─ Retorna DTO

+ agruparPorPaciente(filtros): List<PacienteAgrupado>
  ├─ Group by num_doc_paciente
  ├─ Agrupa imágenes por paciente
  ├─ Transforma estados (CENATE)
  └─ Retorna DTO

+ evaluarImagen(id, resultado, descripcion): void
  ├─ Actualiza estado: ATENDIDA
  ├─ Crea evaluación
  ├─ Registra auditoría
  └─ Emite evento

+ obtenerEstadisticas(): EstadisticasDTO
  ├─ Cuenta por estado
  ├─ Retorna breakdown
  └─ Sin filtros (global)
```

### TeleECGEstadoTransformer.java
**Ubicación:** `backend/src/main/java/com/styp/cenate/service/teleekgs/TeleECGEstadoTransformer.java`

```java
Métodos:

+ transformarEstado(String estadoBD, boolean esExterno): String
  ├─ Si esExterno (IPRESS):
  │  ├─ ENVIADA → ENVIADA ✈️
  │  ├─ OBSERVADA → RECHAZADA ❌
  │  └─ ATENDIDA → ATENDIDA ✅
  └─ Si CENATE:
     ├─ ENVIADA → PENDIENTE ⏳
     ├─ OBSERVADA → OBSERVADA 👁️
     └─ ATENDIDA → ATENDIDA ✅

+ transformarDTOsPorRol(List<TeleECGImagen>, Rol): List<TeleECGImagenDTO>
  └─ Aplica transformación a lista
```

### TeleECGImagenRepository.java
**Ubicación:** `backend/src/main/java/com/styp/cenate/.../TeleECGImagenRepository.java`

```java
Métodos:

+ findByNumDocPaciente(String): List<TeleECGImagen>
+ findByEstado(String): List<TeleECGImagen>
+ findByFechaEnvioBetween(LocalDateTime, LocalDateTime): List<TeleECGImagen>
+ findByNombreIpress(String): List<TeleECGImagen>
+ countByEstado(String): Long
+ deleteByIdImagenAnterior(Long): void
```

### Entidades JPA

#### TeleECGImagen.java
```java
@Entity
@Table(name = "teleecg_imagen")
class TeleECGImagen {
  @Id Long idImagen;
  String numDocPaciente;
  String nombresPaciente;
  String apellidosPaciente;
  String telefonoPaciente;
  String estado;           // ENVIADA, OBSERVADA, ATENDIDA
  String nombreArchivo;
  @Lob String urlImagen;   // base64
  LocalDateTime fechaEnvio;
  String observaciones;
  Long idImagenAnterior;   // FK referencia
  Boolean fueSubsanado;
  String ipressNombre;
  LocalDateTime fechaRecepcion;
}
```

#### TeleECGEvaluacion.java
```java
@Entity
@Table(name = "teleecg_evaluacion")
class TeleECGEvaluacion {
  @Id Long idEvaluacion;
  Long idImagen;           // FK
  String resultado;        // NORMAL, ANORMAL
  String descripcion;
  Long evaluadorId;        // FK
  LocalDateTime fechaEvaluacion;
}
```

---

## 📊 DTOs (Data Transfer Objects)

### TeleECGImagenDTO
```java
class TeleECGImagenDTO {
  Long idImagen;
  String numDocPaciente;
  String nombresPaciente;
  String apellidosPaciente;
  String estado;
  String estadoTransformado;  // Transformado según rol
  String nombreArchivo;
  String ipressNombre;
  LocalDateTime fechaEnvio;
  String observaciones;
  Boolean fueSubsanado;
  Long idImagenAnterior;
}
```

### EstadisticasDTO
```java
class EstadisticasDTO {
  Integer totalImagenesCargadas;
  Integer totalImagenesPendientes;
  Integer totalImagenesRechazadas;
  Integer totalImagenesProcesadas;
}
```

### PacienteAgrupado
```java
class PacienteAgrupado {
  String numDocPaciente;
  String nombresPaciente;
  String apellidosPaciente;
  String telefonoPrincipalPaciente;
  Integer edadPaciente;
  String generoPaciente;
  List<TeleECGImagenDTO> imagenes;
  String estado;           // Estado del último
  LocalDateTime fechaPrimera;  // Fecha primera imagen
}
```

---

## 🔄 Servicios Auxiliares

### TeleecgService.js (Frontend)
```javascript
// API calls
- subirMultiplesImagenes(formData): Promise
- listarImagenes(filtros): Promise
- agruparPorAsegurado(filtros): Promise
- obtenerEstadisticas(): Promise
- evaluarImagen(id, resultado, descripcion): Promise
- obtenerPreview(id): Promise
- exportarExcel(): Promise
```

---

## 📈 Responsabilidades por Capa

### Frontend Layer
```
✅ Validación de entrada
✅ Transformación de datos para display
✅ Manejo de estado local
✅ Navegación y routing
✅ User feedback (toasts, modals)
```

### Backend Layer
```
✅ Autenticación y autorización (JWT + MBAC)
✅ Validación de negocio
✅ Transformación de estados según rol
✅ Persistencia en BD
✅ Auditoría y logging
```

### Database Layer
```
✅ Almacenamiento de imágenes (base64)
✅ Índices para búsqueda rápida
✅ Constraints de integridad
✅ Versionado de imágenes
```

---

**Componentes del Módulo TeleEKG - Completos y Documentados** ✅
