# CHANGELOG - HISTORIAL DE VERSIONES CENATE

**Última actualización:** 2026-02-11

---

## 📊 VERSIONES PRINCIPALES

### ✅ v1.63.2 - Fix: Pacientes No Visibles en "Mis Pacientes" (2026-02-11) 🐛 BUG FIX
✅ **Filtro de Fecha Corregido** - Cambio de default 'hoy' a 'todos'
✅ **Médicos Ven Todos Sus Pacientes** - Asignaciones previas ahora visibles
✅ **KPI Cards Coinciden** - Conteos siempre sincronizados con tabla

**Problema:**
- Médicos no veían pacientes asignados en días anteriores
- El filtro `filtroRangoFecha` estaba por defecto en 'hoy'
- Si un paciente era asignado el 2026-02-10, el médico ingresaba el 2026-02-11 y no lo veía

**Solución:**
```javascript
// ANTES (v1.63.1)
const [filtroRangoFecha, setFiltroRangoFecha] = useState('hoy');

// DESPUÉS (v1.63.2 ✅)
const [filtroRangoFecha, setFiltroRangoFecha] = useState('todos');
```

**Archivos modificados:**
- `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx` (línea 122)

**Testing:**
```bash
# Caso de prueba:
1. Coordinador asigna paciente en 2026-02-10
2. Médico abre /roles/medico/pacientes en 2026-02-11
3. ✅ Paciente ahora visible en tabla
4. ✅ KPI "Total de Pacientes" = 1
5. ✅ KPI "Pendientes" = 1
6. Médico puede cambiar filtro a 'hoy' para ver solo asignaciones de hoy
```

**Documentación actualizada:**
- `plan/02_Modulos_Medicos/09_estado_final_teleecg_v3.0.0.md` - Troubleshooting section

---

### ✅ v1.62.0 - Notificaciones de Pacientes Pendientes para Médicos (2026-02-08) 🎉 NUEVA FEATURE
✅ **Contador de Pacientes Pendientes** - Muestra número de pacientes en estado "Pendiente"
✅ **Notificaciones en Campanita** - Integrado con NotificationBell existente
✅ **Polling cada 60 segundos** - Actualización automática de contador
✅ **Sección Separada** - Pacientes pendientes en dropdown con color azul
✅ **Navegación Rápida** - Un clic para ir a /roles/medico/pacientes

**Backend:**
- Repository: `countByIdPersonalAndCondicionPendiente()` - Query optimizada COUNT(*)
- Service: `contarPacientesPendientesDelMedicoActual()` - Método nuevo
- Controller: `GET /api/gestion-pacientes/medico/contador-pendientes` - Endpoint nuevo

**Frontend:**
- Service: `obtenerContadorPendientes()` - Método nuevo en gestionPacientesService
- Component: NotificationBell.jsx expandido con soporte para médicos
- Lógica: Detección de rol MEDICO, polling separado, UI profesional

**Archivos modificados:**
- Backend:
  - `SolicitudBolsaRepository.java` - Query de conteo
  - `IGestionPacienteService.java` - Interfaz actualizada
  - `GestionPacienteServiceImpl.java` - Implementación del servicio
  - `GestionPacienteController.java` - Nuevo endpoint
- Frontend:
  - `gestionPacientesService.js` - Nuevo método
  - `NotificationBell.jsx` - Expandido (252 líneas)

**Testing:**
```bash
# Backend compiló ✅
./gradlew compileJava -q

# Frontend compiló ✅
npm run build
```

---

### ✅ v1.57.1 - Exportación de Tabla Especialidades (2026-02-07) 🎉 MEJORA FEATURE
✅ **Botón "Exportar" en Tabla** - Nuevo botón en header de especialidades solicitadas
✅ **12 Columnas Detalladas** - Nº, Especialidad, Código, Estado, Mañana, Tarde, Teleconsulta, Teleconsultorio, Fechas, Inicio, Fin, Observación
✅ **Exportación Rápida** - Descarga instantánea de la tabla visible
✅ **Nombre Dinámico** - Incluye nombre de IPRESS en archivo

**Archivos modificados:**
- `exportarExcel.js` - Nueva función `exportarEspecialidadesAExcel()`
- `ModalDetalleSolicitud.jsx` - Botón "Exportar" en header tabla

**Docs actualizada:** [`spec/frontend/03_exportacion_excel.md`](spec/frontend/03_exportacion_excel.md)

---

### ✅ v1.57.0 - Exportación a Excel en Gestión de Períodos (2026-02-07) 🎉 NUEVA FEATURE
✅ **Exportar Solicitudes** - Botón para descargar Excel con lista completa de solicitudes
✅ **Exportar Individual** - Botón por fila para exportar una solicitud específica
✅ **Exportar Completa** - Modal con múltiples hojas (General + Especialidades)
✅ **Formato Profesional** - Encabezados azules, ancho de columnas ajustado, timestamps

**Funcionalidades:**
- Exportar todas las solicitudes filtradas (estado, período, IPRESS, macroregión, red)
- Exportar solicitud individual con un clic
- Exportar detalle completo desde modal (información general + especialidades solicitadas)
- Soporte para buscar y exportar reportes de IPRESS específicas (ej: "H.I CARLOS ALCANTARA BUTTERFIELD")
- Nombres de archivo con timestamp automático para evitar sobrescrituras

**Archivos creados:**
- `frontend/src/pages/roles/coordinador/gestion-periodos/utils/exportarExcel.js` - Utilidades de exportación
- `spec/frontend/03_exportacion_excel.md` - Documentación completa

**Archivos modificados:**
- `TabSolicitudes.jsx` - Botones de exportación general e individual
- `ModalDetalleSolicitud.jsx` - Botón de exportación completa en header

**Docs:** [`spec/frontend/03_exportacion_excel.md`](spec/frontend/03_exportacion_excel.md)

---

### ✅ v1.56.1 - Filtros Clínicos en Últimas Cargas (2026-02-07) 🎉 NUEVA FEATURE
✅ **DNI Search Filter** - Búsqueda en tiempo real por DNI del paciente (8 dígitos)
✅ **Date Filter** - Date picker HTML5 para filtrar por fecha de carga
✅ **Combined Filtering** - Ambos filtros funcionan juntos (AND logic)
✅ **Clear Filters** - Botón para limpiar todos los filtros + botones X individuales
✅ **Result Counter** - Muestra resultados filtrados vs totales (X/Y)

**Archivos modificados:**
- `MisECGsRecientes.jsx` - Filtros clínicos + state management
- `IPRESSWorkspace.jsx` - Breakpoints ajustados (1024px lg:)

**Docs:** [`spec/frontend/17_filtros_clinicos_ultimas_cargas.md`](spec/frontend/17_filtros_clinicos_ultimas_cargas.md)

---

### ✅ v1.56.3 - Género y Edad en Tabla (2026-02-06)
✅ **Género y Edad Visibles** - Columnas muestran datos correctamente en RegistroPacientes.jsx
✅ **Root Cause Fix** - Frontend no copiaba generoPaciente/edadPaciente al aplanar estructura

**Archivos:** `teleecgService.js`, `VisorECGModal.jsx`

---

### ✅ v1.54.4 - KPI Cards + Filtros por Estado (2026-02-07) 
✅ **KPI Cards Correctas** - "Pendiente Citar": 45, "Citados": 86
✅ **Filtros Funcionan** - Hacer clic en cards devuelve registros correspondientes

**Archivos:** `SolicitudBolsaRepository.java`, `Solicitudes.jsx`
**Docs:** [`spec/modules/bolsas/11_fix_kpi_cards_filtros_v1.54.4.md`](spec/modules/bolsas/11_fix_kpi_cards_filtros_v1.54.4.md)

---

### ✅ v1.52.3 - Extracción Base64 (2026-02-06) 
✅ **Imágenes Renderizadas** - Base64 se extrae correctamente
✅ **Todas las Funciones** - Zoom, rotación, navegación, descarga funcionan

**Archivos:** `RegistroPacientes.jsx`

---

### ✅ v1.53.0 - Rediseño Modal (2026-02-06)
✅ **Layout Vertical** - 3 bloques verticales + paleta profesional
✅ **Desktop Solo** - Mobile/tablet sin cambios

**Archivos:** `UploadImagenECG.jsx`

---

### ✅ v1.52.2 - Visor Imágenes Funcional (2026-02-06)
✅ **Visor Completo** - Imágenes se visualizan correctamente
✅ **Auto-obtención de Base64** - abrirVisor() es async

---

### ✅ v1.52.1 - Control Acceso Bidireccional (2026-02-06)
✅ **EXTERNO ↔ CENATE** - Usuarios separados y protegidos
✅ **Auto-recarga** - Cuando se redirige desde upload

---

### ✅ v1.51.0 - Flujo End-to-End TeleEKG (2026-02-06)
✅ **Redirección Automática** - Upload → Listar
✅ **Breadcrumb** - 3 pasos con indicador de progreso
✅ **Auto-refresh** - Sincronización cada 30 segundos

---

### ✅ v1.50.x - Versiones anteriores

Consulta el historial completo en: [`checklist/01_Historial/01_changelog.md`](checklist/01_Historial/01_changelog.md)

---

## 📝 Stack Tecnológico

| Componente | Versión |
|-----------|---------|
| **Backend** | Spring Boot 3.5.6 + Java 17 |
| **Frontend** | React 19 + TailwindCSS 3.4.18 |
| **Database** | PostgreSQL 14+ |
| **Auth** | JWT + MBAC (Role-Based Access Control) |
| **Email** | Postfix Relay → SMTP EsSalud |

---

## 🔗 Referencias Rápidas

- **Índice Maestro:** [`spec/INDEX.md`](spec/INDEX.md)
- **Changelog Detallado:** [`checklist/01_Historial/01_changelog.md`](checklist/01_Historial/01_changelog.md)
- **Arquitectura:** [`spec/architecture/README.md`](spec/architecture/README.md)

