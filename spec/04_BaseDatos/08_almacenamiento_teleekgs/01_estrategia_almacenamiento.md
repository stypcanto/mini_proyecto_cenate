# 💾 ESTRATEGIA DE ALMACENAMIENTO - TeleEKG

**Fecha:** 2026-01-13
**Contexto:** ¿Dónde guardar las imágenes ECG?

---

## 📊 ANÁLISIS DE OPCIONES

### Opción 1: Almacenamiento en Disco Local (RECOMENDADO ✅)

**¿Cómo funciona?**
```
IPRESS Externa
    ↓
POST /api/teleekgs/upload (imagen JPEG/PNG)
    ↓
Backend valida archivo
    ↓
Guarda en: /app/uploads/teleekgs/2026-01/13/paciente_12345678_001.jpg
    ↓
Guarda metadata en BD: tele_ecg_imagenes.ruta_archivo = "/app/uploads/teleekgs/2026-01/13/paciente_12345678_001.jpg"
    ↓
Personal CENATE descarga: GET /api/teleekgs/{id}/descargar
    ↓
Backend lee archivo del disco
    ↓
Envía bytes al cliente
```

**Estructura de directorios:**
```
/app/uploads/
├── teleekgs/              ← Carpeta raíz (fuera de web root)
│   ├── 2026-01/
│   │   ├── 13/
│   │   │   ├── paciente_12345678_001.jpg
│   │   │   ├── paciente_87654321_001.jpg
│   │   │   └── paciente_87654321_002.jpg
│   │   └── 14/
│   │       ├── paciente_11111111_001.png
│   │       └── ...
│   ├── archivos_expirados/  ← Para borrado (1 mes)
│   └── backup/              ← Backups diarios
│
├── fotos/                 ← Fotos de perfil (existente)
└── otros/
```

**Ventajas:**
- ✅ **Rápido:** Acceso directo al disco
- ✅ **Barato:** No requiere servicios en la nube
- ✅ **Control total:** Tú administras los archivos
- ✅ **Privado:** Archivos no públicos en internet
- ✅ **Auditoría:** Logs locales de acceso
- ✅ **Performance:** Ideal para 5MB máx

**Desventajas:**
- ⚠️ Requiere espacio en disco suficiente
- ⚠️ Backup manual necesario
- ⚠️ No escalable a múltiples servidores
- ⚠️ Dependiente del hardware del servidor

**Cálculo de espacio:**
```
Asumiendo:
- 100 IPRESS enviando imágenes
- 50 imágenes/día promedio
- Tamaño promedio: 3MB/imagen
- Retención: 1 mes (30 días)

Cálculo:
  100 IPRESS × 50 imágenes/día × 3MB × 30 días = 450 GB/mes

Con borrado automático (1 mes):
  Espacio máximo necesario: ~500 GB (disco actual tiene suficiente)
```

---

### Opción 2: Amazon S3 / Cloud Storage

**¿Cómo funciona?**
```
IPRESS Externa
    ↓
POST /api/teleekgs/upload (imagen)
    ↓
Backend valida
    ↓
Sube a S3: s3://cenate-teleekgs/2026-01/13/paciente_12345678_001.jpg
    ↓
Guarda en BD: URL S3 + access token temporal
    ↓
Personal CENATE descarga
    ↓
Backend genera URL temporal (15 min)
    ↓
Cliente descarga desde S3 (link temporal)
```

**Ventajas:**
- ✅ Escalable a múltiples servidores
- ✅ Backup automático
- ✅ CDN integrado
- ✅ Versionado de archivos
- ✅ Cumplimiento normativo

**Desventajas:**
- ❌ Costo mensual (~$20-100/mes)
- ❌ Latencia de red
- ❌ Datos fuera del servidor EsSalud
- ❌ Dependencia de conectividad
- ❌ Posibles restricciones institucionales

**NO RECOMENDADO para CENATE** (datos sensibles, infraestructura local)

---

### Opción 3: Base de Datos (PostgreSQL BLOB)

**¿Cómo funciona?**
```
IPRESS Externa
    ↓
POST /api/teleekgs/upload
    ↓
Convierte imagen a bytes
    ↓
Inserta en: tele_ecg_imagenes.contenido_imagen = BYTEA
    ↓
Personal CENATE descarga
    ↓
SELECT contenido_imagen FROM tele_ecg_imagenes WHERE id = ?
```

**Ventajas:**
- ✅ Todo en un lugar (BD)
- ✅ Transacciones ACID
- ✅ Backup integrado con BD

**Desventajas:**
- ❌ MUCHO más lento que disco
- ❌ Aumenta tamaño de BD (500GB+ de imágenes)
- ❌ Backups más grandes
- ❌ I/O de BD saturado
- ❌ Pobre performance en lectura

**NO RECOMENDADO** (muy ineficiente)

---

## 🎯 RECOMENDACIÓN FINAL

**Usar Opción 1: Almacenamiento en Disco Local**

### Estructura Definida:

```
/app/uploads/teleekgs/
├── YYYY-MM/
│   └── DD/
│       └── paciente_{DNI}_{secuencia}.{ext}
│
Ejemplos:
- /app/uploads/teleekgs/2026-01/13/paciente_12345678_001.jpg
- /app/uploads/teleekgs/2026-01/13/paciente_87654321_002.png
- /app/uploads/teleekgs/2026-01/14/paciente_11111111_001.jpg
```

### Configuración Java:

```properties
# application.properties
app.teleekg.upload-dir=/app/uploads/teleekgs
app.teleekg.max-file-size=5242880              # 5MB
app.teleekg.allowed-types=image/jpeg,image/png
app.teleekg.retention-days=30
app.teleekg.cleanup-enabled=true
app.teleekg.cleanup-hour=02                    # Ejecutar limpieza a las 2am
```

### Código Java para Almacenar:

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    @Value("${app.teleekg.upload-dir}")
    private String uploadDir;

    /**
     * Guardar archivo ECG en disco
     */
    public String guardarArchivo(MultipartFile archivo, String numDocPaciente)
            throws IOException {

        // 1. Generar ruta segura
        LocalDate hoy = LocalDate.now();
        String rutaDirectorio = String.format("%s/%d-%02d/%02d",
            uploadDir,
            hoy.getYear(),
            hoy.getMonthValue(),
            hoy.getDayOfMonth()
        );

        // 2. Crear directorio si no existe
        Files.createDirectories(Paths.get(rutaDirectorio));

        // 3. Generar nombre único
        String timestamp = System.currentTimeMillis();
        String extension = obtenerExtension(archivo.getOriginalFilename());
        String nombreArchivo = String.format("paciente_%s_%s.%s",
            numDocPaciente,
            timestamp,
            extension
        );

        // 4. Ruta completa
        Path rutaCompleta = Paths.get(rutaDirectorio, nombreArchivo);

        // 5. Guardar archivo
        Files.write(rutaCompleta, archivo.getBytes());

        // 6. Establecer permisos (solo lectura por grupo)
        Set<PosixFilePermission> permisos = PosixFilePermissions.fromString("rw-------");
        Files.setPosixFilePermissions(rutaCompleta, permisos);

        log.info("Archivo guardado en: {}", rutaCompleta.toString());
        return rutaCompleta.toString();
    }

    /**
     * Leer archivo desde disco
     */
    public byte[] leerArchivo(String rutaArchivo) throws IOException {
        Path ruta = Paths.get(rutaArchivo);

        // Validar que el archivo está dentro del directorio permitido
        if (!ruta.normalize().startsWith(Paths.get(uploadDir).normalize())) {
            throw new SecurityException("Acceso denegado: archivo fuera del directorio permitido");
        }

        return Files.readAllBytes(ruta);
    }

    /**
     * Eliminar archivo (expiración 1 mes)
     */
    public void eliminarArchivo(String rutaArchivo) throws IOException {
        Path ruta = Paths.get(rutaArchivo);
        if (Files.exists(ruta)) {
            Files.delete(ruta);
            log.info("Archivo eliminado: {}", rutaArchivo);
        }
    }

    /**
     * Limpieza automática (borrar archivos mayores a 30 días)
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2am diariamente
    public void limpiarArchivosExpirados() {
        log.info("🧹 Iniciando limpieza de archivos expirados (>30 días)");

        try {
            LocalDate hace30Dias = LocalDate.now().minusDays(30);
            Path uploadPath = Paths.get(uploadDir);

            Files.walk(uploadPath)
                .filter(Files::isRegularFile)
                .filter(path -> {
                    try {
                        FileTime fechaCreacion = Files.getAttribute(path, "creationTime", LinkOption.NOFOLLOW_LINKS);
                        long diasAntiguedad = ChronoUnit.DAYS.between(
                            fechaCreacion.toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                            LocalDate.now()
                        );
                        return diasAntiguedad > 30;
                    } catch (IOException e) {
                        return false;
                    }
                })
                .forEach(path -> {
                    try {
                        Files.delete(path);
                        log.info("Archivo expirado eliminado: {}", path);
                    } catch (IOException e) {
                        log.error("Error al eliminar archivo: {}", path, e);
                    }
                });

            log.info("✅ Limpieza completada");
        } catch (IOException e) {
            log.error("Error durante limpieza de archivos:", e);
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        return nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
    }
}
```

---

## 🔒 SEGURIDAD EN ALMACENAMIENTO

### 1. Validación de Archivo
```java
// Validar tipo MIME
if (!archivo.getContentType().matches("image/(jpeg|png)")) {
    throw new IllegalArgumentException("Solo se permiten JPEG y PNG");
}

// Validar tamaño (5MB)
if (archivo.getSize() > 5242880) {
    throw new IllegalArgumentException("Archivo excede tamaño máximo (5MB)");
}

// Validar extensión
String extension = obtenerExtension(archivo.getOriginalFilename());
if (!Arrays.asList("jpg", "jpeg", "png").contains(extension)) {
    throw new IllegalArgumentException("Extensión no permitida");
}
```

### 2. Prevención de Path Traversal
```java
// ❌ INSEGURO
String rutaArchivo = "/app/uploads/" + nombreDelUsuario;

// ✅ SEGURO
Path ruta = Paths.get(uploadDir, nombreDelUsuario).normalize();
if (!ruta.startsWith(Paths.get(uploadDir).normalize())) {
    throw new SecurityException("Intento de path traversal detectado");
}
```

### 3. Permisos de Archivo
```bash
# El archivo debe tener permisos restringidos
chmod 600 /app/uploads/teleekgs/2026-01/13/*.jpg

# Solo el usuario de la aplicación puede leer
ls -la /app/uploads/teleekgs/2026-01/13/
# -rw------- cenate cenate 2097152 Jan 13 10:30 paciente_12345678_001.jpg
```

### 4. Directorio Fuera de Web Root
```bash
# ❌ NO guardar aquí (accesible públicamente)
/var/www/html/uploads/teleekgs/

# ✅ Guardar aquí (protegido)
/app/uploads/teleekgs/

# El servidor web NO DEBE servir /app directamente
# Solo mediante endpoint autenticado /api/teleekgs/{id}/descargar
```

---

## 📋 CAMBIOS AL PLAN ORIGINAL

### 1. Entidad TeleECGImagen (ACTUALIZADA)

```java
@Entity
@Table(name = "tele_ecg_imagenes")
public class TeleECGImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idImagen;

    // ... campos anteriores ...

    // ✅ ACTUALIZADO: Solo ruta, NO contenido binario
    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;  // Ej: /app/uploads/teleekgs/2026-01/13/paciente_12345678_001.jpg

    // ✅ NUEVO: Hash SHA256 para integridad
    @Column(name = "hash_archivo")
    private String hashArchivo;

    // ✅ NUEVO: Timestamp para expiración
    @Column(name = "fecha_expiracion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaExpiracion;  // 30 días desde fecha_envio
}
```

### 2. Servicio TeleECGService (ACTUALIZADO)

```java
@Service
@RequiredArgsConstructor
public class TeleECGService {

    private final StorageService storageService;  // ✅ NUEVO

    /**
     * Subir imagen ECG
     */
    @Transactional
    public TeleECGImagenDTO subirImagenECG(MultipartFile archivo, String numDoc, ...) {

        // Validar
        validarArchivo(archivo);

        // ✅ Guardar en disco
        String rutaArchivo = storageService.guardarArchivo(archivo, numDoc);

        // ✅ Calcular hash para integridad
        String hash = calcularHash(archivo);

        // Crear registro con ruta
        TeleECGImagen imagen = TeleECGImagen.builder()
            .rutaArchivo(rutaArchivo)
            .hashArchivo(hash)
            .fechaExpiracion(LocalDate.now().plusDays(30).atStartOfDay())
            .build();

        return convertirADTO(imagen);
    }

    /**
     * Descargar imagen
     */
    public byte[] descargarImagen(Long idImagen) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("No encontrada"));

        // ✅ Leer desde disco
        byte[] contenido = storageService.leerArchivo(imagen.getRutaArchivo());

        // Auditoría
        registrarAcceso(imagen, "DESCARGO");

        return contenido;
    }
}
```

### 3. Controller (ACTUALIZADO)

```java
@RestController
@RequestMapping("/api/teleekgs")
public class TeleECGController {

    @GetMapping("/{idImagen}/descargar")
    public ResponseEntity<?> descargarImagen(@PathVariable Long idImagen) {
        byte[] contenido = teleECGService.descargarImagen(idImagen);

        TeleECGImagen imagen = teleECGService.obtenerImagen(idImagen);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(imagen.getTipoContenido()))
            .header("Content-Disposition",
                "attachment; filename=\"" + imagen.getNombreArchivo() + "\"")
            .body(contenido);
    }
}
```

---

## 🗑️ LIMPIEZA AUTOMÁTICA (1 MES)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TeleECGExpirationService {

    private final TeleECGImagenRepository imagenRepository;
    private final StorageService storageService;

    /**
     * Ejecutar cada día a las 2am
     * Elimina imágenes de más de 30 días
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void limpiarImagenesExpiradas() {
        log.info("🧹 Iniciando limpieza de imágenes expiradas");

        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);

        List<TeleECGImagen> expiradas = imagenRepository
            .findByFechaEnvioBeforeAndStatImagen(hace30Dias, "A");

        for (TeleECGImagen imagen : expiradas) {
            try {
                // 1. Eliminar archivo del disco
                storageService.eliminarArchivo(imagen.getRutaArchivo());

                // 2. Marcar como inactivo en BD
                imagen.setStatImagen("I");
                imagenRepository.save(imagen);

                // 3. Auditoría
                log.info("Imagen expirada eliminada: ID={}, DNI={}, Archivo={}",
                    imagen.getIdImagen(),
                    imagen.getNumDocPaciente(),
                    imagen.getRutaArchivo()
                );

            } catch (Exception e) {
                log.error("Error al eliminar imagen expirada: {}", imagen.getIdImagen(), e);
            }
        }

        log.info("✅ Limpieza completada. {} imágenes eliminadas", expiradas.size());
    }
}
```

---

## 📊 RESUMEN: DÓNDE SE GUARDAN LOS DATOS

| Dato | Ubicación | Propósito | Retención |
|------|-----------|----------|-----------|
| **Imagen ECG** | `/app/uploads/teleekgs/YYYY-MM-DD/` | Archivo físico | 1 mes |
| **Metadata** | `tele_ecg_imagenes` (PostgreSQL) | Registro en BD | 3 meses (después inactivo) |
| **Hash SHA256** | `tele_ecg_imagenes.hash_archivo` | Integridad | 3 meses |
| **Auditoría** | `tele_ecg_auditoria` (PostgreSQL) | Logs de acceso | Permanente |
| **Estadísticas** | `tele_ecg_estadisticas` (PostgreSQL) | Dashboard | Permanente |

---

## ✅ CHECKLIST

- [ ] Crear directorio `/app/uploads/teleekgs/` con permisos 0755
- [ ] Implementar `StorageService.java`
- [ ] Implementar `TeleECGExpirationService.java` (limpieza automática)
- [ ] Configurar `application.properties` con rutas
- [ ] Agregar permisos de archivo en el SO
- [ ] Backups diarios de `/app/uploads/teleekgs/`
- [ ] Monitorear espacio en disco
- [ ] Alertas si disco > 80% lleno

---

**Conclusión:** Almacenar archivos en disco local, solo metadata en BD. Simple, rápido, seguro.

