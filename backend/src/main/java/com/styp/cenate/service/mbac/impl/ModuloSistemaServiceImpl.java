package com.styp.cenate.service.mbac.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.segu.ModuloSistemaDTO;
import com.styp.cenate.dto.segu.PaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloViewDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaViewDTO;
import com.styp.cenate.dto.segu.RolDTO;
import com.styp.cenate.mapper.segu.ModuloSistemaMapper;
import com.styp.cenate.model.ModuloSistema;
import com.styp.cenate.model.PaginaModulo;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.segu.SeguPermisosRolModulo;
import com.styp.cenate.model.segu.SeguPermisosRolPagina;
import com.styp.cenate.repository.mbac.ModuloSistemaRepository;
import com.styp.cenate.repository.mbac.PaginaModuloRepository;
import com.styp.cenate.repository.segu.PermisoRolModuloRepository;
import com.styp.cenate.repository.segu.PermisoRolPaginaRepository;
import com.styp.cenate.repository.segu.RolRepository;
import com.styp.cenate.service.mbac.ModuloSistemaService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 📦 Servicio de gestión de módulos del sistema (MBAC). Mapea entidades a DTOs
 * y evita problemas de LazyInitializationException.
 *
 * Responsable de devolver módulos activos y sus páginas asociadas.
 *
 * @author CENATE Development Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Data
public class ModuloSistemaServiceImpl implements ModuloSistemaService {

	private final ModuloSistemaRepository moduloRepo;
	private final PaginaModuloRepository paginaRepo;
	private final RolRepository rolRepo;
	private final PermisoRolModuloRepository permisoRolModuloRepository;
	private final PermisoRolPaginaRepository permisoRolPaginaRepository;

	@Override
	public List<ModuloSistemaDTO> listado() {
		return ModuloSistemaMapper.toDtoList(moduloRepo.findAll());
	}

	@Override
	public ModuloSistemaDTO guardar(ModuloSistemaDTO dto) {
		var entity = ModuloSistemaMapper.toEntity(dto);
		ModuloSistema entidad = moduloRepo.save(entity);
		return ModuloSistemaMapper.toDTO(entidad);
	}

	@Override
	public ModuloSistemaDTO actualizar(Integer id, ModuloSistemaDTO dto) {
		ModuloSistema entity = moduloRepo.findById(id).orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
		entity.setNombreModulo(dto.getNombreModulo());
		entity.setDescripcion(dto.getDescripcion());
		entity.setRutaBase(dto.getRutaBase());
		entity = moduloRepo.save(entity);
		return ModuloSistemaMapper.toDTO(entity);
	}

	@Override
	public ModuloSistemaDTO obtener(Integer id) {
		return moduloRepo.findById(id).map(ModuloSistemaMapper::toDTO)
				.orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
	}

	@Override
	public void eliminar(Integer id) {
		moduloRepo.deleteById(id);
	}

	// ========================================
	// ROLES
	// ========================================

	@Override
	public List<RolDTO> listarRoles() {
		return rolRepo.findAll().stream().map(this::convertirRolADTO).collect(Collectors.toList());
	}
	// ========================================
	// PÁGINAS
	// ========================================

	@Override
	public List<PaginaDTO> listarPaginas() {
		return paginaRepo.findAll().stream().map(this::convertirPaginaADTO).collect(Collectors.toList());
	}

	// ========================================
	// PERMISOS ROL-MÓDULO
	// ========================================
	@Override
	public List<PermisoRolModuloDTO> listarPermisosRolModulo() {
		return permisoRolModuloRepository.findAll().stream().map(this::convertirPermisoRMADTO)
				.collect(Collectors.toList());
	}

	@Override
	public PermisoRolModuloDTO crearPermisoRolModulo(PermisoRolModuloDTO dto) {
		// Verificar si ya existe
		permisoRolModuloRepository.findByIdRolAndIdModulo(dto.getIdRol(), dto.getIdModulo()).ifPresent(p -> {
			throw new RuntimeException("Ya existe un permiso para este rol y módulo");
		});

		SeguPermisosRolModulo entity = new SeguPermisosRolModulo();
		mapearDTOAPermisoRM(dto, entity);

		entity = permisoRolModuloRepository.save(entity);
		return convertirPermisoRMADTO(entity);
	}

	@Override
	public PermisoRolModuloDTO actualizarPermisoRolModulo(Integer id, PermisoRolModuloDTO dto) {
		SeguPermisosRolModulo entity = permisoRolModuloRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

		mapearDTOAPermisoRM(dto, entity);
		entity = permisoRolModuloRepository.save(entity);
		return convertirPermisoRMADTO(entity);
	}

	@Override
	public void eliminarPermisoRolModulo(Integer id) {
		permisoRolModuloRepository.deleteById(id);
	}

	// ========================================
	// PERMISOS ROL-PÁGINA
	// ========================================
	@Override
	public List<PermisoRolPaginaDTO> listarPermisosRolPagina() {
		return permisoRolPaginaRepository.findAll().stream().map(this::convertirPermisoRPADTO)
				.collect(Collectors.toList());
	}

	@Override
	public PermisoRolPaginaDTO crearPermisoRolPagina(PermisoRolPaginaDTO dto) {
		// Verificar si ya existe
		permisoRolPaginaRepository.findByIdRolAndIdPagina(dto.getIdRol(), dto.getIdPagina()).ifPresent(p -> {
			throw new RuntimeException("Ya existe un permiso para este rol y página");
		});

		SeguPermisosRolPagina entity = new SeguPermisosRolPagina();
		mapearDTOAPermisoRP(dto, entity);

		entity = permisoRolPaginaRepository.save(entity);
		return convertirPermisoRPADTO(entity);
	}

	@Override
	public PermisoRolPaginaDTO actualizarPermisoRolPagina(Integer id, PermisoRolPaginaDTO dto) {
		SeguPermisosRolPagina entity = permisoRolPaginaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

		mapearDTOAPermisoRP(dto, entity);
		entity = permisoRolPaginaRepository.save(entity);
		return convertirPermisoRPADTO(entity);
	}

	@Override
	public void eliminarPermisoRolPagina(Integer id) {
		permisoRolPaginaRepository.deleteById(id);

	}

	// ========================================
	// MÉTODOS AUXILIARES
	// ========================================
	private ModuloSistemaDTO convertirModuloADTO(ModuloSistema entity) {
		ModuloSistemaDTO dto = new ModuloSistemaDTO();
		dto.setIdModulo(entity.getIdModulo());
		dto.setNombreModulo(entity.getNombreModulo());
		dto.setDescripcion(entity.getDescripcion());
//        dto.setIcono(entity.getIcono());
		dto.setRutaBase(entity.getRutaBase());
		dto.setOrden(entity.getOrden());
		dto.setActivo(entity.getActivo());
		return dto;
	}

	private RolDTO convertirRolADTO(Rol entity) {
		RolDTO dto = new RolDTO();
		dto.setIdRol(entity.getIdRol());
		dto.setDescRol(entity.getDescRol());
//        dto.setDescripcion(entity.getDescripcion());
//        dto.setIdArea(entity.getIdArea());
		dto.setNivelJerarquia(entity.getNivelJerarquia());
//        dto.setActivo(entity.getActivo());
		return dto;
	}

	private PaginaDTO convertirPaginaADTO(PaginaModulo entity) {
		PaginaDTO dto = new PaginaDTO();
		dto.setIdPagina(entity.getIdPagina());
         dto.setIdModulo(entity.getModulo().getIdModulo()) ;
		dto.setNombrePagina(entity.getNombrePagina());
		dto.setRutaPagina(entity.getRutaPagina());
		dto.setDescripcion(entity.getDescripcion());
		dto.setOrden(entity.getOrden());
		dto.setActivo(entity.getActivo());
		return dto;
	}

	private PermisoRolModuloDTO convertirPermisoRMADTO(SeguPermisosRolModulo entity) {
		PermisoRolModuloDTO dto = new PermisoRolModuloDTO();
		dto.setIdPermiso(entity.getIdPermiso());
		dto.setIdRol(entity.getIdRol());
		dto.setIdModulo(entity.getIdModulo());
		dto.setPuedeAcceder(entity.getPuedeAcceder());
		dto.setPuedeVer(entity.getPuedeVer());
		dto.setPuedeCrear(entity.getPuedeCrear());
		dto.setPuedeEditar(entity.getPuedeEditar());
		dto.setPuedeEliminar(entity.getPuedeEliminar());
		dto.setPuedeExportar(entity.getPuedeExportar());
		dto.setPuedeImportar(entity.getPuedeImportar());
		dto.setPuedeAprobar(entity.getPuedeAprobar());
		dto.setActivo(entity.getActivo());
		dto.setAutorizadoPor(entity.getAutorizadoPor());
		return dto;
	}

	private PermisoRolPaginaDTO convertirPermisoRPADTO(SeguPermisosRolPagina entity) {
		PermisoRolPaginaDTO dto = new PermisoRolPaginaDTO();
		dto.setIdPermiso(entity.getIdPermiso());
		dto.setIdRol(entity.getIdRol());
		dto.setIdPagina(entity.getIdPagina());
		dto.setPuedeVer(entity.getPuedeVer());
		dto.setPuedeCrear(entity.getPuedeCrear());
		dto.setPuedeEditar(entity.getPuedeEditar());
		dto.setPuedeEliminar(entity.getPuedeEliminar());
		dto.setPuedeExportar(entity.getPuedeExportar());
		dto.setPuedeImportar(entity.getPuedeImportar());
		dto.setPuedeAprobar(entity.getPuedeAprobar());
		dto.setActivo(entity.getActivo());
		dto.setAutorizadoPor(entity.getAutorizadoPor());
		return dto;
	}

	private void mapearDTOAPermisoRM(PermisoRolModuloDTO dto, SeguPermisosRolModulo entity) {
		entity.setIdRol(dto.getIdRol());
		entity.setIdModulo(dto.getIdModulo());
		entity.setPuedeAcceder(dto.getPuedeAcceder());
		entity.setPuedeVer(dto.getPuedeVer());
		entity.setPuedeCrear(dto.getPuedeCrear());
		entity.setPuedeEditar(dto.getPuedeEditar());
		entity.setPuedeEliminar(dto.getPuedeEliminar());
		entity.setPuedeExportar(dto.getPuedeExportar());
		entity.setPuedeImportar(dto.getPuedeImportar());
		entity.setPuedeAprobar(dto.getPuedeAprobar());
		entity.setActivo(dto.getActivo());
		entity.setAutorizadoPor(dto.getAutorizadoPor());
	}

	private void mapearDTOAPermisoRP(PermisoRolPaginaDTO dto, SeguPermisosRolPagina entity) {
		entity.setIdRol(dto.getIdRol());
		entity.setIdPagina(dto.getIdPagina());
		entity.setPuedeVer(dto.getPuedeVer());
		entity.setPuedeCrear(dto.getPuedeCrear());
		entity.setPuedeEditar(dto.getPuedeEditar());
		entity.setPuedeEliminar(dto.getPuedeEliminar());
		entity.setPuedeExportar(dto.getPuedeExportar());
		entity.setPuedeImportar(dto.getPuedeImportar());
		entity.setPuedeAprobar(dto.getPuedeAprobar());
		entity.setActivo(dto.getActivo());
		entity.setAutorizadoPor(dto.getAutorizadoPor());
	}

	@Override
	@Transactional(readOnly = true)
	public List<PermisoRolModuloViewDTO> listarPermisosRolModuloConNombres() {
		log.info("📋 Listando permisos rol-módulo con nombres");

		List<SeguPermisosRolModulo> permisos = permisoRolModuloRepository.findAll();

		return permisos.stream().map(permiso -> {
			// Buscar el rol
			Rol rol = rolRepo.findById(permiso.getIdRol()).orElse(null);

			// Buscar el módulo
			ModuloSistema modulo = moduloRepo.findById(permiso.getIdModulo()).orElse(null);

			return PermisoRolModuloViewDTO.builder().idPermiso(permiso.getIdPermiso()).idRol(permiso.getIdRol())
					.nombreRol(rol != null ? rol.getDescRol() : "Rol no encontrado").idModulo(permiso.getIdModulo())
					.nombreModulo(modulo != null ? modulo.getNombreModulo() : "Módulo no encontrado")
					.puedeAcceder(permiso.getPuedeAcceder()).puedeVer(permiso.getPuedeVer())
					.puedeCrear(permiso.getPuedeCrear()).puedeEditar(permiso.getPuedeEditar())
					.puedeEliminar(permiso.getPuedeEliminar()).puedeExportar(permiso.getPuedeExportar())
					.puedeImportar(permiso.getPuedeImportar()).puedeAprobar(permiso.getPuedeAprobar())
					.activo(permiso.getActivo()).fechaCreacion(permiso.getCreatedAt())
					.fechaActualizacion(permiso.getUpdatedAt()).build();
		}).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<PermisoRolPaginaViewDTO> listarPermisosRolPaginaConNombres() {
		log.info("📋 Listando permisos rol-página con nombres");

		List<SeguPermisosRolPagina> permisos = permisoRolPaginaRepository.findAll();

		return permisos.stream().<PermisoRolPaginaViewDTO>map(permiso -> { // ⬅️ AGREGADO: .<PermisoRolPaginaViewDTO>
			// Buscar el rol
			Rol rol = rolRepo.findById(permiso.getIdRol()).orElse(null);

			// Buscar la página
			PaginaModulo pagina = paginaRepo.findById(permiso.getIdPagina()).orElse(null);

			// Buscar el módulo de la página
			ModuloSistema modulo = null;
			if (pagina != null && pagina.getModulo().getIdModulo() != null) {
				modulo = moduloRepo.findById(pagina.getModulo().getIdModulo()).orElse(null);
			}

			return PermisoRolPaginaViewDTO.builder().idPermiso(permiso.getIdPermiso()).idRol(permiso.getIdRol())
					.nombreRol(rol != null ? rol.getDescRol() : "Rol no encontrado").idPagina(permiso.getIdPagina())
					.nombrePagina(pagina != null ? pagina.getNombrePagina() : "Página no encontrada")
					.idModulo(pagina != null ? pagina.getModulo().getIdModulo() : null)
					.nombreModulo(modulo != null ? modulo.getNombreModulo() : null).puedeVer(permiso.getPuedeVer())
					.puedeCrear(permiso.getPuedeCrear()).puedeEditar(permiso.getPuedeEditar())
					.puedeEliminar(permiso.getPuedeEliminar()).puedeExportar(permiso.getPuedeExportar())
					.puedeImportar(permiso.getPuedeImportar()).puedeAprobar(permiso.getPuedeAprobar())
					.activo(permiso.getActivo()).fechaCreacion(permiso.getCreatedAt())
					.fechaActualizacion(permiso.getUpdatedAt()).build();
		}).collect(Collectors.toList());
	}

}

/*
 * // ============================================================ // 🔹 OBTENER
 * TODOS LOS MÓDULOS ACTIVOS CON SUS PÁGINAS //
 * ============================================================
 * 
 * @Override
 * 
 * @Transactional(readOnly = true) public List<ModuloSistemaResponse>
 * obtenerTodosLosModulos() {
 * log.info("📦 Obteniendo todos los módulos activos con sus páginas...");
 * 
 * List<ModuloSistema> modulos = moduloRepo.findAllWithPaginasAndPermisos();
 * 
 * return
 * modulos.stream().map(this::mapearAModuloResponse).collect(Collectors.toList()
 * ); }
 * 
 * // ============================================================ // 🔹 OBTENER
 * PÁGINAS ACTIVAS POR MÓDULO //
 * ============================================================
 * 
 * @Override
 * 
 * @Transactional(readOnly = true) public List<PaginaModuloResponse>
 * obtenerPaginasPorModulo(Integer idModulo) {
 * log.info("📄 Obteniendo páginas activas del módulo ID: {}", idModulo);
 * 
 * List<PaginaModulo> paginas = paginaRepo.findByModuloIdWithPermisos(idModulo);
 * 
 * return paginas.stream().filter(PaginaModulo::getActivo) // ✅ solo páginas
 * activas .map(this::mapearAPaginaResponse).collect(Collectors.toList()); }
 * 
 * // ============================================================ // 🔹 BUSCAR
 * PÁGINA POR RUTA (con módulo y permisos) //
 * ============================================================
 * 
 * @Override
 * 
 * @Transactional(readOnly = true) public Optional<PaginaModuloResponse>
 * buscarPaginaPorRuta(String ruta) {
 * log.info("🔍 Buscando página por ruta: {}", ruta);
 * 
 * return
 * paginaRepo.findByRutaPaginaWithModuloAndPermisos(ruta).filter(PaginaModulo::
 * getActivo) .map(this::mapearAPaginaResponse); }
 * 
 * // ============================================================ // 🔹 MÉTODOS
 * DE MAPEADO A DTO //
 * ============================================================ private
 * ModuloSistemaResponse mapearAModuloResponse(ModuloSistema modulo) { return
 * ModuloSistemaResponse.builder().idModulo(modulo.getIdModulo()).nombreModulo(
 * modulo.getNombreModulo()) .paginas( modulo.getPaginas() != null ?
 * modulo.getPaginas().stream().filter(PaginaModulo::getActivo)
 * .map(this::mapearAPaginaResponse).collect(Collectors.toList()) : null)
 * .build(); }
 * 
 * private PaginaModuloResponse mapearAPaginaResponse(PaginaModulo pagina) {
 * return
 * PaginaModuloResponse.builder().idPagina(pagina.getIdPagina()).nombrePagina(
 * pagina.getNombrePagina())
 * .rutaPagina(pagina.getRutaPagina()).descripcion(pagina.getDescripcion()).
 * activo(pagina.getActivo()) .build(); }
 * 
 */
