-- ============================================================
-- Script: Renombrar "Logs del Sistema" a "Auditoría"
-- Fecha: 2025-12-23
-- ============================================================

-- 1. Verificar la página actual
SELECT * FROM dim_paginas_modulo WHERE ruta_pagina = '/admin/logs';

-- 2. Actualizar el nombre de la página
UPDATE dim_paginas_modulo
SET nombre_pagina = 'Auditoría',
    descripcion = 'Auditoría completa del sistema - Trazabilidad de acciones'
WHERE ruta_pagina = '/admin/logs';

-- 3. Verificar el cambio
SELECT id_pagina, nombre_pagina, ruta_pagina, descripcion
FROM dim_paginas_modulo
WHERE ruta_pagina = '/admin/logs';

-- ============================================================
-- FIN
-- ============================================================
