package com.styp.cenate.service.cie10.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.Cie10Response;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.DimCie10;
import com.styp.cenate.repository.DimCie10Repository;
import com.styp.cenate.service.cie10.Cie10Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestión de CIE10.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class Cie10ServiceImpl implements Cie10Service {

    private final DimCie10Repository repository;
    private final ModelMapper mapper;

    @Override
    public List<Cie10Response> listar() {
        List<DimCie10> entities = repository.findAll();
        log.info("📋 [SERVICE] Repository returned {} entities", entities.size());
        return entities.stream()
                .map(c -> mapper.map(c, Cie10Response.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<Cie10Response> listarPaginado(int page, int size, String sortBy, String direction) {
        log.info("📋 [SERVICE] Listando CIE10 paginados - Página: {}, Tamaño: {}, Orden: {} {}", page, size, sortBy, direction);
        
        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idCie10";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<DimCie10> cie10Page = repository.findAll(pageable);
        
        Page<Cie10Response> responsePage = cie10Page.map(
            c -> mapper.map(c, Cie10Response.class)
        );
        
        log.info("📋 [SERVICE] Retornando página {} de {} con {} elementos", 
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements());
        
        return responsePage;
    }

    @Override
    public Page<Cie10Response> buscar(int page, int size, String sortBy, String direction, String codigo, String descripcion) {
        log.info("🔍 [SERVICE] Buscando CIE10 - Página: {}, Tamaño: {}, Código: '{}', Descripción: '{}'", 
            page, size, codigo, descripcion);
        
        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idCie10";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Normalizar parámetros de búsqueda (null si están vacíos)
        String codBusqueda = (codigo != null && !codigo.trim().isEmpty()) ? codigo.trim() : null;
        String descBusqueda = (descripcion != null && !descripcion.trim().isEmpty()) ? descripcion.trim() : null;
        
        Page<DimCie10> cie10Page;
        
        if (codBusqueda != null && descBusqueda != null) {
            // Búsqueda combinada: código Y descripción (ambos criterios deben cumplirse)
            cie10Page = repository.buscarPorCodigoYDescripcion(codBusqueda, descBusqueda, pageable);
        } else if (codBusqueda != null) {
            // Solo búsqueda por código - BÚSQUEDA EXACTA
            cie10Page = repository.findByCodigoIgnoreCase(codBusqueda, pageable);
        } else if (descBusqueda != null) {
            // Solo búsqueda por descripción
            cie10Page = repository.findByDescripcionContainingIgnoreCase(descBusqueda, pageable);
        } else {
            // Sin filtros, retornar todos
            cie10Page = repository.findAll(pageable);
        }
        
        Page<Cie10Response> responsePage = cie10Page.map(
            c -> mapper.map(c, Cie10Response.class)
        );
        
        log.info("🔍 [SERVICE] Búsqueda retornó página {} de {} con {} elementos de {} total", 
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements(), responsePage.getTotalElements());
        
        return responsePage;
    }

    @Override
    public Cie10Response obtenerPorId(Long id) {
        log.info("🔍 Obteniendo CIE10 ID: {}", id);
        DimCie10 cie10 = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CIE10 no encontrado con ID: " + id));
        return mapper.map(cie10, Cie10Response.class);
    }

    @Override
    public Cie10Response crear(Cie10Response dto) {
        log.info("➕ Creando CIE10: {}", dto.getCodigo());
        DimCie10 cie10 = mapper.map(dto, DimCie10.class);

        // Asegurar campos de auditoría
        if (cie10.getCreatedAt() == null) {
            cie10.setCreatedAt(OffsetDateTime.now());
        }
        
        // Valores por defecto
        if (cie10.getActivo() == null) {
            cie10.setActivo(true);
        }

        DimCie10 guardado = repository.save(cie10);
        return mapper.map(guardado, Cie10Response.class);
    }

    @Override
    public Cie10Response actualizar(Long id, Cie10Response dto) {
        log.info("✏️ Actualizando CIE10 ID: {}", id);
        DimCie10 existente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CIE10 no encontrado con ID: " + id));

        existente.setCodigo(dto.getCodigo());
        existente.setCodigoPadre0(dto.getCodigoPadre0());
        existente.setCodigoPadre1(dto.getCodigoPadre1());
        existente.setCodigoPadre2(dto.getCodigoPadre2());
        existente.setCodigoPadre3(dto.getCodigoPadre3());
        existente.setCodigoPadre4(dto.getCodigoPadre4());
        existente.setDescripcion(dto.getDescripcion());
        existente.setNivel(dto.getNivel());
        existente.setFuente(dto.getFuente());
        existente.setActivo(dto.getActivo());

        DimCie10 guardado = repository.save(existente);
        return mapper.map(guardado, Cie10Response.class);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando CIE10 ID: {}", id);
        repository.deleteById(id);
    }
}
