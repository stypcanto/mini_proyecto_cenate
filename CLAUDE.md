# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.7.7** (2025-12-23)

---

## Stack Tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                             # Documentacion tecnica
│   ├── 001_espec_users_bd.md         # Modelo de datos usuarios
│   ├── 002_changelog.md              # Historial de cambios
│   ├── 003_api_endpoints.md          # Endpoints API REST
│   ├── 004_arquitectura.md           # Diagramas y arquitectura
│   └── 005_troubleshooting.md        # Solucion de problemas
│
├── backend/                          # Spring Boot API (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/                      # Controllers REST
│       ├── service/                  # Logica de negocio
│       ├── model/                    # Entidades JPA (49)
│       ├── repository/               # JPA Repositories (46)
│       ├── dto/                      # Data Transfer Objects
│       ├── security/                 # JWT + MBAC
│       └── exception/                # Manejo de errores
│
├── frontend/                         # React (puerto 3000)
│   └── src/
│       ├── components/               # UI reutilizable
│       ├── context/                  # AuthContext, PermisosContext
│       ├── pages/                    # Vistas (31+)
│       ├── services/                 # API services
│       └── lib/apiClient.js          # HTTP client
│
└── README.md
```

---

## Configuracion de Desarrollo

### Variables de Entorno - Backend
```properties
# PostgreSQL (servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT (minimo 32 caracteres)
JWT_SECRET=your-secure-key-at-least-32-characters

# Email SMTP
MAIL_USERNAME=cenateinformatica@gmail.com
MAIL_PASSWORD=nolq uisr fwdw zdly

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos
```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start
```

### Credenciales de Prueba
```
Username: 44914706
Password: @Cenate2025
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios |
| MEDICO | Dashboard medico, pacientes |
| COORDINADOR | Agenda, asignaciones |
| EXTERNO | Formulario diagnostico |

---

## Instrucciones para Claude

### Al implementar nuevos features:
1. **Analisis previo**: Evaluar impacto en backend, frontend y base de datos
2. **Seguir patrones**: Controller -> Service -> Repository
3. **Usar DTOs**: Nunca exponer entidades directamente
4. **Agregar permisos MBAC** si es necesario

### Al modificar codigo existente:
1. **Leer archivos** antes de modificar
2. **Mantener consistencia** con el estilo existente
3. **No sobreingenieria**: Solo cambios necesarios
4. **Respetar capas**: No mezclar logica de negocio en controllers

### Documentacion adicional:
- **API Endpoints**: `spec/003_api_endpoints.md`
- **Arquitectura**: `spec/004_arquitectura.md`
- **Troubleshooting**: `spec/005_troubleshooting.md`
- **Changelog**: `spec/002_changelog.md`
- **Modelo Usuarios**: `spec/001_espec_users_bd.md`

---

## Archivos Clave

### Backend
```
backend/src/main/java/com/styp/cenate/
├── config/SecurityConfig.java
├── security/filter/JwtAuthenticationFilter.java
├── security/service/JwtUtil.java
├── security/mbac/MBACPermissionAspect.java
├── exception/GlobalExceptionHandler.java
├── api/seguridad/AuthController.java
├── api/usuario/UsuarioController.java
├── service/usuario/UsuarioServiceImpl.java
└── model/Usuario.java

backend/src/main/resources/application.properties
```

### Frontend
```
frontend/src/
├── App.js                              # Router principal
├── context/AuthContext.js              # Estado de autenticacion
├── context/PermisosContext.jsx         # Permisos MBAC
├── lib/apiClient.js                    # HTTP client
├── components/security/ProtectedRoute.jsx
├── components/DynamicSidebar.jsx
└── config/version.js                   # Version del sistema
```

---

## MBAC - Uso Rapido

### Backend
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) { ... }
```

### Frontend
```jsx
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

---

## Formato de Respuesta API

### Exito
```json
{
  "status": 200,
  "data": { ... },
  "message": "Operacion exitosa"
}
```

### Error
```json
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "validationErrors": { "campo": "error" }
}
```

---

## Contactos

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |

---

*EsSalud Peru - CENATE | Desarrollado por Ing. Styp Canto Rondon*
