package com.styp.cenate.service.usuario;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.dto.mbac.RolResponse;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.security.PasswordTokenService;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.DimOrigenPersonalRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.segu.RolRepository;
import com.styp.cenate.service.mbac.PermisosService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 💼 Servicio principal para la gestión de usuarios del sistema CENATE (MBAC
 * 2025)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final PermisosService permisosService;
	private final RolRepository rolRepository;
	private final com.styp.cenate.repository.PersonalCntRepository personalCntRepository;
	private final com.styp.cenate.repository.TipoDocumentoRepository tipoDocumentoRepository;
	private final com.styp.cenate.repository.IpressRepository ipressRepository;
	private final com.styp.cenate.repository.PersonalProfRepository personalProfRepository;
	private final com.styp.cenate.repository.ProfesionRepository profesionRepository;
	private final com.styp.cenate.repository.EspecialidadRepository especialidadRepository;
	private final com.styp.cenate.repository.DimServicioEssiRepository dimServicioEssiRepository;
	private final com.styp.cenate.repository.RegimenLaboralRepository regimenLaboralRepository;
	private final com.styp.cenate.repository.AreaRepository areaRepository;
	private final com.styp.cenate.repository.PersonalTipoRepository personalTipoRepository;
	private final com.styp.cenate.repository.DimTipoPersonalRepository dimTipoPersonalRepository;
	private final EmailService emailService;
	private final PasswordTokenService passwordTokenService;

	private final DimOrigenPersonalRepository repositorioOrigenPersonal;
	private final JdbcTemplate jdbcTemplate;

	// =============================================================
	// 🟢 CREAR USUARIO
	// =============================================================
	@Override
	@Transactional
	public UsuarioResponse createUser(UsuarioCreateRequest request) {
		if (request == null)
			throw new IllegalArgumentException("Datos de usuario no proporcionados");

		if (usuarioRepository.existsByNameUser(request.getUsername()))
			throw new IllegalArgumentException("El nombre de usuario ya existe: " + request.getUsername());

		Usuario usuario = new Usuario();
		usuario.setNameUser(request.getUsername());
		usuario.setPassUser(passwordEncoder.encode(request.getPassword()));
		usuario.setStatUser(Optional.ofNullable(request.getEstado()).orElse("I"));
		usuario.setCreateAt(LocalDateTime.now());

		// 🆕 ASIGNACIÓN DE ROLES (Sistema MBAC)
		Set<Rol> rolesAsignados = new HashSet<>();

		if (request.getRoles() != null && !request.getRoles().isEmpty()) {
			// Si se envían roles específicos, buscarlos en la base de datos
			log.info("🔑 Asignando roles específicos: {}", request.getRoles());
			List<Rol> rolesEncontrados = rolRepository.findByDescRolInAndActive(request.getRoles());

			if (rolesEncontrados.isEmpty()) {
				log.warn("⚠️ No se encontraron roles activos para: {}. Asignando rol USER por defecto",
						request.getRoles());
				rolRepository.findByDescRol("USER").ifPresentOrElse(rolesAsignados::add,
						() -> log.error("❌ Rol USER no existe en la base de datos"));
			} else {
				rolesAsignados.addAll(rolesEncontrados);
				log.info("✅ Roles asignados: {}",
						rolesEncontrados.stream().map(Rol::getDescRol).collect(Collectors.joining(", ")));
			}
		} else if (request.getRol() != null && !request.getRol().isBlank()) {
			// Soporte para campo legacy 'rol' (singular)
			log.info("🔑 Asignando rol legacy: {}", request.getRol());
			rolRepository.findByDescRol(request.getRol()).ifPresentOrElse(rolesAsignados::add,
					() -> log.warn("⚠️ Rol '{}' no encontrado", request.getRol()));
		} else {
			// Por defecto, asignar rol USER
			log.info("🔑 No se especificaron roles. Asignando rol USER por defecto");
			rolRepository.findByDescRol("USER").ifPresentOrElse(rolesAsignados::add,
					() -> log.error("❌ Rol USER no existe en la base de datos"));
		}

		usuario.setRoles(rolesAsignados);
		usuarioRepository.save(usuario);

		// 🆕 CREAR REGISTRO DE PERSONAL_CNT con los datos personales
		// ⚠️ NO crear PersonalCnt para usuarios EXTERNOS (ellos van a dim_personal_externo)
		String tipoPersonalStr = request.getTipo_personal();
		boolean esExterno = tipoPersonalStr != null &&
				tipoPersonalStr.trim().toUpperCase().contains("EXTERNO");
		log.info("📋 Tipo personal recibido: '{}' -> esExterno: {}", tipoPersonalStr, esExterno);

		if (request.getNombres() != null && !request.getNombres().isBlank() && !esExterno) {
			log.info("👤 Creando registro de PersonalCnt para usuario: {}", usuario.getNameUser());

			PersonalCnt personalCnt = new PersonalCnt();
			personalCnt.setNomPers(request.getNombres());
			personalCnt.setApePaterPers(request.getApellido_paterno());
			personalCnt.setApeMaterPers(request.getApellido_materno());
			personalCnt.setNumDocPers(request.getNumero_documento());

			// 🔒 Validar y normalizar género (debe ser 1 carácter: M, F, u otro)
			String genero = request.getGenero();
			if (genero != null && !genero.isBlank()) {
				// Normalizar: "MASCULINO" -> "M", "FEMENINO" -> "F", "OTRO" -> "O"
				genero = genero.trim().toUpperCase();
				if (genero.startsWith("M")) {
					genero = "M";
				} else if (genero.startsWith("F")) {
					genero = "F";
				} else if (genero.length() > 1) {
					// Si es algo diferente, tomar solo el primer carácter
					genero = genero.substring(0, 1);
				}
				personalCnt.setGenPers(genero);
				log.info("✅ Género normalizado: {} -> {}", request.getGenero(), genero);
			} else {
				personalCnt.setGenPers(null);
				log.warn("⚠️ Género no proporcionado, se establecerá como NULL");
			}

			personalCnt.setEmailPers(request.getCorreo_personal());
			personalCnt.setEmailCorpPers(request.getCorreo_corporativo());
			personalCnt.setMovilPers(request.getTelefono());

			// 🔒 Asegurar que stat_pers sea exactamente 1 carácter
			personalCnt.setStatPers("A"); // Activo por defecto (1 carácter)
			personalCnt.setUsuario(usuario); // Asociar con el usuario

			// 📅 Asignar periodo actual (formato YYYYMM - requerido por BD)
			String periodoActual = java.time.YearMonth.now().toString().replace("-", "");
			personalCnt.setPerPers(periodoActual);
			log.info("📅 Asignando periodo: {}", periodoActual);

			// Parsear y asignar fecha de nacimiento
			if (request.getFecha_nacimiento() != null && !request.getFecha_nacimiento().isBlank()) {
				try {
					personalCnt.setFechNaciPers(java.time.LocalDate.parse(request.getFecha_nacimiento()));
				} catch (Exception e) {
					log.warn("⚠️ Error al parsear fecha de nacimiento: {}", e.getMessage());
				}
			}

			// Buscar y asignar Origen de Personal

			if (request.getId_origen() != null && request.getId_origen() != 0) {
				repositorioOrigenPersonal.findById(request.getId_origen()).ifPresentOrElse(
						personalCnt::setOrigenPersonal,
						() -> log.warn("No existe origen {}:  ", request.getId_origen()));

			}

			// Buscar y asignar tipo de documento
			if (request.getTipo_documento() != null && !request.getTipo_documento().isBlank()) {
				tipoDocumentoRepository.findByDescTipDoc(request.getTipo_documento()).ifPresentOrElse(
						personalCnt::setTipoDocumento,
						() -> log.warn("⚠️ Tipo de documento '{}' no encontrado", request.getTipo_documento()));
			}

			// 🏪 Asignar IPRESS si se proporciona
			if (request.getIdIpress() != null) {
				log.info("🏪 Buscando IPRESS con ID: {}", request.getIdIpress());
				ipressRepository.findById(request.getIdIpress()).ifPresentOrElse(ipress -> {
					personalCnt.setIpress(ipress);
					log.info("✅ IPRESS asignada: {} - {}", ipress.getCodIpress(), ipress.getDescIpress());
				}, () -> log.warn("⚠️ IPRESS con ID {} no encontrada", request.getIdIpress()));
			} else {
				log.info("⚠️ No se proporcionó ID de IPRESS para el usuario");
			}

			// 🆕 ACTUALIZAR DATOS LABORALES EN dim_personal_cnt ANTES DE GUARDAR
			if (request.getId_regimen_laboral() != null) {
				com.styp.cenate.model.RegimenLaboral regimen = regimenLaboralRepository
						.findById(request.getId_regimen_laboral()).orElse(null);
				if (regimen != null) {
					personalCnt.setRegimenLaboral(regimen);
					log.info("✅ Régimen laboral asignado: {}", regimen.getDescRegLab());
				} else {
					log.warn("⚠️ Régimen laboral no encontrado con ID: {}", request.getId_regimen_laboral());
				}
			}

			if (request.getId_area() != null) {
				com.styp.cenate.model.Area area = areaRepository.findById(request.getId_area()).orElse(null);
				if (area != null) {
					personalCnt.setArea(area);
					log.info("✅ Área asignada: {}", area.getDescArea());
				} else {
					log.warn("⚠️ Área no encontrada con ID: {}", request.getId_area());
				}
			}

			if (request.getCodigo_planilla() != null && !request.getCodigo_planilla().isBlank()) {
				personalCnt.setCodPlanRem(request.getCodigo_planilla());
				log.info("✅ Código planilla asignado: {}", request.getCodigo_planilla());
			} else if (request.getCodigo_planilla_alt() != null && !request.getCodigo_planilla_alt().isBlank()) {
				personalCnt.setCodPlanRem(request.getCodigo_planilla_alt());
				log.info("✅ Código planilla asignado (alt): {}", request.getCodigo_planilla_alt());
			}

			if (request.getPeriodo_ingreso() != null && !request.getPeriodo_ingreso().isBlank()) {
				String periodoIngreso = request.getPeriodo_ingreso().trim();
				// Validar que el periodo tenga formato YYYYMM (6 dígitos)
				if (periodoIngreso.matches("^\\d{6}$")) {
					personalCnt.setPerPers(periodoIngreso);
					log.info("✅ Periodo de ingreso asignado: {}", periodoIngreso);
				} else {
					log.warn(
							"⚠️ Periodo de ingreso con formato inválido: {}. Debe ser YYYYMM (6 dígitos). Se usará el periodo actual.",
							periodoIngreso);
					// No cambiar el periodo, se mantiene el asignado anteriormente (periodoActual)
				}
			}

			// Asignar colegiatura
			if (request.getColegiatura() != null && !request.getColegiatura().isBlank()) {
				personalCnt.setColegPers(request.getColegiatura());
				log.info("Colegiatura asignada: {}", request.getColegiatura());
			}

			if (request.getId_especialidad() != null) {

				dimServicioEssiRepository.findById(request.getId_especialidad())
				.ifPresent(servicio -> {
					personalCnt.setServicioEssi(servicio);
				});
				
			}

			personalCntRepository.save(personalCnt);
			log.info("✅ Registro de PersonalCnt creado exitosamente para: {}", usuario.getNameUser());

			// 🆕 CREAR DATOS PROFESIONALES EN dim_personal_prof
			if (request.getId_profesion() != null) {
				log.info("🏛️ Guardando datos profesionales para usuario ID: {}", usuario.getIdUser());

				// Buscar la profesión
				com.styp.cenate.model.Profesion profesion = profesionRepository.findById(request.getId_profesion())
						.orElseThrow(() -> new IllegalArgumentException(
								"Profesión no encontrada con ID: " + request.getId_profesion()));

				// Crear el ID compuesto para el nuevo registro
				com.styp.cenate.model.id.PersonalProfId profId = new com.styp.cenate.model.id.PersonalProfId(
						personalCnt.getIdPers(), request.getId_profesion());

				// Crear el nuevo registro de profesión
				com.styp.cenate.model.PersonalProf personalProf = com.styp.cenate.model.PersonalProf.builder()
						.id(profId).personal(personalCnt).profesion(profesion).estado("A").build();

				// Asignar desc_prof_otro si existe
				if (request.getDesc_prof_otro() != null && !request.getDesc_prof_otro().isBlank()) {
					personalProf.setDescProfOtro(request.getDesc_prof_otro());
					log.info("✅ Profesión OTRO especificada: {}", request.getDesc_prof_otro());
				}

				log.info("✅ Nueva profesión asignada: {}", profesion.getDescProf());

				// Actualizar especialidad en dim_personal_prof usando dim_servicio_essi
				if (request.getId_especialidad() != null) {
					log.info("🩺 Asignando especialidad para personal ID: {}", personalCnt.getIdPers());

					// Buscar el servicio ESSI (especialidad) por ID
					com.styp.cenate.model.DimServicioEssi servicioEssi = dimServicioEssiRepository
							.findById(request.getId_especialidad()).orElse(null);
					if (servicioEssi != null) {
						// Asignar el servicio ESSI al registro de PersonalProf
						personalProf.setServicioEssi(servicioEssi);
						log.info("✅ Especialidad asignada: {} (ID: {})", servicioEssi.getDescServicio(),
								servicioEssi.getIdServicio());
					} else {
						log.warn("⚠️ Especialidad/Servicio ESSI no encontrado con ID: {}",
								request.getId_especialidad());
						personalProf.setServicioEssi(null);
					}
				}

				// Actualizar RNE
				if (request.getRne() != null && !request.getRne().trim().isEmpty()) {
					personalProf.setRneProf(request.getRne().trim());
					log.info("✅ RNE asignado: {}", request.getRne());
				}

				// GUARDAR EN dim_personal_prof
				personalProfRepository.save(personalProf);
				log.info("✅ dim_personal_prof creado correctamente");
			}

			// 🆕 CREAR TIPO DE PROFESIONAL (dim_personal_tipo)
			if (request.getId_tip_pers() != null && personalCnt.getIdPers() != null) {
				log.info("👔 Asignando tipo de profesional para personal ID: {}", personalCnt.getIdPers());

				// Buscar el tipo de profesional
				com.styp.cenate.model.DimTipoPersonal tipoPersonal = dimTipoPersonalRepository
						.findById(request.getId_tip_pers()).orElse(null);

				if (tipoPersonal != null) {
					// Crear el ID compuesto
					com.styp.cenate.model.id.PersonalTipoId tipoId = new com.styp.cenate.model.id.PersonalTipoId(
							personalCnt.getIdPers(), request.getId_tip_pers());

					// Crear el nuevo registro de tipo de profesional
					com.styp.cenate.model.PersonalTipo personalTipo = com.styp.cenate.model.PersonalTipo.builder()
							.id(tipoId).personal(personalCnt).tipoPersonal(tipoPersonal).build();

					personalTipoRepository.save(personalTipo);
					log.info("✅ Tipo de profesional asignado: {} (ID: {})", tipoPersonal.getDescTipPers(),
							tipoPersonal.getIdTipPers());
				} else {
					log.warn("⚠️ Tipo de profesional no encontrado con ID: {}", request.getId_tip_pers());
				}
			}
		} else if (esExterno) {
			log.info("👤 Usuario EXTERNO: {} - Los datos personales se crearán en dim_personal_externo", usuario.getNameUser());
		} else {
			log.warn("⚠️ No se proporcionaron datos personales para el usuario: {}", usuario.getNameUser());
		}

		log.info("✅ Usuario creado exitosamente: {} con {} rol(es)", usuario.getNameUser(), rolesAsignados.size());

		// Enviar correo con enlace para configurar contraseña (sistema seguro de tokens)
		boolean emailEnviado = passwordTokenService.crearTokenYEnviarEmail(usuario, "BIENVENIDO");
		if (emailEnviado) {
			log.info("📧 Correo con enlace de configuración enviado al usuario: {}", usuario.getNameUser());
		} else {
			log.warn("⚠️ No se pudo enviar correo: el usuario no tiene email registrado");
		}

		return convertToResponse(usuario);
	}

	// =============================================================
	// 🔍 CONSULTAS
	// =============================================================
	@Override
	@Transactional(readOnly = true)
	public List<UsuarioResponse> getAllUsers() {
		log.info("📋 Obteniendo todos los usuarios con datos completos");
		return usuarioRepository.findAllWithPersonalData().stream().map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<UsuarioResponse> getAllPersonal() {
		log.info("📋 Obteniendo TODO el personal de CENATE (con y sin usuario)");

		// 📊 Obtener TODOS los registros de personal con relaciones cargadas
		// (optimizado)
		// Esto evita queries N+1 al cargar todas las relaciones en una sola query
		List<PersonalCnt> todoElPersonal = personalCntRepository.findAllWithRelations();
		log.info("📄 Se encontraron {} registros de personal en total", todoElPersonal.size());

		// 🚀 OPTIMIZACIÓN: Obtener IDs de usuarios con usuario para cargar permisos en
		// batch
		List<Long> userIdsConUsuario = todoElPersonal.stream()
				.filter(p -> p.getUsuario() != null && p.getUsuario().getIdUser() != null)
				.map(p -> p.getUsuario().getIdUser()).distinct().collect(Collectors.toList());

		// 🚀 Cargar todos los permisos de una vez (en lugar de una query por usuario)
		Map<Long, Set<String>> permisosMap = new HashMap<>();
		if (!userIdsConUsuario.isEmpty()) {
			log.info("🔐 Cargando permisos para {} usuarios en batch", userIdsConUsuario.size());
			for (Long userId : userIdsConUsuario) {
				try {
					List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuario(userId);
					Set<String> rutas = permisos.stream().map(PermisoUsuarioResponseDTO::getRutaPagina)
							.collect(Collectors.toSet());
					permisosMap.put(userId, rutas);
				} catch (Exception e) {
					log.warn("⚠️ Error al cargar permisos para usuario {}: {}", userId, e.getMessage());
					permisosMap.put(userId, Collections.emptySet());
				}
			}
		}

		// Convertir a response usando el map de permisos
		final Map<Long, Set<String>> permisosFinal = permisosMap;
		return todoElPersonal.stream().map(p -> convertPersonalCntToResponse(p, permisosFinal))
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getAllPersonal(int page, int size, String sortBy, String direction) {
		log.info("📋 Obteniendo personal de CENATE con paginación - Página: {}, Tamaño: {}, Orden: {} {}", page, size,
				sortBy, direction);

		// Validar parámetros
		if (page < 0)
			page = 0;
		if (size < 1)
			size = 7; // Default: 7 usuarios por página
		if (size > 100)
			size = 100; // Límite máximo

		// Crear Pageable con ordenamiento
		org.springframework.data.domain.Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction)
				? org.springframework.data.domain.Sort.Direction.DESC
				: org.springframework.data.domain.Sort.Direction.ASC;

		// Mapear campo de ordenamiento
		String sortField = mapSortField(sortBy);

		// Si el campo de ordenamiento es de una relación, usar un campo seguro por
		// defecto
		// y ordenar en memoria si es necesario (para evitar problemas con @EntityGraph)
		org.springframework.data.domain.Sort sort;
		try {
			sort = org.springframework.data.domain.Sort.by(sortDirection, sortField);
		} catch (Exception e) {
			log.warn("⚠️ Error al crear sort con campo '{}', usando idPers por defecto: {}", sortField, e.getMessage());
			sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC,
					"idPers");
		}

		org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
				sort);

		// 📊 Obtener página de personal con relaciones cargadas (optimizado)
		org.springframework.data.domain.Page<PersonalCnt> personalPage = personalCntRepository
				.findAllWithRelations(pageable);

		log.info("📄 Página {}/{} - {} registros de {} total", page + 1, personalPage.getTotalPages(),
				personalPage.getNumberOfElements(), personalPage.getTotalElements());

		// 🚀 OPTIMIZACIÓN: Obtener IDs de usuarios con usuario para cargar permisos en
		// batch
		List<PersonalCnt> personalList = personalPage.getContent();

		// 🚀 VALIDACIÓN: Limitar explícitamente a 'size' usuarios para garantizar
		// paginación correcta
		if (personalList.size() > size) {
			log.warn("⚠️ El servidor devolvió {} usuarios pero se solicitó {}. Limitando a {}", personalList.size(),
					size, size);
			personalList = personalList.subList(0, Math.min(size, personalList.size()));
		}

		log.info("📊 Usuarios a procesar: {} (solicitados: {})", personalList.size(), size);

		List<Long> userIdsConUsuario = personalList.stream()
				.filter(p -> p.getUsuario() != null && p.getUsuario().getIdUser() != null)
				.map(p -> p.getUsuario().getIdUser()).distinct().collect(Collectors.toList());

		// 🚀 OPTIMIZACIÓN CRÍTICA: Cargar TODOS los permisos en UNA SOLA QUERY
		Map<Long, Set<String>> permisosMap = new HashMap<>();
		if (!userIdsConUsuario.isEmpty()) {
			log.info("🚀 Cargando permisos en batch para {} usuarios (UNA SOLA QUERY)", userIdsConUsuario.size());
			try {
				// 🚀 UNA SOLA QUERY para todos los usuarios en lugar de N queries
				Map<Long, List<PermisoUsuarioResponseDTO>> permisosPorUsuario = permisosService
						.obtenerPermisosPorUsuarios(userIdsConUsuario);

				// Convertir a Set<String> de rutas
				for (Long userId : userIdsConUsuario) {
					List<PermisoUsuarioResponseDTO> permisos = permisosPorUsuario.getOrDefault(userId,
							Collections.emptyList());
					Set<String> rutas = permisos.stream().map(PermisoUsuarioResponseDTO::getRutaPagina)
							.collect(Collectors.toSet());
					permisosMap.put(userId, rutas);
				}

				log.info("✅ Permisos cargados para {} usuarios en una sola query", permisosMap.size());
			} catch (Exception e) {
				log.error("❌ Error al cargar permisos en batch: {}", e.getMessage(), e);
				// Si falla el batch, inicializar con sets vacíos
				for (Long userId : userIdsConUsuario) {
					permisosMap.put(userId, Collections.emptySet());
				}
			}
		}

		// Convertir a response usando el map de permisos
		final Map<Long, Set<String>> permisosFinal = permisosMap;
		List<UsuarioResponse> content = personalList.stream().map(p -> convertPersonalCntToResponse(p, permisosFinal))
				.collect(Collectors.toList());

		// 🚀 GARANTÍA FINAL: Limitar contenido a exactamente 'size' usuarios
		if (content.size() > size) {
			log.warn("⚠️ El contenido tiene {} usuarios pero se debe limitar a {}. Recortando.", content.size(), size);
			content = content.subList(0, Math.min(size, content.size()));
		}

		log.info("✅ Respuesta final: {} usuarios (solicitados: {})", content.size(), size);

		// Construir respuesta paginada
		Map<String, Object> response = new HashMap<>();
		response.put("content", content);
		response.put("totalElements", personalPage.getTotalElements());
		response.put("totalPages", personalPage.getTotalPages());
		response.put("currentPage", page);
		response.put("size", size);
		response.put("numberOfElements", personalPage.getNumberOfElements());
		response.put("first", personalPage.isFirst());
		response.put("last", personalPage.isLast());
		response.put("hasNext", personalPage.hasNext());
		response.put("hasPrevious", personalPage.hasPrevious());

		return response;
	}

	/**
	 * Mapea el campo de ordenamiento del frontend al campo de la entidad Nota:
	 * Evitamos campos de relaciones (como usuario.nameUser) para evitar problemas
	 * con @EntityGraph
	 */
	private String mapSortField(String sortBy) {
		Map<String, String> fieldMap = Map.of("idPers", "idPers", "id_pers", "idPers", "nombreCompleto", "nomPers",
				"nombre_completo", "nomPers", "username", "idPers", // Usar idPers como fallback (el ordenamiento por
																	// username se hará en memoria si es necesario)
				"estado", "statPers", "estado_usuario", "statPers", "numeroDocumento", "numDocPers", "numero_documento",
				"numDocPers");
		return fieldMap.getOrDefault(sortBy, "idPers");
	}

	/**
	 * 🔄 Convierte un registro de PersonalCnt a UsuarioResponse Funciona tanto para
	 * personal CON usuario como SIN usuario
	 * 
	 * @param permisosMap Map opcional de permisos por userId (para optimización)
	 */
	private UsuarioResponse convertPersonalCntToResponse(PersonalCnt personalCnt, Map<Long, Set<String>> permisosMap) {
		if (personalCnt == null)
			return null;

		// Si tiene usuario asociado, usar el método normal (con permisos optimizados)
		if (personalCnt.getUsuario() != null) {
			return convertToResponse(personalCnt.getUsuario(), permisosMap);
		}

		// 🔴 NO TIENE USUARIO - Crear UsuarioResponse con datos de personal solamente
		log.debug("⚠️ Personal sin usuario: {} {} {} (DNI: {})", personalCnt.getNomPers(),
				personalCnt.getApePaterPers(), personalCnt.getApeMaterPers(), personalCnt.getNumDocPers());

		String nombreCompleto = construirNombreCompleto(personalCnt.getNomPers(), personalCnt.getApePaterPers(),
				personalCnt.getApeMaterPers());

		String tipoDocumento = personalCnt.getTipoDocumento() != null ? personalCnt.getTipoDocumento().getDescTipDoc()
				: null;

		String regimenLaboral = personalCnt.getRegimenLaboral() != null
				? personalCnt.getRegimenLaboral().getDescRegLab()
				: null;

		String areaTrabajo = personalCnt.getArea() != null ? personalCnt.getArea().getDescArea() : null;

		String ipressNombre = null;
		String ipressCodigo = null;
		Long idIpress = null;
		// Red y Macroregión
		Long idRed = null;
		String nombreRed = null;
		String codigoRed = null;
		Long idMacroregion = null;
		String nombreMacroregion = null;

		if (personalCnt.getIpress() != null) {
			idIpress = personalCnt.getIpress().getIdIpress();
			ipressNombre = personalCnt.getIpress().getDescIpress();
			ipressCodigo = personalCnt.getIpress().getCodIpress();

			// Extraer Red de la IPRESS
			if (personalCnt.getIpress().getRed() != null) {
				var red = personalCnt.getIpress().getRed();
				idRed = red.getId();
				nombreRed = red.getDescripcion();
				codigoRed = red.getCodigo();

				// Extraer Macroregión de la Red
				if (red.getMacroregion() != null) {
					var macro = red.getMacroregion();
					idMacroregion = macro.getIdMacro();
					nombreMacroregion = macro.getDescMacro();
				}
			}
		}

		// Determinar si está activo basado en el estado de personal
		boolean esActivo = personalCnt.getStatPers() != null && "A".equalsIgnoreCase(personalCnt.getStatPers());

		return UsuarioResponse.builder()
				// 🔴 NO hay datos de usuario
				.idUser(null).username(personalCnt.getNumDocPers()) // Usar el DNI como username temporal
				.estado(personalCnt.getStatPers()).activo(esActivo).estadoUsuario(esActivo ? "ACTIVO" : "INACTIVO")
				.locked(false).requiereCambioPassword(false).failedAttempts(0).roles(Collections.emptySet())
				.permisos(Collections.emptySet())
				// Datos personales
				.nombreCompleto(nombreCompleto).nombres(personalCnt.getNomPers())
				.apellidoPaterno(personalCnt.getApePaterPers()).apellidoMaterno(personalCnt.getApeMaterPers())
				.numeroDocumento(personalCnt.getNumDocPers()).tipoDocumento(tipoDocumento)
				.correoPersonal(personalCnt.getEmailPers()).correoCorporativo(personalCnt.getEmailCorpPers())
				.telefono(personalCnt.getMovilPers()).direccion(personalCnt.getDirecPers())
				.genero(personalCnt.getGenPers()).fechaNacimiento(personalCnt.getFechNaciPers())
				.fotoUrl(personalCnt.getFotoPers())
				// Datos laborales
				.regimenLaboral(regimenLaboral).areaTrabajo(areaTrabajo)
				// IPRESS
				.idIpress(idIpress).nombreIpress(ipressNombre).codigoIpress(ipressCodigo)
				// Red y Macroregión
				.idRed(idRed).nombreRed(nombreRed).codigoRed(codigoRed)
				.idMacroregion(idMacroregion).nombreMacroregion(nombreMacroregion)
				// Tipo de personal
				.tipoPersonal("INTERNO").message("⚠️ Sin cuenta de usuario").build();
	}

	@Override
	@Transactional(readOnly = true)
	public UsuarioResponse getUserById(Long id) {
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
		return convertToResponse(usuario);
	}

	@Override
	@Transactional(readOnly = true)
	public UsuarioResponse getUserByUsername(String username) {
		Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));
		return convertToResponse(usuario);
	}

	@Override
	@Transactional(readOnly = true)
	public UsuarioResponse obtenerDetalleUsuarioExtendido(String username) {
		// Usar el nuevo método que carga todos los datos incluyendo PersonalExterno e IPRESS
		Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

		UsuarioResponse base = convertToResponse(usuario);
		PersonalCnt p = usuario.getPersonalCnt();
		com.styp.cenate.model.PersonalExterno pe = usuario.getPersonalExterno();

		if (p != null) {
			// Personal interno (CENATE)
			base.setNombreCompleto(p.getNombreCompleto());
			base.setCorreoPersonal(p.getEmailPers());
			base.setCorreoCorporativo(p.getEmailCorpPers());
			base.setNumeroDocumento(p.getNumDocPers());
			base.setTipoDocumento(p.getTipoDocumento() != null ? p.getTipoDocumento().toString() : null);
			base.setRegimenLaboral(p.getRegimenLaboral() != null ? p.getRegimenLaboral().getDescRegLab() : null);
			base.setAreaTrabajo(p.getArea() != null ? p.getArea().getDescArea() : null);
			base.setFotoUrl(p.getFotoPers());
			if (p.getIpress() != null) {
				base.setIdIpress(p.getIpress().getIdIpress());
				base.setNombreIpress(p.getIpress().getDescIpress());
				base.setCodigoIpress(p.getIpress().getCodIpress());
			}
		} else if (pe != null) {
			// Personal externo (IPRESS)
			base.setNombreCompleto(pe.getNombreCompleto());
			base.setCorreoPersonal(pe.getEmailExt());
			base.setCorreoCorporativo(pe.getEmailCorpExt());
			base.setNumeroDocumento(pe.getNumDocExt());
			base.setTipoDocumento(pe.getTipoDocumento() != null ? pe.getTipoDocumento().getDescTipDoc() : null);
			base.setTelefono(pe.getMovilExt());
			base.setTipoPersonal("EXTERNO");
			if (pe.getIpress() != null) {
				base.setIdIpress(pe.getIpress().getIdIpress());
				base.setNombreIpress(pe.getIpress().getDescIpress());
				base.setCodigoIpress(pe.getIpress().getCodIpress());
			}
		}
		return base;
	}

	// =============================================================
	// ✏️ ACTUALIZAR USUARIO (datos básicos)
	// =============================================================
	@Override
	@Transactional
	public UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request) {
		log.info("✏️ Actualizando usuario básico ID: {}", id);

		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

// 🔄 ACTUALIZAR USERNAME si se envía
		if (request.getUsername() != null && !request.getUsername().isBlank()) {
			// Verificar que el nuevo username no exista (si es diferente al actual)
			if (!usuario.getNameUser().equals(request.getUsername())) {
				if (usuarioRepository.existsByNameUser(request.getUsername())) {
					throw new IllegalArgumentException("El nombre de usuario ya existe: " + request.getUsername());
				}
				log.info("🔄 Actualizando username de {} a {}", usuario.getNameUser(), request.getUsername());
				usuario.setNameUser(request.getUsername());
			}
		}

		// 🚨 IMPORTANTE: Solo actualizar el estado si se envía explícitamente
		// Si no se envía, se mantiene el estado actual
		if (request.getEstado() != null && !request.getEstado().isBlank()) {
			log.info("🔄 Actualizando estado de {} a {}", usuario.getNameUser(), request.getEstado());

			// Normalizar el estado para soportar "Activo", "ACTIVO", "A", etc.
			String estadoNormalizado = request.getEstado().toUpperCase();
			boolean esActivo = estadoNormalizado.equals("ACTIVO") || estadoNormalizado.equals("A");

			usuario.setStatUser(esActivo ? "ACTIVO" : "INACTIVO");

			// También actualizar en personal_cnt si existe
			PersonalCnt personal = usuario.getPersonalCnt();
			if (personal != null) {
				personal.setStatPers(esActivo ? "A" : "I");
			}
		} else {
			log.info("ℹ️ No se modifica el estado del usuario {} (estado actual: {})", usuario.getNameUser(),
					usuario.getStatUser());
		}

		// 🎭 ACTUALIZAR ROLES si se envían
		if (request.getRoles() != null && !request.getRoles().isEmpty()) {
			log.info("🎭 Actualizando roles para usuario {}: {}", usuario.getNameUser(), request.getRoles());

			// Buscar los roles en la base de datos
			List<Rol> rolesEncontrados = rolRepository.findByDescRolInAndActive(request.getRoles());

			log.info("🔍 Roles encontrados en BD: {} de {} solicitados", rolesEncontrados.size(),
					request.getRoles().size());

			if (rolesEncontrados.isEmpty()) {
				log.warn("⚠️ No se encontraron roles activos para: {}", request.getRoles());
				log.warn("⚠️ Verificando roles disponibles...");
				List<Rol> todosLosRoles = rolRepository.findAll();
				log.warn("📊 Total de roles en BD: {}", todosLosRoles.size());
				todosLosRoles.forEach(r -> log.warn("📊 Rol: {} - Estado: {}", r.getDescRol(), r.getStatRol()));
			} else {
				// Reemplazar los roles actuales con los nuevos
				Set<Rol> nuevosRoles = new HashSet<>(rolesEncontrados);

				log.info("🔄 Roles actuales del usuario: {}",
						usuario.getRoles() != null
								? usuario.getRoles().stream().map(Rol::getDescRol).collect(Collectors.joining(", "))
								: "ninguno");

				usuario.setRoles(nuevosRoles);

				log.info("✅ Roles actualizados: {}",
						rolesEncontrados.stream().map(Rol::getDescRol).collect(Collectors.joining(", ")));
			}
		} else {
			log.info("ℹ️ No se modifican los roles del usuario {} (roles recibidos: {})", usuario.getNameUser(),
					request.getRoles());
		}

		usuario.setUpdateAt(LocalDateTime.now());
		usuarioRepository.save(usuario);

		log.info("✅ Usuario básico actualizado: {}", usuario.getNameUser());
		return convertToResponse(usuario);
	}

	// =============================================================
// ✏️ ACTUALIZAR DATOS COMPLETOS DEL PERSONAL
// =============================================================
	@Override
	@Transactional
	public UsuarioResponse actualizarDatosPersonal(Long id, com.styp.cenate.dto.PersonalUpdateRequest request) {
		log.info("✏️ Actualizando datos completos para usuario ID: {}", id);
		log.info("Datos para actualizar : {}", request.toString());
		

		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

		PersonalCnt personal = usuario.getPersonalCnt();
		if (personal == null) {
			personal = new PersonalCnt();
			personal.setUsuario(usuario);
			usuario.setPersonalCnt(personal);
		}

		// Actualizar datos personales
		if (request.getNombres() != null && !request.getNombres().isBlank()) {
			personal.setNomPers(request.getNombres());
		}
		if (request.getApellidoPaterno() != null && !request.getApellidoPaterno().isBlank()) {
			personal.setApePaterPers(request.getApellidoPaterno());
		}
		if (request.getApellidoMaterno() != null && !request.getApellidoMaterno().isBlank()) {
			personal.setApeMaterPers(request.getApellidoMaterno());
		}
		if (request.getNumeroDocumento() != null && !request.getNumeroDocumento().isBlank()) {
			personal.setNumDocPers(request.getNumeroDocumento());
		}
		if (request.getGenero() != null && !request.getGenero().isBlank()) {
			personal.setGenPers(request.getGenero());
		}
		if (request.getTelefono() != null && !request.getTelefono().isBlank()) {
			personal.setMovilPers(request.getTelefono());
		}
		if (request.getCorreoPersonal() != null && !request.getCorreoPersonal().isBlank()) {
			personal.setEmailPers(request.getCorreoPersonal());
		}
		if (request.getCorreoInstitucional() != null && !request.getCorreoInstitucional().isBlank()) {
			personal.setEmailCorpPers(request.getCorreoInstitucional());
		}
		if (request.getDireccion() != null && !request.getDireccion().isBlank()) {
			personal.setDirecPers(request.getDireccion());
		}

		// Fecha de nacimiento
		if (request.getFechaNacimiento() != null && !request.getFechaNacimiento().isBlank()) {
			try {
				personal.setFechNaciPers(java.time.LocalDate.parse(request.getFechaNacimiento()));
			} catch (Exception e) {
				log.warn("⚠️ Error al parsear fecha de nacimiento: {}", e.getMessage());
			}
		}

		// Tipo de documento
		if (request.getTipoDocumento() != null && !request.getTipoDocumento().isBlank()) {
			tipoDocumentoRepository.findByDescTipDoc(request.getTipoDocumento()).ifPresent(personal::setTipoDocumento);
		}

		// Datos profesionales
		if (request.getColegiatura() != null && !request.getColegiatura().isBlank()) {
			personal.setColegPers(request.getColegiatura());
		}
		
		
		
		

		// 🔥 ACTUALIZAR O CREAR DATOS PROFESIONALES EN dim_personal_prof
		if (request.getIdProfesion() != null) {
			log.info("🏛️ Guardando datos profesionales para usuario ID: {}", id);

			// 🗑️ PRIMERO: Eliminar TODAS las profesiones anteriores del usuario
			// Esto previene que queden profesiones duplicadas en la base de datos
			personalProfRepository.deleteByPersonal_IdPers(personal.getIdPers());
			log.info("🗑️ Profesiones anteriores eliminadas para el personal ID: {}", personal.getIdPers());

			// Buscar la profesión
			com.styp.cenate.model.Profesion profesion = profesionRepository.findById(request.getIdProfesion())
					.orElseThrow(() -> new IllegalArgumentException(
							"Profesión no encontrada con ID: " + request.getIdProfesion()));

			// Crear el ID compuesto para el nuevo registro
			com.styp.cenate.model.id.PersonalProfId profId = new com.styp.cenate.model.id.PersonalProfId(
					personal.getIdPers(), request.getIdProfesion());

			// Crear el nuevo registro de profesión
			com.styp.cenate.model.PersonalProf personalProf = com.styp.cenate.model.PersonalProf.builder().id(profId)
					.personal(personal).profesion(profesion).estado("A").build();

			log.info("✅ Nueva profesión asignada: {}", profesion.getDescProf());

			// TODO: Agregar soporte para desc_prof_otro si es necesario en el futuro

			// Actualizar especialidad en dim_personal_prof usando dim_servicio_essi
			if (request.getIdEspecialidad() != null) {
				log.info("🩺 Actualizando especialidad para personal ID: {}", personal.getIdPers());

				// Buscar el servicio ESSI (especialidad) por ID
				com.styp.cenate.model.DimServicioEssi servicioEssi = dimServicioEssiRepository
						.findById(request.getIdEspecialidad()).orElse(null);
				log.info("servicioEssi :::   " + servicioEssi.getCodServicio() + "-- "+ servicioEssi.getDescServicio());
				if (servicioEssi != null) {
					// Asignar el servicio ESSI al registro de PersonalProf
					personalProf.setServicioEssi(servicioEssi);
					log.info("✅ Especialidad actualizada: {} (ID: {})", servicioEssi.getDescServicio(),
							servicioEssi.getIdServicio());	
					
				} else {
					log.warn("⚠️ Especialidad/Servicio ESSI no encontrado con ID: {}", request.getIdEspecialidad());
					personalProf.setServicioEssi(null);
				}
			} else {
				// Si no se envía especialidad, limpiar la asignación anterior
				personalProf.setServicioEssi(null);
				log.info("🗑️ Especialidad limpiada para personal ID: {}", personal.getIdPers());
			}
			

			// Actualizar RNE
			if (request.getRne() != null && !request.getRne().trim().isEmpty()) {
				personalProf.setRneProf(request.getRne().trim());
				log.info("✅ RNE actualizado: {}", request.getRne());
			} else {
				personalProf.setRneProf(null);
			}

			// GUARDAR CAMBIOS EN dim_personal_prof
			personalProfRepository.save(personalProf);
			log.info("✅ dim_personal_prof actualizado correctamente");
		}
		
		
		
		
		
		
		
		
		
		if( request.getIdEspecialidad() != null) {
			DimServicioEssi servicioEssi = dimServicioEssiRepository
					.findById(request.getIdEspecialidad()).orElse(null);
			
			if (servicioEssi != null) {
				personal.setServicioEssi(servicioEssi);	
			} 
			
		}
		
		
		
		
		
		

		// 🔥 ACTUALIZAR DATOS LABORALES EN dim_personal_cnt
		if (request.getIdRegimenLaboral() != null) {
			com.styp.cenate.model.RegimenLaboral regimen = regimenLaboralRepository
					.findById(request.getIdRegimenLaboral()).orElse(null);
			if (regimen != null) {
				personal.setRegimenLaboral(regimen);
				log.info("✅ Régimen laboral actualizado: {}", regimen.getDescRegLab());
			} else {
				log.warn("⚠️ Régimen laboral no encontrado con ID: {}", request.getIdRegimenLaboral());
			}
		}

		if (request.getIdArea() != null) {
			com.styp.cenate.model.Area area = areaRepository.findById(request.getIdArea()).orElse(null);
			if (area != null) {
				personal.setArea(area);
				log.info("✅ Área actualizada: {}", area.getDescArea());
			} else {
				log.warn("⚠️ Área no encontrada con ID: {}", request.getIdArea());
			}
		}

		if (request.getCodigoPlanilla() != null && !request.getCodigoPlanilla().isBlank()) {
			personal.setCodPlanRem(request.getCodigoPlanilla());
			log.info("✅ Código planilla actualizado: {}", request.getCodigoPlanilla());
		}

		if (request.getPeriodoIngreso() != null && !request.getPeriodoIngreso().isBlank()) {
			personal.setPerPers(request.getPeriodoIngreso());
		}

		if (request.getEstado() != null && !request.getEstado().isBlank()) {
			// 🔄 Normalizar el estado para soportar "Activo", "ACTIVO", "A", etc.
			String estadoNormalizado = request.getEstado().toUpperCase();
			boolean esActivo = estadoNormalizado.equals("ACTIVO") || estadoNormalizado.equals("A");

			personal.setStatPers(esActivo ? "A" : "I");
			usuario.setStatUser(esActivo ? "ACTIVO" : "INACTIVO"); // ✅ Guardar ACTIVO/INACTIVO directamente

			log.info("📊 Estado actualizado para usuario {}: {} → {}", usuario.getNameUser(), request.getEstado(),
					esActivo ? "ACTIVO (A)" : "INACTIVO (I)");
		}

		final PersonalCnt personalFinal = personal;

		// Actualizar relaciones si se proporcionan IDs
		if (request.getIdIpress() != null) {
			ipressRepository.findById(request.getIdIpress()).ifPresent(ipress -> {
				personalFinal.setIpress(ipress);
				log.info("✅ IPRESS actualizado: {}", ipress.getDescIpress());
			});
		}

		// 🔥 ACTUALIZAR TIPO DE PROFESIONAL (dim_personal_tipo)
		if (request.getIdTipPers() != null && personal.getIdPers() != null) {
			log.info("👔 Actualizando tipo de profesional para personal ID: {}", personal.getIdPers());

			// Primero, eliminar todos los tipos anteriores del personal
			personalTipoRepository.deleteByPersonal_IdPers(personal.getIdPers());
			log.info("🗑️ Tipos de profesional anteriores eliminados para el personal ID: {}", personal.getIdPers());

			// Buscar el tipo de profesional
			com.styp.cenate.model.DimTipoPersonal tipoPersonal = dimTipoPersonalRepository
					.findById(request.getIdTipPers()).orElseThrow(() -> new IllegalArgumentException(
							"Tipo de profesional no encontrado con ID: " + request.getIdTipPers()));

			// Crear el ID compuesto para el nuevo registro
			com.styp.cenate.model.id.PersonalTipoId tipoId = new com.styp.cenate.model.id.PersonalTipoId(
					personal.getIdPers(), request.getIdTipPers());

			// Crear el nuevo registro de tipo de profesional
			com.styp.cenate.model.PersonalTipo personalTipo = com.styp.cenate.model.PersonalTipo.builder().id(tipoId)
					.personal(personal).tipoPersonal(tipoPersonal).build();

			personalTipoRepository.save(personalTipo);
			log.info("✅ Tipo de profesional actualizado: {} (ID: {})", tipoPersonal.getDescTipPers(),
					tipoPersonal.getIdTipPers());
		} else if (request.getIdTipPers() == null && personal.getIdPers() != null) {
			// Si no se envía tipo de profesional, eliminar los existentes
			personalTipoRepository.deleteByPersonal_IdPers(personal.getIdPers());
			log.info("🗑️ Tipos de profesional limpiados para personal ID: {}", personal.getIdPers());
		}

		// Guardar
		usuario.setUpdateAt(LocalDateTime.now());
		usuarioRepository.save(usuario);

		log.info("✅ Datos actualizados correctamente para usuario: {}", usuario.getNameUser());
		return convertToResponse(usuario);
	}

	// =============================================================
	// 🚫 ELIMINAR USUARIO
	// =============================================================
	@Override
	@Transactional
	public void deleteUser(Long id) {
		log.info("🗑️ Iniciando eliminación completa de usuario ID: {}", id);

		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

		String numDocumento = usuario.getNameUser();
		Long idPersonal = null;

		// Obtener ID de personal antes de eliminar
		if (usuario.getPersonalCnt() != null) {
			idPersonal = usuario.getPersonalCnt().getIdPers();
		}

		// 1. Eliminar permisos del usuario
		int permisos = jdbcTemplate.update("DELETE FROM permisos_modulares WHERE id_user = ?", id);
		log.info("  - Permisos eliminados: {}", permisos);

		// 2. Eliminar roles del usuario
		int roles = jdbcTemplate.update("DELETE FROM rel_user_roles WHERE id_user = ?", id);
		log.info("  - Roles eliminados: {}", roles);

		// 3. Desvincular y eliminar personal
		if (idPersonal != null) {
			// Desvincular primero
			jdbcTemplate.update("UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?", idPersonal);

			// Eliminar profesiones del personal
			int profs = jdbcTemplate.update("DELETE FROM dim_personal_prof WHERE id_pers = ?", idPersonal);
			log.info("  - Profesiones eliminadas: {}", profs);

			// Eliminar tipos del personal
			int tipos = jdbcTemplate.update("DELETE FROM dim_personal_tipo WHERE id_pers = ?", idPersonal);
			log.info("  - Tipos eliminados: {}", tipos);
		}

		// 4. Eliminar usuario
		usuarioRepository.delete(usuario);
		log.info("  - Usuario eliminado: {}", numDocumento);

		// 5. Eliminar personal huérfano
		if (idPersonal != null) {
			int personal = jdbcTemplate.update("DELETE FROM dim_personal_cnt WHERE id_pers = ?", idPersonal);
			log.info("  - Personal eliminado: {}", personal);
		}

		// 6. Actualizar solicitudes en account_requests a RECHAZADO para permitir re-registro
		int solicitudes = jdbcTemplate.update("""
			UPDATE account_requests
			SET estado = 'RECHAZADO',
			    observacion_admin = 'Usuario eliminado - Puede volver a registrarse',
			    updated_at = CURRENT_TIMESTAMP
			WHERE num_documento = ? AND estado IN ('PENDIENTE', 'APROBADO')
			""", numDocumento);
		log.info("  - Solicitudes actualizadas a RECHAZADO: {}", solicitudes);

		log.info("✅ Usuario {} (ID: {}) eliminado completamente", numDocumento, id);
	}

	// =============================================================
	// 🔒 CONTROL DE ESTADO
	// =============================================================
	@Override
	@Transactional
	public UsuarioResponse activateUser(Long id) {
		log.info("🟢 Activando usuario ID: {}", id);
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

		// Guardar como 'ACTIVO' directamente (el trigger de BD lo mantendrá así)
		usuario.setStatUser("ACTIVO");
		usuario.setUpdateAt(LocalDateTime.now());

		// También actualizar el estado en personal_cnt si existe
		PersonalCnt personal = usuario.getPersonalCnt();
		if (personal != null) {
			personal.setStatPers("A");
		}

		usuarioRepository.save(usuario);
		log.info("✅ Usuario {} activado correctamente", usuario.getNameUser());
		return convertToResponse(usuario);
	}

	@Override
	@Transactional
	public UsuarioResponse deactivateUser(Long id) {
		log.info("🔴 Desactivando usuario ID: {}", id);
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

		// Guardar como 'INACTIVO' directamente (el trigger de BD lo mantendrá así)
		usuario.setStatUser("INACTIVO");
		usuario.setUpdateAt(LocalDateTime.now());

		// También actualizar el estado en personal_cnt si existe
		PersonalCnt personal = usuario.getPersonalCnt();
		if (personal != null) {
			personal.setStatPers("I");
		}

		usuarioRepository.save(usuario);
		log.info("✅ Usuario {} desactivado correctamente", usuario.getNameUser());
		return convertToResponse(usuario);
	}

	@Override
	@Transactional
	public UsuarioResponse unlockUser(Long id) {
		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));
		usuario.setLockedUntil(null);
		usuario.setFailedAttempts(0);
		usuarioRepository.save(usuario);
		return convertToResponse(usuario);
	}

	// =============================================================
	// 🔑 CAMBIO DE CONTRASEÑA
	// =============================================================
	@Override
	@Transactional
	public void changePassword(String username, String currentPassword, String newPassword) {
		Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

		if (!passwordEncoder.matches(currentPassword, usuario.getPassUser()))
			throw new IllegalArgumentException("La contraseña actual es incorrecta");

		usuario.setPassUser(passwordEncoder.encode(newPassword));
		usuario.setUpdateAt(LocalDateTime.now());

		// ✅ Desactivar flag de cambio obligatorio de contraseña
		usuario.setRequiereCambioPassword(false);
		log.info("✅ Flag de cambio de contraseña desactivado para: {}", username);

		usuarioRepository.save(usuario);
	}

	/**
	 * 🔄 Resetear contraseña (para ADMIN/SUPERADMIN)
	 * Genera contraseña temporal aleatoria y envía enlace para configurar nueva contraseña
	 */
	@Override
	@Transactional
	public void resetPassword(Long id, String newPassword) {
		log.info("🔄 Reseteando contraseña para usuario ID: {}", id);

		Usuario usuario = usuarioRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + id));

		// Generar contraseña temporal aleatoria si no se proporciona una
		String passwordTemporal = (newPassword == null || newPassword.isBlank())
				? passwordTokenService.generarPasswordTemporal()
				: newPassword;

		// Validar que la nueva contraseña cumpla requisitos mínimos
		if (passwordTemporal.length() < 8) {
			throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
		}

		// Actualizar la contraseña sin verificar la anterior
		usuario.setPassUser(passwordEncoder.encode(passwordTemporal));
		usuario.setUpdateAt(LocalDateTime.now());

		// Resetear intentos fallidos y desbloquear si estaba bloqueado
		usuario.setFailedAttempts(0);
		usuario.setLockedUntil(null);

		// 🚨 IMPORTANTE: Marcar que debe cambiar la contraseña en el próximo login
		usuario.setRequiereCambioPassword(true);
		log.info("🔑 Usuario deberá cambiar su contraseña en el próximo inicio de sesión");

		usuarioRepository.save(usuario);

		log.info("✅ Contraseña reseteada exitosamente para usuario: {}", usuario.getNameUser());

		// Enviar correo con enlace para configurar nueva contraseña (sistema seguro de tokens)
		boolean emailEnviado = passwordTokenService.crearTokenYEnviarEmail(usuario, "RESET");
		if (emailEnviado) {
			log.info("📧 Correo con enlace de cambio de contraseña enviado al usuario: {}", usuario.getNameUser());
		} else {
			log.warn("⚠️ No se pudo enviar correo: el usuario no tiene email registrado");
		}
	}

	/**
	 * Obtener el email del usuario desde PersonalCnt o PersonalExterno
	 */
	private String obtenerEmailUsuario(Usuario usuario) {
		// Intentar obtener email de PersonalCnt
		if (usuario.getPersonalCnt() != null) {
			PersonalCnt personal = usuario.getPersonalCnt();
			if (personal.getEmailPers() != null && !personal.getEmailPers().isBlank()) {
				return personal.getEmailPers();
			}
			if (personal.getEmailCorpPers() != null && !personal.getEmailCorpPers().isBlank()) {
				return personal.getEmailCorpPers();
			}
		}

		// Intentar obtener email de PersonalExterno
		if (usuario.getPersonalExterno() != null) {
			var personalExt = usuario.getPersonalExterno();
			if (personalExt.getEmailPersExt() != null && !personalExt.getEmailPersExt().isBlank()) {
				return personalExt.getEmailPersExt();
			}
			if (personalExt.getEmailCorpExt() != null && !personalExt.getEmailCorpExt().isBlank()) {
				return personalExt.getEmailCorpExt();
			}
		}

		return null;
	}

	/**
	 * 🆕 Completar primer acceso (cambio de contraseña + datos personales)
	 */
	@Override
	@Transactional
	public void completarPrimerAcceso(String username, com.styp.cenate.dto.CompletarPrimerAccesoRequest request) {
		log.info("🆕 Completando primer acceso para usuario: {}", username);

		Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

		// Validar que el usuario realmente requiere cambio de contraseña
		if (!Boolean.TRUE.equals(usuario.getRequiereCambioPassword())) {
			throw new IllegalArgumentException("El usuario no requiere completar primer acceso");
		}

		// ============================================================
		// 🔑 VALIDAR CONTRASEÑAS
		// ============================================================
		if (request.getPasswordActual() == null || request.getPasswordActual().isBlank()) {
			throw new IllegalArgumentException("Debe proporcionar la contraseña actual");
		}
		if (request.getPasswordNueva() == null || request.getPasswordNueva().isBlank()) {
			throw new IllegalArgumentException("Debe proporcionar la nueva contraseña");
		}
		if (request.getPasswordConfirmacion() == null
				|| !request.getPasswordConfirmacion().equals(request.getPasswordNueva())) {
			throw new IllegalArgumentException("La confirmación de contraseña no coincide");
		}

		// Verificar contraseña actual
		if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassUser())) {
			throw new IllegalArgumentException("La contraseña actual es incorrecta");
		}

		// Validar requisitos de seguridad de la nueva contraseña
		if (request.getPasswordNueva().length() < 8) {
			throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
		}
		if (!request.getPasswordNueva().matches(".*[A-Z].*")) {
			throw new IllegalArgumentException("La contraseña debe contener al menos una mayúscula");
		}
		if (!request.getPasswordNueva().matches(".*[a-z].*")) {
			throw new IllegalArgumentException("La contraseña debe contener al menos una minúscula");
		}
		if (!request.getPasswordNueva().matches(".*\\d.*")) {
			throw new IllegalArgumentException("La contraseña debe contener al menos un número");
		}
		if (!request.getPasswordNueva().matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
			throw new IllegalArgumentException("La contraseña debe contener al menos un símbolo (!@#$%^&*...)");
		}

		// ============================================================
		// 📝 VALIDAR DATOS PERSONALES
		// ============================================================
		if (request.getCorreoPersonal() == null || request.getCorreoPersonal().isBlank()) {
			throw new IllegalArgumentException("El correo personal es obligatorio");
		}
		if (!request.getCorreoPersonal().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
			throw new IllegalArgumentException("El formato del correo personal es inválido");
		}
		if (request.getTelefono() == null || request.getTelefono().isBlank()) {
			throw new IllegalArgumentException("El teléfono es obligatorio");
		}
		if (!request.getTelefono().matches("^\\d{7,15}$")) {
			throw new IllegalArgumentException("El teléfono debe contener solo números (7-15 dígitos)");
		}

		// ============================================================
		// 🔄 ACTUALIZAR CONTRASEÑA
		// ============================================================
		usuario.setPassUser(passwordEncoder.encode(request.getPasswordNueva()));
		usuario.setUpdateAt(LocalDateTime.now());
		usuario.setRequiereCambioPassword(false); // ✅ Ya completó el primer acceso
		log.info("✅ Contraseña actualizada para: {}", username);

		// ============================================================
		// 👤 ACTUALIZAR DATOS PERSONALES
		// ============================================================
		PersonalCnt personal = usuario.getPersonalCnt();
		if (personal == null) {
			personal = new PersonalCnt();
			personal.setUsuario(usuario);
			usuario.setPersonalCnt(personal);

			// Asignar periodo actual (formato YYYYMM - requerido por BD)
			String periodoActual = java.time.YearMonth.now().toString().replace("-", "");
			personal.setPerPers(periodoActual);
		}

		personal.setEmailPers(request.getCorreoPersonal());
		personal.setMovilPers(request.getTelefono());

		// Datos opcionales
		if (request.getCorreoSecundario() != null && !request.getCorreoSecundario().isBlank()) {
			personal.setEmailCorpPers(request.getCorreoSecundario());
		}
		// El teléfono secundario se puede guardar en otro campo si existe en tu modelo

		usuarioRepository.save(usuario);

		log.info("✅ Primer acceso completado exitosamente para usuario: {}", username);
	}

	// =============================================================
	// 🧭 FILTROS POR ROLES
	// =============================================================
	@Override
	@Transactional(readOnly = true)
	public List<UsuarioResponse> getUsuariosByRoles(List<String> roles) {
		return usuarioRepository.findAllWithRoles().stream().filter(
				u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> roles.contains(r.getDescRol())))
				.map(this::convertToResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<UsuarioResponse> getUsuariosExcluyendoRoles(List<String> roles) {
		return usuarioRepository.findAllWithRoles().stream().filter(
				u -> u.getRoles() == null || u.getRoles().stream().noneMatch(r -> roles.contains(r.getDescRol())))
				.map(this::convertToResponse).collect(Collectors.toList());
	}

	// =============================================================
	// 🧩 ROLES DEL USUARIO
	// =============================================================
	@Override
	@Transactional(readOnly = true)
	public List<String> getRolesByUsername(String username) {
		Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

		if (usuario.getRoles() == null)
			return List.of();

		return usuario.getRoles().stream().map(Rol::getDescRol).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<RolResponse> obtenerRolesPorUsername(String username) {
		Usuario usuario = usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

		if (usuario.getRoles() == null || usuario.getRoles().isEmpty())
			return List.of();

		return usuario.getRoles().stream()
				.map(rol -> RolResponse.builder().idRol(rol.getIdRol()).nombreRol(rol.getDescRol())
						.areaTrabajo(rol.getArea() != null ? rol.getArea().getDescArea() : "Sin área")
						.estado(rol.getStatRol() != null ? rol.getStatRol() : "A").build())
				.collect(Collectors.toList());
	}

	// =============================================================
	// 🧠 CONVERTIR DTO (CORREGIDO - COINCIDE CON SQL)
	// =============================================================
	/**
	 * Convierte una entidad Usuario a UsuarioResponse.
	 * 
	 * 🎯 LÓGICA DE TIPO DE PERSONAL (replica exactamente el SQL): - Si existe
	 * relación con dim_personal_cnt → INTERNO - Si existe relación con
	 * dim_personal_externo → EXTERNO - Si no existe ninguna relación →
	 * SIN_CLASIFICAR
	 * 
	 * @param permisosMap Map opcional de permisos por userId (null = cargar
	 *                    normalmente)
	 */
	private UsuarioResponse convertToResponse(Usuario usuario) {
		return convertToResponse(usuario, null);
	}

	/**
	 * 🔄 Convierte Usuario a UsuarioResponse (sobrecarga con permisos optimizados)
	 */
	private UsuarioResponse convertToResponse(Usuario usuario, Map<Long, Set<String>> permisosMap) {
		if (usuario == null)
			return null;

		log.debug("🔄 Convirtiendo usuario: {}", usuario.getNameUser());

		// ============================================================
		// 🔐 ROLES Y PERMISOS
		// ============================================================
		Set<String> roles = Optional.ofNullable(usuario.getRoles()).orElse(Collections.emptySet()).stream()
				.map(Rol::getDescRol).collect(Collectors.toSet());

		Set<String> permisos = new HashSet<>();
		if (usuario.getIdUser() != null) {
			// 🚀 OPTIMIZACIÓN: Si se proporciona el map de permisos, usarlo (evita query)
			if (permisosMap != null && permisosMap.containsKey(usuario.getIdUser())) {
				permisos = permisosMap.get(usuario.getIdUser());
			} else {
				// Cargar permisos normalmente (para casos individuales)
				List<PermisoUsuarioResponseDTO> permisosUsuario = permisosService
						.obtenerPermisosPorUsuario(usuario.getIdUser());
				permisos = permisosUsuario.stream().map(PermisoUsuarioResponseDTO::getRutaPagina)
						.collect(Collectors.toSet());
			}
		}

		// ============================================================
		// 🎯 DETERMINACIÓN DEL TIPO DE PERSONAL (LÓGICA CORREGIDA)
		// ============================================================
		// IMPORTANTE: Replicar exactamente la lógica del SQL:
		// - Si existe relación con dim_personal_cnt → INTERNO
		// - Si existe relación con dim_personal_externo → EXTERNO
		// - Si no existe ninguna relación → SIN_CLASIFICAR
		// ============================================================

		PersonalCnt personalCnt = usuario.getPersonalCnt();
		com.styp.cenate.model.PersonalExterno personalExterno = usuario.getPersonalExterno();

		String tipoPersonal;
		if (personalCnt != null) {
			// ✅ Existe registro en dim_personal_cnt → ES INTERNO
			tipoPersonal = "INTERNO";
			log.debug("👤 Usuario {} es INTERNO (tiene PersonalCnt con ID: {})", usuario.getNameUser(),
					personalCnt.getIdPers());
		} else if (personalExterno != null) {
			// ✅ Existe registro en dim_personal_externo → ES EXTERNO
			tipoPersonal = "EXTERNO";
			log.debug("👤 Usuario {} es EXTERNO (tiene PersonalExterno con ID: {})", usuario.getNameUser(),
					personalExterno.getIdPersExt());
		} else {
			// ❌ No existe en ninguna tabla → SIN CLASIFICAR
			tipoPersonal = "SIN_CLASIFICAR";
			log.debug("⚠️ Usuario {} no tiene datos en personal_cnt ni personal_externo", usuario.getNameUser());
		}

		// ============================================================
		// 👤 INICIALIZACIÓN DE VARIABLES PARA DATOS PERSONALES
		// ============================================================
		String nombreCompleto = usuario.getNameUser();
		String numeroDocumento = null;
		String tipoDocumento = null;
		String correoPersonal = null;
		String correoCorporativo = null;
		String telefono = null;
		String direccion = null;
		String fotoUrl = null;
		String regimenLaboral = null;
		String areaTrabajo = null;
		String ipressNombre = null;
		String ipressCodigo = null;
		Long idIpress = null;
		// Red y Macroregión
		Long idRed = null;
		String nombreRed = null;
		String codigoRed = null;
		Long idMacroregion = null;
		String nombreMacroregion = null;
		String genero = null;
		LocalDate fechaNacimiento = null;
		String nombres = null;
		String apellidoPaterno = null;
		String apellidoMaterno = null;

		// ============================================================
		// 👤 MAPEO DE DATOS PERSONALES (solo si es INTERNO)
		// ============================================================
		if (personalCnt != null) {
			// Nombre completo
			if (personalCnt.getNomPers() != null || personalCnt.getApePaterPers() != null
					|| personalCnt.getApeMaterPers() != null) {
				nombreCompleto = construirNombreCompleto(personalCnt.getNomPers(), personalCnt.getApePaterPers(),
						personalCnt.getApeMaterPers());
			}

			nombres = personalCnt.getNomPers();
			apellidoPaterno = personalCnt.getApePaterPers();
			apellidoMaterno = personalCnt.getApeMaterPers();
			numeroDocumento = personalCnt.getNumDocPers();

			if (personalCnt.getTipoDocumento() != null) {
				tipoDocumento = personalCnt.getTipoDocumento().getDescTipDoc();
			}

			correoPersonal = personalCnt.getEmailPers();
			correoCorporativo = personalCnt.getEmailCorpPers();
			telefono = personalCnt.getMovilPers();
			direccion = personalCnt.getDirecPers();
			fotoUrl = personalCnt.getFotoPers();
			genero = personalCnt.getGenPers();
			fechaNacimiento = personalCnt.getFechNaciPers();

			if (personalCnt.getRegimenLaboral() != null) {
				regimenLaboral = personalCnt.getRegimenLaboral().getDescRegLab();
			}

			if (personalCnt.getArea() != null) {
				areaTrabajo = personalCnt.getArea().getDescArea();
			}

			// 🏥 DATOS DE IPRESS
			if (personalCnt.getIpress() != null) {
				idIpress = personalCnt.getIpress().getIdIpress();
				ipressNombre = personalCnt.getIpress().getDescIpress();
				ipressCodigo = personalCnt.getIpress().getCodIpress();

				// 🌐 Extraer Red de la IPRESS
				if (personalCnt.getIpress().getRed() != null) {
					var red = personalCnt.getIpress().getRed();
					idRed = red.getId();
					nombreRed = red.getDescripcion();
					codigoRed = red.getCodigo();

					// 🗺️ Extraer Macroregión de la Red
					if (red.getMacroregion() != null) {
						var macro = red.getMacroregion();
						idMacroregion = macro.getIdMacro();
						nombreMacroregion = macro.getDescMacro();
					}
				}
			}
		}

		// ============================================================
		// 🏢 MAPEO DE DATOS PERSONALES EXTERNOS (solo si es EXTERNO)
		// ============================================================
		else if (personalExterno != null) {
			nombreCompleto = personalExterno.getNombreCompleto();
			nombres = personalExterno.getNomExt();
			apellidoPaterno = personalExterno.getApePaterExt();
			apellidoMaterno = personalExterno.getApeMaterExt();
			numeroDocumento = personalExterno.getNumDocExt();

			if (personalExterno.getTipoDocumento() != null) {
				tipoDocumento = personalExterno.getTipoDocumento().getDescTipDoc();
			}

			correoPersonal = personalExterno.getEmailExt();
			telefono = personalExterno.getMovilExt();
			genero = personalExterno.getGenExt();
			fechaNacimiento = personalExterno.getFechNaciExt();

			// 🏥 IPRESS del personal externo
			if (personalExterno.getIpress() != null) {
				idIpress = personalExterno.getIpress().getIdIpress();
				ipressNombre = personalExterno.getIpress().getDescIpress();
				ipressCodigo = personalExterno.getIpress().getCodIpress();

				// 🌐 Extraer Red de la IPRESS
				if (personalExterno.getIpress().getRed() != null) {
					var red = personalExterno.getIpress().getRed();
					idRed = red.getId();
					nombreRed = red.getDescripcion();
					codigoRed = red.getCodigo();

					// 🗺️ Extraer Macroregión de la Red
					if (red.getMacroregion() != null) {
						var macro = red.getMacroregion();
						idMacroregion = macro.getIdMacro();
						nombreMacroregion = macro.getDescMacro();
					}
				}
			}
		}

		// ============================================================
		// 🎓 MAPEO DE DATOS PROFESIONALES (dim_personal_prof)
		// ============================================================
		Long idProfesion = null;
		String nombreProfesion = null;
		String colegiatura = null;
		Long idEspecialidad = null;
		String nombreEspecialidad = null;
		String rne = null;

		if (personalCnt != null && personalCnt.getIdPers() != null) {
			log.debug("🔍 Buscando datos profesionales para personal ID: {}", personalCnt.getIdPers());

			// 🚀 OPTIMIZACIÓN: Usar la relación ya cargada (evita query N+1)
			// Las profesiones ya están cargadas mediante @EntityGraph en
			// findAllWithRelations()
			Set<com.styp.cenate.model.PersonalProf> profesiones = personalCnt.getProfesiones();

			if (profesiones != null && !profesiones.isEmpty()) {
				// Tomar el primer registro (profesión principal)
				com.styp.cenate.model.PersonalProf profPrincipal = profesiones.iterator().next();

				if (profPrincipal.getProfesion() != null) {
					idProfesion = profPrincipal.getProfesion().getIdProf();
					nombreProfesion = profPrincipal.getProfesion().getDescProf();
				}

				// La colegiatura está en PersonalCnt, no en PersonalProf
				colegiatura = personalCnt.getColegPers();
				rne = profPrincipal.getRneProf();

				// Buscar especialidad asociada al personal desde dim_personal_prof ->
				// dim_servicio_essi
				if (profPrincipal.getServicioEssi() != null) {
					com.styp.cenate.model.DimServicioEssi servicioEssi = profPrincipal.getServicioEssi();
					idEspecialidad = servicioEssi.getIdServicio();
					nombreEspecialidad = servicioEssi.getDescServicio();
					log.debug("✅ Especialidad encontrada: {} (ID: {})", nombreEspecialidad, idEspecialidad);
				} else {
					log.debug("ℹ️ No hay especialidad registrada para {}", usuario.getNameUser());
				}

				log.debug("✅ Datos profesionales cargados para {}: Profesión={}, Especialidad={}, RNE={}",
						usuario.getNameUser(), nombreProfesion, nombreEspecialidad, rne);
			} else {
				log.debug("ℹ️ No hay datos profesionales registrados para {}", usuario.getNameUser());
				// Si no hay datos profesionales, intentar obtener la colegiatura de PersonalCnt
				// directamente
				colegiatura = personalCnt.getColegPers();
			}
		}

		// ============================================================
		// 💼 MAPEO DE DATOS LABORALES ADICIONALES
		// ============================================================
		Long idRegimenLaboral = personalCnt != null && personalCnt.getRegimenLaboral() != null
				? personalCnt.getRegimenLaboral().getIdRegLab()
				: null;
		String nombreRegimen = regimenLaboral;

		Long idArea = personalCnt != null && personalCnt.getArea() != null ? personalCnt.getArea().getIdArea() : null;
		String nombreArea = areaTrabajo;

		String codigoPlanilla = personalCnt != null ? personalCnt.getCodPlanRem() : null;
		String periodoIngreso = personalCnt != null ? personalCnt.getPerPers() : null;

		// ============================================================
		// 👔 MAPEO DE TIPO DE PROFESIONAL (dim_tipo_personal)
		// ============================================================
		Long idTipoProfesional = null;
		String nombreTipoProfesional = null;

		if (personalCnt != null && personalCnt.getIdPers() != null) {
			log.debug("🔍 Buscando tipo de profesional para personal ID: {}", personalCnt.getIdPers());

			// 🚀 OPTIMIZACIÓN: Usar la relación ya cargada (evita query N+1)
			// Los tipos profesionales ya están cargados mediante @EntityGraph en
			// findAllWithRelations()
			Set<com.styp.cenate.model.PersonalTipo> tiposProfesionales = personalCnt.getTipos();

			if (tiposProfesionales != null && !tiposProfesionales.isEmpty()) {
				// Tomar el primer tipo de profesional
				com.styp.cenate.model.PersonalTipo tipoProfPrincipal = tiposProfesionales.iterator().next();

				if (tipoProfPrincipal.getTipoPersonal() != null) {
					idTipoProfesional = tipoProfPrincipal.getTipoPersonal().getIdTipPers();
					nombreTipoProfesional = tipoProfPrincipal.getTipoPersonal().getDescTipPers();

					log.debug("✅ Tipo profesional cargado para {}: {}", usuario.getNameUser(), nombreTipoProfesional);
				}
			} else {
				log.debug("ℹ️ No hay tipo de profesional registrado para {}", usuario.getNameUser());
			}
		}

		// ============================================================
		// 🏗️ CONSTRUCCIÓN DEL RESPONSE
		// ============================================================
		String estadoDB = usuario.getStatUser();
		boolean esActivo = estadoDB != null && ("A".equalsIgnoreCase(estadoDB) || "ACTIVO".equalsIgnoreCase(estadoDB));

		log.debug("⚡ Estado del usuario {}: statUser='{}', activo={}, tipoPersonal={}", usuario.getNameUser(), estadoDB,
				esActivo, tipoPersonal);

		return UsuarioResponse.builder().idUser(usuario.getIdUser()).username(usuario.getNameUser()).estado(estadoDB)
				.activo(esActivo).estadoUsuario(esActivo ? "ACTIVO" : "INACTIVO").locked(usuario.isAccountLocked())
				.requiereCambioPassword(
						usuario.getRequiereCambioPassword() != null ? usuario.getRequiereCambioPassword() : false)
				.failedAttempts(usuario.getFailedAttempts()).lockedUntil(usuario.getLockedUntil())
				.lastLoginAt(usuario.getLastLoginAt()).createAt(usuario.getCreateAt()).updateAt(usuario.getUpdateAt())
				.roles(roles).permisos(permisos)
				// Datos personales
				.idPersonal(personalCnt != null ? personalCnt.getIdPers() : null).nombreCompleto(nombreCompleto)
				.nombres(nombres).apellidoPaterno(apellidoPaterno).apellidoMaterno(apellidoMaterno)
				.numeroDocumento(numeroDocumento).tipoDocumento(tipoDocumento).correoPersonal(correoPersonal)
				.correoCorporativo(correoCorporativo).correoInstitucional(correoCorporativo).telefono(telefono)
				.direccion(direccion).genero(genero).fechaNacimiento(fechaNacimiento).fotoUrl(fotoUrl)
				// ✨ DATOS PROFESIONALES (NUEVOS)
				.idProfesion(idProfesion).nombreProfesion(nombreProfesion).profesionPrincipal(nombreProfesion)
				.colegiatura(colegiatura).idEspecialidad(idEspecialidad).nombreEspecialidad(nombreEspecialidad).rne(rne)
				// ✨ DATOS LABORALES ADICIONALES (NUEVOS)
				.idRegimenLaboral(idRegimenLaboral).regimenLaboral(regimenLaboral).nombreRegimen(nombreRegimen)
				.idArea(idArea).areaTrabajo(areaTrabajo).nombreArea(nombreArea).codigoPlanilla(codigoPlanilla)
				.periodoIngreso(periodoIngreso)
				// ✨ TIPO DE PROFESIONAL (NUEVO)
				.idTipoProfesional(idTipoProfesional).nombreTipoProfesional(nombreTipoProfesional)
				.descTipPers(nombreTipoProfesional).tipoProfesionalDesc(nombreTipoProfesional)
				.id_tip_pers(idTipoProfesional) // 🔥 Campo adicional para compatibilidad con frontend
				// IPRESS
				.idIpress(idIpress).nombreIpress(ipressNombre).codigoIpress(ipressCodigo)
				// 🌐 Red y Macroregión
				.idRed(idRed).nombreRed(nombreRed).codigoRed(codigoRed)
				.idMacroregion(idMacroregion).nombreMacroregion(nombreMacroregion)
				// 🎯 TIPO DE PERSONAL
				.tipoPersonal(tipoPersonal).tipoPersonalDetalle(tipoPersonal)
				.message("Usuario " + (esActivo ? "activo" : "inactivo")).build();
	}

	// =============================================================
	// 🛠️ MÉTODO AUXILIAR: Construir nombre completo
	// =============================================================
	private String construirNombreCompleto(String nombres, String apePaterno, String apeMaterno) {
		StringBuilder sb = new StringBuilder();
		if (nombres != null && !nombres.isBlank())
			sb.append(nombres).append(" ");
		if (apePaterno != null && !apePaterno.isBlank())
			sb.append(apePaterno).append(" ");
		if (apeMaterno != null && !apeMaterno.isBlank())
			sb.append(apeMaterno);
		String resultado = sb.toString().trim();
		return resultado.isEmpty() ? null : resultado;
	}

	// =============================================================
	// 🧩 MÉTODO INTERNO
	// =============================================================
	@Override
	@Transactional(readOnly = true)
	public Usuario findByUsername(String username) {
		return usuarioRepository.findByNameUserWithRoles(username)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
	}

	// =============================================================
	// 🧩 DETALLE USUARIO
	// =============================================================
	@Override
	@Transactional(readOnly = true)
	public List<Map<String, Object>> obtenerDetalleUsuario(String username) {
		UsuarioResponse detalle = obtenerDetalleUsuarioExtendido(username);
		Map<String, Object> resultado = new HashMap<>();
		resultado.put("username", username);
		resultado.put("detalle", detalle);
		return List.of(resultado);
	}
}