-- ============================================================================
-- 🔒 SCRIPT: Mejorar Constraint para Prevenir Creación de Formularios Duplicados
-- ============================================================================
--
-- Versión: v1.37.0
-- Fecha: 2026-01-26
-- Objetivo: Impedir que se cree un nuevo formulario cuando ya existe uno
--           EN_PROCESO sin completar
--
-- Contexto del problema:
--   - Usuario crea formulario EN_PROCESO
--   - Sin completarlo, crea OTRO formulario
--   - Luego envía el segundo, quedando 2 registros: EN_PROCESO + ENVIADO
--   - El dashboard cuenta ambos, confundiendo la estadística
--
-- ============================================================================

-- 🔒 Crear constraint mejorado que previene múltiples EN_PROCESO
-- (Este ya existe, solo para referencia)
-- CREATE UNIQUE INDEX idx_uq_formulario_en_proceso_por_ipress_anio
-- ON form_diag_formulario (id_ipress, anio)
-- WHERE estado = 'EN_PROCESO';

-- ============================================================================
-- 📋 MEDIDAS ADICIONALES (Backend y Workflow)
-- ============================================================================
--
-- El constraint actual protege EN_PROCESO + EN_PROCESO
-- Pero se necesita lógica en el BACKEND para:
--
-- 1️⃣ ANTES DE CREAR un nuevo formulario:
--    - Buscar si existe uno EN_PROCESO para esa IPRESS+año
--    - Si existe: retornar error 409 CONFLICT indicando que debe completar el existente
--    - Si NO existe: permitir crear uno nuevo
--
-- 2️⃣ WORKFLOW RECOMENDADO:
--    - Usuario accede a "Nuevo Formulario"
--    - Sistema busca: SELECT ... FROM form_diag_formulario
--                     WHERE id_ipress = ? AND anio = ? AND estado = 'EN_PROCESO'
--    - Si existe: mostrar formulario existente para continuar editando
--    - Si NO existe: permitir crear uno nuevo
--
-- 3️⃣ VALIDACIÓN EN FORMULARIO ENVIADO:
--    - Al enviar, cambiar estado de EN_PROCESO a ENVIADO (UPDATE, no INSERT)
--    - Esto evita crear duplicados
--
-- ============================================================================

-- ✅ VERIFICACIÓN: Confirmar que H.I ANDAHUAYLAS está limpio
SELECT id_formulario, id_ipress, anio, estado, fecha_creacion, fecha_envio
FROM form_diag_formulario
WHERE id_ipress = 55
ORDER BY fecha_creacion;

-- Resultado esperado: Solo 1 registro (ENVIADO)
-- Resultado que indica duplicado: 2+ registros
