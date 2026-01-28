-- ============================================================================
-- 📋 TABLA: audit_errores_importacion_bolsa
-- ============================================================================
-- Propósito: Auditoría de errores durante importación de Excel
-- Versión: v2.1.0
-- Fecha: 2026-01-28
-- ============================================================================

-- Crear tabla de auditoría de errores
CREATE TABLE IF NOT EXISTS audit_errores_importacion_bolsa (
    id_error BIGSERIAL PRIMARY KEY,

    -- Relación con historial de carga
    id_carga_historial BIGINT NOT NULL,
    CONSTRAINT fk_audit_errores_historial
        FOREIGN KEY (id_carga_historial)
        REFERENCES dim_historial_carga_bolsas(id_carga)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Ubicación del error
    numero_fila INTEGER NOT NULL,

    -- Datos del paciente
    dni_paciente VARCHAR(20),
    nombre_paciente VARCHAR(255),

    -- Datos clínicos
    especialidad VARCHAR(255),
    ipress VARCHAR(20),

    -- Tipo y descripción del error
    tipo_error VARCHAR(50) NOT NULL,  -- DUPLICADO|VALIDACION|CONSTRAINT|OTRO
    descripcion_error TEXT NOT NULL,

    -- Datos completos del Excel en JSON
    datos_excel_json JSONB,

    -- Auditoría
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Índices
    CONSTRAINT chk_tipo_error CHECK (tipo_error IN ('DUPLICADO', 'VALIDACION', 'CONSTRAINT', 'OTRO'))
);

-- Crear índices para optimización de búsquedas
CREATE INDEX idx_audit_errores_id_carga
    ON audit_errores_importacion_bolsa(id_carga_historial);

CREATE INDEX idx_audit_errores_tipo
    ON audit_errores_importacion_bolsa(tipo_error);

CREATE INDEX idx_audit_errores_fecha
    ON audit_errores_importacion_bolsa(fecha_creacion DESC);

CREATE INDEX idx_audit_errores_dni
    ON audit_errores_importacion_bolsa(dni_paciente);

CREATE INDEX idx_audit_errores_nombre
    ON audit_errores_importacion_bolsa(nombre_paciente);

-- ============================================================================
-- COMENTARIOS INFORMATIVOS
-- ============================================================================

COMMENT ON TABLE audit_errores_importacion_bolsa IS
    'Auditoría de errores durante importación de solicitudes desde Excel.
     Registra todos los errores (duplicados, validación, constraints)
     y los vincula al historial de carga específico.';

COMMENT ON COLUMN audit_errores_importacion_bolsa.id_error IS
    'Identificador único del error registrado.';

COMMENT ON COLUMN audit_errores_importacion_bolsa.id_carga_historial IS
    'FK a dim_historial_carga_bolsas para vincular error a la importación específica.';

COMMENT ON COLUMN audit_errores_importacion_bolsa.numero_fila IS
    'Número de fila del Excel donde ocurrió el error (comenzando en 2, ya que 1 es header).';

COMMENT ON COLUMN audit_errores_importacion_bolsa.tipo_error IS
    'Tipo de error:
     - DUPLICADO: Solicitud ya existe (mismo bolsa+paciente+servicio)
     - VALIDACION: Error en validación de datos (formato, requeridos, etc)
     - CONSTRAINT: Error de integridad referencial (FK no existe, UNIQUE, etc)
     - OTRO: Errores no categorizados';

COMMENT ON COLUMN audit_errores_importacion_bolsa.descripcion_error IS
    'Descripción detallada del error en español para que el usuario entienda qué pasó.';

COMMENT ON COLUMN audit_errores_importacion_bolsa.datos_excel_json IS
    'JSON con todos los 11 campos del Excel de esa fila,
     para poder revisar completamente la información y hacer debugging.';

-- ============================================================================
-- EJEMPLO DE INSERCIÓN
-- ============================================================================

-- INSERT INTO audit_errores_importacion_bolsa (
--     id_carga_historial, numero_fila, dni_paciente, nombre_paciente,
--     especialidad, ipress, tipo_error, descripcion_error, datos_excel_json
-- ) VALUES (
--     105, 23, '12345678', 'Juan García López',
--     'PEDIATRÍA', '021', 'DUPLICADO',
--     'Solicitud duplicada. Bolsa: Bolsa Pediatría, Paciente: 12345678, Servicio: PEDIATRÍA. ID anterior: 4521',
--     '{"pacienteId": "12345678", "nombre": "Juan García", ...}'::jsonb
-- );

-- ============================================================================
-- VALIDACIÓN
-- ============================================================================

-- Verificar que la tabla fue creada correctamente
-- SELECT * FROM audit_errores_importacion_bolsa LIMIT 1;

-- Ver estructura de la tabla
-- \d audit_errores_importacion_bolsa;

-- Ver índices creados
-- SELECT indexname FROM pg_indexes WHERE tablename = 'audit_errores_importacion_bolsa';
