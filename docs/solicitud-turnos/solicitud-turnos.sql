-- Tabla de periodos
select * from periodo_solicitud_turno pst ;

-- Tabla cabecera de solicitudes
select * from solicitud_turno_ipress sti ;

-- Tabla detalle solicitudes
select * from detalle_solicitud_turno dst ;

-- Tabla detalle solicitudes fecha
select * from detalle_solicitud_turno_fecha dstf ;
-- 195	482	2026-02-05	MANANA	2026-02-09 07:49:03.033 -0500

ALTER TABLE solicitud_turno_ipress
ADD COLUMN observaciones TEXT NULL;


-- 110 -- 111  -- 112
select * from detalle_solicitud_turno where id_solicitud  in (110,111,112);
delete from  detalle_solicitud_turno where id_solicitud in (113,114,115,116);
delete from  solicitud_turno_ipress where id_solicitud  in (113,114,115,116);

















--DROP TABLE IF EXISTS public.solicitud_turno_ipress_teleconsultorio_turno_hora;
--DROP TABLE IF EXISTS public.solicitud_turno_ipress_teleconsultorio_turno;
--DROP TABLE IF EXISTS public.solicitud_turno_ipress_teleconsultorio_dia;

-- =========================================================
-- TELECONSULTORIO: DIAS
-- =========================================================
CREATE TABLE public.solicitud_turno_ipress_teleconsultorio_dia (
  id_dia        BIGSERIAL PRIMARY KEY,
  id_solicitud  BIGINT NOT NULL,
  dia_semana    SMALLINT NOT NULL,      -- 1=LUN ... 7=DOM
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NULL,

  CONSTRAINT fk_stiptc_dia_solicitud
    FOREIGN KEY (id_solicitud)
    REFERENCES public.solicitud_turno_ipress(id_solicitud)
    ON DELETE CASCADE,

  CONSTRAINT ck_stiptc_dia_semana
    CHECK (dia_semana BETWEEN 1 AND 7),

  CONSTRAINT uq_stiptc_solicitud_dia
    UNIQUE (id_solicitud, dia_semana)
);

CREATE INDEX idx_stiptc_dia_id_solicitud
  ON public.solicitud_turno_ipress_teleconsultorio_dia (id_solicitud);

CREATE INDEX idx_stiptc_dia_idsol_diasem
  ON public.solicitud_turno_ipress_teleconsultorio_dia (id_solicitud, dia_semana);


-- =========================================================
-- TELECONSULTORIO: TURNOS (MANANA / TARDE)
-- =========================================================
CREATE TABLE public.solicitud_turno_ipress_teleconsultorio_turno (
  id_turno      BIGSERIAL PRIMARY KEY,
  id_solicitud  BIGINT NOT NULL,
  turno         VARCHAR(10) NOT NULL,        -- 'MANANA' | 'TARDE'
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  observaciones TEXT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NULL,

  CONSTRAINT fk_stiptc_turno_solicitud
    FOREIGN KEY (id_solicitud)
    REFERENCES public.solicitud_turno_ipress(id_solicitud)
    ON DELETE CASCADE,

  CONSTRAINT ck_stiptc_turno
    CHECK (turno IN ('MANANA','TARDE')),

  CONSTRAINT uq_stiptc_solicitud_turno
    UNIQUE (id_solicitud, turno)
);

CREATE INDEX idx_stiptc_turno_id_solicitud
  ON public.solicitud_turno_ipress_teleconsultorio_turno (id_solicitud);

CREATE INDEX idx_stiptc_turno_turno
  ON public.solicitud_turno_ipress_teleconsultorio_turno (turno);


-- =========================================================
-- TELECONSULTORIO: HORAS por TURNO
-- =========================================================
CREATE TABLE public.solicitud_turno_ipress_teleconsultorio_turno_hora (
  id_turno_hora BIGSERIAL PRIMARY KEY,
  id_turno      BIGINT NOT NULL,
  hora          TIME NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NULL,

  CONSTRAINT fk_stiptc_turno_hora_turno
    FOREIGN KEY (id_turno)
    REFERENCES public.solicitud_turno_ipress_teleconsultorio_turno(id_turno)
    ON DELETE CASCADE,

  CONSTRAINT uq_stiptc_turno_hora
    UNIQUE (id_turno, hora)
);

CREATE INDEX idx_stiptc_turno_hora_id_turno
  ON public.solicitud_turno_ipress_teleconsultorio_turno_hora (id_turno);

CREATE INDEX idx_stiptc_turno_hora_hora
  ON public.solicitud_turno_ipress_teleconsultorio_turno_hora (hora);


CREATE INDEX idx_stiptc_turno_hora_idturno_hora
  ON public.solicitud_turno_ipress_teleconsultorio_turno_hora (id_turno, hora);









select * from solicitud_turno_ipress_teleconsultorio_turno_hora;


select * from solicitud_turno_ipress_teleconsultorio_turno;


select * from solicitud_turno_ipress_teleconsultorio_dia;





truncate table solicitud_turno_ipress_teleconsultorio_turno_hora;
truncate table solicitud_turno_ipress_teleconsultorio_dia;
truncate table solicitud_turno_ipress_teleconsultorio_turno;






select * from gestion_paciente;
select * from dim_solicitud_bolsa where id_bolsa =1;
select count(*) from dim_solicitud_bolsa where id_bolsa =1;



select * from dim_ipress di ;
select * from dim_red;
select * from dim_macroregion dm ;


-- =========================================================
-- CONSULTAS ESTADÍSTICAS - ATENCIONES CLÍNICAS
-- =========================================================

-- 1. Total de atenciones realizadas (filtrado por estado ATENDIDO)
SELECT 
    COUNT(id_solicitud) AS total_atenciones_realizadas
FROM dim_solicitud_bolsa 
WHERE condicion_medica = 'Atendido'
    AND id_bolsa = 1;

-- 2. Atenciones por mes
SELECT 
    EXTRACT(MONTH FROM fecha_atencion) AS mes,
    EXTRACT(YEAR FROM fecha_atencion) AS anio,
    COUNT(id_solicitud) AS total_atenciones,
    TO_CHAR(fecha_atencion, 'Month YYYY') AS periodo
FROM dim_solicitud_bolsa 
WHERE fecha_atencion IS NOT NULL
    AND id_bolsa = 1
GROUP BY EXTRACT(MONTH FROM fecha_atencion), EXTRACT(YEAR FROM fecha_atencion), TO_CHAR(fecha_atencion, 'Month YYYY')
ORDER BY anio, mes;

-- 3. Atenciones por IPRESS (con información adicional de la IPRESS)
SELECT 
    dsb.id_ipress,
    di.desc_ipress AS nombre_ipress,
    di.cod_ipress AS codigo_ipress,
    COUNT(dsb.id_solicitud) AS total_atenciones
FROM dim_solicitud_bolsa dsb
LEFT JOIN dim_ipress di ON dsb.id_ipress = di.id_ipress
WHERE dsb.id_bolsa = 1
GROUP BY dsb.id_ipress, di.desc_ipress, di.cod_ipress
ORDER BY total_atenciones DESC;

-- 4. Atenciones por especialidad (servicio)
SELECT 
    derivacion_interna,
    COUNT(id_solicitud) AS total_atenciones
FROM dim_solicitud_bolsa 
WHERE id_bolsa = 1
    AND especialidad IS NOT NULL
GROUP BY derivacion_interna
ORDER BY total_atenciones DESC;

-- 5. Atenciones por tipo de cita
SELECT 
    tipo_cita,
    COUNT(id_solicitud) AS total_atenciones,
    ROUND((COUNT(id_solicitud) * 100.0 / SUM(COUNT(id_solicitud)) OVER()), 2) AS porcentaje
FROM dim_solicitud_bolsa 
WHERE id_bolsa = 1
    AND tipo_cita IS NOT NULL
GROUP BY tipo_cita
ORDER BY total_atenciones DESC;

-- =========================================================
-- CONSULTAS ADICIONALES PARA ANÁLISIS COMPLETO
-- =========================================================

-- 6. Estadísticas por estado de atención
SELECT 
    condicion_medica,
    COUNT(id_solicitud) AS total,
    ROUND((COUNT(id_solicitud) * 100.0 / SUM(COUNT(id_solicitud)) OVER()), 2) AS porcentaje
FROM dim_solicitud_bolsa 
WHERE id_bolsa = 1
GROUP BY condicion_medica
ORDER BY total DESC;



-- 8. Top 10 IPRESS con más atenciones
SELECT 
    dsb.id_ipress,
    di.desc_ipress,
    dr.desc_red AS red,
    dm.desc_macro AS macroregion,
    COUNT(dsb.id_solicitud) AS total_atenciones
FROM dim_solicitud_bolsa dsb
LEFT JOIN dim_ipress di ON dsb.id_ipress = di.id_ipress
LEFT JOIN dim_red dr ON di.id_red = dr.id_red
LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
WHERE dsb.id_bolsa = 1
GROUP BY dsb.id_ipress, di.desc_ipress, dr.desc_red, dm.desc_macro
ORDER BY total_atenciones DESC
LIMIT 10;

-- =========================================================
-- 9. ATENCIONES POR GRUPO ETARIO (al costado de edad)
-- =========================================================
SELECT 
    paciente_edad AS edad,
    CASE 
        WHEN paciente_edad BETWEEN 0  AND 11 THEN 'Niñez'
        WHEN paciente_edad BETWEEN 12 AND 17 THEN 'Adolescencia'
        WHEN paciente_edad BETWEEN 18 AND 29 THEN 'Juventud'
        WHEN paciente_edad BETWEEN 30 AND 59 THEN 'Adultez'
        WHEN paciente_edad >= 60              THEN 'Adulto Mayor'
        ELSE 'No registrado'
    END AS grupo_etario,
    COUNT(id_solicitud) AS total_atenciones,
    ROUND((COUNT(id_solicitud) * 100.0 / SUM(COUNT(id_solicitud)) OVER()), 2) AS porcentaje
FROM dim_solicitud_bolsa
WHERE id_bolsa = 1
    AND paciente_edad IS NOT NULL
GROUP BY paciente_edad,
    CASE 
        WHEN paciente_edad BETWEEN 0  AND 11 THEN 'Niñez'
        WHEN paciente_edad BETWEEN 12 AND 17 THEN 'Adolescencia'
        WHEN paciente_edad BETWEEN 18 AND 29 THEN 'Juventud'
        WHEN paciente_edad BETWEEN 30 AND 59 THEN 'Adultez'
        WHEN paciente_edad >= 60              THEN 'Adulto Mayor'
        ELSE 'No registrado'
    END
ORDER BY paciente_edad;

-- 9b. Resumen agrupado solo por grupo etario
SELECT 
    CASE 
        WHEN paciente_edad BETWEEN 0  AND 11 THEN 'Niñez'
        WHEN paciente_edad BETWEEN 12 AND 17 THEN 'Adolescencia'
        WHEN paciente_edad BETWEEN 18 AND 29 THEN 'Juventud'
        WHEN paciente_edad BETWEEN 30 AND 59 THEN 'Adultez'
        WHEN paciente_edad >= 60              THEN 'Adulto Mayor'
        ELSE 'No registrado'
    END AS grupo_etario,
    MIN(paciente_edad) AS edad_minima,
    MAX(paciente_edad) AS edad_maxima,
    COUNT(id_solicitud) AS total_atenciones,
    ROUND((COUNT(id_solicitud) * 100.0 / SUM(COUNT(id_solicitud)) OVER()), 2) AS porcentaje
FROM dim_solicitud_bolsa
WHERE id_bolsa = 1
    AND paciente_edad IS NOT NULL
GROUP BY 
    CASE 
        WHEN paciente_edad BETWEEN 0  AND 11 THEN 'Niñez'
        WHEN paciente_edad BETWEEN 12 AND 17 THEN 'Adolescencia'
        WHEN paciente_edad BETWEEN 18 AND 29 THEN 'Juventud'
        WHEN paciente_edad BETWEEN 30 AND 59 THEN 'Adultez'
        WHEN paciente_edad >= 60              THEN 'Adulto Mayor'
        ELSE 'No registrado'
    END
ORDER BY edad_minima;

-- =========================================================
-- LEYENDA: GRUPOS ETARIOS POR ETAPAS DE VIDA
-- =========================================================
-- ┌──────────────────┬────────────┬───────────────────────────────────────────┐
-- │  GRUPO ETARIO    │  RANGO     │  DESCRIPCIÓN                              │
-- ├──────────────────┼────────────┼───────────────────────────────────────────┤
-- │  Niñez           │  0-11 años │  Cuidado integral pediátrico              │
-- │  Adolescencia    │ 12-17 años │  Atención diferenciada del adolescente    │
-- │  Juventud        │ 18-29 años │  Promoción de salud y prevención          │
-- │  Adultez         │ 30-59 años │  Control de enfermedades crónicas         │
-- │  Adulto Mayor    │ 60+  años  │  Atención geriátrica especializada        │
-- └──────────────────┴────────────┴───────────────────────────────────────────┘
-- Fuente: Etapas de vida para el cuidado integral de salud (MINSA)




select * from dim_estados_gestion_citas degc ;


-- SOLICITADO POR DANIELA ROJAS - CENATE
insert into dim_estados_gestion_citas (cod_estado_cita, desc_estado_cita, stat_estado_cita)
values ('NO_GRUPO_ETARIO', 'No pertenece a rango etario', 'A');


insert into dim_estados_gestion_citas (cod_estado_cita, desc_estado_cita, stat_estado_cita)
values ('NO_IPRESS_CENATE', 'Pertenece a otra Ipress', 'A');


select estado_gestion_citas_id from DIM_SOLICITUD_BOLSA where paciente_dni='46183586';

select * from DIM_SOLICITUD_BOLSA where paciente_dni='46183586';



select * from dim_solicitud_bolsa dsb  where OCTET_LENGTH (especialidad)= 6;
+



select * from dim_tipos_bolsas dtb where  dtb.id_tipo_bolsa =1;






select * from DIM_SOLICITUD_BOLSA where paciente_dni in ('46183586','10417941','40046461');



select * from dim_usuarios;





select * from DIM_SOLICITUD_BOLSA where paciente_dni in ('46183586','10417941','40046461');



select  *  from dim_solicitud_bolsa dsb  where OCTET_LENGTH (especialidad)= 6;


select  id_solicitud, especialidad, dsb.id_servicio   from dim_solicitud_bolsa dsb  where OCTET_LENGTH (especialidad)= 6;


update dim_solicitud_bolsa set especialidad ='HEMATOLOGIA' where id_solicitud = 7156; -- 70
update dim_solicitud_bolsa set especialidad ='ALERGIA' where id_solicitud = 44286; -- 1
update dim_solicitud_bolsa set especialidad ='NEUROLOGIA' where id_solicitud = 9916; --90 
update dim_solicitud_bolsa set especialidad ='NEUROLOGIA' where id_solicitud = 9915; --90 
update dim_solicitud_bolsa set especialidad ='NEUROLOGIA' where id_solicitud = 9914; --90 



select * from dim_servicio_essi dse where dse.id_servicio  in (1, 70 ,90);

select * from dim_solicitud_bolsa where id_solicitud in (7156, 44286, 9914, 9915, 9916);



select * from dim_personal_cnt dpc ;








select * from dim_servicio_essi where es_cenate=true;





select * from dim_solicitud_bolsa where paciente_id in ('12345601');


update dim_solicitud_bolsa set fecha_atencion  ='2026-01-14' where paciente_id in ('12345601');



select * from dim_solicitud_bolsa where paciente_id in ('70073164');

select * from dim_personal_cnt dpc  where dpc.num_doc_pers='33333333'
select * from dim_usuarios du  where name_user='33333333'; -- 693
select * from dim_roles dr where id_rol=3;
select * from rel_user_roles rur  where id_user= 693;




select * from dim_personal_cnt;





select * from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='70073164';

delete from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='70073164';


select * from dim_estados_gestion_citas degc ;
-- 07887379


select * from dim_solicitud_bolsa dsb  where dsb.paciente_dni in ('70073164','07887379');
delete from dim_solicitud_bolsa dsb  where dsb.paciente_dni in ('70073164','07887379');



select * from tele_ecg_imagenes tei where tei.num_doc_paciente ='70073164';


delete from tele_ecg_imagenes tei where tei.num_doc_paciente ='70073164';



select * from dim_solicitud_bolsa where paciente_dni in ('09201701', '06630022');


select dsb.id_solicitud , dsb.paciente_dni , dsb.fecha_solicitud, dsb.source_last_seen_at , dsb.fecha_cambio_estado , dsb.fecha_actualizacion  
from dim_solicitud_bolsa dsb  where dsb.paciente_dni in ('09201701', '06630022');






update dim_solicitud_bolsa set source_last_seen_at ='2026-02-13 11:40:05.000 -0500' , 
                               fecha_cambio_estado ='2026-02-13 11:41:05.000 -0500' , 
							   fecha_actualizacion ='2026-02-13 11:42:05.000 -0500'   where id_solicitud = 44675;


-- semaforo reprogramacion 
-- considerar la fecha para el semaforo
-- 



