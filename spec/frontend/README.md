# 📱 Frontend Documentation

**Versión:** v1.18.0 | **Status:** ✅ Production Ready

## 📂 Estructura Organizada

### Código (React)
- **01_components/** - Componentes reutilizables (PageHeader, StatCard, etc.)
- **02_pages/** - Páginas y módulos específicos
- **03_services/** - Servicios API client
- **04_context/** - Contextos y estado global (AuthContext, PermisosContext)
- **05_layouts/** - Layouts principales (AppLayout, ResponsiveSidebar)

### Documentación (por Tema)

#### 📖 Guías de Implementación
**[06_guides/](./06_guides/)**
- Gestión de usuarios y permisos (v1.18.0)
- Sistema de creación de usuarios con email
- Validación MBAC en frontend

#### 🎨 UI/UX
**[07_ui_ux/](./07_ui_ux/)** ⭐ **RECOMENDADO**
- Mejoras bienvenida v2.0.0 (header expandido)
- Design System CENATE
- Paleta de colores y tipografía
- Componentes reutilizables

#### 🔗 Patrones de Diseño
**[08_patterns/](./08_patterns/)**
- Separación de campos compuestos
- Estructura de formularios
- Validación de datos

#### ✨ Características Específicas
**[09_features/](./09_features/)**
- Trazabilidad clínica
- Auditoría de cambios
- Seguimiento de pacientes

## 🛠️ Stack

- **React 19** con hooks modernos (use(), useFormStatus, useOptimistic)
- **TailwindCSS 3.4.18** para estilos
- **Lucide React** para iconos
- **React Router** para navegación
- **TypeScript** para type-safety

## 🎯 Inicio Rápido

**Por rol:**
- **Nuevo Developer:** Lee [`06_guides/01_gestion_usuarios_permisos.md`](./06_guides/01_gestion_usuarios_permisos.md)
- **Diseño UI/UX:** Lee [`07_ui_ux/README.md`](./07_ui_ux/README.md)
- **Implementar Patrón:** Lee [`08_patterns/01_patron_separacion_campos_compuestos.md`](./08_patterns/01_patron_separacion_campos_compuestos.md)
- **Feature Específica:** Lee [`09_features/03_trazabilidad_clinica.md`](./09_features/03_trazabilidad_clinica.md)

## 📚 Lectura Recomendada

1. **Entender componentes base:** 👉 [`01_components/`](./01_components/)
2. **Estructura de páginas:** 👉 [`02_pages/`](./02_pages/)
3. **Design System:** 👉 [`07_ui_ux/README_UI_UX.md`](./07_ui_ux/README_UI_UX.md)

