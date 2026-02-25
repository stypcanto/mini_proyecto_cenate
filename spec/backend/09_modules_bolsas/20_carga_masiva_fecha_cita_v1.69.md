# Módulo Carga Masiva de Pacientes — Fecha de Cita Configurable

**Versión:** v1.69.0
**Fecha:** 2026-02-25
**Ruta frontend:** `/citas/carga-masiva-pacientes`
**Endpoint backend:** `POST /api/bolsas/solicitudes/carga-masiva-pacientes`

---

## 🎯 Problema resuelto

Antes de esta versión, al realizar una carga masiva de pacientes desde Excel, la `fecha_atencion` se asignaba **automáticamente con la fecha del día de carga** (`LocalDate.now()`), sin consultar al usuario. Esto causaba errores frecuentes porque:

- El archivo Excel podía corresponder a citas de días futuros o pasados
- El usuario cargaba sin darse cuenta de que la fecha era "hoy"
- No había forma de corregirlo sin editar manualmente cada registro

---

## ✅ Cambios implementados

### Backend

#### 1. `CargaMasivaRequest.java`
**Ruta:** `backend/src/main/java/com/styp/cenate/dto/bolsas/CargaMasivaRequest.java`

Se agregó el campo `fechaCita` al DTO de request:

```java
import java.time.LocalDate;

/**
 * Fecha de la cita para todos los pacientes de la carga (YYYY-MM-DD).
 * Si es null, se usa la fecha del día de carga como fallback.
 */
private LocalDate fechaCita;
```

Jackson (incluido en Spring Boot 3.x) deserializa automáticamente el string ISO `"2026-02-25"` a `LocalDate` sin configuración adicional.

---

#### 2. `SolicitudBolsaServiceImpl.java`
**Ruta:** `backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java`
**Método:** `cargaMasivaPacientes()` (~línea 4176)

**Antes:**
```java
.fechaAtencion(LocalDate.now())   // siempre hoy — sin consultar al usuario
```

**Después:**
```java
// Resuelve la fecha: usa la del request, o hoy como fallback
LocalDate fechaCita = request.getFechaCita() != null
    ? request.getFechaCita()
    : LocalDate.now();

// ... dentro del builder de cada SolicitudBolsa:
.fechaAtencion(fechaCita)         // fecha elegida por el usuario
```

---

### Frontend

#### `CargaMasivaPacientes.jsx`
**Ruta:** `frontend/src/pages/roles/citas/CargaMasivaPacientes.jsx`

##### A. Estado inicial vacío
```jsx
// Antes: pre-cargaba con la fecha de hoy
const [fechaCita, setFechaCita] = useState(() => new Date().toISOString().split("T")[0]);

// Después: vacío — el usuario DEBE elegir una fecha
const [fechaCita, setFechaCita] = useState("");
```

##### B. Selector de fecha en paso Preview
Se agregó un bloque visual destacado (border ámbar) entre el profesional y la tabla de preview:

- **Sin fecha elegida:** borde rojo, badge animado `⚠ Selecciona una fecha para continuar`
- **Con fecha elegida:** borde ámbar, badge `✓ Fecha seleccionada` + texto legible en español
  (ej: _"miércoles, 25 de febrero de 2026"_)

##### C. Botón bloqueado hasta elegir fecha
```jsx
disabled={!medico?.idPers || !fechaCita}
```
El botón "Cargar N Pacientes" permanece gris deshabilitado mientras no se seleccione una fecha. Debajo aparece el aviso: _"Debes seleccionar la fecha de la cita para habilitar la carga"_.

##### D. Modal de confirmación antes de cargar

Al pulsar el botón, en lugar de ejecutar la carga directamente, se abre un **modal de confirmación** con:

| Sección | Contenido |
|---------|-----------|
| Profesional | Avatar con inicial + nombre completo + DNI |
| Fecha | Texto largo en español (ej: _miércoles, 25 de febrero de 2026_) |
| Pacientes | Contador grande con número total |
| Mensaje | "Se cargarán **N pacientes** al profesional **NOMBRE** para la fecha **FECHA**." |
| Acciones | Botón **Cancelar** / Botón **Sí, cargar** |

Solo al pulsar "Sí, cargar" se ejecuta el POST al backend.

##### E. Request con fecha
```js
body: JSON.stringify({
    idPersonal: medico.idPers,
    fechaCita,          // ← "2026-02-25" (formato ISO de input[type=date])
    pacientes: [...]
})
```

---

## 🔄 Flujo completo

```
1. Usuario carga Excel
2. Sistema detecta médico del DNI_MEDICO
3. Se muestra vista previa de pacientes
4. [NUEVO] Selector de fecha — campo REQUERIDO (botón deshabilitado si está vacío)
5. Usuario elige la fecha de las citas (ej: 2026-02-28)
6. Usuario pulsa "Cargar N Pacientes"
7. [NUEVO] Modal de confirmación muestra:
   → profesional + fecha + cantidad
   → "¿Está seguro?"
8. Usuario confirma → POST al backend
9. Backend guarda cada SolicitudBolsa con fecha_atencion = fecha elegida
10. Resultado: insertados / duplicados / errores
```

---

## 🎨 Mejoras visuales adicionales (misma sesión)

### Zona drag & drop
- Borde punteado cambiado de gris a **azul** (`border-blue-200`)
- Fondo suave azul: `bg-blue-50/40`

### Botón "Descargar Plantilla"
- Efecto `animate-ping` en ring exterior verde (pulsa suavemente)
- Ícono con `animate-bounce` (rebota hacia abajo)
- `hover:scale-[1.02]` + `hover:shadow-green-200`

### Acordeón "¿De dónde descargo los datos?"
- Nuevo acordeón con imagen de ejemplo de **Explotadatos**
- Imagen: `public/images/Enlace_Descarga_Citas.jpeg`
- Instrucción: "Ingresa a Explotadatos y descarga el reporte de citas programadas"
- **Aparece primero** en la lista de acordeones
- **Abierto por defecto** (`defaultOpen={true}`)

### Acordeón "Columnas del Excel"
- Cambiado a cerrado por defecto (`defaultOpen={false}`) para reducir scroll inicial

---

## 📋 Tabla de campos del request (POST)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `idPersonal` | Long | ✅ | ID del profesional de salud |
| `fechaCita` | LocalDate | ✅ | Fecha de las citas (YYYY-MM-DD) |
| `especialidad` | String | No | Default: `ENFERMERIA` |
| `idServicio` | Long | No | Default: `56` |
| `responsableGestoraId` | Long | No | Default: `688` |
| `pacientes` | List | ✅ | Filas del Excel |

---

## 🗄️ Impacto en base de datos

**Tabla afectada:** `dim_solicitud_bolsa`
**Columna:** `fecha_atencion` (DATE)

Antes: siempre se grababa `CURRENT_DATE`
Después: se graba la fecha que el usuario eligió en el frontend

**Columna agregada en la misma sesión:**
```sql
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
-- (requerida por la entidad SolicitudBolsa v1.69.0)
```

---

## 🔐 Seguridad / Roles

Sin cambios. El endpoint sigue requiriendo:
```java
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR DE CITAS', 'COORD. GESTION CITAS')")
```

---

## 🧪 Verificación

1. Ir a `/citas/carga-masiva-pacientes`
2. Cargar un Excel válido
3. Verificar que el botón "Cargar" aparece **deshabilitado** (gris)
4. Seleccionar una fecha → botón se habilita
5. Pulsar "Cargar" → aparece modal con profesional + fecha
6. Confirmar → carga ejecuta
7. Verificar en BD: `SELECT fecha_atencion FROM dim_solicitud_bolsa ORDER BY fecha_solicitud DESC LIMIT 5;`
   → debe mostrar la fecha elegida, NO la fecha del día de carga
