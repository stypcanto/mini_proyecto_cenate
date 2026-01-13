# 📋 ANÁLISIS TÉCNICO: Módulo TeleEKG

**Versión:** 1.0.0
**Fecha:** 2026-01-13
**Estado:** 🔵 En Análisis
**Módulo Padre:** Gestión de Personal Externo
**Rol Responsable:** Architect

---

## 📌 PROBLEMA

**Requerimiento:**
- Una IPRESS externa necesita enviar imágenes de **electrocardiogramas (ECG)** en formato JPEG o PNG
- Las imágenes deben vincularse automáticamente con **pacientes por DNI**
- El sistema CENATE debe servir como **repositorio centralizado** de imágenes ECG
- Funcionalidad adicional: posterior atención médica basada en las imágenes ECG

**Actores:**
- 🏥 IPRESS Externa (envía imágenes)
- 👨‍⚕️ Personal CENATE (revisa, atiende)
- 👤 Paciente (identificado por DNI)

**Restricciones:**
- Imágenes JPEG/PNG únicamente
- Vinculación por DNI (puede existir o no en sistema)
- Soporte para múltiples imágenes por paciente
- Seguridad: solo personal autorizado puede ver/descargar imágenes

---

## 🏗️ IMPACTO ARQUITECTURAL

### Backend - Spring Boot

#### 1. Nuevas Entidades JPA

```java
// TeleEKG - Imagen ECG
@Entity
@Table(name = "tele_ecg_imagenes")
public class TeleECGImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idImagen;           // PK

    @Column(name = "num_doc_paciente", nullable = false)
    private String numDocPaciente;   // DNI - puede no estar en sistema

    @Column(name = "nombres_paciente")
    private String nombresPaciente;  // Capturado en el envío

    @Column(name = "apellidos_paciente")
    private String apellidosPaciente;

    @ManyToOne
    @JoinColumn(name = "id_usuario_paciente", nullable = true)
    private Usuario usuarioPaciente; // FK a usuario (si existe)

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;    // ej: paciente_12345678_20260113_001.jpg

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;      // /app/uploads/teleekgs/2026-01/...

    @Column(name = "tipo_contenido", nullable = false)
    private String tipoContenido;    // image/jpeg, image/png

    @Column(name = "tamanio_bytes")
    private Long tamanioByt es;      // Tamaño en bytes

    @Column(name = "hash_archivo")
    private String hashArchivo;      // SHA256 para integridad

    @ManyToOne
    @JoinColumn(name = "id_ipress_origen", nullable = false)
    private Ipress ipressOrigen;     // IPRESS que envió

    @ManyToOne
    @JoinColumn(name = "id_usuario_receptor", nullable = true)
    private Usuario usuarioReceptor; // Personal CENATE que recibió

    @Column(name = "fecha_envio", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEnvio;         // Cuándo llegó la imagen

    @Column(name = "fecha_recepcion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaRecepcion;     // Cuándo se procesó

    @Column(name = "estado", nullable = false)
    private String estado;           // PENDIENTE, PROCESADA, RECHAZADA

    @Column(name = "observaciones")
    private String observaciones;    // Notas del personal CENATE

    @Column(name = "stat_imagen", nullable = false)
    private String statImagen;       // A=Activo, I=Inactivo

    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}

// Registro de Auditoría para TeleEKG
@Entity
@Table(name = "tele_ecg_auditoria")
public class TeleECGAuditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAudit;

    @ManyToOne
    @JoinColumn(name = "id_imagen")
    private TeleECGImagen imagen;

    @Column(name = "usuario")
    private String usuario;          // Quién accedió

    @Column(name = "accion")
    private String accion;           // DESCARGO, VIO, COMPARTIO, RECHAZÓ

    @Column(name = "ip_origen")
    private String ipOrigen;

    @Column(name = "fecha_accion", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaAccion;
}
```

#### 2. Controllers REST

```java
@RestController
@RequestMapping("/api/teleekgs")
@PreAuthorize("hasAnyRole('INSTITUCION_EX', 'MEDICO', 'ADMIN')")
public class TeleECGController {

    // Para IPRESS externa: Subir imagen
    @PostMapping("/upload")
    @PreAuthorize("hasRole('INSTITUCION_EX')")
    public ResponseEntity<?> subirImagenECG(
        @RequestParam("archivo") MultipartFile archivo,
        @RequestParam("numDocPaciente") String numDoc,
        @RequestParam("nombresPaciente") String nombres,
        @RequestParam("apellidosPaciente") String apellidos
    ) { }

    // Para Personal CENATE: Listar imágenes
    @GetMapping("/listar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> listarImagenes(
        @RequestParam(required = false) String numDocPaciente,
        @RequestParam(required = false, defaultValue = "0") int page
    ) { }

    // Para Personal CENATE: Descargar imagen
    @GetMapping("/{idImagen}/descargar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> descargarImagen(@PathVariable Long idImagen) { }

    // Para Personal CENATE: Ver detalles
    @GetMapping("/{idImagen}/detalles")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> obtenerDetalles(@PathVariable Long idImagen) { }

    // Para Personal CENATE: Procesar/aceptar imagen
    @PutMapping("/{idImagen}/procesar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> procesarImagen(
        @PathVariable Long idImagen,
        @RequestBody ProcesarImagenDTO dto
    ) { }

    // Para Personal CENATE: Rechazar imagen
    @PutMapping("/{idImagen}/rechazar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> rechazarImagen(
        @PathVariable Long idImagen,
        @RequestBody String motivo
    ) { }

    // Para Personal CENATE: Vincular con paciente registrado
    @PutMapping("/{idImagen}/vincular-paciente")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> vincularConPaciente(
        @PathVariable Long idImagen,
        @RequestBody VincularPacienteDTO dto
    ) { }

    // Estadísticas
    @GetMapping("/estadisticas/resumen")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> obtenerEstadisticas() { }
}
```

#### 3. Services (Capa de Aplicación)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TeleECGService {

    private final TeleECGImagenRepository imagenRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioRepository usuarioRepository;
    private final StorageService storageService;      // Servicio de almacenamiento
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    // Configuración
    @Value("${app.teleecg.upload-dir:/app/uploads/teleekgs}")
    private String uploadDir;

    @Value("${app.teleecg.max-file-size:10485760}") // 10MB
    private Long maxFileSize;

    /**
     * Subir imagen ECG desde IPRESS externa
     */
    @Transactional
    public TeleECGImagenDTO subirImagenECG(MultipartFile archivo, String numDoc,
                                           String nombres, String apellidos) {

        // 1. Validar archivo
        validarArchivo(archivo);

        // 2. Obtener IPRESS origen (desde contexto de seguridad)
        Usuario usuarioActual = obtenerUsuarioActual();
        Ipress ipressOrigen = usuarioActual.getPersonalCnt().getIpress();

        // 3. Generar nombre único y almacenar archivo
        String nombreArchivo = generarNombreArchivo(numDoc);
        String rutaArchivo = storageService.guardarArchivo(archivo, uploadDir + "/nuevas");
        String hashArchivo = calcularHash(archivo);

        // 4. Crear registro en BD
        TeleECGImagen imagen = TeleECGImagen.builder()
            .numDocPaciente(numDoc)
            .nombresPaciente(nombres)
            .apellidosPaciente(apellidos)
            .nombreArchivo(nombreArchivo)
            .rutaArchivo(rutaArchivo)
            .tipoContenido(archivo.getContentType())
            .tamanioByte s(archivo.getSize())
            .hashArchivo(hashArchivo)
            .ipressOrigen(ipressOrigen)
            .usuarioReceptor(null)
            .fechaEnvio(new Date())
            .estado("PENDIENTE")
            .statImagen("A")
            .build();

        imagen = imagenRepository.save(imagen);

        // 5. Auditoría
        auditLogService.registrarEvento(
            usuarioActual.getNameUser(),
            "UPLOAD_ECG",
            "TELEEKGS",
            "Imagen ECG subida - Paciente: " + numDoc,
            "INFO",
            "SUCCESS"
        );

        // 6. Notificar a CENATE (email)
        notificarNuevaImagenECG(imagen);

        return convertirADTO(imagen);
    }

    /**
     * Listar imágenes ECG (con filtros)
     */
    @Transactional(readOnly = true)
    public Page<TeleECGImagenDTO> listarImagenes(String numDocPaciente, int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("fechaEnvio").descending());

        Page<TeleECGImagen> imagenes;
        if (numDocPaciente != null && !numDocPaciente.isBlank()) {
            imagenes = imagenRepository.findByNumDocPacienteAndStatImagen(
                numDocPaciente, "A", pageable);
        } else {
            imagenes = imagenRepository.findByStatImagen("A", pageable);
        }

        return imagenes.map(this::convertirADTO);
    }

    /**
     * Descargar imagen (con auditoría)
     */
    public byte[] descargarImagen(Long idImagen) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Auditoría
        registrarAcceso(imagen, "DESCARGO");

        return storageService.leerArchivo(imagen.getRutaArchivo());
    }

    /**
     * Procesar imagen (aceptar)
     */
    @Transactional
    public TeleECGImagenDTO procesarImagen(Long idImagen, String observaciones) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        imagen.setEstado("PROCESADA");
        imagen.setObservaciones(observaciones);
        imagen.setFechaRecepcion(new Date());
        imagen.setUsuarioReceptor(obtenerUsuarioActual());

        imagen = imagenRepository.save(imagen);

        // Auditoría
        registrarAcceso(imagen, "PROCESO");

        return convertirADTO(imagen);
    }

    // Métodos privados...
    private void validarArchivo(MultipartFile archivo) { }
    private String generarNombreArchivo(String numDoc) { }
    private String calcularHash(MultipartFile archivo) { }
    private void notificarNuevaImagenECG(TeleECGImagen imagen) { }
    private void registrarAcceso(TeleECGImagen imagen, String accion) { }
    private TeleECGImagenDTO convertirADTO(TeleECGImagen imagen) { }
    private Usuario obtenerUsuarioActual() { }
}
```

#### 4. Repositories

```java
@Repository
public interface TeleECGImagenRepository extends JpaRepository<TeleECGImagen, Long> {

    Page<TeleECGImagen> findByNumDocPacienteAndStatImagen(
        String numDoc, String stat, Pageable pageable);

    Page<TeleECGImagen> findByStatImagen(String stat, Pageable pageable);

    Page<TeleECGImagen> findByEstado(String estado, Pageable pageable);

    Page<TeleECGImagen> findByIpressOrigeAndFechaBetween(
        Ipress ipress, Date inicio, Date fin, Pageable pageable);

    Long countByEstado(String estado);

    Long countByIpressOrigen(Ipress ipress);
}

@Repository
public interface TeleECGAuditoriaRepository extends JpaRepository<TeleECGAuditoria, Long> {
    List<TeleECGAuditoria> findByImagenOrderByFechaAccionDesc(TeleECGImagen imagen);
}
```

### Frontend - React

#### 1. Nuevas Páginas/Componentes

```
src/pages/teleekgs/
├── TeleEKGDashboard.jsx              # Página principal
├── UploadImagenECG.jsx               # Formulario upload (IPRESS)
├── ListarImagenesECG.jsx             # Listado de imágenes (CENATE)
├── VisorImagenECG.jsx                # Visor de imágenes
├── DetallesImagenECG.jsx             # Detalles y procesamiento
└── EstadisticasTeleEKG.jsx           # Dashboard de estadísticas
```

#### 2. Flujos de React

```javascript
// Para IPRESS Externa:
// 1. Navegación → Gestión Personal Externo → Envío ECG
// 2. Formulario con:
//    - Seleccionar archivo (JPEG/PNG)
//    - DNI del paciente
//    - Nombres y apellidos
//    - Enviar
// 3. Confirmación de envío exitoso

// Para Personal CENATE:
// 1. Navegación → Módulo Médico → TeleEKG
// 2. Listado de imágenes pendientes
// 3. Click en imagen → visor + opciones:
//    - Aceptar (cambiar estado a PROCESADA)
//    - Rechazar (con motivo)
//    - Vincular a paciente registrado
//    - Descargar original
// 4. Historial/auditoría de accesos
```

### Base de Datos - PostgreSQL

#### 1. Script de Creación de Tablas

```sql
-- ============================================================
-- MÓDULO TELEEKGS - Repositorio de Electrocardiogramas
-- ============================================================

-- Tabla principal de imágenes ECG
CREATE TABLE tele_ecg_imagenes (
    id_imagen SERIAL PRIMARY KEY,
    num_doc_paciente VARCHAR(20) NOT NULL,          -- DNI (puede no estar en sistema)
    nombres_paciente VARCHAR(100),
    apellidos_paciente VARCHAR(150),
    id_usuario_paciente BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,
    id_ipress_origen BIGINT NOT NULL REFERENCES dim_ipress(id_ipress),
    id_usuario_receptor BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_contenido VARCHAR(50) NOT NULL,            -- image/jpeg, image/png
    tamanio_bytes BIGINT,
    hash_archivo VARCHAR(64),                       -- SHA256
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, PROCESADA, RECHAZADA
    observaciones TEXT,
    stat_imagen CHAR(1) NOT NULL DEFAULT 'A',      -- A=Activo, I=Inactivo
    fecha_envio TIMESTAMP NOT NULL,
    fecha_recepcion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Índices
    INDEX idx_num_doc (num_doc_paciente),
    INDEX idx_estado (estado),
    INDEX idx_ipress_origen (id_ipress_origen),
    INDEX idx_fecha_envio (fecha_envio DESC),
    INDEX idx_id_usuario_paciente (id_usuario_paciente)
);

-- Tabla de auditoría para TeleEKG
CREATE TABLE tele_ecg_auditoria (
    id_audit SERIAL PRIMARY KEY,
    id_imagen BIGINT NOT NULL REFERENCES tele_ecg_imagenes(id_imagen),
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,                    -- DESCARGO, VIO, PROCESO, RECHAZÓ
    ip_origen VARCHAR(45),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Índices
    INDEX idx_id_imagen (id_imagen),
    INDEX idx_usuario (usuario),
    INDEX idx_accion (accion),
    INDEX idx_fecha_accion (fecha_accion DESC)
);

-- Tabla de estadísticas (para dashboard)
CREATE TABLE tele_ecg_estadisticas (
    id_stat SERIAL PRIMARY KEY,
    id_ipress BIGINT REFERENCES dim_ipress(id_ipress),
    fecha_stat DATE NOT NULL,
    imagenes_subidas INT DEFAULT 0,
    imagenes_procesadas INT DEFAULT 0,
    imagenes_rechazadas INT DEFAULT 0,
    imagenes_pendientes INT DEFAULT 0,
    tamanio_total_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permisos en MBAC (añadir a tabla permisos_modulares)
-- Módulo: TELEEKGS (nuevo)
-- Página: Envío de ECG (para IPRESS)
-- Página: Administración de ECG (para CENATE)
-- Página: Dashboard TeleEKG (para ADMIN)
```

#### 2. Índices Estratégicos

```sql
-- Búsqueda por DNI (frecuente)
CREATE INDEX idx_tele_ecg_num_doc ON tele_ecg_imagenes(num_doc_paciente, stat_imagen);

-- Búsqueda por estado
CREATE INDEX idx_tele_ecg_estado ON tele_ecg_imagenes(estado, fecha_envio DESC);

-- Búsqueda por IPRESS origen
CREATE INDEX idx_tele_ecg_ipress ON tele_ecg_imagenes(id_ipress_origen, fecha_envio DESC);

-- Limpieza de imágenes antiguas
CREATE INDEX idx_tele_ecg_fecha ON tele_ecg_imagenes(fecha_envio);
```

---

## 💡 PROPUESTA DE SOLUCIÓN

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    CENATE - TeleEKG                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  IPRESS Externa         CENATE (Personal)                   │
│  ┌──────────────┐       ┌──────────────────────┐             │
│  │ Envío ECG    │──────▶│ Gestión de Imágenes  │             │
│  │ (formulario) │       │ (procesamiento)      │             │
│  └──────────────┘       └──────────────────────┘             │
│                                 │                            │
│                                 ▼                            │
│                         ┌──────────────────┐                │
│                         │ Vinculación DNI  │                │
│                         │ (paciente)       │                │
│                         └──────────────────┘                │
│                                 │                            │
│                                 ▼                            │
│                         ┌──────────────────┐                │
│                         │ BD + Storage     │                │
│                         │ (imágenes)       │                │
│                         └──────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Flujos de Datos

#### Flujo 1: Envío de ECG desde IPRESS

```
IPRESS Externa
    ▼
POST /api/teleekgs/upload
    ├─ Archivo (JPEG/PNG)
    ├─ DNI Paciente
    ├─ Nombres/Apellidos
    └─ Auth (JWT)
    ▼
TeleECGService.subirImagenECG()
    ├─ Validar archivo (tipo, tamaño)
    ├─ Generar nombre único
    ├─ Almacenar en /app/uploads/teleekgs/nuevas/
    ├─ Calcular hash (integridad)
    ├─ Crear registro BD (estado=PENDIENTE)
    ├─ Registrar en auditoría
    └─ Notificar por email
    ▼
Response 200 OK
{
  "id": 123,
  "estado": "PENDIENTE",
  "fecha": "2026-01-13T10:30:00Z"
}
```

#### Flujo 2: Procesamiento en CENATE

```
Personal CENATE
    ▼
GET /api/teleekgs/listar (filtrar por DNI)
    ▼
Listar imágenes pendientes
    ├─ Paginación (20 por página)
    ├─ Filtros por DNI, estado, fecha
    └─ Mostrar IPRESS origen
    ▼
Click en imagen
    ▼
GET /api/teleekgs/{id}/detalles
    ├─ Cargar imagen (preview)
    ├─ Mostrar metadata
    └─ Mostrar auditoría de accesos
    ▼
Decisión:
├─ Aceptar → PUT /api/teleekgs/{id}/procesar
├─ Rechazar → PUT /api/teleekgs/{id}/rechazar
└─ Vincular → PUT /api/teleekgs/{id}/vincular-paciente
    ▼
Registrar en auditoría + Cambiar estado
    ▼
Notificar a IPRESS (email)
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend (Base de Datos + APIs)

#### Paso 1.1: Crear Entidades JPA
- [ ] `TeleECGImagen.java`
- [ ] `TeleECGAuditoria.java`
- [ ] Validaciones @Column

#### Paso 1.2: Crear Repositorios
- [ ] `TeleECGImagenRepository.java`
- [ ] `TeleECGAuditoriaRepository.java`

#### Paso 1.3: Crear Services
- [ ] `TeleECGService.java` (subir, listar, descargar, procesar)
- [ ] `StorageService.java` (almacenar archivos en disco)
- [ ] Integración con `AuditLogService`

#### Paso 1.4: Crear Controllers
- [ ] `TeleECGController.java`
- [ ] DTOs: `TeleECGImagenDTO`, `SubirImagenDTO`, `ProcesarImagenDTO`
- [ ] Validaciones y manejo de errores

#### Paso 1.5: Crear Scripts SQL
- [ ] Script de creación de tablas
- [ ] Índices estratégicos
- [ ] Inserts iniciales en `tele_ecg_estadisticas`

#### Paso 1.6: Seguridad
- [ ] Agregar permisos MBAC para roles:
  - `INSTITUCION_EX` → Envío de ECG
  - `MEDICO` → Visualización y procesamiento
  - `ADMIN` → Administración completa
- [ ] Validar origen de IPRESS en controllers

---

### Fase 2: Frontend (React)

#### Paso 2.1: Crear Componentes para Envío (IPRESS)
- [ ] `pages/teleekgs/TeleEKGDashboard.jsx`
- [ ] `pages/teleekgs/UploadImagenECG.jsx`
  - Seleccionar archivo
  - Validar tipo (JPEG/PNG)
  - Ingresar DNI, nombres, apellidos
  - Enviar con feedback

#### Paso 2.2: Crear Componentes para Gestión (CENATE)
- [ ] `pages/teleekgs/ListarImagenesECG.jsx`
  - Listado con paginación
  - Filtros por DNI, estado, fecha
  - Mostrar IPRESS origen

- [ ] `pages/teleekgs/VisorImagenECG.jsx`
  - Mostrar imagen en preview
  - Metadata (tamaño, fecha, origen)

- [ ] `pages/teleekgs/DetallesImagenECG.jsx`
  - Botones: Aceptar, Rechazar, Vincular, Descargar
  - Historial de auditoría
  - Comentarios

#### Paso 2.3: Crear Dashboard
- [ ] `pages/teleekgs/EstadisticasTeleEKG.jsx`
  - Gráficos: Imágenes por IPRESS, por estado, por fecha
  - Tabla resumen

#### Paso 2.4: Integración de Rutas
- [ ] Agregar al menú "Gestión de Personal Externo"
- [ ] Rutas protegidas con permisos MBAC

---

### Fase 3: Base de Datos

#### Paso 3.1: Crear Tablas
- [ ] `tele_ecg_imagenes`
- [ ] `tele_ecg_auditoria`
- [ ] `tele_ecg_estadisticas`

#### Paso 3.2: Crear Índices
- [ ] Índices por DNI, estado, fecha, IPRESS

#### Paso 3.3: Agregar Permisos MBAC
- [ ] Inserts en tabla `módulos`, `páginas`, `permisos_modulares`

---

### Fase 4: Testing y Documentación

#### Paso 4.1: Tests Unitarios
- [ ] `TeleECGServiceTest.java`
- [ ] `TeleECGControllerTest.java`

#### Paso 4.2: Tests de Integración
- [ ] Upload de imagen
- [ ] Listar imágenes
- [ ] Procesar imagen

#### Paso 4.3: Documentación
- [ ] Swagger/OpenAPI para endpoints
- [ ] Guía de uso para IPRESS
- [ ] Guía de uso para Personal CENATE
- [ ] Actualizar CHANGELOG

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

### 1. Autenticación y Autorización
- ✅ JWT obligatorio en todos los endpoints
- ✅ Roles diferenciados por IPRESS externa vs CENATE
- ✅ Validación de origen de IPRESS

### 2. Validación de Archivos
- ✅ Tipo: Solo JPEG/PNG
- ✅ Tamaño: Máximo 10MB (configurable)
- ✅ Antivirus: Escanear archivo antes de almacenar (opcional)
- ✅ Hash SHA256: Verificar integridad

### 3. Almacenamiento Seguro
- ✅ Almacenar fuera de raíz web (`/app/uploads/teleekgs`)
- ✅ Renombrar archivos (evitar path traversal)
- ✅ Permisos de archivo restringidos (0600)
- ✅ Separar por año-mes para organización

### 4. Acceso a Imágenes
- ✅ Solo descargar mediante endpoint autenticado
- ✅ Auditoría de cada descarga
- ✅ Logs de acceso por usuario, IP, fecha

### 5. Protección de Datos Sensibles
- ✅ Encriptación en tránsito (HTTPS)
- ✅ NO almacenar datos paciente en nombre archivo
- ✅ GDPR: Derecho a eliminación (marcar como inactivo)

---

## 📊 DTOs REST

### SubirImagenECG Request
```json
{
  "archivo": "<binary>",
  "numDocPaciente": "12345678",
  "nombresPaciente": "Juan Carlos",
  "apellidosPaciente": "García López"
}
```

### SubirImagenECG Response
```json
{
  "idImagen": 123,
  "estado": "PENDIENTE",
  "fechaEnvio": "2026-01-13T10:30:00Z",
  "ipressOrigen": {
    "idIpress": 2,
    "descIpress": "Hospital Nacional Guillermo Almenara"
  }
}
```

### ListarImagenesECG Response
```json
{
  "content": [
    {
      "idImagen": 123,
      "numDocPaciente": "12345678",
      "nombresPaciente": "Juan Carlos García López",
      "estado": "PENDIENTE",
      "ipressOrigen": "Hospital Nacional Guillermo Almenara",
      "fechaEnvio": "2026-01-13T10:30:00Z",
      "tamanioBytes": 2097152,
      "usuarioReceptor": null
    }
  ],
  "totalPages": 5,
  "totalElements": 97,
  "currentPage": 0
}
```

### ProcesarImagenECG Request
```json
{
  "observaciones": "Imagen clara, se procederá con la consulta médica"
}
```

---

## 🎯 PATRONES DE DISEÑO APLICADOS

### 1. Clean Architecture
- **Controllers** → DTOs (interfaz)
- **Services** → Lógica de negocio
- **Repositories** → Acceso a datos
- **Entities** → Dominio

### 2. SOLID Principles
- **S**: Una responsabilidad por clase
- **O**: Abierto a extensión, cerrado a modificación
- **L**: Sustitución de Liskov en Services
- **I**: Interfaces segregadas (TeleECGService)
- **D**: Inyección de dependencias

### 3. Seguridad
- **Authentication**: JWT
- **Authorization**: MBAC (Module-Based Access Control)
- **Input Validation**: DTOs con @Valid
- **Output Encoding**: JSON seguro

### 4. Performance
- **Paginación**: 20 registros por página
- **Índices**: En columnas de búsqueda frecuente
- **Caché**: Opcional en estadísticas (Redis)
- **Storage**: Archivos en disco, BD solo metadata

---

## 📈 ESTIMACIÓN Y ROADMAP

| Fase | Componente | Esfuerzo | Duración |
|------|-----------|----------|----------|
| 1️⃣ | BD + Entities + Repos | 4h | 1 día |
| 1️⃣ | Services + Controllers | 6h | 1.5 días |
| 2️⃣ | Componentes Upload (React) | 3h | 0.5 días |
| 2️⃣ | Componentes Gestión (React) | 5h | 1 día |
| 3️⃣ | Testing + QA | 4h | 1 día |
| 4️⃣ | Documentación | 2h | 0.5 días |
| **TOTAL** | | **24h** | **5 días** |

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de Implementación

- [ ] Requerimientos funcionales claros
- [ ] Restricciones de seguridad definidas
- [ ] Tamaño máximo de archivo definido
- [ ] Estrategia de almacenamiento confirmada
- [ ] Políticas de retención definidas (cuánto tiempo guardar)

### Durante Implementación

- [ ] Código sigue patrón Clean Architecture
- [ ] SOLID principles aplicados
- [ ] Pruebas unitarias tienen >80% cobertura
- [ ] SQL injection prevenido (prepared statements)
- [ ] XSS prevenido (output encoding)
- [ ] CSRF token en formularios POST/PUT

### Antes del Deploy

- [ ] Tests de carga (1000 imágenes simultáneas)
- [ ] Tests de seguridad (OWASP Top 10)
- [ ] Auditoría funciona correctamente
- [ ] GDPR compliance (derecho a eliminación)
- [ ] Backups de imágenes configurados
- [ ] Monitoreo de storage alertas

---

## 📚 Referencias

- OWASP: File Upload Cheat Sheet
- Clean Architecture: Uncle Bob
- Spring Security: Official Docs
- PostgreSQL Best Practices
- React File Upload Patterns

---

**Estado:** 🔵 Análisis Completado
**Siguiente:** Aprobación del diseño → Implementación
**Revisor:** Architect
**Fecha Revisión:** 2026-01-13

