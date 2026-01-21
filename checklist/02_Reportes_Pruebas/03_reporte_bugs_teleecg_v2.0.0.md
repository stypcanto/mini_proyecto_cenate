# 🐛 REPORTE DE BUGS - Módulo TeleECG v2.0.0

**Proyecto:** CENATE - Centro Nacional de Telemedicina
**Módulo:** TeleECG v2.0.0 (Filesystem Storage)
**Fecha Reporte:** 2026-01-20
**Fase:** 5 - Deployment (Pre-producción)
**Analista:** Ing. Styp Canto Rondón

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total Bugs** | 5 |
| **Críticos (🔴)** | 2 - BLOQUEAN DEPLOYMENT |
| **Medios (🟠)** | 1 - AFECTA UX |
| **Menores (🟡)** | 2 - MEJORAS |
| **Estimado Fix** | 8 horas |
| **Prioridad** | INMEDIATA |

---

## 🔴 BUGS CRÍTICOS

### BUG #T-ECG-001: Estadísticas Retorna 0

**Identificación:**
```
ID:             T-ECG-001
Severidad:      🔴 CRÍTICO
Componente:     Backend - TeleECGImagenRepository
Archivo:        backend/src/main/java/com/styp/cenate/repository/TeleECGImagenRepository.java
Línea:          ~245
Impacto:        BLOQUEA DEPLOYMENT
Estado:         🔴 CONFIRMADO
```

**Descripción del Problema:**

En pantalla "TeleECG Recibidas", las 4 tarjetas estadísticas muestran valores 0 (Total=0, Pendientes=0, Procesadas=0, Rechazadas=0), pero la tabla contiene 1 registro visible.

**Pantalla Afectada:**
```
localhost:3000/teleecg/recibidas
├─ Tarjeta "Total": 0 ❌ (debería ser 1)
├─ Tarjeta "Pendientes": 0 ❌ (debería ser 1)
├─ Tarjeta "Procesadas": 0 ❌ (debería ser 0)
├─ Tarjeta "Rechazadas": 0 ❌ (debería ser 0)
└─ Tabla: 1 ECG visible ✅
```

**Causa Raíz:**

Query en `TeleECGImagenRepository` no retorna conteo correcto:

```java
// ❌ CÓDIGO ACTUAL (INCORRECTO)
@Query("SELECT COUNT(*) FROM TeleECGImagen c " +
       "WHERE c.statImagen = 'A'")
public Long getTotalImagenes();

// Problemas:
// 1. Retorna valor incorrecto (probablemente 0 por algún mapping)
// 2. Falta filtro: AND c.fechaExpiracion >= CURRENT_TIMESTAMP
// 3. Los datos existen en BD pero query retorna mal
```

**Verificación en BD:**

```sql
-- Ejecutar en: psql -h 10.0.89.13 -U postgres -d maestro_cenate

-- Query actual (INCORRECTO):
SELECT COUNT(*) FROM tele_ecg_imagenes
WHERE stat_imagen = 'A';
-- Resultado: 1 ✅ (CORRECTO)

-- Pero la query JPA retorna: 0 ❌ (INCORRECTO)
```

**Impacto:**

| Aspecto | Impacto |
|---------|---------|
| **UX** | Coordinador ve KPIs confusos (todos 0) |
| **Confianza** | Duda si sistema está funcionando |
| **Decisiones** | Podría tomar decisiones basadas en datos falsos |
| **Deployment** | 🛑 BLOQUEA ir a producción |

**Reproducción:**

1. Loguearse como Admin/Coordinador
2. Navegar a `/teleecg/recibidas`
3. Observar 4 tarjetas estadísticas
4. Esperado: Total=1, Pendientes=1
5. Real: Total=0, Pendientes=0

**Fix Recomendado:**

```java
// ✅ CÓDIGO CORREGIDO
@Query("SELECT new map(" +
       "COUNT(c) as total, " +
       "COALESCE(SUM(CASE WHEN c.estado = 'PENDIENTE' THEN 1 ELSE 0 END), 0L) as pendientes, " +
       "COALESCE(SUM(CASE WHEN c.estado = 'PROCESADA' THEN 1 ELSE 0 END), 0L) as procesadas, " +
       "COALESCE(SUM(CASE WHEN c.estado = 'RECHAZADA' THEN 1 ELSE 0 END), 0L) as rechazadas) " +
       "FROM TeleECGImagen c " +
       "WHERE c.statImagen = 'A' " +
       "AND c.fechaExpiracion >= CURRENT_TIMESTAMP")
Map<String, Long> getEstadisticasCompletas();
```

**Ubicaciones a Actualizar:**

1. `TeleECGImagenRepository.getTotalImagenes()`
2. `TeleECGImagenRepository.getPendientes()`
3. `TeleECGImagenRepository.getProcesadas()`
4. `TeleECGImagenRepository.getRechazadas()`

**Estimado:** 2 horas (test + validación)

---

### BUG #T-ECG-002: ECGs Vencidas Siguen Visibles

**Identificación:**
```
ID:             T-ECG-002
Severidad:      🔴 CRÍTICO
Componente:     Backend - TeleECGImagenRepository
Archivo:        backend/src/main/java/com/styp/cenate/repository/TeleECGImagenRepository.java
Línea:          ~150
Impacto:        BLOQUEA DEPLOYMENT (Datos stale)
Estado:         🔴 CONFIRMADO
```

**Descripción del Problema:**

Imágenes ECG con `fecha_expiracion < NOW()` deberían estar inactivas (stat_imagen = 'I'), pero siguen apareciendo en listados y pueden ser procesadas.

**Escenario:**
```
Imagen subida: 2026-01-01 08:00 AM
Fecha expiración: 2026-02-01 08:00 AM (auto +30 días)
Hoy: 2026-02-05

Resultado esperado: No aparece en tabla ✅
Resultado real: Sigue apareciendo ❌
```

**Causa Raíz:**

Query `buscarFlexible()` en repository no filtra por `fecha_expiracion`:

```java
// ❌ CÓDIGO ACTUAL (INCORRECTO)
@Query("SELECT c FROM TeleECGImagen c " +
       "WHERE (...otros filtros...) " +
       "AND c.statImagen = 'A' " +
       "ORDER BY c.fechaEnvio DESC")
List<TeleECGImagen> buscarFlexible(...);

// Problema: No verifica si está vencida
// Debería verificar: c.fechaExpiracion >= NOW()
```

**Verificación:**

```sql
-- ECGs que DEBERÍAN estar inactivas
SELECT COUNT(*) FROM tele_ecg_imagenes
WHERE stat_imagen = 'A' AND fecha_expiracion < NOW();
-- Si retorna > 0, hay bug

-- ECGs activas y NO vencidas
SELECT COUNT(*) FROM tele_ecg_imagenes
WHERE stat_imagen = 'A' AND fecha_expiracion >= NOW();
```

**Impacto:**

| Aspecto | Impacto |
|---------|---------|
| **Datos Stale** | Usuario puede procesar ECG expirado |
| **Integridad** | Viola SLA de 30 días de retención |
| **Auditoría** | Registra procesos en datos inválidos |
| **Deployment** | 🛑 CRITICAL - Datos comprometidos |

**Reproducción:**

1. Crear ECG vieja (> 30 días)
2. Marcar stat_imagen = 'A' en BD manualmente
3. Navegar a `/teleecg/recibidas`
4. Observar tabla
5. Esperado: No aparece
6. Real: Aparece

**Fix Recomendado:**

```java
// ✅ CÓDIGO CORREGIDO
@Query("SELECT c FROM TeleECGImagen c " +
       "WHERE (...otros filtros...) " +
       "AND c.statImagen = 'A' " +
       "AND c.fechaExpiracion >= CURRENT_TIMESTAMP " +  // ✅ NUEVO
       "ORDER BY c.fechaEnvio DESC")
List<TeleECGImagen> buscarFlexible(...);
```

**Ubicaciones a Actualizar:**

1. `TeleECGImagenRepository.buscarFlexible()`
2. `TeleECGImagenRepository.findByNumDocPacienteAndStatImagenEquals()`
3. `TeleECGImagenRepository.findByEstadoAndStatImagenEquals()`

**Estimado:** 1 hora

---

## 🟠 BUGS MEDIOS

### BUG #T-ECG-003: Modal sin Campo Observaciones

**Identificación:**
```
ID:             T-ECG-003
Severidad:      🟠 MEDIO
Componente:     Frontend - TeleECGRecibidas.jsx
Archivo:        frontend/src/pages/teleecg/TeleECGRecibidas.jsx
Línea:          ~450 (handleProcesarECG)
Impacto:        AFECTA UX / Auditoría incompleta
Estado:         🟠 CONFIRMADO
```

**Descripción del Problema:**

Cuando coordinador hace click "Procesar ECG", el sistema cambia estado directamente a PROCESADA sin pedir observaciones/notas. No hay forma de documentar por qué fue aceptado.

**Flujo Actual (INCORRECTO):**
```
Click "Procesar"
    ↓
PUT /api/teleekgs/{id}/procesar { accion: "PROCESAR" }
    ↓
Estado: PENDIENTE → PROCESADA ✅
Notas: (vacío) ❌
```

**Flujo Esperado (CORRECTO):**
```
Click "Procesar"
    ↓
Modal: "Ingresa observaciones..."
    ↓
Input: "Imagen clara y de buena calidad"
    ↓
PUT /api/teleekgs/{id}/procesar { accion: "PROCESAR", observaciones: "..." }
    ↓
Estado: PENDIENTE → PROCESADA ✅
Notas: Guardadas en BD ✅
```

**Impacto:**

| Aspecto | Impacto |
|---------|---------|
| **Auditoría** | No hay razón documentada de aceptación |
| **Compliance** | Falta contexto para auditoría regulatoria |
| **UX** | Coordinador no puede documentar decisión |

**Código Actual (INCORRECTO):**

```jsx
// frontend/src/pages/teleecg/TeleECGRecibidas.jsx - línea ~450

const handleProcesarECG = async (ecg) => {
  try {
    await teleecgService.procesarImagen(ecg.idImagen, {
      accion: "PROCESAR"
      // ❌ FALTA: observaciones
    });
    toast.success("ECG procesado");
    cargarECGs();
  } catch (error) {
    toast.error("Error: " + error.message);
  }
};
```

**Fix Recomendado:**

```jsx
// ✅ CÓDIGO CORREGIDO

const handleProcesarECG = async (ecg) => {
  const observaciones = prompt("Ingresa observaciones (opcional):");

  // Si user cancela, no hacer nada
  if (observaciones === null) return;

  try {
    await teleecgService.procesarImagen(ecg.idImagen, {
      accion: "PROCESAR",
      observaciones: observaciones || ""  // ✅ AHORA SE ENVÍA
    });
    toast.success("ECG procesado correctamente");
    cargarECGs();
  } catch (error) {
    toast.error("Error al procesar: " + error.message);
  }
};
```

**Backend - Agregar Campo:**

```java
// backend/src/main/java/com/styp/cenate/dto/teleekgs/ProcesarImagenECGDTO.java

@Data
public class ProcesarImagenECGDTO {
    @NotNull(message = "Acción requerida")
    private String accion;  // PROCESAR, RECHAZAR, VINCULAR

    private String observaciones;  // ✅ NUEVO - Notas cuando PROCESAR
    private String motivo;         // Razón cuando RECHAZAR
}
```

**Estimado:** 2 horas

---

## 🟡 BUGS MENORES

### BUG #T-ECG-004: Sin Confirmación al Rechazar

**Identificación:**
```
ID:             T-ECG-004
Severidad:      🟡 BAJO
Componente:     Frontend - TeleECGRecibidas.jsx
Archivo:        frontend/src/pages/teleecg/TeleECGRecibidas.jsx
Línea:          ~470
Impacto:        Riesgo click accidental
Estado:         🟡 CONFIRMADO
```

**Descripción:**

Usuario hace click "Rechazar" y se rechaza inmediatamente sin confirmación. Una operación irreversible sin validación es riesgo.

**Código Actual:**

```jsx
// ❌ SIN CONFIRMACIÓN
const handleRechazarECG = async (ecg) => {
  // Directamente rechaza sin pedir confirmación
  const motivo = prompt("Motivo del rechazo:");
  if (!motivo) return;

  await teleecgService.procesarImagen(ecg.idImagen, {
    accion: "RECHAZAR",
    motivo: motivo
  });
};
```

**Fix:**

```jsx
// ✅ CON CONFIRMACIÓN
const handleRechazarECG = async (ecg) => {
  // Primero confirmar
  if (!window.confirm("¿Estás seguro? Esta acción no se puede deshacer")) {
    return;
  }

  // Luego pedir motivo
  const motivo = prompt("Ingresa el motivo del rechazo:");
  if (!motivo) return;

  try {
    await teleecgService.procesarImagen(ecg.idImagen, {
      accion: "RECHAZAR",
      motivo: motivo
    });
    toast.success("ECG rechazada");
  } catch (error) {
    toast.error("Error: " + error.message);
  }
};
```

**Estimado:** 1 hora

---

### BUG #T-ECG-005: Sin Feedback en Descargas Grandes

**Identificación:**
```
ID:             T-ECG-005
Severidad:      🟡 BAJO
Componente:     Frontend/Backend - teleecgService.js
Archivo:        frontend/src/services/teleecgService.js
Línea:          ~180
Impacto:        UX confusa en descargas >10MB
Estado:         🟡 CONFIRMADO
```

**Descripción:**

Usuario descarga archivo >10MB y no hay indicador visual de progreso. Parece que nada ocurre, causando confusion.

**Código Actual:**

```javascript
// ❌ SIN BARRA PROGRESO
async descargarImagen(idImagen, nombreArchivo) {
  try {
    const response = await apiClient.get(
      `/teleekgs/${idImagen}/descargar`,
      { responseType: 'blob' }
    );

    // Directamente descarga sin feedback
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Fix Recomendado:**

```javascript
// ✅ CON BARRA PROGRESO
async descargarImagen(idImagen, nombreArchivo) {
  try {
    // Mostrar toast "Descargando..."
    const toastId = toast.loading("Descargando archivo...", {
      autoClose: false
    });

    const response = await apiClient.get(
      `/teleekgs/${idImagen}/descargar`,
      {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Actualizar toast con progreso
          toast.update(toastId, {
            render: `Descargando: ${percentCompleted}%`
          });
        }
      }
    );

    // Descargar
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();

    // Mostrar éxito
    toast.update(toastId, {
      render: "Descarga completada",
      type: "success",
      isLoading: false,
      autoClose: 3000
    });
  } catch (error) {
    toast.error("Error en descarga: " + error.message);
  }
}
```

**Estimado:** 2 horas

---

## 📋 CHECKLIST DE FIXES

### Antes de Deploy

- [ ] **T-ECG-001:** Fijar query estadísticas (2h)
- [ ] **T-ECG-002:** Agregar validación fecha_expiracion (1h)
- [ ] **T-ECG-003:** Agregar modal observaciones (2h)
- [ ] **T-ECG-004:** Agregar confirmación rechazo (1h)
- [ ] **T-ECG-005:** Agregar barra progreso descarga (2h)
- [ ] Testing completo después de cada fix
- [ ] Ejecutar 65+ tests automatizados
- [ ] Validación en servidor 10.0.89.13

### Después de Fixes

- [ ] Code review
- [ ] UAT (User Acceptance Testing)
- [ ] Deploy a staging
- [ ] Deploy a producción
- [ ] Monitoreo 24h

---

## 🔧 INFORMACIÓN TÉCNICA

### Ambiente de Testing

```
Backend:     localhost:8080
Frontend:    localhost:3000
BD:          10.0.89.13:5432 (maestro_cenate)
Usuario:     84151616 (PADOMI - INSTITUCION_EX)
Admin:       Styp Canto (SUPERADMIN)
```

### Reproducción de Bugs

1. **T-ECG-001 & T-ECG-002:**
   ```bash
   # Ejecutar query de verificación en BD
   psql -h 10.0.89.13 -U postgres -d maestro_cenate
   SELECT COUNT(*) FROM tele_ecg_imagenes WHERE stat_imagen = 'A';
   ```

2. **T-ECG-003, T-ECG-004, T-ECG-005:**
   - Abrir DevTools → Console
   - Ejecutar acciones en página
   - Verificar requests/responses

---

## 📈 IMPACTO EN DEPLOYMENT

```
┌─────────────────────────────────────────────────┐
│         ESTADO PRE-DEPLOYMENT                   │
├─────────────────────────────────────────────────┤
│ Sin Fixes:  ❌ NO LISTO (Datos comprometidos)  │
│ Con Fixes:  ✅ LISTO (8h de trabajo)            │
│                                                 │
│ Bugs que bloquean:   T-ECG-001, T-ECG-002      │
│ Bugs que afectan UX: T-ECG-003, T-ECG-004      │
│ Bugs menores:        T-ECG-005                  │
└─────────────────────────────────────────────────┘
```

---

## 📞 CONTACTO

**Reportado por:** Ing. Styp Canto Rondón
**Equipo CENATE**
**Fecha:** 2026-01-20

Para consultas o aclaraciones, referir a este reporte y documentación técnica adjunta.
