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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MenuUsuarioServiceImpl implements MenuUsuarioService {

	private final MenuUsuarioRepository repositorioMenu;
	private final PermisoModularRepository permisoModularRepository;
	private final ModuloSistemaRepository moduloSistemaRepository;
	private final PaginaRepository paginaRepository;
	private final UsuarioRepository usuarioRepository;
	private final ObjectMapper mapper;

	public MenuUsuarioServiceImpl(
			MenuUsuarioRepository repositorioMenu,
			PermisoModularRepository permisoModularRepository,
			ModuloSistemaRepository moduloSistemaRepository,
			PaginaRepository paginaRepository,
			UsuarioRepository usuarioRepository,
			ObjectMapper mapper) {
		this.repositorioMenu = repositorioMenu;
		this.permisoModularRepository = permisoModularRepository;
		this.moduloSistemaRepository = moduloSistemaRepository;
		this.paginaRepository = paginaRepository;
		this.usuarioRepository = usuarioRepository;
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
			log.info("👑 Usuario {} es ADMIN/SUPERADMIN, retornando todos los módulos", idUser);
			return obtenerMenuCompletoParaAdmin();
		}

		// 1. Obtener permisos activos del usuario directamente de la tabla permisos_modulares
		List<PermisoModular> permisos = permisoModularRepository.findByIdUserAndActivoTrue(idUser);

		if (permisos.isEmpty()) {
			log.warn("⚠️ Usuario {} no tiene permisos modulares asignados", idUser);
			return new ArrayList<>();
		}

		log.info("✅ Encontrados {} permisos para el usuario {}", permisos.size(), idUser);

		// 2. Cargar información completa de los módulos para obtener icono, descripción, etc.
		Map<Integer, com.styp.cenate.model.ModuloSistema> modulosMap = moduloSistemaRepository.findAll()
				.stream()
				.collect(Collectors.toMap(
						com.styp.cenate.model.ModuloSistema::getIdModulo,
						m -> m
				));

		// 3. Cargar información de las páginas
		Map<Integer, PaginaModulo> paginasMap = paginaRepository.findAll()
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

			// Construir lista de páginas
			List<PaginaMenuDTO> paginas = permisosModulo.stream()
					.map(p -> {
						PaginaModulo pagina = paginasMap.get(p.getIdPagina());
						return new PaginaMenuDTO(
								pagina != null ? pagina.getRutaPagina() : null,
								pagina != null ? pagina.getOrden() : null,
								pagina != null ? pagina.getNombrePagina() : "Página " + p.getIdPagina(),
								p.getIdPagina(),
								Boolean.TRUE.equals(p.getPuedeVer()),
								Boolean.TRUE.equals(p.getPuedeCrear()),
								Boolean.TRUE.equals(p.getPuedeEditar()),
								Boolean.TRUE.equals(p.getPuedeEliminar()),
								Boolean.TRUE.equals(p.getPuedeExportar())
						);
					})
					.filter(p -> p.ruta() != null) // Solo incluir páginas válidas
					.sorted(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)))
					.collect(Collectors.toList());

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

			// Construir lista de páginas con todos los permisos
			List<PaginaMenuDTO> paginas = modulo.getPaginas().stream()
					.filter(p -> Boolean.TRUE.equals(p.getActivo()))
					.map(p -> new PaginaMenuDTO(
							p.getRutaPagina(),
							p.getOrden(),
							p.getNombrePagina(),
							p.getIdPagina(),
							true,  // puede ver
							true,  // puede crear
							true,  // puede editar
							true,  // puede eliminar
							true   // puede exportar
					))
					.sorted(Comparator.comparing(PaginaMenuDTO::orden, Comparator.nullsLast(Integer::compareTo)))
					.collect(Collectors.toList());

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

}
