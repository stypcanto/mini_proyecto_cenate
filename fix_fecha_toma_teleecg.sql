-- ════════════════════════════════════════════════════════════════════════════════════════
-- FIX: Llenar campo fecha_toma en registros existentes de tele_ecg_imagenes
-- ════════════════════════════════════════════════════════════════════════════════════════
-- Descripción: Actualizar fecha_toma con la fecha del fecha_envio para registros que no la tengan
-- Autor: Styp Canto
-- Fecha: 2026-02-11
-- ════════════════════════════════════════════════════════════════════════════════════════

-- 1. Verificar cuántos registros tienen fecha_toma vacía
SELECT COUNT(*) as registros_sin_fecha_toma
FROM tele_ecg_imagenes
WHERE fecha_toma IS NULL;

-- 2. Actualizar los registros que tengan fecha_toma NULL
-- Usar la fecha de envío (CAST a DATE para quitar la hora)
UPDATE tele_ecg_imagenes
SET fecha_toma = CAST(fecha_envio AS DATE)
WHERE fecha_toma IS NULL AND fecha_envio IS NOT NULL;

-- 3. Verificar la actualización
SELECT COUNT(*) as registros_con_fecha_toma
FROM tele_ecg_imagenes
WHERE fecha_toma IS NOT NULL;

-- 4. Ver algunos ejemplos de los datos actualizados
SELECT
    id_imagen,
    num_doc_paciente,
    fecha_envio,
    fecha_toma,
    estado
FROM tele_ecg_imagenes
WHERE fecha_toma IS NOT NULL
ORDER BY fecha_toma DESC
LIMIT 10;
