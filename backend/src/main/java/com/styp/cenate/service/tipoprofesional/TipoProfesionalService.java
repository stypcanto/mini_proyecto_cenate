package com.styp.cenate.service.tipoprofesional;

import com.styp.cenate.model.TipoProfesional;

import java.util.List;

public interface TipoProfesionalService {

    /**
     * Obtener todos los tipos profesionales
     */
    List<TipoProfesional> getAll();

    /**
     * Obtener tipo profesional por ID
     */
    TipoProfesional getById(Long id);

    /**
     * Crear nuevo tipo profesional
     */
    TipoProfesional createTipoProfesional(TipoProfesional tipoProfesional);

    /**
     * Actualizar tipo profesional existente
     */
    TipoProfesional updateTipoProfesional(Long id, TipoProfesional tipoProfesional);

    /**
     * Eliminar tipo profesional
     */
    void deleteTipoProfesional(Long id);

    /**
     * Obtener solo tipos profesionales activos
     */
    List<TipoProfesional> getAllActivos();
}
