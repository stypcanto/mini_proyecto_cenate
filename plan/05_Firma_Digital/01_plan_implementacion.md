# Plan de Implementación: Módulo Firma Digital (ACTUALIZADO)

> **Versión:** v1.14.0
> **Fecha:** 2025-12-30
> **Autor:** Ing. Styp Canto Rondon
> **Estado:** Planificación Completa

---

## Resumen Ejecutivo

**Objetivo:** Implementar pestaña "Firma Digital" en creación/edición de usuarios para gestionar certificados digitales del personal interno (régimen CAS y 728).

**Ubicación:** Entre "Datos Laborales" y "Roles del Sistema" (solo usuarios INTERNOS)

**Alcance:**
- Nueva tabla `firma_digital_personal` en BD con campos para número de serie del token
- Backend: Entidad, Repository, Service, DTOs con soporte para actualización de estado PENDIENTE
- Frontend: Componente `FirmaDigitalTab.jsx` con lógica de edición de entregas pendientes
- Integración en `CrearUsuarioModal.jsx` y `ActualizarModel.jsx`

---

## Flujo de Negocio ACTUALIZADO

```
Usuario INTERNO → Datos Laborales → Firma Digital
                                          ↓
                              ¿Régimen LOCADOR?
                         ┌─────────┴─────────┐
                        SÍ                   NO (CAS/728)
                         │                    │
            Mensaje informativo      ¿Entregó token?
            "Gestiona su propia      ┌────┴────┐
             firma digital"          SÍ        NO
                         │            │        │
                         ↓            ↓        ↓
                    A Roles    Capturar:  Motivo:
                               • Fechas certificado     • YA_TIENE → Capturar fechas existentes
                               • N° Serie Token (NUEVO) • NO_REQUIERE
                                                        • PENDIENTE → Guardar como pendiente
                                                              ↓
                                                        (EDICIÓN POSTERIOR)
                                                              ↓
                                                   "Registrar entrega de token"
                                                              ↓
                                                        Capturar:
                                                        • N° Serie Token
                                                        • Fechas certificado
                                                        • Fecha entrega
                                                        • Cambiar estado a "Entregado"
```

**Validaciones:**
- Si entregó token = SÍ: Fechas obligatorias, número de serie obligatorio
- Si entregó token = NO: Motivo obligatorio
- Si motivo = YA_TIENE: Fechas del certificado existente obligatorias
- Si motivo = PENDIENTE: Permitir edición posterior para registrar entrega

---

## Fase 1: Base de Datos

### Crear tabla `firma_digital_personal`

**Archivo:** `spec/scripts/015_crear_tabla_firma_digital_personal.sql`

**Campos principales:**
- `id_firma_personal` (PK, SERIAL)
- `id_personal` (FK → dim_personal_cnt.id_pers)
- `entrego_token` (BOOLEAN, NOT NULL, default FALSE)
- **`numero_serie_token` (VARCHAR(100), nullable)** ← NUEVO
- **`fecha_entrega_token` (DATE, nullable)** ← NUEVO
- `fecha_inicio_certificado` (DATE, nullable)
- `fecha_vencimiento_certificado` (DATE, nullable)
- `motivo_sin_token` (VARCHAR(50): YA_TIENE, NO_REQUIERE, PENDIENTE)
- `observaciones` (TEXT)
- `stat_firma` (CHAR(1): A/I)
- `created_at`, `updated_at` (timestamps)

**Constraints críticos ACTUALIZADOS:**
```sql
-- Si entregó token, DEBE tener fechas Y número de serie
CHECK (
  (entrego_token = TRUE AND fecha_inicio_certificado IS NOT NULL
   AND fecha_vencimiento_certificado IS NOT NULL
   AND numero_serie_token IS NOT NULL)
  OR (entrego_token = FALSE)
)

-- Si NO entregó token, DEBE tener motivo
CHECK (
  (entrego_token = FALSE AND motivo_sin_token IS NOT NULL)
  OR (entrego_token = TRUE AND motivo_sin_token IS NULL)
)

-- Fecha vencimiento > fecha inicio
CHECK (
  fecha_vencimiento_certificado IS NULL
  OR fecha_inicio_certificado IS NULL
  OR fecha_vencimiento_certificado > fecha_inicio_certificado
)

-- Si motivo YA_TIENE, DEBE tener fechas del certificado existente
CHECK (
  (motivo_sin_token = 'YA_TIENE' AND fecha_inicio_certificado IS NOT NULL
   AND fecha_vencimiento_certificado IS NOT NULL)
  OR (motivo_sin_token IS NULL OR motivo_sin_token IN ('NO_REQUIERE', 'PENDIENTE'))
)

-- Si tiene número de serie, debe haber entregado token
CHECK (
  (numero_serie_token IS NOT NULL AND entrego_token = TRUE)
  OR (numero_serie_token IS NULL)
)
```

**Ejecutar:**
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -f spec/scripts/015_crear_tabla_firma_digital_personal.sql
```

---

## Fase 2: Backend

### Archivos a crear:

1. **`backend/src/main/java/com/styp/cenate/model/FirmaDigitalPersonal.java`**
2. **`backend/src/main/java/com/styp/cenate/repository/FirmaDigitalPersonalRepository.java`**
3. **`backend/src/main/java/com/styp/cenate/dto/FirmaDigitalRequest.java`**
4. **`backend/src/main/java/com/styp/cenate/dto/FirmaDigitalResponse.java`**
5. **`backend/src/main/java/com/styp/cenate/dto/ActualizarEntregaTokenRequest.java`** ← NUEVO
6. **`backend/src/main/java/com/styp/cenate/service/firmadigital/FirmaDigitalService.java`**
7. **`backend/src/main/java/com/styp/cenate/service/firmadigital/impl/FirmaDigitalServiceImpl.java`**
8. **`backend/src/main/java/com/styp/cenate/api/firmadigital/FirmaDigitalController.java`** ← NUEVO

### Archivos a modificar:

9. **`backend/src/main/java/com/styp/cenate/dto/UsuarioCreateRequest.java`**
10. **`backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`**

---

## Fase 3: Frontend

### Archivos a crear:

1. **`frontend/src/pages/user/components/common/FirmaDigitalTab.jsx`**
2. **`frontend/src/pages/user/components/common/ActualizarEntregaTokenModal.jsx`** ← NUEVO

### Archivos a modificar:

3. **`frontend/src/pages/user/components/common/CrearUsuarioModal.jsx`**
4. **`frontend/src/pages/user/components/common/ActualizarModel.jsx`**

---

## Fase 4: Base de Datos

1. **`spec/scripts/015_crear_tabla_firma_digital_personal.sql`** (NUEVO)

---

## Fase 5: Documentación

1. **`spec/002_changelog.md`** (MODIFICAR)
2. **`CLAUDE.md`** (MODIFICAR)
3. **`frontend/src/config/version.js`** (MODIFICAR)

---

## Orden de Ejecución

1. **Base de Datos** (15 min) - Ejecutar script SQL con campos nuevos
2. **Backend** (60 min) - Crear entidad, repository, service, DTOs, controller, modificar UsuarioServiceImpl
3. **Frontend** (75 min) - Crear FirmaDigitalTab, ActualizarEntregaTokenModal, modificar modales
4. **Testing** (40 min) - Validar casos de prueba (incluir flujo de actualización)
5. **Documentación** (15 min) - Actualizar changelog, CLAUDE.md, version

**Total: 3.25 horas**

---

## Cambios Principales vs Plan Anterior

1. ✅ **Campo nuevo:** `numero_serie_token` (VARCHAR) - obligatorio si entregó token
2. ✅ **Campo nuevo:** `fecha_entrega_token` (DATE) - registra cuándo se entregó físicamente
3. ✅ **Funcionalidad nueva:** Actualización de estado PENDIENTE a entregado
4. ✅ **DTO nuevo:** `ActualizarEntregaTokenRequest` para endpoint específico
5. ✅ **Controller nuevo:** `FirmaDigitalController` con endpoint PUT `/api/firma-digital/{id}/actualizar-entrega`
6. ✅ **Modal nuevo:** `ActualizarEntregaTokenModal.jsx` para registrar entregas pendientes
7. ✅ **Validación nueva:** Número de serie obligatorio si entregó token

---

## Próximos Pasos Después de Implementación

1. Dashboard con lista de entregas pendientes
2. Reportes de certificados próximos a vencer (dashboard admin)
3. Alertas automáticas por email cuando certificado vence en 30 días
4. Historial de renovaciones de certificados
5. Exportación de reportes de firma digital a Excel
