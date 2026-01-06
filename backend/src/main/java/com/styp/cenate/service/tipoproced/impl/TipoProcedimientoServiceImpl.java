package com.styp.cenate.service.tipoproced.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.TipoProcedimiento;
import com.styp.cenate.repository.TipoProcedimientoRepository;
import com.styp.cenate.service.tipoproced.TipoProcedimientoService;

import java.util.List;

/**
 * Implementación del servicio para gestión de Tipos de Procedimiento (CPMS).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TipoProcedimientoServiceImpl implements TipoProcedimientoService {

    private final TipoProcedimientoRepository repository;

    @Override
    public List<TipoProcedimiento> listar() {
        log.info("📋 Listando todos los tipos de procedimiento");
        return repository.findAll();
    }

    @Override
    public TipoProcedimiento obtenerPorId(Long id) {
        log.info("🔍 Obteniendo tipo de procedimiento ID: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Procedimiento no encontrado con ID: " + id));
    }

    @Override
    public TipoProcedimiento crear(TipoProcedimiento tipoProcedimiento) {
        log.info("➕ Creando tipo de procedimiento: {}", tipoProcedimiento.getCodTipProced());
        return repository.save(tipoProcedimiento);
    }

    @Override
    public TipoProcedimiento actualizar(Long id, TipoProcedimiento tipoProcedimiento) {
        log.info("✏️ Actualizando tipo de procedimiento ID: {}", id);
        TipoProcedimiento existente = obtenerPorId(id);
        existente.setCodTipProced(tipoProcedimiento.getCodTipProced());
        existente.setDescTipProced(tipoProcedimiento.getDescTipProced());
        existente.setStatTipProced(tipoProcedimiento.getStatTipProced());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando tipo de procedimiento ID: {}", id);
        repository.deleteById(id);
    }
}
