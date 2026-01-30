-- ============================================================
-- V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql
-- Migración: Fusión del Módulo 107 con dim_solicitud_bolsa
-- Fecha: 2026-01-29
-- Descripción:
--   - Migra todos los pacientes de bolsa_107_item a dim_solicitud_bolsa con id_bolsa=107
--   - Mantiene tablas bolsa_107_carga y bolsa_107_error para auditoría
--   - Crea stored procedure v3 que inserta en dim_solicitud_bolsa
--   - Crea índice optimizado para consultas del Módulo 107
-- ============================================================

-- ============================================================
-- FASE 1: INSERCIÓN DE DATOS MIGRADOS
-- ============================================================

-- Migrar todos los pacientes de bolsa_107_item a dim_solicitud_bolsa
-- Mapeo de columnas:
--   bolsa_107_item.numero_documento -> paciente_dni
--   bolsa_107_item.paciente -> paciente_nombre
--   bolsa_107_item.sexo -> paciente_sexo
--   bolsa_107_item.fecha_nacimiento -> fecha_nacimiento
--   bolsa_107_item.telefono -> paciente_telefono
--   bolsa_107_item.tel_celular -> paciente_telefono_alterno
--   bolsa_107_item.correo_electronico -> paciente_email
--   bolsa_107_item.derivacion_interna -> especialidad
--   bolsa_107_item.cod_ipress -> codigo_adscripcion
--   bolsa_107_item.motivo_llamada -> (observaciones via estado_gestion_citas)

DO $$
DECLARE
  v_total_insertados INT := 0;
  v_total_errores INT := 0;
BEGIN
  -- Log: Inicio de migración
  RAISE NOTICE 'Iniciando migración de bolsa_107_item a dim_solicitud_bolsa...';

  -- Insertar pacientes migrados
  INSERT INTO dim_solicitud_bolsa (
    numero_solicitud,
    paciente_id,
    paciente_dni,
    paciente_nombre,
    tipo_documento,
    fecha_nacimiento,
    paciente_sexo,
    paciente_telefono,
    paciente_telefono_alterno,
    paciente_email,
    especialidad,
    codigo_adscripcion,
    codigo_ipress,
    id_bolsa,
    id_servicio,
    estado,
    estado_gestion_citas_id,
    fecha_solicitud,
    fecha_actualizacion,
    activo
  )
  SELECT
    CONCAT('BOL107-', b.id_carga, '-', b.id_item),        -- numero_solicitud
    b.numero_documento,                                     -- paciente_id
    b.numero_documento,                                     -- paciente_dni
    COALESCE(b.paciente, 'N/A'),                           -- paciente_nombre
    b.tipo_documento,                                       -- tipo_documento
    b.fecha_nacimiento,                                     -- fecha_nacimiento
    b.sexo,                                                 -- paciente_sexo
    b.telefono,                                             -- paciente_telefono
    b.tel_celular,                                          -- paciente_telefono_alterno
    b.correo_electronico,                                   -- paciente_email
    b.derivacion_interna,                                   -- especialidad
    b.cod_ipress,                                           -- codigo_adscripcion
    b.cod_ipress,                                           -- codigo_ipress
    107 AS id_bolsa,                                        -- BOLSA 107 constant
    COALESCE(b.id_servicio_essi, 1),                       -- id_servicio (default 1)
    'PENDIENTE',                                            -- estado
    1 AS estado_gestion_citas_id,                           -- PENDIENTE state
    b.created_at,                                           -- fecha_solicitud
    CURRENT_TIMESTAMP,                                      -- fecha_actualizacion
    true AS activo                                          -- activo
  FROM bolsa_107_item b
  WHERE NOT EXISTS (
    -- Verificar que no exista ya en dim_solicitud_bolsa
    SELECT 1 FROM dim_solicitud_bolsa dsb
    WHERE dsb.paciente_dni = b.numero_documento
      AND dsb.id_bolsa = 107
  )
  ON CONFLICT (numero_solicitud) DO NOTHING;  -- Skip duplicates if any

  GET DIAGNOSTICS v_total_insertados = ROW_COUNT;

  RAISE NOTICE 'Pacientes migrados: %', v_total_insertados;

  -- Verificación de integridad
  IF v_total_insertados > 0 THEN
    RAISE NOTICE '✅ Migración exitosa. % registros insertados', v_total_insertados;
  ELSE
    RAISE WARNING '⚠️  No se insertaron registros. Verifique los datos en bolsa_107_item';
  END IF;

END $$;

-- ============================================================
-- FASE 2: CREACIÓN DE ÍNDICES OPTIMIZADOS
-- ============================================================

-- Índice compuesto para búsquedas rápidas del Módulo 107
CREATE INDEX IF NOT EXISTS idx_modulo107_busqueda
  ON dim_solicitud_bolsa (id_bolsa, paciente_dni, especialidad, estado_gestion_citas_id)
  WHERE id_bolsa = 107 AND activo = true;

-- Índice para búsqueda por nombre
CREATE INDEX IF NOT EXISTS idx_modulo107_nombre
  ON dim_solicitud_bolsa (id_bolsa, paciente_nombre)
  WHERE id_bolsa = 107 AND activo = true;

-- Índice para fecha de solicitud (reportes temporales)
CREATE INDEX IF NOT EXISTS idx_modulo107_fecha
  ON dim_solicitud_bolsa (id_bolsa, fecha_solicitud DESC)
  WHERE id_bolsa = 107 AND activo = true;

-- Índice para código IPRESS
CREATE INDEX IF NOT EXISTS idx_modulo107_ipress
  ON dim_solicitud_bolsa (id_bolsa, codigo_adscripcion)
  WHERE id_bolsa = 107 AND activo = true;

-- ============================================================
-- FASE 3: CREAR STORED PROCEDURE v3
-- ============================================================

-- DROP IF EXISTS para permitir recreación
DROP PROCEDURE IF EXISTS fn_procesar_bolsa_107_v3(BIGINT);

-- Crear nueva versión que inserta en dim_solicitud_bolsa
CREATE OR REPLACE PROCEDURE fn_procesar_bolsa_107_v3(
    p_id_carga BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_ok INT := 0;
  v_total_error INT := 0;
  v_filas_afectadas INT;
  v_numero_solicitud VARCHAR(50);
  v_item RECORD;
BEGIN

  RAISE NOTICE 'Iniciando procesamiento de bolsa_107 v3 para id_carga=%', p_id_carga;

  -- Procesar cada fila de staging
  FOR v_item IN
    SELECT
      raw_id,
      numero_documento,
      paciente,
      sexo,
      fecha_nacimiento,
      telefono,
      tel_celular,
      correo_electronico,
      derivacion_interna,
      cod_ipress,
      id_servicio_essi,
      tipo_documento,
      departamento,
      provincia,
      distrito
    FROM staging.bolsa_107_raw
    WHERE id_carga = p_id_carga
  LOOP

    -- Generar número de solicitud único
    v_numero_solicitud := CONCAT('BOL107-', p_id_carga, '-', v_item.raw_id);

    -- Insertar en dim_solicitud_bolsa
    INSERT INTO dim_solicitud_bolsa (
      numero_solicitud,
      paciente_id,
      paciente_dni,
      paciente_nombre,
      tipo_documento,
      fecha_nacimiento,
      paciente_sexo,
      paciente_telefono,
      paciente_telefono_alterno,
      paciente_email,
      especialidad,
      codigo_adscripcion,
      codigo_ipress,
      id_bolsa,
      id_servicio,
      estado,
      estado_gestion_citas_id,
      fecha_solicitud,
      fecha_actualizacion,
      activo
    ) VALUES (
      v_numero_solicitud,
      v_item.numero_documento,
      v_item.numero_documento,
      COALESCE(v_item.paciente, 'N/A'),
      v_item.tipo_documento,
      v_item.fecha_nacimiento,
      v_item.sexo,
      v_item.telefono,
      v_item.tel_celular,
      v_item.correo_electronico,
      v_item.derivacion_interna,
      v_item.cod_ipress,
      v_item.cod_ipress,
      107,                                  -- BOLSA 107
      COALESCE(v_item.id_servicio_essi, 1),
      'PENDIENTE',
      1,                                    -- PENDIENTE state
      NOW(),
      NOW(),
      true
    )
    ON CONFLICT (numero_solicitud) DO NOTHING;

    GET DIAGNOSTICS v_filas_afectadas = ROW_COUNT;

    IF v_filas_afectadas > 0 THEN
      v_total_ok := v_total_ok + 1;
    ELSE
      v_total_error := v_total_error + 1;
    END IF;

  END LOOP;

  -- Log final
  RAISE NOTICE 'Procesamiento completado: OK=%, ERROR=%', v_total_ok, v_total_error;

END $$;

-- ============================================================
-- FASE 4: VERIFICACIÓN DE INTEGRIDAD
-- ============================================================

DO $$
DECLARE
  v_count_original BIGINT;
  v_count_migrado BIGINT;
  v_count_diferencia BIGINT;
BEGIN

  -- Contar registros originales
  SELECT COUNT(*) INTO v_count_original FROM bolsa_107_item;

  -- Contar registros migrados
  SELECT COUNT(*) INTO v_count_migrado
  FROM dim_solicitud_bolsa
  WHERE id_bolsa = 107 AND activo = true;

  v_count_diferencia := v_count_original - v_count_migrado;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          REPORTE DE MIGRACIÓN BOLSA 107 - v3.0            ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Registros en bolsa_107_item (original):    %', LPAD(v_count_original::TEXT, 10);
  RAISE NOTICE '║ Registros migrados a dim_solicitud_bolsa:  %', LPAD(v_count_migrado::TEXT, 10);
  RAISE NOTICE '║ Diferencia (pendiente migración):           %', LPAD(v_count_diferencia::TEXT, 10);
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  -- Validar estado de migración
  IF v_count_diferencia = 0 THEN
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA: Todos los registros fueron migrados exitosamente';
  ELSIF v_count_diferencia > 0 THEN
    RAISE WARNING '⚠️  MIGRACIÓN INCOMPLETA: % registros aún no fueron migrados', v_count_diferencia;
  END IF;

END $$;

-- ============================================================
-- FASE 5: NOTAS DE ROLLBACK
-- ============================================================
--
-- Para revertir esta migración, ejecutar:
--
-- BEGIN TRANSACTION;
--
-- -- Eliminar registros migrados de dim_solicitud_bolsa
-- DELETE FROM dim_solicitud_bolsa
-- WHERE id_bolsa = 107 AND numero_solicitud LIKE 'BOL107-%';
--
-- -- Eliminar índices nuevos
-- DROP INDEX IF EXISTS idx_modulo107_busqueda;
-- DROP INDEX IF EXISTS idx_modulo107_nombre;
-- DROP INDEX IF EXISTS idx_modulo107_fecha;
-- DROP INDEX IF EXISTS idx_modulo107_ipress;
--
-- -- Eliminar stored procedure v3
-- DROP PROCEDURE IF EXISTS fn_procesar_bolsa_107_v3(BIGINT);
--
-- COMMIT;
--
-- ============================================================
