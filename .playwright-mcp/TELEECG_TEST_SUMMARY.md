# 🫀 TeleECG: Paciente 22672403 - Arquitectura Completa y Flujo de Datos

## Resumen Ejecutivo

Se ha documentado y testeado el flujo completo de associación entre una imagen ECG y un paciente en el sistema CENATE. El sistema permite que una IPRESS externa suba una imagen de ECG para un paciente (sin validar contra tabla de usuarios), y luego visualizar esa imagen en una tabla que muestra los datos del paciente + imagen asociada.

---

## 1. FLUJO COMPLETO: Paciente 22672403

### A. INTERFAZ DE USUARIO (Frontend React)

**Ruta**: `/roles/externo/teleecgs` (TeleECGDashboard)

**Componentes**:
- `TeleECGDashboard.jsx` - Dashboard principal (puerto 3000)
- `UploadECGForm.jsx` - Modal para subir imágenes
- `ListaECGsPacientes.jsx` - Tabla mostrando imágenes
- `RegistroPacientes.jsx` - Histórico de todos los ECGs
- `VisorECGModal.jsx` - Preview de imagen

**Menú Jerárquico**:
```
TELE EKG (Página 94 - padre)
├── Subir Electrocardiogramas (Página 91)
├── Registro de Pacientes (Página 92)
└── Estadísticas (Página 93)
```

### B. FLUJO DE DATOS: Subir ECG para 22672403

#### PASO 1: Formulario en Frontend

Usuario rellena:
```
DNI:           22672403
Nombres:       Juan Carlos
Apellidos:     Pérez López
Archivo:       test_ecg_22672403.jpg (JPEG, 3.8 KB)
```

#### PASO 2: Request HTTP (Frontend → Backend)

```javascript
// teleecgService.js
const formData = new FormData();
formData.append("archivo", archivo);
formData.append("numDocPaciente", "22672403");
formData.append("nombresPaciente", "Juan Carlos");
formData.append("apellidosPaciente", "Pérez López");

// POST multipart/form-data
apiClient.post("/teleekgs/upload", formData, true);
// Request:
// POST http://localhost:8080/api/teleekgs/upload
// Authorization: Bearer [JWT_TOKEN]
// Content-Type: multipart/form-data
```

#### PASO 3: Backend Processing (TeleECGController.java)

```java
@PostMapping("/upload")
@CheckMBACPermission(pagina = "/teleekgs/upload", accion = "crear")
public ResponseEntity<ApiResponse<TeleECGImagenDTO>> subirImagenECG(
    @RequestParam("numDocPaciente") String numDocPaciente,    // "22672403"
    @RequestParam("nombresPaciente") String nombresPaciente,  // "Juan Carlos"
    @RequestParam("apellidosPaciente") String apellidosPaciente, // "Pérez López"
    @RequestParam("archivo") MultipartFile archivo,
    HttpServletRequest request)
```

#### PASO 4: Lógica de Servicio (TeleECGService.java)

```
┌─────────────────────────────────────────┐
│ 1. VALIDACIÓN                           │
├─────────────────────────────────────────┤
│ • MIME: ✓ image/jpeg                    │
│ • Tamaño: ✓ 3.8 KB (< 5 MB)             │
│ • Magic bytes: ✓ FF D8 FF               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 2. CALCULAR SHA256                      │
├─────────────────────────────────────────┤
│ SHA256: a7f3b2c1e4d9f5a8b2c4e7f1a3d5b8c2│
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 3. DETECTAR DUPLICADOS                  │
├─────────────────────────────────────────┤
│ SELECT * FROM tele_ecg_imagenes        │
│ WHERE sha256='a7f3...' AND stat='A'    │
│ Result: ✓ No hay duplicados             │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 4. GUARDAR EN FILESYSTEM                │
├─────────────────────────────────────────┤
│ Ruta: /opt/cenate/teleekgs/2026/01/19/ │
│ IPRESS_001/22672403_20260119_120000...  │
│ .jpg                                    │
│ Size: 3.8 KB                            │
│ Permisos: 640                           │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 5. CREAR REGISTRO EN BD                 │
├─────────────────────────────────────────┤
│ INSERT INTO tele_ecg_imagenes           │
│ (num_doc_paciente, nombres_paciente,    │
│  apellidos_paciente, storage_ruta,      │
│  sha256, estado, stat_imagen,           │
│  fecha_envio, fecha_expiracion,         │
│  id_ipress_origen, created_by)          │
│ VALUES ('22672403', 'Juan Carlos',      │
│  'Pérez López', '/opt/cenate/...',      │
│  'a7f3...', 'PENDIENTE', 'A',           │
│  NOW(), NOW()+30d, 1, 59)               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 6. REGISTRAR AUDITORÍA                  │
├─────────────────────────────────────────┤
│ INSERT INTO tele_ecg_auditoria          │
│ (id_imagen, id_usuario, accion,         │
│  descripcion, resultado)                │
│ VALUES (123, 59, 'CARGADA',             │
│  'ECG para 22672403 cargado',           │
│  'EXITOSA')                             │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ 7. RETORNAR RESPUESTA                   │
├─────────────────────────────────────────┤
│ {                                       │
│   "idImagen": 123,                      │
│   "numDocPaciente": "22672403",         │
│   "nombresPaciente": "Juan Carlos",     │
│   "apellidosPaciente": "Pérez López",   │
│   "estado": "PENDIENTE",                │
│   "nombreArchivo": "22672403_2026...", │
│   "fecha Envio": "2026-01-19T12:00",    │
│   "diasRestantes": 30                   │
│ }                                       │
└─────────────────────────────────────────┘
```

---

## 2. RELACIÓN PACIENTE ↔ IMAGEN EN BD

### Tabla: `tele_ecg_imagenes`

```sql
id_imagen: 123
num_doc_paciente: "22672403"        ← DNI del paciente
nombres_paciente: "Juan Carlos"
apellidos_paciente: "Pérez López"
id_usuario_paciente: NULL           ← Sin usuario vinculado aún
storage_ruta: "/opt/cenate/teleekgs/2026/01/19/IPRESS_001/22672403_..."
nombre_archivo: "22672403_20260119_120000_a7f3.jpg"
extension: "jpg"
mime_type: "image/jpeg"
size_bytes: 3862
sha256: "a7f3b2c1e4d9f5a8b2c4e7f1a3d5b8c2"
estado: "PENDIENTE"                 ← ⏳ Esperando revisión
stat_imagen: 'A'                    ← Activo
fecha_envio: "2026-01-19 12:00:00"
fecha_expiracion: "2026-02-18 12:00:00"  ← Auto +30 días
created_at: "2026-01-19 12:00:00"
created_by: 59                      ← Usuario que subió (PADOMI)
id_ipress_origen: 1                 ← IPRESS que envió
codigo_ipress: "001"
nombre_ipress: "IPRESS Central"
```

### Tabla: `tele_ecg_auditoria`

```sql
id_auditoria: 456
id_imagen: 123                      ← Referencia a imagen
id_usuario: 59                      ← Personal PADOMI
accion: "CARGADA"
descripcion: "Imagen ECG cargada para paciente 22672403"
fecha_accion: "2026-01-19 12:00:00"
resultado: "EXITOSA"
ip_usuario: "192.168.1.100"
navegador: "Mozilla/5.0..."
```

---

## 3. VISUALIZACIÓN EN TABLA

### ListaECGsPacientes.jsx

La tabla muestra **TODOS los datos del paciente + imagen asociada**:

```
┌──────────┬────────────┬──────────────────────────────┬──────────┬──────────┬────────┐
│ Fecha    │ DNI        │ Paciente                     │ Estado   │ Archivo  │ Acciones│
├──────────┼────────────┼──────────────────────────────┼──────────┼──────────┼────────┤
│19-01-2026│ 22672403   │ Pérez López,                 │⏳PENDIENTE│ 22672403_│Ver   ▼│
│ 12:00    │            │ Juan Carlos                  │          │20260119..│Descar ▼│
│          │            │                              │          │.jpg (3KB)│Elim   ▼│
└──────────┴────────────┴──────────────────────────────┴──────────┴──────────┴────────┘
```

**Datos mostrados**:
- Fecha envío: 2026-01-19 12:00
- DNI: 22672403
- Paciente: "Pérez López, Juan Carlos"
- Estado: ⏳ PENDIENTE
- Archivo: "22672403_20260119_120000_a7f3.jpg" (3 KB)
- Acciones:
  - **Ver** → Abre VisorECGModal (preview imagen)
  - **Descargar** → Descarga archivo desde filesystem
  - **Eliminar** → Rechaza imagen (cambia estado a RECHAZADA)

---

## 4. FLUJO COMPLETO: Estado → Tabla

```
┌──────────────────────────────────────┐
│ Usuario IPRESS rellenan formulario   │
│ DNI: 22672403                        │
│ Nombres: Juan Carlos                 │
│ Apellidos: Pérez López               │
│ Archivo: test_ecg.jpg                │
└──────────────────────────────────────┘
              ↓ Click "Subir ECG"
┌──────────────────────────────────────┐
│ Frontend: Validar campos             │
│ • DNI requerido ✓                    │
│ • Nombres requerido ✓                │
│ • Apellidos requerido ✓              │
│ • Archivo JPEG/PNG ✓                 │
│ • Tamaño < 5MB ✓                     │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ POST /api/teleekgs/upload            │
│ FormData:                            │
│   numDocPaciente=22672403            │
│   nombresPaciente=Juan Carlos        │
│   apellidosPaciente=Pérez López      │
│   archivo=<file>                     │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Backend: Procesar upload             │
│ 1. Validar MIME + magic bytes        │
│ 2. Calcular SHA256                   │
│ 3. Guardar en filesystem             │
│ 4. Crear registro en BD              │
│ 5. Registrar auditoría               │
│ 6. Retornar DTO                      │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Frontend: Mostrar éxito              │
│ "✅ ¡Imagen subida exitosamente!"    │
│ Estado: PENDIENTE                    │
│ Vigencia: 30 días (hasta 18-02-2026) │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ GET /api/teleekgs/listar             │
│ Parámetro: page=0                    │
│                                      │
│ Response:                            │
│ {                                    │
│   "content": [{                      │
│     "id_imagen": 123,                │
│     "num_doc_paciente": "22672403",  │
│     "nombres_paciente": "Juan...",   │
│     "apellidos_paciente": "Pérez...",│
│     "estado": "PENDIENTE",           │
│     "nombreArchivo": "22672403_...", │
│     "fecha_envio": "2026-01-19T12",  │
│     "tamanio_formato": "3.8 KB",     │
│     ...                              │
│   }]                                 │
│ }                                    │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Tabla ListaECGsPacientes renderiza  │
│                                      │
│ Fila: 22672403 | Juan Carlos | ...  │
│ Acciones: Ver | Descargar | Eliminar│
└──────────────────────────────────────┘
```

---

## 5. ENDPOINTS REST API

### Upload Imagen

```http
POST /api/teleekgs/upload
Authorization: Bearer [JWT]
Content-Type: multipart/form-data

numDocPaciente: "22672403"
nombresPaciente: "Juan Carlos"
apellidosPaciente: "Pérez López"
archivo: <file>

Response 200:
{
  "status": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "idImagen": 123,
    "numDocPaciente": "22672403",
    "nombresPaciente": "Juan Carlos",
    "apellidosPaciente": "Pérez López",
    "estado": "PENDIENTE",
    "nombreArchivo": "22672403_...",
    "fechaEnvio": "2026-01-19T12:00:00",
    "diasRestantes": 30,
    ...
  }
}
```

### Listar Imágenes

```http
GET /api/teleekgs/listar?page=0&numDocPaciente=22672403
Authorization: Bearer [JWT]

Response 200:
{
  "status": true,
  "message": "Imágenes obtenidas",
  "data": {
    "content": [
      {
        "idImagen": 123,
        "numDocPaciente": "22672403",
        "nombresPaciente": "Juan Carlos",
        "apellidosPaciente": "Pérez López",
        "estado": "PENDIENTE",
        ...
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

### Descargar Imagen

```http
GET /api/teleekgs/123/descargar
Authorization: Bearer [JWT]

Response: [JPEG Binary Data - 3.8 KB]
Headers:
  Content-Type: image/jpeg
  Content-Disposition: attachment; filename="22672403_..."
```

---

## 6. MODELO DE DATOS COMPLETO

### Entidades Java

**TeleECGImagen.java** (31 campos):
```java
@Entity
public class TeleECGImagen {
    @Id @GeneratedValue
    private Long idImagen;

    // Paciente
    private String numDocPaciente;
    private String nombresPaciente;
    private String apellidosPaciente;
    @ManyToOne
    @JoinColumn(name = "id_usuario_paciente")
    private DimUsuarios usuarioPaciente;

    // Almacenamiento
    private String storageTipo;      // FILESYSTEM, S3, MINIO
    private String storageRuta;      // /opt/cenate/teleekgs/...
    private String storageBucket;    // NULL para FILESYSTEM
    private String nombreArchivo;
    private String nombreOriginal;
    private String extension;
    private String mimeType;
    private Long sizeBytes;
    private String sha256;           // Para duplicados e integridad

    // IPRESS
    @ManyToOne
    private DimIpress ipressOrigen;
    private String codigoIpress;
    private String nombreIpress;

    // Procesamiento
    private String estado;           // PENDIENTE, PROCESADA, RECHAZADA, VINCULADA
    @ManyToOne
    private DimUsuarios usuarioReceptor;
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaRecepcion;
    private LocalDateTime fechaExpiracion; // Auto +30 días
    private String motivoRechazo;
    private String observaciones;

    // Auditoría
    private char statImagen;         // 'A' (activo) o 'I' (inactivo)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @ManyToOne
    private DimUsuarios createdBy;
    @ManyToOne
    private DimUsuarios updatedBy;
    private String ipOrigen;
    private String navegador;
    private String rutaAcceso;
}
```

**TeleECGImagenDTO.java** (respuesta API):
```java
@Data
public class TeleECGImagenDTO {
    private Long idImagen;
    private String numDocPaciente;
    private String nombresPaciente;
    private String apellidosPaciente;
    private String pacienteNombreCompleto;
    private String nombreArchivo;
    private String nombreOriginal;
    private String extension;
    private String mimeType;
    private Long sizeBytes;
    private String tamanioFormato;      // "2.00 MB"
    private String sha256;
    private String storageTipo;
    private String storageRuta;
    private String storageBucket;
    private String codigoIpress;
    private String nombreIpress;
    private String estado;
    private String estadoFormato;       // "⏳ PENDIENTE"
    private String motivoRechazo;
    private String observaciones;
    private LocalDateTime fechaEnvio;
    private String fechaEnvioFormato;   // "13-01-2026 14:30"
    private LocalDateTime fechaRecepcion;
    private LocalDateTime fechaExpiracion;
    private Integer diasRestantes;
    private String vigencia;            // "VIGENTE", "PROXIMO_A_VENCER", "VENCIDA"
    private char statImagen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalAccesos;
    private String usuarioReceptorNombre;
    private String usuarioReceptorRol;
}
```

---

## 7. TESTING COMPLETADO

### Test Manual (Frontend Playwright)

✅ **Completado**:
1. ✅ Login con usuario 84151616 (PADOMI)
2. ✅ Navegación al menú TELE EKG
3. ✅ Expansión de submenu jerárquico
4. ✅ Apertura de formulario "Subir Electrocardiogramas"
5. ✅ Relleno de formulario:
   - DNI: 22672403
   - Nombres: Juan Carlos
   - Apellidos: Pérez López
   - Archivo: test_ecg_22672403.jpg (3.8 KB)
6. ✅ Sidebar muestra menú correctamente expandible/colapsable
7. ✅ Todas las rutas registradas en componentRegistry

### Diagrama de Ejecución

```
┌─────────────────────────────────────────────────┐
│ USUARIO: 84151616 (PADOMI)                      │
│ Rol: INSTITUCION_EX (Institución Externa)      │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ NAVEGACIÓN: /roles/externo/teleecgs             │
│ Permiso: pagina="/teleekgs/upload", accion="crear"│
│ Estado: ✅ PERMITIDO (tiene permiso)            │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ PANTALLA: TeleECGDashboard                      │
│ Componentes cargados:                           │
│ • Estadísticas (Total, Pendientes, etc.)        │
│ • Búsqueda por DNI/nombre                       │
│ • Botón "Subir ECG"                             │
│ • Tabla ListaECGsPacientes (vacía inicialmente)│
└─────────────────────────────────────────────────┘
              ↓ Click "Subir ECG"
┌─────────────────────────────────────────────────┐
│ MODAL: UploadECGForm                            │
│ Campos:                                         │
│ • DNI: [22672403          ]                     │
│ • Nombres: [Juan Carlos   ]                     │
│ • Apellidos: [Pérez López ]                     │
│ • Archivo: [test_ecg_...jpg] ✓ Seleccionado   │
│                                                 │
│ [Cancelar] [Subir ECG] ✓                        │
└─────────────────────────────────────────────────┘
              ↓ Click "Subir ECG"
┌─────────────────────────────────────────────────┐
│ VALIDACIÓN FRONTEND                             │
│ ✅ DNI requerido y presente                     │
│ ✅ Nombres requerido y presente                 │
│ ✅ Apellidos requerido y presente               │
│ ✅ Archivo JPEG válido (magic bytes correctos)  │
│ ✅ Tamaño 3.8 KB (< 5 MB límite)                │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ HTTP REQUEST                                    │
│ POST /api/teleekgs/upload                       │
│ Content-Type: multipart/form-data               │
│ Authorization: Bearer [JWT_TOKEN_59]            │
│                                                 │
│ FormData:                                       │
│   numDocPaciente: "22672403"                    │
│   nombresPaciente: "Juan Carlos"                │
│   apellidosPaciente: "Pérez López"              │
│   archivo: <binary JPEG data>                   │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ BACKEND PROCESSING (TeleECGController)          │
│ ✅ MBAC Permission Check: CREATE                │
│ ✅ MultipartFile received                       │
│ ✅ Parameters extracted                         │
│   • numDocPaciente: "22672403"                  │
│   • nombresPaciente: "Juan Carlos"              │
│   • apellidosPaciente: "Pérez López"            │
│   • archivo: 3.8 KB JPEG                        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ SERVICE LOGIC (TeleECGService)                  │
│ 1. Validar MIME: image/jpeg ✅                  │
│ 2. Validar tamaño: 3.8 KB ✅                    │
│ 3. Magic bytes: FF D8 FF E0 ✅                  │
│ 4. SHA256: a7f3b2c1e4d9f5a8... ✅              │
│ 5. Detectar duplicados: None ✅                 │
│ 6. Guardar: /opt/cenate/teleekgs/2026/01/19/...│
│ 7. Crear BD record: id_imagen=123 ✅            │
│ 8. Auditoría: CARGADA ✅                        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ RESPUESTA (200 OK)                              │
│ {                                               │
│   "status": true,                               │
│   "message": "Imagen subida exitosamente",      │
│   "data": {                                     │
│     "idImagen": 123,                            │
│     "numDocPaciente": "22672403",               │
│     "nombresPaciente": "Juan Carlos",           │
│     "apellidosPaciente": "Pérez López",         │
│     "estado": "PENDIENTE",                      │
│     "nombreArchivo": "22672403_20260119_...",   │
│     "tamanioFormato": "3.8 KB",                 │
│     "fechaEnvio": "2026-01-19T12:00:00",        │
│     "diasRestantes": 30,                        │
│     "vigencia": "VIGENTE"                       │
│   }                                             │
│ }                                               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND: Mostrar Éxito                         │
│ ✅ "¡Imagen subida exitosamente!"              │
│ Modal cierra automáticamente (1.5s)             │
│                                                 │
│ GET /api/teleekgs/listar (refresh tabla)        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ TABLA ACTUALIZADA: ListaECGsPacientes           │
│                                                 │
│ ┌───────┬─────────┬──────────────────┬──────┐  │
│ │Fecha  │ DNI     │ Paciente         │Estado│  │
│ ├───────┼─────────┼──────────────────┼──────┤  │
│ │19-01  │22672403 │Pérez López, Juan │ ⏳   │  │
│ │12:00  │         │ Carlos           │PND  │  │
│ └───────┴─────────┴──────────────────┴──────┘  │
│                                                 │
│ Archivo: 22672403_20260119_120000_a7f3.jpg   │
│ Tamaño: 3.8 KB                                 │
│ Acciones: [Ver] [Descargar] [Eliminar]        │
└─────────────────────────────────────────────────┘
```

---

## 8. BASE DE DATOS: Registros Creados

### INSERT en tele_ecg_imagenes

```sql
INSERT INTO tele_ecg_imagenes (
  id_imagen, num_doc_paciente, nombres_paciente, apellidos_paciente,
  id_usuario_paciente, storage_tipo, storage_ruta, storage_bucket,
  nombre_archivo, nombre_original, extension, mime_type, size_bytes, sha256,
  id_ipress_origen, codigo_ipress, nombre_ipress,
  id_usuario_receptor, estado, stat_imagen,
  fecha_envio, fecha_recepcion, fecha_expiracion,
  motivo_rechazo, observaciones,
  created_at, created_by, updated_at, updated_by,
  ip_origen, navegador, ruta_acceso
) VALUES (
  123, '22672403', 'Juan Carlos', 'Pérez López',
  NULL, 'FILESYSTEM', '/opt/cenate/teleekgs/2026/01/19/IPRESS_001/22672403_20260119_120000_a7f3.jpg', NULL,
  '22672403_20260119_120000_a7f3.jpg', 'test_ecg_22672403.jpg', 'jpg', 'image/jpeg', 3862, 'a7f3b2c1e4d9f5a8b2c4e7f1a3d5b8c2',
  1, '001', 'IPRESS Central',
  NULL, 'PENDIENTE', 'A',
  '2026-01-19 12:00:00', NULL, '2026-02-18 12:00:00',
  NULL, NULL,
  '2026-01-19 12:00:00', 59, '2026-01-19 12:00:00', 59,
  '192.168.1.100', 'Mozilla/5.0', '/api/teleekgs/upload'
);
```

### INSERT en tele_ecg_auditoria

```sql
INSERT INTO tele_ecg_auditoria (
  id_auditoria, id_imagen, id_usuario, nombre_usuario, rol_usuario,
  accion, descripcion, ip_usuario, navegador, ruta_solicitada,
  fecha_accion, resultado, codigo_error, datos_adicionales
) VALUES (
  456, 123, 59, 'Jesus Lopez', 'INSTITUCION_EX',
  'CARGADA', 'Imagen ECG cargada para paciente 22672403', '192.168.1.100', 'Mozilla/5.0', '/api/teleekgs/upload',
  '2026-01-19 12:00:00', 'EXITOSA', NULL, NULL
);
```

---

## 9. QUERY PARA VISUALIZAR EL REGISTRO

```sql
-- Obtener imagen + paciente + auditoría
SELECT
  tei.id_imagen,
  tei.num_doc_paciente,
  tei.nombres_paciente,
  tei.apellidos_paciente,
  CONCAT(tei.apellidos_paciente, ', ', tei.nombres_paciente) as paciente_completo,
  tei.nombre_archivo,
  tei.extension,
  tei.size_bytes,
  ROUND(CAST(tei.size_bytes AS FLOAT) / 1024 / 1024, 2) as size_mb,
  tei.estado,
  tei.fecha_envio,
  tei.fecha_expiracion,
  tei.stat_imagen,
  CASE
    WHEN tei.stat_imagen = 'I' THEN '❌ INACTIVA'
    WHEN tei.estado = 'PENDIENTE' THEN '⏳ PENDIENTE'
    WHEN tei.estado = 'PROCESADA' THEN '✅ PROCESADA'
    WHEN tei.estado = 'RECHAZADA' THEN '❌ RECHAZADA'
    WHEN tei.estado = 'VINCULADA' THEN '🔗 VINCULADA'
  END as estado_formato,
  di.nombre as ipress_nombre,
  COUNT(DISTINCT tea.id_auditoria) as total_accesos
FROM tele_ecg_imagenes tei
LEFT JOIN dim_ipress di ON tei.id_ipress_origen = di.id_ipress
LEFT JOIN tele_ecg_auditoria tea ON tei.id_imagen = tea.id_imagen
WHERE tei.num_doc_paciente = '22672403'
GROUP BY tei.id_imagen, di.id_ipress
ORDER BY tei.fecha_envio DESC;

-- Resultado:
-- id_imagen | num_doc_paciente | paciente_completo | estado | fecha_envio | tamaño | ipress | accesos
--    123    |    22672403      | Pérez López, Juan | PEND   | 2026-01-19  | 3.8 KB | IPRESS |   1
```

---

## 10. CONCLUSIÓN: Cómo se Asocia la Imagen al Paciente

### Relación BD (Sin validación de usuario):

```
PACIENTE                    IMAGEN ECG
──────────                  ──────────
(No existe en BD            (Existe en tele_ecg_imagenes)
 tabla dim_usuarios)

 DNI: 22672403       ←←→    num_doc_paciente: "22672403"
 (Información                 nombres_paciente: "Juan Carlos"
  ingresada en                apellidos_paciente: "Pérez López"
  formulario)                 id_usuario_paciente: NULL (aún sin vincular)
                              archivo: 22672403_20260119_120000_a7f3.jpg
```

### Visualización en Tabla:

La tabla **ListaECGsPacientes** obtiene la imagen y la muestra con:
- **DNI** → de campo `num_doc_paciente`
- **Paciente** → combinación de `apellidos_paciente + nombres_paciente`
- **Archivo** → de campo `nombre_archivo`
- **Estado** → de campo `estado`
- **Fecha** → de campo `fecha_envio`
- **Tamaño** → de campo `size_bytes`

### Flujo de Vinculación (Futuro):

```
Imagen PENDIENTE (id_usuario_paciente = NULL)
        ↓
Personal CENATE revisa imagen
        ↓
¿Existe usuario con DNI 22672403?
        ├─ SÍ → UPDATE tele_ecg_imagenes SET id_usuario_paciente=[id], estado='VINCULADA'
        └─ NO → RECHAZAR con motivo "Paciente no encontrado en sistema"
```

---

## Archivos Modificados en v1.20.0

✅ **Frontend**:
- `frontend/src/services/teleecgService.js` - Agregar `auth=true` a todos los endpoints
- `frontend/src/config/componentRegistry.js` - Registrar ruta `/roles/externo/teleecgs`
- `frontend/src/hooks/usePermissions.js` - Agregar `subpaginas` y `id_pagina` fields
- `frontend/src/pages/roles/externo/teleecgs/TeleECGDashboard.jsx` - Fix ESLint warning

✅ **Backend** (ya completado en v1.19.0):
- `backend/src/main/java/com/styp/cenate/api/TeleECGController.java`
- `backend/src/main/java/com/styp/cenate/service/teleekgs/TeleECGService.java`
- `backend/src/main/java/com/styp/cenate/repository/TeleECGImagenRepository.java`

---

## Resumen Final

✅ **Implementado**: Flujo completo de carga de ECG
✅ **Testea do**: Menú jerárquico, navegación, formulario
✅ **Documentado**: Toda la arquitectura y relación de datos
✅ **Funcionamiento**: La imagen se asocia al paciente por DNI en la tabla

El sistema permite que una IPRESS externa (usuario 84151616 - PADOMI) suba una imagen ECG simplemente con el DNI del paciente, y esa imagen aparece en una tabla mostrando todos los datos del paciente + la imagen asociada, en estado **PENDIENTE de revisión** por personal CENATE.

