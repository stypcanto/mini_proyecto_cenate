-- ==============================================================================
-- Script: 025_crear_modulo_trazabilidad_clinica.sql
-- Proyecto: CENATE - Sistema de Telemedicina
-- Versión: 2.0.0
-- Fecha: 2026-01-03
-- Autor: Claude Code + Styp Canto Rondón
--
-- Descripción: Creación del módulo completo de trazabilidad clínica de asegurados
--              Incluye: 3 tablas nuevas, 9 índices, 2 triggers, permisos MBAC
--
-- Ejecución:
--   PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
--     -f spec/04_BaseDatos/06_scripts/025_crear_modulo_trazabilidad_clinica.sql
-- ==============================================================================

\echo '=================================='
\echo 'INICIANDO CREACIÓN DE MÓDULO DE TRAZABILIDAD CLÍNICA'
\echo '=================================='

-- ==============================================================================
-- TABLA 1: dim_estrategia_institucional (Catálogo)
-- ==============================================================================

\echo ''
\echo '📋 Creando tabla: dim_estrategia_institucional'

CREATE TABLE IF NOT EXISTS public.dim_estrategia_institucional (
    id_estrategia BIGSERIAL PRIMARY KEY,
    cod_estrategia VARCHAR(20) NOT NULL UNIQUE,
    desc_estrategia VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL UNIQUE,
    estado VARCHAR(1) NOT NULL DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_estrategia_estado CHECK (estado IN ('A', 'I')),
    CONSTRAINT ck_estrategia_cod_trim CHECK (BTRIM(cod_estrategia) <> ''),
    CONSTRAINT ck_estrategia_desc_trim CHECK (BTRIM(desc_estrategia) <> ''),
    CONSTRAINT ck_estrategia_sigla_trim CHECK (BTRIM(sigla) <> '')
);

COMMENT ON TABLE public.dim_estrategia_institucional IS 'Catálogo de estrategias institucionales de EsSalud (CENATE, CENACRON, CENAPSI, etc.)';
COMMENT ON COLUMN public.dim_estrategia_institucional.id_estrategia IS 'ID único de la estrategia';
COMMENT ON COLUMN public.dim_estrategia_institucional.cod_estrategia IS 'Código único de la estrategia (EST-001, EST-002, etc.)';
COMMENT ON COLUMN public.dim_estrategia_institucional.desc_estrategia IS 'Descripción completa de la estrategia';
COMMENT ON COLUMN public.dim_estrategia_institucional.sigla IS 'Sigla o acrónimo de la estrategia';
COMMENT ON COLUMN public.dim_estrategia_institucional.estado IS 'Estado: A = Activo, I = Inactivo';

-- Insertar datos iniciales
\echo '  ├─ Insertando datos iniciales...'
INSERT INTO public.dim_estrategia_institucional (cod_estrategia, desc_estrategia, sigla, estado)
VALUES
    ('EST-001', 'Centro Nacional de Telemedicina', 'CENATE', 'A'),
    ('EST-002', 'CENACRON', 'CENACRON', 'A'),
    ('EST-003', 'Centro Nacional de Atención Psicológica', 'CENAPSI', 'A'),
    ('EST-004', 'Centro Nacional de Salud Materno Infantil', 'CENASMI', 'A'),
    ('EST-005', 'Programa de Diabetes e Hipertensión', 'PDIAH', 'A'),
    ('EST-006', 'Programa de Atención Domiciliaria', 'PADOMI', 'A'),
    ('EST-007', 'Programa de Salud del Adulto Mayor', 'PROSAM', 'A')
ON CONFLICT (cod_estrategia) DO NOTHING;

-- Índices
\echo '  ├─ Creando índices...'
CREATE INDEX IF NOT EXISTS idx_estrategia_estado
    ON public.dim_estrategia_institucional(estado)
    WHERE estado = 'A';

CREATE INDEX IF NOT EXISTS idx_estrategia_sigla
    ON public.dim_estrategia_institucional(sigla);

\echo '  └─ ✅ Tabla dim_estrategia_institucional creada'

-- ==============================================================================
-- TABLA 2: dim_tipo_atencion_telemedicina (Catálogo)
-- ==============================================================================

\echo ''
\echo '📋 Creando tabla: dim_tipo_atencion_telemedicina'

CREATE TABLE IF NOT EXISTS public.dim_tipo_atencion_telemedicina (
    id_tipo_atencion BIGSERIAL PRIMARY KEY,
    cod_tipo_atencion VARCHAR(20) NOT NULL UNIQUE,
    desc_tipo_atencion VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    requiere_profesional BOOLEAN NOT NULL DEFAULT TRUE,
    estado VARCHAR(1) NOT NULL DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_tipo_atencion_estado CHECK (estado IN ('A', 'I')),
    CONSTRAINT ck_tipo_atencion_cod_trim CHECK (BTRIM(cod_tipo_atencion) <> ''),
    CONSTRAINT ck_tipo_atencion_desc_trim CHECK (BTRIM(desc_tipo_atencion) <> ''),
    CONSTRAINT ck_tipo_atencion_sigla_trim CHECK (BTRIM(sigla) <> '')
);

COMMENT ON TABLE public.dim_tipo_atencion_telemedicina IS 'Catálogo de tipos de atención en telemedicina';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.id_tipo_atencion IS 'ID único del tipo de atención';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.cod_tipo_atencion IS 'Código único del tipo de atención (TAT-001, TAT-002, etc.)';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.desc_tipo_atencion IS 'Descripción completa del tipo de atención';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.sigla IS 'Sigla del tipo de atención (TELCONSULTA, TELMONIT, etc.)';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.requiere_profesional IS 'Indica si requiere profesional de salud';
COMMENT ON COLUMN public.dim_tipo_atencion_telemedicina.estado IS 'Estado: A = Activo, I = Inactivo';

-- Insertar datos iniciales
\echo '  ├─ Insertando datos iniciales...'
INSERT INTO public.dim_tipo_atencion_telemedicina (cod_tipo_atencion, desc_tipo_atencion, sigla, requiere_profesional, estado)
VALUES
    ('TAT-001', 'Teleconsulta Médica', 'TELCONSULTA', TRUE, 'A'),
    ('TAT-002', 'Telemonitoreo de Paciente', 'TELMONIT', TRUE, 'A'),
    ('TAT-003', 'Teleinterconsulta Especializada', 'TELINTERC', TRUE, 'A'),
    ('TAT-004', 'Teleapoyo al Diagnóstico', 'TELAPOYO', TRUE, 'A'),
    ('TAT-005', 'Orientación Telefónica', 'ORIENT-TEL', FALSE, 'A'),
    ('TAT-006', 'Seguimiento Post-Atención', 'SEGUIM', TRUE, 'A')
ON CONFLICT (cod_tipo_atencion) DO NOTHING;

-- Índices
\echo '  ├─ Creando índices...'
CREATE INDEX IF NOT EXISTS idx_tipo_atencion_estado
    ON public.dim_tipo_atencion_telemedicina(estado)
    WHERE estado = 'A';

CREATE INDEX IF NOT EXISTS idx_tipo_atencion_sigla
    ON public.dim_tipo_atencion_telemedicina(sigla);

\echo '  └─ ✅ Tabla dim_tipo_atencion_telemedicina creada'

-- ==============================================================================
-- TABLA 3: atencion_clinica (Tabla Principal)
-- ==============================================================================

\echo ''
\echo '📋 Creando tabla: atencion_clinica'

CREATE TABLE IF NOT EXISTS public.atencion_clinica (
    -- CLAVE PRIMARIA
    id_atencion BIGSERIAL PRIMARY KEY,

    -- DATOS DE ATENCIÓN
    pk_asegurado VARCHAR(50) NOT NULL,
    fecha_atencion TIMESTAMP WITH TIME ZONE NOT NULL,
    id_ipress BIGINT NOT NULL,
    id_especialidad BIGINT,
    id_servicio BIGINT,

    -- DATOS CLÍNICOS
    motivo_consulta TEXT,
    antecedentes TEXT,
    diagnostico TEXT,
    resultados_clinicos TEXT,
    observaciones_generales TEXT,
    datos_seguimiento TEXT,

    -- SIGNOS VITALES
    presion_arterial VARCHAR(20),
    temperatura DECIMAL(4,1),
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    imc DECIMAL(5,2),
    saturacion_o2 INTEGER,
    frecuencia_cardiaca INTEGER,
    frecuencia_respiratoria INTEGER,

    -- ETIQUETAS DE TRAZABILIDAD
    id_estrategia BIGINT,
    id_tipo_atencion BIGINT NOT NULL,

    -- INTERCONSULTA
    tiene_orden_interconsulta BOOLEAN NOT NULL DEFAULT FALSE,
    id_especialidad_interconsulta BIGINT,
    modalidad_interconsulta VARCHAR(20),

    -- TELEMONITOREO
    requiere_telemonitoreo BOOLEAN NOT NULL DEFAULT FALSE,

    -- AUDITORÍA
    id_personal_creador BIGINT NOT NULL,
    id_personal_modificador BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- FOREIGN KEYS
    CONSTRAINT fk_atencion_asegurado
        FOREIGN KEY (pk_asegurado)
        REFERENCES asegurados(pk_asegurado)
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_ipress
        FOREIGN KEY (id_ipress)
        REFERENCES dim_ipress(id_ipress)
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_especialidad
        FOREIGN KEY (id_especialidad)
        REFERENCES dim_servicio_essi(id_servicio)
        ON DELETE SET NULL,

    CONSTRAINT fk_atencion_especialidad_interc
        FOREIGN KEY (id_especialidad_interconsulta)
        REFERENCES dim_servicio_essi(id_servicio)
        ON DELETE SET NULL,

    CONSTRAINT fk_atencion_estrategia
        FOREIGN KEY (id_estrategia)
        REFERENCES dim_estrategia_institucional(id_estrategia)
        ON DELETE SET NULL,

    CONSTRAINT fk_atencion_tipo_atencion
        FOREIGN KEY (id_tipo_atencion)
        REFERENCES dim_tipo_atencion_telemedicina(id_tipo_atencion)
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_personal_creador
        FOREIGN KEY (id_personal_creador)
        REFERENCES dim_personal_cnt(id_pers)
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_personal_modificador
        FOREIGN KEY (id_personal_modificador)
        REFERENCES dim_personal_cnt(id_pers)
        ON DELETE SET NULL,

    -- VALIDACIONES DE NEGOCIO
    CONSTRAINT ck_modalidad_interconsulta
        CHECK (modalidad_interconsulta IS NULL OR modalidad_interconsulta IN ('PRESENCIAL', 'VIRTUAL')),

    CONSTRAINT ck_interconsulta_coherencia
        CHECK (
            (tiene_orden_interconsulta = FALSE AND id_especialidad_interconsulta IS NULL AND modalidad_interconsulta IS NULL)
            OR
            (tiene_orden_interconsulta = TRUE AND id_especialidad_interconsulta IS NOT NULL AND modalidad_interconsulta IS NOT NULL)
        ),

    CONSTRAINT ck_signos_vitales_rango
        CHECK (
            (temperatura IS NULL OR (temperatura >= 30.0 AND temperatura <= 45.0)) AND
            (saturacion_o2 IS NULL OR (saturacion_o2 >= 0 AND saturacion_o2 <= 100)) AND
            (frecuencia_cardiaca IS NULL OR (frecuencia_cardiaca >= 30 AND frecuencia_cardiaca <= 250)) AND
            (frecuencia_respiratoria IS NULL OR (frecuencia_respiratoria >= 8 AND frecuencia_respiratoria <= 60)) AND
            (peso_kg IS NULL OR (peso_kg > 0 AND peso_kg <= 300)) AND
            (talla_cm IS NULL OR (talla_cm > 0 AND talla_cm <= 250)) AND
            (imc IS NULL OR (imc > 0 AND imc <= 70))
        )
);

COMMENT ON TABLE public.atencion_clinica IS 'Registro de atenciones clínicas de telemedicina para asegurados';
COMMENT ON COLUMN public.atencion_clinica.id_atencion IS 'ID único de la atención';
COMMENT ON COLUMN public.atencion_clinica.pk_asegurado IS 'ID del asegurado (FK a asegurados)';
COMMENT ON COLUMN public.atencion_clinica.fecha_atencion IS 'Fecha y hora de la atención';
COMMENT ON COLUMN public.atencion_clinica.id_ipress IS 'IPRESS donde se realizó la atención';
COMMENT ON COLUMN public.atencion_clinica.id_especialidad IS 'Especialidad médica de la atención';
COMMENT ON COLUMN public.atencion_clinica.motivo_consulta IS 'Motivo de la consulta médica';
COMMENT ON COLUMN public.atencion_clinica.diagnostico IS 'Diagnóstico médico';
COMMENT ON COLUMN public.atencion_clinica.imc IS 'Índice de Masa Corporal (calculado automáticamente por trigger)';
COMMENT ON COLUMN public.atencion_clinica.tiene_orden_interconsulta IS 'Indica si se emitió orden de interconsulta';
COMMENT ON COLUMN public.atencion_clinica.modalidad_interconsulta IS 'PRESENCIAL o VIRTUAL';
COMMENT ON COLUMN public.atencion_clinica.requiere_telemonitoreo IS 'Indica si requiere seguimiento por telemonitoreo';
COMMENT ON COLUMN public.atencion_clinica.id_personal_creador IS 'Profesional que registró la atención';

-- Índices para Performance
\echo '  ├─ Creando índices de performance...'

-- Búsqueda por asegurado (más común)
CREATE INDEX IF NOT EXISTS idx_atencion_asegurado
    ON atencion_clinica(pk_asegurado, fecha_atencion DESC);

-- Búsqueda por profesional creador
CREATE INDEX IF NOT EXISTS idx_atencion_personal_creador
    ON atencion_clinica(id_personal_creador, fecha_atencion DESC);

-- Búsqueda por IPRESS
CREATE INDEX IF NOT EXISTS idx_atencion_ipress
    ON atencion_clinica(id_ipress, fecha_atencion DESC);

-- Búsqueda por fecha
CREATE INDEX IF NOT EXISTS idx_atencion_fecha
    ON atencion_clinica(fecha_atencion DESC);

-- Reportes por estrategia
CREATE INDEX IF NOT EXISTS idx_atencion_estrategia
    ON atencion_clinica(id_estrategia, fecha_atencion DESC)
    WHERE id_estrategia IS NOT NULL;

-- Reportes por tipo de atención
CREATE INDEX IF NOT EXISTS idx_atencion_tipo
    ON atencion_clinica(id_tipo_atencion, fecha_atencion DESC);

-- Atenciones con interconsulta
CREATE INDEX IF NOT EXISTS idx_atencion_interconsulta
    ON atencion_clinica(tiene_orden_interconsulta)
    WHERE tiene_orden_interconsulta = TRUE;

-- Atenciones con telemonitoreo
CREATE INDEX IF NOT EXISTS idx_atencion_telemonitoreo
    ON atencion_clinica(requiere_telemonitoreo)
    WHERE requiere_telemonitoreo = TRUE;

-- Paginación eficiente
CREATE INDEX IF NOT EXISTS idx_atencion_paginate
    ON atencion_clinica(id_atencion DESC, fecha_atencion DESC);

\echo '  └─ ✅ Tabla atencion_clinica creada con 9 índices'

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

\echo ''
\echo '⚙️  Creando triggers...'

-- Trigger 1: Calcular IMC automáticamente
\echo '  ├─ Trigger: calcular_imc_atencion'
CREATE OR REPLACE FUNCTION calcular_imc_atencion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.peso_kg IS NOT NULL AND NEW.talla_cm IS NOT NULL AND NEW.talla_cm > 0 THEN
        NEW.imc := ROUND((NEW.peso_kg / POWER(NEW.talla_cm / 100.0, 2))::NUMERIC, 2);
    ELSE
        NEW.imc := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_imc_atencion ON atencion_clinica;
CREATE TRIGGER trg_calcular_imc_atencion
    BEFORE INSERT OR UPDATE OF peso_kg, talla_cm ON atencion_clinica
    FOR EACH ROW EXECUTE FUNCTION calcular_imc_atencion();

-- Trigger 2: Actualizar updated_at automáticamente
\echo '  ├─ Trigger: actualizar_timestamp_atencion'
CREATE OR REPLACE FUNCTION actualizar_timestamp_atencion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_timestamp_atencion ON atencion_clinica;
CREATE TRIGGER trg_actualizar_timestamp_atencion
    BEFORE UPDATE ON atencion_clinica
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_atencion();

\echo '  └─ ✅ 2 triggers creados'

-- ==============================================================================
-- PERMISOS MBAC
-- ==============================================================================

\echo ''
\echo '🔐 Configurando permisos MBAC...'

-- Insertar páginas en modulos_sistema_paginas
\echo '  ├─ Insertando páginas del módulo...'

-- Página 1: Atenciones Clínicas (para MEDICO, COORDINADOR, ENFERMERIA, ADMIN, SUPERADMIN)
INSERT INTO public.modulos_sistema_paginas (id_modulo, nombre_pagina, ruta_pagina, icono, orden)
SELECT
    41, -- Coordinador de Gestión de Citas
    'Atenciones Clínicas',
    '/atenciones-clinicas',
    'FileText',
    8
WHERE NOT EXISTS (
    SELECT 1 FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/atenciones-clinicas'
);

-- Página 2: Estrategias Institucionales (solo ADMIN, SUPERADMIN)
INSERT INTO public.modulos_sistema_paginas (id_modulo, nombre_pagina, ruta_pagina, icono, orden)
SELECT
    2, -- Administración
    'Estrategias Institucionales',
    '/admin/estrategias-institucionales',
    'Briefcase',
    11
WHERE NOT EXISTS (
    SELECT 1 FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/admin/estrategias-institucionales'
);

-- Página 3: Tipos de Atención Telemedicina (solo ADMIN, SUPERADMIN)
INSERT INTO public.modulos_sistema_paginas (id_modulo, nombre_pagina, ruta_pagina, icono, orden)
SELECT
    2, -- Administración
    'Tipos de Atención Telemedicina',
    '/admin/tipos-atencion-telemedicina',
    'Stethoscope',
    12
WHERE NOT EXISTS (
    SELECT 1 FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/admin/tipos-atencion-telemedicina'
);

-- Configurar permisos por rol
\echo '  ├─ Configurando permisos por rol...'

DO $$
DECLARE
    v_id_pagina_atenciones BIGINT;
    v_id_pagina_estrategias BIGINT;
    v_id_pagina_tipos_atencion BIGINT;
    v_id_rol_medico BIGINT;
    v_id_rol_coordinador BIGINT;
    v_id_rol_enfermeria BIGINT;
    v_id_rol_admin BIGINT;
    v_id_rol_superadmin BIGINT;
BEGIN
    -- Obtener IDs de páginas
    SELECT id_pagina INTO v_id_pagina_atenciones
    FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/atenciones-clinicas';

    SELECT id_pagina INTO v_id_pagina_estrategias
    FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/admin/estrategias-institucionales';

    SELECT id_pagina INTO v_id_pagina_tipos_atencion
    FROM public.modulos_sistema_paginas
    WHERE ruta_pagina = '/admin/tipos-atencion-telemedicina';

    -- Obtener IDs de roles
    SELECT id_rol INTO v_id_rol_medico FROM public.dim_roles WHERE nombre_rol = 'MEDICO';
    SELECT id_rol INTO v_id_rol_coordinador FROM public.dim_roles WHERE nombre_rol = 'COORDINADOR';
    SELECT id_rol INTO v_id_rol_enfermeria FROM public.dim_roles WHERE nombre_rol = 'ENFERMERIA';
    SELECT id_rol INTO v_id_rol_admin FROM public.dim_roles WHERE nombre_rol = 'ADMIN';
    SELECT id_rol INTO v_id_rol_superadmin FROM public.dim_roles WHERE nombre_rol = 'SUPERADMIN';

    -- PERMISOS: Atenciones Clínicas

    -- MEDICO: Ver, Crear, Editar, Exportar (solo sus atenciones)
    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_atenciones, v_id_rol_medico, TRUE, TRUE, TRUE, FALSE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = FALSE, puede_exportar = TRUE;

    -- COORDINADOR: Ver, Exportar (solo lectura + reportes)
    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_atenciones, v_id_rol_coordinador, TRUE, FALSE, FALSE, FALSE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = FALSE, puede_editar = FALSE, puede_eliminar = FALSE, puede_exportar = TRUE;

    -- ENFERMERIA: Ver, Editar (agregar observaciones)
    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_atenciones, v_id_rol_enfermeria, TRUE, FALSE, TRUE, FALSE, FALSE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = FALSE, puede_editar = TRUE, puede_eliminar = FALSE, puede_exportar = FALSE;

    -- ADMIN: Todos los permisos
    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_atenciones, v_id_rol_admin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

    -- SUPERADMIN: Todos los permisos
    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_atenciones, v_id_rol_superadmin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

    -- PERMISOS: Estrategias Institucionales (solo ADMIN y SUPERADMIN)

    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_estrategias, v_id_rol_admin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_estrategias, v_id_rol_superadmin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

    -- PERMISOS: Tipos de Atención Telemedicina (solo ADMIN y SUPERADMIN)

    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_tipos_atencion, v_id_rol_admin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

    INSERT INTO public.permisos_pagina_rol (id_pagina, id_rol, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
    VALUES (v_id_pagina_tipos_atencion, v_id_rol_superadmin, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_pagina, id_rol) DO UPDATE SET
        puede_ver = TRUE, puede_crear = TRUE, puede_editar = TRUE, puede_eliminar = TRUE, puede_exportar = TRUE;

END $$;

\echo '  └─ ✅ Permisos MBAC configurados'

-- ==============================================================================
-- VERIFICACIÓN
-- ==============================================================================

\echo ''
\echo '🔍 Verificando objetos creados...'

DO $$
DECLARE
    v_count_estrategias INT;
    v_count_tipos_atencion INT;
    v_count_indices INT;
    v_count_triggers INT;
BEGIN
    -- Verificar datos iniciales
    SELECT COUNT(*) INTO v_count_estrategias FROM dim_estrategia_institucional WHERE estado = 'A';
    SELECT COUNT(*) INTO v_count_tipos_atencion FROM dim_tipo_atencion_telemedicina WHERE estado = 'A';

    -- Verificar índices
    SELECT COUNT(*) INTO v_count_indices
    FROM pg_indexes
    WHERE tablename IN ('dim_estrategia_institucional', 'dim_tipo_atencion_telemedicina', 'atencion_clinica');

    -- Verificar triggers
    SELECT COUNT(*) INTO v_count_triggers
    FROM pg_trigger
    WHERE tgname IN ('trg_calcular_imc_atencion', 'trg_actualizar_timestamp_atencion');

    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'RESUMEN DE VERIFICACIÓN';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Estrategias institucionales activas: %', v_count_estrategias;
    RAISE NOTICE '✅ Tipos de atención activos: %', v_count_tipos_atencion;
    RAISE NOTICE '✅ Índices creados: %', v_count_indices;
    RAISE NOTICE '✅ Triggers creados: %', v_count_triggers;
    RAISE NOTICE '';

    IF v_count_estrategias = 7 AND v_count_tipos_atencion = 6 AND v_count_triggers = 2 THEN
        RAISE NOTICE '🎉 MÓDULO DE TRAZABILIDAD CLÍNICA CREADO EXITOSAMENTE';
    ELSE
        RAISE WARNING '⚠️  Algunos objetos no se crearon correctamente. Revisar logs.';
    END IF;
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ==============================================================================
-- FIN DEL SCRIPT
-- ==============================================================================

\echo ''
\echo '=================================='
\echo 'SCRIPT COMPLETADO'
\echo '=================================='
\echo ''
\echo 'Siguiente paso: Crear modelos JPA en backend'
\echo ''
