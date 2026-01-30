package com.styp.cenate.service.solicitud;

import com.styp.cenate.dto.SolicitudRegistroDTO;
import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.model.AccountRequest;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.AccountRequestRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.DimOrigenPersonalRepository;
import com.styp.cenate.repository.TipoDocumentoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.usuario.UsuarioService;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.DimOrigenPersonal;
import com.styp.cenate.model.TipoDocumento;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.mbac.PermisosService;
import com.styp.cenate.service.security.PasswordTokenService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.dto.mbac.PermisoUsuarioRequestDTO;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccountRequestService {

    private final AccountRequestRepository accountRequestRepository;
    private final UsuarioRepository usuarioRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioService usuarioService;
    private final JdbcTemplate jdbcTemplate;
    private final PersonalCntRepository personalCntRepository;
    private final DimOrigenPersonalRepository dimOrigenPersonalRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final EmailService emailService;
    private final PermisosService permisosService;
    private final PasswordTokenService passwordTokenService;
    private final AuditLogService auditLogService;

    // ================================================================
    // MÉTODO HELPER PARA AUDITORÍA
    // ================================================================
    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = "SYSTEM";
            try {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getName() != null) {
                    usuario = auth.getName();
                }
            } catch (Exception ignored) {}
            auditLogService.registrarEvento(usuario, action, "SOLICITUDES", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar auditoría: {}", e.getMessage());
        }
    }

    @Transactional
    public SolicitudRegistroDTO crearSolicitud(SolicitudRegistroDTO dto) {
        log.info("Creando solicitud de registro para: {} {}", dto.getNombres(), dto.getApellidoPaterno());

        // Verificar si existe una solicitud ACTIVA (PENDIENTE o APROBADO) - permite re-registro si fue RECHAZADO
        if (accountRequestRepository.existsSolicitudActivaByNumDocumento(dto.getNumeroDocumento())) {
            throw new RuntimeException("Ya existe una solicitud pendiente o aprobada con este número de documento");
        }

        if (dto.getCorreoPersonal() != null && !dto.getCorreoPersonal().isBlank()
                && accountRequestRepository.existsSolicitudActivaByCorreoPersonal(dto.getCorreoPersonal())) {
            throw new RuntimeException("Ya existe una solicitud pendiente o aprobada con este correo electrónico");
        }

        // Nota: Validación de documento duplicado se hace al crear el usuario

        Ipress ipress = ipressRepository.findById(dto.getIdIpress())
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada"));

        AccountRequest solicitud = AccountRequest.builder()
                .tipoDocumento(dto.getTipoDocumento())
                .numDocumento(dto.getNumeroDocumento())
                .nombres(dto.getNombres())
                .apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno())
                .nombreCompleto(dto.getNombres() + " " + dto.getApellidoPaterno() + " " + dto.getApellidoMaterno())
                .genero(dto.getGenero())
                .fechaNacimiento(dto.getFechaNacimiento())
                .correoPersonal(dto.getCorreoPersonal())
                .correoInstitucional(dto.getCorreoInstitucional())
                .emailPreferido(dto.getEmailPreferido() != null ? dto.getEmailPreferido() : "PERSONAL")
                .telefono(dto.getTelefono())
                .tipoUsuario(dto.getTipoPersonal())
                .idIpress(dto.getIdIpress())
                .estado("PENDIENTE")
                .motivo("Solicitud de registro desde formulario web")
                .build();

        solicitud = accountRequestRepository.save(solicitud);

        log.info("Solicitud creada exitosamente: ID {}", solicitud.getIdRequest());

        return convertirADTO(solicitud, ipress);
    }

    public List<SolicitudRegistroDTO> listarTodasLasSolicitudes() {
        log.info("Listando todas las solicitudes de registro");
        
        List<AccountRequest> solicitudes = accountRequestRepository.findAllByOrderByFechaCreacionDesc();
        
        return solicitudes.stream()
                .map(this::convertirADTOConIpress)
                .collect(Collectors.toList());
    }

    public List<SolicitudRegistroDTO> listarSolicitudesPendientes() {
        log.info("Listando solicitudes pendientes");
        
        List<AccountRequest> solicitudes = accountRequestRepository.findSolicitudesPendientes();
        
        return solicitudes.stream()
                .map(this::convertirADTOConIpress)
                .collect(Collectors.toList());
    }

    @Transactional
    public SolicitudRegistroDTO aprobarSolicitud(Long idRequest) {
        log.info("Aprobando solicitud ID: {}", idRequest);

        AccountRequest solicitud = accountRequestRepository.findById(idRequest)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!solicitud.isPendiente()) {
            throw new RuntimeException("Solo se pueden aprobar solicitudes pendientes");
        }

        String usernameAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario admin = usuarioRepository.findByNameUser(usernameAdmin)
                .orElseThrow(() -> new RuntimeException("Usuario administrador no encontrado"));

        try {
            UsuarioCreateRequest usuarioRequest = new UsuarioCreateRequest();
            usuarioRequest.setUsername(solicitud.getNumDocumento());
            usuarioRequest.setPassword(generarPasswordTemporal(solicitud.getNumDocumento()));
            usuarioRequest.setNombres(solicitud.getNombres());
            usuarioRequest.setApellido_paterno(solicitud.getApellidoPaterno());
            usuarioRequest.setApellido_materno(solicitud.getApellidoMaterno());
            usuarioRequest.setNumero_documento(solicitud.getNumDocumento());
            usuarioRequest.setTipo_documento(solicitud.getTipoDocumento());
            usuarioRequest.setGenero(solicitud.getGenero());
            usuarioRequest.setFecha_nacimiento(solicitud.getFechaNacimiento().toString());
            usuarioRequest.setTelefono(solicitud.getTelefono());
            usuarioRequest.setCorreo_personal(solicitud.getCorreoPersonal());
            usuarioRequest.setCorreo_corporativo(solicitud.getCorreoInstitucional());
            usuarioRequest.setTipo_personal(solicitud.getTipoUsuario());
            usuarioRequest.setIdIpress(solicitud.getIdIpress());
            usuarioRequest.setEstado("ACTIVO");

            // ================================================================
            // ASIGNACIÓN AUTOMÁTICA DE ROL SEGÚN IPRESS
            // ================================================================
            String rolAsignado;
            if (solicitud.isExterno()) {
                // Usuarios externos siempre reciben INSTITUCION_EX
                rolAsignado = "INSTITUCION_EX";
                log.info("Usuario EXTERNO → Rol asignado: INSTITUCION_EX");
            } else {
                // Usuarios internos: depende de la IPRESS
                if (solicitud.getIdIpress() != null) {
                    Ipress ipress = ipressRepository.findById(solicitud.getIdIpress()).orElse(null);
                    if (ipress != null) {
                        String nombreIpress = ipress.getDescIpress();
                        if ("CENTRO NACIONAL DE TELEMEDICINA".equalsIgnoreCase(nombreIpress)) {
                            rolAsignado = "USER";
                            log.info("Usuario INTERNO de CENATE → Rol asignado: USER");
                        } else {
                            rolAsignado = "INSTITUCION_EX";
                            log.info("Usuario INTERNO de otra institución ({}) → Rol asignado: INSTITUCION_EX", nombreIpress);
                        }
                    } else {
                        // Si no se encuentra la IPRESS, asignar USER por defecto
                        rolAsignado = "USER";
                        log.warn("IPRESS no encontrada (ID: {}) → Asignando USER por defecto", solicitud.getIdIpress());
                    }
                } else {
                    // Si no tiene IPRESS, asignar USER por defecto
                    rolAsignado = "USER";
                    log.warn("Usuario sin IPRESS asignada → Asignando USER por defecto");
                }
            }

            usuarioRequest.setRol(rolAsignado);
            var usuarioCreado = usuarioService.createUser(usuarioRequest);
            Long idUsuario = usuarioCreado.getIdUser();

            // ⚠️ NOTA: Para usuarios INTERNOS, PersonalCnt ya se crea en UsuarioServiceImpl.createUser()
            // Solo necesitamos crear PersonalExterno para usuarios EXTERNOS
            if (solicitud.isExterno()) {
                crearPersonalExterno(solicitud, idUsuario);

                // Asignar permisos automáticos para el módulo de Personal Externo
                asignarPermisosUsuarioExterno(idUsuario);
            }
            // Para usuarios internos, NO llamamos a crearPersonalCNT() porque ya se crea en createUser()

            solicitud.setEstado("APROBADO");
            solicitud.setIdAdmin(admin.getIdUser());
            solicitud.setFechaRespuesta(LocalDateTime.now());
            solicitud.setObservacionAdmin("Solicitud aprobada - Usuario creado");

            solicitud = accountRequestRepository.save(solicitud);

            log.info("Solicitud aprobada, usuario y personal creados: {}", solicitud.getNumDocumento());

            // Registrar en auditoría
            auditar("APPROVE_REQUEST",
                    String.format("Solicitud aprobada ID:%d - Usuario creado: %s (%s)",
                            idRequest, solicitud.getNumDocumento(), solicitud.getNombreCompleto()),
                    "INFO", "SUCCESS");

            // Enviar correo con enlace para configurar contraseña (sistema seguro de tokens)
            Usuario usuarioNuevo = usuarioRepository.findById(idUsuario).orElse(null);
            if (usuarioNuevo != null) {
                // Usar el correo preferido del usuario según su selección
                String emailDestino = solicitud.obtenerCorreoPreferido();
                String nombreCompleto = solicitud.getNombreCompleto();

                log.info("Preparando envío de correo a: {} (preferencia: {}) para usuario: {}",
                        emailDestino, solicitud.getEmailPreferido(), nombreCompleto);

                boolean emailEnviado = passwordTokenService.crearTokenYEnviarEmailDirecto(
                        usuarioNuevo, emailDestino, nombreCompleto, "BIENVENIDO");
                if (emailEnviado) {
                    log.info("Correo con enlace de configuración enviado a: {}", emailDestino);
                } else {
                    log.warn("No se pudo enviar correo a: {}", emailDestino);
                }
            } else {
                log.error("No se encontró el usuario recién creado con ID: {}", idUsuario);
            }

            return convertirADTOConIpress(solicitud);
            
        } catch (Exception e) {
            log.error("Error al aprobar solicitud: {}", e.getMessage(), e);
            throw new RuntimeException("Error al crear usuario y personal: " + e.getMessage());
        }
    }

    private void crearPersonalCNT(AccountRequest solicitud, Long idUsuario) {
        log.info("Creando registro en dim_personal_cnt para: {}", solicitud.getNumDocumento());

        Long idTipDoc = obtenerIdTipoDocumento(solicitud.getTipoDocumento());

        String sql = """
            INSERT INTO dim_personal_cnt (
                id_tip_doc, num_doc_pers, nom_pers, ape_pater_pers, ape_mater_pers,
                fech_naci_pers, gen_pers, movil_pers, email_pers, email_corp_pers,
                id_ipress, id_usuario, stat_pers, per_pers, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'A', '202501', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """;

        jdbcTemplate.update(sql,
                idTipDoc,
                solicitud.getNumDocumento(),
                solicitud.getNombres(),
                solicitud.getApellidoPaterno(),
                solicitud.getApellidoMaterno(),
                solicitud.getFechaNacimiento(),
                solicitud.getGenero(),
                solicitud.getTelefono(),
                solicitud.getCorreoPersonal(),
                solicitud.getCorreoInstitucional(),
                solicitud.getIdIpress(),
                idUsuario
        );

        log.info("Personal CNT creado exitosamente");
    }

    private void crearPersonalExterno(AccountRequest solicitud, Long idUsuario) {
        log.info("Creando registro en dim_personal_cnt (EXTERNO) para: {}", solicitud.getNumDocumento());

        // Obtener TipoDocumento usando JPA
        String tipoDocStr = solicitud.getTipoDocumento() != null ? solicitud.getTipoDocumento() : "DNI";
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findByDescTipDocIgnoreCase(tipoDocStr)
                .orElseGet(() -> tipoDocumentoRepository.findById(1L).orElse(null));

        // Obtener Ipress usando JPA
        Ipress ipress = ipressRepository.findById(solicitud.getIdIpress()).orElse(null);

        // Obtener Usuario usando JPA
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);

        // Obtener el origen EXTERNO (id_origen = 2)
        DimOrigenPersonal origenExterno = dimOrigenPersonalRepository.findById(2L)
                .orElseThrow(() -> new RuntimeException("Origen EXTERNO (id=2) no encontrado en dim_origen_personal"));

        // Normalizar género a 1 carácter
        String genero = solicitud.getGenero();
        if (genero != null && !genero.isBlank()) {
            genero = genero.trim().toUpperCase();
            if (genero.startsWith("M")) genero = "M";
            else if (genero.startsWith("F")) genero = "F";
            else genero = genero.substring(0, 1);
        }

        // Generar período actual (YYYYMM)
        String periodoActual = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));

        // Crear PersonalCnt con id_origen = 2 (EXTERNO)
        PersonalCnt personalCnt = PersonalCnt.builder()
                .tipoDocumento(tipoDocumento)
                .numDocPers(solicitud.getNumDocumento())
                .nomPers(solicitud.getNombres())
                .apePaterPers(solicitud.getApellidoPaterno())
                .apeMaterPers(solicitud.getApellidoMaterno())
                .fechNaciPers(solicitud.getFechaNacimiento())
                .genPers(genero)
                .movilPers(solicitud.getTelefono())
                .emailPers(solicitud.getCorreoPersonal())
                .emailCorpPers(solicitud.getCorreoInstitucional())
                .emailPreferido(solicitud.getEmailPreferido() != null ? solicitud.getEmailPreferido() : "PERSONAL") // 🆕 Preferencia de correo
                .ipress(ipress)
                .usuario(usuario)
                .origenPersonal(origenExterno)  // ⚠️ EXTERNO = id_origen 2
                .perPers(periodoActual)         // ⚠️ Período requerido
                .statPers("A")                  // Estado Activo
                .build();

        personalCntRepository.save(personalCnt);
        log.info("Personal EXTERNO creado exitosamente en dim_personal_cnt con ID: {}", personalCnt.getIdPers());
    }

    /**
     * Asigna permisos automáticos al usuario externo para el módulo de Personal Externo
     * - Módulo: Gestión de Personal Externo (id_modulo = 20)
     * - Página: Formulario de Diagnóstico (id_pagina = 59)
     * - Rol: INSTITUCION_EX (id_rol = 18)
     */
    private void asignarPermisosUsuarioExterno(Long idUsuario) {
        log.info("Asignando permisos automáticos al usuario externo ID: {}", idUsuario);

        try {
            // Configuración de IDs (según la estructura actual de la BD)
            final int ID_MODULO_EXTERNO = 20;      // Gestión de Personal Externo
            final int ID_PAGINA_FORMULARIO = 59;   // Formulario de Diagnóstico
            final int ID_ROL_EXTERNO = 18;         // INSTITUCION_EX

            PermisoUsuarioRequestDTO permiso = PermisoUsuarioRequestDTO.builder()
                    .idUser(idUsuario)
                    .idRol(ID_ROL_EXTERNO)
                    .idModulo(ID_MODULO_EXTERNO)
                    .idPagina(ID_PAGINA_FORMULARIO)
                    .rutaPagina("/roles/externo/formulario-diagnostico")
                    .accion("all")
                    .ver(true)
                    .crear(true)
                    .editar(true)
                    .eliminar(false)
                    .exportar(true)
                    .aprobar(false)
                    .build();

            permisosService.guardarOActualizarPermiso(permiso);
            log.info("Permisos asignados exitosamente al usuario externo ID: {}", idUsuario);

        } catch (Exception e) {
            log.error("Error al asignar permisos al usuario externo: {}", e.getMessage());
            // No lanzamos excepción para no bloquear la creación del usuario
        }
    }

    private Long obtenerIdTipoDocumento(String tipoDoc) {
        String sql = "SELECT id_tip_doc FROM dim_tipo_documento WHERE desc_tip_doc ILIKE ? LIMIT 1";
        
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, "%" + tipoDoc + "%");
        } catch (Exception e) {
            log.warn("No se encontró tipo documento: {}, usando 1 (DNI) por defecto", tipoDoc);
            return 1L;
        }
    }

    @Transactional
    public SolicitudRegistroDTO rechazarSolicitud(Long idRequest, String motivoRechazo) {
        log.info("Rechazando solicitud ID: {}", idRequest);

        AccountRequest solicitud = accountRequestRepository.findById(idRequest)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!solicitud.isPendiente()) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes pendientes");
        }

        String usernameAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario admin = usuarioRepository.findByNameUser(usernameAdmin)
                .orElseThrow(() -> new RuntimeException("Usuario administrador no encontrado"));

        solicitud.setEstado("RECHAZADO");
        solicitud.setObservacionAdmin(motivoRechazo);
        solicitud.setIdAdmin(admin.getIdUser());
        solicitud.setFechaRespuesta(LocalDateTime.now());

        solicitud = accountRequestRepository.save(solicitud);

        log.info("Solicitud rechazada: {}", solicitud.getNumDocumento());

        // Registrar en auditoría
        auditar("REJECT_REQUEST",
                String.format("Solicitud rechazada ID:%d - DNI: %s (%s). Motivo: %s",
                        idRequest, solicitud.getNumDocumento(), solicitud.getNombreCompleto(), motivoRechazo),
                "WARNING", "SUCCESS");

        // Enviar correo de rechazo usando el correo preferido del usuario
        String emailDestino = solicitud.obtenerCorreoPreferido();

        if (emailDestino != null && !emailDestino.isBlank()) {
            String nombreCompleto = solicitud.getNombreCompleto();
            emailService.enviarCorreoRechazoSolicitud(
                    emailDestino,
                    nombreCompleto,
                    motivoRechazo
            );
            log.info("Correo de rechazo enviado a: {} (preferencia: {})", emailDestino, solicitud.getEmailPreferido());
        }

        return convertirADTOConIpress(solicitud);
    }

    public Map<String, Long> obtenerEstadisticas() {
        return Map.of(
                "pendientes", accountRequestRepository.countByEstado("PENDIENTE"),
                "aprobadas", accountRequestRepository.countByEstado("APROBADO"),
                "rechazadas", accountRequestRepository.countByEstado("RECHAZADO")
        );
    }

    private String generarPasswordTemporal(String numeroDocumento) {
        // Genera contraseña temporal aleatoria y segura
        return passwordTokenService.generarPasswordTemporal();
    }

    private SolicitudRegistroDTO convertirADTO(AccountRequest solicitud, Ipress ipress) {
        return SolicitudRegistroDTO.builder()
                .idSolicitud(solicitud.getIdRequest())
                .tipoDocumento(solicitud.getTipoDocumento())
                .numeroDocumento(solicitud.getNumDocumento())
                .nombres(solicitud.getNombres())
                .apellidoPaterno(solicitud.getApellidoPaterno())
                .apellidoMaterno(solicitud.getApellidoMaterno())
                .genero(solicitud.getGenero())
                .fechaNacimiento(solicitud.getFechaNacimiento())
                .correoPersonal(solicitud.getCorreoPersonal())
                .correoInstitucional(solicitud.getCorreoInstitucional())
                .emailPreferido(solicitud.getEmailPreferido())
                .telefono(solicitud.getTelefono())
                .tipoPersonal(solicitud.getTipoUsuario())
                .idIpress(solicitud.getIdIpress())
                .nombreIpress(ipress != null ? ipress.getDescIpress() : null)
                .codigoIpress(ipress != null ? ipress.getCodIpress() : null)
                .estado(solicitud.getEstado())
                .motivoRechazo(solicitud.getObservacionAdmin())
                .revisadoPor(solicitud.getIdAdmin())
                .fechaRevision(solicitud.getFechaRespuesta())
                .createdAt(solicitud.getFechaCreacion())
                .updatedAt(solicitud.getUpdatedAt())
                .build();
    }

    private SolicitudRegistroDTO convertirADTOConIpress(AccountRequest solicitud) {
        Ipress ipress = ipressRepository.findById(solicitud.getIdIpress()).orElse(null);
        return convertirADTO(solicitud, ipress);
    }

    // ================================================================
    // MÉTODOS PARA USUARIOS PENDIENTES DE ACTIVACIÓN
    // ================================================================

    /**
     * Lista usuarios que fueron creados pero aún no han activado su cuenta
     * (requiere_cambio_password = true)
     */
    public List<Map<String, Object>> listarUsuariosPendientesActivacion() {
        log.info("Consultando usuarios pendientes de activación");

        String sql = """
            SELECT
                u.id_user,
                u.name_user,
                u.stat_user,
                u.created_at,
                p.id_pers,
                p.nom_pers,
                p.ape_pater_pers,
                p.ape_mater_pers,
                p.email_pers,
                p.email_corp_pers,
                p.movil_pers,
                i.desc_ipress,
                i.id_ipress,
                r.id_red,
                r.desc_red,
                m.id_macro,
                m.desc_macro
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
            LEFT JOIN dim_red r ON r.id_red = COALESCE(u.id_red, i.id_red)
            LEFT JOIN dim_macroregion m ON m.id_macro = r.id_macro
            WHERE u.requiere_cambio_password = true
            ORDER BY u.created_at DESC
        """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql);

        log.info("📊 Total usuarios pendientes encontrados: {}", resultados.size());
        if (!resultados.isEmpty()) {
            Map<String, Object> firstRow = resultados.get(0);
            log.info("🔍 Primer usuario (DEBUG): id_red={}, desc_red={}, id_macro={}, desc_macro={}",
                firstRow.get("id_red"), firstRow.get("desc_red"),
                firstRow.get("id_macro"), firstRow.get("desc_macro"));
        }

        return resultados.stream().map(row -> {
            Map<String, Object> usuario = new java.util.HashMap<>();
            usuario.put("idUsuario", row.get("id_user"));
            usuario.put("username", row.get("name_user"));
            usuario.put("estado", row.get("stat_user"));
            usuario.put("fechaCreacion", row.get("created_at"));
            usuario.put("idPersonal", row.get("id_pers"));
            usuario.put("nombres", row.get("nom_pers"));
            usuario.put("apellidoPaterno", row.get("ape_pater_pers"));
            usuario.put("apellidoMaterno", row.get("ape_mater_pers"));
            usuario.put("correoPersonal", row.get("email_pers"));
            usuario.put("correoInstitucional", row.get("email_corp_pers"));
            usuario.put("telefono", row.get("movil_pers"));
            usuario.put("ipress", row.get("desc_ipress"));
            usuario.put("idIpress", row.get("id_ipress"));
            // Usar id_red del resultado COALESCE
            Object idRedObj = row.get("id_red");
            usuario.put("idRed", idRedObj);
            usuario.put("red", row.get("desc_red"));
            usuario.put("idMacroregion", row.get("id_macro"));
            usuario.put("macroregion", row.get("desc_macro"));

            // Nombre completo
            String nombreCompleto = String.format("%s %s %s",
                    row.get("nom_pers") != null ? row.get("nom_pers") : "",
                    row.get("ape_pater_pers") != null ? row.get("ape_pater_pers") : "",
                    row.get("ape_mater_pers") != null ? row.get("ape_mater_pers") : ""
            ).trim();
            usuario.put("nombreCompleto", nombreCompleto);

            return usuario;
        }).collect(Collectors.toList());
    }

    /**
     * Lista usuarios pendientes filtrados por Red (id_red en dim_ipress)
     */
    public List<Map<String, Object>> listarUsuariosPendientesPorRed(Long idRed) {
        log.info("Consultando usuarios pendientes de activación para Red ID: {}", idRed);

        String sql = """
            SELECT
                u.id_user,
                u.name_user,
                u.stat_user,
                u.created_at,
                p.id_pers,
                p.nom_pers,
                p.ape_pater_pers,
                p.ape_mater_pers,
                p.email_pers,
                p.email_corp_pers,
                p.movil_pers,
                i.desc_ipress,
                i.id_ipress,
                r.id_red,
                r.desc_red,
                m.id_macro,
                m.desc_macro
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
            LEFT JOIN dim_red r ON r.id_red = i.id_red
            LEFT JOIN dim_macroregion m ON m.id_macro = r.id_macro
            WHERE u.requiere_cambio_password = true
            AND r.id_red = ?
            ORDER BY u.created_at DESC
        """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql, idRed);
        log.info("📊 Usuarios encontrados para Red {}: {}", idRed, resultados.size());

        return resultados.stream().map(row -> {
            Map<String, Object> usuario = new java.util.HashMap<>();
            usuario.put("idUsuario", row.get("id_user"));
            usuario.put("username", row.get("name_user"));
            usuario.put("estado", row.get("stat_user"));
            usuario.put("fechaCreacion", row.get("created_at"));
            usuario.put("idPersonal", row.get("id_pers"));
            usuario.put("nombres", row.get("nom_pers"));
            usuario.put("apellidoPaterno", row.get("ape_pater_pers"));
            usuario.put("apellidoMaterno", row.get("ape_mater_pers"));
            usuario.put("correoPersonal", row.get("email_pers"));
            usuario.put("correoInstitucional", row.get("email_corp_pers"));
            usuario.put("telefono", row.get("movil_pers"));
            usuario.put("ipress", row.get("desc_ipress"));
            usuario.put("idIpress", row.get("id_ipress"));
            usuario.put("idRed", row.get("id_red"));
            usuario.put("red", row.get("desc_red"));
            usuario.put("idMacroregion", row.get("id_macro"));
            usuario.put("macroregion", row.get("desc_macro"));

            String nombreCompleto = String.format("%s %s %s",
                    row.get("nom_pers") != null ? row.get("nom_pers") : "",
                    row.get("ape_pater_pers") != null ? row.get("ape_pater_pers") : "",
                    row.get("ape_mater_pers") != null ? row.get("ape_mater_pers") : ""
            ).trim();
            usuario.put("nombreCompleto", nombreCompleto);

            return usuario;
        }).collect(Collectors.toList());
    }

    /**
     * Lista usuarios pendientes de activación filtrados por Macrorregión
     * @param idMacroregion ID de la macrorregión
     * @return Lista de usuarios pendientes que pertenecen a esa macrorregión
     */
    public List<Map<String, Object>> listarUsuariosPendientesPorMacroregion(Long idMacroregion) {
        log.info("Consultando usuarios pendientes de activación para Macrorregión ID: {}", idMacroregion);

        String sql = """
            SELECT
                u.id_user,
                u.name_user,
                u.stat_user,
                u.created_at,
                p.id_pers,
                p.nom_pers,
                p.ape_pater_pers,
                p.ape_mater_pers,
                p.email_pers,
                p.email_corp_pers,
                p.movil_pers,
                i.desc_ipress,
                i.id_ipress,
                r.id_red,
                r.desc_red,
                m.id_macro,
                m.desc_macro
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
            LEFT JOIN dim_red r ON r.id_red = i.id_red
            LEFT JOIN dim_macroregion m ON m.id_macro = r.id_macro
            WHERE u.requiere_cambio_password = true
            AND m.id_macro = ?
            ORDER BY u.created_at DESC
        """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql, idMacroregion);
        log.info("📊 Usuarios encontrados para Macrorregión {}: {}", idMacroregion, resultados.size());

        return resultados.stream().map(row -> {
            Map<String, Object> usuario = new java.util.HashMap<>();
            usuario.put("idUsuario", row.get("id_user"));
            usuario.put("username", row.get("name_user"));
            usuario.put("estado", row.get("stat_user"));
            usuario.put("fechaCreacion", row.get("created_at"));
            usuario.put("idPersonal", row.get("id_pers"));
            usuario.put("nombres", row.get("nom_pers"));
            usuario.put("apellidoPaterno", row.get("ape_pater_pers"));
            usuario.put("apellidoMaterno", row.get("ape_mater_pers"));
            usuario.put("correoPersonal", row.get("email_pers"));
            usuario.put("correoInstitucional", row.get("email_corp_pers"));
            usuario.put("telefono", row.get("movil_pers"));
            usuario.put("ipress", row.get("desc_ipress"));
            usuario.put("idIpress", row.get("id_ipress"));
            usuario.put("idRed", row.get("id_red"));
            usuario.put("red", row.get("desc_red"));
            usuario.put("idMacroregion", row.get("id_macro"));
            usuario.put("macroregion", row.get("desc_macro"));

            String nombreCompleto = String.format("%s %s %s",
                    row.get("nom_pers") != null ? row.get("nom_pers") : "",
                    row.get("ape_pater_pers") != null ? row.get("ape_pater_pers") : "",
                    row.get("ape_mater_pers") != null ? row.get("ape_mater_pers") : ""
            ).trim();
            usuario.put("nombreCompleto", nombreCompleto);

            return usuario;
        }).collect(Collectors.toList());
    }

    /**
     * Reenvía el email de activación a un usuario específico
     * @param idUsuario ID del usuario
     * @param tipoCorreo Tipo de correo a usar: "PERSONAL", "CORPORATIVO", o null (usa personal prioritariamente)
     */
    @Transactional
    public boolean reenviarEmailActivacion(Long idUsuario, String tipoCorreo) {
        log.info("Reenviando email de activación a usuario ID: {} - Tipo: {}", idUsuario, tipoCorreo);

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getRequiereCambioPassword()) {
            throw new RuntimeException("El usuario ya ha activado su cuenta");
        }

        // Obtener email del personal asociado usando SQL directo (evita lazy loading)
        String sql = """
            SELECT
                p.email_pers,
                p.email_corp_pers,
                p.nom_pers,
                p.ape_pater_pers,
                p.ape_mater_pers
            FROM dim_personal_cnt p
            WHERE p.id_usuario = ?
        """;

        String email = null;
        String nombreCompleto = null;

        try {
            var result = jdbcTemplate.queryForMap(sql, idUsuario);

            String emailPers = (String) result.get("email_pers");
            String emailCorp = (String) result.get("email_corp_pers");

            // Seleccionar el correo según el tipo solicitado
            if ("CORPORATIVO".equalsIgnoreCase(tipoCorreo)) {
                // Usuario solicita explícitamente correo corporativo
                email = (emailCorp != null && !emailCorp.isBlank()) ? emailCorp : emailPers;
                log.info("Usando correo CORPORATIVO prioritariamente");
            } else if ("PERSONAL".equalsIgnoreCase(tipoCorreo)) {
                // Usuario solicita explícitamente correo personal
                email = (emailPers != null && !emailPers.isBlank()) ? emailPers : emailCorp;
                log.info("Usando correo PERSONAL prioritariamente");
            } else {
                // Comportamiento por defecto: priorizar personal
                email = (emailPers != null && !emailPers.isBlank()) ? emailPers : emailCorp;
                log.info("Usando correo por defecto (prioridad PERSONAL)");
            }

            String nombres = (String) result.get("nom_pers");
            String apePat = (String) result.get("ape_pater_pers");
            String apeMat = (String) result.get("ape_mater_pers");

            nombreCompleto = String.format("%s %s %s",
                    nombres != null ? nombres : "",
                    apePat != null ? apePat : "",
                    apeMat != null ? apeMat : ""
            ).trim();

            log.info("Datos obtenidos - Email seleccionado: {}, Nombre: {}", email, nombreCompleto);

        } catch (Exception e) {
            log.warn("No se encontró personal para usuario ID: {} - {}", idUsuario, e.getMessage());
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("El usuario no tiene correo electrónico registrado del tipo solicitado");
        }

        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            nombreCompleto = usuario.getNameUser();
        }

        log.info("Enviando email de activación a: {} para usuario: {}", email, nombreCompleto);

        return passwordTokenService.crearTokenYEnviarEmailDirecto(
                usuario, email, nombreCompleto, "BIENVENIDO");
    }

    /**
     * Elimina un usuario pendiente de activación para que pueda volver a registrarse.
     * Solo elimina usuarios que tienen requiere_cambio_password = true (nunca activaron su cuenta)
     * También elimina el registro de personal asociado y la solicitud original.
     */
    @Transactional
    public void eliminarUsuarioPendienteActivacion(Long idUsuario) {
        log.info("🗑️ Eliminando usuario pendiente de activación ID: {}", idUsuario);

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario realmente está pendiente de activación
        if (usuario.getRequiereCambioPassword() == null || !usuario.getRequiereCambioPassword()) {
            throw new RuntimeException("Este usuario ya ha activado su cuenta y no puede ser eliminado de esta forma");
        }

        String numDocumento = usuario.getNameUser();
        Long idPersonalCnt = null;
        Long idPersonalExt = null;

        // Obtener ID de personal INTERNO antes de eliminar
        if (usuario.getPersonalCnt() != null) {
            idPersonalCnt = usuario.getPersonalCnt().getIdPers();
        }

        // Obtener ID de personal EXTERNO antes de eliminar
        if (usuario.getPersonalExterno() != null) {
            idPersonalExt = usuario.getPersonalExterno().getIdPersExt();
        }

        // 1. Eliminar permisos del usuario
        int permisosEliminados = jdbcTemplate.update(
            "DELETE FROM permisos_modulares WHERE id_user = ?", idUsuario);
        log.info("   🔐 Permisos eliminados: {}", permisosEliminados);

        // 2. Eliminar roles del usuario
        int rolesEliminados = jdbcTemplate.update(
            "DELETE FROM rel_user_roles WHERE id_user = ?", idUsuario);
        log.info("   🎭 Roles eliminados: {}", rolesEliminados);

        // 3. Desvincular personal INTERNO del usuario (ANTES de eliminar usuario)
        if (idPersonalCnt != null) {
            jdbcTemplate.update(
                "UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?", idPersonalCnt);
            log.info("   📋 Personal CNT desvinculado");

            // Eliminar profesiones y tipos
            jdbcTemplate.update("DELETE FROM dim_personal_prof WHERE id_pers = ?", idPersonalCnt);
            jdbcTemplate.update("DELETE FROM dim_personal_tipo WHERE id_pers = ?", idPersonalCnt);
        }

        // 4. Desvincular personal EXTERNO del usuario (ANTES de eliminar usuario)
        if (idPersonalExt != null) {
            try {
                jdbcTemplate.update(
                    "UPDATE dim_personal_externo SET id_user = NULL WHERE id_pers_ext = ?",
                    idPersonalExt);
                log.info("   🌐 Personal externo desvinculado");
            } catch (Exception e) {
                log.debug("   ⚠️ Error desvinculando personal externo: {}", e.getMessage());
            }
        }

        // 5. Eliminar usuario (ya no hay FK constraints)
        int usuarioEliminado = jdbcTemplate.update(
            "DELETE FROM dim_usuarios WHERE id_user = ?", idUsuario);
        log.info("   ✅ Usuario eliminado: {} (filas: {})", numDocumento, usuarioEliminado);

        // 6. Eliminar personal INTERNO huérfano
        if (idPersonalCnt != null) {
            int cntEliminado = jdbcTemplate.update(
                "DELETE FROM dim_personal_cnt WHERE id_pers = ?", idPersonalCnt);
            log.info("   ✅ Personal CNT eliminado: {}", cntEliminado);
        }

        // 7. Eliminar personal EXTERNO huérfano
        if (idPersonalExt != null) {
            try {
                int extEliminado = jdbcTemplate.update(
                    "DELETE FROM dim_personal_externo WHERE id_pers_ext = ?", idPersonalExt);
                log.info("   ✅ Personal externo eliminado: {}", extEliminado);
            } catch (Exception e) {
                log.debug("   ⚠️ Error eliminando personal externo: {}", e.getMessage());
            }
        }

        // 8. Actualizar solicitud para permitir re-registro
        int solicitudActualizada = jdbcTemplate.update("""
            UPDATE account_requests
            SET estado = 'RECHAZADO',
                observacion_admin = 'Usuario eliminado - Puede volver a registrarse',
                fecha_respuesta = CURRENT_TIMESTAMP
            WHERE num_documento = ? AND estado = 'APROBADO'
        """, numDocumento);
        log.info("   📝 Solicitud actualizada: {}", solicitudActualizada);

        // 9. Auditoría
        auditar("DELETE_PENDING_USER",
                String.format("Usuario pendiente eliminado - DNI: %s, ID: %d. Tipo: %s. Permitido re-registro",
                        numDocumento, idUsuario,
                        idPersonalCnt != null ? "INTERNO" : (idPersonalExt != null ? "EXTERNO" : "SIN_TIPO")),
                "WARNING", "SUCCESS");

        log.info("✅ Usuario pendiente eliminado exitosamente: {} (ID: {})", numDocumento, idUsuario);
    }

    /**
     * Limpia datos huérfanos de un número de documento específico.
     * Útil cuando hay datos residuales que impiden un nuevo registro.
     * Este método elimina todos los datos relacionados con el DNI en todas las tablas.
     */
    @Transactional
    public Map<String, Object> limpiarDatosHuerfanos(String numDocumento) {
        log.info("🧹 Limpiando datos huérfanos para documento: {}", numDocumento);

        Map<String, Object> resultado = new java.util.HashMap<>();
        resultado.put("numDocumento", numDocumento);
        int totalEliminados = 0;

        // ============================================================
        // PASO 1: Buscar usuario por username (el username es el DNI)
        // ============================================================
        String sqlBuscarUsuario = "SELECT id_user FROM dim_usuarios WHERE name_user = ?";
        List<Long> usuarios = jdbcTemplate.queryForList(sqlBuscarUsuario, Long.class, numDocumento);

        for (Long idUsuario : usuarios) {
            log.info("👤 Encontrado usuario con ID: {}", idUsuario);

            // 1.1 Eliminar permisos del usuario
            int permisos = jdbcTemplate.update("DELETE FROM permisos_modulares WHERE id_user = ?", idUsuario);
            log.info("   🔐 Permisos eliminados: {}", permisos);

            // 1.2 Eliminar roles del usuario
            int roles = jdbcTemplate.update("DELETE FROM rel_user_roles WHERE id_user = ?", idUsuario);
            log.info("   🎭 Roles eliminados: {}", roles);

            // 1.3 Desvincular personal INTERNO del usuario (ANTES de eliminar usuario)
            int cntDesvinculados = jdbcTemplate.update(
                "UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_usuario = ?", idUsuario);
            log.info("   📋 Personal CNT desvinculado: {}", cntDesvinculados);

            // 1.4 Desvincular personal EXTERNO del usuario (ANTES de eliminar usuario)
            try {
                int extDesvinculados = jdbcTemplate.update(
                    "UPDATE dim_personal_externo SET id_user = NULL WHERE id_user = ?", idUsuario);
                log.info("   🌐 Personal externo desvinculado: {}", extDesvinculados);
            } catch (Exception e) {
                log.debug("   ⚠️ No se pudo desvincular personal externo: {}", e.getMessage());
            }

            // 1.5 Ahora sí eliminar el usuario (ya no hay FK constraints)
            int usuarioEliminado = jdbcTemplate.update("DELETE FROM dim_usuarios WHERE id_user = ?", idUsuario);
            totalEliminados += usuarioEliminado;
            log.info("   ✅ Usuario eliminado: {}", usuarioEliminado);
        }
        resultado.put("usuariosEliminados", usuarios.size());

        // ============================================================
        // PASO 2: Eliminar personal INTERNO por número de documento
        // ============================================================
        String sqlBuscarPersonal = "SELECT id_pers FROM dim_personal_cnt WHERE num_doc_pers = ?";
        List<Long> personales = jdbcTemplate.queryForList(sqlBuscarPersonal, Long.class, numDocumento);

        for (Long idPers : personales) {
            log.info("📋 Encontrado personal CNT con ID: {}", idPers);

            // 2.1 Eliminar profesiones del personal
            int profs = jdbcTemplate.update("DELETE FROM dim_personal_prof WHERE id_pers = ?", idPers);
            log.info("   🎓 Profesiones eliminadas: {}", profs);

            // 2.2 Eliminar tipos del personal
            int tipos = jdbcTemplate.update("DELETE FROM dim_personal_tipo WHERE id_pers = ?", idPers);
            log.info("   📝 Tipos eliminados: {}", tipos);

            // 2.3 Eliminar el personal
            int personalEliminado = jdbcTemplate.update("DELETE FROM dim_personal_cnt WHERE id_pers = ?", idPers);
            totalEliminados += personalEliminado;
            log.info("   ✅ Personal CNT eliminado: {}", personalEliminado);
        }
        resultado.put("personalesEliminados", personales.size());

        // ============================================================
        // PASO 3: Eliminar personal EXTERNO por número de documento
        // ============================================================
        String sqlBuscarExterno = "SELECT id_pers_ext FROM dim_personal_externo WHERE num_doc_ext = ?";
        List<Long> externos = new java.util.ArrayList<>();
        try {
            externos = jdbcTemplate.queryForList(sqlBuscarExterno, Long.class, numDocumento);
        } catch (Exception e) {
            log.debug("⚠️ Tabla dim_personal_externo no accesible: {}", e.getMessage());
        }

        for (Long idExt : externos) {
            log.info("🌐 Encontrado personal externo con ID: {}", idExt);
            int extEliminado = jdbcTemplate.update("DELETE FROM dim_personal_externo WHERE id_pers_ext = ?", idExt);
            totalEliminados += extEliminado;
            log.info("   ✅ Personal externo eliminado: {}", extEliminado);
        }
        resultado.put("externosEliminados", externos.size());

        // 4. Actualizar solicitudes a RECHAZADO para permitir re-registro
        String sqlUpdateSolicitudes = """
            UPDATE account_requests
            SET estado = 'RECHAZADO',
                observacion_admin = 'Datos huérfanos limpiados - Puede volver a registrarse',
                fecha_respuesta = CURRENT_TIMESTAMP
            WHERE num_documento = ? AND estado IN ('PENDIENTE', 'APROBADO')
        """;
        int solicitudesActualizadas = jdbcTemplate.update(sqlUpdateSolicitudes, numDocumento);
        resultado.put("solicitudesActualizadas", solicitudesActualizadas);
        log.info("Solicitudes actualizadas: {}", solicitudesActualizadas);

        resultado.put("totalRegistrosEliminados", totalEliminados);
        resultado.put("mensaje", "Datos huérfanos limpiados exitosamente para documento: " + numDocumento);

        // Registrar en auditoría
        auditar("CLEANUP_ORPHAN_DATA",
                String.format("Datos huérfanos limpiados - DNI: %s. Usuarios: %d, Personales: %d, Solicitudes: %d",
                        numDocumento, usuarios.size(), personales.size(), solicitudesActualizadas),
                "WARNING", "SUCCESS");

        log.info("Limpieza completada para documento: {}. Total eliminados: {}", numDocumento, totalEliminados);

        return resultado;
    }

    /**
     * Verifica si existen datos huérfanos para un número de documento.
     * Retorna información detallada sobre qué datos existen en cada tabla.
     */
    public Map<String, Object> verificarDatosExistentes(String numDocumento) {
        log.info("Verificando datos existentes para documento: {}", numDocumento);

        Map<String, Object> resultado = new java.util.HashMap<>();
        resultado.put("numDocumento", numDocumento);

        // 1. Verificar en dim_usuarios
        String sqlUsuarios = "SELECT COUNT(*) FROM dim_usuarios WHERE name_user = ?";
        int usuarios = jdbcTemplate.queryForObject(sqlUsuarios, Integer.class, numDocumento);
        resultado.put("usuariosEncontrados", usuarios);

        // 2. Verificar en dim_personal_cnt
        String sqlPersonal = "SELECT COUNT(*) FROM dim_personal_cnt WHERE num_doc_pers = ?";
        int personales = jdbcTemplate.queryForObject(sqlPersonal, Integer.class, numDocumento);
        resultado.put("personalesEncontrados", personales);

        // 3. Verificar en dim_personal_externo
        int externos = 0;
        try {
            String sqlExternos = "SELECT COUNT(*) FROM dim_personal_externo WHERE num_doc_ext = ?";
            externos = jdbcTemplate.queryForObject(sqlExternos, Integer.class, numDocumento);
        } catch (Exception e) {
            log.debug("Tabla dim_personal_externo no accesible: {}", e.getMessage());
        }
        resultado.put("externosEncontrados", externos);

        // 4. Verificar solicitudes activas
        String sqlSolicitudes = "SELECT COUNT(*) FROM account_requests WHERE num_documento = ? AND estado IN ('PENDIENTE', 'APROBADO')";
        int solicitudesActivas = jdbcTemplate.queryForObject(sqlSolicitudes, Integer.class, numDocumento);
        resultado.put("solicitudesActivas", solicitudesActivas);

        // 5. Verificar solicitudes rechazadas (pueden volver a registrarse)
        String sqlSolicitudesRechazadas = "SELECT COUNT(*) FROM account_requests WHERE num_documento = ? AND estado = 'RECHAZADO'";
        int solicitudesRechazadas = jdbcTemplate.queryForObject(sqlSolicitudesRechazadas, Integer.class, numDocumento);
        resultado.put("solicitudesRechazadas", solicitudesRechazadas);

        boolean tieneDatosHuerfanos = usuarios > 0 || personales > 0 || externos > 0;
        boolean puedeRegistrarse = !tieneDatosHuerfanos && solicitudesActivas == 0;

        resultado.put("tieneDatosHuerfanos", tieneDatosHuerfanos);
        resultado.put("puedeRegistrarse", puedeRegistrarse);

        if (!puedeRegistrarse) {
            if (tieneDatosHuerfanos) {
                resultado.put("razonBloqueo", "Existen datos huérfanos que deben ser limpiados");
            } else if (solicitudesActivas > 0) {
                resultado.put("razonBloqueo", "Existe una solicitud activa (PENDIENTE o APROBADO)");
            }
        }

        log.info("Verificación completada para documento: {}. Puede registrarse: {}", numDocumento, puedeRegistrarse);

        return resultado;
    }

    // ================================================================
    // VALIDACIÓN DE EXISTENCIA DE USUARIO
    // ================================================================

    /**
     * Valida si un usuario (documento) ya existe en el sistema
     * antes de aprobar una solicitud de registro
     */
    public Map<String, Object> validarExistenciaUsuario(Long idSolicitud) {
        log.info("Validando existencia de usuario para solicitud ID: {}", idSolicitud);

        AccountRequest solicitud = accountRequestRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        String numeroDocumento = solicitud.getNumDocumento();
        boolean existe = usuarioRepository.existsByNameUser(numeroDocumento);

        Map<String, Object> resultado = Map.of(
                "existe", existe,
                "username", numeroDocumento,
                "idSolicitud", idSolicitud,
                "mensaje", existe
                    ? "Usuario ya existe en el sistema"
                    : "Usuario disponible - Puede proceder con la aprobación"
        );

        log.info("Validación de usuario '{}' completada. Existe: {}", numeroDocumento, existe);

        return resultado;
    }
}
