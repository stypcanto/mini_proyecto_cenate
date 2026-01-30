# 🔐 Fix: Autorización Coordinador en Historial de Bolsas (v1.37.5)

**Fecha:** 2026-01-30
**Versión:** v1.37.5
**Estado:** ✅ COMPLETADO
**Severidad:** 🔴 CRÍTICA

---

## 📋 Descripción del Problema

### El Error

Los coordinadores de Gestión de Citas recibían error `500 Access Denied` al intentar acceder a:

```
GET /api/bolsas/importaciones/historial
GET /api/bolsas/importaciones/{idImportacion}
```

### Síntomas Observados

- ✗ Frontend muestra error 500 en página `/bolsas/historial`
- ✗ Logs del backend muestran: `ExpressionAuthorizationDecision [granted=false]`
- ✓ SUPERADMIN/ADMIN SÍ podían acceder exitosamente
- ✗ Coordinador tiene el rol asignado correctamente en BD

### Logs del Problema

```
2026-01-30 01:20:10.688 [http-nio-0.0.0.0-8080-exec-20] DEBUG o.s.s.a.m.AuthorizationManagerBeforeMethodInterceptor
- Failed to authorize ReflectiveMethodInvocation:
  public org.springframework.http.ResponseEntity com.styp.cenate.api.BolsasController.obtenerHistorialImportaciones()
- ExpressionAuthorizationDecision [granted=false,
  expressionAttribute=hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR DE GESTIÓN DE CITAS')]

Usuario cargado: 45721231 con roles [ROLE_COORD. GESTION CITAS]
```

---

## 🔍 Análisis de Causa Raíz

### La Discrepancia

| Componente | Valor Esperado | Valor Real | Resultado |
|-----------|----------------|-----------|-----------|
| **@PreAuthorize** | `'COORDINADOR DE GESTIÓN DE CITAS'` | - | ❌ Esperaba nombre largo |
| **JWT/DB** | - | `'COORD. GESTION CITAS'` | ❌ Rol abreviado en BD |
| **Comparación** | Deben coincidir | ≠ NO coinciden | ❌ **FALLO** |

### Por Qué Sucedió

1. **Nombre del rol en BD (tabla `dim_roles`):**
   ```sql
   SELECT id_rol, desc_rol FROM dim_roles WHERE id_rol = 27;

   -- Resultado:
   -- id_rol: 27
   -- desc_rol: "COORD. GESTION CITAS"  ← Abreviado (sin espacios extra)
   ```

2. **Anotación en Java (BolsasController.java línea 152):**
   ```java
   @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR DE GESTIÓN DE CITAS')")
                                                       ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                                       Esperaba NOMBRE COMPLETO
   ```

3. **Spring Security compara literalmente:**
   - JWT contiene: `ROLE_COORD. GESTION CITAS`
   - Código busca: `ROLE_COORDINADOR DE GESTIÓN DE CITAS`
   - Resultado: ❌ NO COINCIDEN → Access Denied

---

## ✅ Solución Implementada

### Cambios en Código

**Archivo:** `backend/src/main/java/com/styp/cenate/api/BolsasController.java`

#### Línea 152 - Endpoint: Historial de Importaciones

```java
// ANTES
@GetMapping("/importaciones/historial")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR DE GESTIÓN DE CITAS')")
public ResponseEntity<List<?>> obtenerHistorialImportaciones() {

// DESPUÉS
@GetMapping("/importaciones/historial")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
public ResponseEntity<List<?>> obtenerHistorialImportaciones() {
```

#### Línea 159 - Endpoint: Detalles de Importación

```java
// ANTES
@GetMapping("/importaciones/{idImportacion}")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR DE GESTIÓN DE CITAS')")
public ResponseEntity<Object> obtenerDetallesImportacion(@PathVariable Long idImportacion) {

// DESPUÉS
@GetMapping("/importaciones/{idImportacion}")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
public ResponseEntity<Object> obtenerDetallesImportacion(@PathVariable Long idImportacion) {
```

### Proceso de Despliegue

1. ✅ **Editar código** - Cambiar nombre de rol en ambas anotaciones
2. ✅ **Compilar** - `./gradlew clean build -x test`
3. ✅ **Reiniciar** - Stop servidor anterior, iniciar nuevo con bytecode compilado
4. ✅ **Verificar** - Revisar logs de Spring Boot

---

## 📊 Verificación de la Solución

### Base de Datos - Verificar Usuarios con Rol

```sql
SELECT
  u.id_user,
  u.name_user,
  r.desc_rol
FROM dim_usuarios u
JOIN rel_user_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON r.id_rol = ur.id_rol
WHERE r.id_rol = 27
ORDER BY u.name_user;

-- Resultado:
-- id_user: 548,  name_user: 45721231,  desc_rol: COORD. GESTION CITAS
-- id_user: 272,  name_user: 70291746,  desc_rol: COORD. GESTION CITAS
-- id_user: 204,  name_user: 70572629,  desc_rol: COORD. GESTION CITAS
```

### Logs del Backend - Autorización Exitosa

```
2026-01-30 01:35:12.411 [http-nio-0.0.0.0-8080-exec-18]
  INFO c.s.c.s.s.UserDetailsServiceImpl
  Usuario cargado: 45721231 con roles [ROLE_COORD. GESTION CITAS]

2026-01-30 01:35:12.412 [http-nio-0.0.0.0-8080-exec-18]
  DEBUG o.s.s.a.m.AuthorizationManagerBeforeMethodInterceptor
  Authorizing method invocation ReflectiveMethodInvocation:
  public org.springframework.http.ResponseEntity obtenerHistorialImportaciones()

2026-01-30 01:35:12.413 [http-nio-0.0.0.0-8080-exec-18]
  DEBUG o.s.s.a.m.AuthorizationManagerBeforeMethodInterceptor
  Successfully authorized ReflectiveMethodInvocation
  ExpressionAuthorizationDecision [granted=true,
  expressionAttribute=hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')]
```

### Frontend - Resultado

- ✅ Usuario coordinador accede a `http://localhost:3000/bolsas/historial`
- ✅ Ve tabla de importaciones sin errores
- ✅ Puede ver detalles de cada importación

---

## 🛡️ Análisis de Seguridad

### Impacto

| Aspecto | Antes | Después | Cambio |
|--------|-------|---------|--------|
| **Coordinador** | ❌ Bloqueado | ✅ Autorizado | Funcionalidad restaurada |
| **Admin** | ✅ Autorizado | ✅ Autorizado | Sin cambio |
| **SuperAdmin** | ✅ Autorizado | ✅ Autorizado | Sin cambio |
| **JWT Token** | Sin cambios | Sin cambios | N/A |
| **BD Permisos** | Sin cambios | Sin cambios | N/A |

### Riesgos Mitigados

- ✅ **No se relaja seguridad** - Solo se corrige alineación
- ✅ **No se cambia BD** - Solo código Java
- ✅ **Auditoría activada** - Spring Security registra todos los intentos
- ✅ **Reversible** - Si hay problema, volver a usar nombre antiguo

---

## 📚 Referencia

### Archivos Modificados

```
backend/src/main/java/com/styp/cenate/api/BolsasController.java
  - Línea 152: @PreAuthorize (historial)
  - Línea 159: @PreAuthorize (detalles)
```

### Consultas SQL Relacionadas

```sql
-- Ver todos los roles
SELECT id_rol, desc_rol FROM dim_roles ORDER BY desc_rol;

-- Ver usuarios con rol Coordinador
SELECT u.id_user, u.name_user, r.desc_rol
FROM dim_usuarios u
JOIN rel_user_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON r.id_rol = ur.id_rol
WHERE r.desc_rol LIKE '%COORD%';

-- Ver permisos del coordinador
SELECT p.ruta_pagina, p.nombre_pagina
FROM segu_permisos_rol_pagina prp
JOIN dim_paginas p ON p.id_pagina = prp.id_pagina
WHERE prp.id_rol = 27
ORDER BY p.ruta_pagina;
```

### Logs Relevantes

```bash
# Ver últimos logs de Spring Boot
tail -200 /tmp/spring-boot.log | grep -E "historial|COORD|Authorization"

# Buscar errores de autorización
grep "Access Denied\|ExpressionAuthorizationDecision" /tmp/spring-boot.log
```

---

## 🔄 Lecciones Aprendidas

### Para Evitar Esto en el Futuro

1. **Consistencia de Nombres de Roles**
   - ✅ Usar SIEMPRE el nombre corto/abreviado de BD en `@PreAuthorize`
   - ✅ Verificar en BD antes de escribir anotaciones

2. **Testing de Autorización**
   - ✅ Test cada rol contra cada endpoint `@PreAuthorize`
   - ✅ Incluir en CI/CD pipeline

3. **Documentación**
   - ✅ Documentar nombre EXACTO de cada rol
   - ✅ Incluir lista de usuarios con cada rol

4. **Monitoreo**
   - ✅ Revisar logs de `AuthorizationManagerBeforeMethodInterceptor`
   - ✅ Alertar en Authorization Denied

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué no se usó el nombre completo en BD?**
R: Limitación de espacio en columnas o decisión de diseño anterior. El nombre abreviado es canónico.

**P: ¿Hay otros endpoints con este problema?**
R: Posible. Revisar todos los `@PreAuthorize` que usen rol completo vs abreviado.

**P: ¿Se debe cambiar BD o código?**
R: Es más seguro cambiar código Java que BD. Menos riesgo de romper referencias.

**P: ¿Necesita permiso MBAC en dim_paginas?**
R: No. `@PreAuthorize` usa solo roles, no permisos de página. Son capas de seguridad diferentes.

---

**Status Final:** ✅ RESUELTO Y DOCUMENTADO
