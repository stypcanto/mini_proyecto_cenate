package com.styp.cenate.service.medicamento.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.styp.cenate.dto.MedicamentoResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Medicamento;
import com.styp.cenate.repository.MedicamentoRepository;
import com.styp.cenate.service.medicamento.MedicamentoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementación del servicio para gestión de Medicamentos (Petitorio Nacional).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MedicamentoServiceImpl implements MedicamentoService {

    private final MedicamentoRepository repository;
    private final ModelMapper mapper;

    @Override
    public List<MedicamentoResponse> listar() {
        List<Medicamento> entities = repository.findAll();
        log.info("💊 [SERVICE] Repository returned {} medicamentos", entities.size());
        return entities.stream()
                .map(m -> mapper.map(m, MedicamentoResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<MedicamentoResponse> listarPaginado(int page, int size, String sortBy, String direction) {
        log.info("💊 [SERVICE] Listando medicamentos paginados - Página: {}, Tamaño: {}, Orden: {} {}", page, size, sortBy, direction);

        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idMedicamento";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Medicamento> medicamentosPage = repository.findAll(pageable);

        Page<MedicamentoResponse> responsePage = medicamentosPage.map(
            m -> mapper.map(m, MedicamentoResponse.class)
        );

        log.info("💊 [SERVICE] Retornando página {} de {} con {} elementos",
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements());

        return responsePage;
    }

    @Override
    public Page<MedicamentoResponse> buscar(int page, int size, String sortBy, String direction, String codMedicamento, String descMedicamento) {
        log.info("🔍 [SERVICE] Buscando medicamentos - Página: {}, Tamaño: {}, Código: '{}', Descripción: '{}'",
            page, size, codMedicamento, descMedicamento);

        // Validar y establecer valores por defecto
        String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "idMedicamento";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        Sort sort = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Normalizar parámetros de búsqueda (null si están vacíos)
        String codBusqueda = (codMedicamento != null && !codMedicamento.trim().isEmpty()) ? codMedicamento.trim() : null;
        String descBusqueda = (descMedicamento != null && !descMedicamento.trim().isEmpty()) ? descMedicamento.trim() : null;

        Page<Medicamento> medicamentosPage;

        if (codBusqueda != null && descBusqueda != null) {
            // Búsqueda combinada: código Y descripción (ambos criterios deben cumplirse)
            medicamentosPage = repository.buscarPorCodigoYDescripcion(codBusqueda, descBusqueda, pageable);
        } else if (codBusqueda != null) {
            // Solo búsqueda por código - BÚSQUEDA EXACTA
            medicamentosPage = repository.findByCodMedicamentoIgnoreCase(codBusqueda, pageable);
        } else if (descBusqueda != null) {
            // Solo búsqueda por descripción
            medicamentosPage = repository.findByDescMedicamentoContainingIgnoreCase(descBusqueda, pageable);
        } else {
            // Sin filtros, retornar todos
            medicamentosPage = repository.findAll(pageable);
        }

        Page<MedicamentoResponse> responsePage = medicamentosPage.map(
            m -> mapper.map(m, MedicamentoResponse.class)
        );

        log.info("🔍 [SERVICE] Búsqueda retornó página {} de {} con {} elementos de {} total",
            page, responsePage.getTotalPages(), responsePage.getNumberOfElements(), responsePage.getTotalElements());

        return responsePage;
    }

    @Override
    public MedicamentoResponse obtenerPorId(Long id) {
        log.info("🔍 Obteniendo medicamento ID: {}", id);
        Medicamento medicamento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado con ID: " + id));
        return mapper.map(medicamento, MedicamentoResponse.class);
    }

    @Override
    public MedicamentoResponse crear(MedicamentoResponse dto) {
        log.info("➕ Creando medicamento: {}", dto.getCodMedicamento());
        Medicamento medicamento = mapper.map(dto, Medicamento.class);

        // Ensure audit fields are set if needed
        if (medicamento.getCreatedAt() == null) {
            medicamento.setCreatedAt(LocalDateTime.now());
        }
        medicamento.setUpdatedAt(LocalDateTime.now());

        Medicamento guardado = repository.save(medicamento);
        return mapper.map(guardado, MedicamentoResponse.class);
    }

    @Override
    public MedicamentoResponse actualizar(Long id, MedicamentoResponse dto) {
        log.info("✏️ Actualizando medicamento ID: {}", id);
        Medicamento existente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado con ID: " + id));

        existente.setCodMedicamento(dto.getCodMedicamento());
        existente.setDescMedicamento(dto.getDescMedicamento());
        existente.setStatMedicamento(dto.getStatMedicamento());
        existente.setUpdatedAt(LocalDateTime.now());

        Medicamento guardado = repository.save(existente);
        return mapper.map(guardado, MedicamentoResponse.class);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando medicamento ID: {}", id);
        repository.deleteById(id);
    }
}
