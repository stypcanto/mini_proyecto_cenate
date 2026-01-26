# 📊 Diagramas UML - CENATE

**Índice de diagramas visuales del proyecto**

---

## 📂 Archivos Disponibles

### 1. **Diagrama Completo Solicitudes de Bolsa v1.6.0** ⭐ PRINCIPAL
📄 **Archivo:** `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`

**Contenido:**
- Arquitectura de Solicitudes de Bolsa
- Tabla `dim_solicitud_bolsa` (26 campos, 8 FKs)
- Tabla `dim_estados_gestion_citas` (10 estados)
- Flujo completo: Bolsa → Coordinador → Gestoras
- Diagramas de relaciones entre tablas
- Estados de gestión de citas
- Integraciones y validaciones
- Casos de uso con ejemplos

**Relaciones Clave:**
```
dim_solicitud_bolsa
  ├─ FK → dim_paciente
  ├─ FK → dim_especialidades
  ├─ FK → dim_red
  ├─ FK → dim_ipress
  ├─ FK → dim_tipos_bolsas
  ├─ FK → dim_estados_gestion_citas
  ├─ FK → dim_coordinador
  └─ FK → dim_gestor_citas
```

---

### 2. **Diagrama Bienvenida v2.0.0** ⭐ NUEVO
📄 **Archivo:** `02_diagrama_bienvenida_v2.0.0.md`

**Contenido:**
- Estructura de componentes (AppLayout → Bienvenida)
- Diagrama de clases y relaciones
- Flujo de datos (AuthContext → Estado → Render)
- Estados visuales (Normal → Hover → Click)
- Layout responsive (Mobile, Tablet, Desktop)
- Diagrama de navegación (Tarjetas + Actividades)
- Estructura de datos (User Object, Config)
- Integraciones (Auth, Router, Iconos, Tailwind)
- Proceso de renderizado

**Estructura Principal:**
```
AppLayout (Header + Sidebar + Content)
  └── HeaderCenate (h-24)
  └── Bienvenida.jsx
      ├── Banner Principal
      ├── Tarjetas de Acción (3)
      ├── Actividades Administrativas (6)
      └── Footer
```

**Componentes de Navegación:**
```
Tarjetas:
  [0] Mi Perfil → ❌ NO NAVEGA
  [1] Mi Información → ❌ NO NAVEGA
  [2] Seguridad → ✅ /user/security

Actividades:
  [0] Gestión Usuarios → /admin/usuarios-permisos
  [1] Control Permisos → /admin/permisos
  [2] Auditoría → /admin/logs
  [3] Configuración → /admin/modulos
  [4] Gestión Personal → /admin/usuarios-permisos
  [5] Seguridad → /user/security
```

---

## 🎯 Guía de Lectura

### Para Entender Solicitudes de Bolsa:
1. Lee `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`
2. Enfócate en:
   - Tabla principal (26 campos)
   - 8 Foreign Keys
   - 10 Estados de gestión
   - Flujo: Coordinador → Gestoras

### Para Entender Bienvenida:
1. Lee `02_diagrama_bienvenida_v2.0.0.md`
2. Enfócate en:
   - Estructura de componentes
   - Flujo de datos
   - Layout responsive
   - Navegación selectiva

---

## 📊 Diagramas Disponibles

### En `02_diagrama_bienvenida_v2.0.0.md`:

| Diagrama | Descripción |
|----------|-------------|
| **Estructura de Componentes** | ASCII art del layout completo |
| **Clases y Relaciones** | Bienvenida.jsx con hooks y contextos |
| **Flujo de Datos** | AuthContext → Estado → UI |
| **Estados Visuales** | Normal → Hover → Click (por tarjeta) |
| **Layout Responsive** | Mobile, Tablet, Desktop |
| **Navegación** | Árbol de rutas y destinos |
| **Estructura de Datos** | User Object, Tarjeta, Actividad |
| **Integraciones** | AuthContext, Router, Iconos, CSS |
| **Renderizado** | Loading → Spinner → Content |
| **Tabla Componentes** | Tabla de todos los elementos |

---

## 🔗 Relaciones Entre Diagramas

```
UML Completo v1.6
(Solicitudes de Bolsa)
    │
    ├─ dim_solicitud_bolsa (26 campos)
    ├─ dim_estados_gestion_citas (10 estados)
    └─ Flujo: Coordinador → Gestoras


Bienvenida v2.0.0
(Página de Bienvenida)
    │
    ├─ AppLayout (Layout global)
    ├─ HeaderCenate (h-24)
    ├─ Bienvenida.jsx (Contenido)
    └─ UserMenu (Avatar + Dropdown)
```

---

## 📐 Dimensiones Clave

| Elemento | Medida |
|----------|--------|
| Header | h-24 (96px) |
| Avatar Usuario | w-14 h-14 (56px) |
| Banner Avatar | w-28 h-28 (112px) |
| Tarjetas Grid | md:grid-cols-3 |
| Actividades Grid | md:grid-cols-2 |

---

## 🎨 Colores CENATE

```
Primario:    #0a5ba9 (cenate-600)
Secundario:  #059669 (emerald-600)
Texto:       #1f2937 (gray-800)
Fondo:       #f9fafb (gray-50)
Dark:        #0f172a (slate-900)
```

---

## ✅ Checklist de Diagramas

- [x] UML Completo Solicitudes de Bolsa v1.6.0
- [x] Diagrama Bienvenida v2.0.0
- [x] README índice
- [ ] Diagrama de flujo de permisos (próximamente)
- [ ] Diagrama de auditoría (próximamente)
- [ ] Diagrama de notificaciones (próximamente)

---

## 🚀 Próximos Diagramas

1. **Flujo de Permisos MBAC**: Cómo se evalúan permisos por módulo
2. **Auditoría del Sistema**: Cómo se registran eventos
3. **Notificaciones**: Flujo de generación y distribución
4. **Autenticación**: Flujo de login y JWT

---

## 📚 Documentación Relacionada

- **Especificación Técnica:** `spec/backend/`
- **Cambios UI/UX:** `spec/frontend/05_mejoras_ui_ux_bienvenida_v2.md`
- **Changelog:** `checklist/01_Historial/01_changelog.md`

---

*Diagramas UML - CENATE | Versión: v1.35.0 | Actualización: 2026-01-26*
