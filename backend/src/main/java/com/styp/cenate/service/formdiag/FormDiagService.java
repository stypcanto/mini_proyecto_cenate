package com.styp.cenate.service.formdiag;

import com.styp.cenate.dto.formdiag.FormDiagEstadisticasDTO;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.formdiag.FormDiagRequest;
import com.styp.cenate.dto.formdiag.FormDiagResponse;

import java.util.List;

/**
 * Servicio para gestionar los formularios de diagnóstico situacional de Telesalud
 */
public interface FormDiagService {

    /**
     * Crear un nuevo formulario de diagnóstico
     */
    FormDiagResponse crear(FormDiagRequest request, String username);

    /**
     * Actualizar un formulario existente
     */
    FormDiagResponse actualizar(Integer idFormulario, FormDiagRequest request, String username);

    /**
     * Guardar borrador del formulario
     */
    FormDiagResponse guardarBorrador(FormDiagRequest request, String username);

    /**
     * Enviar formulario (cambia estado a ENVIADO)
     */
    FormDiagResponse enviar(Integer idFormulario, String username);

    /**
     * Obtener formulario por ID
     */
    FormDiagResponse obtenerPorId(Integer idFormulario);

    /**
     * Obtener formulario activo (en proceso) por IPRESS
     */
    FormDiagResponse obtenerEnProcesoPorIpress(Long idIpress);

    /**
     * Obtener el último formulario de una IPRESS
     */
    FormDiagResponse obtenerUltimoPorIpress(Long idIpress);

    /**
     * Listar todos los formularios
     */
    List<FormDiagListResponse> listarTodos();

    /**
     * Listar formularios por IPRESS
     */
    List<FormDiagListResponse> listarPorIpress(Long idIpress);

    /**
     * Listar formularios por Red Asistencial
     */
    List<FormDiagListResponse> listarPorRed(Long idRed);

    /**
     * Listar formularios por estado
     */
    List<FormDiagListResponse> listarPorEstado(String estado);

    /**
     * Listar formularios por año
     */
    List<FormDiagListResponse> listarPorAnio(Integer anio);

    /**
     * Eliminar formulario (solo si está en proceso)
     */
    void eliminar(Integer idFormulario);

    /**
     * Verificar si existe un formulario en proceso para la IPRESS en el año actual
     */
    boolean existeEnProcesoActual(Long idIpress);

    /**
     * Obtener estadísticas detalladas de un formulario
     */
    FormDiagEstadisticasDTO obtenerEstadisticasDetalladas(Integer idFormulario);
}
