-- v1.47.0: Agregar columna origen_bolsa a dim_solicitud_bolsa
-- Para registrar si es BOLSA_GENERADA_X_PROFESIONAL, etc.

ALTER TABLE dim_solicitud_bolsa
ADD COLUMN origen_bolsa VARCHAR(100);

CREATE INDEX idx_solicitud_bolsa_origen ON dim_solicitud_bolsa(origen_bolsa);

COMMENT ON COLUMN dim_solicitud_bolsa.origen_bolsa IS 'v1.47.0: Origen de la bolsa (ej: BOLSA_GENERADA_X_PROFESIONAL)';
