# API REST - Endpoints CENATE

> Documentacion completa de endpoints del sistema

---

## Configuracion Base

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer {token}  // Para endpoints protegidos
```

---

## Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con username/password |
| PUT | `/api/auth/change-password` | Cambiar contrasena |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/auth/completar-primer-acceso` | Completar primer login |
| POST | `/api/auth/solicitar-reset-contrasena` | Solicitar reset password |

### Login Request
```json
POST /api/auth/login
{
  "username": "44914706",
  "password": "@Cenate2025"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "44914706",
  "roles": ["SUPERADMIN"],
  "permisos": [...]
}
```

---

## Usuarios

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar todos |
| GET | `/api/usuarios/id/{id}` | Obtener por ID |
| POST | `/api/usuarios/crear` | Crear usuario |
| POST | `/api/usuarios/crear-con-roles` | Crear con roles (SUPERADMIN) |
| PUT | `/api/usuarios/id/{id}` | Actualizar |
| DELETE | `/api/usuarios/id/{id}` | Eliminar |
| PUT | `/api/usuarios/id/{id}/activate` | Activar |
| PUT | `/api/usuarios/id/{id}/deactivate` | Desactivar |
| PUT | `/api/usuarios/id/{id}/unlock` | Desbloquear |

### Gestion de Activaciones

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/admin/usuarios/pendientes-activacion` | Listar pendientes |
| POST | `/api/admin/usuarios/{id}/reenviar-activacion` | Reenviar email |
| DELETE | `/api/admin/usuarios/{id}/pendiente-activacion` | Eliminar pendiente |

### Datos Huerfanos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/admin/datos-huerfanos/{numDocumento}` | Verificar datos |
| DELETE | `/api/admin/datos-huerfanos/{numDocumento}` | Limpiar datos |

---

## Personal

> Gestión unificada de personal CNT (interno) y personal externo

| Método | Endpoint | Roles Permitidos | Descripción |
|--------|----------|------------------|-------------|
| GET | `/api/personal` | SUPERADMIN, ADMIN | Listar todo el personal (CNT + Externo) |
| POST | `/api/personal/crear` | SUPERADMIN, ADMIN | Crear personal (detecta automáticamente CNT/Externo) |
| GET | `/api/personal/cnt` | SUPERADMIN, ADMIN | Listar solo personal CNT |
| GET | `/api/personal/externo` | SUPERADMIN, ADMIN | Listar solo personal externo |
| GET | `/api/personal/buscar/{numeroDocumento}` | SUPERADMIN, ADMIN | Buscar por número de documento |

### Listar Todo el Personal Response

```json
GET /api/personal

[
  {
    "idPersonal": 308,
    "nombres": "LUZ MILAGROS",
    "apellidoPaterno": "HUAMAN",
    "apellidoMaterno": "RODRIGUEZ",
    "numeroDocumento": "47136505",
    "tipoDocumento": "DNI",
    "fechaNacimiento": "1985-03-15",
    "edad": 39,
    "mesCumpleanos": "Marzo",
    "cumpleanosEsteAnio": "2026-03-15",
    "genero": "F",
    "correoInstitucional": "lhuaman@essalud.gob.pe",
    "correoPersonal": "luz.huaman@gmail.com",
    "telefono": "987654321",
    "direccion": "Av. Grau 123",
    "fotoUrl": "/uploads/personal/47136505.jpg",
    "idDistrito": 15,
    "nombreDistrito": "SAN ISIDRO",
    "nombreProvincia": "LIMA",
    "nombreDepartamento": "LIMA",
    "idIpress": 1,
    "nombreIpress": "CENTRO NACIONAL DE TELEMEDICINA",
    "idArea": 3,
    "nombreArea": "Medicina",
    "idRegimen": 2,
    "nombreRegimen": "CAS",
    "codigoPlanilla": "CAS2024001",
    "estado": "ACTIVO",
    "colegiatura": "12345",
    "idUsuario": 277,
    "username": "47136505",
    "rolUsuario": "MEDICO",
    "tipoPersonalDetalle": "MEDICO",
    "profesion": "Medicina General",
    "especialidad": "Cardiología",
    "rneEspecialidad": "RNE123456",
    "tipoPersonal": "INTERNO",
    "institucion": null
  }
]
```

### Notas Importantes

- **Campo `username`**: Agregado en v1.15.1 para facilitar búsquedas en el frontend
- **Fuente de datos**: Vista `vw_personal_total` que une `dim_personal_cnt`, `dim_usuarios` y tablas relacionadas
- **Tipo Personal**:
  - `INTERNO`: Personal de CENATE
  - `EXTERNO`: Personal de otras IPRESS
- **Estado**: `ACTIVO`, `INACTIVO`, `BLOQUEADO`

---

## MBAC (Control de Acceso Modular)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/mbac/modulos` | Listar modulos |
| POST | `/api/mbac/modulos` | Crear modulo |
| GET | `/api/mbac/paginas` | Listar paginas |
| POST | `/api/mbac/paginas` | Crear pagina |
| GET | `/api/mbac/roles` | Listar roles |
| GET/POST/PUT/DELETE | `/api/mbac/permisos-rol-modulo` | CRUD permisos modulo |
| GET/POST/PUT/DELETE | `/api/mbac/permisos-rol-pagina` | CRUD permisos pagina |
| GET | `/api/menu-usuario/usuario/{userId}` | Menu dinamico del usuario |

---

## ChatBot de Citas

### Consulta de Paciente

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{dni}` | Consultar paciente con servicios disponibles |
| GET | `/api/chatbot/atencioncenate?documento={dni}` | Listar atenciones CENATE |
| GET | `/api/chatbot/atencioncenate/buscar?documento={dni}&servicio={svc}` | Buscar por servicio |
| GET | `/api/chatbot/atencionglobal/{dni}` | Listar atenciones globales |
| GET | `/api/chatbot/atencionglobal/doc-codservicio?documento={dni}&codServicio={cod}` | Buscar por codigo |
| GET | `/api/chatbot/atencionglobal/doc-nomservicio?documento={dni}&servicio={svc}` | Buscar por nombre |

### Disponibilidad (API v2)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v2/chatbot/disponibilidad/servicio?codServicio={cod}` | Fechas disponibles |
| GET | `/api/v2/chatbot/disponibilidad/servicio-detalle?fecha_cita={fecha}&cod_servicio={cod}` | Slots horarios |

### Solicitudes de Cita

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/chatbot/solicitud` | Crear solicitud |
| PUT | `/api/v1/chatbot/solicitud/{id}` | Actualizar solicitud |
| PUT | `/api/v1/chatbot/solicitud/estado/{id}?estado={estado}` | Cambiar estado |
| GET | `/api/v1/chatbot/solicitud/{id}` | Obtener por ID |
| GET | `/api/v1/chatbot/solicitud/paciente/{dni}` | Solicitudes del paciente |

### Estados de Cita

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/chatbot/estado-cita` | Catalogo de estados |

### Reportes y Dashboard

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/chatbot/reportes/dashboard/kpis` | KPIs del dashboard |
| GET | `/api/v1/chatbot/reportes/dashboard/estado-paciente` | Distribucion por estado |
| GET | `/api/v1/chatbot/reportes/dashboard/top-servicios` | Top 10 servicios |
| GET | `/api/v1/chatbot/reportes/dashboard/evolucion` | Evolucion temporal |
| GET | `/api/v1/chatbot/reportes/dashboard/top-profesionales` | Top profesionales |
| GET | `/api/v1/chatbot/reportes/citas/buscar` | Busqueda avanzada |

### Crear Solicitud Request

```json
POST /api/v1/chatbot/solicitud
{
  "periodo": "202512",
  "docPaciente": "70073164",
  "telefono": "987654321",
  "fechaCita": "2025-12-26",
  "horaCita": "09:00:00",
  "observacion": "Primera consulta",
  "idServicio": 82,
  "idActividad": 6,
  "idSubactividad": 472,
  "idAreaHospitalaria": 1,
  "idPersonal": 171
}
```

### Busqueda Avanzada Parametros

```
GET /api/v1/chatbot/reportes/citas/buscar?
  fi=2025-12-01          # Fecha inicio (YYYY-MM-DD)
  ff=2025-12-31          # Fecha fin
  periodo=202512         # Periodo (YYYYMM)
  docPaciente=70073164   # DNI paciente
  numDocPers=12345678    # DNI profesional
  areaHosp=Consulta      # Area hospitalaria
  servicio=Medicina      # Servicio
  estadoPaciente=RESERVADO  # Estado
```

---

## Firma Digital

> Sistema de gestión de firmas digitales para personal interno CAS/728

**Documentación completa:** [`spec/01_Backend/02_modulo_firma_digital.md`](./02_modulo_firma_digital.md)

### Gestión Básica (CRUD)

| Método | Endpoint | Roles Permitidos | Descripción |
|--------|----------|------------------|-------------|
| POST | `/api/firma-digital` | SUPERADMIN, ADMIN | Crear/actualizar firma digital (UPSERT) |
| GET | `/api/firma-digital` | SUPERADMIN, ADMIN, COORDINADOR | Listar todas las firmas activas |
| GET | `/api/firma-digital/{id}` | SUPERADMIN, ADMIN, COORDINADOR | Obtener firma por ID |
| GET | `/api/firma-digital/personal/{idPersonal}` | SUPERADMIN, ADMIN, MEDICO, COORDINADOR | Obtener firma de un personal |
| DELETE | `/api/firma-digital/{id}` | SUPERADMIN, ADMIN | Eliminar firma (soft delete) |

### Entregas Pendientes

| Método | Endpoint | Roles Permitidos | Descripción |
|--------|----------|------------------|-------------|
| GET | `/api/firma-digital/pendientes` | SUPERADMIN, ADMIN, COORDINADOR | Listar entregas PENDIENTE |
| PUT | `/api/firma-digital/{id}/actualizar-entrega` | SUPERADMIN, ADMIN | Cambiar PENDIENTE → ENTREGADO |

### Reportes y Alertas

| Método | Endpoint | Roles Permitidos | Descripción |
|--------|----------|------------------|-------------|
| GET | `/api/firma-digital/proximos-vencer?dias={N}` | SUPERADMIN, ADMIN, COORDINADOR | Certificados próximos a vencer (default: 30 días) |
| GET | `/api/firma-digital/vencidos` | SUPERADMIN, ADMIN, COORDINADOR | Certificados vencidos |
| GET | `/api/firma-digital/existe/{idPersonal}` | SUPERADMIN, ADMIN, COORDINADOR | Verificar si existe firma |

### Operaciones Especiales

| Método | Endpoint | Roles Permitidos | Descripción |
|--------|----------|------------------|-------------|
| POST | `/api/firma-digital/importar-personal` | SUPERADMIN, ADMIN | Importar personal CENATE CAS/728 |

### Crear/Actualizar Firma Digital Request

```json
POST /api/firma-digital
{
  "idPersonal": 42,
  "entregoToken": true,
  "numeroSerieToken": "ABC123456789",
  "fechaEntregaToken": "2025-12-30",
  "fechaInicioCertificado": "2025-01-01",
  "fechaVencimientoCertificado": "2027-01-01",
  "observaciones": "Token entregado en ceremonia de bienvenida"
}
```

### Crear Firma Digital - PENDIENTE Request

```json
POST /api/firma-digital
{
  "idPersonal": 43,
  "entregoToken": false,
  "motivoSinToken": "PENDIENTE"
}
```

### Actualizar Entrega PENDIENTE Request

```json
PUT /api/firma-digital/{id}/actualizar-entrega
{
  "numeroSerieToken": "XYZ987654321",
  "fechaEntregaToken": "2025-12-30",
  "fechaInicioCertificado": "2025-12-30",
  "fechaVencimientoCertificado": "2027-12-30",
  "observaciones": "Token entregado posterior al registro"
}
```

### Firma Digital Response

```json
{
  "status": 200,
  "message": "Firma digital guardada exitosamente",
  "data": {
    "idFirmaPersonal": 123,
    "idPersonal": 42,
    "nombreCompleto": "Dr. Juan Perez Lopez",
    "dni": "12345678",
    "regimenLaboral": "CAS",
    "especialidad": "Cardiología",
    "nombreIpress": "CENTRO NACIONAL DE TELEMEDICINA",

    "entregoToken": true,
    "numeroSerieToken": "ABC123456789",
    "fechaEntregaToken": "2025-12-30",
    "fechaInicioCertificado": "2025-01-01",
    "fechaVencimientoCertificado": "2027-01-01",

    "motivoSinToken": null,
    "descripcionMotivo": null,

    "estadoCertificado": "VIGENTE",
    "diasRestantesVencimiento": 731,
    "venceProximamente": false,
    "esPendiente": false,

    "activo": true,
    "statFirma": "A",
    "observaciones": "Token entregado en ceremonia de bienvenida",
    "createdAt": "2025-12-30T16:45:30-05:00",
    "updatedAt": "2025-12-30T16:45:30-05:00"
  }
}
```

### Motivos Sin Token

| Código | Descripción | Requiere Fechas Certificado |
|--------|-------------|---------------------------|
| `YA_TIENE` | Ya tiene firma digital propia | ✅ Sí (del certificado existente) |
| `NO_REQUIERE` | No requiere firma digital | ❌ No |
| `PENDIENTE` | Pendiente de entrega | ❌ No (se completan después) |

### Estados de Certificado

| Estado | Descripción | Condición |
|--------|-------------|----------|
| `SIN_CERTIFICADO` | No tiene certificado registrado | `fechaVencimientoCertificado == null` |
| `VIGENTE` | Certificado válido | `fechaVencimientoCertificado >= hoy` |
| `VENCIDO` | Certificado expirado | `fechaVencimientoCertificado < hoy` |

---

## Formulario 107 (Bolsa 107)

> Sistema de importación masiva de pacientes desde archivos Excel

**Documentación completa:** [`spec/01_Backend/03_modulo_formulario_107.md`](./03_modulo_formulario_107.md)

### Gestión de Cargas

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| POST | `/api/import-excel/pacientes` | Importar archivo Excel con pacientes | ✅ Implementado |
| GET | `/api/import-excel/cargas` | Listar todas las cargas importadas | ✅ Implementado |
| GET | `/api/import-excel/pacientes/{idCarga}/datos` | Obtener items y errores de una carga | ✅ Implementado |
| DELETE | `/api/import-excel/cargas/{idCarga}` | Eliminar una carga | ✅ Implementado |
| GET | `/api/import-excel/cargas/{idCarga}/exportar` | Exportar carga a archivo Excel | ✅ Implementado |

### Importar Pacientes Request

**Content-Type:** `multipart/form-data`

```http
POST /api/import-excel/pacientes

Content-Disposition: form-data; name="file"; filename="Bolsa107_2025-12-30.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[Binary Excel data]
```

### Importar Pacientes Response (Éxito)

```json
{
  "id_carga": 42,
  "total_filas": 150,
  "filas_ok": 145,
  "filas_error": 5,
  "estado": "PROCESADO",
  "nombre_archivo": "Bolsa107_2025-12-30.xlsx",
  "hash_archivo": "a3f2c9d1e4b5a6c7..."
}
```

### Obtener Datos de Carga Response

```json
{
  "items": [
    {
      "idItem": 1001,
      "idCarga": 42,
      "fechaReporte": "2025-12-30",
      "registro": "001",
      "tipoDocumento": "DNI",
      "numeroDocumento": "12345678",
      "paciente": "PEREZ LOPEZ JUAN",
      "sexo": "M",
      "fechaNacimiento": "1980-05-15",
      "telefono": "987654321",
      "opcionIngreso": "Llamada telefónica",
      "motivoLlamada": "Consulta médica",
      "afiliacion": "TITULAR",
      "derivacionInterna": "Medicina General",
      "departamento": "LIMA",
      "provincia": "LIMA",
      "distrito": "SAN JUAN DE LURIGANCHO",
      "idEstado": 1,
      "rolAsignado": null,
      "usuarioAsignado": null,
      "observacionGestion": null
    }
  ],
  "errores": [
    {
      "idError": 501,
      "idCarga": 42,
      "registro": "015",
      "codigoError": "ERR_CAMPO_OBLIGATORIO",
      "detalleError": "Campo DNI es obligatorio",
      "columnasError": "DNI",
      "rawJson": "{\"registro\":\"015\",\"dni\":\"\",\"paciente\":\"GARCIA MARIA\",...}"
    },
    {
      "idError": 502,
      "idCarga": 42,
      "registro": "023",
      "codigoError": "ERR_SEXO_INVALIDO",
      "detalleError": "Sexo debe ser M o F",
      "columnasError": "SEXO",
      "rawJson": "{\"registro\":\"023\",\"sexo\":\"X\",\"paciente\":\"LOPEZ PEDRO\",...}"
    }
  ]
}
```

### Listar Todas las Cargas Request

```http
GET /api/import-excel/cargas
Authorization: Bearer {token}
```

### Listar Todas las Cargas Response

```json
{
  "status": 200,
  "data": [
    {
      "id_carga": 42,
      "fecha_reporte": "2025-12-30",
      "nombre_archivo": "Bolsa107_2025-12-30.xlsx",
      "total_filas": 150,
      "filas_ok": 145,
      "filas_error": 5,
      "estado_carga": "PROCESADO",
      "usuario_carga": "70073164",
      "created_at": "2025-12-30T09:30:00-05:00"
    },
    {
      "id_carga": 41,
      "fecha_reporte": "2025-12-29",
      "nombre_archivo": "Bolsa107_2025-12-29.xlsx",
      "total_filas": 200,
      "filas_ok": 198,
      "filas_error": 2,
      "estado_carga": "PROCESADO",
      "usuario_carga": "70073164",
      "created_at": "2025-12-29T10:15:00-05:00"
    }
  ],
  "message": "Lista de cargas obtenida correctamente"
}
```

### Eliminar Carga Request

```http
DELETE /api/import-excel/cargas/42
Authorization: Bearer {token}
```

### Eliminar Carga Response

```json
{
  "status": 200,
  "message": "Carga eliminada correctamente"
}
```

**Nota importante sobre eliminación:**
- La eliminación es **física** (no soft delete)
- Al eliminar una carga se eliminan también:
  - Todos los items (pacientes OK) de esa carga
  - Todos los errores de esa carga
- Se utiliza DELETE CASCADE en la base de datos

### Exportar Carga a Excel Request

```http
GET /api/import-excel/cargas/42/exportar
Authorization: Bearer {token}
```

### Exportar Carga a Excel Response

**Headers:**
```
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="bolsa_107_carga_42.xlsx"
Content-Length: 45632
```

**Body:** `[Binary Excel data]`

**Estructura del archivo Excel exportado:**

| Hoja | Contenido | Columnas |
|------|-----------|----------|
| **Pacientes Importados** | Todos los items OK de la carga | 25 columnas (REGISTRO, DNI, PACIENTE, SEXO, etc.) |
| **Errores** (condicional) | Filas con errores de validación | 5 columnas (REGISTRO, CODIGO_ERROR, DETALLE, COLUMNAS_ERROR, RAW_JSON) |

**Características del Excel:**
- ✅ Headers con formato (negrita, fondo gris)
- ✅ Columnas auto-ajustadas
- ✅ Hoja "Errores" solo si existen errores
- ✅ Formato de fecha: dd/MM/yyyy
- ✅ Compatible con Excel 2007+ (.xlsx)

### Errores de Importación

**Archivo Duplicado (HTTP 409 Conflict):**
```json
{
  "error": "Ya se cargó este archivo hoy (mismo hash)."
}
```

**Formato Inválido (HTTP 400 Bad Request):**
```json
{
  "error": "Solo se permiten archivos .xlsx"
}
```

**Columnas Incorrectas (HTTP 400 Bad Request):**
```json
{
  "error": "Columnas esperadas no encontradas. Falta: REGISTRO, DNI, ..."
}
```

### Códigos de Error Comunes

| Código | Descripción | Causa |
|--------|-------------|-------|
| `ERR_CAMPO_OBLIGATORIO` | Falta campo requerido | DNI, SEXO, etc. vacíos |
| `ERR_FORMATO_FECHA` | Fecha inválida | Formato incorrecto o fuera de rango |
| `ERR_DNI_INVALIDO` | DNI incorrecto | No tiene 8 dígitos o no es numérico |
| `ERR_SEXO_INVALIDO` | Sexo incorrecto | No es M o F |
| `ERR_DERIVACION_VACIA` | Campo vacío | DERIVACION INTERNA requerida |

### Columnas Esperadas del Excel (14 columnas)

1. REGISTRO
2. OPCIONES DE INGRESO DE LLAMADA
3. TELEFONO
4. TIPO DOCUMENTO
5. DNI
6. APELLIDOS Y NOMBRES
7. SEXO
8. FechaNacimiento
9. DEPARTAMENTO
10. PROVINCIA
11. DISTRITO
12. MOTIVO DE LA LLAMADA
13. AFILIACION
14. DERIVACION INTERNA

**Campos Obligatorios (6):**
- TIPO DOCUMENTO
- DNI
- APELLIDOS Y NOMBRES
- SEXO
- FechaNacimiento
- DERIVACION INTERNA

---

## Bolsa 107 - Gestión de Asegurado y Programación ESSI

> Sistema de gestión de pacientes de Bolsa 107 con programación de atenciones en ESSI
> **Versión:** v1.16.0 (2026-01-03)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Versión |
|--------|----------|-------------|---------|
| GET | `/api/bolsa107/pacientes` | Listar todos los pacientes de Bolsa 107 | v1.15.x |
| GET | `/api/bolsa107/mis-pacientes-gestor` | Pacientes asignados al gestor logueado | v1.15.x |
| PUT | `/api/bolsa107/paciente/{id}` | Actualizar datos de contacto y programación | ✅ v1.16.0 |
| GET | `/api/bolsa107/profesionales-salud` | Listar profesionales con especialidades | ✅ v1.16.0 |
| POST | `/api/bolsa107/asignar-admisionista` | Asignar paciente a admisionista | v1.14.x |
| GET | `/api/bolsa107/mis-asignaciones` | Pacientes asignados al admisionista | v1.14.x |

### 1. Obtener Profesionales de Salud con Especialidades

**Nuevo en v1.16.0** - Query optimizado que retorna especialidades médicas reales

```http
GET /api/bolsa107/profesionales-salud
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id_pers": 198,
    "num_doc_pers": "46205941",
    "nombre_completo": "Andrea Lucia Gálvez Gastelú",
    "desc_area": "MEDICINA INTERNA",
    "id_area": 1
  },
  {
    "id_pers": 203,
    "num_doc_pers": "42156789",
    "nombre_completo": "Angela Mercedes Veliz Franco",
    "desc_area": "CARDIOLOGIA",
    "id_area": 1
  },
  {
    "id_pers": 215,
    "num_doc_pers": "44332211",
    "nombre_completo": "Carlos Alberto Muñoz Cárdenas",
    "desc_area": "TELEU RGENCIA",
    "id_area": 2
  }
]
```

**Query SQL (mejorado):**
```sql
SELECT DISTINCT
    p.id_pers,
    p.num_doc_pers,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers as nombre_completo,
    COALESCE(s.desc_servicio, prof.desc_prof, a.desc_area) as desc_area,
    p.id_area
FROM dim_personal_cnt p
LEFT JOIN dim_area a ON p.id_area = a.id_area
LEFT JOIN dim_personal_prof pp ON p.id_pers = pp.id_pers AND pp.stat_pers_prof = 'A'
LEFT JOIN dim_profesiones prof ON pp.id_prof = prof.id_prof
LEFT JOIN dim_servicio_essi s ON pp.id_servicio = s.id_servicio
WHERE p.stat_pers = 'A'
AND p.id_area IN (1, 2, 3, 6, 7, 13)
ORDER BY nombre_completo
```

**Prioridad de especialidad (COALESCE):**
1. `s.desc_servicio` - Especialidad médica ESSI (CARDIOLOGIA, MEDICINA INTERNA, etc.)
2. `prof.desc_prof` - Profesión general (MEDICO, ENFERMERA, PSICOLOGO)
3. `a.desc_area` - Área de trabajo (TELECONSULTAS, TELEURGENCIA)

---

### 2. Actualizar Datos de Contacto del Paciente

**Mejorado en v1.16.0** - Nuevos campos: `telCelular`, `correoElectronico`

```http
PUT /api/bolsa107/paciente/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (Campos de Contacto):**
```json
{
  "telefono": "987654321",
  "telCelular": "956194180",
  "correoElectronico": "paciente@email.com",
  "observaciones": "Paciente solicita teleconsulta por la tarde"
}
```

**Request Body (Programación ESSI):**
```json
{
  "profesional": "Andrea Lucia Gálvez Gastelú",
  "dni_profesional": "46205941",
  "especialidad": "MEDICINA INTERNA",
  "fecha_programacion": "2026-01-15",
  "turno": "M"
}
```

**Request Body (Limpiar Asignación de Profesional):**
```json
{
  "profesional": "",
  "dni_profesional": "",
  "especialidad": ""
}
```

**Response (Éxito):**
```json
{
  "mensaje": "Paciente actualizado correctamente",
  "id_item": 1523
}
```

**Response (Error - Paciente no encontrado):**
```json
{
  "error": "Paciente no encontrado con ID: 9999"
}
```

---

### 3. Obtener Pacientes Asignados al Gestor

```http
GET /api/bolsa107/mis-pacientes-gestor
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id_item": 1523,
    "numero_documento": "19860572",
    "paciente": "PEREZ LOPEZ MARIA",
    "sexo": "F",
    "fecha_nacimiento": "1986-05-12",
    "telefono": "941800722",
    "tel_celular": "956194180",
    "correo_electronico": "maria.perez@email.com",
    "afiliacion": "TITULAR",
    "derivacion_interna": "Medicina General",
    "desc_ipress": "H.N. CARLOS ALBERTO SEGUIN ESCOBEDO",
    "tipo_apoyo": "PROGRAMAR EN ESSI",
    "fecha_programacion": "2026-01-15",
    "turno": "M",
    "profesional": "Andrea Lucia Gálvez Gastelú",
    "dni_profesional": "46205941",
    "especialidad": "MEDICINA INTERNA",
    "nombre_gestor": "Jhonatan Test",
    "created_at": "2026-01-02T10:30:00Z"
  }
]
```

---

### 4. Campos de la Tabla `bolsa_107_item`

**Campos Nuevos (v1.16.0):**
- `tel_celular` VARCHAR(30) - Teléfono celular o fijo alterno
- `correo_electronico` VARCHAR(100) - Correo electrónico del paciente

**Campos de Programación ESSI (v1.15.x):**
- `tipo_apoyo` TEXT - Tipo de apoyo (PROGRAMAR EN ESSI, OTROS, etc.)
- `fecha_programacion` DATE - Fecha de la cita
- `turno` VARCHAR(20) - Turno (M=Mañana, T=Tarde, MT=Mañana y Tarde)
- `profesional` VARCHAR(200) - Nombre completo del profesional
- `dni_profesional` VARCHAR(20) - DNI del profesional
- `especialidad` VARCHAR(100) - Especialidad médica

**Índices de Performance:**
```sql
CREATE INDEX IF NOT EXISTS ix_bolsa107_tel_celular
  ON bolsa_107_item(tel_celular) WHERE tel_celular IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_bolsa107_correo
  ON bolsa_107_item(correo_electronico) WHERE correo_electronico IS NOT NULL;
```

---

### 5. Validaciones Backend

**Validaciones de Contacto:**
- `telefono` - Opcional, máximo 30 caracteres
- `telCelular` - Opcional, máximo 30 caracteres
- `correoElectronico` - Opcional, máximo 100 caracteres, formato email válido

**Validaciones de Programación:**
- `profesional` - Opcional, máximo 200 caracteres
- `dni_profesional` - Opcional, 8 dígitos numéricos
- `especialidad` - Opcional, máximo 100 caracteres
- `fecha_programacion` - Opcional, formato ISO 8601 (YYYY-MM-DD)
- `turno` - Opcional, valores: M, T, MT

**Lógica de Negocio:**
- Al seleccionar un profesional, `dni_profesional` y `especialidad` se autocompletan
- Para limpiar asignación, enviar strings vacíos ("") en los 3 campos
- Actualización parcial: solo se actualizan campos presentes en el body

---

### 6. Logs y Auditoría

**Operaciones registradas:**
```
✅ Actualización de contacto del paciente
✅ Asignación de profesional de salud
✅ Limpieza de asignación de profesional
✅ Actualización de programación ESSI
```

**Ejemplo de log:**
```
2026-01-03 10:30:15 [INFO] Actualizando paciente ID: 1523
  → Teléfono actualizado: 987654321
  → Teléfono celular actualizado: 956194180
  → Correo electrónico actualizado: paciente@email.com
  → Profesional actualizado: Andrea Lucia Gálvez Gastelú
  → DNI profesional actualizado: 46205941
  → Especialidad actualizada: MEDICINA INTERNA
```

---

## Gestion de Pacientes

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/gestion-pacientes` | Listar gestiones |
| POST | `/api/gestion-pacientes` | Crear gestion |
| PUT | `/api/gestion-pacientes/{id}` | Actualizar |
| DELETE | `/api/gestion-pacientes/{id}` | Eliminar |
| GET | `/api/gestion-pacientes/asegurado/{dni}` | Buscar asegurado |
| PUT | `/api/gestion-pacientes/{id}/telemedicina` | Seleccionar telemedicina |

---

## Catalogos

| Endpoint Base | Descripcion |
|---------------|-------------|
| `/api/ipress` | Instituciones IPRESS |
| `/api/profesiones` | Profesiones |
| `/api/especialidades` | Especialidades medicas |
| `/api/regimenes` | Regimenes laborales |
| `/api/admin/areas` | Areas organizacionales |
| `/api/tipos-documento` | Tipos de documento |
| `/api/redes` | Redes asistenciales |

---

## Solicitudes de Registro

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/solicitud-registro` | Crear solicitud |
| GET | `/api/admin/solicitudes` | Listar solicitudes (admin) |
| PUT | `/api/admin/solicitudes/{id}/aprobar` | Aprobar solicitud |
| PUT | `/api/admin/solicitudes/{id}/rechazar` | Rechazar solicitud |

---

## Formato de Respuesta de Error

```json
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "timestamp": "2025-12-23T10:30:00",
  "validationErrors": {
    "campo": "error especifico"
  }
}
```

---

## Codigos de Estado HTTP

| Codigo | Descripcion | Uso |
|--------|-------------|-----|
| 200 | OK | Operacion exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos invalidos |
| 401 | Unauthorized | Token invalido/expirado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto de datos (duplicado) |
| 422 | Unprocessable Entity | Validacion fallida |
| 500 | Internal Server Error | Error del servidor |
