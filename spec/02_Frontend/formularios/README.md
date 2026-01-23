# Documentación de Formularios - Sistema CENATE

Este directorio contiene la documentación técnica completa de los formularios principales del sistema CENATE.

## 📚 Documentos Disponibles

### 1. Formulario de Solicitud de Turnos
**Archivo:** `FormularioSolicitudTurnos.md`

**Rol:** Usuario Externo (Personal de IPRESS)

**Descripción:** Documentación completa del formulario que permite a los usuarios externos crear, editar y gestionar solicitudes de turnos de telemedicina.

**Contenido:**
- Funcionalidades principales
- Componentes utilizados
- Servicios y endpoints
- Flujo de trabajo
- Estructura de datos
- Validaciones y seguridad

---

### 2. Gestión de Periodos y Solicitudes
**Archivo:** `GestionPeriodosTurnos.md`

**Rol:** Coordinador

**Descripción:** Documentación completa del módulo que permite a los coordinadores gestionar periodos de solicitud y revisar/aprobar/rechazar solicitudes.

**Contenido:**
- Gestión de periodos (crear, editar, activar, cerrar, eliminar)
- Gestión de solicitudes (revisar, aprobar, rechazar)
- Componentes utilizados
- Servicios y endpoints
- Flujo de trabajo
- Estadísticas y métricas

---

## 🗂️ Estructura de Carpetas

```
docs/
└── formularios/
    ├── README.md (este archivo)
    ├── FormularioSolicitudTurnos.md
    └── GestionPeriodosTurnos.md
```

## 📖 Cómo Usar Esta Documentación

### Para Desarrolladores

1. **Nuevo en el proyecto:** Comienza leyendo el README.md y luego revisa cada formulario según tu área de trabajo.

2. **Modificar funcionalidad:** Consulta la sección "Funcionalidades Principales" y "Flujo de Trabajo" del formulario correspondiente.

3. **Agregar endpoints:** Revisa la sección "Servicios y Endpoints" para entender la estructura de datos esperada.

4. **Troubleshooting:** Consulta la sección "Manejo de Errores" y "Notas Técnicas".

### Para Coordinadores/Usuarios

1. **Aprender a usar el sistema:** Revisa la sección "Flujo de Trabajo" del formulario correspondiente a tu rol.

2. **Entender funcionalidades:** Consulta la sección "Funcionalidades Principales".

---

## 🔄 Actualización de Documentación

Esta documentación debe actualizarse cuando:

- Se agreguen nuevas funcionalidades
- Se modifiquen endpoints o servicios
- Se cambien flujos de trabajo
- Se agreguen nuevos componentes
- Se modifiquen validaciones o reglas de negocio

**Última actualización general:** 2025-01-27

---

## 📞 Contacto

Para preguntas o sugerencias sobre esta documentación, contactar al equipo de desarrollo.

---

## 📝 Notas

- Esta documentación está basada en el código fuente actual del proyecto
- Los endpoints y estructuras de datos pueden variar según la versión del backend
- Siempre verificar la implementación actual en el código fuente
