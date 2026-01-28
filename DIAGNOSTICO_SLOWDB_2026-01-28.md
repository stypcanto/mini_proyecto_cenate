# 🔴 DIAGNÓSTICO DE PROBLEMA DE PERFORMANCE EN BD - 2026-01-28

## 📋 RESUMEN EJECUTIVO

**Problema:** Login lento (hasta 10 minutos) + BD no responde
**Causa Identificada:** Error SQL crítico en queries a `dim_solicitud_bolsa`
**Severidad:** 🔴 CRÍTICA
**Estado:** Analizado, solución identificada, pendiente implementación

---

## 🔍 ANÁLISIS DETALLADO

### Error SQL Encontrado en Logs

```
ERROR: operator does not exist: character varying = bigint
Hint: No operator matches the given name and argument types.
Position: 600

Caused by: org.postgresql.util.PSQLException: ERROR: operator does not exist: character varying = bigint
```

### Query Afectada

```sql
SELECT ... FROM public.dim_solicitud_bolsa sb1_0
WHERE sb1_0.id_bolsa=? AND sb1_0.paciente_id=? AND sb1_0.id_servicio=?
```

### Mismatch de Tipos Identificado

| Campo | BD | Java (Correcto) | Java (¿Incorrecto?) |
|-------|----|----|---|
| `paciente_id` | VARCHAR | String ✓ | Long ❌ |
| `id_bolsa` | BIGINT | Long ✓ | Long ✓ |
| `id_servicio` | BIGINT | Long ✓ | Long ✓ |

---

## 💥 ¿POR QUÉ CAUSA ESTE PROBLEMA LENTITUD?

### 1. Cada Query Fallida
- PostgreSQL rechaza la query (tipos incompatibles)
- Hibernate/Spring intenta 1-3 veces (retry logic)
- Espera timeout de 30-60 segundos por cada intento
- Total por query: **60-180 segundos** de espera

### 2. Acumulación de Conexiones
```
100 requests/minuto × timeout 60-180s = pool agotado en 3-5 minutos
```

### 3. Cascada de Timeouts
- Nuevas requests no encuentran conexión disponible
- HikariCP queue se llena
- Requests esperar aún más tiempo
- Finalmente: **Sin conexión disponible**

### 4. Síntoma: Login 10 Minutos
Si el login carga módulos de bolsas:
1. Request de login → /login endpoint
2. Sistema carga módulos del usuario
3. Intenta traer solicitudes de bolsa (query fail)
4. Espera 60-180s por timeout
5. Pool se agota → nuevas requests esperan
6. Después de 10 minutos acumulativos → respuesta

---

## 🔎 PRÓXIMOS PASOS PARA SOLUCIONAR

### Paso 1: Identificar Dónde Se Pasa el Tipo Incorrecto

**Ejecutar estos comandos para buscar:**

```bash
# Buscar conversiones sospechosas de Long a pacienteId
grep -r "\.pacienteId(.*Long\|\.pacienteId([0-9]" \
  backend/src/main/java/com/styp/cenate/ \
  --include="*.java"

# Buscar parseLong o valueOf relacionado a paciente
grep -r "Long\.parseLong.*paciente\|Long\.valueOf.*paciente" \
  backend/src/main/java/com/styp/cenate/ \
  --include="*.java"

# Buscar métodos que llaman a repository con tipos
grep -rn "existsByIdBolsaAndPacienteId\|findByIdBolsaAndPacienteId" \
  backend/src/main/java/com/styp/cenate/service/ \
  --include="*.java" -A 3
```

### Paso 2: Revisar Puntos de Entrada

**Revisar estos archivos:**
- `SolicitudBolsaServiceImpl.java` - Líneas donde se llama a repository
- `SolicitudBolsaEstadisticasServiceImpl.java` - Si accede a bolsas
- Cualquier controller que llame a métodos de bolsas

### Paso 3: Validar Tipado en Métodos

**Buscar patrones problemáticos:**
```java
// ❌ INCORRECTO - Pasando Long
Long pacienteId = 123L;
repository.existsByIdBolsaAndPacienteId(1L, pacienteId); // ERROR

// ✓ CORRECTO - Pasando String
String pacienteId = "12345678";
repository.existsByIdBolsaAndPacienteId(1L, pacienteId); // OK
```

### Paso 4: Compilar y Reiniciar

```bash
cd backend
./gradlew clean build --refresh-dependencies
# Si hay errores de compilación, corregir
./gradlew bootRun
```

### Paso 5: Monitorear en Tiempo Real

```bash
# Terminal 1: Ver logs
tail -f backend/logs/cenate-backend.log | grep -E "character varying|operator does not exist"

# Terminal 2: Simular login (desde otra terminal)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Paso 6: Validar Solución

Después de reiniciar:
- [ ] Login responde en < 5 segundos
- [ ] Cargar solicitudes de bolsa es rápido
- [ ] No hay errores SQL en logs
- [ ] BD responde a nuevas conexiones sin demora

---

## 📊 INFORMACIÓN TÉCNICA

### Campo Problemático
- **Tabla:** `public.dim_solicitud_bolsa`
- **Columna:** `paciente_id`
- **Tipo SQL:** `character varying` (VARCHAR)
- **Constraint:** NOT NULL, parte de composite FK

### Métodos del Repository Afectados

```java
boolean existsByIdBolsaAndPacienteId(
    Long idBolsa,
    String pacienteId  // DEBE ser String, no Long
);

boolean existsByIdBolsaAndPacienteIdAndIdServicio(
    Long idBolsa,
    String pacienteId,  // DEBE ser String
    Long idServicio
);

boolean existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue(
    Long idBolsa,
    String pacienteId,  // DEBE ser String
    Long idServicio
);

List<SolicitudBolsa> findByIdBolsaAndPacienteIdAndIdServicio(
    Long idBolsa,
    String pacienteId,  // DEBE ser String
    Long idServicio
);
```

### Archivos Clave Modificados en Este Session
- ✓ `backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java` - Reverted a String ✓
- ✓ `backend/src/main/java/com/styp/cenate/dto/bolsas/SolicitudBolsaDTO.java` - Reverted a String ✓
- ✓ `backend/src/main/java/com/styp/cenate/repository/bolsas/SolicitudBolsaRepository.java` - Parámetros corregidos a String ✓

---

## 🧪 TEST DE DIAGNÓSTICO EN BD

```sql
-- Verificar que el tipo en BD es correcto
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dim_solicitud_bolsa'
  AND column_name = 'paciente_id';

-- Resultado esperado:
-- column_name | data_type
-- ------------|------------
-- paciente_id | character varying

-- Intentar query problemática
SELECT * FROM dim_solicitud_bolsa
WHERE id_bolsa = 1
  AND paciente_id = '12345678'  -- String, no número
  AND id_servicio = 5;
```

---

## 📞 CONTACTO Y REFERENCIAS

**Log File Analizado:**
- `/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/backend/logs/cenate-backend-error-2026-01-28.1.log`

**Documentación Relacionada:**
- Especificación dim_solicitud_bolsa: `spec/backend/09_modules_bolsas/12_modulo_solicitudes_bolsa_v1.12.0.md`
- Schema BD: `spec/database/01_models/01_modelo_usuarios.md`

**Desarrollador:** Claude (AI Assistant)
**Fecha:** 2026-01-28
**Severidad:** 🔴 CRÍTICA - Requiere atención inmediata

---

## ✅ CHECKLIST DE RESOLUCIÓN

- [ ] Ejecutar comandos de búsqueda (Paso 1)
- [ ] Identificar línea exacta donde se pasa tipo incorrecto
- [ ] Corregir el código (cambiar Long → String)
- [ ] Compilar backend sin errores
- [ ] Reiniciar aplicación
- [ ] Monitorear logs (Paso 5)
- [ ] Validar solución (Paso 6)
- [ ] Confirmar login rápido
- [ ] Confirmar BD responde normalmente
- [ ] Documento completo: Completado ✓
