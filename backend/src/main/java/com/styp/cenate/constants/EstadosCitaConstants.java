package com.styp.cenate.constants;

/**
 * Constantes de estados de citas en el sistema CENATE
 *
 * Centraliza los IDs de estados para evitar magic numbers en el código.
 * Los valores corresponden a registros en las tablas:
 * - dim_estado_cita (módulo chatbot/solicitud_cita)
 * - dim_estados_gestion_citas (módulo bolsas/dim_solicitud_bolsa)
 *
 * @version v1.43.0
 * @since 2026-02-05
 */
public final class EstadosCitaConstants {

    private EstadosCitaConstants() {
        // Prevent instantiation
    }

    // ====================================================================
    // Estados de solicitud_cita (módulo chatbot - dim_estado_cita)
    // ====================================================================

    /** RESERVADO - Cita reservada, pendiente de confirmación */
    public static final Long CITA_RESERVADO = 2L;

    /** ATENDIDO - Cita atendida (médico marcó como atendida) */
    public static final Long CITA_ATENDIDO = 4L;

    /** ANULADO - Cita anulada */
    public static final Long CITA_ANULADO = 6L;

    // ====================================================================
    // Estados de dim_solicitud_bolsa (módulo bolsas - dim_estados_gestion_citas)
    // ====================================================================

    /** CITADO - Paciente agendado para atención */
    public static final Long BOLSA_CITADO = 1L;

    /** ATENDIDO_IPRESS - Paciente recibió atención en institución (SYNC TARGET) */
    public static final Long BOLSA_ATENDIDO_IPRESS = 2L;

    /** NO_CONTESTA - Paciente no responde a las llamadas */
    public static final Long BOLSA_NO_CONTESTA = 3L;

    /** SIN_VIGENCIA - Seguro del paciente no vigente */
    public static final Long BOLSA_SIN_VIGENCIA = 4L;

    /** APAGADO - Teléfono del paciente apagado */
    public static final Long BOLSA_APAGADO = 5L;

    /** NO_DESEA - Paciente rechaza la atención */
    public static final Long BOLSA_NO_DESEA = 6L;

    /** REPROG_FALLIDA - No se pudo reprogramar la cita */
    public static final Long BOLSA_REPROG_FALLIDA = 7L;

    /** NUM_NO_EXISTE - Teléfono registrado no existe */
    public static final Long BOLSA_NUM_NO_EXISTE = 8L;

    /** HC_BLOQUEADA - Historia clínica bloqueada en sistema */
    public static final Long BOLSA_HC_BLOQUEADA = 9L;

    /** TEL_SIN_SERVICIO - Línea telefónica sin servicio */
    public static final Long BOLSA_TEL_SIN_SERVICIO = 10L;

    /** PENDIENTE_CITA - Paciente nuevo que ingresó a la bolsa */
    public static final Long BOLSA_PENDIENTE_CITA = 11L;
}
