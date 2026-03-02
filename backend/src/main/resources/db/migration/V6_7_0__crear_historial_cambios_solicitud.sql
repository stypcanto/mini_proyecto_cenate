-- ============================================================
-- V6_7_0: Tabla de historial de cambios de solicitud de bolsa
-- Permite trazabilidad permanente de devoluciones, anulaciones
-- y otros cambios masivos que limpian campos de la solicitud.
-- v1.81.6 - 2026-03-02
-- ============================================================

CREATE TABLE IF NOT EXISTS dim_historial_cambios_solicitud (
    id_historial              BIGSERIAL PRIMARY KEY,
    id_solicitud              BIGINT        NOT NULL REFERENCES dim_solicitud_bolsa(id_solicitud),
    tipo_cambio               VARCHAR(50)   NOT NULL,  -- DEVOLUCION_A_PENDIENTE, ANULACION, etc.
    motivo                    TEXT,

    -- Estado anterior (antes del cambio)
    estado_anterior_id        BIGINT,
    estado_anterior_desc      VARCHAR(200),

    -- Médico anterior (antes de limpiar idPersonal)
    medico_anterior_id        BIGINT,
    medico_anterior_nombre    VARCHAR(255),

    -- Cita anterior (antes de limpiar fechaAtencion)
    fecha_cita_anterior       DATE,
    hora_cita_anterior        TIME,

    -- Auditoría
    usuario_id                BIGINT        REFERENCES dim_usuarios(id_user),
    usuario_nombre            VARCHAR(100),
    fecha_cambio              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_cambios_id_solicitud ON dim_historial_cambios_solicitud(id_solicitud);
CREATE INDEX idx_historial_cambios_tipo         ON dim_historial_cambios_solicitud(tipo_cambio);
CREATE INDEX idx_historial_cambios_fecha        ON dim_historial_cambios_solicitud(fecha_cambio);
