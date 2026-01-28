# 📊 Diagramas UML - CENATE

**Índice de diagramas visuales del proyecto**
**Última actualización:** 2026-01-28

---

## 📂 Archivos Disponibles

### 🆕 1. **Diagrama Módulo Bolsas v2.1.0** ⭐ NUEVO y ACTUALIZADO
📄 **Archivo:** `03_diagrama_modulo_bolsas_v2.1.0.md`

**Contenido (NUEVO v2.1.0):**
- ✅ Arquitectura integrada completa (Frontend + Backend + DB)
- ✅ Flujo de Control de Acceso RBAC (Botón Borrar SUPERADMIN)
- ✅ Flujo de Filtros Dinámicos con contadores en tiempo real
- ✅ Flujo de Importación Excel mejorada (v2.1.0)
- ✅ Teléfono alterno + Auto-creación asegurados
- ✅ Normalización IPRESS + Enriquecimiento cascada
- ✅ Tabla central dim_solicitud_bolsa (28 campos)
- ✅ 8 Foreign Keys + Relaciones cascada
- ✅ UI ListHeader.jsx (3 filas lógicas)
- ✅ 10 endpoints estadísticas
- ✅ 10 Estados de gestión citas
- ✅ Validaciones 3 capas
- ✅ Roadmap v2.1.0 → v2.4.0

**Status:** ✅ v2.1.0 Production Ready + RBAC

---

### 2. **Diagrama Completo Solicitudes de Bolsa v1.6.0** (Histórico)
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

### 3. **Diagrama Bienvenida v2.0.0**
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

## 🎯 Guía de Lectura (2026-01-28)

### ⭐ Para Entender Módulo Bolsas v2.1.0 (RECOMENDADO):
1. Lee `03_diagrama_modulo_bolsas_v2.1.0.md` ← **EMPIEZA AQUÍ**
2. Enfócate en:
   - Arquitectura integrada (Frontend + Backend + DB)
   - Control de Acceso RBAC (v2.1.0)
   - Filtros Dinámicos (v2.1.0)
   - Tabla central (28 campos)
   - 8 Foreign Keys + Enriquecimiento cascada
   - Flujo de Importación Excel mejorado
   - UI ListHeader.jsx (3 filas)
   - 10 Estados de gestión

### Para Histórico - Solicitudes de Bolsa v1.6.0:
1. Lee `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` (anterior)
2. Contenido:
   - Tabla principal (26 campos) - ahora 28 en v2.1.0
   - 8 Foreign Keys
   - 10 Estados de gestión
   - Flujo original (antes de v2.1.0)

### Para Entender Bienvenida:
1. Lee `02_diagrama_bienvenida_v2.0.0.md`
2. Enfócate en:
   - Estructura de componentes
   - Flujo de datos
   - Layout responsive
   - Navegación selectiva

---

## 📊 Diagramas Disponibles (v2.1.0)

### En `03_diagrama_modulo_bolsas_v2.1.0.md`: ⭐ NUEVO

| Diagrama | Descripción |
|----------|-------------|
| **Arquitectura Integrada** | Frontend + Backend + Database |
| **Control de Acceso RBAC** | Flujo de verificación esSuperAdmin |
| **Filtros Dinámicos** | Contadores en tiempo real + hidden 0 |
| **Importación Excel** | Flujo completo de carga (v2.1.0) |
| **Tabla Central** | dim_solicitud_bolsa (28 campos) |
| **Foreign Keys** | 8 FKs + Enriquecimiento cascada |
| **ListHeader UI** | Layout 3 filas lógicas |
| **Estadísticas** | 10 endpoints REST |
| **Estados de Citas** | 10 estados predefinidos |
| **Validaciones 3 Capas** | Frontend + DTO + Database |
| **Roadmap** | v2.1.0 → v2.4.0 |

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

## 🔗 Relaciones Entre Diagramas (2026-01-28)

```
Módulo Bolsas v2.1.0 ← PRINCIPAL (ACTUAL)
(Solicitudes + Estadísticas + RBAC)
    │
    ├─ Arquitectura integrada (Frontend + Backend + DB)
    ├─ Control de Acceso RBAC (Botón Borrar SUPERADMIN)
    ├─ Filtros dinámicos (Contadores)
    ├─ dim_solicitud_bolsa (28 campos, 329 registros)
    ├─ dim_estados_gestion_citas (10 estados)
    ├─ Enriquecimiento cascada (IPRESS→RED→MACRO)
    └─ 10 endpoints REST estadísticas


UML Completo v1.6 ← HISTÓRICO
(Solicitudes de Bolsa original)
    │
    ├─ dim_solicitud_bolsa (26 campos - versión anterior)
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

## ✅ Checklist de Diagramas (2026-01-28)

- [x] UML Completo Solicitudes de Bolsa v1.6.0 (histórico)
- [x] Diagrama Módulo Bolsas v2.1.0 ⭐ NUEVO (RBAC + Filtros + Enriquecimiento)
- [x] Diagrama Bienvenida v2.0.0
- [x] README índice actualizado
- [ ] Diagrama de flujo de permisos MBAC (próximamente)
- [ ] Diagrama de auditoría (próximamente)
- [ ] Diagrama de notificaciones (próximamente)
- [ ] Diagrama de Spring AI (próximamente)

---

## 🚀 Próximos Diagramas

1. **Flujo de Permisos MBAC v2.1.0**: Cómo se evalúan permisos por módulo (incluir RBAC)
2. **Auditoría del Sistema**: Cómo se registran eventos
3. **Notificaciones**: Flujo de generación y distribución
4. **Autenticación**: Flujo de login y JWT
5. **Spring AI Chatbot**: Arquitectura IA integrada
6. **Disponibilidad Médica**: Turnos y disponibilidad

---

## 📚 Documentación Relacionada

- **Especificación Técnica:** `spec/backend/`
- **Módulo Bolsas v2.1.0:** `spec/backend/09_modules_bolsas/`
- **CHANGELOG v2.1.0:** `spec/backend/09_modules_bolsas/14_CHANGELOG_v2.1.0.md`
- **Cambios UI/UX:** `spec/frontend/`
- **Changelog Principal:** `CLAUDE.md`

---

*Diagramas UML - CENATE | Versión: v2.1.0 | Actualización: 2026-01-28*
*Especializado en: Módulo de Bolsas con RBAC + Filtros Dinámicos + Enriquecimiento Cascada*
