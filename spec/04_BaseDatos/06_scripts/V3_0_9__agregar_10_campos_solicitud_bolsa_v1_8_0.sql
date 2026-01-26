-- ============================================================================
-- 📋 Migración: Agregar 10 Campos para Carga de Excel Completa v1.8.0
-- Tabla: dim_solicitud_bolsa
-- Descripción: Integrar los 10 campos del formulario de carga desde Excel
-- Autor: Sistema CENATE
-- Fecha: 2026-01-25
-- Versión: v1.8.0
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar los 10 campos nuevos si no existen
-- ============================================================================

-- 1. FECHA PREFERIDA QUE NO FUE ATENDIDA (DATE)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS fecha_preferida_no_atendida DATE;

-- 2. TIPO DOCUMENTO (VARCHAR)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(50);

-- 3. DNI - Ya debe existir como paciente_dni, pero validaremos
-- Si no existe paciente_dni, la agregamos
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_dni VARCHAR(20);

-- 4. ASEGURADO (Nombres Completos) - Ya debe existir como paciente_nombre
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_nombre VARCHAR(255);

-- 5. SEXO (M/F)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(10);

-- 6. FECHA DE NACIMIENTO (DATE)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

-- 7. TELÉFONO - Ya debe existir como paciente_telefono
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_telefono VARCHAR(20);

-- 8. CORREO - Ya debe existir como paciente_email
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_email VARCHAR(255);

-- 9. CÓDIGO IPRESS ADSCRIPCIÓN
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS codigo_ipress VARCHAR(20);

-- 10. TIPO CITA (Recita, Interconsulta, Voluntaria)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS tipo_cita VARCHAR(50);

-- ============================================================================
-- PASO 2: Agregar Foreign Key para tipo_cita si aplica
-- ============================================================================

-- Crear tabla de catálogo de tipos de cita si no existe
CREATE TABLE IF NOT EXISTS public.dim_tipo_cita (
    id_tipo_cita BIGSERIAL PRIMARY KEY,
    codigo_tipo_cita VARCHAR(50) NOT NULL UNIQUE,
    descripcion_tipo_cita VARCHAR(255),
    estado CHAR(1) DEFAULT 'A', -- A: Activo, I: Inactivo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los tres tipos de cita si la tabla está vacía
INSERT INTO public.dim_tipo_cita (codigo_tipo_cita, descripcion_tipo_cita, estado)
VALUES
    ('Recita', 'Cita recurrente - Seguimiento de paciente', 'A'),
    ('Interconsulta', 'Interconsulta médica entre especialidades', 'A'),
    ('Voluntaria', 'Atención voluntaria del paciente', 'A')
ON CONFLICT (codigo_tipo_cita) DO NOTHING;

-- ============================================================================
-- PASO 3: Crear índices para los nuevos campos
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_fecha_preferida
ON public.dim_solicitud_bolsa(fecha_preferida_no_atendida);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_tipo_documento
ON public.dim_solicitud_bolsa(tipo_documento);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_dni
ON public.dim_solicitud_bolsa(paciente_dni);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_fecha_nacimiento
ON public.dim_solicitud_bolsa(fecha_nacimiento);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_codigo_ipress
ON public.dim_solicitud_bolsa(codigo_ipress);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_tipo_cita
ON public.dim_solicitud_bolsa(tipo_cita);

-- ============================================================================
-- PASO 4: Agregar columna para edad calculada (AUTO-CALCULADA)
-- ============================================================================

-- Edad se calcula desde fecha_nacimiento
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_edad INTEGER;

-- ============================================================================
-- PASO 5: Crear función para calcular edad automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_edad(fecha_nacimiento DATE)
RETURNS INTEGER AS $$
BEGIN
    IF fecha_nacimiento IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- PASO 6: Crear trigger para auto-calcular edad cuando se inserta/actualiza
-- ============================================================================

CREATE OR REPLACE FUNCTION actualizar_edad_solicitud()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL THEN
        NEW.paciente_edad := calcular_edad(NEW.fecha_nacimiento);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trigger_actualizar_edad ON public.dim_solicitud_bolsa;

-- Crear nuevo trigger
CREATE TRIGGER trigger_actualizar_edad
BEFORE INSERT OR UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION actualizar_edad_solicitud();

-- ============================================================================
-- PASO 7: Crear tabla de auditoría para carga de Excel v1.8.0
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_carga_excel_bolsa (
    id_auditoria BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    usuario_carga VARCHAR(255),
    fecha_preferida_no_atendida DATE,
    tipo_documento VARCHAR(50),
    paciente_dni VARCHAR(20),
    paciente_nombre VARCHAR(255),
    paciente_sexo VARCHAR(10),
    fecha_nacimiento DATE,
    paciente_telefono VARCHAR(20),
    paciente_email VARCHAR(255),
    codigo_ipress VARCHAR(20),
    tipo_cita VARCHAR(50),
    estado_carga VARCHAR(50), -- SUCCESS, ERROR, WARNING
    descripcion_error TEXT,
    timestamp_carga TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_carga_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_carga_solicitud
ON public.audit_carga_excel_bolsa(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_audit_carga_timestamp
ON public.audit_carga_excel_bolsa(timestamp_carga);

-- ============================================================================
-- PASO 8: Agregar comentarios a las columnas
-- ============================================================================

COMMENT ON COLUMN public.dim_solicitud_bolsa.fecha_preferida_no_atendida IS 'Fecha preferida que no fue atendida (YYYY-MM-DD)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.tipo_documento IS 'Tipo de documento (DNI, RUC, PASAPORTE, etc.)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_dni IS 'Número de documento (8 dígitos para DNI)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_nombre IS 'Nombres y apellidos completos del asegurado';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_sexo IS 'Sexo del paciente (M: Masculino, F: Femenino)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.fecha_nacimiento IS 'Fecha de nacimiento (YYYY-MM-DD)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_telefono IS 'Número de teléfono de contacto';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_email IS 'Dirección de correo electrónico';
COMMENT ON COLUMN public.dim_solicitud_bolsa.paciente_edad IS 'Edad calculada automáticamente desde fecha_nacimiento';
COMMENT ON COLUMN public.dim_solicitud_bolsa.codigo_ipress IS 'Código de IPRESS de adscripción del paciente';
COMMENT ON COLUMN public.dim_solicitud_bolsa.tipo_cita IS 'Tipo de cita: Recita, Interconsulta, Voluntaria';

-- ============================================================================
-- PASO 9: Validar integridad de datos
-- ============================================================================

-- Mostrar resumen de cambios
SELECT
    'Migración v1.8.0 - Campos de Carga Excel' AS tipo_cambio,
    COUNT(*) AS total_registros,
    COUNT(CASE WHEN fecha_preferida_no_atendida IS NOT NULL THEN 1 END) AS con_fecha_preferida,
    COUNT(CASE WHEN tipo_documento IS NOT NULL THEN 1 END) AS con_tipo_documento,
    COUNT(CASE WHEN paciente_dni IS NOT NULL THEN 1 END) AS con_dni,
    COUNT(CASE WHEN fecha_nacimiento IS NOT NULL THEN 1 END) AS con_fecha_nacimiento,
    COUNT(CASE WHEN tipo_cita IS NOT NULL THEN 1 END) AS con_tipo_cita
FROM public.dim_solicitud_bolsa;

-- ============================================================================
-- FIN MIGRACIÓN v1.8.0
-- ============================================================================
