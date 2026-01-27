-- ============================================================
-- NORMALIZACIÓN DE CÓDIGOS IPRESS A 3 DÍGITOS (v1.13.9b)
-- ============================================================

-- Normalizar todos los códigos IPRESS con menos de 3 dígitos
UPDATE dim_solicitud_bolsa
SET codigo_ipress = LPAD(codigo_ipress, 3, '0')
WHERE codigo_ipress IS NOT NULL
  AND codigo_ipress != ''
  AND LENGTH(codigo_ipress) < 3;

-- Log de cambios:
-- 162 registros con "21" → "021"
-- 3 registros con "67" → "067"
-- 1 registro con "80" → "080"
-- Total: 166 registros actualizados
