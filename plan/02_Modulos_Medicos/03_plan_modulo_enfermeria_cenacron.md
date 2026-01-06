# Plan de Implementación: Módulo de Enfermería (CENACRON)

> **Versión:** 1.0.0
> **Fecha:** 2026-01-04
> **Dependencia:** Módulo Medicina General (Completado)

---

## 1. Resumen del Flujo
El módulo de Enfermería actúa como receptor de pacientes desde dos fuentes:
1.  **Derivación Directa:** Desde Medicina General (Post-atención inmediata).
2.  **Cita Programada:** Agendados por Gestión de Citas (Para seguimiento posterior).

**Regla de Oro:** Entran pacientes de Medicina General (`pertenece_cenacron=TRUE` + `COMPLETADO`) **O** pacientes procedentes de Gestión de Citas programados para hoy.

## 2. Modelo de Datos (Base de Datos)

### A. Nueva Tabla: `atenciones_enfermeria`
*(Estructura estándar de atención clínica)*
```sql
CREATE TABLE atenciones_enfermeria (
    id_atencion_enf BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_atencion_medica_ref BIGINT,
    id_cita_ref BIGINT,
    fecha_atencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos Clínicos (Alimenta Historial)
    motivo_consulta TEXT, -- "Control de enfermería..."
    observaciones TEXT, -- "Recomendaciones..."
    signos_vitales JSONB, -- { "pa": "120/80", "fc": 72, "spo2": 98, "temp": 36.5 }
    
    id_usuario_enfermera BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES dim_asegurado(id_asegurado)
);
```

### B. Nueva Tabla: `pacientes_interconsulta` (Bolsa de Especialidades)
```sql
CREATE TABLE pacientes_interconsulta (
    id_interconsulta BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_atencion_origen BIGINT NOT NULL, -- FK a atenciones_enfermeria
    origen VARCHAR(20) DEFAULT 'ENFERMERIA',
    
    especialidad_destino VARCHAR(50) NOT NULL, -- Ej: "CARDIOLOGIA"
    motivo_derivacion TEXT,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, ASIGNADO, ATENDIDO
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES dim_asegurado(id_asegurado),
    FOREIGN KEY (id_atencion_origen) REFERENCES atenciones_enfermeria(id_atencion_enf)
);
```

---

## 3. Requerimientos de Backend
*(Endpoints Worklist se mantienen igual)*

### C. Integración con Historial Clínico
- El endpoint `GET /asegurados/historial/{id}` debe incluir los registros de `atenciones_enfermeria` para que aparezcan en el componente visual existente de "Historial de Atenciones".

---

## 4. Requerimientos de Frontend

### A. Dashboard (NursingDashboard)
- Tarjetas de Paciente (CENACRON).

### B. Modal de Atención ("Recopilación de Datos")
- **Visualización:**
  - **Izquierda:** Componente Existente `TrazabilidadClinicaTabs` (Historial + Evolución Crónica CENACRON). **NO MODIFICAR VISUALMENTE.**
  - **Derecha:** Formulario de Nueva Atención.
- **Formulario:**
  - **Signos Vitales:** Campos para actualizar PA, FC, SpO2, Temp (Esto actualizará la gráfica de Evolución).
  - **Motivo/Recomendaciones:** Texto libre.
  - **Derivación:** Checkbox "Interconsulta" -> Guarda en `pacientes_interconsulta`.
- **Acción:** "Guardar Atención". Esto debe:
  1. Insertar en BD.
  2. Refrescar el componente de Historial (Izquierda) para mostrar la nueva atención inmediatamente.

### A. Endpoint: Listado de Pacientes (Worklist Unificada)
**GET** `/api/enfermeria/queue?estado=TODOS`

**Lógica de Filtrado (UNION):**
1.  **Fuente A (Medicina General):**
    *   `atenciones_medicina_general`: `estado='COMPLETADO'` AND `pertenece_cenacron=TRUE`.
2.  **Fuente B (Gestión de Citas):**
    *   `solicitud_cita`: `fecha_cita = HOY` AND `estado='PROGRAMADO'` (y área='ENFERMERIA').
3.  **Filtrado de Ya Atendidos:**
    *   Cruzar con `atenciones_enfermeria` para determinar si ya fueron atendidos.

**Lógica de Semaforización:**
*   **Fuente A:** `dias = HOY - fecha_atencion_medica`
*   **Fuente B:** `dias = 0` (Si tiene cita hoy, es prioridad normal/alta según hora).

**Respuesta JSON Unificada:**
```json
[
  {
    "idOrigen": 123,
    "tipoOrigen": "MEDICINA_GENERAL", // o "CITA_PROGRAMADA"
    "paciente": "JUAN PEREZ",
    "dni": "12345678",
    "fechaBase": "2026-01-01T10:00:00", // Fecha Med o Fecha Cita
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

---

## 6. Datos de Prueba
**Credenciales de Acceso (Rol Enfermería):**
- **Usuario (DNI):** `44012679`
- **Contraseña:** `@Prueba654321`

**Paciente de Prueba:**
- **DNI:** `22672403`
- **Caso de Uso:** Verificar que este paciente (si ya pasó por Medicina General o tiene Cita) aparezca en el Dashboard.
