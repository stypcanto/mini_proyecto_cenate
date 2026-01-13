package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.TeleECGAuditoriaRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Servicio principal para gestión de electrocardiogramas (TeleEKG)
 *
 * Responsabilidades:
 * - Validar y guardar imágenes ECG (JPEG/PNG, máximo 5MB)
 * - Procesar y vincular imágenes con pacientes
 * - Gestionar auditoría de accesos
 * - Limpiar automáticamente imágenes vencidas (30 días)
 * - Generar estadísticas y reportes
 * - Integrar con EmailService para notificaciones
 * - Integrar con AuditLogService para compliance
 *
 * Seguridad:
 * - Validación de tipos MIME (image/jpeg, image/png)
 * - Limite de tamaño (5MB máximo)
 * - Verificación de integridad con SHA256
 * - Registro de todas las acciones en auditoría
 * - Control de acceso por roles (MBAC)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Slf4j
@Service
public class TeleECGService {

    // ============================================================
    // INYECCIONES DE DEPENDENCIAS
    // ============================================================

    @Autowired
    private TeleECGImagenRepository imagenRepository;

    @Autowired
    private TeleECGAuditoriaRepository auditoriaRepository;

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

    // ============================================================
    // CONSTANTES
    // ============================================================

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"};
    private static final int DIAS_RETENCION = 30; // 30 días

    // ============================================================
    // MÉTODOS PÚBLICOS - UPLOAD DE IMÁGENES
    // ============================================================

    /**
     * CARGA de electrocardiograma desde IPRESS externa
     *
     * Flujo:
     * 1. Validar archivo (tipo, tamaño, hash)
     * 2. Verificar si DNI existe en sistema
     * 3. Si no existe, crear nuevo asegurado automáticamente
     * 4. Guardar imagen en BD (BYTEA)
     * 5. Registrar en auditoría
     * 6. Enviar notificación por email
     *
     * @param dto Contiene imagen, DNI, nombres, apellidos
     * @param ipressOrigen IPRESS que envía el ECG
     * @param usuarioEnvio Usuario/sistema que realizó la carga
     * @return DTO con detalles de la imagen guardada
     * @throws ValidationException Si archivo no es válido
     */
    @Transactional
    public TeleECGImagenDTO subirImagenECG(
            SubirImagenECGDTO dto,
            Long idIpressOrigen,
            Long idUsuarioEnvio,
            String ipOrigen,
            String navegador
    ) {
        log.info("🔄 Iniciando carga de ECG - DNI: {}, IPRESS: {}",
            dto.getNumDocPaciente(), idIpressOrigen);

        // 1️⃣ VALIDAR ARCHIVO
        if (!dto.esArchivoValido()) {
            log.warn("❌ Archivo inválido: {}", dto.getNombreArchivoOriginal());
            throw new ValidationException("El archivo debe ser JPEG o PNG, máximo 5MB");
        }

        MultipartFile archivo = dto.getArchivo();

        // 2️⃣ VALIDAR DNI
        if (!esDNIValido(dto.getNumDocPaciente())) {
            throw new ValidationException("Formato de DNI inválido. Debe tener 8 dígitos");
        }

        // 3️⃣ VERIFICAR DUPLICADOS RECIENTES (últimos 10 minutos)
        String hashArchivo = calcularSHA256(archivo);
        LocalDateTime hace10Minutos = LocalDateTime.now().minusMinutes(10);
        Long duplicados = imagenRepository.contarDuplicados(
            dto.getNumDocPaciente(),
            hashArchivo,
            hace10Minutos
        );
        if (duplicados > 0) {
            log.warn("⚠️ Intento de carga duplicada detectada");
            throw new ValidationException("Esta imagen ya fue cargada recientemente");
        }

        try {
            // 4️⃣ OBTENER IPRESS
            Ipress ipress = ipressRepository.findById(idIpressOrigen)
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada"));

            // 5️⃣ BUSCAR O CREAR ASEGURADO
            Asegurado asegurado = obtenerOCrearAsegurado(dto, ipress);

            // 6️⃣ CREAR ENTIDAD DE IMAGEN
            TeleECGImagen imagen = new TeleECGImagen();
            imagen.setNumDocPaciente(dto.getNumDocPaciente());
            imagen.setNombresPaciente(dto.getNombresPaciente());
            imagen.setApellidosPaciente(dto.getApellidosPaciente());

            // Vincular usuario si existe
            if (asegurado != null && asegurado.getId_usuario() != null) {
                Optional<Usuario> usuario = usuarioRepository.findById(asegurado.getId_usuario());
                usuario.ifPresent(imagen::setUsuarioPaciente);
            }

            // Guardar archivo como bytes
            byte[] contenidoBytes = archivo.getBytes();
            imagen.setContenidoImagen(contenidoBytes);
            imagen.setNombreArchivo(sanitizarNombreArchivo(archivo.getOriginalFilename()));
            imagen.setTipoContenido(archivo.getContentType());
            imagen.setTamanioByte(archivo.getSize());
            imagen.setHashArchivo(hashArchivo);

            // Información de IPRESS
            imagen.setIpressOrigen(ipress);
            imagen.setCodigoIpress(ipress.getCodigo());
            imagen.setNombreIpress(ipress.getNombre());

            // Información del envío
            imagen.setEstado("PENDIENTE");
            imagen.setStatImagen("A");
            imagen.setFechaEnvio(LocalDateTime.now());
            imagen.setFechaExpiracion(LocalDateTime.now().plusDays(DIAS_RETENCION));

            // Información de auditoría
            Optional<Usuario> usuario = usuarioRepository.findById(idUsuarioEnvio);
            usuario.ifPresent(imagen::setCreatedBy);
            imagen.setIpOrigen(ipOrigen);
            imagen.setNavegador(navegador);
            imagen.setRutaAcceso("/api/teleekgs/upload");

            // 7️⃣ GUARDAR EN BD
            imagen = imagenRepository.save(imagen);
            log.info("✅ Imagen guardada - ID: {}, DNI: {}, Tamaño: {} bytes",
                imagen.getIdImagen(), imagen.getNumDocPaciente(), archivo.getSize());

            // 8️⃣ REGISTRAR EN AUDITORÍA
            registrarAuditoria(
                imagen.getIdImagen(),
                idUsuarioEnvio,
                "CARGADA",
                "ECG cargada desde IPRESS - " + ipress.getNombre(),
                "EXITOSA",
                ipOrigen
            );

            // 9️⃣ ENVIAR NOTIFICACIONES
            if (asegurado != null && asegurado.getId_usuario() != null) {
                notificarNuevoAsegurado(asegurado, imagen);
            }

            // 🔟 REGISTRAR EN AUDIT LOG (COMPLIANCE)
            auditLogService.registrarEvento(
                idUsuarioEnvio,
                "TELEEKGS_CARGA",
                "Carga de ECG",
                true,
                "/api/teleekgs/upload"
            );

            return convertirADTO(imagen);

        } catch (Exception e) {
            log.error("❌ Error al subir imagen ECG: {}", e.getMessage(), e);

            // Registrar fallo en auditoría
            registrarAuditoria(
                null,
                idUsuarioEnvio,
                "CARGADA",
                "Error: " + e.getMessage(),
                "FALLIDA",
                ipOrigen
            );

            // Registrar en audit log
            auditLogService.registrarEvento(
                idUsuarioEnvio,
                "TELEEKGS_CARGA_ERROR",
                "Error cargando ECG: " + e.getMessage(),
                false,
                "/api/teleekgs/upload"
            );

            throw new ValidationException("Error al procesar la imagen: " + e.getMessage());
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS - LISTADO Y BÚSQUEDA
    // ============================================================

    /**
     * Lista imágenes ECG con filtros y paginación
     */
    @Transactional(readOnly = true)
    public Page<TeleECGImagenDTO> listarImagenes(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable) {

        log.debug("🔍 Buscando imágenes - DNI: {}, Estado: {}, IPRESS: {}",
            numDoc, estado, idIpress);

        Page<TeleECGImagen> imagenes = imagenRepository.buscarFlexible(
            numDoc,
            estado,
            idIpress,
            fechaDesde,
            fechaHasta,
            pageable
        );

        return imagenes.map(this::convertirADTO);
    }

    /**
     * Obtiene detalles completos de una imagen
     */
    @Transactional
    public TeleECGImagenDTO obtenerDetallesImagen(Long idImagen, Long idUsuario, String ipUsuario) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada"));

        // Registrar visualización en auditoría
        registrarAuditoria(
            idImagen,
            idUsuario,
            "VISUALIZADA",
            "Detalles de imagen consultados",
            "EXITOSA",
            ipUsuario
        );

        return convertirADTO(imagen);
    }

    /**
     * Descarga el contenido binario de la imagen (JPEG/PNG)
     */
    @Transactional
    public byte[] descargarImagen(Long idImagen, Long idUsuario, String ipUsuario) {
        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada"));

        if (imagen.getContenidoImagen() == null || imagen.getContenidoImagen().length == 0) {
            throw new ValidationException("La imagen no contiene datos");
        }

        // Registrar descarga en auditoría
        registrarAuditoria(
            idImagen,
            idUsuario,
            "DESCARGADA",
            "Archivo descargado: " + imagen.getNombreArchivo(),
            "EXITOSA",
            ipUsuario
        );

        log.info("📥 Descargando imagen {} - Usuario: {}", idImagen, idUsuario);

        return imagen.getContenidoImagen();
    }

    // ============================================================
    // MÉTODOS PÚBLICOS - PROCESAMIENTO
    // ============================================================

    /**
     * Procesa una imagen ECG (acepta o rechaza)
     */
    @Transactional
    public TeleECGImagenDTO procesarImagen(
            Long idImagen,
            ProcesarImagenECGDTO dto,
            Long idUsuario,
            String ipUsuario) {

        TeleECGImagen imagen = imagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada"));

        if (!dto.esValido()) {
            throw new ValidationException("Solicitud de procesamiento inválida");
        }

        try {
            String accion = dto.getAccion().toUpperCase();

            if ("PROCESAR".equals(accion) || "ACEPTAR".equals(accion)) {
                imagen.setEstado("PROCESADA");
                imagen.setFechaRecepcion(LocalDateTime.now());

                Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
                usuario.ifPresent(imagen::setUsuarioReceptor);

                registrarAuditoria(
                    idImagen,
                    idUsuario,
                    "PROCESADA",
                    "Imagen aceptada y procesada",
                    "EXITOSA",
                    ipUsuario
                );

                log.info("✅ Imagen {} procesada por usuario {}", idImagen, idUsuario);

            } else if ("RECHAZAR".equals(accion)) {
                imagen.setEstado("RECHAZADA");
                imagen.setMotivoRechazo(dto.getMotivo());
                imagen.setObservaciones(dto.getObservaciones());
                imagen.setFechaRecepcion(LocalDateTime.now());

                Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
                usuario.ifPresent(imagen::setUsuarioReceptor);

                registrarAuditoria(
                    idImagen,
                    idUsuario,
                    "RECHAZADA",
                    "Motivo: " + dto.getMotivo(),
                    "EXITOSA",
                    ipUsuario
                );

                log.warn("❌ Imagen {} rechazada - Motivo: {}", idImagen, dto.getMotivo());

            } else if ("VINCULAR".equals(accion)) {
                if (dto.getIdUsuarioVincular() == null) {
                    throw new ValidationException("ID de usuario requerido para vinculación");
                }

                Usuario usuarioVincular = usuarioRepository.findById(dto.getIdUsuarioVincular())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                imagen.setUsuarioPaciente(usuarioVincular);
                imagen.setEstado("VINCULADA");

                registrarAuditoria(
                    idImagen,
                    idUsuario,
                    "VINCULADA",
                    "Vinculada a usuario: " + usuarioVincular.getNombre(),
                    "EXITOSA",
                    ipUsuario
                );

                log.info("🔗 Imagen {} vinculada a usuario {}", idImagen, usuarioVincular.getId());
            }

            imagen.setUpdatedAt(LocalDateTime.now());
            Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
            usuario.ifPresent(imagen::setUpdatedBy);

            imagen = imagenRepository.save(imagen);

            auditLogService.registrarEvento(
                idUsuario,
                "TELEEKGS_PROCESAR",
                accion,
                true,
                "/api/teleekgs/" + idImagen + "/procesar"
            );

            return convertirADTO(imagen);

        } catch (Exception e) {
            log.error("❌ Error al procesar imagen {}: {}", idImagen, e.getMessage(), e);
            throw new ValidationException("Error al procesar imagen: " + e.getMessage());
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS - ESTADÍSTICAS
    // ============================================================

    /**
     * Obtiene estadísticas resumidas del módulo TeleEKG
     */
    @Transactional(readOnly = true)
    public TeleECGEstadisticasDTO obtenerEstadisticas() {
        TeleECGEstadisticasDTO dto = TeleECGEstadisticasDTO.builder()
            .fecha(LocalDateTime.now().toLocalDate())
            .totalImagenesCargadas(imagenRepository.countByEstadoAndStatImagenEquals("PENDIENTE", "A") +
                imagenRepository.countByEstadoAndStatImagenEquals("PROCESADA", "A") +
                imagenRepository.countByEstadoAndStatImagenEquals("RECHAZADA", "A") +
                imagenRepository.countByEstadoAndStatImagenEquals("VINCULADA", "A"))
            .totalImagenesProcesadas(imagenRepository.countByEstadoAndStatImagenEquals("PROCESADA", "A"))
            .totalImagenesRechazadas(imagenRepository.countByEstadoAndStatImagenEquals("RECHAZADA", "A"))
            .totalImagenesVinculadas(imagenRepository.countByEstadoAndStatImagenEquals("VINCULADA", "A"))
            .totalImagenesPendientes(imagenRepository.countByEstadoAndStatImagenEquals("PENDIENTE", "A"))
            .build();

        // Calcular tasas
        if (dto.getTotalImagenesCargadas() > 0) {
            dto.setTasaRechazoPorcentaje(
                (dto.getTotalImagenesRechazadas().doubleValue() / dto.getTotalImagenesCargadas()) * 100
            );
            dto.setTasaVinculacionPorcentaje(
                (dto.getTotalImagenesVinculadas().doubleValue() /
                 (dto.getTotalImagenesProcesadas() > 0 ? dto.getTotalImagenesProcesadas() : 1)) * 100
            );
            dto.setTasaProcesamiento Porcentaje(
                ((dto.getTotalImagenesProcesadas() + dto.getTotalImagenesRechazadas()).doubleValue() /
                 dto.getTotalImagenesCargadas()) * 100
            );
            dto.setDiasRestantes(
                (int) (dto.getTotalImagenesPendientes().doubleValue() / 30 * 100) // Estimado
            );
        }

        dto.determinarStatus();
        return dto;
    }

    // ============================================================
    // MÉTODOS PRIVADOS - VALIDACIÓN
    // ============================================================

    /**
     * Valida que el DNI tenga formato correcto (8 dígitos)
     */
    private boolean esDNIValido(String dni) {
        return dni != null && dni.matches("^\\d{8}$");
    }

    /**
     * Calcula el hash SHA256 de un archivo
     */
    private String calcularSHA256(MultipartFile archivo) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(archivo.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("❌ Error al calcular SHA256: {}", e.getMessage());
            throw new ValidationException("Error al procesar archivo");
        }
    }

    /**
     * Sanitiza el nombre del archivo (previene path traversal)
     */
    private String sanitizarNombreArchivo(String nombreOriginal) {
        if (nombreOriginal == null) {
            return "ecg_" + System.currentTimeMillis() + ".jpg";
        }
        return nombreOriginal
            .replaceAll("[^a-zA-Z0-9._-]", "_")
            .replaceAll("\\.\\.+", ".")
            .substring(0, Math.min(255, nombreOriginal.length()));
    }

    // ============================================================
    // MÉTODOS PRIVADOS - ASEGURADOS
    // ============================================================

    /**
     * Obtiene asegurado existente o crea uno nuevo si no existe
     */
    private Asegurado obtenerOCrearAsegurado(SubirImagenECGDTO dto, Ipress ipress) {
        try {
            // Buscar si existe asegurado con este DNI
            Optional<Asegurado> aseguradoExistente = aseguradoRepository.findByDocPaciente(dto.getNumDocPaciente());

            if (aseguradoExistente.isPresent()) {
                log.info("📋 Asegurado encontrado para DNI: {}", dto.getNumDocPaciente());
                return aseguradoExistente.get();
            }

            // Crear nuevo asegurado
            log.info("➕ Creando nuevo asegurado para DNI: {}", dto.getNumDocPaciente());
            Asegurado nuevoAsegurado = new Asegurado();
            nuevoAsegurado.setDocPaciente(dto.getNumDocPaciente());
            nuevoAsegurado.setPaciente(dto.getNombresPaciente() + " " + dto.getApellidosPaciente());

            // Aquí se podría crear también un Usuario vinculado
            // Por ahora solo guardamos el asegurado

            return aseguradoRepository.save(nuevoAsegurado);

        } catch (Exception e) {
            log.warn("⚠️ No se pudo obtener/crear asegurado: {}", e.getMessage());
            return null;
        }
    }

    // ============================================================
    // MÉTODOS PRIVADOS - AUDITORÍA Y NOTIFICACIONES
    // ============================================================

    /**
     * Registra una acción en la tabla de auditoría
     */
    private void registrarAuditoria(
            Long idImagen,
            Long idUsuario,
            String accion,
            String descripcion,
            String resultado,
            String ipOrigen) {
        try {
            if (idImagen != null) {
                TeleECGImagen imagen = imagenRepository.findById(idImagen).orElse(null);
                if (imagen != null) {
                    TeleECGAuditoria auditoria = new TeleECGAuditoria();
                    auditoria.setImagen(imagen);

                    if (idUsuario != null) {
                        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
                        auditoria.setUsuario(usuario);
                        if (usuario != null) {
                            auditoria.setNombreUsuario(usuario.getNombre());
                        }
                    }

                    auditoria.setAccion(accion);
                    auditoria.setDescripcion(descripcion);
                    auditoria.setResultado(resultado);
                    auditoria.setIpUsuario(ipOrigen);
                    auditoria.setFechaAccion(LocalDateTime.now());

                    auditoriaRepository.save(auditoria);
                }
            }
        } catch (Exception e) {
            log.error("⚠️ Error al registrar auditoría: {}", e.getMessage());
        }
    }

    /**
     * Envía notificación al nuevo asegurado
     */
    private void notificarNuevoAsegurado(Asegurado asegurado, TeleECGImagen imagen) {
        try {
            if (asegurado.getCorreoElectronico() != null) {
                String asunto = "Tu electrocardiograma ha sido recibido - CENATE";
                String mensaje = String.format(
                    "Hola %s,\n\n" +
                    "Hemos recibido tu electrocardiograma enviado por %s.\n" +
                    "Tu ECG será procesado por nuestro personal médico en breve.\n" +
                    "Te notificaremos cuando esté listo.\n\n" +
                    "Saludos,\nCENATE",
                    asegurado.getPaciente(),
                    imagen.getNombreIpress()
                );

                emailService.enviarCorreo(
                    asegurado.getCorreoElectronico(),
                    asunto,
                    mensaje
                );

                log.info("📧 Notificación enviada a: {}", asegurado.getCorreoElectronico());
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudo enviar notificación: {}", e.getMessage());
        }
    }

    // ============================================================
    // MÉTODOS PRIVADOS - CONVERSIÓN DE OBJETOS
    // ============================================================

    /**
     * Convierte entidad TeleECGImagen a DTO (sin contenido binario)
     */
    private TeleECGImagenDTO convertirADTO(TeleECGImagen imagen) {
        String nombreCompleto = imagen.getNombresPaciente() != null && imagen.getApellidosPaciente() != null ?
            imagen.getApellidosPaciente() + ", " + imagen.getNombresPaciente() :
            "N/A";

        int diasRestantes = (int) java.time.temporal.ChronoUnit.DAYS.between(
            LocalDateTime.now(),
            imagen.getFechaExpiracion()
        );

        String vigencia = diasRestantes < 0 ? "VENCIDA" :
                         diasRestantes <= 3 ? "PROXIMO_A_VENCER" : "VIGENTE";

        Long totalAccesos = auditoriaRepository.countByImagenIdImagen(imagen.getIdImagen());

        return TeleECGImagenDTO.builder()
            .idImagen(imagen.getIdImagen())
            .numDocPaciente(imagen.getNumDocPaciente())
            .nombresPaciente(imagen.getNombresPaciente())
            .apellidosPaciente(imagen.getApellidosPaciente())
            .pacienteNombreCompleto(nombreCompleto)
            .codigoIpress(imagen.getCodigoIpress())
            .nombreIpress(imagen.getNombreIpress())
            .nombreArchivo(imagen.getNombreArchivo())
            .tipoContenido(imagen.getTipoContenido())
            .tamanioByte(imagen.getTamanioByte())
            .tamanoFormato(TeleECGImagenDTO.formatoTamanio(imagen.getTamanioByte()))
            .hashArchivo(imagen.getHashArchivo())
            .estado(imagen.getEstado())
            .estadoFormato(TeleECGImagenDTO.formatoEstado(imagen.getEstado()))
            .motivoRechazo(imagen.getMotivoRechazo())
            .observaciones(imagen.getObservaciones())
            .fechaEnvio(imagen.getFechaEnvio())
            .fechaRecepcion(imagen.getFechaRecepcion())
            .fechaExpiracion(imagen.getFechaExpiracion())
            .diasRestantes(diasRestantes)
            .vigencia(vigencia)
            .statImagen(imagen.getStatImagen())
            .totalAccesos(totalAccesos)
            .createdAt(imagen.getCreatedAt())
            .updatedAt(imagen.getUpdatedAt())
            .build();
    }

    // ============================================================
    // MÉTODOS SCHEDULED - LIMPEZA AUTOMÁTICA
    // ============================================================

    /**
     * LIMPIEZA AUTOMÁTICA: Marca imágenes vencidas como inactivas
     * Ejecutada diariamente a las 2:00 AM
     *
     * Lógica:
     * - Busca imágenes con estado ACTIVO (stat_imagen = 'A')
     * - Cuya fecha de expiración es anterior a ahora
     * - Las marca como INACTIVAS (stat_imagen = 'I')
     * - Registra en logs para auditoría
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2:00 AM todos los días
    @Transactional
    public void limpiarImagenesVencidas() {
        log.info("🧹 Iniciando limpieza de imágenes vencidas...");

        try {
            LocalDateTime ahora = LocalDateTime.now();
            int imagenesActualizadas = imagenRepository.marcarComoInactivas("A", ahora);

            log.info("✅ Limpieza completada - {} imágenes marcadas como inactivas", imagenesActualizadas);

            // Registrar evento de limpieza
            auditLogService.registrarEvento(
                1L, // Sistema
                "TELEEKGS_LIMPIEZA",
                "Limpieza automática: " + imagenesActualizadas + " imágenes inactivadas",
                true,
                "/scheduler/teleekgs/limpiar"
            );

        } catch (Exception e) {
            log.error("❌ Error durante limpieza de imágenes: {}", e.getMessage(), e);

            auditLogService.registrarEvento(
                1L,
                "TELEEKGS_LIMPIEZA_ERROR",
                "Error en limpieza: " + e.getMessage(),
                false,
                "/scheduler/teleekgs/limpiar"
            );
        }
    }
}
