package com.styp.cenate.service.segu;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.segu.MenuUsuarioDTO;
import com.styp.cenate.dto.segu.MenuUsuarioProjection;
import com.styp.cenate.dto.segu.PaginaMenuDTO;
import com.styp.cenate.model.ModuloSistema;
import com.styp.cenate.model.PaginaModulo;
import com.styp.cenate.model.PermisoModular;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.mbac.ModuloSistemaRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.styp.cenate.repository.segu.MenuUsuarioRepository;
import com.styp.cenate.repository.segu.PaginaRepository;
import com.styp.cenate.repository.segu.PermisoRolPaginaRepository;
import com.styp.cenate.model.segu.SeguPermisosRolPagina;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MenuUsuarioServiceImpl implements MenuUsuarioService {

	private final MenuUsuarioRepository repositorioMenu;
	private final PermisoModularRepository permisoModularRepository;
	private final ModuloSistemaRepository moduloSistemaRepository;
	private final PaginaRepository paginaRepository;
	private final UsuarioRepository usuarioRepository;
	private final PermisoRolPaginaRepository permisoRolPaginaRepository;
	private final ObjectMapper mapper;

	public MenuUsuarioServiceImpl(
			MenuUsuarioRepository repositorioMenu,
			PermisoModularRepository permisoModularRepository,
			ModuloSistemaRepository moduloSistemaRepository,
			PaginaRepository paginaRepository,
			UsuarioRepository usuarioRepository,
			PermisoRolPaginaRepository permisoRolPaginaRepository,
			ObjectMapper mapper) {
		this.repositorioMenu = repositorioMenu;
		this.permisoModularRepository = permisoModularRepository;
		this.moduloSistemaRepository = moduloSistemaRepository;
		this.paginaRepository = paginaRepository;
		this.usuarioRepository = usuarioRepository;
		this.permisoRolPaginaRepository = permisoRolPaginaRepository;
		this.mapper = mapper;
	}

	@Override
	public List<MenuUsuarioDTO> obtenerMenuUsuario(Long idUser) {

		List<MenuUsuarioProjection> filas = repositorioMenu.obtenerMenuPorUsuario(idUser);
		List<MenuUsuarioDTO> resultado = new ArrayList<>();
		for (MenuUsuarioProjection fila : filas) {

			List<PaginaMenuDTO> paginas = parsePaginas(fila.getPaginas());

			MenuUsuarioDTO dto = new MenuUsuarioDTO(fila.getIdModulo(), fila.getNombreModulo(), fila.getDescripcion(),
					fila.getIcono(), fila.getRutaBase(), fila.getOrden(), paginas);
			resultado.add(dto);
		}
		return resultado;
	}

	@Override
	public List<PaginaMenuDTO> parsePaginas(String json) {

		List<PaginaMenuDTO> paginas = new ArrayList<>();
		if (json == null || json.isBlank())
			return paginas;

		try {
			JsonNode jsonNodo = mapper.readTree(json);

			for (JsonNode nodo : jsonNodo) {
				PaginaMenuDTO pagina = new PaginaMenuDTO(

						nodo.path("ruta").asText(null),
						nodo.path("orden").isMissingNode() ? null : nodo.path("orden").asInt(),
						nodo.path("nombre").asText(null),
						nodo.path("id_pagina").isMissingNode() ? null : nodo.path("id_pagina").asInt(),
						nodo.path("puede_ver").asBoolean(false), 
						nodo.path("puede_crear").asBoolean(false),
						nodo.path("puede_editar").asBoolean(false), 
						nodo.path("puede_eliminar").asBoolean(false),
						nodo.path("puede_exportar").asBoolean(false)

				);
				paginas.add(pagina);
			}

		} catch (Exception e) {
			log.error("parsePaginas()- Error : Error parseando el Json");
		}
		return paginas;
	}

	@Override
	public List<MenuUsuarioDTO> obtenerMenuDesdePermisosModulares(Long idUser) {
		log.info("📋 Obteniendo menú desde permisos modulares para usuario ID: {}", idUser);

		// 0. Verificar si el usuario es SUPERADMIN o ADMIN
		boolean esAdmin = verificarSiEsAdmin(idUser);
		if (esAdmin) {
			log.info("👑 Usuario {} es ADMIN/SUPERADMIN, usando permisos de rol desde BD", idUser);
			return obtenerMenuParaAdminDesdePermisos(idUser);
		}

		// 1. Obtener permisos activos del usuario directamente de la tabla permisos_modulares (nueva)
		List<PermisoModular> permisos = permisoModularRepository.findByIdUserAndActivoTrue(idUser);

		// 2. Si no hay permisos modulares, hacer fallback a permisos de rol (tabla antigua)
		if (permisos.isEmpty()) {
			log.warn("⚠️ Usuario {} no tiene permisos modulares asignados, intentando fallback a permisos de rol", idUser);
			return obtenerMenuDesdePermisosRol(idUser);
		}

		log.info("✅ Encontrados {} permisos modulares para el usuario {}", permisos.size(), idUser);

		// 2. Cargar información completa de los módulos para obtener icono, descripción, etc.
		Map<Integer, com.styp.cenate.model.ModuloSistema> modulosMap = moduloSistemaRepository.findAll()
				.stream()
				.collect(Collectors.toMap(
						com.styp.cenate.model.ModuloSistema::getIdModulo,
						m -> m
				));

		// 3. Cargar información de las páginas con subpáginas cargadas (EAGER)
		Map<Integer, PaginaModulo> paginasMap = paginaRepository.findAllWithSubpaginas()
				.stream()
				.collect(Collectors.toMap(
						PaginaModulo::getIdPagina,
						p -> p
				));

		// 4. Agrupar permisos por módulo (solo los que tienen permiso de ver)
		Map<Integer, List<PermisoModular>> permisosPorModulo = permisos.stream()
				.filter(p -> Boolean.TRUE.equals(p.getPuedeVer())) // Solo páginas que puede ver
				.collect(Collectors.groupingBy(
						PermisoModular::getIdModulo,
						LinkedHashMap::new,
						Collectors.toList()
				));

		// 5. Construir el menú
		List<MenuUsuarioDTO> menu = new ArrayList<>();

		for (Map.Entry<Integer, List<PermisoModular>> entry : permisosPorModulo.entrySet()) {
			Integer idModulo = entry.getKey();
			List<PermisoModular> permisosModulo = entry.getValue();

			// Obtener información del módulo
			com.styp.cenate.model.ModuloSistema modulo = modulosMap.get(idModulo);
			if (modulo == null) {
				log.warn("⚠️ Módulo {} no encontrado en la base de datos", idModulo);
				continue;
			}

			// Construir lista de páginas con soporte para subpáginas
			List<PaginaMenuDTO> paginas = construirPaginasConSubmenus(permisosModulo, paginasMap, modulo.getNombreModulo());

			if (paginas.isEmpty()) {
				log.debug("⚠️ Módulo {} no tiene páginas válidas con permiso de ver", modulo.getNombreModulo());
				continue;
			}

			// Crear DTO del módulo
			MenuUsuarioDTO menuModulo = new MenuUsuarioDTO(
					modulo.getIdModulo(),
					modulo.getNombreModulo(),
					modulo.getDescripcion(),
					modulo.getIcono(),
					modulo.getRutaBase(),
					modulo.getOrden(),
					paginas
			);

			menu.add(menuModulo);
		}

		// Ordenar módulos por orden
		menu.sort(Comparator.comparing(MenuUsuarioDTO::orden, Comparator.nullsLast(Integer::compareTo)));

		log.info("✅ Menú generado con {} módulos para el usuario {}", menu.size(), idUser);
		return menu;
	}

	/**
	 * Verifica si el usuario tiene rol SUPERADMIN o ADMIN
	 */
	private boolean verificarSiEsAdmin(Long idUser) {
		try {
			// Usar el método que carga los roles con FETCH JOIN
			return usuarioRepository.findByIdWithRoles(idUser)
					.map(usuario -> {
						if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
							log.debug("Usuario {} no tiene roles asignados", idUser);
							return false;
						}
						log.debug("Usuario {} tiene {} roles", idUser, usuario.getRoles().size());
						return usuario.getRoles().stream()
								.anyMatch(rol -> {
									String nombreRol = rol.getDescRol();
									if (nombreRol == null) return false;
									String rolUpper = nombreRol.toUpperCase();
									log.debug("Verificando rol: {}", rolUpper);
									return rolUpper.contains("SUPERADMIN") || rolUpper.equals("ADMIN");
								});
					})
					.orElse(false);
		} catch (Exception e) {
			log.error("Error verificando si usuario {} es admin: {}", idUser, e.getMessage());
			return false;
		}
	}

	/**
	 * Genera el menú completo con todos los módulos y páginas para administradores
	 */
	private List<MenuUsuarioDTO> obtenerMenuCompletoParaAdmin() {
		List<MenuUsuarioDTO> menu = new ArrayList<>();

		// Cargar todos los módulos activos con sus páginas
		List<ModuloSistema> modulos = moduloSistemaRepository.findAllWithPaginasActivas();

		for (ModuloSistema modulo : modulos) {
			if (!Boolean.TRUE.equals(modulo.getActivo())) continue;

			// Construir lista de páginas con soporte para subpáginas
			List<PaginaMenuDTO> paginas = construirPaginasConSubmenusAdmin(
				modulo.getPaginas() != null ? new ArrayList<>(modulo.getPaginas()) : new ArrayList<>()
			);

			if (paginas.isEmpty()) continue;

			MenuUsuarioDTO menuModulo = new MenuUsuarioDTO(
					modulo.getIdModulo(),
					modulo.getNombreModulo(),
					modulo.getDescripcion(),
					modulo.getIcono(),
					modulo.getRutaBase(),
					modulo.getOrden(),
					paginas
			);

			menu.add(menuModulo);
		}

		// Ordenar por orden
		menu.sort(Comparator.comparing(MenuUsuarioDTO::orden, Comparator.nullsLast(Integer::compareTo)));

		log.info("👑 Menú completo para admin generado con {} módulos", menu.size());
		return menu;
	}

	/**
	 * Genera el menú para ADMIN/SUPERADMIN basado en los permisos de rol en segu_permisos_rol_pagina
	 * En lugar de dar acceso total, usa los permisos reales asignados al rol
	 */
	private List<MenuUsuarioDTO> obtenerMenuParaAdminDesdePermisos(Long idUser) {
		List<MenuUsuarioDTO> menu = new ArrayList<>();

		// 1. Obtener los roles del usuario
		Usuario usuario = usuarioRepository.findByIdWithRoles(idUser).orElse(null);
		if (usuario == null || usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
			log.warn("⚠️ Usuario {} no encontrado o sin roles", idUser);
			return menu;
		}

		// 2. Obtener IDs de los roles del usuario
		List<Integer> roleIds = usuario.getRoles().stream()
				.map(rol -> rol.getIdRol())
				.collect(Collectors.toList());
		log.info("📋 Roles del usuario {}: {}", idUser, roleIds);

		// 3. Obtener permisos de rol desde segu_permisos_rol_pagina
		List<SeguPermisosRolPagina> permisosRol = permisoRolPaginaRepository.findByIdRolInAndActivoTrue(roleIds);
		if (permisosRol.isEmpty()) {
			log.warn("⚠️ No hay permisos de rol configurados para los roles: {}", roleIds);
			return menu;
		}

		// 4. Filtrar solo los que tienen puedeVer = true
		permisosRol = permisosRol.stream()
				.filter(p -> Boolean.TRUE.equals(p.getPuedeVer()))
				.collect(Collectors.toList());

		// 5. Cargar módulos y páginas
		Map<Integer, ModuloSistema> modulosMap = moduloSistemaRepository.findAll()
				.stream()
				.filter(m -> Boolean.TRUE.equals(m.getActivo()))
				.collect(Collectors.toMap(ModuloSistema::getIdModulo, m -> m));

		Map<Integer, PaginaModulo> paginasMap = paginaRepository.findAllWithSubpaginas()
				.stream()
				.filter(p -> Boolean.TRUE.equals(p.getActivo()))
				.collect(Collectors.toMap(PaginaModulo::getIdPagina, p -> p));

		// 6. Agrupar permisos por página (tomar el mejor permiso si hay múltiples roles)
		Map<Integer, SeguPermisosRolPagina> mejoresPermisos = new LinkedHashMap<>();
		for (SeguPermisosRolPagina p : permisosRol) {
			mejoresPermisos.merge(p.getIdPagina(), p, (existing, nuevo) -> {
				// Combinar permisos: si alguno tiene el permiso, se mantiene
				existing.setPuedeCrear(existing.getPuedeCrear() || nuevo.getPuedeCrear());
				existing.setPuedeEditar(existing.getPuedeEditar() || nuevo.getPuedeEditar());
				existing.setPuedeEliminar(existing.getPuedeEliminar() || nuevo.getPuedeEliminar());
				existing.setPuedeExportar(existing.getPuedeExportar() || nuevo.getPuedeExportar());
				return existing;
			});
		}

		// 7. Agrupar páginas por módulo
		Map<Integer, List<PaginaMenuDTO>> paginasPorModulo = new LinkedHashMap<>();
		for (Map.Entry<Integer, SeguPermisosRolPagina> entry : mejoresPermisos.entrySet()) {
			PaginaModulo pagina = paginasMap.get(entry.getKey());
			if (pagina == null) continue;

			// Solo procesar páginas padre (sin padre)
			if (pagina.getPaginaPadre() != null) continue;

			SeguPermisosRolPagina permiso = entry.getValue();

			// Construir subpáginas si existen
			List<PaginaMenuDTO> subpaginas = new ArrayList<>();
			if (pagina.getSubpaginas() != null && !pagina.getSubpaginas().isEmpty()) {
				subpaginas = pagina.getSubpaginas().stream()
						.filter(sub -> Boolean.TRUE.equals(sub.getActivo()))
						.sorted(Comparator.comparing(PaginaModulo::getOrden, Comparator.nullsLast(Integer::compareTo)))
						.map(sub -> new PaginaMenuDTO(
								sub.getRutaPagina(),
								sub.getOrden(),
								sub.getNombrePagina(),
								sub.getIdPagina(),
								true,
								true,
								true,
								true,
								true,
								null
						))
						.collect(Collectors.toList());
			}

			PaginaMenuDTO paginaDTO = new PaginaMenuDTO(
					pagina.getRutaPagina(),
					pagina.getOrden(),
					pagina.getNombrePagina(),
					pagina.getIdPagina(),
					true, // puedeVer ya está filtrado
					Boolean.TRUE.equals(permiso.getPuedeCrear()),
					Boolean.TRUE.equals(permiso.getPuedeEditar()),
					Boolean.TRUE.equals(permiso.getPuedeEliminar()),
					Boolean.TRUE.equals(permiso.getPuedeExportar()),
					subpaginas.isEmpty() ? null : subpaginas
			);

			Integer idModulo = pagina.getModulo() != null ? pagina.getModulo().getIdModulo() : null;
			if (idModulo == null) continue;
			paginasPorModulo.computeIfAbsent(idModulo, k -> new ArrayList<>()).add(paginaDTO);
		}

		// 8. Construir menú
		for (Map.Entry<Integer, List<PaginaMenuDTO>> entry : paginasPorModulo.entrySet()) {
			ModuloSistema modulo = modulosMap.get(entry.getKey());
			if (modulo == null) continue;

			List<PaginaMenuDTO> paginas = entry.getValue();
			paginas.sort(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)));

			MenuUsuarioDTO menuModulo = new MenuUsuarioDTO(
					modulo.getIdModulo(),
					modulo.getNombreModulo(),
					modulo.getDescripcion(),
					modulo.getIcono(),
					modulo.getRutaBase(),
					modulo.getOrden(),
					paginas
			);
			menu.add(menuModulo);
		}

		menu.sort(Comparator.comparing(MenuUsuarioDTO::orden, Comparator.nullsLast(Integer::compareTo)));
		log.info("👑 Menú para admin basado en permisos generado con {} módulos", menu.size());
		return menu;
	}

	/**
	 * Obtiene el menú para usuarios NO-ADMIN desde sus permisos de rol (fallback)
	 * Se usa cuando la tabla permisos_modulares está vacía pero el usuario tiene rol con permisos
	 */
	private List<MenuUsuarioDTO> obtenerMenuDesdePermisosRol(Long idUser) {
		log.info("🔄 Fallback: Obteniendo menú desde permisos de rol para usuario ID: {}", idUser);

		// 1. Obtener los roles del usuario
		Usuario usuario = usuarioRepository.findByIdWithRoles(idUser).orElse(null);
		if (usuario == null || usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
			log.warn("⚠️ Usuario {} no encontrado o sin roles asignados", idUser);
			return new ArrayList<>();
		}

		// 2. Obtener IDs de los roles del usuario
		List<Integer> roleIds = usuario.getRoles().stream()
				.map(rol -> rol.getIdRol())
				.collect(Collectors.toList());
		log.info("📋 Roles del usuario {}: {}", idUser, roleIds);

		// 3. Obtener permisos de rol desde segu_permisos_rol_pagina
		List<SeguPermisosRolPagina> permisosRol = permisoRolPaginaRepository.findByIdRolInAndActivoTrue(roleIds);
		if (permisosRol.isEmpty()) {
			log.warn("⚠️ Usuario {} no tiene permisos de rol configurados", idUser);
			return new ArrayList<>();
		}

		// 4. Filtrar solo los que tienen puedeVer = true
		permisosRol = permisosRol.stream()
				.filter(p -> Boolean.TRUE.equals(p.getPuedeVer()))
				.collect(Collectors.toList());

		if (permisosRol.isEmpty()) {
			log.warn("⚠️ Usuario {} no tiene permisos de rol con acceso de vista", idUser);
			return new ArrayList<>();
		}

		// 5. Cargar módulos y páginas
		Map<Integer, ModuloSistema> modulosMap = moduloSistemaRepository.findAll()
				.stream()
				.filter(m -> Boolean.TRUE.equals(m.getActivo()))
				.collect(Collectors.toMap(ModuloSistema::getIdModulo, m -> m));

		Map<Integer, PaginaModulo> paginasMap = paginaRepository.findAllWithSubpaginas()
				.stream()
				.filter(p -> Boolean.TRUE.equals(p.getActivo()))
				.collect(Collectors.toMap(PaginaModulo::getIdPagina, p -> p));

		// 6. Agrupar permisos por página (tomar el mejor permiso si hay múltiples roles)
		Map<Integer, SeguPermisosRolPagina> mejoresPermisos = new LinkedHashMap<>();
		for (SeguPermisosRolPagina p : permisosRol) {
			mejoresPermisos.merge(p.getIdPagina(), p, (existing, nuevo) -> {
				// Combinar permisos: si alguno tiene el permiso, se mantiene
				existing.setPuedeCrear(existing.getPuedeCrear() || nuevo.getPuedeCrear());
				existing.setPuedeEditar(existing.getPuedeEditar() || nuevo.getPuedeEditar());
				existing.setPuedeEliminar(existing.getPuedeEliminar() || nuevo.getPuedeEliminar());
				existing.setPuedeExportar(existing.getPuedeExportar() || nuevo.getPuedeExportar());
				return existing;
			});
		}

		// 7. Agrupar páginas por módulo
		Map<Integer, List<PaginaMenuDTO>> paginasPorModulo = new LinkedHashMap<>();
		for (Map.Entry<Integer, SeguPermisosRolPagina> entry : mejoresPermisos.entrySet()) {
			PaginaModulo pagina = paginasMap.get(entry.getKey());
			if (pagina == null) continue;

			// Solo procesar páginas padre (sin padre)
			if (pagina.getPaginaPadre() != null) continue;

			SeguPermisosRolPagina permiso = entry.getValue();

			// Construir subpáginas si existen
			List<PaginaMenuDTO> subpaginas = new ArrayList<>();
			if (pagina.getSubpaginas() != null && !pagina.getSubpaginas().isEmpty()) {
				subpaginas = pagina.getSubpaginas().stream()
						.filter(sub -> Boolean.TRUE.equals(sub.getActivo()))
						.sorted(Comparator.comparing(PaginaModulo::getOrden, Comparator.nullsLast(Integer::compareTo)))
						.map(sub -> new PaginaMenuDTO(
								sub.getRutaPagina(),
								sub.getOrden(),
								sub.getNombrePagina(),
								sub.getIdPagina(),
								true,
								true,
								true,
								true,
								true,
								null,
								sub.getIcono()
						))
						.collect(Collectors.toList());
			}

			PaginaMenuDTO paginaDTO = new PaginaMenuDTO(
					pagina.getRutaPagina(),
					pagina.getOrden(),
					pagina.getNombrePagina(),
					pagina.getIdPagina(),
					true, // puedeVer ya está filtrado
					Boolean.TRUE.equals(permiso.getPuedeCrear()),
					Boolean.TRUE.equals(permiso.getPuedeEditar()),
					Boolean.TRUE.equals(permiso.getPuedeEliminar()),
					Boolean.TRUE.equals(permiso.getPuedeExportar()),
					subpaginas.isEmpty() ? null : subpaginas,
					pagina.getIcono()
			);

			Integer idModulo = pagina.getModulo() != null ? pagina.getModulo().getIdModulo() : null;
			if (idModulo == null) continue;
			paginasPorModulo.computeIfAbsent(idModulo, k -> new ArrayList<>()).add(paginaDTO);
		}

		// 8. Construir menú
		List<MenuUsuarioDTO> menu = new ArrayList<>();
		for (Map.Entry<Integer, List<PaginaMenuDTO>> entry : paginasPorModulo.entrySet()) {
			ModuloSistema modulo = modulosMap.get(entry.getKey());
			if (modulo == null) continue;

			List<PaginaMenuDTO> paginas = entry.getValue();
			paginas.sort(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)));

			MenuUsuarioDTO menuModulo = new MenuUsuarioDTO(
					modulo.getIdModulo(),
					modulo.getNombreModulo(),
					modulo.getDescripcion(),
					modulo.getIcono(),
					modulo.getRutaBase(),
					modulo.getOrden(),
					paginas
			);
			menu.add(menuModulo);
		}

		menu.sort(Comparator.comparing(MenuUsuarioDTO::orden, Comparator.nullsLast(Integer::compareTo)));
		log.info("✅ Menú desde permisos de rol generado con {} módulos para usuario {}", menu.size(), idUser);
		return menu;
	}

	/**
	 * Construye la lista de páginas con subpáginas para menú de admin (con todos los permisos)
	 */
	private List<PaginaMenuDTO> construirPaginasConSubmenusAdmin(List<PaginaModulo> paginasModulo) {
		List<PaginaMenuDTO> paginasMenu = new ArrayList<>();

		if (paginasModulo == null || paginasModulo.isEmpty()) {
			return paginasMenu;
		}

		// Procesar solo páginas padre (sin página padre)
		for (PaginaModulo pagina : paginasModulo) {
			if (!Boolean.TRUE.equals(pagina.getActivo())) continue;
			if (pagina.getPaginaPadre() != null) continue; // Saltar si es una subpágina

			// Construir subpáginas si existen
			List<PaginaMenuDTO> subpaginas = new ArrayList<>();
			if (pagina.getSubpaginas() != null && !pagina.getSubpaginas().isEmpty()) {
				subpaginas = pagina.getSubpaginas().stream()
						.filter(sub -> Boolean.TRUE.equals(sub.getActivo()))
						.sorted(Comparator.comparing(PaginaModulo::getOrden, Comparator.nullsLast(Integer::compareTo)))
						.map(sub -> new PaginaMenuDTO(
								sub.getRutaPagina(),
								sub.getOrden(),
								sub.getNombrePagina(),
								sub.getIdPagina(),
								true,
								true,
								true,
								true,
								true,
								null,
								sub.getIcono()
						))
						.collect(Collectors.toList());
			}

			// Crear DTO de página padre
			PaginaMenuDTO paginaDTO = new PaginaMenuDTO(
					pagina.getRutaPagina(),
					pagina.getOrden(),
					pagina.getNombrePagina(),
					pagina.getIdPagina(),
					true,
					true,
					true,
					true,
					true,
					subpaginas.isEmpty() ? null : subpaginas,
					pagina.getIcono()
			);

			paginasMenu.add(paginaDTO);
		}

		// Ordenar por orden
		paginasMenu.sort(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)));

		return paginasMenu;
	}

	/**
	 * Filtra páginas específicas según el módulo
	 * Por ejemplo: retirar páginas del módulo "Gestión de Personal Externo"
	 */
	private Map<Integer, PaginaModulo> filtrarPaginasSegunModulo(
			Map<Integer, PaginaModulo> paginasMap,
			String nombreModulo) {

		// Filtrar páginas para "Gestión de Personal Externo"
		if (nombreModulo != null && nombreModulo.toLowerCase().contains("personal externo")) {
			log.info("🔍 Filtrando páginas para módulo: {}", nombreModulo);

			// Crear nueva lista sin las páginas que queremos remover
			Map<Integer, PaginaModulo> paginasFiltradas = new LinkedHashMap<>();

			for (Map.Entry<Integer, PaginaModulo> entry : paginasMap.entrySet()) {
				PaginaModulo pagina = entry.getValue();
				String nombrePagina = pagina.getNombrePagina() != null ? pagina.getNombrePagina().toLowerCase() : "";

				// Remover estas páginas específicas
				if (nombrePagina.contains("auditoría") ||
					nombrePagina.contains("auditoria") ||
					nombrePagina.contains("buscar asegurado") ||
					nombrePagina.contains("dashboard asegurado") ||
					nombrePagina.contains("dashboard asegurados")) {
					log.info("❌ Removiendo página: {}", pagina.getNombrePagina());
					continue; // Saltar esta página
				}

				paginasFiltradas.put(entry.getKey(), pagina);
			}

			return paginasFiltradas;
		}

		return paginasMap;
	}

	/**
	 * Construye la lista de páginas del menú con soporte para subpáginas (2 niveles)
	 * Agrupa las subpáginas bajo sus páginas padre
	 * Filtra páginas específicas según el módulo
	 */
	private List<PaginaMenuDTO> construirPaginasConSubmenus(
			List<PermisoModular> permisosModulo,
			Map<Integer, PaginaModulo> paginasMap,
			String nombreModulo) {

		// Separar páginas padres e hijas
		Map<Integer, PaginaModulo> paginasConPermisos = new LinkedHashMap<>();
		for (PermisoModular p : permisosModulo) {
			PaginaModulo pagina = paginasMap.get(p.getIdPagina());
			if (pagina != null && pagina.getRutaPagina() != null) {
				paginasConPermisos.put(p.getIdPagina(), pagina);
			}
		}

		// Filtrar páginas específicas para módulos específicos
		paginasConPermisos = filtrarPaginasSegunModulo(paginasConPermisos, nombreModulo);

		// Crear DTOs de páginas padre solamente (excluir las que son hijas)
		List<PaginaMenuDTO> paginasMenu = new ArrayList<>();

		for (Map.Entry<Integer, PaginaModulo> entry : paginasConPermisos.entrySet()) {
			PaginaModulo pagina = entry.getValue();

			// Solo procesar páginas que NO son subpáginas (id_pagina_padre es NULL)
			if (pagina.getPaginaPadre() == null) {
				// Encontrar subpáginas de esta página
				// Las subpáginas heredan permisos del padre, no necesitan permisos propios
				List<PaginaMenuDTO> subpaginas = new ArrayList<>();

				if (pagina.getSubpaginas() != null && !pagina.getSubpaginas().isEmpty()) {
					subpaginas = pagina.getSubpaginas().stream()
							.filter(sub -> Boolean.TRUE.equals(sub.getActivo())) // Solo páginas activas
							.sorted(Comparator.comparing(PaginaModulo::getOrden, Comparator.nullsLast(Integer::compareTo)))
							.map(sub -> new PaginaMenuDTO(
									sub.getRutaPagina(),
									sub.getOrden(),
									sub.getNombrePagina(),
									sub.getIdPagina(),
									true, // Heredar permiso del padre
									true,
									true,
									true,
									true,
									null, // Las subpáginas no tienen más subpáginas
									sub.getIcono()
							))
							.collect(Collectors.toList());
				}

				// Encontrar el permiso para esta página
				PermisoModular permisoPagina = permisosModulo.stream()
						.filter(p -> p.getIdPagina().equals(pagina.getIdPagina()))
						.findFirst()
						.orElse(null);

				PaginaMenuDTO paginaDTO = new PaginaMenuDTO(
						pagina.getRutaPagina(),
						pagina.getOrden(),
						pagina.getNombrePagina(),
						pagina.getIdPagina(),
						true, // Ya está filtrado por puedeVer
						permisoPagina != null ? Boolean.TRUE.equals(permisoPagina.getPuedeCrear()) : false,
						permisoPagina != null ? Boolean.TRUE.equals(permisoPagina.getPuedeEditar()) : false,
						permisoPagina != null ? Boolean.TRUE.equals(permisoPagina.getPuedeEliminar()) : false,
						permisoPagina != null ? Boolean.TRUE.equals(permisoPagina.getPuedeExportar()) : false,
						subpaginas.isEmpty() ? null : subpaginas,
						pagina.getIcono()
				);

				paginasMenu.add(paginaDTO);
			}
		}

		// Ordenar por orden
		paginasMenu.sort(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)));

		return paginasMenu;
	}

}
