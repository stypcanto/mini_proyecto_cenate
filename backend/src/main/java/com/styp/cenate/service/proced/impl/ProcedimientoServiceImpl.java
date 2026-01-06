package com.styp.cenate.service.proced.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.ProcedimientoResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Procedimiento;
import com.styp.cenate.repository.ProcedimientoRepository;
import com.styp.cenate.service.proced.ProcedimientoService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestión de Procedimientos CPT.
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
