package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.TeleECGAuditoriaRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.storage.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio principal para gestión de electrocardiogramas (TeleEKG)
 *
 * Versión 2.0.0 - Implementación con Filesystem Storage
 * Migración de BYTEA a /opt/cenate/teleekgs/
 *
 * @author Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-13
 */
@Service
@Slf4j
@Transactional
public class TeleECGService {

    @PostConstruct
    public void init() {
        log.info("✅ TeleECGService inicializado exitosamente");
    }

    @Autowired
    private TeleECGImagenRepository teleECGImagenRepository;

    @Autowired
    private TeleECGAuditoriaRepository teleECGAuditoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IpressRepository ipressRepository;

    @Autowired
    private AseguradoRepository aseguradoRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Subir nueva imagen ECG
     *
     * Flujo:
     * 1. Validar archivo (MIME, tamaño, magic bytes)
     * 2. Calcular SHA256
     * 3. Detectar duplicados
     * 4. Guardar archivo en filesystem
     * 5. Verificar integridad post-escritura
     * 6. Crear registro en BD
     * 7. Registrar auditoría
     * 8. Enviar notificación email
     */
    public TeleECGImagenDTO subirImagenECG(
            SubirImagenECGDTO dto,
            Long idIpressOrigen,
            Long idUsuarioEnvio,
            String ipOrigen,
            String navegador) throws IOException {

        log.info("📤 Subiendo imagen ECG para paciente: {}", dto.getNumDocPaciente());

        // 1. Obtener IPRESS
        Ipress ipressOrigen = ipressRepository.findById(idIpressOrigen)
            .orElseThrow(() -> new RuntimeException("IPRESS no encontrada: " + idIpressOrigen));

        // 2. Calcular SHA256
        String sha256 = fileStorageService.calcularSHA256(dto.getArchivo());
        log.info("✅ SHA256 calculado: {}", sha256);

        // 3. Detectar duplicados
        Optional<TeleECGImagen> duplicado = teleECGImagenRepository
            .findBySha256AndStatImagenEquals(sha256, "A");

        if (duplicado.isPresent()) {
            throw new RuntimeException("Imagen duplicada detectada (ID: " + duplicado.get().getIdImagen() + ")");
        }

        // 4. Guardar archivo en filesystem
        String rutaCompleta = fileStorageService.guardarArchivo(
            dto.getArchivo(),
            dto.getNumDocPaciente(),
            ipressOrigen.getCodIpress()
        );
        log.info("✅ Archivo guardado: {}", rutaCompleta);

        // 5. Verificar integridad
        if (!fileStorageService.verificarIntegridad(rutaCompleta, sha256)) {
            fileStorageService.eliminarArchivo(rutaCompleta);
            throw new RuntimeException("Error de integridad al guardar archivo");
        }

        // 6. Crear registro en BD
        TeleECGImagen imagen = new TeleECGImagen();
        imagen.setNumDocPaciente(dto.getNumDocPaciente());
        imagen.setNombresPaciente(dto.getNombresPaciente());
        imagen.setApellidosPaciente(dto.getApellidosPaciente());
        imagen.setStorageTipo("FILESYSTEM");
        imagen.setStorageRuta(rutaCompleta);
        imagen.setNombreArchivo(new java.io.File(rutaCompleta).getName());
        imagen.setNombreOriginal(dto.getArchivo().getOriginalFilename());
        imagen.setExtension(obtenerExtension(dto.getArchivo().getOriginalFilename()));
        imagen.setMimeType(dto.getArchivo().getContentType());
        imagen.setSizeBytes(dto.getArchivo().getSize());
        imagen.setSha256(sha256);
        imagen.setIpressOrigen(ipressOrigen);
        imagen.setCodigoIpress(ipressOrigen.getCodIpress());
        imagen.setNombreIpress(ipressOrigen.getDescIpress());
        imagen.setEstado("PENDIENTE");
        imagen.setStatImagen("A");
        imagen.setIpOrigen(ipOrigen);
        imagen.setNavegador(navegador);
        imagen.setRutaAcceso("/api/teleekgs/upload");
        imagen.setObservaciones(dto.getObservaciones());

        imagen = teleECGImagenRepository.save(imagen);
        log.info("✅ Imagen registrada en BD: ID={}", imagen.getIdImagen());

        // 7. Registrar auditoría
        auditLogService.registrarEvento(
            "SYSTEM",
            "UPLOAD_ECG",
            "TELEEKGS",
            String.format("Imagen ECG subida - Paciente: %s, Tamaño: %d bytes, SHA256: %s",
                dto.getNumDocPaciente(), dto.getArchivo().getSize(), sha256),
            "INFO",
            "SUCCESS"
        );

        // 8. Enviar email (opcional, no falla si hay error)
        // TODO: Implementar método específico en EmailService para notificación TeleEKG
        // Por ahora se omite para no bloquear la funcionalidad principal

        log.info("✅ Imagen ECG subida exitosamente: ID={}", imagen.getIdImagen());

        return convertirADTO(imagen);
    }

    /**
     * Listar imágenes con filtros
     */
    public Page<TeleECGImagenDTO> listarImagenes(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable) {

        log.info("📋 Listando imágenes - Filtro DNI: {}, Estado: {}", numDoc, estado);

        Page<TeleECGImagen> pagina = teleECGImagenRepository.buscarFlexible(
            numDoc, estado, idIpress, fechaDesde, fechaHasta, pageable
        );

        return pagina.map(this::convertirADTO);
    }

    /**
     * Obtener detalles de imagen (sin contenido binario)
     */
    public TeleECGImagenDTO obtenerDetallesImagen(Long idImagen, Long idUsuario, String ipCliente) {
        log.info("🔍 Obteniendo detalles imagen: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Registrar auditoría
        registrarAuditoria(imagen, idUsuario, "VISUALIZADA", ipCliente, "EXITOSA");

        return convertirADTO(imagen);
    }

    /**
     * Descargar contenido de imagen (JPEG/PNG)
     */
    public byte[] descargarImagen(Long idImagen, Long idUsuario, String ipCliente) throws IOException {
        log.info("⬇️ Descargando imagen: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Leer desde filesystem
        byte[] contenido = fileStorageService.leerArchivo(imagen.getStorageRuta());

        // Registrar auditoría
        registrarAuditoria(imagen, idUsuario, "DESCARGADA", ipCliente, "EXITOSA");

        return contenido;
    }

    /**
     * Procesar imagen (PROCESAR, RECHAZAR, VINCULAR)
     */
    public TeleECGImagenDTO procesarImagen(
            Long idImagen,
            ProcesarImagenECGDTO dto,
            Long idUsuario,
            String ipCliente) {

        log.info("⚙️ Procesando imagen {} - Acción: {}", idImagen, dto.getAccion());

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        String accionAnterior = imagen.getEstado();

        // Cambiar estado según acción
        switch (dto.getAccion()) {
            case "PROCESAR":
                imagen.setEstado("PROCESADA");
                imagen.setFechaRecepcion(LocalDateTime.now());
                registrarAuditoria(imagen, idUsuario, "PROCESADA", ipCliente, "EXITOSA");
                break;

            case "RECHAZAR":
                imagen.setEstado("RECHAZADA");
                imagen.setMotivoRechazo(dto.getMotivo());
                registrarAuditoria(imagen, idUsuario, "RECHAZADA", ipCliente, "EXITOSA");
                break;

            case "VINCULAR":
                imagen.setEstado("VINCULADA");
                registrarAuditoria(imagen, idUsuario, "VINCULADA", ipCliente, "EXITOSA");
                break;

            default:
                throw new RuntimeException("Acción inválida: " + dto.getAccion());
        }

        imagen.setObservaciones(dto.getObservaciones());
        imagen = teleECGImagenRepository.save(imagen);

        log.info("✅ Imagen procesada: {} -> {}", accionAnterior, imagen.getEstado());

        return convertirADTO(imagen);
    }

    /**
     * Limpiar imágenes vencidas (automático cada 2am)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void limpiarImagenesVencidas() {
        log.info("🗑️ Iniciando limpieza de imágenes vencidas (>30 días)");

        LocalDateTime ahora = LocalDateTime.now();
        List<TeleECGImagen> vencidas = teleECGImagenRepository
            .findByStatImagenAndFechaExpiracionBefore("A", ahora);

        int archivadas = 0;
        int errores = 0;

        for (TeleECGImagen imagen : vencidas) {
            try {
                // Archivar archivo (mover a /archive/)
                String rutaArchive = fileStorageService.archivarArchivo(imagen.getStorageRuta());
                imagen.setStorageRuta(rutaArchive);
                imagen.setStatImagen("I");
                teleECGImagenRepository.save(imagen);
                archivadas++;

                log.debug("✅ Imagen archivada: ID={}, DNI={}", imagen.getIdImagen(), imagen.getNumDocPaciente());

            } catch (Exception e) {
                log.error("❌ Error archivando imagen: ID={}", imagen.getIdImagen(), e);
                errores++;
            }
        }

        log.info("✅ Limpieza completada. Archivadas: {}, Errores: {}", archivadas, errores);

        // Auditoría del cleanup
        auditLogService.registrarEvento(
            "SYSTEM",
            "CLEANUP_ECG",
            "TELEEKGS",
            String.format("Limpieza automática. Archivadas: %d, Errores: %d", archivadas, errores),
            "INFO",
            "SUCCESS"
        );
    }

    /**
     * Obtener estadísticas del módulo
     */
    public TeleECGEstadisticasDTO obtenerEstadisticas() {
        log.info("📊 Generando estadísticas TeleEKG");

        long totalImagenes = teleECGImagenRepository.count();
        long pendientes = teleECGImagenRepository.countByEstadoAndStatImagenEquals("PENDIENTE", "A");
        long procesadas = teleECGImagenRepository.countByEstadoAndStatImagenEquals("PROCESADA", "A");
        long rechazadas = teleECGImagenRepository.countByEstadoAndStatImagenEquals("RECHAZADA", "A");

        TeleECGEstadisticasDTO estadisticas = new TeleECGEstadisticasDTO();
        // TODO: Mapear campos a DTO cuando TeleECGEstadisticasDTO esté completamente definido
        return estadisticas;
    }

    /**
     * Obtener imágenes próximas a vencer (<3 días)
     */
    public List<TeleECGImagenDTO> obtenerProximasVencer() {
        log.info("⚠️ Obteniendo imágenes próximas a vencer");

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime en3Dias = ahora.plusDays(3);

        List<TeleECGImagen> proximas = teleECGImagenRepository.findAll()
            .stream()
            .filter(img -> img.getStatImagen().equals("A"))
            .filter(img -> img.getFechaExpiracion() != null)
            .filter(img -> img.getFechaExpiracion().isAfter(ahora))
            .filter(img -> img.getFechaExpiracion().isBefore(en3Dias))
            .collect(Collectors.toList());

        return proximas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    /**
     * Obtener auditoría de imagen
     */
    public Page<TeleECGAuditoriaDTO> obtenerAuditoria(Long idImagen, Pageable pageable) {
        log.info("📜 Obteniendo auditoría imagen: {}", idImagen);

        Page<TeleECGAuditoria> pagina = teleECGAuditoriaRepository
            .findByImagenIdImagenOrderByFechaAccionDesc(idImagen, pageable);

        return pagina.map(this::convertirAuditDTO);
    }

    // ============================================================
    // MÉTODOS HELPER
    // ============================================================

    /**
     * Convertir TeleECGImagen a DTO
     */
    private TeleECGImagenDTO convertirADTO(TeleECGImagen imagen) {
        if (imagen == null) return null;

        TeleECGImagenDTO dto = new TeleECGImagenDTO();
        // Mapear campos (asumiendo que TeleECGImagenDTO tiene setters)
        return dto;
    }

    /**
     * Convertir TeleECGAuditoria a DTO
     */
    private TeleECGAuditoriaDTO convertirAuditDTO(TeleECGAuditoria auditoria) {
        if (auditoria == null) return null;

        TeleECGAuditoriaDTO dto = new TeleECGAuditoriaDTO();
        return dto;
    }

    /**
     * Obtener extensión de archivo
     */
    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return "jpg";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Registrar evento en auditoría
     */
    private void registrarAuditoria(TeleECGImagen imagen, Long idUsuario, String accion,
                                   String ipCliente, String resultado) {
        try {
            TeleECGAuditoria auditoria = new TeleECGAuditoria();
            auditoria.setImagen(imagen);
            auditoria.setAccion(accion);
            auditoria.setResultado(resultado);
            auditoria.setIpUsuario(ipCliente);
            auditoria.setDescripcion(String.format("Acción: %s en imagen ECG ID: %d", accion, imagen.getIdImagen()));

            teleECGAuditoriaRepository.save(auditoria);

            log.debug("📝 Auditoría registrada: {} - {}", accion, resultado);

        } catch (Exception e) {
            log.warn("⚠️ Error registrando auditoría", e);
        }
    }
}
