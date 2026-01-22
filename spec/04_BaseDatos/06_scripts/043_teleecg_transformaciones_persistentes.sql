-- ============================================================================================================
-- 🫀 SCRIPT: 043_teleecg_transformaciones_persistentes.sql
-- ============================================================================================================
-- Propósito: Agregar persistencia de transformaciones de imágenes EKG
-- - Rotación (0°, 90°, 180°, 270°)
-- - Flip Horizontal (espejo izquierda-derecha)
-- - Flip Vertical (arriba-abajo)
--
-- Características:
-- ✅ Transformaciones guardadas en BD (permanentes)
-- ✅ Validación de valores permitidos
-- ✅ Auditoría integrada en capa de aplicación
-- ✅ Sin cambios en contenido de imagen (solo metadatos)
--
-- Versión: v1.0.0
-- Fecha: 2026-01-21
-- ============================================================================================================

-- Agregar columnas para transformaciones persistentes
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS rotacion INTEGER DEFAULT 0 CHECK (rotacion IN (0, 90, 180, 270)),
ADD COLUMN IF NOT EXISTS flip_horizontal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flip_vertical BOOLEAN DEFAULT FALSE;

-- Crear índice para optimizar búsquedas por transformaciones
CREATE INDEX IF NOT EXISTS idx_tele_ecg_transformaciones
ON tele_ecg_imagenes(rotacion, flip_horizontal, flip_vertical);

-- Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN tele_ecg_imagenes.rotacion IS
  'Rotación aplicada a la imagen en grados (0, 90, 180, 270). Se guarda como metadato, no modifica el contenido original.';

COMMENT ON COLUMN tele_ecg_imagenes.flip_horizontal IS
  'Imagen volteada horizontalmente (espejo). Útil cuando se escanea al revés. FALSE = normal, TRUE = volteada.';

COMMENT ON COLUMN tele_ecg_imagenes.flip_vertical IS
  'Imagen volteada verticalmente (boca abajo). FALSE = normal, TRUE = volteada.';

-- ============================================================================================================
-- Auditoría de cambios
-- ============================================================================================================
-- Registre los cambios en la tabla de auditoría (v1.22.0+)
-- Los cambios de transformaciones se registran automáticamente en:
-- - Tabla: tele_ecg_auditoria
-- - Tipo: TRANSFORMACION_ACTUALIZADA, IMAGEN_RECORTADA
-- - Campo: detalles (contiene información de qué transformaciones se aplicaron)

-- ============================================================================================================
-- Queries de ejemplo para administradores
-- ============================================================================================================

-- Ver todas las imágenes con alguna transformación aplicada
-- SELECT id_imagen, nombre_archivo, rotacion, flip_horizontal, flip_vertical
-- FROM tele_ecg_imagenes
-- WHERE rotacion > 0 OR flip_horizontal = TRUE OR flip_vertical = TRUE
-- ORDER BY fecha_creacion DESC;

-- Ver historial de transformaciones de una imagen
-- SELECT * FROM tele_ecg_auditoria
-- WHERE id_imagen = ? AND tipo IN ('TRANSFORMACION_ACTUALIZADA', 'IMAGEN_RECORTADA')
-- ORDER BY fecha DESC;

-- Restaurar rotación de una imagen a 0
-- UPDATE tele_ecg_imagenes SET rotacion = 0 WHERE id_imagen = ?;

-- ============================================================================================================
-- Compatibilidad hacia atrás
-- ============================================================================================================
-- Las nuevas columnas tienen valores por defecto, por lo que las imágenes existentes funcionarán sin cambios.
-- Rotación = 0, flip_horizontal = false, flip_vertical = false (estado normal)
