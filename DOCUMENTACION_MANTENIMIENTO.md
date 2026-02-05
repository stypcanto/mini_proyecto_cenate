# 📚 Guía de Mantenimiento - Documentación CENATE v1.45.2+

> **Propósito:** Garantizar que la documentación siempre esté actualizada y vinculada correctamente
> **Última actualización:** 2026-02-05 ✅
> **Responsable:** Equipo de Desarrollo

---

## 🎯 Estructura de Vinculación Actual (v1.45.2)

```
CLAUDE.md (PUNTO DE ENTRADA PRINCIPAL)
├── 📖 DOCUMENTACIÓN PRINCIPAL POR VERSIÓN (Nueva sección)
│   ├── v1.45.2 links
│   └── v1.45.1 links
├── 📊 ÚLTIMAS VERSIONES (Detalles de cada versión)
│   ├── v1.45.2 (Features + Docs links)
│   └── v1.45.1 (Features + Docs links)
└── 📂 Carpetas de Documentación (Referencias a subdirectorios)

spec/INDEX.md (ÍNDICE MAESTRO)
├── Navegación Rápida (Backend, Frontend, Diseño, DB, etc.)
├── Documentos Principales por Tipo
└── Frontend (5 docs - v1.45.2 es doc #1 ⭐)

checklist/01_Historial/01_changelog.md (CHANGELOG COMPLETO)
├── v1.45.2 (IPRESS Names Display)
│   ├── Cambios backend (snippet de código)
│   ├── API Response (antes/después)
│   └── Verificación (curl test)
└── v1.45.1 (Mis Pacientes Complete)
    ├── Cambios backend
    ├── Cambios frontend
    └── Testing results

spec/frontend/15_mis_pacientes_medico.md (SPEC DETALLADA)
├── Descripción general
├── Componentes y layout
├── Funcionalidades (7)
├── Datos y API
├── Flujos de usuario (3)
├── Seguridad y permisos
├── Responsive design
├── Roadmap futuro
└── Referencias (code files)
```

---

## ✅ Checklist: Cuando Implementas Nueva Feature

### Paso 1: Implementar Feature (Backend + Frontend)
- [ ] Backend cambios completados
- [ ] Frontend cambios completados
- [ ] Tests escritos y pasando
- [ ] Commit creado

### Paso 2: Actualizar Changelog
**Archivo:** `checklist/01_Historial/01_changelog.md`

Agregar al inicio (antes de v1.42.2):
```markdown
## v1.45.X (YYYY-MM-DD) - 🎯 FEATURE TITLE

### ✅ Implementación Completada

**Cambios Backend:**
- Archivo: línea X - description
- Code snippet

**Cambios Frontend:**
- Archivo: description

**API Integration:**
- Endpoint: GET /api/...
- Response example

**Testing Results:**
- ✅ Test 1
- ✅ Test 2

**Docs:**
- Frontend spec: `spec/frontend/XX_modulo_name.md`
- Changelog: Este archivo
```

### Paso 3: Crear Frontend Spec (si aplica)
**Archivo:** `spec/frontend/XX_modulo_name.md`

Incluir secciones:
- Descripción general
- Componentes y layout
- Funcionalidades detalladas
- Datos y API
- Flujos de usuario
- Seguridad
- Responsive design
- Problemas conocidos
- Roadmap futuro

### Paso 4: Actualizar CLAUDE.md
**Archivo:** `CLAUDE.md`

1. **Actualizar versión en header:**
```markdown
> **Versión:** vX.XX.X (2026-MM-DD) 🚀
```

2. **Agregar sección en "📖 DOCUMENTACIÓN PRINCIPAL POR VERSIÓN":**
```markdown
### ✅ vX.XX.X - Documentación Completa
- **Frontend Spec:** [`spec/frontend/XX_modulo_name.md`](spec/frontend/XX_modulo_name.md) - Title (XXX+ líneas)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#vXXX-YYYY-MM-DD`](checklist/01_Historial/01_changelog.md) - Description
- **Index:** [`spec/INDEX.md`](spec/INDEX.md) - Referencia maestra actualizada
- **Backend:** `ClassName.java:lineNo` - method name
- **Frontend:** `ComponentName.jsx` - description
```

3. **Agregar entrada en "📊 ÚLTIMAS VERSIONES":**
```markdown
### vX.XX.X - Completado (YYYY-MM-DD) 🎯 EMOJI FEATURE TITLE
✅ **Feature 1** - Description
✅ **Feature 2** - Description
...

**Features:**
- Feature detail 1
- Feature detail 2

**Cambios:**
- Backend: File.java line X - change
- Frontend: Component.jsx - change

**Docs:**
- ⭐ Frontend Spec: [`spec/frontend/XX_modulo_name.md`](spec/frontend/XX_modulo_name.md) ✅ COMPLETO
- Changelog: [`checklist/01_Historial/01_changelog.md#vXXX-YYYY-MM-DD`](checklist/01_Historial/01_changelog.md)
```

### Paso 5: Actualizar spec/INDEX.md
**Archivo:** `spec/INDEX.md`

1. **Actualizar versión:**
```markdown
# 📚 CENATE Documentation Index vX.XX.X
```

2. **Agregar link en sección correspondiente:**
```markdown
### Para Desarrolladores Frontend
- **🔥 NUEVO Modulo Name:** `frontend/XX_modulo_name.md` (vX.XX.X ⭐)
```

3. **Actualizar lista de documentos principales:**
```markdown
### 📱 Frontend (X docs principales)
1. **`frontend/XX_modulo_name.md` - Modulo Title vX.XX.X ⭐ NUEVO**
   - Description line 1
   - Description line 2
2. ...
```

### Paso 6: Crear Commit de Documentación
```bash
git add CLAUDE.md checklist/01_Historial/01_changelog.md spec/INDEX.md spec/frontend/XX_modulo_name.md

git commit -m "docs(vX.XX.X): Feature Title - Complete documentation

## Changes Made
- Backend: Description
- Frontend: Description
- Documentation: Created spec/frontend/XX_modulo_name.md

## Documentation Updates
1. CLAUDE.md - Updated to vX.XX.X
2. changelog.md - Added vX.XX.X entry
3. spec/INDEX.md - Added reference to new frontend module
4. spec/frontend/XX_modulo_name.md - NEW (XXX+ lines)

## Quick Links
- Frontend spec: spec/frontend/XX_modulo_name.md
- Backend files: ClassName.java (line X)
- Frontend files: ComponentName.jsx

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## 🔗 Cómo Mantener Vinculaciones Actualizadas

### 1. Links en CLAUDE.md siempre apunten a:
- ✅ `spec/frontend/XX_modulo_name.md` - Frontend specs
- ✅ `checklist/01_Historial/01_changelog.md#vXXX-YYYY-MM-DD` - Changelog anchors
- ✅ `spec/INDEX.md` - Master index
- ✅ Código fuente con línea exacta: `File.java:lineNo`

### 2. Links en spec/INDEX.md siempre apunten a:
- ✅ `spec/frontend/XX_modulo_name.md` - Para frontend modules
- ✅ `backend/XX_modulo_name/README.md` - Para backend modules
- ✅ Descripciones consistentes con CLAUDE.md

### 3. Links en Changelog (01_changelog.md) siempre incluyan:
- ✅ Anchor headers: `## vX.XX.X (YYYY-MM-DD) - TITLE`
- ✅ File.java:lineNo para código backend
- ✅ Component.jsx para código frontend
- ✅ API endpoint examples con curl commands

### 4. Links en Frontend Specs siempre incluyan:
- ✅ "Documentación relacionada:" sección al final
- ✅ Cross-references a backend files
- ✅ Links a changelog entry
- ✅ Links a CLAUDE.md version section

---

## 📋 Verificación: ¿Está Todo Vinculado?

Usar este checklist después de crear nueva documentación:

```bash
# 1. Verificar que CLAUDE.md tiene links correctos
grep -n "spec/frontend/XX_modulo_name.md" CLAUDE.md
# Debe retornar 2+ líneas (en 📖 DOCUMENTACIÓN + en 📊 ÚLTIMAS VERSIONES)

# 2. Verificar que spec/INDEX.md tiene referencia
grep -n "XX_modulo_name" spec/INDEX.md
# Debe retornar al menos 1 línea

# 3. Verificar que changelog.md tiene sección
grep -n "## vX.XX.X" checklist/01_Historial/01_changelog.md
# Debe retornar la entrada de versión

# 4. Verificar que frontend spec existe
ls -la spec/frontend/XX_modulo_name.md
# Debe existir el archivo

# 5. Verificar que links en spec apunten a código real
# Abrir spec/frontend/XX_modulo_name.md y verificar:
# - Backend file references existen: ClassName.java
# - Frontend file references existen: ComponentName.jsx
```

---

## 🚀 Versiones y Links Actuales (v1.45.2)

| Versión | Estado | CLAUDE.md | Changelog | spec/INDEX | Frontend Spec |
|---------|--------|-----------|-----------|-----------|---------------|
| v1.45.2 | ✅ Completo | ✅ Links | ✅ Entry | ✅ Link | ✅ 15_mis_pacientes_medico.md |
| v1.45.1 | ✅ Completo | ✅ Links | ✅ Entry | ✅ Link | ✅ 15_mis_pacientes_medico.md |
| v1.44.0 | ✅ Completo | ✅ Links | ✅ Entry | ✅ Link | - |
| v1.42.2 | ✅ Completo | ✅ Links | ✅ Entry | ✅ Link | - |

---

## 📝 Template para Nueva Feature

```markdown
## vX.XX.X (YYYY-MM-DD) - 🎯 FEATURE TITLE

### ✅ Descripción

[Brief description of what was implemented]

### 🔧 Cambios Backend

**Archivo 1: ClassName.java (line X)**
\`\`\`java
// Code snippet
\`\`\`

**Archivo 2: ClassName.java (line Y)**
\`\`\`java
// Code snippet
\`\`\`

### 🎨 Cambios Frontend

**Archivo: ComponentName.jsx**
- Change 1
- Change 2

### 📊 API Integration

**Endpoint:** GET /api/endpoint

**Response:**
\`\`\`json
{
  "field": "value"
}
\`\`\`

### ✅ Testing Results

- ✅ Test 1
- ✅ Test 2

### 📚 Documentación

- **Frontend Spec:** `spec/frontend/XX_modulo_name.md` ✅ COMPLETO
- **Changelog:** Este archivo
- **Index:** `spec/INDEX.md`
```

---

## 🎯 Resumen: Vinculación Actualizada

**Estado actual (v1.45.2):**
- ✅ CLAUDE.md: Header actualizado, nueva sección de documentación, links a specs
- ✅ changelog.md: v1.45.2 + v1.45.1 entries completas con código
- ✅ spec/INDEX.md: Version actualizada, link a 15_mis_pacientes_medico.md
- ✅ spec/frontend/15_mis_pacientes_medico.md: 350+ líneas, sección "Documentación relacionada"
- ✅ Commits: 2 (e345858 + 3093798) documentando todos los cambios

**Próxima versión:**
1. Seguir este checklist
2. Crear nuevo frontend spec si es módulo/componente
3. Actualizar CLAUDE.md con links
4. Actualizar spec/INDEX.md
5. Agregar entrada a changelog
6. Crear commit de documentación

---

**Documento creado:** 2026-02-05 ✅
**Versión:** v1.45.2
**Mantenedor:** Equipo CENATE
