-- ============================================================================
-- Script: update_estrategia_cenacron.sql
-- Proyecto: CENATE - Sistema de Telemedicina
-- Fecha: 2026-01-03
-- Descripción: Actualizar nombre de estrategia EST-002 de 
--              "Centro Nacional de Enfermedades Crónicas" a "CENACRON"
-- ============================================================================

\echo '================================================'
\echo 'ACTUALIZANDO NOMBRE DE ESTRATEGIA A CENACRON'
\echo '================================================'

-- Actualizar la descripción de la estrategia EST-002
UPDATE public.dim_estrategia_institucional
SET 
    desc_estrategia = 'CENACRON',
    updated_at = NOW()
WHERE 
    cod_estrategia = 'EST-002'
    AND desc_estrategia = 'Centro Nacional de Enfermedades Crónicas';

-- Verificar el cambio
\echo ''
\echo 'Verificando actualización:'
SELECT 
    cod_estrategia,
    desc_estrategia,
    sigla,
    estado
FROM public.dim_estrategia_institucional
WHERE cod_estrategia = 'EST-002';

\echo ''
\echo '✅ Actualización completada'
\echo '================================================'
