-- Migracion de Modulo 107 a dim_solicitud_bolsa (v3.0.0)
-- Objetivo: Mover datos de bolsa_107_item a dim_solicitud_bolsa con id_bolsa = 107

-- Validaciones de precondicion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'dim_solicitud_bolsa'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tabla dim_solicitud_bolsa no existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'bolsa_107_item'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tabla bolsa_107_item no existe';
    END IF;

    RAISE NOTICE 'Validaciones completadas correctamente';
END $$;

-- Insertar datos de bolsa_107_item a dim_solicitud_bolsa
INSERT INTO public.dim_solicitud_bolsa (
    numero_solicitud,
    paciente_id,
    paciente_nombre,
    paciente_dni,
    paciente_sexo,
    paciente_telefono,
    paciente_email,
    fecha_nacimiento,
    especialidad,
    id_servicio,
    tipo_documento,
    tipo_cita,
    codigo_ipress,
    codigo_adscripcion,
    id_ipress,
    estado,
    estado_gestion_citas_id,
    fecha_solicitud,
    fecha_actualizacion,
    id_bolsa,
    activo
)
SELECT
    CONCAT('BOL107-', LPAD(b.id_carga::text, 6, '0'), '-', LPAD(CAST(row_number() OVER (PARTITION BY b.id_carga ORDER BY b.id_item) as text), 4, '0')),
    LPAD(COALESCE(b.numero_documento, ''), 20, '0')::varchar(20),
    COALESCE(NULLIF(trim(b.paciente), ''), 'SIN NOMBRE')::varchar(255),
    b.numero_documento::varchar(20),
    CASE WHEN b.sexo IN ('M', 'F') THEN b.sexo ELSE 'O' END::varchar(10),
    NULLIF(trim(b.telefono), '')::varchar(20),
    NULL,
    b.fecha_nacimiento,
    COALESCE(NULLIF(trim(b.derivacion_interna), ''), 'GENERAL')::varchar(255),
    COALESCE(b.id_servicio_essi, 1)::bigint,
    COALESCE(b.tipo_documento, 'DNI')::varchar(50),
    COALESCE(b.opcion_ingreso, 'VOLUNTARIA')::varchar(50),
    b.cod_servicio_essi::varchar(20),
    COALESCE(b.cod_servicio_essi, '0001')::varchar(20),
    NULL::bigint,
    'PENDIENTE'::varchar(20),
    1::bigint,
    COALESCE(b.created_at, NOW()),
    COALESCE(b.updated_at, NOW()),
    107::bigint,
    true
FROM
    public.bolsa_107_item b
WHERE
    b.numero_documento IS NOT NULL
    AND TRIM(b.numero_documento) != ''
    AND NOT EXISTS (
        SELECT 1 FROM dim_solicitud_bolsa ds
        WHERE ds.id_bolsa = 107
        AND ds.paciente_dni = b.numero_documento
    )
ON CONFLICT (numero_solicitud) DO NOTHING;

-- Crear indices de optimizacion
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_107_paciente_dni
    ON dim_solicitud_bolsa (id_bolsa, paciente_dni)
    WHERE id_bolsa = 107 AND activo = true;

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_107_fecha_solicitud
    ON dim_solicitud_bolsa (id_bolsa, fecha_solicitud DESC)
    WHERE id_bolsa = 107 AND activo = true;

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_107_estado
    ON dim_solicitud_bolsa (id_bolsa, estado_gestion_citas_id)
    WHERE id_bolsa = 107 AND activo = true;

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_107_ipress
    ON dim_solicitud_bolsa (id_bolsa, codigo_adscripcion)
    WHERE id_bolsa = 107 AND activo = true;

-- Analizar tabla para optimizacion
ANALYZE dim_solicitud_bolsa;

-- Mostrar estadisticas finales
SELECT
    'Modulo 107 - Estadisticas Post-Migracion' as REPORTE,
    COUNT(*) as Total_Registros,
    COUNT(CASE WHEN activo = true THEN 1 END) as Activos,
    COUNT(DISTINCT paciente_dni) as Pacientes_Unicos,
    MIN(fecha_solicitud) as Fecha_Mas_Antigua,
    MAX(fecha_solicitud) as Fecha_Mas_Reciente
FROM dim_solicitud_bolsa
WHERE id_bolsa = 107;
