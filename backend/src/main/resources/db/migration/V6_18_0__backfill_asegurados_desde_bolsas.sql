-- ============================================================================
-- V6_18_0: Backfill asegurados desde dim_solicitud_bolsa
-- Problema: Hay pacientes en dim_solicitud_bolsa que NO tienen registro
--           en la tabla asegurados. Esto ocurre porque:
--           a) Fueron cargados antes de v1.13.8 (que agregó auto-creación)
--           b) Fueron ingresados manualmente vía SQL/script
--           c) El UPSERT de asegurados falló silenciosamente durante la carga
--
-- Consecuencia: En /roles/profesionaldesalud/pacientes los campos
--           pkAsegurado, enfermedadesCronicas y teléfonos aparecen vacíos,
--           y la baja CENACRON no funciona para esos pacientes.
--
-- Solución: Insertar en asegurados los datos mínimos de cada paciente
--           que exista en dim_solicitud_bolsa pero no en asegurados.
--           Se usa ON CONFLICT DO NOTHING para no sobreescribir datos reales.
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─── PASO 1: Diagnóstico previo ──────────────────────────────────────────────
DO $$
DECLARE
    v_total_bolsa     INTEGER;
    v_sin_asegurado   INTEGER;
    v_pct             NUMERIC(5,2);
BEGIN
    SELECT COUNT(DISTINCT paciente_dni) INTO v_total_bolsa
    FROM dim_solicitud_bolsa
    WHERE paciente_dni IS NOT NULL
      AND TRIM(paciente_dni) <> '';

    SELECT COUNT(DISTINCT b.paciente_dni) INTO v_sin_asegurado
    FROM dim_solicitud_bolsa b
    LEFT JOIN asegurados a ON a.doc_paciente = b.paciente_dni
    WHERE b.paciente_dni IS NOT NULL
      AND TRIM(b.paciente_dni) <> ''
      AND a.pk_asegurado IS NULL;

    IF v_total_bolsa > 0 THEN
        v_pct := ROUND((v_sin_asegurado::NUMERIC / v_total_bolsa) * 100, 2);
    ELSE
        v_pct := 0;
    END IF;

    RAISE NOTICE 'V6_18_0 DIAGNÓSTICO:';
    RAISE NOTICE '  DNIs únicos en dim_solicitud_bolsa : %', v_total_bolsa;
    RAISE NOTICE '  DNIs sin registro en asegurados    : % (% %%)', v_sin_asegurado, v_pct;
END $$;

-- ─── PASO 2: Insertar asegurados faltantes con datos mínimos ─────────────────
-- Toma el registro MÁS RECIENTE de dim_solicitud_bolsa para cada DNI
-- (el que tiene mayor id_solicitud) para obtener el nombre y teléfono más actualizado.
-- ON CONFLICT DO NOTHING garantiza que no se toca ningún asegurado existente.
INSERT INTO asegurados (
    pk_asegurado,
    doc_paciente,
    paciente,
    sexo,
    tel_celular,
    cas_adscripcion,
    vigencia
)
SELECT DISTINCT ON (b.paciente_dni)
    b.paciente_dni                           AS pk_asegurado,
    b.paciente_dni                           AS doc_paciente,
    COALESCE(NULLIF(TRIM(b.paciente_nombre), ''), 'Paciente ' || b.paciente_dni) AS paciente,
    UPPER(TRIM(b.paciente_sexo))             AS sexo,
    NULLIF(TRIM(b.paciente_telefono), '')    AS tel_celular,
    NULLIF(TRIM(b.codigo_ipress), '')            AS cas_adscripcion,
    TRUE                                     AS vigencia
FROM dim_solicitud_bolsa b
LEFT JOIN asegurados a ON a.doc_paciente = b.paciente_dni
WHERE b.paciente_dni IS NOT NULL
  AND TRIM(b.paciente_dni) <> ''
  AND a.pk_asegurado IS NULL
ORDER BY b.paciente_dni, b.id_solicitud DESC
ON CONFLICT (pk_asegurado) DO NOTHING;

-- ─── PASO 3: Verificación final ──────────────────────────────────────────────
DO $$
DECLARE
    v_restantes   INTEGER;
    v_insertados  INTEGER;
BEGIN
    SELECT COUNT(DISTINCT b.paciente_dni) INTO v_restantes
    FROM dim_solicitud_bolsa b
    LEFT JOIN asegurados a ON a.doc_paciente = b.paciente_dni
    WHERE b.paciente_dni IS NOT NULL
      AND TRIM(b.paciente_dni) <> ''
      AND a.pk_asegurado IS NULL;

    RAISE NOTICE 'V6_18_0 RESULTADO:';
    RAISE NOTICE '  DNIs sin asegurado restantes: %', v_restantes;

    IF v_restantes = 0 THEN
        RAISE NOTICE '  ✅ Todos los pacientes de dim_solicitud_bolsa tienen registro en asegurados';
    ELSE
        RAISE WARNING '  ⚠️  % DNIs siguen sin asegurado (pueden ser DNIs inválidos o no numéricos)', v_restantes;
    END IF;
END $$;
