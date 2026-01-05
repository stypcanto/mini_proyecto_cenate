-- ========================================================================
-- Script: Agregar nuevas modalidades de atención
-- Descripción: Agrega "AMBOS" y "NO SE BRINDA SERVICIO" a dim_modalidad_atencion
-- Fecha: 2026-01-03
-- ========================================================================

-- Insertar modalidad "AMBOS"
INSERT INTO dim_modalidad_atencion (desc_mod_aten, stat_mod_aten)
VALUES ('AMBOS', 'A')
ON CONFLICT DO NOTHING;

-- Insertar modalidad "NO SE BRINDA SERVICIO"
INSERT INTO dim_modalidad_atencion (desc_mod_aten, stat_mod_aten)
VALUES ('NO SE BRINDA SERVICIO', 'A')
ON CONFLICT DO NOTHING;

-- Verificar todas las modalidades
SELECT * FROM dim_modalidad_atencion ORDER BY id_mod_aten;
