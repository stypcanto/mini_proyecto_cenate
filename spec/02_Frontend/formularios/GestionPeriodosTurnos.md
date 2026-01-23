# Documentación: Gestión de Periodos y Solicitudes

## 📋 Información General

**Ubicación:** `src/pages/roles/coordinador/gestion-periodos/GestionPeriodosTurnos.jsx`

**Rol de Usuario:** Coordinador

**Propósito:** Permite a los coordinadores gestionar periodos de solicitud de turnos y revisar/aprobar/rechazar solicitudes de las IPRESS.

---

## 🎯 Funcionalidades Principales

### 1. Gestión de Periodos

El sistema permite gestionar periodos de solicitud de turnos con las siguientes operaciones:

#### 1.1 Crear Periodo (Aperturar)
- Crear nuevos periodos de solicitud
- Definir fechas de inicio y fin
- Establecer descripción y código del periodo
- Estado inicial: BORRADOR

#### 1.2 Editar Periodo
- Solo periodos en estado ACTIVO pueden ser editados
- Permite modificar fechas de inicio y fin
- Actualiza la información del periodo

#### 1.3 Cambiar Estado
- **Activar:** Cambia de BORRADOR o CERRADO a ACTIVO
- **Cerrar:** Cambia de ACTIVO a CERRADO
- Los periodos ACTIVOS son visibles para usuarios externos

#### 1.4 Eliminar Periodo
- Eliminación de periodos (con confirmación)
- Validación de dependencias antes de eliminar

#### 1.5 Filtros de Periodos
- **Por Estado:** TODOS, ACTIVO, CERRADO
- **Por Año:** Filtro por año específico
- Los filtros se aplican automáticamente al cambiar

### 2. Gestión de Solicitudes

El sistema permite revisar y gestionar solicitudes de turnos:

#### 2.1 Visualización de Solicitudes
- Lista todas las solicitudes de todas las IPRESS
- Muestra información de la IPRESS solicitante
- Indica el periodo asociado
- Muestra el estado actual de la solicitud

#### 2.2 Filtros de Solicitudes
- **Por Estado:** TODAS, ENVIADO, INICIADO, APROBADA, RECHAZADA
- **Por Periodo:** Filtrar por periodo específico
- **Por Búsqueda:** Buscar por nombre o código de IPRESS
- **Por Macrorregión:** Filtrar por macrorregión
- **Por Red:** Filtrar por red asistencial
- **Por IPRESS:** Filtrar por IPRESS específica

#### 2.3 Revisión de Solicitudes
- Ver detalle completo de la solicitud
- Revisar especialidades solicitadas
- Ver turnos configurados por especialidad
- Ver fechas asignadas

#### 2.4 Aprobar Solicitud
- Aprobar solicitudes enviadas
- Requiere confirmación del coordinador
- Cambia estado a APROBADA

#### 2.5 Rechazar Solicitud
- Rechazar solicitudes con motivo
- El motivo es obligatorio
- Cambia estado a RECHAZADA
- El motivo se registra en el sistema

---

## 🔧 Componentes Utilizados

### Componentes Principales

1. **TabPeriodos:** Tabla de gestión de periodos
   - Ubicación: `./components/TabPeriodos.jsx`
   - Funcionalidades:
     - Lista periodos con filtros
     - Acciones: Activar/Cerrar, Editar, Eliminar
     - Ordenamiento por columnas
     - Estadísticas de ocupación

2. **TabSolicitudes:** Tabla de gestión de solicitudes
   - Ubicación: `./components/TabSolicitudes.jsx`
   - Funcionalidades:
     - Lista solicitudes con filtros avanzados
     - Acciones: Ver detalle, Aprobar, Rechazar
     - Búsqueda por IPRESS

3. **ModalAperturarPeriodo:** Modal para crear periodo
   - Ubicación: `./components/ModalAperturarPeriodo.jsx`
   - Campos:
     - Código del periodo
     - Descripción
     - Fecha de inicio
     - Fecha de fin

4. **ModalEditarPeriodo:** Modal para editar periodo
   - Ubicación: `./components/ModalEditarPeriodo.jsx`
   - Solo permite editar fechas
   - Validación: Solo periodos ACTIVOS

5. **ModalConfirmarEliminacion:** Modal de confirmación
   - Ubicación: `./components/ModalConfirmarEliminacion.jsx`
   - Muestra información del periodo a eliminar
   - Requiere confirmación explícita

6. **ModalDetalleSolicitud:** Modal de detalle de solicitud
   - Ubicación: `./components/ModalDetalleSolicitud.jsx`
   - Muestra información completa:
     - Datos de la IPRESS
     - Periodo asociado
     - Especialidades solicitadas
     - Turnos por especialidad
     - Fechas configuradas
   - Acciones: Aprobar, Rechazar

7. **CardStat:** Tarjetas de estadísticas
   - Ubicación: `./components/CardStat.jsx`
   - Muestra métricas visuales

### Utilidades

- **ui.js:** Funciones auxiliares
  - `fmtDate()`: Formatea fechas
  - `safeNum()`: Convierte a número de forma segura
  - `getEstadoBadgeDefault()`: Retorna badge según estado

---

## 📡 Servicios y Endpoints

### Servicios Utilizados

1. **periodoSolicitudService** (`../../../../services/periodoSolicitudService`)
   - `obtenerTodos()`: Obtiene todos los periodos
   - `obtenerConFiltros(filtros)`: Obtiene periodos filtrados
   - `obtenerAniosDisponibles()`: Lista años disponibles
   - `crear(periodoData)`: Crea nuevo periodo
   - `actualizarFechas(idPeriodo, fechas)`: Actualiza fechas del periodo
   - `cambiarEstado(idPeriodo, estado)`: Cambia estado del periodo
   - `eliminar(idPeriodo)`: Elimina periodo

2. **solicitudTurnosService** (`../../../../services/solicitudTurnosService`)
   - `obtenerTodas(filtros)`: Obtiene todas las solicitudes (con filtros)
   - `obtenerPorId(id)`: Obtiene detalle de solicitud
   - `aprobarSolicitud(id)`: Aprueba una solicitud
   - `rechazarSolicitud(id, motivo)`: Rechaza una solicitud con motivo

### Endpoints Principales

#### Periodos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/periodos-solicitud` | Lista todos los periodos |
| GET | `/periodos-solicitud/filtros` | Lista periodos con filtros |
| GET | `/periodos-solicitud/anios` | Lista años disponibles |
| POST | `/periodos-solicitud` | Crea nuevo periodo |
| PUT | `/periodos-solicitud/{id}/fechas` | Actualiza fechas |
| PUT | `/periodos-solicitud/{id}/estado` | Cambia estado |
| DELETE | `/periodos-solicitud/{id}` | Elimina periodo |

#### Solicitudes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/solicitudes-turno` | Lista todas las solicitudes |
| GET | `/solicitudes-turno/{id}` | Obtiene detalle de solicitud |
| PUT | `/solicitudes-turno/{id}/aprobar` | Aprueba solicitud |
| PUT | `/solicitudes-turno/{id}/rechazar` | Rechaza solicitud |

---

## 🔄 Flujo de Trabajo

### 1. Crear y Gestionar Periodo

1. **Crear Periodo:**
   - Coordinador hace clic en "Aperturar Periodo"
   - Completa formulario: código, descripción, fechas
   - Guarda el periodo (estado: BORRADOR)

2. **Activar Periodo:**
   - Coordinador activa el periodo desde la tabla
   - El periodo queda disponible para usuarios externos
   - Estado cambia a ACTIVO

3. **Editar Periodo:**
   - Solo periodos ACTIVOS pueden editarse
   - Se pueden modificar fechas de inicio y fin
   - Los cambios se reflejan inmediatamente

4. **Cerrar Periodo:**
   - Coordinador cierra el periodo cuando finaliza
   - Estado cambia a CERRADO
   - Ya no está disponible para nuevas solicitudes

5. **Eliminar Periodo:**
   - Solo si no tiene solicitudes asociadas
   - Requiere confirmación
   - Eliminación permanente

### 2. Revisar y Gestionar Solicitudes

1. **Ver Lista de Solicitudes:**
   - Coordinador accede a la pestaña "Solicitudes"
   - Ve todas las solicitudes enviadas
   - Puede aplicar filtros para encontrar solicitudes específicas

2. **Revisar Detalle:**
   - Hace clic en "Ver" en una solicitud
   - Se abre modal con información completa:
     - Datos de la IPRESS
     - Periodo asociado
     - Especialidades y turnos solicitados
     - Fechas configuradas

3. **Aprobar Solicitud:**
   - Coordinador revisa la solicitud
   - Si está conforme, hace clic en "Aprobar"
   - Confirma la acción
   - Estado cambia a APROBADA

4. **Rechazar Solicitud:**
   - Coordinador puede rechazar con motivo
   - Debe ingresar motivo obligatorio
   - Estado cambia a RECHAZADA
   - El motivo queda registrado

5. **Rechazo Rápido:**
   - Botón "Rechazar" en la tabla abre modal con campo de motivo pre-focus
   - Facilita el rechazo rápido de solicitudes

---

## 💾 Estructura de Datos

### Periodo

```javascript
{
  idPeriodo: number,
  periodo: string,  // Código del periodo
  descripcion: string,
  fechaInicio: string,  // ISO date
  fechaFin: string,  // ISO date
  estado: "BORRADOR" | "ACTIVO" | "CERRADO",
  totalTurnos?: number,
  turnosAsignados?: number,
  ocupacion?: number  // Porcentaje
}
```

### Solicitud

```javascript
{
  idSolicitud: number,
  idPeriodo: number,
  codIpress: string,
  nombreIpress: string,
  estado: "INICIADO" | "ENVIADO" | "APROBADA" | "RECHAZADA",
  totalTurnosSolicitados: number,
  totalEspecialidades: number,
  fechaCreacion: string,
  fechaEnvio: string,
  detalles: [
    {
      idDetalle: number,
      idServicio: number,
      descServicio: string,
      turnoManana: number,
      turnoTarde: number,
      tc: boolean,
      tl: boolean,
      fechasDetalle: [
        {
          fecha: string,
          bloque: "MANANA" | "TARDE"
        }
      ]
    }
  ]
}
```

### Payload para Crear Periodo

```javascript
{
  periodo: string,  // Código
  descripcion: string,
  fechaInicio: string,  // ISO date
  fechaFin: string  // ISO date
}
```

### Payload para Actualizar Fechas

```javascript
{
  fechaInicio: string,  // ISO date
  fechaFin: string  // ISO date
}
```

### Payload para Rechazar

```javascript
{
  motivo: string  // Motivo del rechazo (obligatorio)
}
```

---

## 🎨 Interfaz de Usuario

### Pestañas

El sistema utiliza un sistema de pestañas:

1. **Pestaña "Periodos":**
   - Color activo: Verde (`border-green-600`)
   - Muestra tabla de periodos
   - Estadísticas: Total, Activos, Cerrados, Borradores

2. **Pestaña "Solicitudes":**
   - Color activo: Azul (`border-blue-600`)
   - Muestra tabla de solicitudes
   - Estadísticas: Total, Enviadas, Iniciadas

### Tarjetas de Estadísticas

- **Periodos:**
  - Total: Azul
  - Activos: Verde
  - Cerrados: Naranja
  - Borradores: Púrpura

- **Solicitudes:**
  - Total: Azul
  - Enviadas: Verde
  - Iniciadas: Naranja

### Badges de Estado

Los estados se muestran con badges de colores:
- **BORRADOR:** Gris/Púrpura
- **ACTIVO:** Verde
- **CERRADO:** Naranja/Gris
- **INICIADO:** Amarillo/Naranja
- **ENVIADO:** Azul
- **APROBADA:** Verde
- **RECHAZADA:** Rojo

---

## ⚠️ Validaciones

### Validaciones de Periodos

1. **Crear Periodo:**
   - Código es obligatorio
   - Descripción es obligatoria
   - Fecha de inicio debe ser anterior a fecha de fin
   - Las fechas deben ser válidas

2. **Editar Periodo:**
   - Solo periodos ACTIVOS pueden editarse
   - Fecha de inicio debe ser anterior a fecha de fin

3. **Eliminar Periodo:**
   - No debe tener solicitudes asociadas
   - Requiere confirmación

### Validaciones de Solicitudes

1. **Aprobar:**
   - Requiere confirmación del usuario
   - Solo solicitudes ENVIADAS pueden aprobarse

2. **Rechazar:**
   - Motivo es obligatorio
   - Solo solicitudes ENVIADAS pueden rechazarse

---

## 🔐 Permisos y Seguridad

- Solo usuarios con rol COORDINADOR pueden acceder
- Los coordinadores pueden ver todas las solicitudes
- Las acciones requieren confirmación cuando son críticas
- Los cambios se registran con información del usuario

---

## 📊 Estadísticas y Métricas

### Estadísticas de Periodos

- **Total de Periodos:** Contador total
- **Periodos Activos:** Periodos en estado ACTIVO
- **Periodos Cerrados:** Periodos en estado CERRADO
- **Borradores:** Periodos en estado BORRADOR
- **Ocupación:** Porcentaje de turnos asignados vs disponibles

### Estadísticas de Solicitudes

- **Total de Solicitudes:** Contador total
- **Solicitudes Enviadas:** Solicitudes pendientes de revisión
- **Solicitudes Iniciadas:** Solicitudes en borrador

---

## 🔄 Sincronización y Recarga

### Recarga Automática

- Al cambiar de pestaña se recargan los datos
- Al aplicar filtros se recargan los datos
- Después de crear/editar/eliminar periodo se recargan los datos
- Después de aprobar/rechazar solicitud se recargan los datos

### Estados de Carga

- Indicadores de carga durante operaciones asíncronas
- Mensajes de error en caso de fallos
- Confirmaciones de éxito para operaciones críticas

---

## 🐛 Manejo de Errores

- Errores de red se muestran mediante alertas
- Errores de validación se muestran en los modales
- Los errores del backend se capturan y muestran al usuario
- Los estados de carga se manejan con spinners

---

## 📝 Notas Técnicas

### Filtros Dinámicos

Los filtros se aplican automáticamente:
- Filtros de periodos se aplican al cambiar valores
- Filtros de solicitudes requieren clic en "Consultar"
- La búsqueda de texto se aplica en tiempo real

### Ordenamiento

- La tabla de periodos permite ordenar por columnas
- Click en encabezado de columna para ordenar
- Indicador visual de columna ordenada y dirección

### Modal de Rechazo Rápido

- El botón "Rechazar" en la tabla abre modal con `prefillRechazo=true`
- El campo de motivo recibe focus automáticamente
- Facilita el rechazo rápido de múltiples solicitudes

---

## 📚 Referencias

- **Servicios:** 
  - `src/services/periodoSolicitudService.js`
  - `src/services/solicitudTurnosService.js`
- **Componentes:** `src/pages/roles/coordinador/gestion-periodos/components/`
- **Utilidades:** `src/pages/roles/coordinador/gestion-periodos/utils/ui.js`

---

## 🔄 Relación con Otros Módulos

### Módulo de Solicitudes Externas

- Los periodos ACTIVOS son visibles en el formulario de solicitudes externas
- Las solicitudes creadas por usuarios externos aparecen aquí para revisión

### Módulo de IPRESS

- La información de IPRESS se obtiene del módulo de gestión de IPRESS
- Los filtros de macrorregión y red utilizan datos del módulo de IPRESS

---

**Última actualización:** 2025-01-27
