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
