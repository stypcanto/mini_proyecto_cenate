-- ============================================================================
-- SCRIPT DE CREACIÓN: CMS Dashboard Médico
-- Sistema: CENATE - Centro Nacional de Telemedicina del Perú
-- Autor: CENATE Development Team
-- Versión: 1.0
-- Fecha: Octubre 2025
-- ============================================================================

-- Crear tabla para almacenar las cards del Dashboard Médico
CREATE TABLE IF NOT EXISTS dashboard_medico_cards (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    link VARCHAR(500) NOT NULL,
    icono VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT '#0A5BA9',
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    target_blank BOOLEAN DEFAULT true, -- Siempre true por defecto (abrir en nueva pestaña)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para mejorar consultas por orden y estado
CREATE INDEX IF NOT EXISTS idx_dashboard_medico_cards_activo_orden 
ON dashboard_medico_cards(activo, orden);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE dashboard_medico_cards IS 'Tabla para gestionar las cards del Dashboard Médico mediante CMS';
COMMENT ON COLUMN dashboard_medico_cards.id IS 'Identificador único de la card';
COMMENT ON COLUMN dashboard_medico_cards.titulo IS 'Título/nombre de la card';
COMMENT ON COLUMN dashboard_medico_cards.descripcion IS 'Descripción o subtítulo de la card';
COMMENT ON COLUMN dashboard_medico_cards.link IS 'URL o ruta de destino de la card';
COMMENT ON COLUMN dashboard_medico_cards.icono IS 'Nombre del icono de Lucide React';
COMMENT ON COLUMN dashboard_medico_cards.color IS 'Color hexadecimal para el icono y acentos';
COMMENT ON COLUMN dashboard_medico_cards.orden IS 'Orden de visualización (menor número = primero)';
COMMENT ON COLUMN dashboard_medico_cards.activo IS 'Indica si la card está activa y visible';
COMMENT ON COLUMN dashboard_medico_cards.target_blank IS 'Si es true, abre el link en nueva pestaña';

-- Insertar algunas cards de ejemplo (opcional)
INSERT INTO dashboard_medico_cards (titulo, descripcion, link, icono, color, orden, activo, target_blank) VALUES
('Ubicaciones de Teleconsultorios y PC', 'Para Teleconsulta y Teleorientación', '/roles/medico/teleconsultorios', 'MapPin', '#0A5BA9', 1, true, true),
('Ubicaciones PC', 'Para Teleurgencias y CENACRON', '/roles/medico/ubicaciones-pc', 'Monitor', '#16A34A', 2, true, true),
('Sala Zoom', 'Para Teleconsultorios', '/roles/medico/sala-zoom', 'Video', '#3B82F6', 3, true, true),
('ESSI', 'Sistema de información', '/roles/medico/essi', 'Database', '#7C3AED', 4, true, true),
('Información de las IPRESS', 'Datos de instituciones', '/ipress/listado', 'Building', '#F59E0B', 5, true, true)
ON CONFLICT DO NOTHING;

