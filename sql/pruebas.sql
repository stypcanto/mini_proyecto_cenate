
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

select * from form_diag_cat_estado_equipo fdcee ;

select * from form_diag_cat_necesidad fdcn  ;


 -- (id_bolsa, paciente_id, id_servicio, especialidad)
select dsb.id_bolsa , dsb.paciente_dni , dsb.id_servicio , dsb.especialidad , dsb.*
from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='08213320';



 -- (id_bolsa, paciente_id, id_servicio, especialidad)
select dsb.id_bolsa , dsb.paciente_dni , dsb.id_servicio , dsb.especialidad , dsb.*
from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='48162124';

select * from asegurados a  where a.doc_paciente ='48162124';



select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress
from dim_solicitud_bolsa dsb 
where dsb.id_bolsa =1;

select count(*) from dim_ipress di  where di.stat_ipress ='A';

select * from dim_servicio_essi dse ;




select * from asegurados a  where a.doc_paciente = '46048073';



select * from dim_ipress di  where di.cod_ipress ='074';








SELECT a.cas_adscripcion , doc_paciente
FROM asegurados a
WHERE a.doc_paciente IN (
'08103298','06541766','08467433','06823852','06832282','06829547','06818361','02712559',
'48405835','06242115','27554789','07074472','09400699','06825008','80145912','06832054',
'06822186','06824158','06824412','09172833','06708859','06820422','06827044','06828922',
'07549266','06699677','08507251','06820333','08069391','06820962','06827548','06826873',
'06834898','06836974','09402177','09401802','06603954','07712073','10550360','09226540',
'19851537','07951109','07341115','09228026','17557723','22895115','09037243','06819618',
'06828861','09228172','06870142','06831422','06824629','09227412','06825506','06825739',
'09172343','06828904','06825770','09170635','06927241','09248209','07985512','06088650',
'06967636','08785156','09223105','00339019','10295442','07658468','06974683','177523',
'06964313','06959365','06585410','02372128','04058940','09189345','06811441','06696383',
'07672366','07674392','04042609','06810833','20890308','08024276','07356086','16143015',
'07669077','04063992','10813949','07679337','07656160','04064613','22088655','16176468',
'16133560','09221981','09220148','07692059','21060226','07221804','09160783','07691496',
'07690905','07696666','06671230','07898601','07691873','07695182','16766136','23376192',
'08194219','07694332','07698367','07696183','08251000','07940664','07887683','07890270',
'10275329','07800282','07206732','07690472','07889607','07695793','07887237','06465898',
'07983558','22879465','07978596','10779331','06727267','10398335','07307057','25579057',
'07035870','07990440','10066508','17552092','06919767','15402547','07988303','08830213',
'10073062','09125181','09759937','01006340','07991946','06681611','09755286','20671791',
'20672011','07997960','32135207','09756038','18207825','09316095','10414570','06942794',
'06082154','08050464','06693775','07986153','10410540','06082985','02717555','07115355',
'07386507','08505283','07944401','06813742','09012350','06942103','06130563','08816323',
'07382117','06850586','08212390','08766237','40157810','08180624','07849334','06087392',
'08636077','08997433','02634867','08368999','07016123','06249199','07702542','07292134',
'08979187','25685836','25690887','25684545','25722179','06148287','25580405','06666073'
);





SELECT v.doc_paciente
FROM (
    VALUES
    ('08103298'),('06541766'),('08467433'),('06823852'),('06832282'),
    ('06829547'),('06818361'),('02712559'),('48405835'),('06242115'),
    ('27554789'),('07074472'),('09400699'),('06825008'),('80145912'),
    ('06832054'),('06822186'),('06824158'),('06824412'),('09172833'),
    ('06708859'),('06820422'),('06827044'),('06828922'),('07549266'),
    ('06699677'),('08507251'),('06820333'),('08069391'),('06820962'),
    ('06827548'),('06826873'),('06834898'),('06836974'),('09402177'),
    ('09401802'),('06603954'),('07712073'),('10550360'),('09226540'),
    ('19851537'),('07951109'),('07341115'),('09228026'),('17557723'),
    ('22895115'),('09037243'),('06819618'),('06828861'),('09228172'),
    ('06870142'),('06831422'),('06824629'),('09227412'),('06825506'),
    ('06825739'),('09172343'),('06828904'),('06825770'),('09170635'),
    ('06927241'),('09248209'),('07985512'),('06088650'),('06967636'),
    ('08785156'),('09223105'),('00339019'),('10295442'),('07658468'),
    ('06974683'),('177523'),('06964313'),('06959365'),('06585410'),
    ('02372128'),('04058940'),('09189345'),('06811441'),('06696383'),
    ('07672366'),('07674392'),('04042609'),('06810833'),('20890308'),
    ('08024276'),('07356086'),('16143015'),('07669077'),('04063992'),
    ('10813949'),('07679337'),('07656160'),('04064613'),('22088655'),
    ('16176468'),('16133560'),('09221981'),('09220148'),('07692059'),
    ('21060226'),('07221804'),('09160783'),('07691496'),('07690905'),
    ('07696666'),('06671230'),('07898601'),('07691873'),('07695182'),
    ('16766136'),('23376192'),('08194219'),('07694332'),('07698367'),
    ('07696183'),('08251000'),('07940664'),('07887683'),('07890270'),
    ('10275329'),('07800282'),('07206732'),('07690472'),('07889607'),
    ('07695793'),('07887237'),('06465898'),('07983558'),('22879465'),
    ('07978596'),('10779331'),('06727267'),('10398335'),('07307057'),
    ('25579057'),('07035870'),('07990440'),('10066508'),('17552092'),
    ('06919767'),('15402547'),('07988303'),('08830213'),('10073062'),
    ('09125181'),('09759937'),('01006340'),('07991946'),('06681611'),
    ('09755286'),('20671791'),('20672011'),('07997960'),('32135207'),
    ('09756038'),('18207825'),('09316095'),('10414570'),('06942794'),
    ('06082154'),('08050464'),('06693775'),('07986153'),('10410540'),
    ('06082985'),('02717555'),('07115355'),('07386507'),('08505283'),
    ('07944401'),('06813742'),('09012350'),('06942103'),('06130563'),
    ('08816323'),('07382117'),('06850586'),('08212390'),('08766237'),
    ('40157810'),('08180624'),('07849334'),('06087392'),('08636077'),
    ('08997433'),('02634867'),('08368999'),('07016123'),('06249199'),
    ('07702542'),('07292134'),('08979187'),('25685836'),('25690887'),
    ('25684545'),('25722179'),('06148287'),('25580405'),('06666073')
) AS v(doc_paciente)
WHERE NOT EXISTS (
    SELECT 1
    FROM asegurados a
    WHERE a.doc_paciente = v.doc_paciente
);


select * from asegurados a  where a.doc_paciente ='08103298';

select * from asegurados a  where a.doc_paciente ='70073164';



select * from dim_ipress di  where di.cod_ipress ='046';
select * from dim_ipress di  where di.cod_ipress ='396';



/*
27554789
22895115
09037243
00339019
07898601
07696183
07983558
22879465
07978596
17552092
06919767
20671791
32135207
18207825
08816323
08212390
08766237
25722179
*/



select * from dim_servicio_essi where desc_servicio='CARDIOLOGIA';





select * from dim_tipos_bolsas dtb ;
select * from dim_ipress di  where di.cod_ipress   = '396';
select * from dim_estados_gestion_citas degc 
--396

select * from dim_solicitud_bolsa dsb ;



--8 para id bolsa
-- 11L


select * from dim_ipress di  where di.cod_ipress  = '396';

select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress  from dim_solicitud_bolsa dsb ;



ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN idsolicitudGeneracion BIGINT;


ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN ipressReferencia int8 NULL;


ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_ipress_referencia
FOREIGN KEY (ipressReferencia)
REFERENCES public.dim_ipress(id_ipress)
ON DELETE SET NULL
ON UPDATE CASCADE;



select * from dim_solicitud_bolsa dsb  where paciente_id='08103298';

select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.ipressReferencia 
from dim_solicitud_bolsa dsb  where dsb.paciente_id='08103298'; 


--delete  from dim_solicitud_bolsa dsb  where paciente_id='08103298';

select * from dim_ipress di ;

select * from asegurados a  where a.doc_paciente ='08103298';
select * from dim_ipress where cod_ipress ='396';


select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress ,  dsb.*
from dim_solicitud_bolsa dsb  where dsb.idsolicitudgeneracion=1; 





-- 06541766
select * from dim_solicitud_bolsa dsb  where paciente_id='06541766';


delete from dim_solicitud_bolsa dsb  where dsb.idsolicitudgeneracion=1; 




select * from dim_solicitud_bolsa dsb  where paciente_id='06227575';

select * from dim_solicitud_bolsa dsb  where paciente_id='70073164';






select * from dim_estados_gestion_citas degc 

select * from dim_solicitud_bolsa dsb  where fecha_solicitud_dia='2026-02-17'
order by fecha_solicitud desc;




select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.*
from dim_solicitud_bolsa dsb  where paciente_id='70073164';

delete from dim_solicitud_bolsa dsb where paciente_id='70073164';


select * from asegurados where doc_paciente ='70073164';


select * from dim_ipress di  where di.cod_ipress='046';	-- 160
select * from dim_ipress di  where di.cod_ipress='159';  -- 38


select * from dim_ipress di where di.id_ipress  in (160,38);

7
update dim_solicitud_bolsa dsb  set id_ipress_atencion=7 where id_solicitud=46101;



select  dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.id_bolsa , 
dsb.estado, dsb.estado_gestion_citas_id , dsb.*
from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='70073164';

--update dim_solicitud_bolsa set estado_gestion_citas_id=7  where id_solicitud=46123


select  dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.id_bolsa , dsb.*
from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='46183586';

select * from asegurados a  where a.pk_asegurado  ='46183586';


select * from dim_tipos_bolsas dtb  where dtb.id_tipo_bolsa =4;








select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.id_bolsa , dsb.*
from  dim_solicitud_bolsa dsb
where dsb.numero_solicitud  like 'REC-%'

select dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.id_bolsa , dsb.*
from  dim_solicitud_bolsa dsb
where dsb.numero_solicitud  like 'INT%'













select  dsb.codigo_adscripcion , dsb.id_ipress , dsb.codigo_ipress , dsb.id_ipress_atencion, dsb.id_bolsa , 
dsb.estado, dsb.estado_gestion_citas_id , dsb.*
from dim_solicitud_bolsa dsb  where dsb.paciente_dni ='70073164';









