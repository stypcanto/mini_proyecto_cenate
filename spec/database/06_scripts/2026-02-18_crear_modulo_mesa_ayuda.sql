-- =====================================================================
-- SCRIPT: Crear Módulo Mesa de Ayuda - CENATE v1.64.0
-- FECHA: 2026-02-18
-- DESCRIPCIÓN: Crea tabla de tickets, motivos y registra módulo en el sistema
-- =====================================================================

-- Crear tabla de motivos predefinidos (NUEVO v1.64.0)
CREATE TABLE IF NOT EXISTS public.dim_motivos_mesadeayuda (
    id          BIGSERIAL PRIMARY KEY,
    codigo      VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500) NOT NULL,
    activo      BOOLEAN DEFAULT TRUE,
    orden       INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Crear índices para motivos
CREATE INDEX IF NOT EXISTS idx_motivos_activo ON dim_motivos_mesadeayuda(activo);
CREATE INDEX IF NOT EXISTS idx_motivos_orden ON dim_motivos_mesadeayuda(orden);

-- Tabla para secuencia de numeración de tickets (NUEVO v1.64.1)
CREATE TABLE IF NOT EXISTS public.dim_secuencia_tickets (
    id          BIGSERIAL PRIMARY KEY,
    anio        INTEGER NOT NULL UNIQUE,
    contador    INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsqueda rápida por año
CREATE INDEX IF NOT EXISTS idx_secuencia_tickets_anio ON dim_secuencia_tickets(anio);

-- Insertar 7 motivos predefinidos (NUEVO v1.64.0)
INSERT INTO public.dim_motivos_mesadeayuda (codigo, descripcion, activo, orden) VALUES
('PS_CITAR_ADICIONAL',   'PROFESIONAL DE SALUD / LICENCIADO SOLICITA CITAR PACIENTE ADICIONAL', TRUE, 1),
('PS_ACTUALIZAR_LISTADO','PROFESIONAL DE SALUD SOLICITA ACTUALIZAR LISTADO DE PACIENTES DRIVE / ESSI', TRUE, 2),
('PS_CONTACTAR_PACIENTE','PROFESIONAL DE SALUD SOLICITA CONTACTAR CON EL PACIENTE PARA EVITAR DESERCIÓN', TRUE, 3),
('PS_ELIMINAR_EXCEDENTE','PROFESIONAL DE SALUD SOLICITA ELIMINAR PACIENTE EXCEDENTE', TRUE, 4),
('PS_ENVIAR_ACTO_MEDICO','PROFESIONAL DE SALUD SOLICITA ENVIAR POR MENSAJE NRO DE ACTO MEDICO / RECETA / REFERENCIA / LABORATORIO / EXAMENES', TRUE, 5),
('PS_ENVIO_IMAGENES',    'PROFESIONAL DE SALUD SOLICITA ENVIO DE IMÁGENES / RESULTADOS DEL PACIENTE', TRUE, 6),
('PS_CITA_ADICIONAL',    'PROFESIONAL DE SALUD SOLICITA PROGRAMACION DE CITA ADICIONAL', TRUE, 7)
ON CONFLICT (codigo) DO NOTHING;

-- Crear tabla dim_ticket_mesa_ayuda
CREATE TABLE IF NOT EXISTS public.dim_ticket_mesa_ayuda (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'NUEVO' CHECK (estado IN ('NUEVO', 'EN_PROCESO', 'RESUELTO')),
    prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
    id_medico BIGINT,
    nombre_medico VARCHAR(255),
    id_solicitud_bolsa BIGINT,
    dni_paciente VARCHAR(15),
    nombre_paciente VARCHAR(255),
    especialidad VARCHAR(255),
    ipress VARCHAR(255),
    respuesta TEXT,
    id_personal_mesa BIGINT,
    nombre_personal_mesa VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    fecha_respuesta TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    id_motivo   BIGINT REFERENCES public.dim_motivos_mesadeayuda(id) ON DELETE SET NULL,
    observaciones TEXT,
    numero_ticket VARCHAR(20) UNIQUE NOT NULL,
    CONSTRAINT fk_ticket_medico FOREIGN KEY (id_medico) REFERENCES dim_personal_cnt(id_pers) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_motivo FOREIGN KEY (id_motivo) REFERENCES public.dim_motivos_mesadeayuda(id) ON DELETE SET NULL
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_ticket_mesa_estado ON dim_ticket_mesa_ayuda(estado);
CREATE INDEX IF NOT EXISTS idx_ticket_mesa_medico ON dim_ticket_mesa_ayuda(id_medico);
CREATE INDEX IF NOT EXISTS idx_ticket_mesa_fecha_creacion ON dim_ticket_mesa_ayuda(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_mesa_prioridad ON dim_ticket_mesa_ayuda(prioridad);
CREATE INDEX IF NOT EXISTS idx_ticket_mesa_numero ON dim_ticket_mesa_ayuda(numero_ticket);

-- Agregar comentarios a la tabla y columnas
COMMENT ON TABLE dim_ticket_mesa_ayuda IS 'Tabla de tickets de soporte creados por médicos para Mesa de Ayuda. Versión v1.64.1+';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.id IS 'ID único del ticket (pk)';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.titulo IS 'Título del ticket (requerido)';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.descripcion IS 'Descripción detallada del problema o solicitud';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.estado IS 'Estado del ticket: NUEVO, EN_PROCESO, RESUELTO';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.prioridad IS 'Prioridad: ALTA, MEDIA, BAJA';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.nombre_medico IS 'Nombre del médico que creó el ticket (denormalizado)';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.id_solicitud_bolsa IS 'Referencia opcional a solicitud de bolsa del paciente';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.nombre_personal_mesa IS 'Nombre del personal de Mesa de Ayuda que respondió (denormalizado)';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.fecha_respuesta IS 'Timestamp de cuando se respondió el ticket';
COMMENT ON COLUMN dim_ticket_mesa_ayuda.numero_ticket IS 'Número de ticket único (ej: 001-2026) para trazabilidad y búsqueda. Formato: 003 dígitos-YYYY';

-- Insertar módulo "Mesa de Ayuda" en dim_modulos_sistema
-- NOTA: Primero verifica si existe el módulo
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, activo, orden)
SELECT 'Mesa de Ayuda', 'Sistema de tickets y soporte para médicos', 'Headphones', true, 99
WHERE NOT EXISTS (
    SELECT 1 FROM dim_modulos_sistema WHERE nombre_modulo = 'Mesa de Ayuda'
);

-- Obtener el ID del módulo y crear páginas asociadas
-- NOTA: Ejecutar después de obtener el ID real del módulo Mesa de Ayuda
-- SELECT id FROM dim_modulos_sistema WHERE nombre_modulo = 'Mesa de Ayuda';

-- Insertar páginas del módulo (IMPORTANTE: reemplaza ID_MODULO con el valor real)
-- INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
-- SELECT ID_MODULO, 'Bienvenida', '/mesa-ayuda/bienvenida', 'Home', true, 1
-- WHERE NOT EXISTS (
--     SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/bienvenida'
-- );
--
-- INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
-- SELECT ID_MODULO, 'Lista de Tickets', '/mesa-ayuda/tickets', 'ListChecks', true, 2
-- WHERE NOT EXISTS (
--     SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/tickets'
-- );
--
-- INSERT INTO dim_paginas_sistema (id_modulo, nombre, ruta, icono, activo, orden)
-- SELECT ID_MODULO, 'FAQs', '/mesa-ayuda/faqs', 'HelpCircle', true, 3
-- WHERE NOT EXISTS (
--     SELECT 1 FROM dim_paginas_sistema WHERE ruta = '/mesa-ayuda/faqs'
-- );

-- COMMIT si es necesario (dependiendo del contexto de ejecución)
-- COMMIT;

-- Verificación post-creación
-- SELECT * FROM dim_ticket_mesa_ayuda LIMIT 1;
-- SELECT * FROM dim_modulos_sistema WHERE nombre_modulo = 'Mesa de Ayuda';
