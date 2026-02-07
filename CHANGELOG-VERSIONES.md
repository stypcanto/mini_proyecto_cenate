# CHANGELOG - HISTORIAL DE VERSIONES CENATE

**Última actualización:** 2026-02-07

---

## 📊 VERSIONES PRINCIPALES

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

