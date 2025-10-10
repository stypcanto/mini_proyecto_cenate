-- ============================================================================
-- SCRIPT DE MIGRACIÓN: Sistema Unificado de Personal
-- ============================================================================
-- Descripción: Actualiza la base de datos para soportar el sistema unificado
-- Ejecutar este script en la base de datos existente
-- ============================================================================

-- ============================================================================
-- PASO 1: Crear tabla dim_ipress si no existe
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_ipress (
    id_ipress SERIAL PRIMARY KEY,
    cod_ipress VARCHAR(50) UNIQUE,
    desc_ipress VARCHAR(500) NOT NULL,
    stat_ipress CHAR(1) DEFAULT 'A',
    direc_ipress VARCHAR(500),
    telf_ipress VARCHAR(20),
    email_ipress VARCHAR(100),
    create_at TIMESTAMP NOT NULL DEFAULT NOW(),
    update_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comentarios de la tabla
COMMENT ON TABLE dim_ipress IS 'Instituciones Prestadoras de Servicios de Salud (IPRESS)';
COMMENT ON COLUMN dim_ipress.id_ipress IS 'ID único de la IPRESS';
COMMENT ON COLUMN dim_ipress.cod_ipress IS 'Código único de la IPRESS';
COMMENT ON COLUMN dim_ipress.desc_ipress IS 'Descripción/Nombre de la IPRESS';
COMMENT ON COLUMN dim_ipress.stat_ipress IS 'Estado: A=Activo, I=Inactivo';

-- ============================================================================
-- PASO 2: Actualizar tabla dim_personal_externo
-- ============================================================================

-- Agregar columna id_ipress si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_personal_externo' 
        AND column_name = 'id_ipress'
    ) THEN
        ALTER TABLE dim_personal_externo 
        ADD COLUMN id_ipress INTEGER REFERENCES dim_ipress(id_ipress);
        
        COMMENT ON COLUMN dim_personal_externo.id_ipress IS 'Institución a la que pertenece el personal externo';
    END IF;
END $$;

-- Renombrar columna email_ext a email_pers_ext si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_personal_externo' 
        AND column_name = 'email_ext'
    ) THEN
        ALTER TABLE dim_personal_externo 
        RENAME COLUMN email_ext TO email_pers_ext;
    END IF;
END $$;

-- Renombrar columna id_usuario a id_user si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_personal_externo' 
        AND column_name = 'id_usuario'
    ) THEN
        ALTER TABLE dim_personal_externo 
        RENAME COLUMN id_usuario TO id_user;
    END IF;
END $$;

-- Eliminar columna inst_ext si existe (será reemplazada por id_ipress)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_personal_externo' 
        AND column_name = 'inst_ext'
    ) THEN
        -- Primero migrar datos a IPRESS si es necesario
        INSERT INTO dim_ipress (cod_ipress, desc_ipress, stat_ipress, create_at, update_at)
        SELECT DISTINCT 
            'IP_' || ROW_NUMBER() OVER (ORDER BY inst_ext),
            inst_ext,
            'A',
            NOW(),
            NOW()
        FROM dim_personal_externo
        WHERE inst_ext IS NOT NULL
        AND inst_ext != ''
        ON CONFLICT (cod_ipress) DO NOTHING;
        
        -- Actualizar referencias
        UPDATE dim_personal_externo pe
        SET id_ipress = i.id_ipress
        FROM dim_ipress i
        WHERE pe.inst_ext = i.desc_ipress
        AND pe.inst_ext IS NOT NULL;
        
        -- Ahora eliminar la columna
        ALTER TABLE dim_personal_externo 
        DROP COLUMN inst_ext;
    END IF;
END $$;

-- Eliminar columna email_corp_ext si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_personal_externo' 
        AND column_name = 'email_corp_ext'
    ) THEN
        ALTER TABLE dim_personal_externo 
        DROP COLUMN email_corp_ext;
    END IF;
END $$;

-- ============================================================================
-- PASO 3: Crear índices para mejorar rendimiento
-- ============================================================================

-- Índices en dim_ipress
CREATE INDEX IF NOT EXISTS idx_ipress_cod ON dim_ipress(cod_ipress);
CREATE INDEX IF NOT EXISTS idx_ipress_desc ON dim_ipress(desc_ipress);
CREATE INDEX IF NOT EXISTS idx_ipress_stat ON dim_ipress(stat_ipress);

-- Índices en dim_personal_externo
CREATE INDEX IF NOT EXISTS idx_pers_ext_ipress ON dim_personal_externo(id_ipress);
CREATE INDEX IF NOT EXISTS idx_pers_ext_user ON dim_personal_externo(id_user);
CREATE INDEX IF NOT EXISTS idx_pers_ext_fech_naci ON dim_personal_externo(fech_naci_ext);

-- Índices en dim_personal_cnt (si no existen)
CREATE INDEX IF NOT EXISTS idx_pers_cnt_area ON dim_personal_cnt(id_area);
CREATE INDEX IF NOT EXISTS idx_pers_cnt_stat ON dim_personal_cnt(stat_pers);
CREATE INDEX IF NOT EXISTS idx_pers_cnt_fech_naci ON dim_personal_cnt(fech_naci_pers);
CREATE INDEX IF NOT EXISTS idx_pers_cnt_usuario ON dim_personal_cnt(id_usuario);

-- ============================================================================
-- PASO 4: Actualizar triggers de timestamp
-- ============================================================================

-- Función genérica para actualizar update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para dim_ipress
DROP TRIGGER IF EXISTS update_ipress_updated_at ON dim_ipress;
CREATE TRIGGER update_ipress_updated_at
    BEFORE UPDATE ON dim_ipress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para dim_personal_externo
DROP TRIGGER IF EXISTS update_personal_externo_updated_at ON dim_personal_externo;
CREATE TRIGGER update_personal_externo_updated_at
    BEFORE UPDATE ON dim_personal_externo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASO 5: Insertar datos iniciales de IPRESS
-- ============================================================================

INSERT INTO dim_ipress (cod_ipress, desc_ipress, stat_ipress, direc_ipress, telf_ipress, email_ipress, create_at, update_at)
VALUES
    -- Hospitales Nivel III
    ('IP001', 'HOSPITAL NACIONAL DOS DE MAYO', 'A', 'Av. Miguel Grau 13, Parque Historia de la Medicina Peruana, Cercado de Lima', '01-3285000', 'contacto@hdm.gob.pe', NOW(), NOW()),
    ('IP002', 'HOSPITAL NACIONAL ARZOBISPO LOAYZA', 'A', 'Av. Alfonso Ugarte 848, Cercado de Lima', '01-6143400', 'contacto@loayza.gob.pe', NOW(), NOW()),
    ('IP003', 'HOSPITAL NACIONAL GUILLERMO ALMENARA IRIGOYEN', 'A', 'Av. Grau 800, La Victoria', '01-3242983', 'contacto@essalud.gob.pe', NOW(), NOW()),
    
    -- Hospitales Nivel II
    ('IP004', 'HOSPITAL CAYETANO HEREDIA', 'A', 'Av. Honorio Delgado 262, San Martín de Porres', '01-3190000', 'contacto@upch.edu.pe', NOW(), NOW()),
    ('IP005', 'HOSPITAL DE EMERGENCIAS JOSE CASIMIRO ULLOA', 'A', 'Av. Roosevelt 6355, Miraflores', '01-6148000', 'contacto@ulloa.gob.pe', NOW(), NOW()),
    ('IP006', 'HOSPITAL MARIA AUXILIADORA', 'A', 'Av. Miguel Iglesias S/N, San Juan de Miraflores', '01-2768110', 'contacto@hma.gob.pe', NOW(), NOW()),
    
    -- Centros de Salud Nivel I
    ('IP007', 'CENTRO DE SALUD SAN JUAN BAUTISTA', 'A', 'Av. Los Héroes 245, San Juan de Lurigancho', '01-4587890', 'cs_sjb@minsa.gob.pe', NOW(), NOW()),
    ('IP008', 'CENTRO DE SALUD VILLA MARIA DEL TRIUNFO', 'A', 'Av. Pachacútec 1250, Villa María del Triunfo', '01-2874560', 'cs_vmt@minsa.gob.pe', NOW(), NOW()),
    ('IP009', 'CENTRO DE SALUD COMAS', 'A', 'Av. Túpac Amaru 5670, Comas', '01-5241789', 'cs_comas@minsa.gob.pe', NOW(), NOW()),
    
    -- Clínicas Privadas
    ('IP010', 'CLINICA INTERNACIONAL', 'A', 'Av. Garcilaso de la Vega 1420, Lima', '01-6196161', 'contacto@clinicainternacional.com.pe', NOW(), NOW()),
    ('IP011', 'CLINICA SAN FELIPE', 'A', 'Av. Gregorio Escobedo 650, Jesús María', '01-2193000', 'contacto@sanfelipe.com.pe', NOW(), NOW()),
    
    -- Institutos Especializados
    ('IP012', 'INSTITUTO NACIONAL DE SALUD DEL NIÑO', 'A', 'Av. Brasil 600, Breña', '01-3300066', 'contacto@insn.gob.pe', NOW(), NOW()),
    ('IP013', 'INSTITUTO NACIONAL DE SALUD MENTAL', 'A', 'Jr. Eloy Espinoza 709, San Martín de Porres', '01-6142929', 'contacto@insm.gob.pe', NOW(), NOW()),
    
    -- CENATE (Para referencia interna)
    ('IP999', 'CENATE - CENTRO NACIONAL DE TELEMEDICINA', 'A', 'Av. Salaverry S/N, Jesús María', '01-XXXXXXX', 'contacto@cenate.gob.pe', NOW(), NOW())
ON CONFLICT (cod_ipress) DO NOTHING;

-- ============================================================================
-- PASO 6: Verificación de la migración
-- ============================================================================

-- Verificar estructura de dim_ipress
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_ipress'
ORDER BY ordinal_position;

-- Verificar estructura de dim_personal_externo
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_personal_externo'
ORDER BY ordinal_position;

-- Verificar IPRESS insertadas
SELECT 
    id_ipress,
    cod_ipress,
    desc_ipress,
    stat_ipress
FROM dim_ipress
ORDER BY cod_ipress;

-- Verificar índices creados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('dim_ipress', 'dim_personal_externo', 'dim_personal_cnt')
ORDER BY tablename, indexname;

-- ============================================================================
-- RESUMEN DE CAMBIOS
-- ============================================================================

/*
✅ CAMBIOS REALIZADOS:

1. Tabla dim_ipress creada con todos sus campos
2. dim_personal_externo actualizada:
   - Columna id_ipress agregada (FK a dim_ipress)
   - Columna email_ext renombrada a email_pers_ext
   - Columna id_usuario renombrada a id_user
   - Columna inst_ext eliminada (datos migrados a IPRESS)
   - Columna email_corp_ext eliminada

3. Índices creados para mejor rendimiento
4. Triggers de timestamp actualizados
5. Datos iniciales de IPRESS insertados

⚠️ NOTA: Si hay personal externo existente con inst_ext,
   sus datos fueron migrados automáticamente a la tabla dim_ipress.
*/

-- ============================================================================
-- ROLLBACK (solo si es necesario)
-- ============================================================================

/*
-- Para revertir los cambios si algo sale mal:

DROP TRIGGER IF EXISTS update_ipress_updated_at ON dim_ipress;
DROP TRIGGER IF EXISTS update_personal_externo_updated_at ON dim_personal_externo;

ALTER TABLE dim_personal_externo DROP CONSTRAINT IF EXISTS dim_personal_externo_id_ipress_fkey;
ALTER TABLE dim_personal_externo DROP COLUMN IF EXISTS id_ipress;

DROP TABLE IF EXISTS dim_ipress CASCADE;
*/

-- ============================================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ============================================================================

COMMIT;
