-- =====================================================================
-- V5_3_0: Agregar campos de Ficha de Enfermería a tabla atencion_clinica
-- Autor   : Styp Canto Rondón / Claude Code
-- Fecha   : 2026-02-20
-- Ticket  : v1.76.0 - Ficha de Enfermería (Guardado en BD)
-- Tabla   : atencion_clinica
-- =====================================================================

-- 1. Otras patologías identificadas (HTA, DM, OBESIDAD, etc.)
ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS otra_patologia TEXT;

-- 2. Control de dispositivos médicos (tensiómetro / glucómetro)
ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS control_enfermeria TEXT;

-- 3. Resultado de la Escala de Morisky (ALTA / MEDIA / BAJA)
ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS adherencia_morisky VARCHAR(10);

-- 4. Nivel de riesgo clínico (BAJO / MEDIO / ALTO)
ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(10);

-- 5. Paciente controlado (SÍ / NO)
ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS controlado VARCHAR(5);

-- Comentarios descriptivos
COMMENT ON COLUMN atencion_clinica.otra_patologia     IS 'Patologías adicionales registradas por enfermería (CSV): HTA, DM, OBESIDAD, etc.';
COMMENT ON COLUMN atencion_clinica.control_enfermeria IS 'Conocimiento de dispositivos médicos (CSV): SABE/NO SABE UTILIZAR TENSIOMETRO/GLUCOMETRO';
COMMENT ON COLUMN atencion_clinica.adherencia_morisky IS 'Resultado Escala Morisky-4: ALTA, MEDIA o BAJA';
COMMENT ON COLUMN atencion_clinica.nivel_riesgo       IS 'Nivel de riesgo clínico: BAJO, MEDIO o ALTO';
COMMENT ON COLUMN atencion_clinica.controlado         IS 'Indicador de paciente controlado: SÍ o NO';
