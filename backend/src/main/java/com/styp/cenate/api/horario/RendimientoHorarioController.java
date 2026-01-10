package com.styp.cenate.api.horario;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.horario.RendimientoHorarioListadoRow;
import com.styp.cenate.dto.horario.RendimientoHorarioRequest;
import com.styp.cenate.dto.horario.RendimientoHorarioResponse;
import com.styp.cenate.service.horario.RendimientoHorarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Rendimiento Horario", description = "Catálogo de Rendimiento Horario (búsqueda, detalle, registro, actualización y eliminación)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rendimiento-horario")
public class RendimientoHorarioController {

	private final RendimientoHorarioService service;

	/**
	 * LISTA PAGINADA + FILTROS (para búsqueda avanzada)
	 *
	 * Ejemplos: /api/rendimiento-horario?page=0&size=10
	 * /api/rendimiento-horario?q=472&estado=A
	 * /api/rendimiento-horario?idAreaHosp=1&idServicio=13&idActividad=6&pacMin=2&pacMax=5&estado=A&page=0&size=10
	 */
	@Operation(summary = "Listar sin descripcion de campos Rendimiento Horario", description = "Devuelve todos los rendimientos horarios")
	@GetMapping
	public Page<RendimientoHorarioResponse> listar(@RequestParam(required = false) String q,
			@RequestParam(required = false) Long idAreaHosp, @RequestParam(required = false) Long idServicio,
			@RequestParam(required = false) Long idActividad, @RequestParam(required = false) String estado,
			@RequestParam(required = false) Integer pacMin, @RequestParam(required = false) Integer pacMax,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		return service.buscar(q, idAreaHosp, idServicio, idActividad, estado, pacMin, pacMax, page, size);
	}

	/*
	 * Lista paginada con descripcion de campos (Tablas relacionadas)
	 */
	@Operation(summary = "Listar con descripcion de campos Rendimiento Horario", description = "Devuelve todos los rendimientos horarios")
	@GetMapping("/listado")
	public Page<RendimientoHorarioListadoRow> listado(@RequestParam(required = false) String q,
			@RequestParam(required = false) Long idAreaHosp, @RequestParam(required = false) Long idServicio,
			@RequestParam(required = false) Long idActividad, @RequestParam(required = false) String estado,
			@RequestParam(required = false) Integer pacMin, @RequestParam(required = false) Integer pacMax,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		return service.listar(q, idAreaHosp, idServicio, idActividad, estado, pacMin, pacMax, page, size);
	}

	/**
	 * OBTENER POR ID
	 */
	@Operation(summary = "Obtener por id de rendimiento de horario", description = "Devuelve el rendimiento horario de un id")
	@GetMapping("/{id}")
	public RendimientoHorarioResponse obtener(@PathVariable Long id) {
		return service.obtenerPorId(id);
	}

	/**
	 * CREAR
	 */
	@Operation(summary = "Crear registro de rendimiento horario", description = """
			Crea un registro de rendimiento horario.
			**Catálogos requeridos para el Formulario (combos):**
			1) Área hospitalaria:
			   - PAQUETE : com.styp.cenate.api.entidad.AreaHospitalariaController
			   - `GET "/api/areas-hospitalarias"`
			   - value: `idAreaHosp`
			   - label: `descAreaHosp`

			2) Servicio:
			   - `GET "/api/servicio-essi"`

			3) Actividad:
			   - `GET /api/catalogo/actividades/activas/cenate`
			   -value: idActividad
			   -label: descActividad

			4) Subactividad:
			   - `GET /api/catalogo/subactividad-essi/activas/cenate`
			   - value: `idSubactividad`
			   - label: `descSubactividad`

			""")

	@PostMapping
	public ResponseEntity<RendimientoHorarioResponse> crear(@RequestBody RendimientoHorarioRequest req) {
		RendimientoHorarioResponse created = service.crear(req);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	/**
	 * ACTUALIZAR
	 */
	@Operation(summary = "Actualizar por id de rendimiento de horario", description = "")
	@PutMapping("/{id}")
	public RendimientoHorarioResponse actualizar(@PathVariable Long id, @RequestBody RendimientoHorarioRequest req) {
		return service.actualizar(id, req);
	}

	@Operation(summary = "Eliminar rendimiento horario por ID", description = """
			Elimina el registro por ID.
			Retorna **204 No Content** si se eliminó correctamente.
			""")
	@ApiResponses(
			{ 
				@ApiResponse(responseCode = "204", description = "Eliminado correctamente"),
				@ApiResponse(responseCode = "404", description = "No existe el ID solicitado", content = @Content),
				@ApiResponse(responseCode = "409", description = "Conflicto por integridad referencial (está en uso)", content = @Content),
				@ApiResponse(responseCode = "500", description = "Error interno", content = @Content) 
			})
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(
			@Parameter(description = "ID del rendimiento horario", example = "10")
			@PathVariable Long id) {
		service.eliminar(id);
		return ResponseEntity.noContent().build();
	}

}
