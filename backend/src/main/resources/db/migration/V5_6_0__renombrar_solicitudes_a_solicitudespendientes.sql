-- ============================================================================
-- V5_6_0 - Renombrar página Solicitudes → Solicitudes Pendientes
-- Cambio de ruta:  /bolsas/solicitudes → /bolsas/solicitudespendientes
-- Cambio de nombre: Solicitudes → Solicitudes Pendientes
-- ============================================================================

-- 1. Actualizar la ruta y nombre en dim_paginas_modulo
UPDATE dim_paginas_modulo
SET
    nombre_pagina = 'Solicitudes Pendientes',
    ruta_pagina   = '/bolsas/solicitudespendientes',
    desc_pagina   = 'Gestionar solicitudes de bolsas pendientes'
WHERE ruta_pagina = '/bolsas/solicitudes';

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
