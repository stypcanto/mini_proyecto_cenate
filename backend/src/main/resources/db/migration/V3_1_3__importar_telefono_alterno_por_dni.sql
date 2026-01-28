-- V3_1_3: Importar teléfono alterno usando paciente_dni (evita constraint issues)
-- Problema: V3_1_2 falló por constraint unique en paciente_id
-- Solución: Usar paciente_dni directamente para el JOIN

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

        RAISE NOTICE '✅ Columna paciente_telefono_alterno creada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna paciente_telefono_alterno ya existe';
    END IF;
END $$;

-- PASO 2: Importar teléfono alterno usando paciente_dni (NO paciente_id)
-- Esto evita problemas de constraint unique
DO $$
DECLARE
    imported_count INT;
BEGIN
    UPDATE public.dim_solicitud_bolsa dsb
    SET paciente_telefono_alterno = a.tel_celular
    FROM public.asegurados a
    WHERE dsb.paciente_dni = a.doc_paciente
      AND dsb.activo = true
      AND a.tel_celular IS NOT NULL
      AND a.tel_celular != ''
      AND (dsb.paciente_telefono_alterno IS NULL OR dsb.paciente_telefono_alterno = '');

    GET DIAGNOSTICS imported_count = ROW_COUNT;
    RAISE NOTICE '✅ Importación de teléfonos alternos completada: % registros actualizados', imported_count;
END $$;

-- PASO 3: Mostrar estadísticas finales
\echo ''
\echo '📊 ========== ESTADÍSTICAS FINALES =========='

SELECT
    COUNT(*) as "Total Solicitudes",
    COUNT(CASE WHEN paciente_telefono IS NOT NULL THEN 1 END) as "Con Teléfono Principal",
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as "Con Teléfono Alterno",
    COUNT(CASE WHEN paciente_telefono IS NOT NULL AND paciente_telefono_alterno IS NOT NULL THEN 1 END) as "Con AMBOS Teléfonos",
    COUNT(CASE WHEN paciente_telefono IS NULL AND paciente_telefono_alterno IS NULL THEN 1 END) as "Sin Telefonos"
FROM public.dim_solicitud_bolsa
WHERE activo = true;

-- PASO 4: Verificar asegurado 46155443 específicamente
\echo ''
\echo '🔍 ========== VERIFICACIÓN ASEGURADO 46155443 =========='

SELECT
    id_solicitud,
    paciente_dni as "DNI",
    paciente_nombre as "Nombre",
    paciente_telefono as "Teléfono Principal",
    paciente_telefono_alterno as "Teléfono Alterno"
FROM public.dim_solicitud_bolsa
WHERE paciente_dni = '46155443'
  AND activo = true;

-- PASO 5: Mostrar ejemplos de solicitudes con ambos teléfonos
\echo ''
\echo '✅ ========== EJEMPLOS DE SOLICITUDES CON AMBOS TELÉFONOS (PRIMEROS 10) =========='

SELECT
    id_solicitud,
    paciente_dni as "DNI",
    paciente_nombre as "Nombre",
    paciente_telefono as "Tel. Principal",
    paciente_telefono_alterno as "Tel. Alterno"
FROM public.dim_solicitud_bolsa
WHERE activo = true
  AND paciente_telefono IS NOT NULL
  AND paciente_telefono_alterno IS NOT NULL
LIMIT 10;

\echo ''
\echo '✅ ========== PROCESO COMPLETADO =========='
