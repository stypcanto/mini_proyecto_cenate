-- =============================================================================
-- SCRIPT DE VERIFICACIÓN Y DATOS DE PRUEBA
-- Sistema de Gestión de Personal - CENATE
-- =============================================================================

-- =============================================================================
-- 1. VERIFICACIÓN DE TABLAS Y DATOS EXISTENTES
-- =============================================================================

\echo '=== VERIFICANDO TABLAS EXISTENTES ==='

-- Listar todas las tablas dimensionales
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name LIKE 'dim_%'
ORDER BY table_name;

\echo ''
\echo '=== VERIFICANDO DATOS EN TABLAS MAESTRAS ==='

-- Contar registros en cada tabla
SELECT 'dim_tipo_documento' as tabla, COUNT(*) as registros FROM dim_tipo_documento
UNION ALL
SELECT 'dim_area', COUNT(*) FROM dim_area
UNION ALL
SELECT 'dim_regimen_laboral', COUNT(*) FROM dim_regimen_laboral
UNION ALL
SELECT 'dim_personal_cnt', COUNT(*) FROM dim_personal_cnt
UNION ALL
SELECT 'dim_usuarios', COUNT(*) FROM dim_usuarios;

\echo ''
\echo '=== DATOS ACTUALES: TIPOS DE DOCUMENTO ==='
SELECT * FROM dim_tipo_documento ORDER BY id_tip_doc;

\echo ''
\echo '=== DATOS ACTUALES: ÁREAS ==='
SELECT * FROM dim_area ORDER BY id_area;

\echo ''
\echo '=== DATOS ACTUALES: REGÍMENES LABORALES ==='
SELECT * FROM dim_regimen_laboral ORDER BY id_reg_lab;

\echo ''
\echo '=== DATOS ACTUALES: PERSONAL ==='
SELECT 
    p.id_pers,
    p.per_pers as nombre,
    td.desc_tip_doc as tipo_doc,
    p.num_doc_pers as num_documento,
    a.desc_area as area,
    rl.desc_reg_lab as regimen,
    p.stat_pers as estado,
    p.email_pers as email
FROM dim_personal_cnt p
LEFT JOIN dim_tipo_documento td ON p.id_tip_doc = td.id_tip_doc
LEFT JOIN dim_area a ON p.id_area = a.id_area
LEFT JOIN dim_regimen_laboral rl ON p.id_reg_lab = rl.id_reg_lab
ORDER BY p.id_pers;

-- =============================================================================
-- 2. INSERTAR DATOS DE PRUEBA PARA PERSONAL
-- =============================================================================

\echo ''
\echo '=== INSERTANDO DATOS DE PRUEBA PARA PERSONAL ==='

-- Solo insertar si la tabla está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM dim_personal_cnt) = 0 THEN
        
        -- Personal 1: Médico en Consulta Externa
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cmp, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            1, -- DNI
            '12345678',
            'DR. JUAN CARLOS PEREZ LOPEZ',
            'A', -- Activo
            '1985-05-15',
            'M',
            '987654321',
            'juan.perez@personal.com',
            'jperez@cenate.gob.pe',
            '54321', -- CMP
            'MED-001',
            'Av. Los Héroes 123, San Juan de Lurigancho, Lima',
            2, -- 728
            1, -- CONSULTA EXTERNA
            NOW(),
            NOW()
        );

        -- Personal 2: Enfermera en TeleUrgencia
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cmp, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            1, -- DNI
            '87654321',
            'LIC. MARIA ELENA RODRIGUEZ TORRES',
            'A',
            '1990-08-20',
            'F',
            '998877665',
            'maria.rodriguez@personal.com',
            'mrodriguez@cenate.gob.pe',
            '98765', -- CMP Enfermería
            'ENF-002',
            'Calle Las Flores 456, Los Olivos, Lima',
            2, -- 728
            2, -- TELEURGENCIA
            NOW(),
            NOW()
        );

        -- Personal 3: Técnico en Tele Apoyo al Diagnóstico
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            1, -- DNI
            '45678912',
            'TEC. PEDRO ANTONIO SANCHEZ DIAZ',
            'A',
            '1992-03-10',
            'M',
            '976543210',
            'pedro.sanchez@personal.com',
            'psanchez@cenate.gob.pe',
            'TEC-003',
            'Jr. Los Jardines 789, Comas, Lima',
            1, -- CAS
            3, -- TELE APOYO AL DIAGNOSTICO
            NOW(),
            NOW()
        );

        -- Personal 4: Médico Especialista (Inactivo)
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cmp, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            1, -- DNI
            '11223344',
            'DRA. ANA LUCIA FERNANDEZ GOMEZ',
            'I', -- Inactivo
            '1980-11-25',
            'F',
            '965432109',
            'ana.fernandez@personal.com',
            'afernandez@cenate.gob.pe',
            '11223', -- CMP
            'MED-004',
            'Av. Principal 321, Villa El Salvador, Lima',
            2, -- 728
            1, -- CONSULTA EXTERNA
            NOW(),
            NOW()
        );

        -- Personal 5: Locador de Servicios
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            1, -- DNI
            '99887766',
            'CARLOS ALBERTO RAMIREZ VEGA',
            'A',
            '1988-07-03',
            'M',
            '954321098',
            'carlos.ramirez@personal.com',
            'cramirez@cenate.gob.pe',
            'LOC-005',
            'Calle Los Pinos 555, San Martin de Porres, Lima',
            3, -- LOCADOR
            2, -- TELEURGENCIA
            NOW(),
            NOW()
        );

        -- Personal 6: Administrativo con Carnet de Extranjería
        INSERT INTO dim_personal_cnt (
            id_tip_doc, num_doc_pers, per_pers, stat_pers,
            fech_naci_pers, gen_pers, movil_pers, email_pers,
            email_corp_pers, cod_plan_rem, direc_pers,
            id_reg_lab, id_area, create_at, update_at
        ) VALUES (
            2, -- C.E
            '001234567',
            'LAURA PATRICIA GONZALEZ MORALES',
            'A',
            '1995-02-14',
            'F',
            '943210987',
            'laura.gonzalez@personal.com',
            'lgonzalez@cenate.gob.pe',
            'ADM-006',
            'Jr. Las Palmeras 888, Independencia, Lima',
            1, -- CAS
            1, -- CONSULTA EXTERNA
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Se insertaron 6 registros de prueba en dim_personal_cnt';
    ELSE
        RAISE NOTICE 'La tabla dim_personal_cnt ya tiene datos. No se insertaron registros de prueba.';
    END IF;
END $$;

-- =============================================================================
-- 3. VERIFICACIÓN FINAL
-- =============================================================================

\echo ''
\echo '=== VERIFICACIÓN FINAL: PERSONAL CON RELACIONES ==='

SELECT 
    p.id_pers as "ID",
    p.per_pers as "Nombre Completo",
    td.desc_tip_doc as "Tipo Doc",
    p.num_doc_pers as "Num. Documento",
    p.gen_pers as "Género",
    EXTRACT(YEAR FROM AGE(p.fech_naci_pers))::int as "Edad",
    a.desc_area as "Área",
    rl.desc_reg_lab as "Régimen",
    p.stat_pers as "Estado",
    p.movil_pers as "Teléfono",
    p.email_pers as "Email Personal",
    p.email_corp_pers as "Email Corporativo",
    p.cmp as "CMP/Código"
FROM dim_personal_cnt p
LEFT JOIN dim_tipo_documento td ON p.id_tip_doc = td.id_tip_doc
LEFT JOIN dim_area a ON p.id_area = a.id_area
LEFT JOIN dim_regimen_laboral rl ON p.id_reg_lab = rl.id_reg_lab
ORDER BY p.stat_pers DESC, p.per_pers;

\echo ''
\echo '=== ESTADÍSTICAS DEL PERSONAL ==='

-- Total de personal
SELECT 'Total Personal' as categoria, COUNT(*) as cantidad
FROM dim_personal_cnt

UNION ALL

-- Personal Activo
SELECT 'Personal Activo', COUNT(*)
FROM dim_personal_cnt
WHERE stat_pers = 'A'

UNION ALL

-- Personal Inactivo
SELECT 'Personal Inactivo', COUNT(*)
FROM dim_personal_cnt
WHERE stat_pers = 'I'

UNION ALL

-- Por Género
SELECT 'Masculino', COUNT(*)
FROM dim_personal_cnt
WHERE gen_pers = 'M'

UNION ALL

SELECT 'Femenino', COUNT(*)
FROM dim_personal_cnt
WHERE gen_pers = 'F';

\echo ''
\echo '=== PERSONAL POR ÁREA ==='

SELECT 
    COALESCE(a.desc_area, 'SIN ÁREA') as area,
    COUNT(*) as cantidad_personal,
    COUNT(CASE WHEN p.stat_pers = 'A' THEN 1 END) as activos,
    COUNT(CASE WHEN p.stat_pers = 'I' THEN 1 END) as inactivos
FROM dim_personal_cnt p
LEFT JOIN dim_area a ON p.id_area = a.id_area
GROUP BY a.desc_area
ORDER BY cantidad_personal DESC;

\echo ''
\echo '=== PERSONAL POR RÉGIMEN LABORAL ==='

SELECT 
    COALESCE(rl.desc_reg_lab, 'SIN RÉGIMEN') as regimen,
    COUNT(*) as cantidad_personal,
    COUNT(CASE WHEN p.stat_pers = 'A' THEN 1 END) as activos,
    COUNT(CASE WHEN p.stat_pers = 'I' THEN 1 END) as inactivos
FROM dim_personal_cnt p
LEFT JOIN dim_regimen_laboral rl ON p.id_reg_lab = rl.id_reg_lab
GROUP BY rl.desc_reg_lab
ORDER BY cantidad_personal DESC;

-- =============================================================================
-- 4. CONSULTAS ÚTILES PARA DEBUGGING
-- =============================================================================

\echo ''
\echo '=== VERIFICAR SECUENCIAS (AUTO-INCREMENT) ==='

SELECT 
    sequence_name,
    last_value,
    increment_by
FROM pg_sequences
WHERE schemaname = 'public'
    AND sequence_name LIKE 'dim_%_seq';

\echo ''
\echo '=== VERIFICAR CONSTRAINTS Y FOREIGN KEYS ==='

SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'dim_personal_cnt'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

\echo ''
\echo '============================================================================='
\echo 'SCRIPT COMPLETADO EXITOSAMENTE'
\echo '============================================================================='
\echo ''
\echo 'Próximos pasos:'
\echo '1. Compilar el backend: cd backend && ./gradlew clean build'
\echo '2. Iniciar el backend: ./gradlew bootRun'
\echo '3. Iniciar el frontend: cd frontend && npm start'
\echo '4. Acceder a: http://localhost:3000/admin/users'
\echo ''
\echo 'Para más información, revisa: GUIA_IMPLEMENTACION_GESTION_PERSONAL.md'
\echo '============================================================================='
