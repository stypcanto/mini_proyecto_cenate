# Troubleshooting: Coherencia de Datos de Personal (Interno vs Externo)

> Guía para diagnosticar y corregir problemas de clasificación de personal

**Versión**: 1.0
**Fecha**: 2026-01-03
**Relacionado con**: v1.16.2, v1.16.3

---

## 📋 Índice

1. [Problema Común: Discrepancia en Conteos](#problema-común-discrepancia-en-conteos)
2. [Diagnóstico Paso a Paso](#diagnóstico-paso-a-paso)
3. [Soluciones Aplicadas](#soluciones-aplicadas)
4. [Queries de Verificación](#queries-de-verificación)
5. [Prevención](#prevención)

---

## Problema Común: Discrepancia en Conteos

### Síntoma 1: Dashboard vs API muestran números diferentes

**Ejemplo**:
- Dashboard muestra: 37 externos
- API `/usuarios` muestra: 19 externos
- Diferencia: 18 usuarios

**Causa raíz**:
- Relación JPA entre `Usuario` y `PersonalExterno` no funciona
- `usuario.getPersonalExterno()` retorna `null` aunque exista registro en BD
- Configuración incorrecta de `@OneToOne` con `LAZY` fetch

**Solución**: Ver [v1.16.3 - Fix Relación JPA](#v1163---fix-relación-jpa)

---

### Síntoma 2: Usuarios de CENATE clasificados como EXTERNOS

**Ejemplo**:
- Usuario trabaja en "CENTRO NACIONAL DE TELEMEDICINA"
- Pero tiene `tipo_personal = "EXTERNO"`
- Filtro "Tipo: Externo" los incluye incorrectamente

**Causa raíz**:
- Usuario tiene registro en `dim_personal_externo` (incorrecto)
- `id_origen` en `dim_personal_cnt` está en EXTERNO (2) en lugar de INTERNO (1)

**Solución**: Ver [Reclasificación de Usuarios](#reclasificación-de-usuarios)

---

### Síntoma 3: Usuarios sin clasificar (SIN_CLASIFICAR)

**Ejemplo**:
- Usuario aparece en el sistema pero no en ningún filtro
- `tipo_personal = "SIN_CLASIFICAR"`

**Causa raíz**:
- Usuario NO tiene registro en `dim_personal_cnt`
- Usuario NO tiene registro en `dim_personal_externo`
- Cuenta incompleta o de prueba

**Solución**: Ver [Limpieza de Usuarios sin Estado](#limpieza-de-usuarios-sin-estado)

---

## Diagnóstico Paso a Paso

### 1. Verificar Conteos en Base de Datos

```sql
-- Conteo por origen en dim_personal_cnt
SELECT
    dop.desc_origen,
    COUNT(DISTINCT pc.id_usuario) as total_usuarios
FROM dim_personal_cnt pc
INNER JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
WHERE pc.stat_pers = 'A'
GROUP BY dop.desc_origen
ORDER BY total_usuarios DESC;

-- Conteo de usuarios con personal_externo
SELECT
    COUNT(DISTINCT id_user) as usuarios_con_personal_externo
FROM dim_personal_externo;

-- Conteo total de usuarios activos
SELECT
    COUNT(*) as total_usuarios_activos
FROM dim_usuarios
WHERE stat_user IN ('A', 'ACTIVO');
```

**Valores esperados (v1.16.3)**:
- `dim_personal_cnt` → INTERNO: 108, EXTERNO: 35
- `dim_personal_externo` → 35 usuarios
- `dim_usuarios` → 143 usuarios activos

---

### 2. Verificar API vs Dashboard

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"44914706","password":"@Cenate2025"}' | jq -r ".token")

# Estadísticas del Dashboard
curl -s -X GET "http://localhost:8080/api/admin/dashboard/estadisticas-personal" \
  -H "Authorization: Bearer $TOKEN" | jq

# Conteo por tipo_personal en API /usuarios
curl -s -X GET "http://localhost:8080/api/usuarios" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '[.[] | .tipo_personal] | group_by(.) | map({tipo: .[0], cantidad: length})'
```

**Valores esperados (v1.16.3)**:
```json
// Dashboard
{
  "totalInterno": 108,
  "totalExterno": 35,
  "totalGeneral": 143
}

// API /usuarios
[
  { "tipo": "EXTERNO", "cantidad": 35 },
  { "tipo": "INTERNO", "cantidad": 108 }
]
```

---

### 3. Identificar Usuarios Problemáticos

```sql
-- Usuarios de CENATE mal clasificados como EXTERNOS
SELECT
    u.id_user,
    u.name_user,
    pe.id_pers_ext,
    pc.id_pers as id_pers_cnt,
    dop.desc_origen,
    i.desc_ipress
FROM dim_usuarios u
LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
LEFT JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
LEFT JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
LEFT JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
WHERE u.stat_user IN ('A', 'ACTIVO')
  AND i.desc_ipress LIKE '%CENTRO NACIONAL DE TELEMEDICINA%'
  AND pe.id_pers_ext IS NOT NULL;  -- Tiene registro externo (incorrecto)
```

---

```sql
-- Usuarios sin clasificar
SELECT
    u.id_user,
    u.name_user,
    u.stat_user,
    u.created_at,
    pc.id_pers as tiene_personal_cnt,
    pe.id_pers_ext as tiene_personal_ext
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE u.stat_user IN ('A', 'ACTIVO')
  AND pc.id_pers IS NULL
  AND pe.id_pers_ext IS NULL;
```

---

## Soluciones Aplicadas

### v1.16.3 - Fix Relación JPA

**Archivo**: `backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`

**Cambios**:
1. Inyectar `PersonalExternoRepository` (línea 74)
2. Consultar explícitamente en `convertToResponse()` (líneas 1606-1610)

```java
// Línea 74 - Inyección del repository
private final PersonalExternoRepository personalExternoRepository;

// Líneas 1606-1610 - Consulta explícita
com.styp.cenate.model.PersonalExterno personalExterno = null;
if (usuario.getIdUser() != null) {
    personalExterno = personalExternoRepository.findByIdUser(usuario.getIdUser()).orElse(null);
}

// Clasificación correcta
String tipoPersonal;
if (personalExterno != null) {
    tipoPersonal = "EXTERNO";  // ✅ Prioridad a externo
} else if (personalCnt != null) {
    tipoPersonal = "INTERNO";
} else {
    tipoPersonal = "SIN_CLASIFICAR";
}
```

**Impacto**:
- ✅ API ahora devuelve 37 usuarios externos (coherente con Dashboard)
- ✅ Clasificación correcta de todos los usuarios

---

### Reclasificación de Usuarios

**Ejemplo**: Usuarios de CENATE mal clasificados como EXTERNOS

```sql
-- 1. Actualizar id_origen a INTERNO (1)
UPDATE dim_personal_cnt
SET id_origen = 1
WHERE id_usuario IN (
    SELECT pc.id_usuario
    FROM dim_personal_cnt pc
    INNER JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
    WHERE i.desc_ipress LIKE '%CENTRO NACIONAL DE TELEMEDICINA%'
      AND pc.id_origen = 2  -- Está como EXTERNO
);

-- 2. Eliminar registros de dim_personal_externo (si existen)
DELETE FROM dim_personal_externo
WHERE id_user IN (
    SELECT pc.id_usuario
    FROM dim_personal_cnt pc
    INNER JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
    WHERE i.desc_ipress LIKE '%CENTRO NACIONAL DE TELEMEDICINA%'
);
```

**Casos corregidos (v1.16.3)**:
- Fernando Coronado Davila (42376660)
- Monica Elizabeth Pezantes Salirrosas (18010623)

---

### Limpieza de Usuarios sin Estado

**Identificar**:
```sql
SELECT u.id_user, u.name_user
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE u.stat_user IN ('A', 'ACTIVO')
  AND pc.id_pers IS NULL
  AND pe.id_pers_ext IS NULL;
```

**Eliminar** (si es cuenta de prueba):
```sql
BEGIN;

DELETE FROM rel_user_roles WHERE id_user = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;

COMMIT;
```

**Caso eliminado (v1.16.3)**:
- Usuario 09542424 (ID: 251) - Cuenta sin datos creada el 2025-12-29

---

## Queries de Verificación

### Verificación Completa de Coherencia

```sql
-- Resumen completo
SELECT
    'Dashboard (dim_personal_cnt)' as fuente,
    SUM(CASE WHEN dop.desc_origen = 'INTERNO' THEN 1 ELSE 0 END) as internos,
    SUM(CASE WHEN dop.desc_origen = 'EXTERNO' THEN 1 ELSE 0 END) as externos,
    COUNT(*) as total
FROM dim_personal_cnt pc
INNER JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
WHERE pc.stat_pers = 'A'

UNION ALL

SELECT
    'Personal Externo (dim_personal_externo)' as fuente,
    0 as internos,
    COUNT(DISTINCT id_user) as externos,
    COUNT(DISTINCT id_user) as total
FROM dim_personal_externo

UNION ALL

SELECT
    'Usuarios Activos (dim_usuarios)' as fuente,
    NULL as internos,
    NULL as externos,
    COUNT(*) as total
FROM dim_usuarios
WHERE stat_user IN ('A', 'ACTIVO');
```

**Resultado esperado (v1.16.3)**:
```
+----------------------------------------------+----------+----------+-------+
| fuente                                       | internos | externos | total |
+----------------------------------------------+----------+----------+-------+
| Dashboard (dim_personal_cnt)                 | 108      | 35       | 143   |
| Personal Externo (dim_personal_externo)      | 0        | 35       | 35    |
| Usuarios Activos (dim_usuarios)              | NULL     | NULL     | 143   |
+----------------------------------------------+----------+----------+-------+
```

---

### Verificar Usuarios con Registro en Ambas Tablas

```sql
-- Usuarios que tienen AMBOS registros (personal_cnt Y personal_externo)
SELECT
    u.id_user,
    u.name_user,
    pc.id_pers as id_personal_cnt,
    pe.id_pers_ext as id_personal_ext,
    dop.desc_origen,
    i.desc_ipress
FROM dim_usuarios u
INNER JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
INNER JOIN dim_personal_externo pe ON pe.id_user = u.id_user
LEFT JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
LEFT JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
WHERE u.stat_user IN ('A', 'ACTIVO')
ORDER BY u.name_user;
```

**Resultado esperado (v1.16.3)**:
- **0 usuarios** deben tener ambos registros si trabajan en CENATE
- Solo usuarios de IPRESS externas deben tener registro en `dim_personal_externo`

---

## Prevención

### 1. Reglas de Negocio

**Personal INTERNO** (trabaja en CENATE):
- ✅ Debe tener registro en `dim_personal_cnt` con `id_origen = 1` (INTERNO)
- ❌ NO debe tener registro en `dim_personal_externo`
- ✅ IPRESS: "CENTRO NACIONAL DE TELEMEDICINA" (id_ipress = 2)

**Personal EXTERNO** (trabaja en otra IPRESS):
- ✅ Puede tener registro en `dim_personal_cnt` con `id_origen = 2` (EXTERNO)
- ✅ Debe tener registro en `dim_personal_externo`
- ✅ IPRESS: Cualquier otra institución (id_ipress ≠ 2)

---

### 2. Validaciones en Backend

**Al crear usuario**:
```java
// Si IPRESS es CENATE (id = 2)
if (idIpress == 2) {
    // NO crear registro en dim_personal_externo
    // Asignar id_origen = 1 (INTERNO)
}

// Si IPRESS es otra institución
else if (idIpress != null && idIpress != 2) {
    // Crear registro en dim_personal_externo
    // Asignar id_origen = 2 (EXTERNO)
}
```

---

### 3. Script de Validación Periódica

```sql
-- Ejecutar mensualmente para detectar inconsistencias
SELECT
    '⚠️ Usuarios de CENATE con registro externo' as alerta,
    COUNT(*) as cantidad
FROM dim_personal_cnt pc
INNER JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
INNER JOIN dim_personal_externo pe ON pe.id_user = pc.id_usuario
WHERE i.desc_ipress LIKE '%CENTRO NACIONAL DE TELEMEDICINA%'
HAVING COUNT(*) > 0

UNION ALL

SELECT
    '⚠️ Usuarios sin clasificar' as alerta,
    COUNT(*) as cantidad
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE u.stat_user IN ('A', 'ACTIVO')
  AND pc.id_pers IS NULL
  AND pe.id_pers_ext IS NULL
HAVING COUNT(*) > 0;
```

**Resultado esperado**: No debe devolver filas (0 inconsistencias)

---

## Referencias

- **Changelog**: `checklist/01_Historial/01_changelog.md`
  - v1.16.2 - Corrección de Coherencia de Dashboard
  - v1.16.3 - Fix Relación JPA y Limpieza de Datos

- **Código fuente**:
  - `backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`
  - `backend/src/main/java/com/styp/cenate/model/Usuario.java`
  - `backend/src/main/java/com/styp/cenate/model/PersonalExterno.java`

- **Base de datos**:
  - `dim_usuarios`
  - `dim_personal_cnt`
  - `dim_personal_externo`
  - `dim_origen_personal`

---

*Última actualización: 2026-01-03 | v1.16.3*
