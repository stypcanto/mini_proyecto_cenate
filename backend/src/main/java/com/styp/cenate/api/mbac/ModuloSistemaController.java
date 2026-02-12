package com.styp.cenate.api.mbac;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.segu.ModuloSistemaDTO;
import com.styp.cenate.dto.segu.PaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloDTO;
import com.styp.cenate.dto.segu.PermisoRolModuloViewDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaDTO;
import com.styp.cenate.dto.segu.PermisoRolPaginaViewDTO;
import com.styp.cenate.dto.segu.RolDTO;
import com.styp.cenate.service.mbac.ModuloSistemaService;

import lombok.extern.slf4j.Slf4j;

/**
 * Controlador para la gestión de módulos y páginas del sistema MBAC
 * (Modular-Based Access Control). Permite listar módulos, sus páginas activas y
 * buscar páginas por ruta.
 *
 * @author CENATE Development Team
 * @version 1.3
 */

@RestController
//@RequestMapping("/api/mbac/modulos")
@RequestMapping("/api/mbac")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://10.0.89.239:5173" })
@Slf4j
public class ModuloSistemaController {

	@Autowired
	private ModuloSistemaService mbacService;

//	// 🔹 DTO simple para respuestas de error
//	record ErrorResponse(String message) {
//	}

	// ========================================
	// MODULOS
	// ========================================

	@GetMapping("/modulos")
	public ResponseEntity<?> listarTodo() {
		return ResponseEntity.ok(mbacService.listado());
	}

	@GetMapping("/modulos/{id}")
	public ResponseEntity<?> listarXId(@PathVariable("id") Integer id) {
		return ResponseEntity.ok(mbacService.obtener(id));
	}

	@PostMapping("/modulos")
	public ResponseEntity<ModuloSistemaDTO> crearModulo(@RequestBody ModuloSistemaDTO dto) {
		log.info("Datos ModuloSistemaDTO {} : ", dto.toString());
		ModuloSistemaDTO creado = mbacService.guardar(dto);
		return ResponseEntity.ok(creado);
	}

	@PutMapping("/modulos/{id}")
	public ResponseEntity<ModuloSistemaDTO> actualizarModulo(@PathVariable("id") Integer id,
			@RequestBody ModuloSistemaDTO moduloDTO) {
		return ResponseEntity.ok(mbacService.actualizar(id, moduloDTO));
	}

	@DeleteMapping("/modulos/{id}")
	public ResponseEntity<Void> eliminarModulo(@PathVariable("id") Integer id) {
		mbacService.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	// ========================================
	// ROLES
	// ========================================
	@GetMapping("/roles")
	public ResponseEntity<List<RolDTO>> listarRoles() {
		return ResponseEntity.ok(mbacService.listarRoles());
	}

	// ========================================
	// PÁGINAS
	// ========================================
	@GetMapping("/paginas")
	public ResponseEntity<List<PaginaDTO>> listarPaginas() {
		return ResponseEntity.ok(mbacService.listarPaginas());
	}

	@GetMapping("/paginas/{id}")
	public ResponseEntity<PaginaDTO> obtenerPagina(@PathVariable("id") Integer id) {
		return ResponseEntity.ok(mbacService.obtenerPagina(id));
	}

	@PostMapping("/paginas")
	public ResponseEntity<PaginaDTO> crearPagina(@RequestBody PaginaDTO dto) {
		log.info("Creando página: {}", dto.toString());
		PaginaDTO creada = mbacService.guardarPagina(dto);
		return ResponseEntity.ok(creada);
	}

	@PutMapping("/paginas/{id}")
	public ResponseEntity<PaginaDTO> actualizarPagina(@PathVariable("id") Integer id, @RequestBody PaginaDTO dto) {
		return ResponseEntity.ok(mbacService.actualizarPagina(id, dto));
	}

	@DeleteMapping("/paginas/{id}")
	public ResponseEntity<Void> eliminarPagina(@PathVariable("id") Integer id) {
		mbacService.eliminarPagina(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/modulos/{idModulo}/paginas")
	public ResponseEntity<List<PaginaDTO>> listarPaginasPorModulo(@PathVariable("idModulo") Integer idModulo) {
		return ResponseEntity.ok(mbacService.listarPaginasPorModulo(idModulo));
	}

	// ========================================
	// PERMISOS ROL-MÓDULO
	// ========================================
	@GetMapping("/permisos-rol-modulo")
	public ResponseEntity<List<PermisoRolModuloViewDTO>> listarPermisosRolModulo() {
		return ResponseEntity.ok(mbacService.listarPermisosRolModuloConNombres());
	}	
	
//	@GetMapping("/permisos-rol-modulo")
//	public ResponseEntity<List<PermisoRolModuloDTO>> listarPermisosRolModulo() {
//		return ResponseEntity.ok(mbacService.listarPermisosRolModulo());
//	}

	@PostMapping("/permisos-rol-modulo")
	public ResponseEntity<PermisoRolModuloDTO> crearPermisoRolModulo(@RequestBody PermisoRolModuloDTO dto) {
		return ResponseEntity.ok(mbacService.crearPermisoRolModulo(dto));
	}

	@PutMapping("/permisos-rol-modulo/{id}")
	public ResponseEntity<PermisoRolModuloDTO> actualizarPermisoRolModulo(@PathVariable("id") Integer id,
			@RequestBody PermisoRolModuloDTO dto) {
		return ResponseEntity.ok(mbacService.actualizarPermisoRolModulo(id, dto));
	}

	@DeleteMapping("/permisos-rol-modulo/{id}")
	public ResponseEntity<Void> eliminarPermisoRolModulo(@PathVariable("id") Integer id) {
		mbacService.eliminarPermisoRolModulo(id);
		return ResponseEntity.noContent().build();
	}

	// ========================================
	// PERMISOS ROL-PÁGINA
	// ========================================
	@GetMapping("/permisos-rol-pagina")
	public ResponseEntity<List<PermisoRolPaginaViewDTO>> listarPermisosRolPagina() {
		return ResponseEntity.ok(mbacService.listarPermisosRolPaginaConNombres());
	}
	
//	@GetMapping("/permisos-rol-pagina")
//	public ResponseEntity<List<PermisoRolPaginaDTO>> listarPermisosRolPagina() {
//		return ResponseEntity.ok(mbacService.listarPermisosRolPagina());
//	}

	@PostMapping("/permisos-rol-pagina")
	public ResponseEntity<PermisoRolPaginaDTO> crearPermisoRolPagina(@RequestBody PermisoRolPaginaDTO dto) {
		return ResponseEntity.ok(mbacService.crearPermisoRolPagina(dto));
	}

	@PutMapping("/permisos-rol-pagina/{id}")
	public ResponseEntity<PermisoRolPaginaDTO> actualizarPermisoRolPagina(@PathVariable("id") Integer id,
			@RequestBody PermisoRolPaginaDTO dto) {
		return ResponseEntity.ok(mbacService.actualizarPermisoRolPagina(id, dto));
	}

	@DeleteMapping("/permisos-rol-pagina/{id}")
	public ResponseEntity<Void> eliminarPermisoRolPagina(@PathVariable("id") Integer id) {
		mbacService.eliminarPermisoRolPagina(id);
		return ResponseEntity.noContent().build();
	}

}

/*
 * // EPY -> REVISAR ESTE ENDPOINT //
 * =============================================================================
 * ============ // 🔸 1. Listar todos los módulos activos con sus páginas y
 * permisos //
 * =============================================================================
 * ============
 * 
 * @GetMapping("/listarModulosActivos") public ResponseEntity<?> listarModulos()
 * { try { log.info("📦 Listando todos los módulos MBAC...");
 * 
 * List<ModuloSistemaResponse> modulos = moduloService.obtenerTodosLosModulos();
 * 
 * if (modulos.isEmpty()) { return ResponseEntity.status(HttpStatus.NO_CONTENT)
 * .body(new ErrorResponse("No hay módulos registrados.")); }
 * 
 * return ResponseEntity.ok(modulos);
 * 
 * } catch (Exception e) { log.error("❌ Error al listar módulos MBAC: {}",
 * e.getMessage(), e); return
 * ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) .body(new
 * ErrorResponse("Error interno al listar los módulos.")); } }
 * 
 * //
 * =============================================================================
 * ============ // 🔸 2. Listar páginas activas por ID de módulo con sus
 * permisos //
 * =============================================================================
 * ============
 * 
 * @GetMapping("/{id}/paginas") public ResponseEntity<?>
 * listarPaginasPorModulo(@PathVariable Integer id) { try {
 * log.info("📄 Listando páginas activas del módulo ID {}", id);
 * 
 * List<PaginaModuloResponse> paginas =
 * moduloService.obtenerPaginasPorModulo(id);
 * 
 * if (paginas.isEmpty()) { return ResponseEntity.status(HttpStatus.NOT_FOUND)
 * .body(new
 * ErrorResponse("No se encontraron páginas activas para este módulo.")); }
 * 
 * return ResponseEntity.ok(paginas);
 * 
 * } catch (Exception e) {
 * log.error("❌ Error al listar páginas del módulo {}: {}", id, e.getMessage(),
 * e); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) .body(new
 * ErrorResponse("Error interno al listar las páginas del módulo.")); } }
 * 
 * //
 * =============================================================================
 * ============ // 🔸 3. Buscar página por ruta (ej: /roles/admin/personal) //
 * =============================================================================
 * ============
 * 
 * @GetMapping("/buscar") public ResponseEntity<?>
 * buscarPaginaPorRuta(@RequestParam String ruta) { try {
 * log.info("🔍 Buscando página por ruta: {}", ruta);
 * 
 * return moduloService.buscarPaginaPorRuta(ruta)
 * .<ResponseEntity<?>>map(ResponseEntity::ok) .orElseGet(() ->
 * ResponseEntity.status(HttpStatus.NOT_FOUND) .body(new
 * ErrorResponse("No se encontró una página con la ruta especificada.")));
 * 
 * } catch (Exception e) { log.error("❌ Error al buscar página por ruta {}: {}",
 * ruta, e.getMessage(), e); return
 * ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) .body(new
 * ErrorResponse("Ha ocurrido un error interno al buscar la página por ruta."));
 * } }
 */
