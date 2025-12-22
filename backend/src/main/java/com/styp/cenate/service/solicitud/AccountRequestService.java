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

        if (accountRequestRepository.existsByNumDocumento(dto.getNumeroDocumento())) {
            throw new RuntimeException("Ya existe una solicitud con este número de documento");
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
                // Usar email de la solicitud directamente (evita problemas de lazy loading)
                String emailDestino = solicitud.getCorreoPersonal() != null && !solicitud.getCorreoPersonal().isBlank()
                        ? solicitud.getCorreoPersonal()
                        : solicitud.getCorreoInstitucional();

                boolean emailEnviado = passwordTokenService.crearTokenYEnviarEmailDirecto(
                        usuarioNuevo, emailDestino, "BIENVENIDO");
                if (emailEnviado) {
                    log.info("Correo con enlace de configuración enviado a: {}", emailDestino);
                } else {
                    log.warn("No se pudo enviar correo a: {}", emailDestino);
                }
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
}
