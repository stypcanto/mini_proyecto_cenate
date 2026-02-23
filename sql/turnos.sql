
/*
*vw_ctr_horario_area_servicio_grupo
*vw_ctr_horario_area_servicio
*vw_ctr_horario_prof_area
*Tabla: ctr_periodo
*/






-- ************************************************************************
-- ************************************************************************
-- ************************************************************************
-- NUEVOS CAMBIOS *********************************************************
-- ************************************************************************
-- ************************************************************************
-- ************************************************************************


select * from periodo_medico_disponibilidad pmd ;

select * from dim_area where id_area  in(2,3,13);

select * from dim_usuarios du  where name_user = '70073164';

select * from dim_personal_cnt where id_usuario =49;


select * from ctr_periodo cp ;


-- 
select * from dim_usuarios where name_user ='70073164';
select * from rel_user_roles rur  where rur.id_user =49;
select * from dim_roles where id_rol in (15,33,35);











select * from periodo_medico_disponibilidad pmd ;

select * from dim_area;
select * from dim_area where id_area  in(2,3,13);

select * from dim_usuarios du  where name_user = '70073164';

select * from dim_personal_cnt where id_usuario =49;
select * from ctr_periodo cp ;





-- 
select * from dim_usuarios where name_user ='70073164';
select * from rel_user_roles rur  where rur.id_user =49;
select * from dim_roles where id_rol in (15,33,35);















select especialidad, estado, estado_gestion_citas_id , condicion_medica , 
responsable_gestora_id , fecha_asignacion , fecha_atencion, hora_atencion , id_personal, fecha_solicitud 
 from dim_solicitud_bolsa where paciente_dni='70073164';


update dim_solicitud_bolsa set condicion_medica='Pendiente', 
	estado='PENDIENTE' where paciente_dni ='70073164';

update dim_solicitud_bolsa set condicion_medica='Atendido', 
	estado='ATENDIDO' where paciente_dni ='70073164';


delete from dim_solicitud_bolsa  where paciente_dni ='70073164';


select * from dim_estados_gestion_citas degc ;


select * from dim_tipos_bolsas dtb ;


select distinct condicion_medica from dim_solicitud_bolsa;


select * from dim_solicitud_bolsa dsb  where dsb.condicion_medica ='Atendido';




select * from dim_solicitud_bolsa where condicion_medica='Atendido';


select * from dim_tipos_bolsas dtb ; --8

select count(*) from dim_solicitud_bolsa dsb  where id_bolsa=8;

select * from dim_solicitud_bolsa dsb  where id_bolsa=8;

-- 43978802   personal que esta asignando
select * from dim_personal_cnt where num_doc_pers ='43978802';

-- 41584716 ROXANA ESTELA
select * from dim_personal_cnt where num_doc_pers ='41584716'; -- 318

select * from dim_solicitud_bolsa dsb  where id_bolsa=8 and dsb.responsable_gestora_id =318;


select count(*) as Solicitudes, dsb.responsable_gestora_id , 
	dpc.ape_pater_pers || ' ' || dpc.ape_mater_pers || ' ' || dpc.nom_pers  as Gestora
from dim_solicitud_bolsa dsb inner join dim_personal_cnt dpc 
	on dsb.responsable_gestora_id = dpc.id_usuario 
where  
dsb.id_bolsa =14 and dsb.responsable_gestora_id is not null
group by dsb.responsable_gestora_id, dpc.ape_pater_pers , dpc.ape_mater_pers, dpc.nom_pers;


-- zamudio -- 09432238 -- 229 idUsuario



select * from dim_personal_cnt dpc  where dpc.num_doc_pers='09432238';





select * from dim_personal_cnt where id_usuario =313;

select count(*)  from dim_solicitud_bolsa dsb  where  dsb.id_bolsa =14; -- registro cronicos



--53 registros
select count(*) from dim_solicitud_bolsa dsb  where id_bolsa=14 and dsb.responsable_gestora_id =313;






WITH x AS (
  SELECT id_solicitud
  FROM dim_solicitud_bolsa
  WHERE id_bolsa = 14
    AND responsable_gestora_id IS NULL
  ORDER BY fecha_solicitud ASC
  LIMIT 100
)
UPDATE dim_solicitud_bolsa dsb
SET idsolicitudgeneracion = 12346
FROM x
WHERE dsb.id_solicitud = x.id_solicitud;

/*
189
191
194
204
318
185
*/
select * from dim_solicitud_bolsa dsb  where id_bolsa=14 
	and dsb.responsable_gestora_id is  null and dsb.idsolicitudgeneracion =12345;

select * from dim_solicitud_bolsa dsb  where id_bolsa=14 
	 and dsb.idsolicitudgeneracion =12345;

UPDATE dim_solicitud_bolsa dsb
SET responsable_gestora_id = 321
WHERE dsb.ctid IN (
    SELECT ctid
    FROM dim_solicitud_bolsa
    WHERE id_bolsa = 14
      AND idsolicitudgeneracion = 12346
      AND responsable_gestora_id IS NULL
    ORDER BY fecha_solicitud ASC
    LIMIT 100
);


select * from dim_solicitud_bolsa dsb  where id_bolsa=14 
	 and dsb.idsolicitudgeneracion =12345 and responsable_gestora_id =204;

select * from dim_personal_cnt where num_doc_pers ='70104687'; -- 190


-- consultando solicitudes de bolsa 15, gestor axel y solicituddegeneracion=12345
WITH x AS (
  SELECT id_solicitud
  FROM dim_solicitud_bolsa
  WHERE id_bolsa = 14
    AND responsable_gestora_id =204 and idsolicitudgeneracion =12345
)

UPDATE dim_solicitud_bolsa dsb
SET responsable_gestora_id = 190
FROM x
WHERE dsb.id_solicitud = x.id_solicitud;



-- registros de axel
select * from dim_solicitud_bolsa dsb  where id_bolsa=14 
	 and responsable_gestora_id =204;
-- pasarlos a otro gestor
update dim_solicitud_bolsa dsb  set responsable_gestora_id =190 where dsb.id_solicitud =48340;









