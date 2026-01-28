# 📋 ERRORES DE IMPORTACIÓN - Módulo Bolsas v2.1.0

> **Fecha:** 2026-01-28
> **Versión:** v2.1.0
> **Status:** ✅ Implementado y Documentado
> **Descripción:** Sistema de auditoría y visualización de errores de importación Excel

---

## 🎯 Overview

Sistema completo para registrar, auditar y visualizar todos los errores que ocurran durante la importación de archivos Excel en el módulo de Bolsas. Proporciona una página dedicada para que los administradores revisen y corrijan errores.

---

## 📊 Arquitectura de Errores

```
┌────────────────────────────────────────────────────────────────┐
│            FLUJO DE AUDITORÍA DE ERRORES v2.1.0                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1️⃣ USUARIO CARGA EXCEL                                        │
│  └─ CargarDesdeExcel.jsx → Envía FormData al backend          │
│                                                                │
│  2️⃣ CONTROLLER CREA HISTORIAL                                  │
│  └─ SolicitudBolsaController                                   │
│     ├─ Crea registro en dim_historial_carga_bolsas            │
│     ├─ Estado: PROCESANDO                                      │
│     └─ Obtiene idHistorial para vincular errores               │
│                                                                │
│  3️⃣ SERVICIO PROCESA FILAS                                     │
│  └─ SolicitudBolsaServiceImpl                                   │
│     ├─ Valida cada fila de Excel                              │
│     ├─ Comprueba duplicados                                    │
│     ├─ Si hay error → guardarErrorEnAuditoria()               │
│     │  └─ INSERT en audit_errores_importacion_bolsa           │
│     └─ Si OK → Inserta en dim_solicitud_bolsa                │
│                                                                │
│  4️⃣ CONTROLLER ACTUALIZA HISTORIAL                             │
│  └─ Marca como PROCESADO                                       │
│     ├─ Status: PROCESADO o ERROR                              │
│     ├─ Cantidad filas procesadas                              │
│     └─ Errores encontrados                                     │
│                                                                │
│  5️⃣ USUARIO REVISA ERRORES                                     │
│  └─ ErroresImportacion.jsx                                     │
│     ├─ Obtiene errores del endpoint                           │
│     ├─ Filtra por tipo de error                               │
│     ├─ Ve detalle de cada error                               │
│     └─ Descarga reporte CSV                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Tablas de Auditoría

### 1. `dim_historial_carga_bolsas` (Histórico)

```sql
CREATE TABLE dim_historial_carga_bolsas (
  id_carga BIGSERIAL PRIMARY KEY,
  nombre_archivo VARCHAR(255),
  estado VARCHAR(20),  -- PROCESANDO | PROCESADO | ERROR
  cantidad_filas INTEGER,
  filas_exitosas INTEGER,
  filas_error INTEGER,
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  usuario_carga VARCHAR(255),
  activo BOOLEAN DEFAULT true
);
```

### 2. `audit_errores_importacion_bolsa` (NUEVO v2.1.0)

```sql
CREATE TABLE audit_errores_importacion_bolsa (
  id_error BIGSERIAL PRIMARY KEY,
  id_carga_historial BIGINT NOT NULL REFERENCES dim_historial_carga_bolsas(id_carga),
  numero_fila INTEGER NOT NULL,
  dni_paciente VARCHAR(20),
  nombre_paciente VARCHAR(255),
  especialidad VARCHAR(255),
  ipress VARCHAR(20),
  tipo_error VARCHAR(50) NOT NULL,  -- DUPLICADO|VALIDACION|CONSTRAINT|OTRO
  descripcion_error TEXT NOT NULL,
  datos_excel_json JSONB,  -- Todos los 11 campos del Excel
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_id_carga (id_carga_historial),
  INDEX idx_tipo_error (tipo_error),
  INDEX idx_fecha (fecha_creacion)
);
```

---

## 🔴 Tipos de Errores Registrados

### 1. DUPLICADO (⚠️ Amarillo)

**Descripción:** La solicitud ya existe (misma bolsa + paciente + servicio)

**Ejemplo:**
```
Tipo: DUPLICADO
Descripción: Solicitud duplicada. Ya existe:
Bolsa: "Bolsa Pediatría", Paciente: 12345678, Servicio: "PEDIATRÍA"
ID Solicitud anterior: 4521
```

**Acción:** Usuario verifica si es intencional, puede actualizar o eliminar anterior

---

### 2. VALIDACION (❌ Rojo)

**Descripción:** Error en validación de datos Excel

**Ejemplos:**
```
❌ Campo requerido faltante: paciente_id
❌ Formato inválido: fecha_nacimiento (esperado: YYYY-MM-DD)
❌ Código IPRESS inválido: "999" no existe en dim_ipress
❌ Especialidad no encontrada: "DENTISTA_ESPECIAL"
❌ Tipo de documento inválido: "XYZ"
```

**Acción:** Usuario corrige los datos en Excel y reimporta

---

### 3. CONSTRAINT (🔴 Naranja)

**Descripción:** Error de integridad referencial en la BD

**Ejemplos:**
```
🔴 Foreign Key error: id_bolsa no existe en dim_tipos_bolsas
🔴 Foreign Key error: id_ipress no existe en dim_ipress
🔴 Violación de UNIQUE constraint: numero_solicitud ya existe
🔴 Campo requerido NULL: paciente_nombre
```

**Acción:** Verificar integridad de datos y tablas referenciadas

---

### 4. OTRO (❓ Gris)

**Descripción:** Errores no categorizados

**Ejemplo:**
```
❓ Error inesperado: java.lang.NullPointerException en línea 45
```

**Acción:** Revisar logs del servidor para más detalles

---

## 🎨 Página Frontend: ErroresImportacion.jsx (v1.0.0)

### Estructura

```
┌─────────────────────────────────────────────────────────────┐
│  PÁGINA: Errores de Importación                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STATS (Cards superiores)                                   │
│  ├─ Total Errores: 45                                      │
│  ├─ ⚠️ Duplicados: 12                                       │
│  ├─ 🔴 Constraints: 18                                      │
│  └─ ❌ Validación: 15                                       │
│                                                             │
│  FILTROS                                                    │
│  ├─ 🔍 Búsqueda (DNI, Paciente, IPRESS, Especialidad)    │
│  ├─ Tipo de Error [Todos ▼]                               │
│  └─ 📥 Descargar Reporte CSV                               │
│                                                             │
│  TABLA DE ERRORES                                           │
│  │ Fila │ Tipo Error      │ Paciente (DNI)     │ Especialidad │ IPRESS │ Descripción       │ Acciones      │
│  ├──────┼─────────────────┼────────────────────┼──────────────┼────────┼───────────────────┼───────────────┤
│  │ 23   │ ⚠️ DUPLICADO    │ Juan García (123)  │ PEDIATRÍA    │ 021    │ Ya existe solicitud│ 👁 Ver Detalle│
│  │ 45   │ ❌ VALIDACION   │ María López (456)  │ CARDIOLOGÍA  │ 349    │ Email inválido    │ 👁 Ver Detalle│
│  │ 67   │ 🔴 CONSTRAINT   │ Carlos Pérez (789) │ NEUROLOGÍA   │ 567    │ FK id_bolsa fail  │ 👁 Ver Detalle│
│  └──────┴─────────────────┴────────────────────┴──────────────┴────────┴───────────────────┴───────────────┘
│                                                             │
│  MODAL DE DETALLE (Al hacer click)                          │
│  ├─ Tipo Error: DUPLICADO ⚠️                               │
│  ├─ Paciente: Juan García                                   │
│  ├─ DNI: 12345678                                           │
│  ├─ Especialidad: PEDIATRÍA                                 │
│  ├─ IPRESS: 021 (H.II PUCALLPA)                            │
│  ├─ Fila Excel: #23                                         │
│  ├─ Descripción del Error: [Texto completo]                │
│  └─ Datos del Excel (JSON):                                 │
│     { "pacienteId": "12345678", "nombre": "Juan García",... }
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Funcionalidades

1. **Stats Cards:**
   - Total errores con contador
   - Contadores por tipo de error (color-coded)

2. **Filtros:**
   - Búsqueda full-text (DNI, Paciente, IPRESS, Especialidad)
   - Dropdown "Tipo de Error" con opciones: Todos, Duplicado, Validación, Constraint, Otro
   - Botón "Descargar Reporte" exporta CSV

3. **Tabla de Errores:**
   - Columnas: Fila, Tipo Error, Paciente, Especialidad, IPRESS, Descripción, Acciones
   - Colores por tipo de error
   - Botón "Ver Detalle" abre modal

4. **Modal de Detalle:**
   - Muestra información completa del error
   - Datos del Excel en JSON formateado
   - Posibilidad de copiar/usar datos para corregir

---

## 🔌 Backend Endpoints (v2.1.0)

### GET /api/bolsas/errores-importacion

**Descripción:** Obtiene todos los errores de importación registrados

**Respuesta:**
```json
[
  {
    "idError": 1,
    "idCargaHistorial": 105,
    "numeroFila": 23,
    "pacienteDni": "12345678",
    "nombrePaciente": "Juan García López",
    "especialidad": "PEDIATRÍA",
    "ipress": "021",
    "tipoError": "DUPLICADO",
    "descripcionError": "Solicitud duplicada. Bolsa: Bolsa Pediatría, Paciente: 12345678, Servicio: 98",
    "datosExcelJson": {
      "pacienteId": "12345678",
      "nombre": "Juan García",
      "tipoCita": "VOLUNTARIA",
      "especialidad": "PEDIATRÍA",
      ...
    },
    "fechaCreacion": "2026-01-28T10:30:45.123Z"
  },
  ...
]
```

---

### GET /api/bolsas/errores-importacion/exportar

**Descripción:** Exporta errores en formato CSV

**Response Body:** File CSV con columnas:
```
Fila,DNI,Paciente,Especialidad,IPRESS,TipoError,Descripción,FechaCreación
23,12345678,Juan García,PEDIATRÍA,021,DUPLICADO,Ya existe,2026-01-28 10:30
45,98765432,María López,CARDIOLOGÍA,349,VALIDACION,Email inválido,2026-01-28 11:15
...
```

---

## 🔧 Backend Implementation

### SolicitudBolsaController (v1.20.0)

**Cambios:**
```java
@PostMapping("/importar/excel")
public ResponseEntity<Map<String, Object>> importarDesdeExcel(
    @RequestParam("archivo") MultipartFile archivo,
    @RequestParam("idTipoBolsa") Long idTipoBolsa,
    @RequestParam("idServicio") Long idServicio) {

  // NUEVO: Crear historial ANTES de procesar
  DimHistorialCargaBolsas historial = new DimHistorialCargaBolsas();
  historial.setNombreArchivo(archivo.getOriginalFilename());
  historial.setEstado("PROCESANDO");
  historial.setFechaInicio(LocalDateTime.now());
  historial = historialRepository.save(historial);
  Long idHistorial = historial.getIdCarga();

  // Procesar Excel pasando idHistorial
  ImportResult resultado = solicitudBolsaService.importarDesdeExcel(
    archivo, idTipoBolsa, idServicio, idHistorial  // NUEVO parámetro
  );

  // Actualizar historial con resultados
  historial.setEstado("PROCESADO");
  historial.setCantidadFilas((int)resultado.getTotal());
  historial.setFilasExitosas((int)resultado.getExitosas());
  historial.setFilasError((int)resultado.getErrores());
  historial.setFechaFin(LocalDateTime.now());
  historialRepository.save(historial);

  return ResponseEntity.ok(resultado);
}
```

### SolicitudBolsaServiceImpl (v1.18.3+)

**Nuevo método:**
```java
private void guardarErrorEnAuditoria(
    Long idHistorial,
    int numeroFila,
    SolicitudBolsaExcelRowDTO rowDTO,
    String tipoError,
    String descripcionError,
    SolicitudBolsa solicitud) {

  AuditErrorImportacion error = new AuditErrorImportacion();
  error.setIdCargaHistorial(idHistorial);
  error.setNumeroFila(numeroFila);
  error.setPacienteDni(rowDTO.getPacienteId());
  error.setNombrePaciente(rowDTO.getPacienteNombre());
  error.setEspecialidad(rowDTO.getEspecialidad());
  error.setIpress(rowDTO.getCodigoIpress());
  error.setTipoError(tipoError);
  error.setDescripcionError(descripcionError);
  error.setDatosExcelJson(convertRowToJson(rowDTO));
  error.setFechaCreacion(LocalDateTime.now());

  auditErrorRepository.save(error);
}
```

**Puntos de llamada:**
```java
// Duplicado
if (infoDuplicado != null) {
  guardarErrorEnAuditoria(idHistorial, filaNumero, rowDTO,
    "DUPLICADO", infoDuplicado.get("razon"), solicitud);
  continue;
}

// Validación
catch (ValidationException e) {
  guardarErrorEnAuditoria(idHistorial, filaNumero, rowDTO,
    "VALIDACION", e.getMessage(), null);
  continue;
}

// Constraint
catch (DataIntegrityViolationException e) {
  String mensaje = manejarErrorIntegridad(filaNumero, rowDTO, e);
  guardasErrorEnAuditoria(idHistorial, filaNumero, rowDTO,
    "CONSTRAINT", mensaje, solicitud);
}
```

---

## 📋 Service Layer

### AuditErrorImportacionService (Nuevo)

```java
@Service
@Transactional(readOnly = true)
public class AuditErrorImportacionServiceImpl implements AuditErrorImportacionService {

  @Autowired
  private AuditErrorImportacionRepository repository;

  /**
   * Obtiene todos los errores de importación
   */
  public List<AuditErrorImportacionDTO> obtenerTodos() {
    return repository.findAll()
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  /**
   * Obtiene errores filtrados
   */
  public List<AuditErrorImportacionDTO> obtenerPorTipoError(String tipoError) {
    return repository.findByTipoError(tipoError)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  /**
   * Exporta a CSV
   */
  public byte[] exportarCSV() {
    List<AuditErrorImportacionDTO> errores = obtenerTodos();
    StringBuffer csv = new StringBuffer();
    csv.append("Fila,DNI,Paciente,Especialidad,IPRESS,TipoError,Descripción,FechaCreación\n");

    for (AuditErrorImportacionDTO error : errores) {
      csv.append(String.format("%d,%s,%s,%s,%s,%s,\"%s\",%s\n",
        error.getNumeroFila(),
        error.getPacienteDni(),
        error.getNombrePaciente(),
        error.getEspecialidad(),
        error.getIpress(),
        error.getTipoError(),
        error.getDescripcionError(),
        error.getFechaCreacion()
      ));
    }

    return csv.toString().getBytes(StandardCharsets.UTF_8);
  }

  private AuditErrorImportacionDTO toDTO(AuditErrorImportacion entity) {
    return AuditErrorImportacionDTO.builder()
      .idError(entity.getIdError())
      .idCargaHistorial(entity.getIdCargaHistorial())
      .numeroFila(entity.getNumeroFila())
      .pacienteDni(entity.getPacienteDni())
      .nombrePaciente(entity.getNombrePaciente())
      .especialidad(entity.getEspecialidad())
      .ipress(entity.getIpress())
      .tipoError(entity.getTipoError())
      .descripcionError(entity.getDescripcionError())
      .datosExcelJson(entity.getDatosExcelJson())
      .fechaCreacion(entity.getFechaCreacion())
      .build();
  }
}
```

---

## 🎯 Frontend Integration

### Ubicación en Menú

```
Bolsas de Pacientes
├─ Cargar desde Excel
├─ Solicitudes
├─ ✨ Errores de Importación (NUEVO)
├─ Estadísticas de Bolsas
└─ Historial de Bolsas
```

### Componente ErroresImportacion.jsx

**Props:** Ninguno (obtiene datos del endpoint)

**State:**
- `errores` - Array de errores obtenidos
- `isLoading` - Indicador de carga
- `searchTerm` - Término de búsqueda
- `filtroTipoError` - Filtro por tipo de error
- `selectedRow` - Fila seleccionada para modal
- `modalDetalle` - Mostrar/ocultar modal

**Métodos:**
- `cargarErrores()` - Obtiene errores del endpoint
- `erroresFiltrados` - Filtra errores según criterios
- `getErrorStyle()` - Retorna estilos por tipo de error
- `descargarReporte()` - Descarga CSV

---

## 📊 Flujo de Datos Completo

```
1. Usuario carga Excel en CargarDesdeExcel.jsx
   ↓
2. FormData enviado a POST /api/bolsas/importar/excel
   ↓
3. SolicitudBolsaController:
   - Crea registro en dim_historial_carga_bolsas
   - Obtiene idHistorial
   - Llama a servicio con idHistorial
   ↓
4. SolicitudBolsaServiceImpl:
   - Itera cada fila del Excel
   - Por cada error detectado:
     - Llama guardarErrorEnAuditoria()
     - INSERT en audit_errores_importacion_bolsa
   ↓
5. Controller actualiza historial con resultados
   ↓
6. Usuario accede a ErroresImportacion.jsx
   ↓
7. Página llama GET /api/bolsas/errores-importacion
   ↓
8. Backend retorna lista de errores
   ↓
9. Usuario ve errores en tabla, filtra, ve detalles
   ↓
10. Si desea, descarga reporte CSV
```

---

## ✅ Beneficios

1. **Auditoría Completa** - Todos los errores quedan registrados permanentemente
2. **Trazabilidad** - Errores vinculados a importación específica (idHistorial)
3. **Categorización Clara** - Tipos de error definidos y color-coded
4. **Datos JSON** - Cada fila del Excel guardada para debugging
5. **Reporte Descargable** - CSV para análisis en Excel
6. **Sin Pérdida de Datos** - Respuesta HTTP rápida + auditoría en BD
7. **Corrección Facilitada** - Usuario ve exactamente qué falló y dónde

---

## 🚀 Próximas Mejoras (v2.2.0+)

- [ ] Filtro por rango de fechas
- [ ] Filtro por ID historial de carga
- [ ] Re-procesamiento de filas (botón en modal)
- [ ] Búsqueda por tipo de error combinada
- [ ] Gráficos de distribución de errores (por fecha, tipo, IPRESS)
- [ ] Email notificando errores críticos
- [ ] Integración con slack/teams para alertas

---

**Versión:** v2.1.0
**Estado:** ✅ Implementado
**Fecha:** 2026-01-28
**Desarrollador:** Ing. Styp Canto Rondón
