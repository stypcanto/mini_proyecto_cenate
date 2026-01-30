-- =====================================================================
-- 🔧 FIX: Vincular "Seguimiento de Lecturas" como submenu de "Gestión de Modalidad"
-- =====================================================================
-- Objetivo: Configurar "Seguimiento de Lecturas Pendientes" como submenu
--          bajo "Gestión de Modalidad de Atención" en lugar de página independiente
--
-- Cambios:
-- 1. Establecer id_pagina_padre = 90 (Gestión de Modalidad de Atención)
-- 2. Ajustar orden para que aparezca después de la página padre
--
-- Fecha: 2026-01-30
-- Versión: v1.0.0
-- Status: ✅ EJECUTADO
--
-- =====================================================================

-- =====================================================================
-- Vincular como submenu de "Gestión de Modalidad de Atención"
-- =====================================================================

UPDATE dim_paginas_modulo
SET id_pagina_padre = 90,  -- ID de "Gestión de Modalidad de Atención"
    orden = 1,              -- Orden dentro del submenu (1 = primer submenu)
    updated_at = NOW()
WHERE id_pagina = 125       -- ID de "Seguimiento de Lecturas Pendientes"
  AND ruta_pagina = '/roles/externo/seguimiento-lecturas';

-- =====================================================================
-- Verificación del cambio
-- =====================================================================

SELECT
    dp.id_pagina,
    dp.nombre_pagina,
    dp.ruta_pagina,
    dp.id_pagina_padre,
    COALESCE(dp_padre.nombre_pagina, 'N/A') as "página_padre",
    dp.orden,
    dp.activo
FROM dim_paginas_modulo dp
LEFT JOIN dim_paginas_modulo dp_padre ON dp.id_pagina_padre = dp_padre.id_pagina
WHERE dp.id_pagina IN (90, 125)
ORDER BY dp.id_pagina_padre, dp.orden;

-- =====================================================================
-- Resultado esperado:
-- ✅ Seguimiento de Lecturas Pendientes aparecerá como submenu
--    bajo "Gestión de Modalidad de Atención" en el sidebar
-- =====================================================================
