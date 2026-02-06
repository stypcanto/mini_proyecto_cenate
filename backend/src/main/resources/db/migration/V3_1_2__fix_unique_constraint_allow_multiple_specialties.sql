-- v1.46.6: Permitir múltiples especialidades para el mismo paciente en la misma bolsa
-- FIX: Cambiar constraint UNIQUE para permitir múltiples registros del mismo paciente 
-- con diferentes especialidades

-- Paso 1: Eliminar el constraint antiguo
ALTER TABLE dim_solicitud_bolsa
  DROP CONSTRAINT ux_solicitud_paciente_servicio_otras_bolsas;

-- Paso 2: Crear nuevo constraint que INCLUYA especialidad
ALTER TABLE dim_solicitud_bolsa
  ADD CONSTRAINT ux_solicitud_paciente_servicio_especialidad_otras_bolsas 
  UNIQUE (id_bolsa, paciente_id, id_servicio, especialidad);

-- Resultado:
-- ANTES: Un paciente con el mismo servicio NO podía tener 2 registros (incluso con diferentes especialidades)
-- DESPUÉS: Un paciente con el mismo servicio PUEDE tener múltiples registros si tienen especialidades diferentes
-- 
-- Ejemplo (AHORA PERMITIDO):
-- - Paciente 45678904, Servicio 1, Bolsa 10, CARDIOLOGIA
-- - Paciente 45678904, Servicio 1, Bolsa 10, NEUROLOGIA  ✅ (antes: ERROR, ahora: OK)
