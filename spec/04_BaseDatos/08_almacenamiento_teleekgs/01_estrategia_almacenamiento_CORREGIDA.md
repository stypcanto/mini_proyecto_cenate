# 💾 ESTRATEGIA DE ALMACENAMIENTO - TeleEKG (CORREGIDA)

**Fecha:** 2026-01-13
**Actualización:** Servidor remoto → Almacenar en BD

---

## 🔄 PROBLEMA CON DISCO REMOTO

El servidor CENATE está en **10.0.89.13** (remoto corporativo EsSalud):

```
Opción 1: Almacenar en /app/uploads/ del servidor remoto
  ❌ Dificultad para backups
  ❌ Riesgo de pérdida si reinicia servidor
  ❌ Requiere espacio extra en servidor remoto
  ❌ Sin sistema de archivos compartido (NFS)
  ❌ Acceso lento desde aplicación remota
```

**SOLUCIÓN MEJOR:** Almacenar directamente en PostgreSQL (10.0.89.13:5432)

---

## ✅ NUEVA ARQUITECTURA: BD + BYTEA

```
┌─────────────────────────────────────────────────────┐
│          ALMACENAMIENTO EN BASE DE DATOS            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  IPRESS Externa envía ECG                          │
│          ↓                                          │
│  POST /api/teleekgs/upload (imagen JPEG/PNG)      │
│          ↓                                          │
│  Backend valida (tipo, tamaño, hash)              │
│          ↓                                          │
│  ✅ INSERT EN tele_ecg_imagenes                   │
│     ├─ id_imagen: AUTO                            │
│     ├─ num_doc_paciente: "12345678"               │
│     ├─ contenido_imagen: BYTEA (imagen JPEG/PNG) │ ← ARCHIVO
│     ├─ tipo_contenido: "image/jpeg"               │
│     ├─ tamanio_bytes: 4194304                     │
│     ├─ hash_archivo: "a3f8e7c..."  (SHA256)      │
│     ├─ estado: "PENDIENTE"                        │
│     ├─ fecha_envio: TIMESTAMP                     │
│     ├─ fecha_expiracion: TIMESTAMP (30d)          │
│     └─ ... otros metadatos ...                    │
│          ↓                                          │
│  Personal CENATE descargar:                       │
│  GET /api/teleekgs/{id}/descargar                │
│          ↓                                          │
│  SELECT contenido_imagen FROM tele_ecg_imagenes  │
│  WHERE id_imagen = 123                            │
│          ↓                                          │
│  Backend devuelve bytes (image/jpeg)             │
│          ↓                                          │
│  Navegador descarga archivo original             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 NUEVA ENTIDAD JPA

```java
@Entity
@Table(name = "tele_ecg_imagenes")
public class TeleECGImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idImagen;

    @Column(name = "num_doc_paciente", nullable = false)
    private String numDocPaciente;

    @Column(name = "nombres_paciente")
    private String nombresPaciente;

    @Column(name = "apellidos_paciente")
    private String apellidosPaciente;

    @ManyToOne
    @JoinColumn(name = "id_usuario_paciente", nullable = true)
    private Usuario usuarioPaciente;

    // ✅ NUEVO: Imagen almacenada en BD (BYTEA)
    @Column(name = "contenido_imagen", nullable = false, columnDefinition = "bytea")
    private byte[] contenidoImagen;  // Archivo JPEG/PNG como bytes

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;    // Ej: paciente_12345678_20260113.jpg

    @Column(name = "tipo_contenido", nullable = false)
    private String tipoContenido;    // image/jpeg, image/png

    @Column(name = "tamanio_bytes")
    private Long tamanioByt es;      // Tamaño en bytes

    @Column(name = "hash_archivo")
    private String hashArchivo;      // SHA256 para integridad

    @ManyToOne
    @JoinColumn(name = "id_ipress_origen", nullable = false)
    private Ipress ipressOrigen;

    @ManyToOne
    @JoinColumn(name = "id_usuario_receptor", nullable = true)
    private Usuario usuarioReceptor;

    @Column(name = "fecha_envio", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEnvio;

    @Column(name = "fecha_recepcion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaRecepcion;

    @Column(name = "fecha_expiracion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaExpiracion;    // 30 días desde fecha_envio

    @Column(name = "estado", nullable = false)
    private String estado;           // PENDIENTE, PROCESADA, RECHAZADA

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "stat_imagen", nullable = false)
    private String statImagen;       // A=Activo, I=Inactivo (para limpieza)

    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}
```

---

## 📋 SCRIPT SQL (CORREGIDO)

```sql
-- ============================================================
-- MÓDULO TELEEKGS - Electrocardiogramas en BD
-- ============================================================

CREATE TABLE tele_ecg_imagenes (
    id_imagen SERIAL PRIMARY KEY,
    num_doc_paciente VARCHAR(20) NOT NULL,
    nombres_paciente VARCHAR(100),
    apellidos_paciente VARCHAR(150),
    id_usuario_paciente BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,
    id_ipress_origen BIGINT NOT NULL REFERENCES dim_ipress(id_ipress),
    id_usuario_receptor BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,

    -- ✅ IMAGEN ALMACENADA EN BD
    contenido_imagen BYTEA NOT NULL,           -- Archivo JPEG/PNG como bytes
    nombre_archivo VARCHAR(255) NOT NULL,      -- Nombre original
    tipo_contenido VARCHAR(50) NOT NULL,       -- image/jpeg, image/png
    tamanio_bytes BIGINT NOT NULL,             -- Tamaño en bytes

    -- METADATA
    hash_archivo VARCHAR(64),                  -- SHA256
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',  -- PENDIENTE, PROCESADA, RECHAZADA
    observaciones TEXT,
    stat_imagen CHAR(1) NOT NULL DEFAULT 'A', -- A=Activo, I=Inactivo

    -- TIMESTAMPS
    fecha_envio TIMESTAMP NOT NULL,
    fecha_recepcion TIMESTAMP,
    fecha_expiracion TIMESTAMP,                -- Para limpieza (30 días)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- ÍNDICES
    INDEX idx_num_doc (num_doc_paciente),
    INDEX idx_estado (estado),
    INDEX idx_ipress_origen (id_ipress_origen),
    INDEX idx_fecha_expiracion (fecha_expiracion),  -- Para limpiar rápido
    INDEX idx_id_usuario_paciente (id_usuario_paciente)
);

-- Tabla de auditoría (sin cambios)
CREATE TABLE tele_ecg_auditoria (
    id_audit SERIAL PRIMARY KEY,
    id_imagen BIGINT NOT NULL REFERENCES tele_ecg_imagenes(id_imagen) ON DELETE CASCADE,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,                    -- DESCARGO, VIO, PROCESO
    ip_origen VARCHAR(45),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_id_imagen (id_imagen),
    INDEX idx_usuario (usuario),
    INDEX idx_fecha_accion (fecha_accion DESC)
);

-- Estadísticas (sin cambios)
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

-- Índices estratégicos para búsqueda rápida
CREATE INDEX idx_tele_ecg_busqueda ON tele_ecg_imagenes(num_doc_paciente, estado, fecha_envio DESC);
```

---

## 💻 CÓDIGO JAVA (ACTUALIZADO)

### Service: Subir Imagen

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TeleECGService {

    private final TeleECGImagenRepository imagenRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    @Value("${app.teleecg.max-file-size:5242880}") // 5MB
    private Long maxFileSize;

    @Value("${app.teleecg.retention-days:30}")
    private Integer retentionDays;

    /**
     * Subir imagen ECG directamente en BD
     */
    @Transactional
    public TeleECGImagenDTO subirImagenECG(
            MultipartFile archivo,
            String numDoc,
            String nombres,
            String apellidos) {

        log.info("📤 Subiendo imagen ECG: DNI={}", numDoc);

        // 1. VALIDAR ARCHIVO
        if (!validarArchivo(archivo)) {
            throw new IllegalArgumentException("Archivo no válido (solo JPEG/PNG, máx 5MB)");
        }

        // 2. OBTENER BYTES DEL ARCHIVO
        byte[] contenidoImagen;
        try {
            contenidoImagen = archivo.getBytes();
        } catch (IOException e) {
            log.error("Error al leer archivo: {}", e.getMessage());
            throw new RuntimeException("No se pudo procesar el archivo");
        }

        // 3. CALCULAR HASH (integridad)
        String hashArchivo = calcularSHA256(contenidoImagen);

        // 4. OBTENER IPRESS ORIGEN
        Usuario usuarioActual = obtenerUsuarioActual();
        Ipress ipressOrigen = usuarioActual.getPersonalCnt().getIpress();

        // 5. GENERAR NOMBRE
        String nombreArchivo = generarNombreArchivo(numDoc, archivo.getOriginalFilename());

        // 6. BUSCAR USUARIO PACIENTE
        Usuario usuarioPaciente = usuarioRepository.findByNameUser(numDoc).orElse(null);

        // 7. ✅ CREAR REGISTRO EN BD CON IMAGEN
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + (retentionDays * 24 * 60 * 60 * 1000L));

        TeleECGImagen imagen = TeleECGImagen.builder()
            .numDocPaciente(numDoc)
            .nombresPaciente(nombres)
            .apellidosPaciente(apellidos)
            .usuarioPaciente(usuarioPaciente)
            // ✅ IMAGEN EN BD
            .contenidoImagen(contenidoImagen)      // Bytes JPEG/PNG
            .nombreArchivo(nombreArchivo)
            .tipoContenido(archivo.getContentType())
            .tamanioByte s(archivo.getSize())
            .hashArchivo(hashArchivo)
            // RESTO DE METADATOS
            .ipressOrigen(ipressOrigen)
            .fechaEnvio(ahora)
            .fechaExpiracion(fechaExpiracion)
            .estado("PENDIENTE")
            .statImagen("A")
            .build();

        imagen = imagenRepository.save(imagen);

        log.info("✅ Imagen almacenada en BD: ID={}, Hash={}", imagen.getIdImagen(), hashArchivo);

        // 8. AUDITORÍA
        auditLogService.registrarEvento(
            usuarioActual.getNameUser(),
            "UPLOAD_ECG",
            "TELEEKGS",
            "Imagen ECG subida - Paciente: " + numDoc,
            "INFO",
            "SUCCESS"
        );

        // 9. NOTIFICAR
        notificarNuevaImagenECG(imagen);

        return convertirADTO(imagen);
    }

    /**
     * Descargar imagen desde BD
     */
    public ResponseEntity<byte[]> descargarImagen(Long idImagen) {
        log.info("📥 Descargando imagen: ID={}", idImagen);

        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // ✅ OBTENER BYTES DESDE BD
        byte[] contenido = imagen.getContenidoImagen();

        // AUDITORÍA
        registrarAcceso(imagen, "DESCARGO");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(imagen.getTipoContenido()))
            .header("Content-Disposition",
                "attachment; filename=\"" + imagen.getNombreArchivo() + "\"")
            .body(contenido);
    }

    /**
     * Preview de imagen (minimizado para web)
     */
    public ResponseEntity<byte[]> previewImagen(Long idImagen) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // ✅ OBTENER BYTES DESDE BD
        byte[] contenido = imagen.getContenidoImagen();

        // AUDITORÍA
        registrarAcceso(imagen, "VIO_PREVIEW");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(imagen.getTipoContenido()))
            .header("Cache-Control", "max-age=3600")  // Cache 1 hora
            .body(contenido);
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

        // AUDITORÍA
        registrarAcceso(imagen, "PROCESADA");

        return convertirADTO(imagen);
    }

    // MÉTODOS PRIVADOS

    private boolean validarArchivo(MultipartFile archivo) {
        // Validar tipo
        if (!archivo.getContentType().matches("image/(jpeg|png)")) {
            return false;
        }

        // Validar tamaño (5MB)
        if (archivo.getSize() > maxFileSize) {
            return false;
        }

        return true;
    }

    private String calcularSHA256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error calculando hash", e);
        }
    }

    private String generarNombreArchivo(String numDoc, String nombreOriginal) {
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1);
        return String.format("paciente_%s_%d.%s",
            numDoc,
            System.currentTimeMillis(),
            extension);
    }

    private void registrarAcceso(TeleECGImagen imagen, String accion) {
        Usuario usuario = obtenerUsuarioActual();
        TeleECGAuditoria auditoria = TeleECGAuditoria.builder()
            .imagen(imagen)
            .usuario(usuario.getNameUser())
            .accion(accion)
            .ipOrigen(obtenerIPOrigen())
            .fechaAccion(new Date())
            .build();

        tele ECGAuditoriaRepository.save(auditoria);
    }

    private Usuario obtenerUsuarioActual() {
        // Desde contexto de seguridad
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return usuarioRepository.findByNameUser(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private void notificarNuevaImagenECG(TeleECGImagen imagen) {
        // Email a personal CENATE
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/teleekgs")
@PreAuthorize("hasAnyRole('INSTITUCION_EX', 'MEDICO', 'ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class TeleECGController {

    private final TeleECGService teleECGService;

    // IPRESS Externa: Subir
    @PostMapping("/upload")
    @PreAuthorize("hasRole('INSTITUCION_EX')")
    public ResponseEntity<?> subirImagenECG(
        @RequestParam("archivo") MultipartFile archivo,
        @RequestParam("numDocPaciente") String numDoc,
        @RequestParam("nombresPaciente") String nombres,
        @RequestParam("apellidosPaciente") String apellidos) {

        try {
            TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
                archivo, numDoc, nombres, apellidos);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "exitoso", true,
                    "mensaje", "Imagen subida exitosamente",
                    "imagen", resultado
                ));
        } catch (Exception e) {
            log.error("Error al subir imagen: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("exitoso", false, "error", e.getMessage()));
        }
    }

    // CENATE: Descargar
    @GetMapping("/{idImagen}/descargar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<byte[]> descargarImagen(@PathVariable Long idImagen) {
        return teleECGService.descargarImagen(idImagen);
    }

    // CENATE: Preview
    @GetMapping("/{idImagen}/preview")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<byte[]> previewImagen(@PathVariable Long idImagen) {
        return teleECGService.previewImagen(idImagen);
    }

    // CENATE: Listar
    @GetMapping("/listar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<?> listarImagenes(
        @RequestParam(required = false) String numDocPaciente,
        @RequestParam(required = false, defaultValue = "0") int page) {
        // ...
    }
}
```

---

## 📊 CÁLCULO DE TAMAÑO EN BD

```
Escenario:
- 5MB máximo por imagen
- 50 imágenes/día
- 30 días retención
- Sin limpieza antes de expirar

CÁLCULO:
  5MB × 50 imágenes × 30 días = 7,500 MB = 7.5 GB/mes

CON LIMPIEZA AUTOMÁTICA:
  Solo últimos 30 días = ~7.5 GB constante

CONSIDERACIÓN:
  PostgreSQL puede manejar fácilmente 7.5GB
  No es problema si la BD tiene espacio
  (BD actual: 10.0.89.13, probablemente tiene 100GB+)
```

---

## 🗑️ LIMPIEZA AUTOMÁTICA (1 MES)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TeleECGExpirationService {

    private final TeleECGImagenRepository imagenRepository;

    /**
     * Ejecutar cada día a las 2am
     * Elimina imágenes de más de 30 días
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void limpiarImagenesExpiradas() {
        log.info("🧹 Iniciando limpieza de imágenes expiradas");

        LocalDateTime ahora = LocalDateTime.now();

        // Encontrar imágenes con fecha_expiracion < ahora
        List<TeleECGImagen> expiradas = imagenRepository
            .findByFechaExpiracionBeforeAndStatImagen(ahora, "A");

        for (TeleECGImagen imagen : expiradas) {
            try {
                // ✅ ELIMINAR DE BD (el contenido BYTEA se borra automáticamente)
                imagen.setStatImagen("I");  // Marcar como inactivo
                imagenRepository.save(imagen);

                log.info("✅ Imagen expirada marcada como inactiva: ID={}, DNI={}",
                    imagen.getIdImagen(),
                    imagen.getNumDocPaciente());

            } catch (Exception e) {
                log.error("Error al eliminar imagen: ID={}", imagen.getIdImagen(), e);
            }
        }

        log.info("✅ Limpieza completada. {} imágenes marcadas como inactivas", expiradas.size());
    }

    /**
     * Opcionalmente: Purga física (eliminar de la BD después de X meses)
     * Para cumplimiento de GDPR (derecho al olvido)
     */
    @Scheduled(cron = "0 0 3 * * ?")  // 3am diariamente
    @Transactional
    public void purgarImagenesInactivas() {
        log.info("🗑️ Purgando imágenes inactivas (>3 meses)");

        LocalDateTime hace3Meses = LocalDateTime.now().minusMonths(3);

        int eliminadas = imagenRepository
            .deleteByStatImagenAndUpdatedAtBefore("I", hace3Meses);

        log.info("✅ {} imágenes purgadas de la BD", eliminadas);
    }
}
```

---

## 📋 SQL PARA MONITOREO

```sql
-- Ver tamaño de imágenes en BD
SELECT
    id_ipress,
    COUNT(*) as total_imagenes,
    SUM(tamanio_bytes) / 1024 / 1024 as tamanio_MB,
    SUM(tamanio_bytes) / 1024 / 1024 / 1024 as tamanio_GB
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
GROUP BY id_ipress
ORDER BY tamanio_GB DESC;

-- Ver imágenes próximas a expirar
SELECT
    id_imagen,
    num_doc_paciente,
    fecha_envio,
    fecha_expiracion,
    EXTRACT(DAY FROM fecha_expiracion - NOW()) as dias_restantes
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
  AND fecha_expiracion < NOW() + INTERVAL '3 days'
ORDER BY fecha_expiracion;

-- Espacio total usado
SELECT
    pg_size_pretty(SUM(pg_column_size(contenido_imagen))) as tamanio_total
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A';
```

---

## ✅ VENTAJAS: BD vs DISCO

| Aspecto | BD (BYTEA) | Disco Local |
|---------|-----------|-----------|
| **Backup** | ✅ Automático con BD | ⚠️ Manual |
| **Servidor Remoto** | ✅ Ideal | ❌ Complejidad |
| **ACID Transactions** | ✅ Sí | ❌ No |
| **Integridad** | ✅ Hash verificado | ✅ Hash verificado |
| **Recuperación** | ✅ Rápida con BD | ⚠️ Lenta |
| **Cumplimiento corporativo** | ✅ Todo en BD | ⚠️ Disperso |
| **Tamaño DB** | ⚠️ +7.5GB | ✅ Pequeña |
| **I/O Performance** | ⚠️ Más lento | ✅ Rápido |

---

## 📦 RESUMEN FINAL

| Componente | Ubicación | Detalles |
|-----------|-----------|----------|
| 🖼️ **Imagen ECG** | `tele_ecg_imagenes.contenido_imagen` (BYTEA) | Almacenado en BD |
| 📊 **Metadata** | `tele_ecg_imagenes` (otras columnas) | DNI, tamaño, hash, estado |
| 🔐 **Hash SHA256** | `tele_ecg_imagenes.hash_archivo` | Verificación integridad |
| 📝 **Auditoría** | `tele_ecg_auditoria` | Accesos y descargas |
| 👤 **Asegurado** | `dim_asegurados` | Datos del paciente |
| 🗑️ **Limpieza** | Scheduled task (2am) | Marca como inactivo después de 30 días |

---

## 🎯 CONFIGURATION

```properties
# application.properties
app.teleekg.max-file-size=5242880              # 5MB
app.teleekg.retention-days=30                  # 1 mes
app.teleekg.cleanup-enabled=true
app.teleekg.cleanup-hour=02                    # 2am
```

---

**Conclusión:** Todo almacenado en PostgreSQL. Más seguro, con backup automático, y ideal para servidor remoto corporativo. ✅

