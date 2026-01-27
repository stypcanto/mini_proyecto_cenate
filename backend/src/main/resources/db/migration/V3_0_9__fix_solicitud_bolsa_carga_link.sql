-- V3_0_9: Reparar vínculo de dim_solicitud_bolsa
-- Cambiar de bolsa_107_carga a dim_historial_carga_bolsas (tabla independiente)

-- 1. Eliminar FK anterior (apuntaba a bolsa_107_carga)
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS fk_solicitud_carga;

-- 2. Crear nuevo FK que apunte a dim_historial_carga_bolsas
ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_carga_bolsas
FOREIGN KEY (id_carga) 
REFERENCES public.dim_historial_carga_bolsas(id_carga) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 3. Actualizar comentario
COMMENT ON COLUMN public.dim_solicitud_bolsa.id_carga IS 'ID de la carga Excel de origen (referencia a dim_historial_carga_bolsas - módulo Bolsas de Pacientes)';

-- 4. Verificar que el FK está correcto
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa' AND column_name = 'id_carga';
