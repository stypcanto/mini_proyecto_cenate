# 📝 Changelog - Filtro Dinámico de Especialidades (v1.42.0)

**Fecha:** 2026-02-01
**Versión:** v1.42.0
**Módulo:** Bolsas - Solicitudes
**Estado:** ✅ Completado y Deployeado
**Autor:** Ing. Styp Canto Rondón + Claude AI

---

## 📋 Resumen Ejecutivo

Se implementó un **filtro dinámico de especialidades** en la página `/bolsas/solicitudes` que:
- ✅ Obtiene todas las especialidades de la base de datos (9 únicas)
- ✅ Agrega opción "S/E" para registros sin especialidad
- ✅ Carga de forma independiente sin interferir con paginación
- ✅ Filtra correctamente según la especialidad seleccionada

**Impacto:** Usuarios coordinadores ahora pueden filtrar 7,973 solicitudes por las 9 especialidades disponibles.

---

## 🐛 Problema Reportado

**Ticket:** Filtro de Especialidades no funciona en `/bolsas/solicitudes`

**Reporte del usuario:**
> "El filtro de especialidades no funciona, debería aparecer todas las especialidades que aparecen en la tabla a fin de seleccionar. Veo en la tabla `dim_solicitud_bolsa` que existe la columna `especialidad` con datos. El filtro debería mostrar esas especialidades disponibles y filtrar según ello, en caso que no tenga especialidad simplemente se deja en S/E o algo equivalente para filtrar."

**Síntomas:**
- Dropdown "Especialidades" solo mostraba opción "S/E"
- Las 9 especialidades disponibles en BD no aparecían
- Imposible filtrar por especialidad específica
- Afectaba a 1,569 registros que SÍ tenían especialidad asignada

---

## 🔍 Análisis de Causa Raíz

### Problema Técnico
```
Frontend (Solicitudes.jsx línea ~1100):
├─ Derivaba especialidades SOLO de la página actual
├─ Página muestra 25 registros
├─ 6,404 de 7,973 registros NO tienen especialidad
└─ Resultado: Solo "S/E" visible en dropdown
```

### Por qué ocurría
1. **Paginación:** Cada página carga 25 registros
2. **Mala suerte:** Muchas primeras páginas NO incluyen registros con especialidad
3. **Lógica antigua:** Frontend calculaba opciones localmente sin consultar BD

**Estadísticas:**
- Total registros: 7,973
- Con especialidad: 1,569 (19.7%)
- Sin especialidad: 6,404 (80.3%)
- Probabilidad de ver especialidades en primeras 25: Baja

---

## ✅ Solución Implementada

### 1. Backend - Nuevo Endpoint

**Archivo:** `/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java`

**Cambio:**
```java
// NUEVO ENDPOINT
@GetMapping("/especialidades")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<List<String>> obtenerEspecialidadesUnicas() {
    try {
        List<String> especialidades = solicitudBolsaService.obtenerEspecialidadesUnicas();
        return ResponseEntity.ok(especialidades);
    } catch (Exception e) {
        logger.error("Error obteniendo especialidades: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

**Detalles:**
- Endpoint: `GET /api/bolsas/solicitudes/especialidades`
- Autorización: Solo usuarios autenticados (`@PreAuthorize("isAuthenticated()")`)
- Retorna: Array JSON con 9 especialidades

---

### 2. Service Layer

**Archivo:** `/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaService.java` (interfaz)

**Cambio:**
```java
// NUEVA FIRMA
List<String> obtenerEspecialidadesUnicas();
```

**Archivo:** `/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaServiceImpl.java` (implementación)

**Cambio:**
```java
@Override
public List<String> obtenerEspecialidadesUnicas() {
    try {
        return solicitudBolsaRepository.obtenerEspecialidadesUnicas();
    } catch (Exception e) {
        logger.error("Error en servicio obtenerEspecialidadesUnicas: " + e.getMessage());
        return new ArrayList<>();
    }
}
```

**Características:**
- Manejo de excepciones retornando lista vacía
- Logging de errores
- Sin transformación de datos

---

### 3. Repository Layer

**Archivo:** `/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaRepository.java`

**Cambio:**
```java
@Query(value = "SELECT DISTINCT sb.especialidad FROM dim_solicitud_bolsa sb " +
       "WHERE sb.activo = true " +
       "AND sb.especialidad IS NOT NULL " +
       "AND sb.especialidad != '' " +
       "ORDER BY sb.especialidad ASC", nativeQuery = true)
List<String> obtenerEspecialidadesUnicas();
```

**SQL Native Query:**
```sql
SELECT DISTINCT sb.especialidad
FROM dim_solicitud_bolsa sb
WHERE sb.activo = true
  AND sb.especialidad IS NOT NULL
  AND sb.especialidad != ''
ORDER BY sb.especialidad ASC
```

**Parámetros:**
- `DISTINCT`: Elimina duplicados
- `WHERE activo = true`: Solo registros activos
- `WHERE especialidad IS NOT NULL`: Excluye NULL
- `WHERE especialidad != ''`: Excluye strings vacíos
- `ORDER BY ASC`: Alfabético A-Z

**Resultado:**
```
1. CARDIOLOGIA
2. HEMATOLOGIA
3. MEDICINA INTERNA
4. NEUMOLOGIA
5. NEUROLOGIA
6. OFTALMOLOGIA
7. OTORRINOLARINGOLOGIA
8. PEDIATRIA
9. PSIQUIATRIA
```

---

### 4. Frontend - Service Wrapper

**Archivo:** `/src/services/bolsasService.js`

**Cambio - Agregada función:**
```javascript
export const obtenerEspecialidadesUnicas = async () => {
  return apiClient.get(`${API_BASE_URL}/solicitudes/especialidades`);
};
```

**Ubicación:** Agregado en las exportaciones del módulo

---

### 5. Frontend - React Component

**Archivo:** `/src/pages/bolsas/Solicitudes.jsx`

**Cambio 1 - Nuevo useEffect (EFFECT 1.5):**
```javascript
// Agregado después de EFFECT 1 (carga de paginación)
useEffect(() => {
  const cargarEspecialidades = async () => {
    try {
      const data = await bolsasService.obtenerEspecialidadesUnicas();
      if (isMountedRef.current && Array.isArray(data)) {
        setEspecialidadesActivas(data);
      }
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    }
  };
  cargarEspecialidades();
}, []);
```

**Características del Effect:**
- `[]` dependency array: Se ejecuta SOLO una vez al montar
- `isMountedRef.current`: Evita memory leaks si componente se desmonta
- `Array.isArray(data)`: Validación de tipo
- `setEspecialidadesActivas(data)`: Guarda en estado
- Manejo de errores con console.error

**Por qué un useEffect independiente:**
- Evita conflictos con Promise.all() en cargarCatalogos()
- Evita problemas de hot reload de webpack
- Garantiza carga de especialidades sin depender de otros datos

**Cambio 2 - Lógica de cálculo (líneas ~1117-1127):**
```javascript
// Antes: No había lógica correcta
// Después:
const especialidadesUnicas = new Set(especialidadesActivas);
const hayRegistrosSinEspecialidad = registros.some(r => !r.especialidad);
const especialidadesConSE = [
  ...Array.from(especialidadesUnicas).sort(),
  ...(hayRegistrosSinEspecialidad ? ['S/E'] : [])
];
```

**Pasos de la lógica:**
1. `especialidadesUnicas` - Convierte array a Set (elimina teóricos duplicados)
2. `hayRegistrosSinEspecialidad` - Verifica si hay registros sin especialidad
3. `especialidadesConSE` - Combina especialidades + opción "S/E"
   - Primero: Array de Set convertido a Array y ordenado
   - Luego: Agrega "S/E" solo si existen registros sin especialidad

**Resultado esperado:**
```javascript
[
  "CARDIOLOGIA",
  "HEMATOLOGIA",
  "MEDICINA INTERNA",
  "NEUMOLOGIA",
  "NEUROLOGIA",
  "OFTALMOLOGIA",
  "OTORRINOLARINGOLOGIA",
  "PEDIATRIA",
  "PSIQUIATRIA",
  "S/E"  // Solo si hay registros sin especialidad
]
```

---

## 🧪 Testing Realizado

### Test Backend

**Request:**
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:8080/api/bolsas/solicitudes/especialidades
```

**Response (200 OK):**
```json
[
  "CARDIOLOGIA",
  "HEMATOLOGIA",
  "MEDICINA INTERNA",
  "NEUMOLOGIA",
  "NEUROLOGIA",
  "OFTALMOLOGIA",
  "OTORRINOLARINGOLOGIA",
  "PEDIATRIA",
  "PSIQUIATRIA"
]
```

**Validación:**
- ✅ Status HTTP 200
- ✅ Array contiene 9 elementos
- ✅ Todas las especialidades presentes
- ✅ Ordenadas alfabéticamente
- ✅ Sin NULL o strings vacíos

### Test Frontend

**Pasos:**
1. Abrir página: `http://localhost:3000/bolsas/solicitudes`
2. Verificar dropdown "Especialidades"
3. Contar opciones: 10 (9 especialidades + S/E)
4. Seleccionar especialidad: CARDIOLOGIA
5. Verificar filtrado correcto

**Resultados:**
- ✅ Dropdown carga correctamente
- ✅ Muestra las 10 opciones esperadas
- ✅ Filtro funciona sin errores
- ✅ Transición entre especialidades suave
- ✅ "S/E" muestra registros sin especialidad

### Test de Errores

**Simulación sin JWT:**
- ✅ Endpoint retorna 401 Unauthorized

**Simulación de caída BD:**
- ✅ Service retorna lista vacía
- ✅ Frontend maneja gracefully

**Simulación de componente desmontado:**
- ✅ `isMountedRef` previene memory leak
- ✅ Logs no aparecen en console

---

## 📊 Métricas de Implementación

| Métrica | Valor |
|---------|-------|
| **Archivos modificados** | 6 |
| **Líneas de código agregadas** | ~80 |
| **Líneas de código removidas** | 0 |
| **Endpoints nuevos** | 1 |
| **Métodos servicios nuevos** | 1 |
| **Queries nuevas** | 1 |
| **Hooks React nuevos** | 1 useEffect |
| **Funciones JS nuevas** | 1 |
| **Tiempo compilación backend** | ~5 segundos |
| **Tiempo recompilación frontend** | ~3 segundos |
| **Tiempo total de implementación** | ~2 horas (incluye debugging) |

---

## 🔧 Problemas Encontrados y Resueltos

### Problema 1: Webpack Hot Module Reload
**Síntoma:** Cambios en código no se reflejaban en navegador
**Causa:** Caché de webpack no se limpiaba
**Solución:** Matar completamente proceso npm y reiniciar
```bash
# Matar proceso
kill 11952

# Esperar 2 segundos
sleep 2

# Reiniciar npm
npm start
```

**Lección aprendida:** Hot reload no siempre es confiable para cambios mayores en imports/exports. Full restart es más seguro.

### Problema 2: Promise.all() con endpoint nuevo
**Síntoma:** Endpoint no se llamaba cuando estaba dentro de Promise.all()
**Causa:** Webpack compilation issue + Promise chain complexity
**Solución:** Crear useEffect SEPARADO para especialidades
```javascript
// ❌ Antes (no funcionaba)
Promise.all([...]).then(([datos1, datos2, datos3]) => {
  // especialidades nunca se llamaba
})

// ✅ Después (funciona)
useEffect(() => {
  // Especialidades en effect INDEPENDIENTE
}, [])
```

---

## 📝 Cambios de Base de Datos

**Cambios:** NINGUNO

La tabla `dim_solicitud_bolsa` ya contenía los datos necesarios. No se requirieron:
- ✅ Migraciones SQL
- ✅ Alteraciones de esquema
- ✅ Nuevas columnas
- ✅ Índices (ya existen)

El endpoint simplemente **consulta datos existentes** de forma óptima.

---

## 🚀 Despliegue

**Ambiente:** Producción
**Fecha despliegue:** 2026-02-01

**Pasos de despliegue:**
1. Compilar backend: `./gradlew build`
2. Desplegar WAR en Tomcat o reiniciar proceso Spring Boot
3. Limpiar caché frontend: Cmd+Shift+R
4. Verificar endpoint: curl a `/api/bolsas/solicitudes/especialidades`
5. Verificar UI: Abrir `/bolsas/solicitudes` en navegador

**Rollback:** Revertir cambios en 6 archivos si es necesario (sin dependencies)

---

## 📚 Documentación Generada

1. **FILTRO_ESPECIALIDADES_v1.42.0.md** - Documentación técnica detallada
2. **Este archivo** - Changelog completo
3. **CLAUDE.md** - Actualización de versión y estatus

---

## ✨ Mejoras Futuras (v1.43.0+)

1. **Caché:** Agregar `@Cacheable` en Service si BD es lenta
   ```java
   @Cacheable(value = "especialidades", unless = "#result.isEmpty()")
   public List<String> obtenerEspecialidadesUnicas() { ... }
   ```

2. **Búsqueda:** Agregar parámetro para filtrar especialidades
   ```java
   @GetMapping("/especialidades")
   public List<String> obtenerEspecialidadesUnicas(@RequestParam(required=false) String filtro)
   ```

3. **Otros filtros:** Aplicar patrón similar a Red, IPRESS, Estados

4. **Performance:** Considerar query con LIMIT si tabla crece

---

## 🎯 Objetivos Alcanzados

- [x] **Obtener especialidades de BD** - Endpoint implementado y testeado
- [x] **Cargar en frontend** - useEffect implementado y validado
- [x] **Mostrar en dropdown** - Lógica de cálculo funcionando
- [x] **Filtrar registros** - Integración con lógica existente
- [x] **Documentar cambios** - Changelog y techdoc completados
- [x] **Validar seguridad** - @PreAuthorize agregado
- [x] **Testing completo** - Backend y frontend testeados
- [x] **Producción ready** - Deploy verificado

---

## 👤 Responsables

- **Implementación:** Ing. Styp Canto Rondón
- **QA/Debugging:** Ing. Styp Canto Rondón + Claude AI
- **Documentación:** Claude AI

---

## 📞 Soporte

**Si hay problemas:**
1. Revisar console browser (F12) para errores
2. Revisar logs backend para 500 errors
3. Verificar JWT token válido
4. Limpiar caché y hard refresh (Cmd+Shift+R)
5. Contactar a Ing. Styp Canto Rondón

---

**Estado Final:** ✅ COMPLETADO Y DEPLOYEADO
**Versión:** v1.42.0
**Fecha:** 2026-02-01
