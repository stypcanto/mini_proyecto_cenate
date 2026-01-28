-- V3_1_0: Agregar columna de teléfono alterno a solicitudes de bolsa
-- Propósito: Almacenar el teléfono celular/alterno del asegurado (tel_celular desde tabla asegurados)
-- Fecha: 2026-01-27
-- Referencia: https://github.com/CENATE/mini_proyecto_cenate/issues

-- 1. Agregar columna paciente_telefono_alterno
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN paciente_telefono_alterno VARCHAR(20) NULL;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_telefono_alterno IS 'Teléfono alterno/celular del asegurado (importado de asegurados.tel_celular)';

-- 3. Importar datos existentes desde tabla asegurados
-- Para cada solicitud con paciente_id válido, obtener tel_celular de asegurados
UPDATE public.dim_solicitud_bolsa dsb
SET paciente_telefono_alterno = a.tel_celular
FROM public.asegurados a
WHERE dsb.paciente_id = a.pk_asegurado
  AND dsb.activo = true
  AND a.tel_celular IS NOT NULL
  AND a.tel_celular != '';

-- 4. Registrar resultado
-- Verificar cuántos registros se actualizaron
SELECT
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_telefono_alterno,
    COUNT(CASE WHEN paciente_telefono_alterno IS NULL THEN 1 END) as sin_telefono_alterno
FROM public.dim_solicitud_bolsa
WHERE activo = true;
