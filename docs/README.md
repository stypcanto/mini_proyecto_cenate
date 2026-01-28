# 📚 Documentación del Proyecto CENATE

Este directorio contiene la documentación técnica del proyecto, organizada por módulos y formularios.

## 📁 Estructura

```
docs/
├── README.md                                    # Este archivo
├── gestion-periodos-disponibilidad/
│   ├── backend.md                               # Documentación del backend
│   └── frontend.md                              # Documentación del frontend
└── solicitud-turnos/
    ├── codigo-personal.md                       # Cómo se obtiene el código del personal
    └── obtenerPersonalActual.md                 # Detalles del método obtenerPersonalActual
```

## 📋 Módulos Documentados

### Gestión de Períodos Médicos de Disponibilidad
- **Ruta Frontend:** `/roles/coordinador/periodo-disponibilidad-medica`
- **Controller Backend:** `PeriodoMedicoDisponibilidadController`
- **Base URL API:** `/api/periodos-medicos-disponibilidad`

**Documentación:**
- [Backend](./gestion-periodos-disponibilidad/backend.md)
- [Frontend](./gestion-periodos-disponibilidad/frontend.md)

### Solicitud de Turnos (Rol Externo)
- **Ruta Frontend:** `/roles/externo/solicitud-turnos`
- **Controller Backend:** `SolicitudTurnoIpressController`
- **Base URL API:** `/api/solicitudes-turno`

**Documentación:**
- [Obtención del Código del Personal](./solicitud-turnos/codigo-personal.md) - Flujo completo de cómo se obtiene el código del personal
- [Método obtenerPersonalActual()](./solicitud-turnos/obtenerPersonalActual.md) - Detalles del método y valores que retorna

---

## 📖 Cómo Usar Esta Documentación

### Para Desarrolladores Backend
1. Consulta el archivo `backend.md` del módulo correspondiente
2. Revisa los endpoints disponibles, DTOs y validaciones
3. Verifica los ejemplos de uso con cURL

### Para Desarrolladores Frontend
1. Consulta el archivo `frontend.md` del módulo correspondiente
2. Revisa los componentes, servicios y flujo de datos
3. Verifica los ejemplos de código JavaScript/React

### Para Integradores
1. Revisa ambos archivos (backend y frontend) del módulo
2. Verifica la estructura de datos esperada
3. Consulta los ejemplos de integración

---

## 🔄 Convenciones de Documentación

### Backend
- Descripción del controller
- Lista completa de endpoints con métodos HTTP
- DTOs con estructura y validaciones
- Ejemplos de requests y responses
- Códigos de estado y manejo de errores

### Frontend
- Estructura de archivos y componentes
- Servicios de API con métodos disponibles
- Props y estado de componentes
- Flujo de datos
- Ejemplos de uso

---

## ➕ Agregar Nueva Documentación

Para documentar un nuevo módulo:

1. Crear carpeta con el nombre del módulo:
   ```bash
   mkdir docs/nombre-del-modulo
   ```

2. Crear archivos de documentación:
   - `backend.md`: Documentación del controller y endpoints
   - `frontend.md`: Documentación de componentes y servicios

3. Actualizar este README.md agregando la nueva sección

---

## 📝 Formato de Documentación

### Estructura Recomendada para Backend.md
```markdown
# 📋 Documentación Backend - [Nombre del Módulo]

## 📍 Ubicación
## 🎯 Descripción
## 🔐 Seguridad
## 📡 Endpoints
## 📦 DTOs
## 🔗 Dependencias
## 📝 Notas de Implementación
## 🧪 Ejemplos de Uso
## 📚 Archivos Relacionados
```

### Estructura Recomendada para Frontend.md
```markdown
# 🎨 Documentación Frontend - [Nombre del Módulo]

## 📍 Ubicación
## 🎯 Descripción
## 📁 Estructura de Archivos
## 🔌 Servicio de API
## 🧩 Componentes
## 📊 Estados
## 🎨 UI/UX
## 🔄 Flujo de Datos
## ⚠️ Manejo de Errores
## 📝 Notas de Implementación
## 🧪 Ejemplos de Uso
## 🔗 Archivos Relacionados
## 🐛 Solución de Problemas
```

---

## 🔍 Búsqueda Rápida

### Por Funcionalidad
- **Gestión de Períodos:** `gestion-periodos-disponibilidad/`
- **Solicitud de Turnos:** `solicitud-turnos/`
- (Agregar más módulos aquí)

### Por Tipo de Documentación
- **Backend:** Buscar archivos `backend.md`
- **Frontend:** Buscar archivos `frontend.md`

---

## 📞 Contacto

Para preguntas o sugerencias sobre la documentación, contactar al equipo de desarrollo.

---

**Última actualización:** 2026-01-27
