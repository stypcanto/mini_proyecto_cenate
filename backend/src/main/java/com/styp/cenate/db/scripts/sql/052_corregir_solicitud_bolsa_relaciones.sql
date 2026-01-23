-- ========================================================================
-- 🔧 Script SQL - Corrección Diseño dim_solicitud_bolsa
-- ========================================================================
-- Descripción: Elimina columnas duplicadas y establece FKs correctas
-- Versión: v1.0.0
-- Fecha: 2026-01-23
-- ========================================================================

-- ========================================================================
-- 1️⃣ Eliminar triggers temporalmente para evitar conflictos
-- ========================================================================
DROP TRIGGER IF EXISTS trg_sync_asegurado_datos ON public.dim_solicitud_bolsa;
DROP TRIGGER IF EXISTS trigger_solicitud_actualizacion ON public.dim_solicitud_bolsa;

-- ========================================================================
-- 2️⃣ Eliminar columnas innecesarias (duplicadas desde otras tablas)
-- ========================================================================
ALTER TABLE public.dim_solicitud_bolsa
    DROP COLUMN IF EXISTS paciente_telefono CASCADE;

ALTER TABLE public.dim_solicitud_bolsa
    DROP COLUMN IF EXISTS paciente_email CASCADE;

ALTER TABLE public.dim_solicitud_bolsa
    DROP COLUMN IF EXISTS responsable_gestora_nombre CASCADE;

ALTER TABLE public.dim_solicitud_bolsa
    DROP COLUMN IF EXISTS doc_paciente CASCADE;

-- ========================================================================
-- 3️⃣ Agregar Foreign Key para responsable_gestora_id → dim_usuarios
-- ========================================================================
-- Primero verificar si la columna existe y no tiene constraint ya
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_responsable_gestora
    FOREIGN KEY (responsable_gestora_id)
    REFERENCES public.dim_usuarios(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- ========================================================================
-- 4️⃣ Agregar Foreign Key para estado_gestion_citas_id → dim_estados_gestion_citas
-- ========================================================================
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_estado_gestion_citas
    FOREIGN KEY (estado_gestion_citas_id)
    REFERENCES public.dim_estados_gestion_citas(id_estado_cita)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- ========================================================================
-- 5️⃣ Restaurar triggers de auditoría
-- ========================================================================
CREATE OR REPLACE FUNCTION update_solicitud_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solicitud_actualizacion
BEFORE UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION update_solicitud_actualizacion();

-- ========================================================================
-- 6️⃣ Verificar cambios
-- ========================================================================
SELECT 'Columnas eliminadas correctamente' AS resultado;
SELECT COUNT(*) as registros_solicitud FROM public.dim_solicitud_bolsa;

-- ========================================================================
-- 📋 Nueva estructura de dim_solicitud_bolsa:
-- ========================================================================
-- id_solicitud (PK)
-- numero_solicitud (UNIQUE)
-- paciente_id (FK a asegurados.id_asegurado)
-- paciente_nombre
-- paciente_dni
-- especialidad
-- id_bolsa (FK a dim_bolsa)
-- estado (PENDIENTE|APROBADA|RECHAZADA)
-- razon_rechazo
-- notas_aprobacion
-- solicitante_id
-- solicitante_nombre
-- responsable_aprobacion_id
-- responsable_aprobacion_nombre
-- responsable_gestora_id (FK a dim_usuarios)
-- fecha_asignacion
-- estado_gestion_citas_id (FK a dim_estados_gestion_citas)
-- recordatorio_enviado
-- fecha_solicitud
-- fecha_aprobacion
-- fecha_actualizacion
-- activo
-- ========================================================================
