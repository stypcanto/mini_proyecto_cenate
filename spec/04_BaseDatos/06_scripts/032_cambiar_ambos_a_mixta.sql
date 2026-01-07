-- Script para cambiar "AMBOS" a "MIXTA" en modalidad de atención
-- Ejecutar después de la migración 031

UPDATE dim_modalidad_atencion
SET desc_mod_aten = 'MIXTA'
WHERE desc_mod_aten = 'AMBOS';

-- Verificar que se ejecutó correctamente
SELECT id_mod_aten, desc_mod_aten FROM dim_modalidad_atencion ORDER BY id_mod_aten;
