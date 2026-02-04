#!/bin/bash

# ========================================================================
# 🔧 CORREGIR TELÉFONO ALTERNO - Script Manual de Ejecución Inmediata
# ========================================================================
# Este script ejecuta los cambios directamente en la BD sin esperar Flyway
# Úsalo AHORA para ver resultados inmediatos

echo "=========================================="
echo "🔧 EJECUTANDO CORRECCIONES DE BASE DE DATOS"
echo "=========================================="
echo ""

PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate << 'EOF'

-- ========================================================================
-- PASO 1: Crear columna si NO existe
-- ========================================================================
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

-- ========================================================================
-- PASO 2: Vincular paciente_id con asegurados cuando sea NULL
-- ========================================================================
DO $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE public.dim_solicitud_bolsa dsb
    SET paciente_id = a.pk_asegurado
    FROM public.asegurados a
    WHERE dsb.paciente_id IS NULL
      AND dsb.paciente_dni IS NOT NULL
      AND a.doc_paciente = dsb.paciente_dni
      AND dsb.activo = true;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Vinculación de paciente_id completada: % registros actualizados', updated_count;
END $$;

-- ========================================================================
-- PASO 3: Importar teléfono alterno desde asegurados
-- ========================================================================
DO $$
DECLARE
    imported_count INT;
BEGIN
    UPDATE public.dim_solicitud_bolsa dsb
    SET paciente_telefono_alterno = a.tel_celular
    FROM public.asegurados a
    WHERE dsb.paciente_id = a.pk_asegurado
      AND dsb.activo = true
      AND a.tel_celular IS NOT NULL
      AND a.tel_celular != ''
      AND (dsb.paciente_telefono_alterno IS NULL OR dsb.paciente_telefono_alterno = '');

    GET DIAGNOSTICS imported_count = ROW_COUNT;
    RAISE NOTICE '✅ Importación de teléfonos alternos completada: % registros actualizados', imported_count;
END $$;

-- ========================================================================
-- PASO 4: Mostrar estadísticas finales
-- ========================================================================
\echo ''
\echo '📊 ========== ESTADÍSTICAS FINALES =========='

SELECT
    COUNT(*) as "Total Solicitudes",
    COUNT(CASE WHEN paciente_id IS NOT NULL THEN 1 END) as "Con paciente_id Vinculado",
    COUNT(CASE WHEN paciente_id IS NULL THEN 1 END) as "Con paciente_id NULL",
    COUNT(CASE WHEN paciente_telefono IS NOT NULL THEN 1 END) as "Con Teléfono Principal",
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as "Con Teléfono Alterno",
    COUNT(CASE WHEN paciente_telefono IS NOT NULL AND paciente_telefono_alterno IS NOT NULL THEN 1 END) as "Con AMBOS Teléfonos"
FROM public.dim_solicitud_bolsa
WHERE activo = true;

-- ========================================================================
-- PASO 5: Verificar asegurado 46155443 específicamente
-- ========================================================================
\echo ''
\echo '🔍 ========== VERIFICACIÓN ASEGURADO 46155443 =========='

SELECT
    id_solicitud,
    paciente_dni as "DNI",
    paciente_nombre as "Nombre",
    paciente_telefono as "Teléfono Principal",
    paciente_telefono_alterno as "Teléfono Alterno",
    paciente_id as "paciente_id Vinculado"
FROM public.dim_solicitud_bolsa
WHERE paciente_dni = '46155443'
  AND activo = true;

-- ========================================================================
-- PASO 6: Mostrar ejemplos de solicitudes con ambos teléfonos
-- ========================================================================
\echo ''
\echo '✅ ========== EJEMPLOS DE SOLICITUDES CON AMBOS TELÉFONOS =========='

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
LIMIT 15;

\echo ''
\echo '✅ ========== CORRECCIONES COMPLETADAS =========='
\echo ''

EOF

echo ""
echo "=========================================="
echo "✅ PROCESO COMPLETADO"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Actualiza el navegador (F5)"
echo "2. Ve a: http://localhost:3000/bolsas/solicitudes"
echo "3. Busca al asegurado 46155443"
echo "4. Verifica que aparezca el teléfono alterno"
echo ""
