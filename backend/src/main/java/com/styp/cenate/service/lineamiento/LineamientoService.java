package com.styp.cenate.service.lineamiento;

import com.styp.cenate.dto.LineamientoRequest;
import com.styp.cenate.dto.LineamientoResponse;
import com.styp.cenate.model.Lineamiento;
import com.styp.cenate.repository.LineamientoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar Lineamientos
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LineamientoService {

    private final LineamientoRepository lineamientoRepository;

    public LineamientoResponse crear(LineamientoRequest request) {
        log.info("📝 Creando nuevo lineamiento: {}", request.getCodigo());

        Lineamiento lineamiento = Lineamiento.builder()
                .codigo(request.getCodigo())
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .categoria(request.getCategoria())
                .version(request.getVersion() != null ? request.getVersion() : "1.0")
                .fechaAprobacion(request.getFechaAprobacion())
                .aprobadoPor(request.getAprobadoPor())
                .estado(request.getEstado())
                .urlDocumento(request.getUrlDocumento())
                .build();

        Lineamiento guardado = lineamientoRepository.save(lineamiento);
        log.info("✅ Lineamiento creado exitosamente con ID: {}", guardado.getIdLineamiento());

        return mapToResponse(guardado);
    }

    public LineamientoResponse actualizar(Long id, LineamientoRequest request) {
        log.info("✏️ Actualizando lineamiento ID: {}", id);

        Lineamiento lineamiento = lineamientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lineamiento no encontrado con ID: " + id));

        lineamiento.setTitulo(request.getTitulo());
        lineamiento.setDescripcion(request.getDescripcion());
        lineamiento.setCategoria(request.getCategoria());
        lineamiento.setVersion(request.getVersion());
        lineamiento.setFechaAprobacion(request.getFechaAprobacion());
        lineamiento.setAprobadoPor(request.getAprobadoPor());
        lineamiento.setEstado(request.getEstado());
        lineamiento.setUrlDocumento(request.getUrlDocumento());

        Lineamiento actualizado = lineamientoRepository.save(lineamiento);
        log.info("✅ Lineamiento actualizado exitosamente");

        return mapToResponse(actualizado);
    }

    @Transactional(readOnly = true)
    public LineamientoResponse obtenerPorId(Long id) {
        Lineamiento lineamiento = lineamientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lineamiento no encontrado con ID: " + id));
        return mapToResponse(lineamiento);
    }

    @Transactional(readOnly = true)
    public LineamientoResponse obtenerPorCodigo(String codigo) {
        Lineamiento lineamiento = lineamientoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Lineamiento no encontrado con código: " + codigo));
        return mapToResponse(lineamiento);
    }

    @Transactional(readOnly = true)
    public Page<LineamientoResponse> listarTodos(Pageable pageable) {
        return lineamientoRepository.findAllOrdenado(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<LineamientoResponse> listarActivos() {
        return lineamientoRepository.findActivos()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<LineamientoResponse> buscarPorCategoria(String categoria, Pageable pageable) {
        return lineamientoRepository.findByCategoria(categoria, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<LineamientoResponse> buscarPorTitulo(String titulo, Pageable pageable) {
        return lineamientoRepository.findByTituloContainingIgnoreCase(titulo, pageable)
                .map(this::mapToResponse);
    }

    public LineamientoResponse cambiarEstado(Long id, String nuevoEstado) {
        log.info("🔄 Cambiando estado del lineamiento ID: {} a: {}", id, nuevoEstado);

        Lineamiento lineamiento = lineamientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lineamiento no encontrado con ID: " + id));

        lineamiento.setEstado(nuevoEstado);
        Lineamiento actualizado = lineamientoRepository.save(lineamiento);

        return mapToResponse(actualizado);
    }

    public void eliminar(Long id) {
        log.info("🗑️ Eliminando lineamiento ID: {}", id);

        if (!lineamientoRepository.existsById(id)) {
            throw new RuntimeException("Lineamiento no encontrado con ID: " + id);
        }

        lineamientoRepository.deleteById(id);
        log.info("✅ Lineamiento eliminado exitosamente");
    }

    @Transactional(readOnly = true)
    public Long contarPorEstado(String estado) {
        return lineamientoRepository.countByEstado(estado);
    }

    /**
     * Convierte Lineamiento a LineamientoResponse
     */
    private LineamientoResponse mapToResponse(Lineamiento lineamiento) {
        return LineamientoResponse.builder()
                .idLineamiento(lineamiento.getIdLineamiento())
                .codigo(lineamiento.getCodigo())
                .titulo(lineamiento.getTitulo())
                .descripcion(lineamiento.getDescripcion())
                .categoria(lineamiento.getCategoria())
                .version(lineamiento.getVersion())
                .fechaAprobacion(lineamiento.getFechaAprobacion())
                .aprobadoPor(lineamiento.getAprobadoPor())
                .estado(lineamiento.getEstado())
                .urlDocumento(lineamiento.getUrlDocumento())
                .createdAt(lineamiento.getCreatedAt())
                .updatedAt(lineamiento.getUpdatedAt())
                .activo(lineamiento.isActivo())
                .build();
    }
}
