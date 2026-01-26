# Guía de Troubleshooting: Módulo Estados Gestión Citas v1.33.0

> Errores encontrados durante desarrollo y sus soluciones

**Versión:** v1.33.0
**Fecha:** 2026-01-22
**Errores Resueltos:** 3 críticos

---

## 🔴 Error 1: Rutas 404 "No endpoint GET /api/..."

### Descripción del Problema

```
[API Error] No endpoint GET /api/estados-gestion-citas/buscar.
    at handleResponse (apiClient.js:67:1)
    at async EstadosGestionCitasService.buscar (estadosGestionCitasService.js:65:1)
```

**Síntomas:**
- Frontend carga componente EstadosGestionCitas
- Al iniciar, intenta GET `/api/estados-gestion-citas/buscar`
- Retorna HTTP 500 con error "No endpoint"
- Backend logs:  `No endpoint GET /api/estados-gestion-citas/buscar`
- Tabla NO carga datos, aparece "Error al cargar estados"

**Impacto:** 🔴 CRÍTICO - Módulo completamente inoperativo

---

### Cause Analysis

**Paso 1: Verificar que el endpoint existe en backend**

```bash
# Ver si el controller está compilado
curl -s http://localhost:8080/api/admin/estados-gestion-citas/todos | jq .
# ✅ Si retorna JSON, endpoint existe
# ❌ Si retorna 404, el endpoint no está mapeado
```

**Paso 2: Verificar rutas en Controller**

```java
// ❌ INCORRECTO (lo que estaba)
@RestController
@RequestMapping("/estados-gestion-citas")  // Falta /api/admin/
public class GestionEstadosGestionCitasController {
    @GetMapping("/buscar")
    public ResponseEntity<Page<...>> buscarEstados(...) { ... }
}
// Resultado: GET /estados-gestion-citas/buscar (NO /api/...)

// ✅ CORRECTO (después de fix)
@RestController
@RequestMapping("/api/admin/estados-gestion-citas")  // Completa
public class GestionEstadosGestionCitasController {
    @GetMapping("/buscar")
    public ResponseEntity<Page<...>> buscarEstados(...) { ... }
}
// Resultado: GET /api/admin/estados-gestion-citas/buscar
```

**Paso 3: Verificar SecurityConfig**

```java
// ❌ INCORRECTO
.requestMatchers("/estados-gestion-citas/**")  // Mismatch
.permitAll()

// ✅ CORRECTO
.requestMatchers("/api/admin/estados-gestion-citas/**")
.permitAll()
```

**Paso 4: Verificar Frontend Service Base URL**

```javascript
// ❌ INCORRECTO
const BASE_URL = '/estados-gestion-citas';  // apiClient agrega /api/
// Resultado: GET /api/estados-gestion-citas (pero backend espera /api/admin/...)

// ✅ CORRECTO
const BASE_URL = '/api/admin/estados-gestion-citas';
// Resultado: GET /api/api/admin/... (NO! apiClient NO agrega si ya existe /api/)
```

**Root Cause:** apiClient SIEMPRE agrega `/api/` a rutas relativas, pero Backend Controller tenía ruta incompleta `/estados-gestion-citas` en lugar de `/api/admin/estados-gestion-citas`.

---

### Solución Aplicada

**Commit:** `aa89d9c`

**Cambios:**

1. **Backend Controller:**
   ```java
   // Cambiar de:
   @RequestMapping("/estados-gestion-citas")
   // A:
   @RequestMapping("/api/admin/estados-gestion-citas")
   ```

2. **Backend SecurityConfig:**
   ```java
   // Cambiar de:
   .requestMatchers("/estados-gestion-citas/**")
   // A:
   .requestMatchers("/api/admin/estados-gestion-citas/**")
   ```

3. **Frontend Service:**
   ```javascript
   // Cambiar de:
   const BASE_URL = '/estados-gestion-citas';
   // A:
   const BASE_URL = '/api/admin/estados-gestion-citas';
   ```

**Verificación Post-Fix:**
```bash
# 1. Recompilar backend
./gradlew clean build -x test

# 2. Probar endpoint
curl -s http://localhost:8080/api/admin/estados-gestion-citas/todos | jq '.[0]'
# Retorna: { "idEstadoCita": 1, "codEstadoCita": "CITADO", ... }  ✅

# 3. Recompilar frontend
npm run build

# 4. Probar en navegador
http://localhost:3000/admin/users
# Buscar en dropdown "Más" → "Estados Gestión Citas"
# Tabla carga 10 estados ✅
```

---

## 🔴 Error 2: Query JPQL "lower(bytea) does not exist"

### Descripción del Problema

```
[API Error] ERROR: function lower(bytea) does not exist
  Hint: No function matches the given name and argument types.
  You might need to add explicit type casts.
  Position: 238
```

**Síntomas:**
- GET `/api/admin/estados-gestion-citas/buscar?page=0&size=30` retorna HTTP 500
- Backend logs muestran error de PostgreSQL sobre `lower(bytea)`
- Tabla NO carga con paginación
- Búsqueda falla completamente

**Impacto:** 🔴 CRÍTICO - Búsqueda inoperativa

---

### Cause Analysis

**El problema está en el Repository:**

```java
// ❌ INCORRECTO (Causa error)
@Query("SELECT e FROM EstadoGestionCita e WHERE " +
       "(:busqueda IS NULL OR LOWER(e.codEstadoCita) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
       "OR LOWER(e.descEstadoCita) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
       "(:estado IS NULL OR e.statEstadoCita = :estado) " +
       "ORDER BY e.descEstadoCita ASC")
Page<EstadoGestionCita> buscarEstadosGestionCitas(
    @Param("busqueda") String busqueda,
    @Param("estado") String estado,
    Pageable pageable
);
```

**¿Por qué falla?**

1. Hibernate convierte `@Param("busqueda")` a tipo PostgreSQL `BYTEA` (bytes)
2. PostgreSQL intenta ejecutar: `SELECT ... WHERE LOWER(e.cod_estado_cita) LIKE LOWER(CONCAT('%', $1::bytea, '%'))`
3. No existe función `lower(bytea)` en PostgreSQL (LOWER solo funciona con TEXT/VARCHAR)
4. Error: "function lower(bytea) does not exist"

**Solución:** Usar Query SQL NATIVA en lugar de JPQL

---

### Solución Aplicada

**Commit:** `e66fdc2`

**Cambios:**

```java
// ✅ CORRECTO (Usa SQL nativa)
@Query(value = "SELECT * FROM public.dim_estados_gestion_citas e WHERE " +
       "(:busqueda IS NULL OR LOWER(e.cod_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
       "OR LOWER(e.desc_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
       "(:estado IS NULL OR e.stat_estado_cita = :estado) " +
       "ORDER BY e.desc_estado_cita ASC",
       nativeQuery = true,
       countQuery = "SELECT COUNT(*) FROM public.dim_estados_gestion_citas e WHERE " +
       "(:busqueda IS NULL OR LOWER(e.cod_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
       "OR LOWER(e.desc_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
       "(:estado IS NULL OR e.stat_estado_cita = :estado)")
Page<EstadoGestionCita> buscarEstadosGestionCitas(
    @Param("busqueda") String busqueda,
    @Param("estado") String estado,
    Pageable pageable
);
```

**¿Por qué funciona?**

1. `nativeQuery = true` → Spring ejecuta SQL directo en PostgreSQL (sin Hibernate)
2. `:busqueda` se pasa como String, PostgreSQL lo maneja correctamente
3. `LOWER()` y `CONCAT()` son funciones SQL nativas de PostgreSQL
4. Query retorna página con 10 estados ✅

**Verificación Post-Fix:**
```bash
# 1. Recompilar backend
./gradlew clean build -x test

# 2. Probar endpoint de búsqueda
curl -s "http://localhost:8080/api/admin/estados-gestion-citas/buscar?page=0&size=30" | jq '.content | length'
# Retorna: 10 ✅

# 3. Probar con filtro
curl -s "http://localhost:8080/api/admin/estados-gestion-citas/buscar?page=0&size=30&busqueda=NO" | jq '.content'
# Retorna: [NO_CONTESTA, NO_DESEA] ✅
```

---

## 🔴 Error 3: Conflicto de rutas en endpoints path variables

### Descripción del Problema

**Potencial Issue (Prevenido a tiempo):**
- Endpoint `/buscar` mapea DESPUÉS de `/{id}`
- Spring URL matching es "greedy" - coincide patrones antes
- `GET /api/admin/estados-gestion-citas/buscar` podría interpretarse como `GET /{id}` con `id="buscar"`
- Spring intenta convertir "buscar" a Long → Error o comportamiento inesperado

**Síntoma que se hubiera presentado:**
```
java.lang.NumberFormatException: For input string: "buscar"
    at java.lang.Long.parseLong(Long.java:589)
    at java.lang.Long.valueOf(Long.java:541)
```

**Impacto:** 🔴 CRÍTICO - Búsqueda incorrecta o crash

---

### Solución Prevenida

**Commit:** `aa89d9c`

**Orden correcto de endpoints en Controller:**

```java
@RestController
@RequestMapping("/api/admin/estados-gestion-citas")
public class GestionEstadosGestionCitasController {

    // 1️⃣ Exactas primero
    @GetMapping("/todos")  // GET /api/.../todos
    public ResponseEntity<List<...>> obtenerTodosEstados() { ... }

    // 2️⃣ Búsquedas especiales ANTES de /{id}
    @GetMapping("/buscar")  // GET /api/.../buscar
    public ResponseEntity<Page<...>> buscarEstados(...) { ... }

    @GetMapping("/estadisticas")  // GET /api/.../estadisticas
    public ResponseEntity<...> obtenerEstadisticas() { ... }

    // 3️⃣ Generic path variables al final
    @GetMapping("/{id}")  // GET /api/.../{id}
    public ResponseEntity<...> obtenerEstadoPorId(@PathVariable Long id) { ... }

    // 4️⃣ Más específicas que generic
    @PatchMapping("/{id}/estado")  // GET /api/.../{id}/estado
    public ResponseEntity<...> cambiarEstado(@PathVariable Long id, ...) { ... }

    // 5️⃣ POST/PUT/DELETE genéricos al final
    @PostMapping
    public ResponseEntity<...> crearEstado(...) { ... }

    @PutMapping("/{id}")
    public ResponseEntity<...> actualizarEstado(@PathVariable Long id, ...) { ... }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEstado(@PathVariable Long id) { ... }
}
```

**Rule:**
- Rutas exactas (`/todos`, `/buscar`, `/estadisticas`)
- Rutas con path específicos (`/{id}/estado`)
- Rutas genéricas (`/{id}`)

---

## 📋 Checklist de Verificación

### Cuando clonar/reinstalar el módulo

- [ ] Backend compila sin errores: `./gradlew clean build -x test`
- [ ] Frontend compila sin errores: `npm run build`
- [ ] Tabla existe: `SELECT COUNT(*) FROM dim_estados_gestion_citas;` → 10
- [ ] Endpoint /todos funciona: `curl http://localhost:8080/api/admin/estados-gestion-citas/todos`
- [ ] Endpoint /buscar funciona: `curl "http://localhost:8080/api/admin/estados-gestion-citas/buscar?page=0&size=30"`
- [ ] UI carga en: `http://localhost:3000/admin/users → Más → Estados Gestión Citas`
- [ ] Búsqueda retorna resultados
- [ ] Modales CRUD abren/cierran
- [ ] Crear estado válido guarda en BD
- [ ] Cambiar estado A ↔ I funciona

---

## 🎓 Lecciones de Este Módulo

### ✅ Lo que salió bien
1. **Query SQL Nativa** - Evita problemas de Hibernate con tipos de parámetros
2. **Reusable Pattern** - Copiar de "Tipos de Bolsas" aceleró desarrollo
3. **Early Testing** - Probar endpoints antes de UI previno errores
4. **Commit granular** - 3 commits para 3 bugs → fácil trackeo

### ❌ Lo que NO salió bien
1. **JPQL con LOWER()** - Mezclar JPQL con functions SQL es problemático
2. **Rutas sin versioning** - No usar `/api/` prefix puede causar conflictos

### 🛑 Próximas veces
1. Usar SQL NATIVA por defecto en queries complejas
2. Siempre verificar que apiClient sepa qué prefix agregar
3. Probar rutas en endpoints.md ANTES de implementar frontend
4. Test temprano = debugging fácil

---

## 🔧 Quick Reference: Cómo arreglar si se rompe

### Backend retorna 404
```bash
# 1. Verificar que controller tiene @RequestMapping correcto
grep -n "@RequestMapping" backend/src/main/java/.../GestionEstadosGestionCitasController.java
# Debe mostrar: @RequestMapping("/api/admin/estados-gestion-citas")

# 2. Verificar SecurityConfig
grep -n "estados-gestion-citas" backend/src/main/java/.../SecurityConfig.java
# Debe mostrar: .requestMatchers("/api/admin/estados-gestion-citas/**")

# 3. Recompilar
./gradlew clean build -x test
```

### Frontend retorna "No endpoint"
```bash
# 1. Verificar que estadosGestionCitasService.js tiene BASE_URL correcto
grep "const BASE_URL" frontend/src/services/estadosGestionCitasService.js
# Debe mostrar: const BASE_URL = '/api/admin/estados-gestion-citas';

# 2. Verificar que apiClient agrega /api/ solo si falta
cat frontend/src/lib/apiClient.js | grep "const url"

# 3. Recompilar frontend
npm run build && npm start
```

### Búsqueda retorna error bytea
```bash
# 1. Verificar que Repository usa nativeQuery = true
grep -A5 "@Query(value" backend/src/main/java/.../EstadoGestionCitaRepository.java
# Debe mostrar: nativeQuery = true

# 2. Verificar que countQuery también está en SQL nativo
grep -B2 "countQuery" backend/src/main/java/.../EstadoGestionCitaRepository.java
# Debe mostrar: countQuery = "SELECT COUNT(*) FROM public...."

# 3. Recompilar
./gradlew clean build -x test
```

---

**Autores:** Ing. Styp Canto Rondón
**Última Actualización:** 2026-01-22
**Status:** ✅ TODOS LOS ERRORES RESUELTOS v1.33.0
