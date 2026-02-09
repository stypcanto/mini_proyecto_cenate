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
delete from  detalle_solicitud_turno where id_solicitud  in (110,111,112);
delete from  solicitud_turno_ipress where id_solicitud  in (110,111,112);
