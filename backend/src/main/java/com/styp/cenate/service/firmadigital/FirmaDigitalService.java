package com.styp.cenate.service.firmadigital;

import com.styp.cenate.dto.ActualizarEntregaTokenRequest;
import com.styp.cenate.dto.FirmaDigitalRequest;
import com.styp.cenate.dto.FirmaDigitalResponse;

import java.util.List;

/**
 * 📋 Servicio para gestión de firma digital del personal.
 *
 * Provee operaciones CRUD y lógica de negocio para:
 * - Registro de entrega de tokens de firma digital
 * - Gestión de certificados digitales
 * - Actualización de entregas PENDIENTES
 * - Alertas de vencimiento
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
public interface FirmaDigitalService {

    /**
     * Guarda o actualiza firma digital del personal (UPSERT).
     *
     * Si ya existe registro para el personal, lo actualiza.
     * Si no existe, crea uno nuevo.
     *
     * @param request Datos de la firma digital
     * @return DTO con datos guardados
     * @throws IllegalArgumentException si el request no es válido
     */
    FirmaDigitalResponse guardarFirmaDigital(FirmaDigitalRequest request);

    /**
     * Obtiene firma digital de un personal específico.
     *
     * @param idPersonal ID del personal (dim_personal_cnt.id_pers)
     * @return DTO con datos de firma digital, o null si no existe
     */
    FirmaDigitalResponse obtenerPorIdPersonal(Long idPersonal);

    /**
     * Obtiene firma digital por ID.
     *
     * @param id ID de la firma digital
     * @return DTO con datos de firma digital
     * @throws RuntimeException si no existe
     */
    FirmaDigitalResponse obtenerPorId(Long id);

    /**
     * Lista todo el personal asistencial de CENATE (CAS y 728) con su estado de firma digital.
     *
     * Hace LEFT JOIN entre dim_personal_cnt y firma_digital_personal para mostrar:
     * - Personal con firma digital registrada (con datos completos)
     * - Personal sin firma digital (con campos de firma en null)
     *
     * @return Lista de DTOs con todos los profesionales y su estado de firma digital
     */
    List<FirmaDigitalResponse> listarActivas();

    /**
     * Lista certificados próximos a vencer (30 días).
     *
     * @return Lista de DTOs con certificados próximos a vencer
     */
    List<FirmaDigitalResponse> listarCertificadosProximosVencer();

    /**
     * Lista certificados próximos a vencer en N días.
     *
     * @param dias Número de días para considerar "próximo a vencer"
     * @return Lista de DTOs con certificados próximos a vencer
     */
    List<FirmaDigitalResponse> listarCertificadosProximosVencer(int dias);

    /**
     * Lista certificados ya vencidos.
     *
     * @return Lista de DTOs con certificados vencidos
     */
    List<FirmaDigitalResponse> listarCertificadosVencidos();

    /**
     * Lista entregas pendientes (motivo PENDIENTE).
     *
     * @return Lista de DTOs con entregas pendientes
     */
    List<FirmaDigitalResponse> listarEntregasPendientes();

    /**
     * Actualiza una firma digital PENDIENTE a entregado.
     *
     * Solo se puede actualizar si el estado actual es PENDIENTE.
     * Cambia entregoToken a TRUE y limpia motivoSinToken.
     *
     * @param request Datos de la entrega del token
     * @return DTO con datos actualizados
     * @throws IllegalStateException si no está en estado PENDIENTE
     * @throws RuntimeException si no existe
     */
    FirmaDigitalResponse actualizarEntregaToken(ActualizarEntregaTokenRequest request);

    /**
     * Elimina firma digital (soft delete).
     *
     * Marca el registro como inactivo (stat_firma = 'I').
     *
     * @param id ID de la firma digital a eliminar
     * @throws RuntimeException si no existe
     */
    void eliminarFirmaDigital(Long id);

    /**
     * Verifica si un personal tiene firma digital registrada.
     *
     * @param idPersonal ID del personal
     * @return true si existe, false si no
     */
    boolean existeFirmaDigital(Long idPersonal);

    /**
     * Importa automáticamente todo el personal asistencial de CENATE
     * con régimen CAS y 728 que no tenga firma digital registrada.
     *
     * Crea registros con estado PENDIENTE para que luego se completen.
     *
     * @return Número de registros creados
     */
    int importarPersonalCENATE();
}
