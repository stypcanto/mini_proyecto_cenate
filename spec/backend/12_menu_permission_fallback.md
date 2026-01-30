# Menu Permission Fallback - Solución de Módulos Vacíos

**Versión:** v1.37.5
**Fecha:** 2026-01-29
**Problema:** Usuarios con rol y permisos asignados veían "No tienes módulos asignados"

---

## 🔴 El Problema Original

El sistema CENATE tiene **DOS tablas de permisos paralelas**:

### 1. Sistema ANTIGUO (Role-based)
- **Tabla:** `segu_permisos_rol_pagina`
- **Flujo:** Usuario → Rol → Permisos del Rol → Páginas
- **Uso:** Históricamente para gestionar permisos

### 2. Sistema NUEVO (MBAC - Modular)
- **Tabla:** `permisos_modulares`
- **Flujo:** Usuario → Permisos individuales → Páginas
- **Uso:** Panel MBAC para asignación granular de permisos

### El Error
Cuando un usuario tenía:
- ✅ Rol asignado (en `rel_user_roles`)
- ✅ Permisos de rol configurados (en `segu_permisos_rol_pagina`)
- ❌ Pero NO tenía permisos en `permisos_modulares`

El endpoint `/api/menu-usuario/usuario/{id}` **solo consultaba `permisos_modulares`** y retornaba lista vacía.

---

## ✅ La Solución Implementada

### Cambio en `MenuUsuarioServiceImpl.java`

**Antes:**
```java
List<PermisoModular> permisos = permisoModularRepository.findByIdUserAndActivoTrue(idUser);

if (permisos.isEmpty()) {
    log.warn("⚠️ Usuario {} no tiene permisos modulares asignados", idUser);
    return new ArrayList<>();  // ❌ Retorna lista vacía
}
```

**Después:**
```java
List<PermisoModular> permisos = permisoModularRepository.findByIdUserAndActivoTrue(idUser);

if (permisos.isEmpty()) {
    log.warn("⚠️ Usuario {} no tiene permisos modulares, intentando fallback a rol", idUser);
    return obtenerMenuDesdePermisosRol(idUser);  // ✅ Fallback a permisos de rol
}
```

### Nuevo Método: `obtenerMenuDesdePermisosRol()`

```java
private List<MenuUsuarioDTO> obtenerMenuDesdePermisosRol(Long idUser)
```

**Flujo:**
1. Obtiene los roles del usuario
2. Busca permisos en `segu_permisos_rol_pagina` para esos roles
3. Construye el menú con los permisos encontrados
4. Si aún así está vacío, retorna lista vacía

---

## 📊 Diagrama de Flujo

```
┌──────────────────────────────────┐
│ Usuario solicita menú            │
└──────────────┬───────────────────┘
               │
         ¿Es Admin?
        /        \
       SÍ         NO
       │          │
       │    ▼─────────────────────┐
       │    Buscar permisos_      │
       │    modulares             │
       │         │                │
       │    ¿Encontrados?         │
       │      /     \             │
       │     SÍ      NO           │
       │     │       │            │
       │     │       ▼────────────┤
       │     │    FALLBACK:       │
       │     │    Buscar en       │
       │     │    segu_permisos_  │
       │     │    rol_pagina      │
       │     │       │            │
       │     │    ¿Encontrados?   │
       │     │      /     \       │
       │     │     SÍ      NO     │
       │     │      \      │      │
       │     └──────┬──────┘      │
       │            │             │
       └────────────┴─────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Construir    │
            │ Menú         │
            └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Retornar     │
            │ Menú         │
            └──────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario con MBAC (tabla nueva)
```
Usuario: Gustavo Test Test
├─ Rol: COORD_GESTION_CITAS
├─ permisos_modulares: ACTIVO ✅
└─ Resultado: Carga menú desde permisos_modulares
```

### Caso 2: Usuario sin MBAC (tabla antigua)
```
Usuario: Coordinador Antiguo
├─ Rol: COORDINADOR_RED
├─ permisos_modulares: VACÍO ❌
├─ segu_permisos_rol_pagina: ACTIVO ✅
└─ Resultado: Carga menú desde segu_permisos_rol_pagina (FALLBACK)
```

### Caso 3: Usuario sin permisos en ninguna tabla
```
Usuario: Test User
├─ Rol: SIN_ASIGNAR ❌
├─ permisos_modulares: VACÍO ❌
├─ segu_permisos_rol_pagina: VACÍO ❌
└─ Resultado: Lista vacía (sin acceso)
```

---

## 🔧 Transición Recomendada

### Fase 1: Soporte Dual (ACTUAL - con este cambio)
- Sistema soporta AMBAS tablas
- Usuario con permisos en cualquier tabla: FUNCIONA ✅
- Fallback automático si una está vacía

### Fase 2: Migración Gradual
- Panel MBAC permite migrar usuarios individuales
- Los que usen tabla antigua siguen funcionando (fallback)
- No hay downtime ni remoción forzada

### Fase 3: Deprecación (futuro)
- `segu_permisos_rol_pagina` se marca como deprecated
- Se migran últimos usuarios a `permisos_modulares`
- Eventualmente se elimina tabla antigua

---

## 📝 Impacto

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Usuarios sin MBAC** | ❌ Sin acceso | ✅ Funciona con rol |
| **Compatibilidad** | ❌ Solo MBAC | ✅ MBAC + Rol |
| **Migración** | ❌ Forzada | ✅ Gradual |
| **Performance** | — | ↔️ Igual (2 queries en fallback) |

---

## 🔍 Testing

### Test Case 1: Usuario con MBAC
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/menu-usuario/usuario/{idUsuarioConMBAC}

# Esperado: Menú cargado desde permisos_modulares
```

### Test Case 2: Usuario sin MBAC (con rol)
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/menu-usuario/usuario/{idUsuarioSinMBAC}

# Esperado: Menú cargado desde segu_permisos_rol_pagina (fallback)
```

### Verificar en BD
```sql
-- Usuario debe tener acceso a módulos
SELECT * FROM vw_permisos_usuario_activos
WHERE id_user = 123;

-- O si no hay en la view (tabla nueva), verificar rol
SELECT * FROM segu_permisos_rol_pagina
WHERE id_rol IN (
  SELECT id_rol FROM rel_user_roles WHERE id_user = 123
);
```

---

## 📚 Archivos Modificados

- `backend/src/main/java/com/styp/cenate/service/segu/MenuUsuarioServiceImpl.java`
  - Línea 123: Cambio de `return new ArrayList<>()` a `return obtenerMenuDesdePermisosRol(idUser)`
  - Líneas 128-271: Nuevo método `obtenerMenuDesdePermisosRol()`

---

## 🚀 Commit

```
f27a874 fix(auth): Add fallback to role permissions for menu loading when MBAC not configured
```

---

## ✨ Conclusión

Ahora los usuarios con permisos de rol (sistema antiguo) funcionan correctamente sin necesidad de migrar a MBAC inmediatamente. El sistema es **backward compatible** mientras se realiza la transición gradual.
