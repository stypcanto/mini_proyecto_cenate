
select * from dim_solicitud_bolsa where id_bolsa=1 and tiempo_inicio_sintomas is not null;

select * from dim_tipos_bolsas dtb ; -- 6

select codigo_adscripcion , id_ipress, codigo_ipress  from dim_solicitud_bolsa where id_bolsa =6;


select * from dim_ipress di  where 


select * from dim_historial_carga_bolsas dhcb ;



select codigo_adscripcion , id_ipress, codigo_ipress  from dim_solicitud_bolsa where id_bolsa =1;


select *from dim_solicitud_bolsa where paciente_dni='70073164';
-- update dim_solicitud_bolsa dsb  set id_servicio =13 where dsb.paciente_dni ='56789005';
-- noche

 
-- CODIGO ADSCRIPCION     
-- ID IPRESS   


select * from asegurados:







select * from rendimiento_horario rh ;



select * from dim_ipress di  where cod_ipress = '213';





select * from dim_solicitud_bolsa
select  distinct id_bolsa from dim_solicitud_bolsa dtb
--1 codigo de adsc
--4
--6
--8
-- 10

select codigo_adscripcion , id_ipress, codigo_ipress from dim_solicitud_bolsa dsb  where dsb.id_bolsa =4;

select CHAR_LENGTH(codigo_adscripcion) from dim_solicitud_bolsa dsb  where CHAR_LENGTH(codigo_adscripcion) = 2;
-- comentario : para la noche
-- 10 golsa de gestor . en gestor de citas tiene que estar funcionando la asignacion a la bolsa numero 10
-- tener en cuenta


-- codigo_ipress
-- id_ipress
-- codigo_adscripcion


select * from dim_tipos_bolsas dtb where dtb.id_tipo_bolsa =1;




-- Ver información de función
SELECT * FROM pg_proc WHERE proname = 'sync_bolsa_to_gestion_paciente';

-- Ver información de trigger
SELECT * FROM pg_trigger WHERE tgname = 'trg_sync_bolsa_to_gestion';



select * from gestion_paciente;

ALTER TABLE public.gestion_paciente
ADD CONSTRAINT uk_gestion_paciente_pk_asegurado UNIQUE (pk_asegurado);








select * from dim_servicio_essi where id_servicio=84;

select * from dim_servicio_essi where id_servicio=84;





select * from periodo_solicitud_turno pst ;

select * from solicitud_turno_ipress sti 
-- 556 y 678

select  * from dim_personal_cnt where id_pers in (556, 678)














select * from dim_solicitud_bolsa where id_bolsa=1;



select * from dim_estados_gestion_citas degc ;



select codigo_adscripcion , id_ipress, codigo_ipress  from dim_solicitud_bolsa where id_bolsa =1;





select * from dim_usuarios du  where du.name_user ='45721231';


select * from dim_roles dr  where dr.id_rol =27;
select * from rel_user_roles rur  where id_user=548;


select * from vw_permisos_activos where usuario='45721231';



SELECT 
    *
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/modulos/bolsas/solicitudes';



select * from dim_servicio_essi where desc_servicio ='CARDIOLOGIA';


select * from dim_personal_cnt dpc  where dpc.id_servicio =13;

select * from dim_solicitud_bolsa where id_servicio =13;



SELECT id_pers, nom_pers, id_servicio 
FROM dim_personal_cnt 
WHERE id_servicio = 66;


select * from dim_tipos_bolsas dtb ;

update dim_personal_cnt set id_servicio =66 where id_pers=94;


select * from dim_personal_cnt dpc where dpc.num_doc_pers ='70073164'



select * from dim_solicitud_bolsa where paciente_id = '70073164';

-- delete from dim_solicitud_bolsa where paciente_id = '70073164';


select * from dim_servicio_essi where id_servicio  =94;
select * from dim_personal_cnt dpc where dpc.id_pers  = 547;

select count(*) from asegurados;



select * from solicitud_cita sc ;





select * from dim_ipress di where desc_ipress like '%CHILCA%';



select * from dim_tipos_bolsas dtb ; -- codigo 6 es reprogramaciones

select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress  
from dim_solicitud_bolsa dsb where dsb.id_bolsa =6 and paciente_id='46855642';
-- chilca

-- 46855642
select * from dim_solicitud_bolsa dsb where dsb.id_bolsa =6 and paciente_id='46855642';

select * from dim_ipress di  where di.id_ipress = 209;

select * from asegurados a  where a.doc_paciente ='72702699';
-- 72702699




SELECT a.doc_paciente, a.paciente, a.cas_adscripcion , di.cod_ipress , di.desc_ipress , di.id_ipress 
FROM asegurados a left join dim_ipress di on a.cas_adscripcion = di.cod_ipress   
WHERE a.doc_paciente IN (
    '45411586',
    '20669459',
    '48589321',
    '20057780',
    '19921785',
    '10567746',
    '46855642',
    '72702699',
    '61280800',
    '10009016',
    '21244227'
);

select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , di.desc_ipress ,  
dsb.paciente_dni , a.paciente , a.cas_adscripcion , ida.desc_ipress 
from dim_solicitud_bolsa dsb
inner join dim_ipress di  on di.id_ipress = dsb.id_ipress 
inner join asegurados a on a.doc_paciente = dsb.paciente_dni  
left join dim_ipress ida on ida.cod_ipress =  a.cas_adscripcion 

where dsb.id_bolsa =6 and
dsb.paciente_id   IN (
    '45411586',
    '20669459',
    '20057780',
    '19921785',
    '10567746',
    '46855642',
    '72702699',
    '61280800',
    '10009016',
    '21244227'
);

select * from audit_carga_excel_bolsa aceb ;




select * from dim_solicitud_bolsa dsb   where dsb.paciente_dni='72702699';

-- tablas de diagnostico
select * from form_diag_cat_categoria_profesional fdccp ;

select * from form_diag_cat_equipamiento fdce ;































