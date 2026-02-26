package com.styp.cenate.service.mbac;

import java.util.List;

import com.styp.cenate.dto.segu.ModuloSistemaDTO;
import com.styp.cenate.dto.segu.PaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloViewDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaViewDTO;
import com.styp.cenate.dto.segu.RolDTO;

/**
 * Interfaz de servicio para la gestión de módulos del sistema MBAC.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
public interface ModuloSistemaService {

	//Modulos
	List<ModuloSistemaDTO> listado();
	ModuloSistemaDTO guardar(ModuloSistemaDTO dto);
	ModuloSistemaDTO actualizar(Integer id, ModuloSistemaDTO dto);
	ModuloSistemaDTO obtener(Integer id);
	void eliminar(Integer id);
	
	//Roles
	List<RolDTO> listarRoles();
	
	//Paginas
	List<PaginaDTO> listarPaginas();
	PaginaDTO obtenerPagina(Integer id);
	PaginaDTO guardarPagina(PaginaDTO dto);
	PaginaDTO actualizarPagina(Integer id, PaginaDTO dto);
	void eliminarPagina(Integer id);
	List<PaginaDTO> listarPaginasPorModulo(Integer idModulo);
	
	// ========================================
    // PERMISOS ROL-MODULO
    // ========================================
	List<PermisoRolModuloDTO> listarPermisosRolModulo();
	PermisoRolModuloDTO crearPermisoRolModulo(PermisoRolModuloDTO dto);
	PermisoRolModuloDTO actualizarPermisoRolModulo(Integer id, PermisoRolModuloDTO dto) ;
	void eliminarPermisoRolModulo(Integer id);
	
	// ========================================
    // PERMISOS ROL-PAGINA
    // ========================================
	List<PermisoRolPaginaDTO> listarPermisosRolPagina();
	PermisoRolPaginaDTO crearPermisoRolPagina(PermisoRolPaginaDTO dto);
	PermisoRolPaginaDTO actualizarPermisoRolPagina(Integer id, PermisoRolPaginaDTO dto) ;
	void eliminarPermisoRolPagina(Integer id);
	
	
    List<PermisoRolModuloViewDTO> listarPermisosRolModuloConNombres();
    List<PermisoRolPaginaViewDTO> listarPermisosRolPaginaConNombres();

    /** Propaga permisos de segu_permisos_rol_pagina → permisos_modulares para todos los usuarios del rol. */
    java.util.Map<String, Integer> propagarPermisosRolAUsuarios(Integer idRol);

	
	
	
	
//    /**
//     * Obtiene todos los módulos activos con sus páginas.
//     * 
//     * @return Lista de módulos con sus páginas
//     */
//    List<ModuloSistemaResponse> obtenerTodosLosModulos();
//
//    /**
//     * Obtiene las páginas activas de un módulo específico.
//     * 
//     * @param idModulo ID del módulo
//     * @return Lista de páginas del módulo
//     */
//    List<PaginaModuloResponse> obtenerPaginasPorModulo(Integer idModulo);
//
//    /**
//     * Busca una página por su ruta.
//     * 
//     * @param ruta Ruta de la página
//     * @return Página encontrada o vacío
//     */
//    Optional<PaginaModuloResponse> buscarPaginaPorRuta(String ruta);
}
