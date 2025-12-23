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

## Chatbot (Endpoints Publicos)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{dni}` | Consultar paciente |
| GET | `/api/chatbot/atencioncenate` | Atenciones CENATE |
| GET | `/api/chatbot/atencionglobal/{dni}` | Atenciones globales |
| GET | `/api/disponibilidad/por-servicio` | Disponibilidad citas |
| POST | `/api/solicitud` | Crear solicitud cita |

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
