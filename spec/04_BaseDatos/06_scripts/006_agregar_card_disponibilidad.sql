-- ================================================================
-- Script SQL: Agregar Card de Disponibilidad al Dashboard Médico
-- Sistema: CENATE - EsSalud Perú
-- Versión: 1.0.0
-- Fecha: 2025-12-27
-- Autor: Ing. Styp Canto Rondon
-- ================================================================
--
-- Propósito:
-- Agregar la card "Mi Disponibilidad" al dashboard médico
-- para que los médicos puedan acceder al módulo de gestión
-- de disponibilidad de turnos.
--
-- ================================================================

-- Verificar si ya existe la card
DO $$
DECLARE
    card_existe BOOLEAN;
    max_orden INT;
BEGIN
    -- Verificar si ya existe una card con el link a disponibilidad
    SELECT EXISTS (
        SELECT 1 FROM dashboard_medico_cards
        WHERE link = '/roles/medico/disponibilidad'
    ) INTO card_existe;

    IF card_existe THEN
        RAISE NOTICE 'La card de disponibilidad ya existe. No se insertará duplicado.';
    ELSE
        -- Obtener el orden máximo actual
        SELECT COALESCE(MAX(orden), 0) INTO max_orden
        FROM dashboard_medico_cards;

        -- Insertar la nueva card
        INSERT INTO dashboard_medico_cards (
            titulo,
            descripcion,
            link,
            icono,
            color,
            orden,
            activo,
            target_blank,
            created_at,
            updated_at
        ) VALUES (
            'Mi Disponibilidad',
            'Gestiona tus turnos mensuales',
            '/roles/medico/disponibilidad',
            'Calendar',
            '#10B981',  -- Verde
            max_orden + 1,
            true,
            false,
            NOW(),
            NOW()
        );

        RAISE NOTICE '✓ Card "Mi Disponibilidad" agregada exitosamente con orden %', max_orden + 1;
    END IF;
END $$;

-- ================================================================
-- VERIFICACIÓN
-- ================================================================
-- Mostrar todas las cards activas del dashboard médico
SELECT
    id,
    titulo,
    link,
    orden,
    activo
FROM dashboard_medico_cards
WHERE activo = true
ORDER BY orden ASC;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
-- Para ejecutar este script:
--
-- PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
--   -f spec/scripts/006_agregar_card_disponibilidad.sql
-- ================================================================
