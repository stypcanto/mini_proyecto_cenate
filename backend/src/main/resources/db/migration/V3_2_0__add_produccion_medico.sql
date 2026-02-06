-- ========================================================================
-- V3_2_0: Agregar página Producción al Panel Médico
-- ========================================================================
-- Descripción: Agrega la página "Producción" bajo el módulo "Panel Médico"
-- para mostrar el resumen de atenciones médicas

-- Insertar la página "Producción" en dim_paginas
INSERT INTO dim_paginas (nombre_pagina, ruta_pagina, modulo, activo)
VALUES ('Producción', '/roles/medico/produccion', 'Panel Médico', true)
ON CONFLICT (ruta_pagina) DO UPDATE SET
  nombre_pagina = EXCLUDED.nombre_pagina,
  activo = EXCLUDED.activo;
