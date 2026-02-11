# Test Report: MisPacientes Page - Dr. Carito Zumaeta (Cardiologist)

**Date:** 2026-02-11
**Tester:** Claude Code (Automated Testing)
**Test Subject:** EKG Column Visibility Bug for Cardiologists
**Expected Version:** v1.78.0 (Specialty Detection Fix)

---

## Test Summary

**Status:** FAILED - EKG columns are NOT visible for cardiologist

**Root Cause:** Race condition between patient data loading and specialties API call

---

## Test Steps Executed

### 1. Login Process
- Navigated to: `http://localhost:3000`
- Used credentials:
  - Username: `72945564`
  - Password: `@Cenate2026+1`
- Login: SUCCESS
- Auto-navigation to: `/roles/medico/pacientes` - SUCCESS

### 2. Page Load Verification
- Page loaded successfully
- User identified as: **Carito Lisset Zumaeta Cabrera**
- Role: **MEDICO**
- Menu items visible:
  - Panel Médico (Bienvenida, Producción, Pacientes)
  - TeleECG (TeleECG Recibidas)

### 3. Patient Data Verification
- Total patients loaded: **2**
- Patient data structure verified:
  - Patient 1: VERASTEGUI JORGE VICTOR (DNI: 09950203)
    - `fechaTomaEKG`: "2026-02-09" ✅ (Present in data)
    - `especialidadMedico`: "202602" ✅ (Present in data)
  - Patient 2: CUMPA YAIPEN ROSA FLOR (DNI: 16498964)

---

## Console Log Analysis

### Critical Finding: Specialty Detection Failed

**Expected logs (NOT found):**
```
✅ v1.78.0: Especialidad detectada desde...
✅ v1.78.0: Especialidad mapeada a: CARDIOLOGIA
✅ v1.78.0: Sistema de especialidades activado para: CARDIOLOGIA
```

**Actual logs found:**
```
⚠️ v1.78.0: No se detectó especialidad (Line 78)
⚠️ v1.78.0: No se detectó especialidad (Line 79)
```

**Additional Logs:**
```
✅ v1.78.0: Especialidades cargadas: [Object x100] (Line 99, 107)
```
This indicates the specialties API loaded successfully BUT AFTER the detection logic ran.

---

## Table Structure Analysis

### Current Table Headers (INCORRECT for Cardiologist)
1. Paciente
2. Teléfono
3. IPRESS
4. Condición
5. Motivo
6. Fecha Asignación
7. Fecha Atención

### Expected Table Headers for Cardiologist
1. Paciente
2. Teléfono
3. IPRESS
4. **📅 Fecha toma EKG** ← MISSING
5. Condición
6. Motivo
7. Fecha Asignación
8. Fecha Atención
9. **Atender Lectura EKG** ← MISSING

---

## Root Cause Analysis

### The Bug: Race Condition in Specialty Detection

**File:** `/frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`

**Lines 350-376:** Specialty detection from patient data

```javascript
// ✅ v1.78.0: Detectar especialidad desde el primer paciente si no está en contexto
if (data?.length > 0 && !authUser?.especialidad && especialidades.length > 0) {
  const primerPaciente = data[0];
  let especialidadDetectada = null;

  const especIdMedico = parseInt(primerPaciente.especialidadMedico);
  // ❌ ISSUE: especialidades.find() depends on especialidades array being loaded
  const especialidadEncontrada = especialidades.find(esp => esp.id === especIdMedico);
  // ...
}
```

**The Problem:**
1. Patient data loads FIRST (contains `especialidadMedico: "202602"`)
2. Specialties API (`/api/gestion-pacientes/especialidades`) loads SECOND
3. Detection logic runs when `data?.length > 0` BUT checks `especialidades.length > 0`
4. At that moment, `especialidades` is still empty `[]`
5. The condition fails silently, no specialty is detected
6. Later, when specialties load, it's too late - the table has already rendered

**Evidence from Console Logs:**
- Line 78-79: Specialty detection runs → Fails (especialidades = [])
- Line 99: Specialties load → Success (100 items)
- Line 119-195: Patient data processes → No specialty detected

---

## Backend Data Verification

**Backend Response Structure (Correct):**
```json
{
  "idSolicitudBolsa": 43484,
  "numDoc": "09950203",
  "apellidosNombres": "VERASTEGUI JORGE VICTOR",
  "sexo": "M",
  "edad": 87,
  "telefono": "944809150",
  "condicion": "Pendiente",
  "idBolsa": 12,
  "tiempoInicioSintomas": "> 72 hrs.",
  "ipress": "POL. CHINCHA",
  "fechaAsignacion": "2026-02-11T13:15:24.795Z",
  "fechaAtencion": null,
  "fechaTomaEKG": "2026-02-09",  ← ✅ Present
  "esUrgente": false,
  "especialidadMedico": "202602"  ← ✅ Present
}
```

The backend is correctly returning:
- `fechaTomaEKG` field
- `especialidadMedico` field (ID: 202602)

---

## The Fix Required

### Option 1: Wait for Both API Calls (Recommended)

```javascript
// Change the useEffect dependencies to wait for BOTH:
useEffect(() => {
  if (especialidades.length > 0) {  // Wait for specialties first
    cargarPacientes();
  }
}, [especialidades]);  // Add especialidades as dependency
```

### Option 2: Add Async/Await for Sequential Loading

```javascript
const cargarDatos = async () => {
  await cargarEspecialidades();  // Load specialties first
  await cargarPacientes();       // Then load patients
};
```

### Option 3: Detect Specialty After Both Load

```javascript
useEffect(() => {
  if (pacientes.length > 0 && especialidades.length > 0) {
    detectarEspecialidad();  // Detect after BOTH are loaded
  }
}, [pacientes, especialidades]);
```

---

## Visual Evidence

### Screenshots Captured:
1. `mispacientes-loading.png` - Initial load state
2. `mispacientes-final-state.png` - Final table view (full page)
3. `mispacientes-current-state.md` - Accessibility snapshot

### Key Observations:
- Table shows 7 columns (should be 9 for cardiologist)
- No "Fecha toma EKG" column visible
- No "Atender Lectura EKG" action column visible
- Patient data shows "Pendiente" status correctly
- KPI cards show correct counts (Total: 2, Pendientes: 2)

---

## Test Verdict

### FAILED: EKG Columns NOT Visible for Cardiologist

**Reason:** The specialty detection logic fails due to a race condition where:
1. Patient data API completes first
2. Specialties API completes second
3. Detection logic runs too early when `especialidades = []`
4. No specialty is detected, so EKG columns are hidden

**Impact:** Cardiologists cannot see EKG-related data, making the page unusable for their workflow.

---

## Recommendations

1. **Immediate Fix:** Implement Option 1 (wait for specialties before loading patients)
2. **Add Loading State:** Show "Cargando especialidades..." before patient data loads
3. **Add Debug Logs:**
   - Log when specialties API starts/completes
   - Log specialty detection timing
   - Log especialidades.length at detection time
4. **Add Fallback:** If specialty ID 202602 not found, log available IDs
5. **Consider Backend Enhancement:** Return specialty NAME (e.g., "CARDIOLOGIA") in patient data, not just ID

---

## Files Referenced

- Frontend: `/frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
- Backend DTO: `/backend/src/main/java/com/styp/cenate/dto/GestionPacienteDTO.java`
- Console Logs: `/console-full-log.txt` (122 messages)

---

## Next Steps

1. Fix the race condition (choose one of the 3 options above)
2. Re-test with Dr. Carito Zumaeta credentials
3. Verify EKG columns appear after fix
4. Test with non-cardiologist to ensure normal columns still work
5. Add integration test to prevent regression

---

**End of Test Report**
