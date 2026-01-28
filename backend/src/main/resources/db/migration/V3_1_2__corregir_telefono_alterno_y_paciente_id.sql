-- V3_1_2: CORREGIR - Crear columna + vincular paciente_id + importar teléfonos alternos
-- Problema: V3_1_0 no se ejecutó. Esta migración corrige el problema

-- PASO 1: Crear columna si NO existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dim_solicitud_bolsa'
        AND column_name = 'paciente_telefono_alterno'
    ) THEN
        ALTER TABLE public.dim_solicitud_bolsa
        ADD COLUMN paciente_telefono_alterno VARCHAR(20) NULL;

        COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_telefono_alterno IS
            'Teléfono alterno/celular del asegurado (importado de asegurados.tel_celular)';

        RAISE NOTICE 'Columna paciente_telefono_alterno creada exitosamente';
    ELSE
        RAISE NOTICE 'Columna paciente_telefono_alterno ya existe';
    END IF;
END $$;

-- PASO 2: Vincular paciente_id con asegurados cuando sea NULL pero el DNI coincida
UPDATE public.dim_solicitud_bolsa dsb
SET paciente_id = a.pk_asegurado
FROM public.asegurados a
WHERE dsb.paciente_id IS NULL
  AND dsb.paciente_dni IS NOT NULL
  AND a.doc_paciente = dsb.paciente_dni
  AND dsb.activo = true;

RAISE NOTICE 'Vinculación de paciente_id completada';

-- PASO 3: Importar teléfono alterno desde asegurados usando paciente_id
UPDATE public.dim_solicitud_bolsa dsb
SET paciente_telefono_alterno = a.tel_celular
FROM public.asegurados a
WHERE dsb.paciente_id = a.pk_asegurado
  AND dsb.activo = true
  AND a.tel_celular IS NOT NULL
  AND a.tel_celular != ''
  AND (dsb.paciente_telefono_alterno IS NULL OR dsb.paciente_telefono_alterno = '');

RAISE NOTICE 'Importación de teléfonos alternos completada';

-- PASO 4: Mostrar estadísticas finales
SELECT
    'ESTADÍSTICAS FINALES' as "Reporte",
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN paciente_id IS NOT NULL THEN 1 END) as con_paciente_id_vinculado,
    COUNT(CASE WHEN paciente_id IS NULL THEN 1 END) as con_paciente_id_null,
    COUNT(CASE WHEN paciente_telefono IS NOT NULL THEN 1 END) as con_telefono_principal,
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_telefono_alterno,
    COUNT(CASE WHEN paciente_telefono IS NOT NULL AND paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_ambos_telefonos
FROM public.dim_solicitud_bolsa
WHERE activo = true;

-- PASO 5: Mostrar ejemplo específico del asegurado 46155443
SELECT
    '=== VERIFICACIÓN ASEGURADO 46155443 ===' as "Verificación",
    id_solicitud,
    paciente_dni,
    paciente_nombre,
    paciente_telefono as "Tel. Principal",
    paciente_telefono_alterno as "Tel. Alterno",
    paciente_id
FROM public.dim_solicitud_bolsa
WHERE paciente_dni = '46155443'
  AND activo = true;

-- PASO 6: Mostrar ejemplos de solicitudes con ambos teléfonos
SELECT
    'EJEMPLOS CON AMBOS TELÉFONOS' as "Muestreo",
    id_solicitud,
    paciente_dni,
    paciente_nombre,
    paciente_telefono as "Tel. Principal",
    paciente_telefono_alterno as "Tel. Alterno"
FROM public.dim_solicitud_bolsa
WHERE activo = true
  AND paciente_telefono IS NOT NULL
  AND paciente_telefono_alterno IS NOT NULL
LIMIT 10;
