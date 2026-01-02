-- ============================================================================
-- Script: 017_rename_listado_107_to_carga_pacientes.sql
-- Descripción: Renombrar submenú "Listado de 107" a "Carga de Pacientes 107"
-- Autor: Ing. Styp Canto Rondón
-- Fecha: 2026-01-02
-- Versión: v1.14.1
-- ============================================================================

-- Contexto:
-- El módulo de importación masiva (Bolsa 107) necesita un nombre más descriptivo
-- que refleje mejor su función principal: carga masiva de pacientes.

\echo '============================================'
\echo 'Actualizando nombre del submenú Bolsa 107'
\echo '============================================'

-- 1. Actualizar nombre de la página en dim_paginas_modulo
UPDATE dim_paginas_modulo
SET
    nombre_pagina = 'Carga de Pacientes 107',
    updated_at = NOW()
WHERE
    id_pagina = 70
    AND ruta_pagina = '/roles/coordcitas/107';

-- 2. Verificar el cambio
\echo ''
\echo 'Verificando actualización:'
SELECT
    id_pagina,
    nombre_pagina,
    ruta_pagina,
    orden,
    updated_at
FROM dim_paginas_modulo
WHERE id_pagina = 70;

\echo ''
\echo '✅ Nombre del submenú actualizado correctamente'
\echo ''
\echo 'Antes: "Listado de 107"'
\echo 'Después: "Carga de Pacientes 107"'
\echo ''
\echo '============================================'
\echo 'Script ejecutado exitosamente'
\echo '============================================'
