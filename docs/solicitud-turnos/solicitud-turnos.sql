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































