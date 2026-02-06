# 📚 Índice de Documentación - CENATE v1.48.3

> **Estructura Organizada de Documentación del Proyecto**

---

## 📂 Estructura de Carpetas

```
spec/
├── DOCUMENTACION.md          ← Estás aquí
├── INDEX.md                  ← Índice maestro del proyecto
├── README.md                 ← Guía de inicio rápido
│
├── backend/                  → APIs, Servicios, Módulos (11+ docs)
│   ├── README.md
│   ├── 01_estructura_capas.md
│   ├── 02_gestionpaciente_api.md
│   ├── ... (más docs)
│
├── frontend/                 → Componentes, Páginas, UI (8+ docs)
│   ├── README.md
│   ├── 01_arquitectura.md
│   ├── ... (más docs)
│
├── database/                 → Esquemas, Auditoría, Backups (15+ docs)
│   ├── README.md
│   ├── ... (más docs)
│
├── architecture/             → Diagramas, Flujos, Modelos
│   ├── 01_flujo_atenciones_completo.md
│   ├── ... (más docs)
│
├── changelog/                → Historial de versiones 📝
│   ├── v1.46.8-FIXES-SUMMARY.md
│   ├── v1.46.9-COMPLETE-FIX.md
│   ├── v1.46.9-FINAL-CHANGELOG.md
│   ├── BEFORE-AFTER-v1.46.8.md
│
├── debug/                    → Estados, Logs, Debug 🐛
│   ├── console-debug.md
│   ├── console-output.txt
│   ├── current-state.md
│   ├── error-status.md
│   ├── final-import-test.md
│   ├── fresh-page.md
│   ├── gestasegurado-refreshed.md
│   ├── import-modal-searching.md
│   ├── import-search-results.md
│   ├── logout-menu.md
│   └── search-result-final.md
│
├── security/                 → Auditoría, Seguridad 🔐
│   └── SECURITY_AUDIT_LOGIN.md
│
├── guides/                   → Guías de Mantenimiento 📖
│   ├── CORRECCION_ARQUITECTURA_MODULO_107.md
│   ├── DEBUG_GUARDADO_CITAS.md
│   ├── DOCUMENTACION_MANTENIMIENTO.md
│   ├── MODULO_107_V3_QUICK_START.md
│   └── PRUEBAS_ENDPOINTS_MODULO_107.md
│
├── UI-UX/                    → Design System
├── troubleshooting/          → Problemas y Soluciones
├── uml/                      → Diagramas UML
├── test/                     → Pruebas
└── sh/                       → Scripts SQL y Bash
```

---

## 🎯 Acceso Rápido por Rol

| Rol | Documentación | Ubicación |
|-----|---------------|-----------|
| **👨‍💻 Backend Dev** | Arquitectura, APIs, Servicios | `backend/README.md` |
| **👩‍💻 Frontend Dev** | Componentes, Páginas, UI | `frontend/README.md` |
| **🏗️ Arquitecto** | Flujos, Diagramas, Modelos | `architecture/README.md` |
| **💾 Admin BD** | Esquemas, Migrations, Backups | `database/README.md` |
| **🚀 DevOps** | Performance, Monitoreo, Logs | `backend/10_performance_monitoring/README.md` |
| **🔐 Security** | Auditoría, MBAC, JWT | `security/SECURITY_AUDIT_LOGIN.md` |
| **🧪 QA/Testing** | Test Plans, Edge Cases | `troubleshooting/README.md` |

---

## 📖 Guías Principales

### 1️⃣ **Primeros Pasos**
- [`spec/INDEX.md`](INDEX.md) - Índice maestro del proyecto
- [`spec/README.md`](README.md) - Setup inicial
- [`CLAUDE.md`](../CLAUDE.md) - Instrucciones para Claude

### 2️⃣ **Aprender la Arquitectura**
- [`spec/architecture/01_flujo_atenciones_completo.md`](architecture/01_flujo_atenciones_completo.md)
- [`spec/backend/README.md`](backend/README.md)
- [`spec/frontend/README.md`](frontend/README.md)

### 3️⃣ **Implementar Nuevas Funcionalidades**
- [`spec/backend/`](backend/) - Stack backend (Spring Boot, Java 17)
- [`spec/frontend/`](frontend/) - Stack frontend (React 19, TailwindCSS)
- [`spec/database/`](database/) - Esquemas PostgreSQL

### 4️⃣ **Resolver Problemas**
- [`spec/troubleshooting/README.md`](troubleshooting/README.md) - Guía de solución
- [`spec/debug/`](debug/) - Estados y logs de debugging

### 5️⃣ **Mantener Seguridad**
- [`spec/security/SECURITY_AUDIT_LOGIN.md`](security/SECURITY_AUDIT_LOGIN.md)
- Revisar OWASP compliance en documentación

---

## 📊 Últimas Versiones

### ✅ v1.48.3 - Estadísticas Interactivas
- **Changelog:** [`spec/changelog/v1.46.9-FINAL-CHANGELOG.md`](changelog/)
- **Features:** 4 cards clicables, colores profesionales, Deserción
- **Commit:** `3ac70ab` + `1d1c1d5`

### ✅ v1.47.0 - Atender Paciente
- **Docs:** [`spec/backend/`](backend/)
- **Features:** Recita, Interconsulta, Crónico
- **Tests:** Playwright suite disponible

---

## 🔍 Búsqueda Rápida

**¿Necesitas...?**

| Busca | Ubicación |
|-------|-----------|
| API endpoints | `backend/02_gestionpaciente_api.md` |
| Componentes React | `frontend/` |
| Esquema BD | `database/01_esquema_maestro.md` |
| Flujos de negocio | `architecture/01_flujo_atenciones_completo.md` |
| Guías de mantenimiento | `guides/DOCUMENTACION_MANTENIMIENTO.md` |
| Reporte de seguridad | `security/SECURITY_AUDIT_LOGIN.md` |
| Debugging | `debug/` |
| Changelog | `changelog/` |

---

## 📝 Notas Importantes

1. **CLAUDE.md** permanece en la raíz (instrucciones del proyecto)
2. **README.md** permanece en la raíz (portada del proyecto)
3. Toda documentación temática está en `/spec`
4. Logs y states de debugging en `/spec/debug/`
5. Historial de versiones en `/spec/changelog/`

---

## 🤝 Contribuir a la Documentación

Cuando agregues nueva documentación:

1. ✅ Crea el archivo en la carpeta apropiada en `/spec`
2. ✅ Sigue el nombre: `##_descripcion.md`
3. ✅ Actualiza esta guía (`spec/DOCUMENTACION.md`)
4. ✅ Actualiza `spec/INDEX.md` si es necesario
5. ✅ Haz commit con referencia a `/spec`

---

**Última Actualización:** 2026-02-06
**Versión:** v1.48.3
**Estado:** 📚 Documentación Organizada ✅
