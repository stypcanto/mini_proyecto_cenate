# ❌ "Access Denied" - Coordinador en Historial de Bolsas

**Versión:** v1.37.5
**Fecha:** 2026-01-30
**Severidad:** 🔴 Crítica
**Status:** ✅ Resuelto

---

## 🔴 El Problema

### Síntomas

```
GET http://localhost:8080/api/bolsas/importaciones/historial

Response: 500 Internal Server Error
{
  "error": "Access Denied"
}
```

### Afectados

- ✗ Coordinador de Gestión de Citas (usuario 45721231, 70291746, 70572629)
- ✓ ADMIN/SUPERADMIN (sin problemas)

---

## 🔍 Causa Raíz

**Mismatch entre nombre de rol:**

```
@PreAuthorize esperaba:  'COORDINADOR DE GESTIÓN DE CITAS'
Base de datos almacena: 'COORD. GESTION CITAS'
                         ↑ DIFERENTE - Spring Security rechaza
```

### Por Qué Sucede

En Spring Security, la comparación de roles es **literal y exacta**:

```java
// BolsasController.java línea 152 (ANTES)
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR DE GESTIÓN DE CITAS')")
                                                  ↑ NOMBRE LARGO
```

Pero el JWT tiene:
```
roles: ['ROLE_COORD. GESTION CITAS']  ← ABREVIADO
```

Resultado: `'COORDINADOR DE GESTIÓN DE CITAS'` ≠ `'COORD. GESTION CITAS'` → ❌ DENIED

---

## ✅ Solución

### Opción 1: Actualizar Código (✅ RECOMENDADO)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/BolsasController.java`

```java
// Línea 152
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
              //                                   ↑ Usar nombre ABREVIADO de BD

// Línea 159
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
```

**Pasos:**

```bash
# 1. Compilar
cd backend
./gradlew clean build -x test

# 2. Reiniciar Spring Boot
# Detener servidor actual y reiniciar

# 3. Verificar (los logs deben mostrar "granted=true")
tail -f /tmp/spring-boot.log | grep "Authorization\|historial"
```

### Opción 2: Consultar BD para Nombre Correcto

Si no estás seguro del nombre exacto:

```sql
SELECT id_rol, desc_rol FROM dim_roles
WHERE desc_rol LIKE '%COORD%'
ORDER BY desc_rol;

-- Resultado esperado:
-- id_rol: 27, desc_rol: "COORD. GESTION CITAS"
```

---

## 🧪 Verificación

### 1. Verificar Logs Backend

```bash
# Debe mostrar: granted=true
grep "ExpressionAuthorizationDecision.*true" /tmp/spring-boot.log

# NO debe mostrar: granted=false
grep "ExpressionAuthorizationDecision.*false" /tmp/spring-boot.log
```

### 2. Test cURL

```bash
# Con token del coordinador
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8080/api/bolsas/importaciones/historial

# Resultado esperado: 200 OK con JSON
```

### 3. Verificar Frontend

```javascript
// Debería funcionar sin errores
fetch('/api/bolsas/importaciones/historial', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data))  // Array de importaciones
```

---

## 📋 Checklist de Fix

- [ ] Abrir `BolsasController.java`
- [ ] Verificar línea 152: `@PreAuthorize(...)`
- [ ] Cambiar `'COORDINADOR DE GESTIÓN DE CITAS'` → `'COORD. GESTION CITAS'`
- [ ] Verificar línea 159: `@PreAuthorize(...)`
- [ ] Cambiar `'COORDINADOR DE GESTIÓN DE CITAS'` → `'COORD. GESTION CITAS'`
- [ ] Compilar: `./gradlew clean build -x test`
- [ ] Reiniciar Spring Boot
- [ ] Revisar logs: `grep "ExpressionAuthorization" /tmp/spring-boot.log`
- [ ] Verificar que dice `granted=true`
- [ ] Probar en frontend accediendo a `/bolsas/historial`

---

## 🔐 Impacto de Seguridad

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Coordinador** | ❌ BLOQUEADO | ✅ AUTORIZADO |
| **Admin/SuperAdmin** | ✅ FUNCIONA | ✅ FUNCIONA |
| **Seguridad** | Sobre-restrictiva | CORRECTA |
| **BD Cambios** | N/A | NINGUNO |
| **JWT Cambios** | N/A | NINGUNO |

---

## 📚 Referencias

**Documentación Completa:**
- [`checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md`](../../../checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md)

**Código Relacionado:**
- `BolsasController.java` líneas 151-163
- `dim_roles` tabla (id_rol=27)
- `rel_user_roles` tabla (para verificar asignaciones)

**Spring Security:**
- `@PreAuthorize` documentation
- `AuthorizationManagerBeforeMethodInterceptor` logs

---

## 💡 Cómo Evitar en el Futuro

1. ✅ **Verificar nombre exacto en BD antes de escribir `@PreAuthorize`**
   ```sql
   -- Siempre ejecutar esto primero
   SELECT desc_rol FROM dim_roles WHERE id_rol = ?;
   ```

2. ✅ **Incluir comentario en código**
   ```java
   // Rol en BD: "COORD. GESTION CITAS" (abreviado)
   @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
   ```

3. ✅ **Test de autorización automático**
   ```java
   @SpringBootTest
   class AuthorizationTests {
     @Test void coordinadorAccesaHistorial() { ... }
   }
   ```

---

**¿Aún tienes problemas?** → Ver archivo completo en [`FIXAUTORIZACION_COORDINADOR.md`](../../../checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md)
