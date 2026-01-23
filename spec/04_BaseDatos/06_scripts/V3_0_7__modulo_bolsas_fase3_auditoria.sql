-- ============================================================================
-- 🔐 Migración: Módulo de Bolsas Fase 3 - Auditoría Completa
-- Tabla: dim_solicitud_bolsa (Triggers y Auditoría)
-- Descripción: Crear triggers para auditar todos los cambios en solicitudes
-- Autor: Sistema CENATE
-- Fecha: 2026-01-22
-- ============================================================================

-- ============================================================================
-- TABLA 1: dim_auditoria_cambios_solicitud
-- Propósito: Registrar cada cambio realizado en una solicitud
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dim_auditoria_cambios_solicitud (
    id_auditoria BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    usuario_id BIGINT,
    usuario_nombre VARCHAR(255),
    tipo_operacion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    campo_modificado VARCHAR(255),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_cliente VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_auditoria_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auditoria_solicitud
ON public.dim_auditoria_cambios_solicitud(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario
ON public.dim_auditoria_cambios_solicitud(usuario_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_tipo_operacion
ON public.dim_auditoria_cambios_solicitud(tipo_operacion);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha
ON public.dim_auditoria_cambios_solicitud(fecha_cambio DESC);

-- ============================================================================
-- TABLA 2: dim_auditoria_estado_solicitud
-- Propósito: Histórico de transiciones de estado
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dim_auditoria_estado_solicitud (
    id_historial BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    usuario_id BIGINT,
    usuario_nombre VARCHAR(255),
    motivo_cambio VARCHAR(500),
    fecha_transicion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_estado_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_estado_usuario FOREIGN KEY (usuario_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_estado_solicitud
ON public.dim_auditoria_estado_solicitud(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_estado_fecha
ON public.dim_auditoria_estado_solicitud(fecha_transicion DESC);

CREATE INDEX IF NOT EXISTS idx_estado_anterior
ON public.dim_auditoria_estado_solicitud(estado_anterior);

-- ============================================================================
-- TABLA 3: dim_auditoria_contacto_paciente
-- Propósito: Historial de cambios de contacto (teléfono, email)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dim_auditoria_contacto_paciente (
    id_cambio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    tipo_contacto VARCHAR(20) NOT NULL, -- TELEFONO, EMAIL
    valor_anterior VARCHAR(255),
    valor_nuevo VARCHAR(255) NOT NULL,
    usuario_id BIGINT,
    usuario_nombre VARCHAR(255),
    razon_cambio VARCHAR(255),
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_contacto_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_contacto_usuario FOREIGN KEY (usuario_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contacto_solicitud
ON public.dim_auditoria_contacto_paciente(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_contacto_tipo
ON public.dim_auditoria_contacto_paciente(tipo_contacto);

CREATE INDEX IF NOT EXISTS idx_contacto_fecha
ON public.dim_auditoria_contacto_paciente(fecha_cambio DESC);

-- ============================================================================
-- TABLA 4: dim_auditoria_asignacion_gestora
-- Propósito: Historial completo de asignaciones a gestoras
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dim_auditoria_asignacion_gestora (
    id_cambio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    gestora_anterior_id BIGINT,
    gestora_anterior_nombre VARCHAR(255),
    gestora_nueva_id BIGINT,
    gestora_nueva_nombre VARCHAR(255) NOT NULL,
    coordinador_id BIGINT,
    coordinador_nombre VARCHAR(255),
    razon_reasignacion VARCHAR(500),
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_asign_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_asign_gestora_nueva FOREIGN KEY (gestora_nueva_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_asign_coordinador FOREIGN KEY (coordinador_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asign_solicitud
ON public.dim_auditoria_asignacion_gestora(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_asign_gestora
ON public.dim_auditoria_asignacion_gestora(gestora_nueva_id);

CREATE INDEX IF NOT EXISTS idx_asign_fecha
ON public.dim_auditoria_asignacion_gestora(fecha_asignacion DESC);

-- ============================================================================
-- TABLA 5: dim_auditoria_recordatorios
-- Propósito: Registro de todos los recordatorios enviados
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dim_auditoria_recordatorios (
    id_recordatorio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    tipo_recordatorio VARCHAR(20) NOT NULL, -- EMAIL, WHATSAPP
    contacto_destino VARCHAR(255),
    mensaje_enviado TEXT,
    estado_entrega VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, ENVIADO, FALLIDO, ENTREGADO
    error_mensaje TEXT,
    usuario_solicitante_id BIGINT,
    usuario_solicitante_nombre VARCHAR(255),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_record_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_record_usuario FOREIGN KEY (usuario_solicitante_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_record_solicitud
ON public.dim_auditoria_recordatorios(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_record_tipo
ON public.dim_auditoria_recordatorios(tipo_recordatorio);

CREATE INDEX IF NOT EXISTS idx_record_estado
ON public.dim_auditoria_recordatorios(estado_entrega);

CREATE INDEX IF NOT EXISTS idx_record_fecha
ON public.dim_auditoria_recordatorios(fecha_solicitud DESC);

-- ============================================================================
-- TRIGGER 1: Log de cambios de estado
-- Acción: Registrar cada transición de estado
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO public.dim_auditoria_estado_solicitud (
            id_solicitud,
            estado_anterior,
            estado_nuevo,
            fecha_transicion
        ) VALUES (
            NEW.id_solicitud,
            OLD.estado,
            NEW.estado,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Estado cambió de % a % para solicitud %',
            OLD.estado, NEW.estado, NEW.id_solicitud;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_estado_solicitud ON public.dim_solicitud_bolsa;
CREATE TRIGGER trg_auditoria_estado_solicitud
AFTER UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_auditoria_cambio_estado();

-- ============================================================================
-- TRIGGER 2: Log de cambios de teléfono
-- Acción: Registrar cambios de contacto telefónico
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_cambio_telefono()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.paciente_telefono != NEW.paciente_telefono THEN
        INSERT INTO public.dim_auditoria_contacto_paciente (
            id_solicitud,
            tipo_contacto,
            valor_anterior,
            valor_nuevo,
            fecha_cambio
        ) VALUES (
            NEW.id_solicitud,
            'TELEFONO',
            OLD.paciente_telefono,
            NEW.paciente_telefono,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Teléfono cambió de % a % para solicitud %',
            OLD.paciente_telefono, NEW.paciente_telefono, NEW.id_solicitud;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_telefono_solicitud ON public.dim_solicitud_bolsa;
CREATE TRIGGER trg_auditoria_telefono_solicitud
AFTER UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_auditoria_cambio_telefono();

-- ============================================================================
-- TRIGGER 3: Log de cambios de email
-- Acción: Registrar cambios de contacto email
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_cambio_email()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.paciente_email != NEW.paciente_email THEN
        INSERT INTO public.dim_auditoria_contacto_paciente (
            id_solicitud,
            tipo_contacto,
            valor_anterior,
            valor_nuevo,
            fecha_cambio
        ) VALUES (
            NEW.id_solicitud,
            'EMAIL',
            OLD.paciente_email,
            NEW.paciente_email,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Email cambió de % a % para solicitud %',
            OLD.paciente_email, NEW.paciente_email, NEW.id_solicitud;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_email_solicitud ON public.dim_solicitud_bolsa;
CREATE TRIGGER trg_auditoria_email_solicitud
AFTER UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_auditoria_cambio_email();

-- ============================================================================
-- TRIGGER 4: Log de asignación a gestora
-- Acción: Registrar cambios de asignación a gestora de citas
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_cambio_gestora()
RETURNS TRIGGER AS $$
BEGIN
    IF COALESCE(OLD.responsable_gestora_id, 0) != COALESCE(NEW.responsable_gestora_id, 0) THEN
        INSERT INTO public.dim_auditoria_asignacion_gestora (
            id_solicitud,
            gestora_anterior_id,
            gestora_anterior_nombre,
            gestora_nueva_id,
            gestora_nueva_nombre,
            fecha_asignacion
        ) VALUES (
            NEW.id_solicitud,
            OLD.responsable_gestora_id,
            OLD.responsable_gestora_nombre,
            NEW.responsable_gestora_id,
            NEW.responsable_gestora_nombre,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Gestora cambió de % a % para solicitud %',
            OLD.responsable_gestora_nombre, NEW.responsable_gestora_nombre, NEW.id_solicitud;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_gestora_solicitud ON public.dim_solicitud_bolsa;
CREATE TRIGGER trg_auditoria_gestora_solicitud
AFTER UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_auditoria_cambio_gestora();

-- ============================================================================
-- TRIGGER 5: Log de creación de solicitud
-- Acción: Registrar cuando se crea una nueva solicitud
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_auditoria_creacion_solicitud()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.dim_auditoria_estado_solicitud (
        id_solicitud,
        estado_anterior,
        estado_nuevo,
        motivo_cambio,
        fecha_transicion
    ) VALUES (
        NEW.id_solicitud,
        NULL,
        NEW.estado,
        'Solicitud creada',
        NEW.fecha_solicitud
    );

    RAISE NOTICE 'Solicitud % creada en estado %', NEW.id_solicitud, NEW.estado;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditoria_creacion_solicitud ON public.dim_solicitud_bolsa;
CREATE TRIGGER trg_auditoria_creacion_solicitud
AFTER INSERT ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_auditoria_creacion_solicitud();

-- ============================================================================
-- VISTA: vw_auditoria_completa_solicitud
-- Propósito: Ver el historial completo de una solicitud
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_auditoria_completa_solicitud AS
SELECT
    s.id_solicitud,
    s.numero_solicitud,
    s.paciente_nombre,
    s.paciente_dni,
    s.estado,
    s.responsable_gestora_nombre,
    s.fecha_solicitud,
    'CREACIÓN' AS tipo_evento,
    s.fecha_solicitud AS fecha_evento,
    'Solicitud creada' AS descripcion_evento,
    NULL AS usuario_nombre
FROM public.dim_solicitud_bolsa s

UNION ALL

SELECT
    das.id_solicitud,
    sb.numero_solicitud,
    sb.paciente_nombre,
    sb.paciente_dni,
    sb.estado,
    sb.responsable_gestora_nombre,
    sb.fecha_solicitud,
    'CAMBIO ESTADO' AS tipo_evento,
    das.fecha_transicion AS fecha_evento,
    CONCAT('Estado cambió de ', das.estado_anterior, ' a ', das.estado_nuevo) AS descripcion_evento,
    das.usuario_nombre
FROM public.dim_auditoria_estado_solicitud das
JOIN public.dim_solicitud_bolsa sb ON das.id_solicitud = sb.id_solicitud

UNION ALL

SELECT
    dac.id_solicitud,
    sb.numero_solicitud,
    sb.paciente_nombre,
    sb.paciente_dni,
    sb.estado,
    sb.responsable_gestora_nombre,
    sb.fecha_solicitud,
    'CAMBIO CONTACTO' AS tipo_evento,
    dac.fecha_cambio AS fecha_evento,
    CONCAT(dac.tipo_contacto, ' cambió de ', dac.valor_anterior, ' a ', dac.valor_nuevo) AS descripcion_evento,
    dac.usuario_nombre
FROM public.dim_auditoria_contacto_paciente dac
JOIN public.dim_solicitud_bolsa sb ON dac.id_solicitud = sb.id_solicitud

UNION ALL

SELECT
    dag.id_solicitud,
    sb.numero_solicitud,
    sb.paciente_nombre,
    sb.paciente_dni,
    sb.estado,
    sb.responsable_gestora_nombre,
    sb.fecha_solicitud,
    'CAMBIO GESTORA' AS tipo_evento,
    dag.fecha_asignacion AS fecha_evento,
    CONCAT('Asignada a gestora ', dag.gestora_nueva_nombre) AS descripcion_evento,
    dag.coordinador_nombre AS usuario_nombre
FROM public.dim_auditoria_asignacion_gestora dag
JOIN public.dim_solicitud_bolsa sb ON dag.id_solicitud = sb.id_solicitud

UNION ALL

SELECT
    dar.id_solicitud,
    sb.numero_solicitud,
    sb.paciente_nombre,
    sb.paciente_dni,
    sb.estado,
    sb.responsable_gestora_nombre,
    sb.fecha_solicitud,
    CONCAT('RECORDATORIO ', dar.tipo_recordatorio) AS tipo_evento,
    dar.fecha_solicitud AS fecha_evento,
    CONCAT('Recordatorio ', dar.tipo_recordatorio, ' enviado - Estado: ', dar.estado_entrega) AS descripcion_evento,
    dar.usuario_solicitante_nombre
FROM public.dim_auditoria_recordatorios dar
JOIN public.dim_solicitud_bolsa sb ON dar.id_solicitud = sb.id_solicitud

ORDER BY fecha_evento DESC;

-- ============================================================================
-- PROCEDIMIENTO: sp_obtener_auditoria_solicitud
-- Propósito: Obtener auditoría completa de una solicitud específica
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sp_obtener_auditoria_solicitud(
    p_id_solicitud BIGINT,
    p_limite INT DEFAULT 100
)
RETURNS TABLE (
    tipo_evento VARCHAR,
    fecha_evento TIMESTAMP WITH TIME ZONE,
    descripcion TEXT,
    usuario_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vw.tipo_evento::VARCHAR,
        vw.fecha_evento,
        vw.descripcion_evento::TEXT,
        vw.usuario_nombre::VARCHAR
    FROM public.vw_auditoria_completa_solicitud vw
    WHERE vw.id_solicitud = p_id_solicitud
    ORDER BY vw.fecha_evento DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PROCEDIMIENTO: sp_reportar_cambios_solicitud
-- Propósito: Generar reporte de cambios en un rango de fechas
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sp_reportar_cambios_solicitud(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    id_solicitud BIGINT,
    numero_solicitud VARCHAR,
    paciente_nombre VARCHAR,
    tipo_evento VARCHAR,
    cantidad_eventos BIGINT,
    ultima_fecha_evento TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vw.id_solicitud,
        vw.numero_solicitud,
        vw.paciente_nombre,
        vw.tipo_evento,
        COUNT(*) AS cantidad_eventos,
        MAX(vw.fecha_evento) AS ultima_fecha_evento
    FROM public.vw_auditoria_completa_solicitud vw
    WHERE DATE(vw.fecha_evento) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY vw.id_solicitud, vw.numero_solicitud, vw.paciente_nombre, vw.tipo_evento
    ORDER BY vw.id_solicitud DESC, ultima_fecha_evento DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTAS DE MIGRACIÓN
-- ============================================================================
--
-- TABLAS CREADAS:
-- 1. dim_auditoria_cambios_solicitud     - Log detallado de todos los cambios
-- 2. dim_auditoria_estado_solicitud      - Historial de cambios de estado
-- 3. dim_auditoria_contacto_paciente     - Cambios de teléfono/email
-- 4. dim_auditoria_asignacion_gestora    - Cambios de asignación
-- 5. dim_auditoria_recordatorios         - Registro de recordatorios enviados
--
-- TRIGGERS CREADOS:
-- 1. trg_auditoria_estado_solicitud      - Audita cambios de estado
-- 2. trg_auditoria_telefono_solicitud    - Audita cambios de teléfono
-- 3. trg_auditoria_email_solicitud       - Audita cambios de email
-- 4. trg_auditoria_gestora_solicitud     - Audita cambios de gestora
-- 5. trg_auditoria_creacion_solicitud    - Audita creación
--
-- VISTAS CREADAS:
-- 1. vw_auditoria_completa_solicitud     - Vista unificada de auditoría
--
-- PROCEDIMIENTOS CREADOS:
-- 1. sp_obtener_auditoria_solicitud(id)  - Obtener auditoría de una solicitud
-- 2. sp_reportar_cambios_solicitud(fecha_inicio, fecha_fin) - Generar reporte
--
-- USO:
-- SELECT * FROM vw_auditoria_completa_solicitud WHERE id_solicitud = 123;
-- SELECT * FROM sp_obtener_auditoria_solicitud(123);
-- SELECT * FROM sp_reportar_cambios_solicitud('2026-01-01', '2026-01-31');
--
-- BENEFICIOS:
-- ✅ Auditoría completa de todas las solicitudes
-- ✅ Trazabilidad total de cambios
-- ✅ Identificación de quién hizo qué y cuándo
-- ✅ Reportes para cumplimiento normativo
-- ✅ Detección de cambios sospechosos
--
-- ============================================================================
