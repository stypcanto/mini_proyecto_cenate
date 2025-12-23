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
            
            if (solicitud.isExterno()) {
                usuarioRequest.setRol("INSTITUCION_EX");  // Rol con acceso limitado para externos
            } else {
                usuarioRequest.setRol("USER");
            }

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

            // Enviar correo con enlace para configurar contraseña (sistema seguro de tokens)
            Usuario usuarioNuevo = usuarioRepository.findById(idUsuario).orElse(null);
            if (usuarioNuevo != null) {
                // Usar datos de la solicitud directamente (evita problemas de lazy loading)
                String emailDestino = solicitud.getCorreoPersonal() != null && !solicitud.getCorreoPersonal().isBlank()
                        ? solicitud.getCorreoPersonal()
                        : solicitud.getCorreoInstitucional();

                String nombreCompleto = solicitud.getNombreCompleto();

                log.info("Preparando envío de correo a: {} para usuario: {}", emailDestino, nombreCompleto);

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

        // Enviar correo de rechazo
        String emailDestino = solicitud.getCorreoPersonal() != null
                ? solicitud.getCorreoPersonal()
                : solicitud.getCorreoInstitucional();

        if (emailDestino != null && !emailDestino.isBlank()) {
            String nombreCompleto = solicitud.getNombreCompleto();
            emailService.enviarCorreoRechazoSolicitud(
                    emailDestino,
                    nombreCompleto,
                    motivoRechazo
            );
            log.info("Correo de rechazo enviado a: {}", emailDestino);
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
                i.desc_ipress
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
            WHERE u.requiere_cambio_password = true
            ORDER BY u.created_at DESC
        """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql);

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
     * Reenvía el email de activación a un usuario específico
     */
    @Transactional
    public boolean reenviarEmailActivacion(Long idUsuario) {
        log.info("Reenviando email de activación a usuario ID: {}", idUsuario);

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
            email = (emailPers != null && !emailPers.isBlank()) ? emailPers : emailCorp;

            String nombres = (String) result.get("nom_pers");
            String apePat = (String) result.get("ape_pater_pers");
            String apeMat = (String) result.get("ape_mater_pers");

            nombreCompleto = String.format("%s %s %s",
                    nombres != null ? nombres : "",
                    apePat != null ? apePat : "",
                    apeMat != null ? apeMat : ""
            ).trim();

            log.info("Datos obtenidos - Email: {}, Nombre: {}", email, nombreCompleto);

        } catch (Exception e) {
            log.warn("No se encontró personal para usuario ID: {} - {}", idUsuario, e.getMessage());
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("El usuario no tiene correo electrónico registrado");
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
        log.info("Eliminando usuario pendiente de activación ID: {}", idUsuario);

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario realmente está pendiente de activación
        if (usuario.getRequiereCambioPassword() == null || !usuario.getRequiereCambioPassword()) {
            throw new RuntimeException("Este usuario ya ha activado su cuenta y no puede ser eliminado de esta forma");
        }

        String numDocumento = usuario.getNameUser();
        Long idPersonal = null;

        // Obtener ID de personal antes de eliminar la referencia
        if (usuario.getPersonalCnt() != null) {
            idPersonal = usuario.getPersonalCnt().getIdPers();
        }

        // 1. Eliminar permisos del usuario (si existen) - usando SQL directo
        String sqlPermisos = "DELETE FROM permisos_modulares WHERE id_user = ?";
        int permisosEliminados = jdbcTemplate.update(sqlPermisos, idUsuario);
        log.info("Permisos eliminados: {} para usuario ID: {}", permisosEliminados, idUsuario);

        // 2. Eliminar relación usuario-rol (si existe) - usando SQL directo
        String sqlRoles = "DELETE FROM rel_user_roles WHERE id_user = ?";
        int rolesEliminados = jdbcTemplate.update(sqlRoles, idUsuario);
        log.info("Roles eliminados: {} para usuario ID: {}", rolesEliminados, idUsuario);

        // 3. Primero desvinculamos el personal del usuario (para evitar FK constraint)
        if (idPersonal != null) {
            String sqlDesvincular = "UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?";
            jdbcTemplate.update(sqlDesvincular, idPersonal);
            log.info("Personal desvinculado del usuario");
        }

        // 4. Eliminar usuario usando SQL directo (evita problemas de cascada)
        String sqlDeleteUsuario = "DELETE FROM dim_usuarios WHERE id_user = ?";
        int usuarioEliminado = jdbcTemplate.update(sqlDeleteUsuario, idUsuario);
        log.info("Usuario eliminado: {} (filas afectadas: {})", numDocumento, usuarioEliminado);

        // 5. Ahora eliminar el personal huérfano
        if (idPersonal != null) {
            String sqlDeletePersonal = "DELETE FROM dim_personal_cnt WHERE id_pers = ?";
            int personalEliminado = jdbcTemplate.update(sqlDeletePersonal, idPersonal);
            log.info("Personal eliminado: {} (filas afectadas: {})", idPersonal, personalEliminado);
        }

        // 6. Actualizar la solicitud original para que pueda volver a registrarse
        String sqlUpdateSolicitud = """
            UPDATE account_requests
            SET estado = 'RECHAZADO',
                observacion_admin = 'Usuario eliminado - Puede volver a registrarse',
                fecha_respuesta = CURRENT_TIMESTAMP
            WHERE num_documento = ? AND estado = 'APROBADO'
        """;
        int solicitudActualizada = jdbcTemplate.update(sqlUpdateSolicitud, numDocumento);
        log.info("Solicitud actualizada: {} (filas afectadas: {})", numDocumento, solicitudActualizada);

        log.info("Usuario pendiente de activación eliminado exitosamente: {} (ID: {})", numDocumento, idUsuario);
    }
}
