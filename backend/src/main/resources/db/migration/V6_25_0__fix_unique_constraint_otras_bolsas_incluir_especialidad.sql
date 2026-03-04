-- v1.83.5: Fix constraint ux_solicitud_paciente_servicio_otras_bolsas
-- PROBLEMA: La migración V3_1_2 nunca se aplicó (conflicto de versión Flyway).
-- El constraint original bloqueaba: mismo paciente + misma bolsa + mismo servicio,
-- aunque tuvieran DISTINTA especialidad.
-- SOLUCIÓN: Reemplazar con constraint que incluya especialidad en la clave única.

-- Paso 1: Eliminar constraint antiguo (solo si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ux_solicitud_paciente_servicio_otras_bolsas'
  ) THEN
    ALTER TABLE dim_solicitud_bolsa
      DROP CONSTRAINT ux_solicitud_paciente_servicio_otras_bolsas;
    RAISE NOTICE 'Constraint antiguo eliminado';
  ELSE
    RAISE NOTICE 'Constraint antiguo ya no existe, nada que eliminar';
  END IF;
END;
$$;

-- Paso 2: Crear nuevo constraint que incluye especialidad
-- ANTES: UNIQUE(id_bolsa, paciente_id, id_servicio)
-- DESPUÉS: UNIQUE(id_bolsa, paciente_id, id_servicio, especialidad)
-- Esto permite: mismo paciente, misma bolsa, mismo servicio → SIEMPRE QUE sea distinta especialidad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ux_solicitud_paciente_servicio_especialidad_otras_bolsas'
  ) THEN
    ALTER TABLE dim_solicitud_bolsa
      ADD CONSTRAINT ux_solicitud_paciente_servicio_especialidad_otras_bolsas
      UNIQUE (id_bolsa, paciente_id, id_servicio, especialidad);
    RAISE NOTICE 'Nuevo constraint creado con especialidad incluida';
  ELSE
    RAISE NOTICE 'Nuevo constraint ya existe';
  END IF;
END;
$$;
