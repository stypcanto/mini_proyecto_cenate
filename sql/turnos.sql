
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















select estado, estado_gestion_citas_id , condicion_medica , 
responsable_gestora_id , fecha_asignacion , fecha_atencion, hora_atencion , id_personal
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






















