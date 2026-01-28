-- V3_1_1: Verificar e importar datos de teléfono alterno
-- Este script verifica si la importación inicial fue correcta
-- y puede ejecutarse múltiples veces sin efectos negativos

-- 1. Actualizar registros que tengan paciente_id pero sin teléfono alterno
UPDATE public.dim_solicitud_bolsa dsb
SET paciente_telefono_alterno = a.tel_celular
FROM public.asegurados a
WHERE dsb.paciente_id = a.pk_asegurado
  AND dsb.activo = true
  AND dsb.paciente_telefono_alterno IS NULL
  AND a.tel_celular IS NOT NULL
  AND a.tel_celular != '';

-- 2. Mostrar estadísticas finales
SELECT
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN paciente_telefono IS NOT NULL THEN 1 END) as con_telefono_principal,
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_telefono_alterno,
    COUNT(CASE WHEN paciente_telefono IS NOT NULL AND paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_ambos_telefonos,
    COUNT(CASE WHEN paciente_telefono IS NULL AND paciente_telefono_alterno IS NULL THEN 1 END) as sin_telefonos
FROM public.dim_solicitud_bolsa
WHERE activo = true;

-- 3. Mostrar ejemplos de solicitudes con ambos teléfonos
SELECT
    id_solicitud,
    paciente_nombre,
    paciente_dni,
    paciente_telefono as "Teléfono Principal",
    paciente_telefono_alterno as "Teléfono Alterno"
FROM public.dim_solicitud_bolsa
WHERE activo = true
  AND paciente_telefono IS NOT NULL
  AND paciente_telefono_alterno IS NOT NULL
LIMIT 10;
