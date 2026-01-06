-- ============================================================
-- Migración: Reasignar atenciones de "Seguimiento Post-Atención" a "TELEMONITOREO"
-- Fecha: 2026-01-05
-- ============================================================

-- Paso 1: Ver cuántas atenciones están afectadas
SELECT COUNT(*) as total_atenciones 
FROM fct_atencion_clinica 
WHERE id_tipo_atencion = 6;

-- Paso 2: Actualizar las atenciones de TAT-006 (id=6) a TAT-002 (id=2)
UPDATE fct_atencion_clinica 
SET id_tipo_atencion = 2,  -- TELEMONITOREO
    updated_at = NOW()
WHERE id_tipo_atencion = 6;  -- Seguimiento Post-Atención

-- Paso 3: Verificar que no queden atenciones con el tipo antiguo
SELECT COUNT(*) as atenciones_restantes 
FROM fct_atencion_clinica 
WHERE id_tipo_atencion = 6;

-- Paso 4: Eliminar el tipo de atención "Seguimiento Post-Atención"
DELETE FROM dim_tipo_atencion_telemedicina 
WHERE id_tipo_atencion = 6;

-- Verificar eliminación
SELECT * FROM dim_tipo_atencion_telemedicina ORDER BY id_tipo_atencion;
