# Plan de Implementación: Módulo de Enfermería (CENACRON)

> **Versión:** 1.0.0
> **Fecha:** 2026-01-04
> **Dependencia:** Módulo Medicina General (Completado)

---

## 1. Resumen del Flujo
El módulo de Enfermería actúa como filtro intermedio entre Medicina General y las especialidades finales (Nutrición/Psicología).
**Regla de Oro:** Solo pacientes derivados de Medicina General con `pertenece_cenacron = TRUE` y estado `COMPLETADO` entran aquí.

## 2. Modelo de Datos (Base de Datos)

### A. Nueva Tabla: `atenciones_enfermeria`
```sql
CREATE TABLE atenciones_enfermeria (
    id_atencion_enf BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_ciclo INT NOT NULL, -- 1=Visita 1, 2=Visita 2...
    id_atencion_medica_ref BIGINT NOT NULL UNIQUE, -- 1 a 1 con med general
    fecha_atencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    id_usuario_enfermera BIGINT NOT NULL,
    
    -- Derivaciones
    deriva_interconsulta BOOLEAN DEFAULT FALSE,
    especialidad_interconsulta VARCHAR(50), -- Ej: "CARDIOLOGIA"
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_paciente) REFERENCES dim_asegurado(id_asegurado),
    FOREIGN KEY (id_atencion_medica_ref) REFERENCES atenciones_medicina_general(id_atencion)
);
```

### B. Integración: `bolsa_interconsultas`
Si `deriva_interconsulta = TRUE`, se debe insertar en la tabla existente o nueva de bolsa.

---

## 3. Requerimientos de Backend

### A. Endpoint: Listado de Pacientes (Worklist & Trazabilidad)
**GET** `/api/enfermeria/queue?estado=TODOS` (o filtrar por PENDIENTE/ATENDIDO)

**Lógica de Filtrado Actualizada:**
1. Buscar en `atenciones_medicina_general`:
   - `estado` = 'COMPLETADO'
   - `pertenece_cenacron` = TRUE
2. **CRUCE (JOIN)** con tabla `atenciones_enfermeria`:
   - Si existe registro: Estado = **ATENDIDO** (Mostrar fecha y usuario).
   - Si NO existe registro: Estado = **PENDIENTE** (Aplicar semáforo SLA).

**Lógica de Semaforización (Solo Pendientes):**
Calcular `dias = HOY - fecha_atencion_medica`
- 🟢 **VERDE:** `dias <= 15`
- 🟡 **AMARILLO:** `15 < dias <= 30`
- 🔴 **ROJO:** `30 < dias <= 60`
- ⚫ **NEGRO:** `dias > 60`

**Respuesta JSON Sugerida:**
```json
[
  {
    "idAtencionMedica": 123,
    "paciente": "JUAN PEREZ",
    "dni": "12345678",
    "fechaAtencionMedica": "2026-01-01T10:00:00",
    "estadoEnfermeria": "PENDIENTE", // o "ATENDIDO"
    "fechaAtencionEnfermeria": null, // Lleno si ATENDIDO
    "diasTranscurridos": 3,
    "colorSemaforo": "VERDE"
  }
]
```

### B. Endpoint: Registrar Atención
**POST** `/api/enfermeria/attend`

**Body:**
```json
{
  "idAtencionMedicaRef": 123,
  "observaciones": "Paciente estable...",
  "derivaInterconsulta": true,
  "especialidadDestino": "OFTALMOLOGIA" // Opcional
}
```

**Transacción:**
1. Insertar en `atenciones_enfermeria`.
2. Si `derivaInterconsulta` es true -> Insertar en `bolsa_interconsultas`.
3. **NO** ocultar al paciente de la lista, solo actualizar su estado visual a "ATENDIDO".

---

## 4. Requerimientos de Frontend

### A. Dashboard (NursingDashboard)
- **Diseño:** Tarjetas de Paciente (Card View) en lugar de tabla simple, para mostrar información rica.
- **Filtros:** [Por Atender] | [Atendidos] | [Mis Crónicos] (Opcional)
- **Contenido de la Tarjeta (Paciente):**
  - **Cabecera:** Nombre, DNI, Edad, Sexo.
  - **Datos Clínicos (Origen Medicina General):**
    - 🩺 **Diagnóstico Principal:** (ej. CIE-10 Hipertensión).
    - 📅 **Última Atención:** Fecha y hora.
    - ⚡ **Tipo de Atención:** (ej. Seguimiento Post-Atención).
  - **Alertas / Badges:**
    - 🔴/🟢 **Semáforo SLA:** (Días de espera).
    - 📡 **Requiere Telemonitoreo:** (Si aplica).
    - 📋 **Contador:** N° de atenciones previas.
  - **Acciones:**
    - Botón "Atender" (Si está pendiente).
    - Botón "Ver Historial" (Modal Trazabilidad).

### B. Modal de Atención
- Datos read-only del paciente (Resumen clínico).
- **Formulario de Evolución:**
  - Observaciones de Enfermería.
  - Signos Vitales (Opcional, si se requiere registrar nuevos).
- **Gestión de Derivación:**
  - Checkbox "Requiere Interconsulta".
  - Checkbox "Derivar a Nutrición/Psicología" (Flujo normal).
- Botón "Finalizar Atención".

---

## 5. Checklist de QA (Criterios de Aceptación)
- [ ] ¿El dashboard muestra el diagnóstico y la alerta de telemonitoreo traídos de Medicina General?
- [ ] ¿Los pacientes crónicos (CENACRON) se distinguen claramente?
- [ ] ¿El semáforo calcula correctamente los días para los pendientes?
- [ ] **[CRÍTICO]** ¿Al guardar la atención, el paciente **permanece** en la lista pero cambia a estado "ATENDIDO"?
- [ ] ¿Se puede diferenciar visualmente entre pendientes y atendidos?
- [ ] ¿La interconsulta se guarda en la bolsa si se marca el check?
