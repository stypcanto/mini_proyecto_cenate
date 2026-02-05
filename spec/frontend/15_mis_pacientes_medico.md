# 👨‍⚕️ Módulo Mis Pacientes - Médico Panel

> **Versión:** v1.45.1+
> **Estado:** ✅ Production Ready
> **Última actualización:** 2026-02-05

---

## 📋 Descripción General

El módulo **Mis Pacientes** es la interfaz principal para que los médicos visualicen y gestionen sus pacientes asignados. Muestra una tabla profesional con acciones para marcar atención, generar recetas e interconsultas.

**Ubicación en la aplicación:**
- URL: `/roles/medico/pacientes`
- Menú: Panel Médico → Pacientes
- Rol requerido: MEDICO
- Permisos MBAC: `/roles/medico/pacientes:ver`

---

## 🎨 Componentes y Layout

### Estructura Principal

```
┌─────────────────────────────────────────────────────────────┐
│ 👨‍⚕️ Mis Pacientes                                              │
│ Gestiona tus pacientes asignados                            │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Búsqueda: [Ingresa nombre o DNI...]                      │
│ 📊 Condición: [Dropdown: Todas, Citado, Pendiente, ...]    │
│ 🔄 [Actualizar]                                             │
├─────────────────────────────────────────────────────────────┤
│ TABLA DE PACIENTES                                          │
│ ┌──────┬──────────────┬──────────┬──────────┬────────────┐  │
│ │ DNI  │ Paciente     │ Teléfono │ IPRESS   │ Condición  │  │
│ ├──────┼──────────────┼──────────┼──────────┼────────────┤  │
│ │07... │ARIAS MARIA   │962...    │CAP II... │Pendiente   │  │
│ │07... │LA ROSA SA... │958...    │CAP II... │Pendiente   │  │
│ └──────┴──────────────┴──────────┴──────────┴────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ ESTADÍSTICAS                                                │
│ Total: 2  │  Filtrados: 2  │  Atendidos: 0                │
└─────────────────────────────────────────────────────────────┘
```

### Secciones

#### 1️⃣ Header
- Ícono + Título: "👨‍⚕️ Mis Pacientes"
- Subtítulo: "Gestiona tus pacientes asignados"

#### 2️⃣ Controles de Búsqueda y Filtro
- **Búsqueda por nombre o DNI** (text input)
- **Filtro por Condición** (dropdown)
  - Todas
  - Citado
  - Pendiente
  - Atendido
  - Reprogramación Fallida
  - No Contactado
- **Botón Actualizar** (refresh icon + label)

#### 3️⃣ Tabla de Pacientes
**Columnas (7):**
1. **DNI** - Identificador del paciente (8-15 caracteres)
2. **Paciente** - Nombre completo
3. **Teléfono** - Contacto (ej: 962942164)
4. **IPRESS** - Institución Prestadora (ej: CAP II LURIN)
5. **Condición** - Estado actual (badge con color)
6. **Fecha Asignación** - Cuándo fue asignado (DD/MM/YYYY, HH:MM:SS AM/PM)
7. **Acciones** - Botones de interacción (3 botones)

**Estilos de Condición (Badges):**
- 🟢 **Citado** - Verde (bg-green-50, text-green-700)
- 🟡 **Pendiente** - Amarillo (bg-yellow-50, text-yellow-700)
- 🔵 **Atendido** - Azul (bg-blue-50, text-blue-700)
- 🔴 **Reprogramación Fallida** - Rojo (bg-red-50, text-red-700)
- ⚪ **No Contactado** - Gris (bg-gray-50, text-gray-700)

**Acciones (3 botones por fila):**
- ✅ **Marcar Atendido** (verde, checkmark icon)
- 📋 **Generar Receta** (azul, document icon)
- 🔄 **Generar Interconsulta** (morado, share icon)

#### 4️⃣ Dashboard de Estadísticas
- **Total de Pacientes** - Número total sin filtro
- **Filtrados** - Número actual con búsqueda/filtro aplicado
- **Atendidos** - Contador de pacientes con condición "Atendido"

---

## 🔧 Funcionalidades

### 1. Buscar Paciente
```
Entrada: Nombre o DNI del paciente
Acción: Filtra tabla en tiempo real
Ejemplo:
  - Input: "ARIAS" → muestra: ARIAS CUBILLAS MARIA
  - Input: "07888772" → muestra: ARIAS CUBILLAS MARIA
```

### 2. Filtrar por Condición
```
Entrada: Seleccionar condición del dropdown
Acción: Filtra tabla a pacientes con esa condición
Ejemplo:
  - Todas: muestra 2 pacientes
  - Atendido: muestra 0 pacientes
```

### 3. Actualizar (Refresh)
```
Acción: Recarga datos del servidor
Llamada API: GET /api/gestion-pacientes/medico/asignados
Efecto:
  - Carga últimos pacientes asignados
  - Actualiza estadísticas
  - Limpia búsqueda/filtro
```

### 4. Marcar Atendido
```
Flujo:
1. Click en botón ✅ Marcar Atendido
2. Modal abre:
   - Título: "✓ Marcar como Atendido"
   - Nombre paciente mostrado
   - Notas textarea (opcional)
   - Botones: Cancelar, Confirmar
3. Click Confirmar:
   - Toast success: "Paciente marcado como Atendido ✓"
   - Tabla actualiza: condición → Atendido
   - Estadísticas: Atendidos += 1
   - Modal cierra
```

### 5. Generar Receta
```
Flujo: (similar a Marcar Atendido)
1. Click en botón 📋 Generar Receta
2. Modal abre:
   - Título: "📋 Generar Receta"
   - Nombre paciente mostrado
   - Notas textarea (para receta/diagnosis)
   - Botones: Cancelar, Confirmar
3. Click Confirmar:
   - Toast success: "Receta generada exitosamente ✓"
   - Tabla actualiza
   - Modal cierra
```

### 6. Generar Interconsulta
```
Flujo: (similar a acciones anteriores)
1. Click en botón 🔄 Generar Interconsulta
2. Modal abre:
   - Título: "🔄 Generar Interconsulta"
   - Nombre paciente mostrado
   - Notas textarea (para detalles de interconsulta)
   - Botones: Cancelar, Confirmar
3. Click Confirmar:
   - Toast success: "Interconsulta creada exitosamente ✓"
   - Tabla actualiza
   - Modal cierra
```

---

## 📊 Datos y API

### Estructura del Paciente (DTO)

```typescript
interface GestionPacienteDTO {
  // Identifiers
  idGestion?: Long;
  numDoc: string;                    // DNI (8-15 chars)
  pkAsegurado?: string;              // PK en tabla asegurados

  // Patient Info (de tabla asegurados)
  apellidosNombres: string;          // Nombre completo
  sexo: string;                      // M/F
  edad: number;                      // Calculado: hoy - fechaNacimiento
  telefono: string;                  // Contacto principal
  tipoPaciente?: string;             // Tipo de paciente
  tipoSeguro?: string;               // Tipo de seguro

  // Location/Healthcare
  ipress: string;                    // Nombre institución (ej: CAP II LURIN)

  // Management Fields (de tabla gestion_paciente)
  condicion: string;                 // Estado actual
  gestora?: string;                  // Gestora responsable
  observaciones?: string;            // Notas adicionales
  origen?: string;                   // Origen del paciente
  seleccionadoTelemedicina?: boolean;

  // Timestamps (de dim_solicitud_bolsa)
  fechaAsignacion?: OffsetDateTime;  // Cuándo se asignó al médico
  fechaCreacion?: OffsetDateTime;    // Cuándo se creó registro
  fechaActualizacion?: OffsetDateTime; // Última actualización
}
```

### Endpoint API

**GET /api/gestion-pacientes/medico/asignados**

Retorna lista de pacientes asignados al médico autenticado.

**Headers requeridos:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "numDoc": "07888772",
    "apellidosNombres": "ARIAS CUBILLAS MARIA",
    "sexo": "F",
    "edad": 90,
    "telefono": "962942164",
    "ipress": "CAP II LURIN",
    "condicion": "Pendiente",
    "fechaAsignacion": "2026-02-05T07:09:54.096196Z",
    "observaciones": null,
    "tipoPaciente": null,
    "tipoSeguro": null
  },
  ...
]
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido/expirado
- `403 Forbidden` - No tiene permisos en `/roles/medico/pacientes:ver`
- `500 Internal Server Error` - Error del servidor

---

## 🎯 Flujos de Usuario

### Flujo Principal: Revisar Pacientes Asignados

```
1. Médico accede a /roles/medico/pacientes
2. Sistema carga GET /api/gestion-pacientes/medico/asignados
3. Tabla muestra pacientes asignados (ej: 2)
4. Estadísticas: Total=2, Filtrados=2, Atendidos=0
5. Médico busca: digita "ARIAS"
6. Tabla filtra a 1 resultado
7. Médico clickea botón ✅ Marcar Atendido
8. Modal abre con opción de notas
9. Médico confirma
10. Tabla actualiza: Condición → Atendido
11. Estadísticas actualiza: Atendidos=1
```

### Flujo Alterno: Filtrar por Condición

```
1. Médico está en /roles/medico/pacientes
2. Selecciona en dropdown "Atendido"
3. Tabla muestra solo pacientes con condición Atendido
4. Estadísticas actualiza:
   - Total: 2 (sin filtro)
   - Filtrados: 1 (con filtro)
   - Atendidos: 1 (de los filtrados)
```

### Flujo: Actualizar Datos

```
1. Médico clickea botón 🔄 Actualizar
2. Loading spinner aparece
3. API GET /api/gestion-pacientes/medico/asignados
4. Nueva data recibida
5. Toast: "X pacientes cargados"
6. Tabla refresca con nuevos datos
7. Búsqueda/filtro se resetean
8. Estadísticas se recalculan
```

---

## 💾 Estado y Gestión de Estado

### React State

```javascript
const [pacientes, setPacientes] = useState([]); // Array de GestionPacienteDTO
const [loading, setLoading] = useState(true);   // Loading inicial
const [busqueda, setBusqueda] = useState('');   // Texto búsqueda
const [filtroEstado, setFiltroEstado] = useState(''); // Filtro seleccionado
const [modalAccion, setModalAccion] = useState(null); // 'atendido'|'receta'|'interconsulta'|null
const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); // GestionPacienteDTO
const [notasAccion, setNotasAccion] = useState(''); // Notas en modal
const [procesando, setProcesando] = useState(false); // Loading de acción
```

### Filtrado en Tiempo Real

```javascript
const pacientesFiltrados = pacientes.filter(p => {
  const coincideBusqueda =
    (p.apellidosNombres?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (p.numDoc?.includes(busqueda));

  const coincideEstado = !filtroEstado || (p.condicion === filtroEstado);

  return coincideBusqueda && coincideEstado;
});
```

### Actualización Optimista

```javascript
// Después de confirmar acción
setPacientes(pacientes.map(p =>
  p.numDoc === pacienteSeleccionado.numDoc
    ? { ...p, condicion: 'Atendido' }  // Actualizar optimista
    : p
));
```

---

## 🔐 Seguridad y Permisos

### MBAC Check

```
Endpoint: GET /api/gestion-pacientes/medico/asignados
Anotación: @CheckMBACPermission(
  pagina = "/roles/medico/pacientes",
  accion = "ver",
  mensajeDenegado = "No tiene permiso para ver sus pacientes"
)
```

### Validación Requerida

- ✅ JWT token válido
- ✅ Usuario autenticado
- ✅ Rol MEDICO asignado
- ✅ Permisos MBAC: página `/roles/medico/pacientes`, acción `ver`

---

## 📱 Responsive Design

### Mobile (< 768px)
```
- Tabla se vuelve scroll horizontal
- Acciones en menú desplegable (si es posible)
- Búsqueda full-width
- Estadísticas en stack vertical
```

### Tablet (768px - 1024px)
```
- Tabla con scroll horizontal si necesario
- Todas las columnas visibles (puede haber wrap)
- Botones acciones visibles
```

### Desktop (> 1024px)
```
- Tabla completa sin scroll
- Layout óptimo con espaciado adecuado
- Todas funcionalidades accesibles
```

---

## 🎨 Paleta de Colores

| Elemento | Color | Clase Tailwind |
|----------|-------|-----------------|
| Header | Azul | text-blue-600 |
| Buttons | Azul primario | bg-blue-600, hover:bg-blue-700 |
| Button Actualizar | Azul | bg-blue-600 |
| Badge Citado | Verde | bg-green-50, text-green-700, border-green-200 |
| Badge Pendiente | Amarillo | bg-yellow-50, text-yellow-700, border-yellow-200 |
| Badge Atendido | Azul | bg-blue-50, text-blue-700, border-blue-200 |
| Badge Fallo | Rojo | bg-red-50, text-red-700, border-red-200 |
| Badge No Contactado | Gris | bg-gray-50, text-gray-700, border-gray-200 |
| Botón Atendido | Verde | bg-green-100, text-green-600 |
| Botón Receta | Azul | bg-blue-100, text-blue-600 |
| Botón Interconsulta | Morado | bg-purple-100, text-purple-600 |
| Tabla Header | Gris claro | bg-gray-100 |
| Tabla Row Hover | Gris muy claro | hover:bg-gray-50 |

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Fecha Asignación muestra UTC
**Problema:** Fechas mostradas en UTC en lugar de zona horaria local (Perú -05:00)
**Estado:** ⚠️ Parcialmente resuelto en v1.45.1
**Solución:**
```javascript
// Frontend: formatearFecha() parsea ISO 8601 con offset
const match = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):?(\d{2})?/);
// Nota: Backend aún retorna algunas fechas sin offset
```

### 2. IPRESS mostraba código en lugar de nombre
**Problema:** Columna IPRESS mostraba "450" en lugar de "CAP II LURIN"
**Estado:** ✅ Resuelto en v1.45.2
**Solución:** Backend ahora llama `obtenerNombreIpress()` antes de enviar DTO

### 3. Acción Modal sin persistencia
**Problema:** Las acciones (Marcar Atendido, etc.) están simuladas, no se guardan
**Estado:** 🟡 Fase 2 (funcionalidad actual: UI/UX validation)
**Plan:** Implementar endpoints backend para guardar acciones en próxima versión

---

## 🚀 Roadmap Futuro

### v1.45.3 (Próxima)
- [ ] Persistencia de acciones médicas en backend
- [ ] Endpoints: `/pacientes/{id}/marcar-atendido`, `/pacientes/{id}/receta`, etc.
- [ ] Historial de acciones por paciente
- [ ] Exportar tabla a Excel/PDF

### v1.46.0
- [ ] Integración con módulo de Recetas
- [ ] Integración con módulo de Interconsultas
- [ ] Notificaciones para cambios de estado
- [ ] Historial completo de paciente

### v1.47.0
- [ ] Teleconsulta en tiempo real
- [ ] Adjuntar documentos a recetas/interconsultas
- [ ] Seguimiento de pacientes post-atención

---

## 📚 Referencias

**Archivos relacionados:**
- Frontend: `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
- Service: `frontend/src/services/gestionPacientesService.js`
- Backend Service: `backend/src/main/java/com/styp/cenate/service/gestionpaciente/GestionPacienteServiceImpl.java`
- Backend Controller: `backend/src/main/java/com/styp/cenate/api/gestionpaciente/GestionPacienteController.java`
- Backend DTO: `backend/src/main/java/com/styp/cenate/dto/GestionPacienteDTO.java`

**Documentación relacionada:**
- CLAUDE.md - v1.45.1 / v1.45.2
- checklist/01_Historial/01_changelog.md - v1.45.1 / v1.45.2
- spec/backend/14_gestion_pacientes_service.md (crear)

---

**Última revisión:** 2026-02-05 ✅
**Versión documentación:** v1.45.2
