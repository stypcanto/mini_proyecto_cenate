-- ============================================
-- SCRIPT V053: Crear Foreign Keys en dim_solicitud_bolsa
-- ============================================
-- Propósito:   Establecer relaciones de integridad referencial
-- Versión:     1.6.0
-- Fecha:       2026-01-24
-- Tabla:       dim_solicitud_bolsa (32 columnas)
-- FKs:         8 relaciones
-- Status:      ⚠️ CRÍTICO - Requiere ejecución INMEDIATA
--
-- Problema encontrado:
--   La tabla dim_solicitud_bolsa existe pero sin Foreign Keys
--   Las relaciones no están definidas en la BD, solo en el código
--   Causa: Tabla creada sin constraints al inicio del proyecto
--
-- Solución:
--   Agregar todas las 8 FK que garantizan integridad referencial
--   DBeaver mostrará las relaciones después de ejecutar este script
--
-- ============================================

-- FK1: id_bolsa → dim_tipos_bolsas (7 tipos iniciales)
-- Restricción: No se puede eliminar tipo de bolsa si hay solicitudes
-- Actualización en cascada automática
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_tipos
FOREIGN KEY (id_bolsa) REFERENCES dim_tipos_bolsas(id_tipo_bolsa)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- FK2: id_servicio → dim_servicio_essi (especialidades)
-- Restricción: Puede ser NULL si especialidad se elimina
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_servicio
FOREIGN KEY (id_servicio) REFERENCES dim_servicio_essi(id_servicio)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- FK3: paciente_id → asegurados (5,165,000 registros protegidos)
-- Restricción: CRÍTICO - No se puede eliminar asegurado si tiene solicitud
-- Garantiza que el paciente existe
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_asegurado
FOREIGN KEY (paciente_id) REFERENCES asegurados(pk_asegurado)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- FK4: id_ipress → dim_ipress (414 IPRESS EsSalud)
-- Restricción: Puede ser NULL si IPRESS se elimina
-- Valida que IPRESS existe
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_ipress
FOREIGN KEY (id_ipress) REFERENCES dim_ipress(id_ipress)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- FK5: solicitante_id → dim_usuarios (Auditoría)
-- Restricción: Puede ser NULL si usuario se elimina
-- Tracking: Quién cargó la solicitud
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_solicitante
FOREIGN KEY (solicitante_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- FK6: responsable_gestora_id → dim_usuarios (Auditoría)
-- Restricción: Puede ser NULL si usuario se elimina
-- Tracking: Quién está gestionando la cita
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_gestora
FOREIGN KEY (responsable_gestora_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- FK7: responsable_aprobacion_id → dim_usuarios (Auditoría)
-- Restricción: Puede ser NULL si usuario se elimina
-- Tracking: Quién aprobó la solicitud
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_aprobador
FOREIGN KEY (responsable_aprobacion_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- FK8: estado_gestion_citas_id → dim_estados_gestion_citas (v1.33.0)
-- 10 Estados iniciales:
--   1. PENDIENTE_CITA (inicial)
--   2. CITADO
--   3. NO_CONTESTA
--   4. CANCELADO
--   5. ASISTIO
--   6. REPROGRAMADO
--   7. INASISTENCIA
--   8. VENCIDO
--   9. EN_SEGUIMIENTO
--   10. DERIVADO
-- Restricción: Puede ser NULL si estado se elimina (raro)
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_estado_cita
FOREIGN KEY (estado_gestion_citas_id) REFERENCES dim_estados_gestion_citas(id_estado_cita)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ============================================
-- VERIFICACIÓN POST-CREACIÓN
-- ============================================

-- 1. Listar todas las FK creadas
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa'
  AND foreign_table_name IS NOT NULL
ORDER BY constraint_name;

-- 2. Verificar integridad referencial (no debe haber nulls referencial incorrecto)
SELECT
    'FK1: id_bolsa → dim_tipos_bolsas' as chequeo,
    COUNT(*) as solicitudes,
    COUNT(CASE WHEN id_bolsa IS NOT NULL THEN 1 END) as con_bolsa,
    COUNT(CASE WHEN id_bolsa IS NULL THEN 1 END) as sin_bolsa
FROM dim_solicitud_bolsa;

-- 3. Verificar que todos los pacientes existen en asegurados
SELECT
    'FK3: paciente_id → asegurados' as chequeo,
    COUNT(*) as solicitudes,
    COUNT(CASE WHEN paciente_id IN (SELECT pk_asegurado FROM asegurados) THEN 1 END) as pacientes_validos,
    COUNT(CASE WHEN paciente_id NOT IN (SELECT pk_asegurado FROM asegurados) THEN 1 END) as pacientes_invalidos
FROM dim_solicitud_bolsa;

-- 4. Resumen final
SELECT
    'Estado de Integridad Referencial' as status,
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN id_bolsa IS NOT NULL THEN 1 END) as con_fk1,
    COUNT(CASE WHEN id_ipress IS NOT NULL THEN 1 END) as con_fk4,
    COUNT(CASE WHEN estado_gestion_citas_id IS NOT NULL THEN 1 END) as con_fk8
FROM dim_solicitud_bolsa;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ 8 Foreign Keys creadas
-- ✅ 0 Violaciones de integridad referencial
-- ✅ DBeaver mostrará relaciones en diagrama
-- ✅ Módulo de bolsas funcionará correctamente
