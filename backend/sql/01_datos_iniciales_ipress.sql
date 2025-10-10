-- ============================================================================
-- SCRIPT: Datos iniciales de IPRESS para sistema unificado de personal
-- ============================================================================
-- Descripción: Inserta instituciones de salud (IPRESS) para el personal externo
-- Ejecutar este script después de crear las tablas base del sistema
-- ============================================================================

-- Insertar IPRESS de ejemplo
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
    
    -- CENATE (Para referencia interna - opcional)
    ('IP999', 'CENATE - CENTRO NACIONAL DE TELEMEDICINA', 'A', 'Av. Salaverry S/N, Jesús María', '01-XXXXXXX', 'contacto@cenate.gob.pe', NOW(), NOW());

-- Verificar inserción
SELECT 
    id_ipress,
    cod_ipress,
    desc_ipress,
    stat_ipress
FROM dim_ipress
ORDER BY cod_ipress;

-- ============================================================================
-- EJEMPLOS: Crear personal externo vinculado a IPRESS
-- ============================================================================

-- Ejemplo 1: Personal del Hospital Dos de Mayo (id_ipress = 1)
INSERT INTO dim_personal_externo (
    id_tip_doc, num_doc_ext, nom_ext, ape_pater_ext, ape_mater_ext,
    fech_naci_ext, gen_ext, movil_ext, email_pers_ext, id_ipress,
    create_at, update_at
) VALUES (
    1, '45678912', 'LUIS ALBERTO', 'RODRIGUEZ', 'MARTINEZ',
    '1987-06-20', 'M', '965432178', 'lrodriguez@hdm.gob.pe', 1,
    NOW(), NOW()
);

-- Ejemplo 2: Personal del Hospital Loayza (id_ipress = 2)
INSERT INTO dim_personal_externo (
    id_tip_doc, num_doc_ext, nom_ext, ape_pater_ext, ape_mater_ext,
    fech_naci_ext, gen_ext, movil_ext, email_pers_ext, id_ipress,
    create_at, update_at
) VALUES (
    1, '78945612', 'CARMEN ROSA', 'FLORES', 'DIAZ',
    '1990-11-05', 'F', '987456321', 'cflores@loayza.gob.pe', 2,
    NOW(), NOW()
);

-- Ejemplo 3: Personal del Centro de Salud San Juan (id_ipress = 7)
INSERT INTO dim_personal_externo (
    id_tip_doc, num_doc_ext, nom_ext, ape_pater_ext, ape_mater_ext,
    fech_naci_ext, gen_ext, movil_ext, email_pers_ext, id_ipress,
    create_at, update_at
) VALUES (
    1, '85236974', 'JOSE MANUEL', 'CASTRO', 'QUISPE',
    '1985-03-15', 'M', '945123789', 'jcastro@minsa.gob.pe', 7,
    NOW(), NOW()
);

-- ============================================================================
-- CONSULTAS ÚTILES
-- ============================================================================

-- Ver personal externo con su institución
SELECT 
    pe.id_pers_ext AS "ID",
    pe.num_doc_ext AS "DNI",
    pe.nom_ext || ' ' || pe.ape_pater_ext || ' ' || pe.ape_mater_ext AS "Nombre Completo",
    i.cod_ipress AS "Código IPRESS",
    i.desc_ipress AS "Institución",
    pe.email_pers_ext AS "Email"
FROM dim_personal_externo pe
LEFT JOIN dim_ipress i ON pe.id_ipress = i.id_ipress
ORDER BY i.desc_ipress, pe.ape_pater_ext;

-- Contar personal por institución
SELECT 
    i.desc_ipress AS "Institución",
    COUNT(pe.id_pers_ext) AS "Total Personal"
FROM dim_ipress i
LEFT JOIN dim_personal_externo pe ON i.id_ipress = pe.id_ipress
GROUP BY i.id_ipress, i.desc_ipress
ORDER BY COUNT(pe.id_pers_ext) DESC;

-- ============================================================================
-- FUNCIÓN: Listar todas las IPRESS disponibles
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_listar_ipress()
RETURNS TABLE (
    id INTEGER,
    codigo VARCHAR,
    nombre VARCHAR,
    estado VARCHAR,
    total_personal_externo BIGINT
)
LANGUAGE SQL
AS $$
    SELECT 
        i.id_ipress,
        i.cod_ipress,
        i.desc_ipress,
        i.stat_ipress,
        COUNT(pe.id_pers_ext) AS total_personal
    FROM dim_ipress i
    LEFT JOIN dim_personal_externo pe ON i.id_ipress = pe.id_ipress
    GROUP BY i.id_ipress, i.cod_ipress, i.desc_ipress, i.stat_ipress
    ORDER BY i.desc_ipress;
$$;

-- Ejecutar función
SELECT * FROM fn_listar_ipress();

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
/*
1. Las IPRESS insertadas son ejemplos de instituciones de salud en Lima, Perú
2. Ajustar los datos (direcciones, teléfonos, emails) según corresponda
3. El campo stat_ipress = 'A' indica institución activa
4. Los códigos cod_ipress deben ser únicos
5. Para producción, validar con el registro oficial de IPRESS del MINSA
*/
