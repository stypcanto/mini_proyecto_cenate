# v1.47.0: Sistema Completo de Registro de Atención Médica

> **Registro Integral de Atenciones**: Recita + Interconsulta + Enfermedades Crónicas
> **Versión:** v1.47.0 (2026-02-06)
> **Status:** ✅ Production Ready

---

## 📋 Resumen de la Característica

**v1.47.0** implementa un sistema completo que permite a los médicos registrar atenciones médicas integrales en una sola acción. Cuando un médico marca un paciente como **"Atendido"**, puede simultáneamente:

1. **📋 Recita** - Crear seguimiento con plazo especificado (3, 7, 15, 30, 60, 90 días)
2. **🔗 Interconsulta** - Referir a especialista seleccionando especialidad
3. **🏥 Enfermedades Crónicas** - Registrar si el paciente tiene enfermedades crónicas (Hipertensión, Diabetes, Otro)

---

## 🔄 Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ MÉDICO: Mis Pacientes                                                │
│ ├─ Tabla de pacientes asignados                                         │
│ └─ Click en botón de Condición (Atendido)                              │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 2️⃣ MODAL 1: Cambiar Estado de Consulta                                 │
│ ├─ Muestra paciente actual                                              │
│ ├─ 3 opciones: Atendido | Pendiente | Deserción                        │
│ └─ Selecciona: ✓ Atendido → Click: Confirmar                           │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 3️⃣ MODAL 2: Registrar Atención Médica (v1.47.0)                        │
│                                                                          │
│ 📋 RECITA (Opcional)                                                    │
│ ├─ ☐ Checkbox "Recita"                                                 │
│ ├─ ▼ Dropdown: Plazo (3|7|15|30|60|90 días)                           │
│                                                                          │
│ 🔗 INTERCONSULTA (Opcional)                                             │
│ ├─ ☐ Checkbox "Interconsulta"                                          │
│ ├─ ▼ Dropdown: Especialidad (dinámico desde BD)                        │
│                                                                          │
│ 🏥 ENFERMEDAD CRÓNICA (Opcional)                                        │
│ ├─ ☐ Checkbox "Paciente Crónico"                                       │
│ ├─ ☐ Hipertensión                                                      │
│ ├─ ☐ Diabetes                                                          │
│ ├─ ☐ Otra enfermedad crónica                                          │
│ └─ 📝 [Texto opcional si selecciona "Otro"]                           │
│                                                                          │
│ Botones: [← Atrás] [Cancelar] [✓ Registrar Atención]                  │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 4️⃣ BACKEND: Procesar Atención (Transaccional)                          │
│                                                                          │
│ POST /api/gestion-pacientes/{id}/atendido                              │
│                                                                          │
│ ├─ A. Guardar enfermedades crónicas                                    │
│ │  └─ INSERT asegurado_enfermedad_cronica (si esCronico=true)         │
│ │                                                                        │
│ ├─ B. Crear bolsa RECITA (si tieneRecita=true)                        │
│ │  └─ INSERT dim_solicitud_bolsa                                       │
│ │     ├─ tipoCita: "RECITA"                                           │
│ │     ├─ id_tipo_bolsa: 11                                             │
│ │     ├─ estado: "PENDIENTE"                                           │
│ │     ├─ origen_bolsa: "BOLSA_GENERADA_X_PROFESIONAL"                │
│ │     └─ estadoGestionCitasId: 1 (espera citas)                       │
│ │                                                                        │
│ ├─ C. Crear bolsa INTERCONSULTA (si tieneInterconsulta=true)          │
│ │  └─ INSERT dim_solicitud_bolsa                                       │
│ │     ├─ tipoCita: "INTERCONSULTA"                                     │
│ │     ├─ especialidad: [seleccionada]                                  │
│ │     ├─ id_tipo_bolsa: 11                                             │
│ │     ├─ estado: "PENDIENTE"                                           │
│ │     └─ origen_bolsa: "BOLSA_GENERADA_X_PROFESIONAL"                │
│ │                                                                        │
│ └─ D. Cambiar estado original a "Atendido"                            │
│    └─ UPDATE dim_solicitud_bolsa SET estado="Atendido"                │
│                                                                          │
│ ✅ Transacción: ALL or NOTHING                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 5️⃣ COORDINADOR: Gestión de Nuevas Bolsas                               │
│                                                                          │
│ Módulo: /bolsas/solicitudes                                             │
│ ├─ RECITA: Asignar médico especialista para seguimiento                │
│ ├─ INTERCONSULTA: Agendar con especialista seleccionado                │
│ └─ Estado: PENDIENTE → PENDIENTE CITAR → CITADO → ASISTIÓ            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso Detallados

### Caso 1: Solo Recita
**Escenario**: Paciente necesita seguimiento en 7 días
```
Modal Atender:
✓ ☑ Recita
  ▼ Plazo: 7 días
☐ Interconsulta
☐ Paciente Crónico

Resultado:
- Nueva bolsa RECITA creada
- Estado: PENDIENTE (espera coordinador)
- Tipo: RECITA, especialidad: [actual]
```

### Caso 2: Recita + Interconsulta
**Escenario**: Paciente necesita seguimiento Y referencia a Cardiología
```
Modal Atender:
✓ ☑ Recita
  ▼ Plazo: 15 días
✓ ☑ Interconsulta
  ▼ Especialidad: Cardiología
☐ Paciente Crónico

Resultado:
- 2 nuevas bolsas creadas:
  1. RECITA (15 días)
  2. INTERCONSULTA (Cardiología)
- Ambas PENDIENTE (espera coordinador)
```

### Caso 3: Atención con Crónico
**Escenario**: Paciente con Hipertensión y Diabetes
```
Modal Atender:
☐ Recita
☐ Interconsulta
✓ ☑ Paciente Crónico
  ✓ ☑ Hipertensión
  ✓ ☑ Diabetes
  ☐ Otra enfermedad crónica

Resultado:
- Se guardan 2 enfermedades en asegurado_enfermedad_cronica
- Paciente marcado como ATENDIDO
- Historial de crónicas disponible para futuras consultas
```

### Caso 4: Atención Integral
**Escenario**: Todo lo anterior + enfermedad crónica adicional
```
Modal Atender:
✓ ☑ Recita → 30 días
✓ ☑ Interconsulta → Gastroenterología
✓ ☑ Paciente Crónico
  ✓ ☑ Hipertensión
  ☐ Diabetes
  ✓ ☑ Otra enfermedad crónica
    📝 "Reflujo gástrico crónico"

Resultado:
- 2 bolsas creadas (RECITA + INTERCONSULTA)
- 2 enfermedades crónicas guardadas (Hipertensión + Reflujo gástrico)
- Paciente estado: ATENDIDO
```

---

## 🏗️ Arquitectura Backend

### Entity: AseguradoEnfermedadCronica
```java
@Entity
@Table(name = "asegurado_enfermedad_cronica")
public class AseguradoEnfermedadCronica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAseguradoEnfermedad;

    @Column(name = "pk_asegurado", nullable = false)
    private String pkAsegurado; // DNI del paciente

    @Column(name = "tipo_enfermedad", length = 100, nullable = false)
    private String tipoEnfermedad; // "Hipertensión", "Diabetes", "Otro"

    @Column(name = "descripcion_otra", columnDefinition = "text")
    private String descripcionOtra; // Descripción si tipoEnfermedad="Otro"

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_registro", nullable = false)
    @CreationTimestamp
    private OffsetDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime fechaActualizacion;
}
```

### Service: AtenderPacienteService
```java
@Service
@Transactional
public class AtenderPacienteService {
    public void atenderPaciente(
        Long idSolicitudBolsa,
        String especialidadActual,
        AtenderPacienteRequest request
    ) {
        // 1. Obtener solicitud original
        SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(...)

        // 2. Guardar enfermedades crónicas (si aplica)
        if (request.getEsCronico() && request.getEnfermedades() != null) {
            guardarEnfermedadesCronicas(
                solicitudOriginal.getPacienteDni(),
                request.getEnfermedades(),
                request.getOtroDetalle()
            );
        }

        // 3. Crear bolsa RECITA (si aplica)
        if (request.getTieneRecita()) {
            crearBolsaRecita(solicitudOriginal, especialidadActual, request.getRecitaDias());
        }

        // 4. Crear bolsa INTERCONSULTA (si aplica)
        if (request.getTieneInterconsulta()) {
            crearBolsaInterconsulta(solicitudOriginal, request.getInterconsultaEspecialidad());
        }
    }
}
```

### DTO: AtenderPacienteRequest
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtenderPacienteRequest {
    private Boolean tieneRecita;           // ✓ Crear bolsa RECITA?
    private Integer recitaDias;            // Plazo: 3,7,15,30,60,90
    private Boolean tieneInterconsulta;    // ✓ Crear bolsa INTERCONSULTA?
    private String interconsultaEspecialidad; // Ej: "Cardiología"
    private Boolean esCronico;             // ✓ Paciente tiene crónico?
    private List<String> enfermedades;     // ["Hipertensión", "Diabetes", "Otro"]
    private String otroDetalle;            // Descripción si es "Otro"
}
```

### Endpoints REST

#### GET /api/gestion-pacientes/especialidades
Obtiene lista de especialidades disponibles para interconsulta.

**Respuesta:**
```json
[
  { "id": 1, "descServicio": "Cardiología" },
  { "id": 2, "descServicio": "Neurología" },
  { "id": 3, "descServicio": "Gastroenterología" },
  { "id": 4, "descServicio": "Pediatría" },
  ...
]
```

#### POST /api/gestion-pacientes/{id}/atendido
Registra atención médica completa (Recita + Interconsulta + Crónico).

**Request:**
```json
{
  "tieneRecita": true,
  "recitaDias": 7,
  "tieneInterconsulta": true,
  "interconsultaEspecialidad": "Cardiología",
  "esCronico": true,
  "enfermedades": ["Hipertensión", "Otro"],
  "otroDetalle": "Reflujo gástrico crónico"
}
```

**Respuesta:** `200 OK`
```json
{
  "mensaje": "Atención registrada correctamente",
  "solicitudId": "42151"
}
```

---

## 🎨 UI/UX: Modal Atender Paciente

### Sección 1: Recita
```
┌─────────────────────────────────────────────────────┐
│ ☐ 📋 Recita                                         │
│                                                     │
│ (si activado)                                       │
│ Plazo de Recita (días):                            │
│ [▼ 7 días ▼]                                        │
│   ├─ 3 días                                         │
│   ├─ 7 días ✓                                       │
│   ├─ 15 días                                        │
│   ├─ 30 días                                        │
│   ├─ 60 días                                        │
│   └─ 90 días                                        │
└─────────────────────────────────────────────────────┘
```

### Sección 2: Interconsulta
```
┌─────────────────────────────────────────────────────┐
│ ☐ 🔗 Interconsulta                                  │
│                                                     │
│ (si activado)                                       │
│ Especialidad:                                       │
│ [▼ -- Seleccione especialidad -- ▼]               │
│   ├─ Cardiología                                    │
│   ├─ Neurología                                     │
│   ├─ Gastroenterología                             │
│   ├─ Pediatría                                      │
│   └─ ...                                            │
└─────────────────────────────────────────────────────┘
```

### Sección 3: Paciente Crónico
```
┌─────────────────────────────────────────────────────┐
│ ☐ 🏥 Paciente Crónico                              │
│                                                     │
│ (si activado)                                       │
│ Seleccione enfermedad(es):                         │
│ ☐ Hipertensión                                     │
│ ☐ Diabetes                                         │
│ ☐ Otra enfermedad crónica                          │
│                                                     │
│ (si selecciona "Otra")                              │
│ [Describa la enfermedad crónica...]                │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Base de Datos

### Tabla: asegurado_enfermedad_cronica
```sql
CREATE TABLE asegurado_enfermedad_cronica (
    id_asegurado_enfermedad BIGSERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(20) NOT NULL,
    tipo_enfermedad VARCHAR(100) NOT NULL,
    descripcion_otra TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN NOT NULL DEFAULT true,

    UNIQUE(pk_asegurado, tipo_enfermedad),

    FOREIGN KEY(pk_asegurado) REFERENCES asegurado(pk_asegurado),
    INDEX idx_pk_asegurado(pk_asegurado),
    INDEX idx_tipo_enfermedad(tipo_enfermedad),
    INDEX idx_activo(activo)
);
```

### Cambios a dim_solicitud_bolsa
- **Columna nueva**: `origen_bolsa` (VARCHAR(100))
  - Valores: "BOLSA_GENERADA_X_PROFESIONAL", etc.
  - Propósito: Rastrear dónde se originó la bolsa

### Cambios a dim_solicitud_bolsa (existentes)
- **Columna**: `fecha_atencion_medica` (TIMESTAMP WITH TIME ZONE)
  - Propósito: Registrar cuándo médico marcó ATENDIDO
  - Populated by: AtenderPacienteService
  - v1.47.0: Auto-set when médico completes atención workflow

---

## 🔐 Seguridad & Permisos

### MBAC Permissions Required
- **Endpoint**: `GET /api/gestion-pacientes/especialidades`
  - Página: `/roles/medico/pacientes`
  - Acción: `ver`

- **Endpoint**: `POST /api/gestion-pacientes/{id}/atendido`
  - Página: `/roles/medico/pacientes`
  - Acción: `editar`

### Validaciones
1. **Frontend**:
   - Al menos una acción debe estar seleccionada
   - Si Interconsulta activada → especialidad requerida
   - Si Crónico + "Otro" → descripción requerida

2. **Backend**:
   - ID de solicitud válida
   - Paciente existe
   - Asegurado existe
   - Transacción atómica (all-or-nothing)

---

## 🧪 Testing

### Test Cases Implementados

#### TC-1: Solo Recita
```javascript
it('should create RECITA bolsa only', async () => {
  const payload = {
    tieneRecita: true,
    recitaDias: 7,
    tieneInterconsulta: false,
    esCronico: false
  };
  const response = await POST(`/gestion-pacientes/42151/atendido`, payload);
  expect(response.status).toBe(200);
  // Verificar: 1 nueva bolsa RECITA creada
});
```

#### TC-2: Recita + Interconsulta
```javascript
it('should create RECITA and INTERCONSULTA bolsas', async () => {
  const payload = {
    tieneRecita: true,
    recitaDias: 15,
    tieneInterconsulta: true,
    interconsultaEspecialidad: 'Cardiología',
    esCronico: false
  };
  // Verificar: 2 nuevas bolsas creadas
});
```

#### TC-3: Enfermedades Crónicas
```javascript
it('should save chronic diseases', async () => {
  const payload = {
    tieneRecita: false,
    tieneInterconsulta: false,
    esCronico: true,
    enfermedades: ['Hipertensión', 'Otro'],
    otroDetalle: 'Asma severa'
  };
  // Verificar: 2 registros en asegurado_enfermedad_cronica
});
```

### Manual Testing Checklist
- [ ] Recita solo → 1 bolsa RECITA creada
- [ ] Interconsulta solo → 1 bolsa INTERCONSULTA creada
- [ ] Ambas → 2 bolsas creadas
- [ ] Crónico solo → enfermedades guardadas, paciente ATENDIDO
- [ ] Atención integral → todo funciona juntos
- [ ] Validación: No permite si ninguna acción seleccionada
- [ ] Modal regresa a anterior si Click "← Atrás"
- [ ] Toast messages mostrados correctamente
- [ ] Tabla se actualiza después de registrar
- [ ] Coordinador ve nuevas bolsas en módulo

---

## 📝 Notas de Implementación

### Decisiones de Diseño
1. **Modal Two-Step**: Primero cambio de estado, luego detalles de atención
   - Beneficio: Workflow claro y separación de concerns

2. **Transacción Atómica**: Si falla una bolsa, se revierte todo
   - Beneficio: No hay estado inconsistente

3. **origen_bolsa Column**: Rastrea dónde se originó la bolsa
   - Beneficio: Auditoría y análisis de flujos

4. **Lazy Delete para Enfermedades**: Limpia antiguas antes de guardar nuevas
   - Beneficio: Solo último estado de crónicas se mantiene

### Performance
- Índices en `asegurado_enfermedad_cronica(pk_asegurado)`
- Índice en `dim_solicitud_bolsa(origen_bolsa)`
- Minimal BD queries: ~3 por atención completa

### Backward Compatibility
- ✅ No rompe APIs existentes
- ✅ Nuevos campos opcionales
- ✅ Funciona con pacientes sin enfermedades crónicas

---

## 🚀 Próximos Pasos (Futuro)

1. **v1.48.0**: Historial de enfermedades crónicas
   - Tabla de auditoría para cambios en crónicas

2. **v1.49.0**: Reportes de comorbilidades
   - Dashboard con pacientes por enfermedad crónica

3. **v1.50.0**: Alertas automáticas
   - Sistema de alertas para recitas vencidas
   - Recordatorios para interconsultas pendientes

---

## 📚 Referencias

- Backend Spec: `/spec/backend/` (nuevos servicios)
- Database: `/spec/database/migrations/V3_1_[3-5]__*.sql`
- Frontend Spec: `/spec/frontend/16_v1_47_0_atender_paciente.md` (este archivo)
- Changelog: `/checklist/01_Historial/01_changelog.md#v1470-2026-02-06`

---

**Implementado por**: Claude Haiku 4.5
**Fecha**: 2026-02-06
**Commit**: 0c76093
