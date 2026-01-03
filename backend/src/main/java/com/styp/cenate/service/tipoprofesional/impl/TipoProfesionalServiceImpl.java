package com.styp.cenate.service.tipoprofesional.impl;

import com.styp.cenate.model.TipoProfesional;
import com.styp.cenate.repository.TipoProfesionalRepository;
import com.styp.cenate.service.tipoprofesional.TipoProfesionalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipoProfesionalServiceImpl implements TipoProfesionalService {

    private final TipoProfesionalRepository tipoProfesionalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TipoProfesional> getAll() {
        log.info("📋 Obteniendo todos los tipos profesionales");
        return tipoProfesionalRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public TipoProfesional getById(Long id) {
        log.info("🔍 Buscando tipo profesional con ID: {}", id);
        return tipoProfesionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo profesional no encontrado con ID: " + id));
    }

    @Override
    @Transactional
    public TipoProfesional createTipoProfesional(TipoProfesional tipoProfesional) {
        log.info("➕ Creando nuevo tipo profesional: {}", tipoProfesional.getDescTipPers());

        // Validar que no exista un tipo profesional con el mismo nombre
        if (tipoProfesionalRepository.existsByDescTipPersIgnoreCase(tipoProfesional.getDescTipPers())) {
            throw new IllegalArgumentException("Ya existe un tipo profesional con el nombre: " + tipoProfesional.getDescTipPers());
        }

        // Convertir descripción a mayúsculas
        tipoProfesional.setDescTipPers(tipoProfesional.getDescTipPers().trim().toUpperCase());

        TipoProfesional saved = tipoProfesionalRepository.save(tipoProfesional);
        log.info("✅ Tipo profesional creado exitosamente: ID {}", saved.getIdTipPers());
        return saved;
    }

    @Override
    @Transactional
    public TipoProfesional updateTipoProfesional(Long id, TipoProfesional tipoProfesional) {
        log.info("✏️ Actualizando tipo profesional ID: {}", id);

        TipoProfesional existente = getById(id);

        // Validar que no exista otro tipo profesional con el mismo nombre (excepto el actual)
        if (!existente.getDescTipPers().equalsIgnoreCase(tipoProfesional.getDescTipPers()) &&
                tipoProfesionalRepository.existsByDescTipPersIgnoreCase(tipoProfesional.getDescTipPers())) {
            throw new IllegalArgumentException("Ya existe un tipo profesional con el nombre: " + tipoProfesional.getDescTipPers());
        }

        // Actualizar campos
        existente.setDescTipPers(tipoProfesional.getDescTipPers().trim().toUpperCase());
        existente.setStatTipPers(tipoProfesional.getStatTipPers());

        TipoProfesional updated = tipoProfesionalRepository.save(existente);
        log.info("✅ Tipo profesional actualizado exitosamente: ID {}", updated.getIdTipPers());
        return updated;
    }

    @Override
    @Transactional
    public void deleteTipoProfesional(Long id) {
        log.info("🗑️ Eliminando tipo profesional ID: {}", id);

        TipoProfesional existente = getById(id);
        tipoProfesionalRepository.delete(existente);

        log.info("✅ Tipo profesional eliminado exitosamente: ID {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoProfesional> getAllActivos() {
        log.info("📋 Obteniendo todos los tipos profesionales activos");
        return tipoProfesionalRepository.findByStatTipPersOrderByDescTipPersAsc("A");
    }
}
