# Documentación: Formulario de Solicitud de Turnos

## 📋 Información General

**Ubicación:** `src/pages/roles/externo/solicitud-turnos/FormularioSolicitudTurnos.jsx`

**Rol de Usuario:** Externo (Personal de IPRESS)

**Propósito:** Permite a los usuarios externos crear, editar y gestionar solicitudes de turnos de telemedicina para sus IPRESS.

---

## 🎯 Funcionalidades Principales

### 1. Gestión de Periodos

El formulario permite trabajar con periodos de solicitud de turnos:

- **Tipos de Periodos:**
  - **VIGENTES:** Periodos que están actualmente vigentes
  - **ACTIVOS:** Periodos que están activos para captura

- **Filtros de Periodos:**
  - Filtro por año (2025, 2026, 2027, etc.)
  - Filtro por periodo específico
  - Filtro por estado de solicitud (SIN_SOLICITUD, INICIADO, ENVIADO, etc.)

### 2. Tabla de Solicitudes por Periodo

Muestra una tabla con las siguientes columnas:
- **Año:** Año del periodo
- **Periodo:** Descripción y código del periodo
- **Solicitud:** ID de la solicitud (si existe)
- **Fecha de Apertura:** Fecha de inicio del periodo
- **Fecha de Cierre:** Fecha de fin del periodo
- **Estado:** Estado actual de la solicitud
- **Acción:** Botones para Iniciar/Editar/Ver

### 3. Registro de Turnos por Especialidad

Interfaz de tabla interactiva que permite:

- **Configuración por Especialidad:**
  - Turnos de Mañana (input numérico)
  - Turnos de Tarde (input numérico)
  - Toggle para Teleconsultorio (TC)
  - Toggle para Teleconsulta (TL)
  - Cálculo automático del total de turnos

- **Gestión de Fechas:**
  - Selección de fechas específicas por especialidad
  - Asignación de turnos a bloques (Mañana/Tarde)
  - Visualización de fechas ya configuradas

### 4. Estados de Solicitud

El sistema maneja los siguientes estados:

- **SIN_SOLICITUD:** No existe solicitud para el periodo
- **INICIADO/BORRADOR:** Solicitud en proceso de edición
- **ENVIADO:** Solicitud enviada para revisión
- **REVISADO:** Solicitud revisada por coordinador
- **APROBADA:** Solicitud aprobada
- **RECHAZADA:** Solicitud rechazada

---

## 🔧 Componentes Utilizados

### Componentes Principales

1. **Modal:** Componente base para modales
   - Ubicación: `./components/Modal.jsx`

2. **PeriodoDetalleCard:** Muestra información detallada del periodo
   - Ubicación: `./components/PeriodoDetalleCard.jsx`
   - Incluye: `SeccionFechas` para mostrar fechas configuradas

3. **TablaSolicitudEspecialidades:** Tabla interactiva para configurar turnos
   - Ubicación: `./components/TablaSolicitudEspecialidades.jsx`
   - Funcionalidades:
     - Edición de turnos por especialidad
     - Selección de fechas mediante modal
     - Auto-guardado de fechas

4. **VistaSolicitudEnviada:** Vista de solo lectura para solicitudes enviadas
   - Ubicación: `./components/VistaSolicitudEnviada.jsx`

### Utilidades

- **helpers.js:** Funciones auxiliares
  - `formatFecha()`: Formatea fechas para visualización
  - `getYearFromPeriodo()`: Extrae el año de un periodo
  - `estadoBadgeClass()`: Retorna clases CSS según el estado

---

## 📡 Servicios y Endpoints

### Servicios Utilizados

1. **solicitudTurnoService** (`../../../../services/solicitudTurnoService`)
   - `obtenerMiIpress()`: Obtiene datos de la IPRESS del usuario
   - `obtenerEspecialidadesCenate()`: Lista especialidades disponibles
   - `listarMisSolicitudes()`: Lista solicitudes del usuario
   - `obtenerPorId(id)`: Obtiene detalle de una solicitud
   - `guardarBorrador(data)`: Guarda/actualiza borrador
   - `enviar(id)`: Envía solicitud para revisión
   - `guardarDetalleEspecialidad(idSolicitud, detalleData)`: Guarda detalle con fechas

2. **periodoSolicitudService** (`../../../../services/periodoSolicitudService`)
   - `obtenerVigentes()`: Obtiene periodos vigentes
   - `obtenerActivos()`: Obtiene periodos activos
   - `obtenerAniosDisponibles()`: Lista años disponibles

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/solicitudes-turno/mi-ipress` | Obtiene IPRESS del usuario |
| GET | `/servicio-essi/activos-cenate` | Lista especialidades CENATE |
| GET | `/solicitudes-turno/mis-solicitudes` | Lista solicitudes del usuario |
| GET | `/solicitudes-turno/{id}` | Obtiene detalle de solicitud |
| POST | `/solicitudes-turno/borrador` | Guarda/actualiza borrador |
| PUT | `/solicitudes-turno/{id}/enviar` | Envía solicitud |
| POST | `/solicitudes-turno/{id}/detalle` | Guarda detalle con fechas |

---

## 🔄 Flujo de Trabajo

### 1. Iniciar Nueva Solicitud

1. Usuario selecciona un periodo desde la tabla
2. Hace clic en "Iniciar"
3. Se abre modal con:
   - Tarjeta de detalle del periodo (solo lectura)
   - Tabla de especialidades para configurar turnos
4. Usuario configura:
   - Cantidad de turnos por especialidad (Mañana/Tarde)
   - Activa/desactiva Teleconsulta y Teleconsultorio
   - Selecciona fechas específicas (opcional)
5. Guarda como borrador o envía directamente

### 2. Editar Solicitud Existente

1. Usuario hace clic en "Editar" en una solicitud con estado INICIADO
2. Se carga la información existente:
   - Turnos configurados por especialidad
   - Fechas ya asignadas
   - Configuración de TC/TL
3. Usuario modifica los datos necesarios
4. Guarda cambios o envía la solicitud

### 3. Ver Solicitud Enviada

1. Usuario hace clic en "Ver" en una solicitud enviada
2. Se muestra vista de solo lectura con:
   - Información completa de la solicitud
   - Detalles por especialidad
   - Fechas configuradas
   - Estado actual

---

## 💾 Estructura de Datos

### Payload para Guardar Borrador

```javascript
{
  idPeriodo: number,
  idSolicitud?: number,  // Solo si es edición
  totalTurnosSolicitados: number,
  totalEspecialidades: number,
  detalles: [
    {
      idServicio: number,
      idDetalle?: number,  // Solo si es edición
      requiere: boolean,
      turnos: number,
      turnoTM: number,  // Siempre 0
      turnoManana: number,
      turnoTarde: number,
      tc: boolean,
      tl: boolean,
      observacion: string,
      estado: string
    }
  ],
  detallesEliminar: number[]  // IDs de detalles a eliminar
}
```

### Payload para Guardar Fechas

```javascript
{
  idPeriodo: number,
  idServicio: number,
  idDetalle?: number,  // Solo si es edición
  requiere: boolean,
  turnos: number,
  turnoTM: number,
  turnoManana: number,
  turnoTarde: number,
  tc: boolean,
  tl: boolean,
  observacion: string,
  estado: string,
  fechasDetalle: [
    {
      fecha: string,  // Formato: YYYY-MM-DD
      bloque: "MANANA" | "TARDE"
    }
  ]
}
```

---

## 🎨 Estilos y Clases CSS

### Clases de Botones

- `BUTTON_HOVER_CLASS`: Botones con efecto hover azul
- `BUTTON_WHITE_HOVER_CLASS`: Botones blancos con hover azul
- `BUTTON_SAVE_CLASS`: Botón de guardar (gradiente azul)
- `BUTTON_SEND_CLASS`: Botón de enviar (gradiente púrpura)

### Badges de Estado

Los estados se muestran con badges de colores:
- **SIN_SOLICITUD:** Gris
- **INICIADO/BORRADOR:** Amarillo/Naranja
- **ENVIADO:** Azul
- **REVISADO:** Púrpura
- **APROBADA:** Verde
- **RECHAZADA:** Rojo

---

## ⚠️ Validaciones

### Validaciones al Guardar

1. **Periodo seleccionado:** Debe existir un periodo seleccionado
2. **Especialidades con turnos:** Debe haber al menos una especialidad con turnos > 0
3. **Fechas:** Si se configuran fechas, la especialidad debe tener turnos configurados

### Validaciones al Enviar

1. Todas las validaciones de guardar
2. Confirmación del usuario (no se puede modificar después)

---

## 🔐 Permisos y Seguridad

- El usuario solo puede ver y gestionar sus propias solicitudes
- Los datos de IPRESS se obtienen automáticamente del usuario autenticado
- Las solicitudes enviadas no pueden ser modificadas

---

## 📝 Notas Técnicas

### Auto-guardado de Fechas

Cuando el usuario confirma fechas en el modal de selección:
1. Si no existe solicitud, se crea automáticamente un borrador
2. Se guarda el detalle de la especialidad con las fechas
3. Se actualiza el estado local de la solicitud

### Agrupación de Detalles

El sistema agrupa múltiples registros de detalles por especialidad cuando hay múltiples fechas, consolidando todo en un solo registro por especialidad.

### Recarga Automática

Después de guardar o enviar:
- Se recarga la lista de solicitudes
- Se actualiza el detalle de la solicitud actual
- Se refrescan los datos del periodo

---

## 🐛 Manejo de Errores

- Errores de red se muestran mediante mensajes de error
- Errores de validación se muestran en campos específicos
- Los errores del backend se capturan y muestran al usuario
- Los estados de carga se manejan con spinners y mensajes

---

## 📚 Referencias

- **Servicios:** `src/services/solicitudTurnoService.js`, `src/services/periodoSolicitudService.js`
- **Componentes:** `src/pages/roles/externo/solicitud-turnos/components/`
- **Utilidades:** `src/pages/roles/externo/solicitud-turnos/utils/helpers.js`

---

**Última actualización:** 2025-01-27
