package com.styp.cenate.service.proced.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.styp.cenate.dto.ProcedimientoResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Procedimiento;
import com.styp.cenate.repository.ProcedimientoRepository;
import com.styp.cenate.service.proced.ProcedimientoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementación del servicio para gestión de Procedimientos CPMS.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProcedimientoServiceImpl implements ProcedimientoService {

    private final ProcedimientoRepository repository;
    private final ModelMapper mapper;

    @Override
    public List<ProcedimientoResponse> listar() {
        List<Procedimiento> entities = repository.findAll();
        log.info("📋 [SERVICE] Repository returned {} entities", entities.size());
        return entities.stream()
                .map(p -> mapper.map(p, ProcedimientoResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProcedimientoResponse> listarPaginado(int page, int size, String sortBy, String direction) {
        log.info("📋 [SERVICE] Listando procedimientos paginados - Página: {}, Tamaño: {}, Orden: {} {}", page, size, sortBy, direction);
        
        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idProced";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Procedimiento> procedimientosPage = repository.findAll(pageable);
        
        Page<ProcedimientoResponse> responsePage = procedimientosPage.map(
            p -> mapper.map(p, ProcedimientoResponse.class)
        );
        
        log.info("📋 [SERVICE] Retornando página {} de {} con {} elementos", 
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements());
        
        return responsePage;
    }

    @Override
    public Page<ProcedimientoResponse> buscar(int page, int size, String sortBy, String direction, String codProced, String descProced) {
        log.info("🔍 [SERVICE] Buscando procedimientos - Página: {}, Tamaño: {}, Código: '{}', Descripción: '{}'", 
            page, size, codProced, descProced);
        
        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idProced";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Normalizar parámetros de búsqueda (null si están vacíos)
        String codBusqueda = (codProced != null && !codProced.trim().isEmpty()) ? codProced.trim() : null;
        String descBusqueda = (descProced != null && !descProced.trim().isEmpty()) ? descProced.trim() : null;
        
        Page<Procedimiento> procedimientosPage;
        
        if (codBusqueda != null && descBusqueda != null) {
            // Búsqueda combinada: código Y descripción (ambos criterios deben cumplirse)
            procedimientosPage = repository.buscarPorCodigoYDescripcion(codBusqueda, descBusqueda, pageable);
        } else if (codBusqueda != null) {
            // Solo búsqueda por código - BÚSQUEDA EXACTA
            procedimientosPage = repository.findByCodProcedIgnoreCase(codBusqueda, pageable);
        } else if (descBusqueda != null) {
            // Solo búsqueda por descripción
            procedimientosPage = repository.findByDescProcedContainingIgnoreCase(descBusqueda, pageable);
        } else {
            // Sin filtros, retornar todos
            procedimientosPage = repository.findAll(pageable);
        }
        
        Page<ProcedimientoResponse> responsePage = procedimientosPage.map(
            p -> mapper.map(p, ProcedimientoResponse.class)
        );
        
        log.info("🔍 [SERVICE] Búsqueda retornó página {} de {} con {} elementos de {} total", 
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements(), responsePage.getTotalElements());
        
        return responsePage;
    }

    @Override
    public ProcedimientoResponse obtenerPorId(Long id) {
        log.info("🔍 Obteniendo procedimiento ID: {}", id);
        Procedimiento procedimiento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado con ID: " + id));
        return mapper.map(procedimiento, ProcedimientoResponse.class);
    }

    @Override
    public ProcedimientoResponse crear(ProcedimientoResponse dto) {
        log.info("➕ Creando procedimiento: {}", dto.getCodProced());
        Procedimiento procedimiento = mapper.map(dto, Procedimiento.class);

        // Ensure audit fields are set if needed, though simple CRUD usually relies on
        // DB or Listener
        if (procedimiento.getCreatedAt() == null) {
            procedimiento.setCreatedAt(LocalDateTime.now());
        }
        procedimiento.setUpdatedAt(LocalDateTime.now());

        Procedimiento guardado = repository.save(procedimiento);
        return mapper.map(guardado, ProcedimientoResponse.class);
    }

    @Override
    public ProcedimientoResponse actualizar(Long id, ProcedimientoResponse dto) {
        log.info("✏️ Actualizando procedimiento ID: {}", id);
        Procedimiento existente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado con ID: " + id));

        existente.setCodProced(dto.getCodProced());
        existente.setDescProced(dto.getDescProced());
        existente.setStatProced(dto.getStatProced());
        existente.setUpdatedAt(LocalDateTime.now());

        Procedimiento guardado = repository.save(existente);
        return mapper.map(guardado, ProcedimientoResponse.class);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando procedimiento ID: {}", id);
        repository.deleteById(id);
    }
}
