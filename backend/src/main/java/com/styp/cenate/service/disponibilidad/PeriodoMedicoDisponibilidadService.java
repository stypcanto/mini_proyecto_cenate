package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadResponse;

import java.util.List;

/**
 * Servicio para gestionar los periodos globales de disponibilidad médica.
 */
public interface PeriodoMedicoDisponibilidadService {

    List<PeriodoMedicoDisponibilidadResponse> listarTodos();

    List<PeriodoMedicoDisponibilidadResponse> listarActivos();

    List<PeriodoMedicoDisponibilidadResponse> listarVigentes();

    PeriodoMedicoDisponibilidadResponse obtenerPorId(Long id);

    PeriodoMedicoDisponibilidadResponse crear(PeriodoMedicoDisponibilidadRequest request, String createdBy);

    PeriodoMedicoDisponibilidadResponse actualizar(Long id, PeriodoMedicoDisponibilidadRequest request, String updatedBy);

    PeriodoMedicoDisponibilidadResponse cambiarEstado(Long id, String nuevoEstado, String updatedBy);

    void eliminar(Long id);

    List<Integer> listarAnios();
}

