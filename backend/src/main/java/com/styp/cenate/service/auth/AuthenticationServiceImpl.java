package com.styp.cenate.service.auth;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.auth.AuthRequest;
import com.styp.cenate.dto.auth.AuthResponse;
import com.styp.cenate.dto.auth.MappingRolDTO;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.exception.WeakPasswordException;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.security.service.JwtService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔐 Servicio de Autenticación MBAC (CENATE 2025)
 * Unifica login JWT + roles y permisos reales desde MBAC.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PermisosService permisosService;
    private final AuditLogService auditLogService;
    private final com.styp.cenate.service.session.SessionService sessionService;
    private final com.styp.cenate.util.RequestContextUtil requestContextUtil;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final SolicitudBolsaRepository solicitudBolsaRepository;

    // =========================================================
    // 🔐 LOGIN MBAC
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    public AuthResponse authenticate(AuthRequest request) {
        log.info("🔑 Intento de autenticación para: {}", request.getUsername());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario user = usuarioRepository.findByNameUser(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Determinar si el usuario está activo
        List<String> estadosActivos = List.of("A", "ACTIVO");
        boolean enabled = estadosActivos.contains(user.getStatUser().trim().toUpperCase());

        if (!enabled) {
            throw new RuntimeException("❌ La cuenta está inactiva o bloqueada.");
        }

        // Roles
        var roles = user.getRoles().stream()
                .map(Rol::getDescRol)
                .collect(Collectors.toList());

        // 🆕 Mapeo de roles (codigo + descripcion + area info)
        var mappingRoles = user.getRoles().stream()
                .map(rol -> {
                    var builder = MappingRolDTO.builder()
                            .codigo(rol.getIdRol())
                            .descripcion(rol.getDescRol())
                            .codigoNormalizado(rol.getDescRol().toUpperCase().replaceAll("\\s+", "_"));
                    
                    // Agregar información del área si existe
                    if (rol.getArea() != null) {
                        builder.idArea(rol.getArea().getIdArea());
                        builder.descripcionArea(rol.getArea().getDescArea());
                    }
                    
                    return builder.build();
                })
                .collect(Collectors.toList());
        
        log.info("📋 Mapping Roles: {}", mappingRoles);

        
        
        
        // Permisos MBAC
//        
//        var permisos = permisosService.obtenerPermisosPorUsuario(user.getIdUser())
//                .stream()
//                .map(PermisoUsuarioResponseDTO::getRutaPagina)
//                .distinct()
//                .collect(Collectors.toList());
//        log.info("Cantidad de Permisos : " + permisos.size());
        
        
        
        

        // Construcción del UserDetails con enabled y roles
        User userDetails = new User(
                user.getNameUser(),
                user.getPassUser(),
                enabled,          // enabled = true si ACTIVO
                true,             // accountNonExpired
                true,             // credentialsNonExpired
                true,             // accountNonLocked
                roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(Collectors.toList())
        );

        // Obtener foto del usuario (desde personal_cnt o personal_externo)
        String fotoUrl = obtenerFotoUsuario(user.getIdUser());

        // ✅ v1.77.0: Obtener especialidad del médico desde PersonalCnt
        // 🔧 DISABLED: Tabla dim_personal no existe, deshabilitando para permitir login
        String especialidad = null;

        // 🏥 Obtener nombre de la IPRESS para usuarios externos
        String nombreIpress = obtenerNombreIpress(user.getIdUser());

        // 🆕 v1.78.0: Obtener información del personal (régimen laboral, área, IPRESS, servicio)
        Long idPers = null;
        String descRegLab = null;
        Long idRegLab = null;
        String descArea = null;
        Long idArea = null;
        String descIpress = null;
        Long idIpress = null;
        String descServicio = null;
        Long idServicio = null;
        Long idGrupoProg = null;  // 🆕 ID del grupo programático
        String descGrupoProg = null;  // 🆕 Descripción del grupo programático

        var personalInfo = obtenerInfoPersonal(user);
        
        if (!personalInfo.isEmpty()) {
            idPers = personalInfo.get("id_pers") != null ? ((Number) personalInfo.get("id_pers")).longValue() : null;
            idRegLab = personalInfo.get("id_reg_lab") != null ? ((Number) personalInfo.get("id_reg_lab")).longValue() : null;
            descRegLab = (String) personalInfo.get("desc_regimen_laboral");
            idArea = personalInfo.get("id_area") != null ? ((Number) personalInfo.get("id_area")).longValue() : null;
            descArea = (String) personalInfo.get("desc_area");
            idIpress = personalInfo.get("id_ipress") != null ? ((Number) personalInfo.get("id_ipress")).longValue() : null;
            descIpress = (String) personalInfo.get("desc_ipress");
            idServicio = personalInfo.get("id_servicio") != null ? ((Number) personalInfo.get("id_servicio")).longValue() : null;
            descServicio = (String) personalInfo.get("desc_servicio");
            idGrupoProg = personalInfo.get("id_grupo_prog") != null ? ((Number) personalInfo.get("id_grupo_prog")).longValue() : null;  // 🆕 Obtener ID del grupo programático
            descGrupoProg = (String) personalInfo.get("desc_grupo_prog");  // 🆕 Descripción del grupo programático
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("id_user", user.getIdUser());  // 🆕 CRITICO: ID en el JWT para persistencia
        claims.put("roles", roles);
        claims.put("permisos", null);
        claims.put("nombre_completo", user.getNombreCompleto());  // ✅ Nombre y apellido
        claims.put("mappingRoles", mappingRoles);  // 🆕 Mapeo de roles completo
        claims.put("idPers", idPers);  // 🆕 ID del personal
        claims.put("descRegLab", descRegLab);  // 🆕 Descripción régimen laboral
        claims.put("idRegLab", idRegLab);  // 🆕 ID del régimen laboral
        claims.put("descArea", descArea);  // 🆕 Descripción del área
        claims.put("idArea", idArea);  // 🆕 ID del área
        claims.put("descIpress", descIpress);  // 🆕 Descripción IPRESS
        claims.put("idIpress", idIpress);  // 🆕 ID del IPRESS
        claims.put("descServicio", descServicio);  // 🆕 Descripción del servicio
        claims.put("idServicio", idServicio);  // 🆕 ID del servicio
        claims.put("idGrupoProg", idGrupoProg);  // 🆕 ID del grupo programático
        claims.put("descGrupoProg", descGrupoProg);  // 🆕 Descripción del grupo programático
        if (especialidad != null) {
            claims.put("especialidad", especialidad);  // ✅ v1.77.0: Especialidad del médico
        }
        if (nombreIpress != null) {
            claims.put("nombre_ipress", nombreIpress);  // 🏥 IPRESS para usuarios externos (en JWT)
        }

        String token = jwtService.generateToken(claims, userDetails);

        // 🆕 REGISTRAR SESIÓN ACTIVA
        String sessionId = null;
        try {
            com.styp.cenate.util.RequestContextUtil.AuditContext context =
                com.styp.cenate.util.RequestContextUtil.getAuditContext();

            sessionId = sessionService.registrarNuevaSesion(
                user.getIdUser(),
                user.getNameUser(),
                context.getIp(),
                context.getUserAgent()
            );

            log.info("✅ Sesión registrada: {} para usuario: {}", sessionId, user.getNameUser());
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar la sesión: {}", e.getMessage());
        }

        // Registrar auditoría
        try {
            auditLogService.registrarEvento(
                    user.getNameUser(),
                    "LOGIN",
                    "AUTH",
                    "Inicio de sesión exitoso",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de login: {}", e.getMessage());
        }

        return AuthResponse.builder()
                .token(token)
                .id_user(user.getIdUser())  // 🆕 CRITICO: ID del usuario para el frontend
                .username(user.getNameUser())
                .nombreCompleto(user.getNombreCompleto())  // ✅ Nombre y apellido del usuario
                .foto(fotoUrl)  // 📷 URL completa de la foto
                .sexo(user.getGenero())  // M / F
                .roles(roles)
                .mappingRoles(mappingRoles)  // 🆕 Mapeo codigo-descripcion de roles
                .permisos(null)
                .requiereCambioPassword(user.getRequiereCambioPassword() != null ? user.getRequiereCambioPassword() : false)  // 🔑 Flag de primer acceso
                .sessionId(sessionId)  // 🆕 ID de sesión para tracking
                .especialidad(especialidad)  // ✅ v1.77.0: Especialidad del médico
                .nombreIpress(nombreIpress)  // 🏥 Nombre de la IPRESS (solo externos)
                .idPers(idPers)  // 🆕 v1.78.0: ID del personal
                .descRegLab(descRegLab)  // 🆕 v1.78.0: Régimen laboral
                .idRegLab(idRegLab)  // 🆕 v1.78.0: ID del régimen laboral
                .descArea(descArea)  // 🆕 v1.78.0: Área
                .idArea(idArea)  // 🆕 v1.78.0: ID del área
                .descIpress(descIpress)  // 🆕 v1.78.0: IPRESS
                .idIpress(idIpress)  // 🆕 v1.78.0: ID del IPRESS
                .descServicio(descServicio)  // 🆕 v1.78.0: Servicio
                .idServicio(idServicio)  // 🆕 v1.78.0: ID del servicio
                .idGrupoProg(idGrupoProg)  // 🆕 ID del grupo programático
                .descGrupoProg(descGrupoProg)  // 🆕 Descripción del grupo programático
                .message("Inicio de sesión exitoso")
                .build();
    }

    // =========================================================
    // 🧍 CREAR USUARIO
    // =========================================================
    @Override
    @Transactional
    public UsuarioResponse createUser(UsuarioCreateRequest request) {
        log.info("🧍 Creando nuevo usuario MBAC: {}", request.getUsername());

        if (usuarioRepository.existsByNameUser(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        if (!isPasswordSecure(request.getPassword())) {
            throw new WeakPasswordException(
                    "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un símbolo."
            );
        }

        Usuario user = new Usuario();
        user.setNameUser(request.getUsername());
        user.setPassUser(passwordEncoder.encode(request.getPassword()));
        user.setStatUser("A");
        user.setCreateAt(new Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());

        Usuario savedUser = usuarioRepository.save(user);

        // Registrar auditoría
        try {
            auditLogService.registrarEvento(
                    savedUser.getNameUser(),
                    "CREATE_USER",
                    "AUTH",
                    "Usuario creado exitosamente",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de creación de usuario: {}", e.getMessage());
        }

        return UsuarioResponse.builder()
                .idUser(savedUser.getIdUser())
                .username(savedUser.getNameUser())
                .estado(savedUser.getStatUser())
                .message("Usuario registrado exitosamente")
                .build();
    }

    // =========================================================
    // 🔑 CAMBIO DE CONTRASEÑA
    // =========================================================
    @Override
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        log.info("🔐 Cambio de contraseña solicitado para: {}", username);

        Usuario user = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, user.getPassUser())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("La nueva contraseña y su confirmación no coinciden");
        }

        if (passwordEncoder.matches(newPassword, user.getPassUser())) {
            throw new RuntimeException("La nueva contraseña no puede ser igual a la actual");
        }

        if (!isPasswordSecure(newPassword)) {
            throw new WeakPasswordException(
                    "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un símbolo."
            );
        }

        user.setPassUser(passwordEncoder.encode(newPassword));
        usuarioRepository.save(user);

        try {
            auditLogService.registrarEvento(
                    username,
                    "CHANGE_PASSWORD",
                    "AUTH",
                    "Cambio de contraseña exitoso",
                    "INFO",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar el log de cambio de contraseña: {}", e.getMessage());
        }

        log.info("✅ Contraseña actualizada exitosamente para {}", username);
    }

    // =========================================================
    // 🧩 VALIDACIÓN DE SEGURIDAD DE CONTRASEÑA
    // =========================================================
    private boolean isPasswordSecure(String password) {
        return password != null &&
                password.length() >= 8 &&
                password.matches(".*[A-Z].*") &&
                password.matches(".*[a-z].*") &&
                password.matches(".*\\d.*") &&
                password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }

    // =========================================================
    // 📷 OBTENER FOTO DEL USUARIO
    // =========================================================
    // 🏥 OBTENER NOMBRE IPRESS PARA USUARIOS EXTERNOS (INDEPENDIENTE)
    // =========================================================
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private String obtenerNombreIpress(Long userId) {
        try {
            var iPressList = jdbcTemplate.queryForList(
                "SELECT i.desc_ipress FROM public.dim_personal_externo pe " +
                "JOIN public.dim_ipress i ON pe.id_ipress = i.id_ipress " +
                "WHERE pe.id_user = ?",
                String.class,
                userId
            );
            if (!iPressList.isEmpty()) {
                String nombreIpress = iPressList.get(0);
                log.debug("🏥 IPRESS encontrada para usuario {}: {}", userId, nombreIpress);
                return nombreIpress;
            } else {
                log.debug("ℹ️ No se encontró IPRESS para usuario {}", userId);
            }
        } catch (Exception e) {
            log.debug("ℹ️ Error al buscar IPRESS para usuario {}: {}", userId, e.getMessage());
        }
        return null;
    }

    // =========================================================
    // 🔐 OBTENER FOTO DEL USUARIO (INDEPENDIENTE)
    // =========================================================
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private String obtenerFotoUsuario(Long userId) {
        log.info("📷 Buscando foto para usuario ID: {}", userId);
        try {
            // Buscar primero en dim_personal_cnt
            var fotoList = jdbcTemplate.queryForList(
                "SELECT foto_pers FROM public.dim_personal_cnt WHERE id_usuario = ? AND foto_pers IS NOT NULL",
                String.class,
                userId
            );
            if (!fotoList.isEmpty()) {
                String fotoPersonalCnt = fotoList.get(0);
                if (fotoPersonalCnt != null && !fotoPersonalCnt.trim().isEmpty()) {
                    // Si ya contiene la URL completa (/api/fotos-perfil/...), devolverla tal cual
                    if (fotoPersonalCnt.startsWith("/api/")) {
                        log.info("✅ Foto URL encontrada en dim_personal_cnt: {}", fotoPersonalCnt);
                        return fotoPersonalCnt;
                    }
                    // Si solo es nombre de archivo, construir la URL
                    String fotoUrl = "/api/fotos-perfil/" + fotoPersonalCnt;
                    log.info("✅ Foto encontrada en dim_personal_cnt: {} -> URL: {}", fotoPersonalCnt, fotoUrl);
                    return fotoUrl;
                }
            }
        } catch (Exception e) {
            log.debug("No se encontró foto en dim_personal_cnt para usuario {}: {}", userId, e.getMessage());
        }

        try {
            // Buscar en dim_personal_externo (si no se encontró en personal_cnt)
            var fotoList = jdbcTemplate.queryForList(
                "SELECT foto_ext FROM public.dim_personal_externo WHERE id_usuario = ? AND foto_ext IS NOT NULL",
                String.class,
                userId
            );
            if (!fotoList.isEmpty()) {
                String fotoPersonalExt = fotoList.get(0);
                if (fotoPersonalExt != null && !fotoPersonalExt.trim().isEmpty()) {
                    // Si ya contiene la URL completa (/api/fotos-perfil/...), devolverla tal cual
                    if (fotoPersonalExt.startsWith("/api/")) {
                        log.info("✅ Foto URL encontrada en dim_personal_externo: {}", fotoPersonalExt);
                        return fotoPersonalExt;
                    }
                    // Si solo es nombre de archivo, construir la URL
                    String fotoUrl = "/api/fotos-perfil/" + fotoPersonalExt;
                    log.info("✅ Foto encontrada en dim_personal_externo: {} -> URL: {}", fotoPersonalExt, fotoUrl);
                    return fotoUrl;
                }
            }
        } catch (Exception e) {
            log.debug("No se encontró foto en dim_personal_externo para usuario {}", userId);
        }

        // Si no se encontró foto, retornar null
        log.info("⚠️ No se encontró foto para usuario ID: {}", userId);
        return null;
    }

    // 🆕 v1.78.0: Obtener información del personal de forma segura (sin afectar transacción principal)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private java.util.Map<String, Object> obtenerInfoPersonal(Usuario usuario) {
        java.util.Map<String, Object> resultado = new java.util.HashMap<>();
        try {
            if (usuario == null) {
                log.warn("⚠️ Usuario es null, no se puede obtener información personal");
                return resultado;
            }
            
            Long userId = usuario.getIdUser();
            log.info("🔍 ========== DEBUGGING obtenerInfoPersonal ==========");
            log.info("🔍 Usuario ID: {}", userId);
            log.info("🔍 Username: {}", usuario.getNameUser());
            
            // PASO 1: Ver si existe ALGÚN registro en dim_personal_cnt para este usuario
            try {
                var allPersonal = jdbcTemplate.queryForList(
                    "SELECT id_usuario, id_pers, num_doc_pers FROM public.dim_personal_cnt WHERE id_usuario IS NOT NULL LIMIT 5"
                );
                log.info("📊 Primeros 5 registros en dim_personal_cnt: {}", allPersonal);
            } catch (Exception e) {
                log.warn("⚠️ Error al listar dim_personal_cnt: {}", e.getMessage());
            }
            
            // PASO 2: Buscar el registro por id_usuario (NO id_user)
            log.info("🔎 Buscando usuario ID {} en dim_personal_cnt...", userId);
            var docList = jdbcTemplate.queryForList(
                "SELECT id_pers, num_doc_pers, id_reg_lab, id_area, id_ipress, id_servicio FROM public.dim_personal_cnt WHERE id_usuario = ?",
                new Object[]{userId}
            );
            
            if (docList.isEmpty()) {
                log.error("❌ NO ENCONTRADO: Usuario {} NO existe en dim_personal_cnt con id_user", userId);
                log.error("❌ Posible causa: la relación no es por id_user, sino por otro campo");
                // Intentar ver si hay registros con información del usuario
                var anyRecords = jdbcTemplate.queryForList(
                    "SELECT COUNT(*) as count FROM public.dim_personal_cnt"
                );
                log.error("❌ Total de registros en dim_personal_cnt: {}", anyRecords);
                return resultado;
            }
            
            log.info("✅ ENCONTRADO: Usuario {} SÍ existe en dim_personal_cnt", userId);
            var record = docList.get(0);
            Long idPers = ((Number) record.get("id_pers")).longValue();
            String numDocPers = (String) record.get("num_doc_pers");
            log.info("✅ id_pers: {}, num_doc_pers: {}", idPers, numDocPers);
            
            // PASO 3: Ejecutar query con JOINs usando id_pers
            log.info("📝 Ejecutando query JOINs con id_pers={}", idPers);
            
            var personalInfoList = jdbcTemplate.query(
                "SELECT " +
                "  dpc.id_pers, " +
                "  dpc.id_reg_lab, " +
                "  drl.desc_reg_lab, " +
                "  dpc.id_area, " +
                "  da.desc_area, " +
                "  dpc.id_ipress, " +
                "  di.desc_ipress, " +
                "  dpc.id_servicio, " +
                "  dse.desc_servicio, " +
                "  dpc.id_grupo_prog, " +
                "  dgp.desc_grupo " +
                "FROM public.dim_personal_cnt dpc " +
                "LEFT JOIN public.dim_regimen_laboral drl ON dpc.id_reg_lab = drl.id_reg_lab " +
                "LEFT JOIN public.dim_area da ON dpc.id_area = da.id_area " +
                "LEFT JOIN public.dim_ipress di ON dpc.id_ipress = di.id_ipress " +
                "LEFT JOIN public.dim_servicio_essi dse ON dpc.id_servicio = dse.id_servicio " +
                "LEFT JOIN public.dim_grupo_programacion dgp ON dpc.id_grupo_prog = dgp.id_grupo_prog " +
                "WHERE dpc.id_pers = ? " +
                "LIMIT 1",
                new Object[]{idPers},
                (rs, rowNum) -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id_pers", rs.getObject("id_pers"));
                    map.put("id_reg_lab", rs.getObject("id_reg_lab"));
                    map.put("desc_regimen_laboral", rs.getString("desc_reg_lab"));
                    map.put("id_area", rs.getObject("id_area"));
                    map.put("desc_area", rs.getString("desc_area"));
                    map.put("id_ipress", rs.getObject("id_ipress"));
                    map.put("desc_ipress", rs.getString("desc_ipress"));
                    map.put("id_servicio", rs.getObject("id_servicio"));
                    map.put("desc_servicio", rs.getString("desc_servicio"));
                    map.put("id_grupo_prog", rs.getObject("id_grupo_prog"));
                    map.put("desc_grupo_prog", rs.getString("desc_grupo"));
                    return map;
                }
            );

            if (!personalInfoList.isEmpty()) {
                resultado = personalInfoList.get(0);
                log.info("✅✅✅ Info Personal FINAL - ID Pers: {}, RegLab: {} ({}), Area: {} ({}), IPRESS: {} ({}), Servicio: {} ({})", 
                    resultado.get("id_pers"),
                    resultado.get("id_reg_lab"), resultado.get("desc_regimen_laboral"),
                    resultado.get("id_area"), resultado.get("desc_area"),
                    resultado.get("id_ipress"), resultado.get("desc_ipress"),
                    resultado.get("id_servicio"), resultado.get("desc_servicio")
                );
            } else {
                log.error("❌ No se obtuvieron datos con JOINs para id_pers={}", idPers);
            }
            
            log.info("🔍 ========== FIN DEBUGGING obtenerInfoPersonal ==========");
        } catch (Exception e) {
            log.error("❌ EXCEPCIÓN en obtenerInfoPersonal: {}", e.getMessage(), e);
        }
        return resultado;
    }
}