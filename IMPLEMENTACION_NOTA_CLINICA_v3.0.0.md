# 📋 Implementación: Nota Clínica para Triaje ECG (v3.0.0)

**Fecha:** 2026-01-21
**Versión:** v1.21.6 (próxima)
**Estado:** ✅ COMPLETADA
**Descripción:** Implementación backend + frontend para guardar notas clínicas (hallazgos, observaciones, plan de seguimiento) en el módulo Triaje Clínico ECG.

---

## 📊 Resumen de Cambios

### Backend (Java/Spring Boot)

#### 1. **Modelo: TeleECGImagen** (`TeleECGImagen.java`)
**Ubicación:** `backend/src/main/java/com/styp/cenate/model/TeleECGImagen.java` (líneas 357-410)

**Campos Agregados:**
```java
// Hallazgos clínicos (JSON JSONB)
@Column(name = "nota_clinica_hallazgos", columnDefinition = "jsonb")
private String notaClinicaHallazgos;

// Observaciones clínicas libres (TEXT)
@Column(name = "nota_clinica_observaciones", columnDefinition = "TEXT", length = 2000)
private String notaClinicaObservaciones;

// Plan de seguimiento (JSON JSONB)
@Column(name = "nota_clinica_plan_seguimiento", columnDefinition = "jsonb")
private String notaClinicaPlanSeguimiento;

// Usuario que creó la nota clínica (FK)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "id_usuario_nota_clinica", nullable = true)
private Usuario usuarioNotaClinica;

// Fecha de creación de nota clínica
@Column(name = "fecha_nota_clinica")
private LocalDateTime fechaNotaClinica;
```

#### 2. **DTO: NotaClinicaDTO** (NUEVO)
**Ubicación:** `backend/src/main/java/com/styp/cenate/dto/teleekgs/NotaClinicaDTO.java`

```java
@Data
public class NotaClinicaDTO {
    private Map<String, Boolean> hallazgos;              // Checkboxes: ritmo, frecuencia, etc.
    private String observacionesClinicas;               // Texto libre (máx 2000 chars)
    private Map<String, Object> planSeguimiento;        // Meses, derivaciones, etc.
}
```

**Estructura esperada:**
```json
{
  "hallazgos": {
    "ritmo": true,
    "frecuencia": false,
    "intervaloPR": true,
    "duracionQRS": false,
    "segmentoST": true,
    "ondaT": false,
    "eje": true
  },
  "observacionesClinicas": "Observaciones clínicas del médico...",
  "planSeguimiento": {
    "seguimientoMeses": true,
    "seguimientoDias": 6,
    "derivarCardiologo": false,
    "hospitalizar": true,
    "medicamentos": false,
    "otrosPlan": "Descripción adicional..."
  }
}
```

#### 3. **Servicio: TeleECGService**
**Ubicación:** `backend/src/main/java/com/styp/cenate/service/teleekgs/TeleECGService.java` (líneas 542-618)

**Método Nuevo:**
```java
public TeleECGImagenDTO guardarNotaClinica(
    Long idImagen,
    NotaClinicaDTO notaClinica,
    Long idUsuarioMedico,
    String ipCliente
)
```

**Validaciones:**
- ✅ Nota clínica no nula
- ✅ Al menos un hallazgo seleccionado
- ✅ Observaciones máx 2000 caracteres
- ✅ ECG no vencida
- ✅ Conversión de Maps a JSON con ObjectMapper

**Acciones:**
- Guarda hallazgos, observaciones y plan en BD (JSONB)
- Registra usuario médico y timestamp
- Crea entrada en auditoría con acción "NOTA_CLINICA"
- Retorna DTO actualizado

#### 4. **Controlador: TeleECGController**
**Ubicación:** `backend/src/main/java/com/styp/cenate/api/TeleECGController.java` (líneas 752-800)

**Endpoint Nuevo:**
```
PUT /api/teleekgs/{idImagen}/nota-clinica
```

**Headers Requeridos:**
- Authorization: Bearer {token}

**Body:**
```json
{
  "hallazgos": { ... },
  "observacionesClinicas": "...",
  "planSeguimiento": { ... }
}
```

**Response (200 OK):**
```json
{
  "status": true,
  "message": "Nota clínica guardada exitosamente",
  "code": "200",
  "data": {
    "idImagen": 1,
    "evaluacion": "NORMAL",
    "notaClinicaHallazgos": "{\"ritmo\": true, ...}",
    "notaClinicaObservaciones": "...",
    "notaClinicaPlanSeguimiento": "{...}",
    "fechaNotaClinica": "2026-01-21T13:45:00"
  }
}
```

**Errores:**
- 400: Validación fallida
- 404: ECG no encontrada
- 500: Error interno

---

### Frontend (React/JavaScript)

#### 1. **Servicio: teleecgService.js**
**Ubicación:** `frontend/src/services/teleecgService.js` (líneas 445-473)

**Método Nuevo:**
```javascript
guardarNotaClinica: async (idImagen, notaClinica) => {
  const payload = {
    hallazgos: notaClinica.hallazgos,
    observacionesClinicas: notaClinica.observacionesClinicas,
    planSeguimiento: notaClinica.planSeguimiento,
  };

  return await apiClient.put(
    `/teleekgs/${idImagen}/nota-clinica`,
    payload,
    true
  );
}
```

#### 2. **Modal: ModalEvaluacionECG.jsx**
**Ubicación:** `frontend/src/components/teleecgs/ModalEvaluacionECG.jsx` (líneas 207-224)

**Flujo de guardado actualizado:**

```javascript
// 1️⃣ Guardar evaluación (NORMAL/ANORMAL + observaciones)
await onConfirm(evaluacion, observacionesEval.trim() || "", idImagen);

// 2️⃣ Guardar Nota Clínica (si hay hallazgos seleccionados)
if (hallazgos && Object.values(hallazgos).some(v => v === true)) {
  try {
    await teleecgService.guardarNotaClinica(idImagen, {
      hallazgos,
      observacionesClinicas: observacionesNota.trim() || null,
      planSeguimiento,
    });
    toast.success(`✅ Nota clínica guardada exitosamente`);
  } catch (notaError) {
    console.error("⚠️ Advertencia: Nota clínica no se guardó:", notaError);
    toast.warning("Evaluación guardada, pero hubo error en nota clínica");
  }
}
```

**Comportamiento:**
- ✅ Si evaluación falla → Error (no continúa)
- ✅ Si evaluación OK → Toast de éxito
- ✅ Si hay hallazgos → Intenta guardar nota clínica
- ✅ Si nota clínica falla → Warning (no afecta evaluación)

---

## 🗄️ Base de Datos

### Migration Script: `V3_0_1__AddNotaClinicaFields.sql`
**Ubicación:** `backend/src/main/resources/db/migration/V3_0_1__AddNotaClinicaFields.sql`

**Operaciones:**
```sql
-- Agregar 5 columnas nuevas a tele_ecg_imagenes
ALTER TABLE tele_ecg_imagenes ADD COLUMN nota_clinica_hallazgos jsonb;
ALTER TABLE tele_ecg_imagenes ADD COLUMN nota_clinica_observaciones TEXT;
ALTER TABLE tele_ecg_imagenes ADD COLUMN nota_clinica_plan_seguimiento jsonb;
ALTER TABLE tele_ecg_imagenes ADD COLUMN id_usuario_nota_clinica BIGINT;
ALTER TABLE tele_ecg_imagenes ADD COLUMN fecha_nota_clinica TIMESTAMP;

-- Agregar FK constraint
ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT fk_nota_clinica_usuario
FOREIGN KEY (id_usuario_nota_clinica)
REFERENCES dim_usuarios(id_usuario)
ON DELETE SET NULL;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_tele_ecg_nota_clinica_fecha
ON tele_ecg_imagenes(fecha_nota_clinica DESC);
```

**Automático:** Flyway ejecutará este script al iniciar Spring Boot (v3.0.1 > versión anterior)

---

## ✅ Testing

### Endpoint Testing (curl)
```bash
# 1. Obtener token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"44914706","password":"@Cenate2025"}' \
  | jq -r '.data.token')

# 2. Guardar evaluación
curl -X PUT http://localhost:8080/api/teleekgs/1/evaluar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "evaluacion": "NORMAL",
    "descripcion": "Ritmo sinusal regular sin arritmias"
  }'

# 3. Guardar nota clínica
curl -X PUT http://localhost:8080/api/teleekgs/1/nota-clinica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hallazgos": {
      "ritmo": true,
      "frecuencia": true,
      "intervaloPR": false,
      "duracionQRS": false,
      "segmentoST": false,
      "ondaT": false,
      "eje": false
    },
    "observacionesClinicas": "Paciente estable, ritmo regular sin cambios significativos.",
    "planSeguimiento": {
      "seguimientoMeses": true,
      "seguimientoDias": 6,
      "derivarCardiologo": false,
      "hospitalizar": false,
      "medicamentos": false,
      "otrosPlan": ""
    }
  }'
```

### Frontend UI Testing
**Flujo completo Triaje Clínico:**

1. ✅ **TAB 1: VER IMÁGENES** - Carrusel de 4 ECGs
   - Zoom 20%-200%
   - Rotación 90°
   - Navegación con arrows

2. ✅ **TAB 2: EVALUACIÓN** - Marcar Normal/Anormal
   - Seleccionar resultado
   - Observaciones opcionales (0-1000 chars)
   - Validación en frontend

3. ✅ **TAB 3: NOTA CLÍNICA** - Hallazgos y plan
   - 7 checkboxes de hallazgos
   - Observaciones clínicas (0-2000 chars)
   - Plan seguimiento (meses, derivaciones, hospitalizaciones)

4. ✅ **GUARDAR** - Secuencia dual
   - Guarda evaluación primero
   - Guarda nota clínica en segundo plano
   - Toast notifications

---

## 🔍 Verificación de Implementación

### Archivos Modificados
| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `TeleECGImagen.java` | 357-410 | +5 campos nuevos |
| `TeleECGService.java` | 542-618 | +1 método público + 1 helper |
| `TeleECGController.java` | 752-800 | +1 endpoint PUT |
| `ModalEvaluacionECG.jsx` | 207-224 | Actualizado handleGuardar() |
| `teleecgService.js` | 445-473 | +1 método async |

### Archivos Creados
| Archivo | Propósito |
|---------|-----------|
| `NotaClinicaDTO.java` | DTO para datos de nota clínica |
| `V3_0_1__AddNotaClinicaFields.sql` | Migration Flyway v3.0.1 |

### Compilación
```bash
✅ BUILD SUCCESSFUL in 27s
✅ 0 compilation errors
✅ 38 warnings (javadoc, no afectan funcionalidad)
```

---

## 🚀 Características Implementadas

| Característica | Estado | Detalles |
|---|---|---|
| Almacenamiento hallazgos (JSONB) | ✅ | 7 checkboxes: ritmo, frecuencia, PR, QRS, ST, T, eje |
| Observaciones clínicas | ✅ | Texto libre 0-2000 chars, opcional |
| Plan de seguimiento | ✅ | Meses (1-12), derivaciones, hospitalizaciones, medicamentos |
| Validaciones backend | ✅ | Hallazgos mínimo 1, observaciones máx 2000 |
| Validaciones frontend | ✅ | UI requiere al menos 1 hallazgo |
| Auditoría | ✅ | Registra acción "NOTA_CLINICA" + usuario + IP + fecha |
| Usuario médico FK | ✅ | Referencia a dim_usuarios.id_usuario |
| Timestamp | ✅ | fecha_nota_clinica TIMESTAMP |
| Endpoint REST | ✅ | PUT /api/teleekgs/{idImagen}/nota-clinica |
| Permiso MBAC | ✅ | @CheckMBACPermission(pagina="/teleekgs/listar", accion="editar") |
| Migration Flyway | ✅ | V3_0_1 automática al iniciar |
| Toast notifications | ✅ | Éxito/Warning en frontend |

---

## 📝 Notas Importantes

### Orden de Guardado
1. **Primero:** Evaluación (NORMAL/ANORMAL) - Obligatoria
2. **Segundo:** Nota Clínica - Opcional (solo si hay hallazgos)

Si evaluación falla → No continúa
Si nota clínica falla → Warning pero no afecta evaluación

### JSON Storage
```
nota_clinica_hallazgos: JSONB en BD
{"ritmo": true, "frecuencia": false, ...}

nota_clinica_plan_seguimiento: JSONB en BD
{"seguimientoMeses": true, "seguimientoDias": 6, ...}
```

### Seguridad
- ✅ Validación MBAC en endpoint
- ✅ Validación DTO con @Valid
- ✅ Validación servicio (size checks, not null)
- ✅ FK constraint a usuario médico
- ✅ Auditoría con IP origen

---

## 🔄 Próximas Versiones (Futuro)

- [ ] Endpoint GET para recuperar nota clínica existente
- [ ] Edición de nota clínica después de guardar
- [ ] Vista de historial de notas clínicas
- [ ] Exportar notas clínicas a PDF
- [ ] Integración con asignación de cardiólogos para derivaciones

---

## 📚 Referencias

- **Triaje Clínico Modal:** `frontend/src/components/teleecgs/ModalEvaluacionECG.jsx` (v6.0.0)
- **Evaluación Anterior:** `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md`
- **Auditoría:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`

---

**Implementado por:** Claude Code
**Fecha:** 2026-01-21
**Versión:** v1.21.6 (próxima)
**Estado:** ✅ LISTO PARA TESTING
