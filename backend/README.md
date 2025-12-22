# CENATE Backend API

API REST del Sistema de Gestión del Centro Nacional de Telemedicina (CENATE) - EsSalud.

## Stack Tecnológico

- Java 17
- Spring Boot 3.5.6
- Spring Security + JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Gradle
- Spring Mail (Gmail SMTP)

## Configuración

### Variables de Entorno

```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://HOST:5432/maestro_cenate
spring.datasource.username=postgres
spring.datasource.password=PASSWORD

# Email (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=cenateinformatica@gmail.com
spring.mail.password=APP_PASSWORD_DE_GMAIL

# URL del Frontend (para enlaces en emails)
app.frontend.url=http://10.0.89.239
```

### Configuración de Gmail

Para enviar correos desde Gmail, necesitas una "App Password":

1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Habilitar verificación en 2 pasos
3. Generar "App Password" para "Mail"
4. Usar esa contraseña en `spring.mail.password`

---

## Sistema de Notificaciones por Email

El sistema envía correos automáticos en los siguientes eventos:

| Evento | Destinatario | Contenido |
|--------|--------------|-----------|
| Usuario creado por admin | Usuario nuevo | Enlace para configurar contraseña |
| Solicitud de externo aprobada | Usuario externo | Enlace para configurar contraseña |
| Solicitud de externo rechazada | Solicitante | Motivo del rechazo |
| Reset de contraseña | Usuario | Enlace para configurar nueva contraseña |

### Archivos relacionados

- `service/email/EmailService.java` - Servicio de envío de emails
- `service/security/PasswordTokenService.java` - Gestión de tokens seguros

---

## Sistema de Tokens para Cambio de Contraseña

El sistema utiliza tokens seguros en lugar de enviar contraseñas por email.

### Características de seguridad

- Contraseñas temporales aleatorias (12 caracteres: mayúsculas, minúsculas, números, símbolos)
- Tokens únicos con expiración de 24 horas
- Tokens de un solo uso (se invalidan después de usarse)
- No se envían contraseñas en texto plano por email

### Flujo de cambio de contraseña

```
1. Se genera token único
2. Se envía email con enlace: /cambiar-contrasena?token=XXX
3. Usuario hace clic en el enlace
4. Frontend valida token con GET /api/auth/password/validar-token
5. Usuario ingresa nueva contraseña
6. Frontend envía POST /api/auth/password/cambiar
7. Token se invalida
```

### Endpoints públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/auth/password/validar-token?token=XXX` | Valida si el token es válido |
| POST | `/api/auth/password/cambiar` | Cambia la contraseña usando el token |

#### Request para cambiar contraseña

```json
POST /api/auth/password/cambiar
{
  "token": "ABC123...",
  "nuevaContrasena": "MiNuevaContrasena123!",
  "confirmarContrasena": "MiNuevaContrasena123!"
}
```

#### Response exitoso

```json
{
  "exitoso": true,
  "mensaje": "Contraseña cambiada exitosamente"
}
```

---

## Sistema de Usuarios Externos (INSTITUCION_EX)

### Flujo de registro de usuarios externos

```
1. Usuario externo envía solicitud de registro
   POST /auth/solicitar-registro

2. Admin revisa solicitudes pendientes
   GET /admin/solicitudes-registro/pendientes

3. Admin aprueba solicitud
   PUT /admin/solicitudes-registro/{id}/aprobar

   → Se crea usuario con rol INSTITUCION_EX
   → Se crea registro en dim_personal_cnt (origen: EXTERNO)
   → Se asignan permisos automáticos para módulo de externos
   → Se envía email con enlace para configurar contraseña
```

### Permisos automáticos para externos

Cuando se aprueba un usuario externo, automáticamente recibe:

| Módulo | Página | Permisos |
|--------|--------|----------|
| Gestión de Personal Externo | Formulario de Diagnóstico | Ver, Crear, Editar, Exportar |

### Configuración de permisos (IDs actuales)

```java
ID_MODULO_EXTERNO = 20      // Gestión de Personal Externo
ID_PAGINA_FORMULARIO = 59   // Formulario de Diagnóstico
ID_ROL_EXTERNO = 18         // INSTITUCION_EX
```

### Script SQL para asignar permisos manualmente

```sql
-- Asignar permisos al rol INSTITUCION_EX
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo)
SELECT
    r.id_rol,
    p.id_pagina,
    true, true, true, false, true, false, true
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND m.nombre_modulo = 'Gestión de Personal Externo'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true, puede_crear = true, puede_editar = true,
    puede_eliminar = false, puede_exportar = true, puede_aprobar = false,
    activo = true, updated_at = NOW();
```

---

## Sistema MBAC (Modular-Based Access Control)

### Estructura de permisos

```
Usuario → Rol → Permisos Modulares → Página → Acciones (CRUD)
```

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `dim_usuarios` | Usuarios del sistema |
| `dim_roles` | Roles disponibles |
| `rel_user_roles` | Relación usuario-rol |
| `dim_modulos_sistema` | Módulos del sistema |
| `dim_paginas_modulo` | Páginas dentro de módulos |
| `dim_permisos_modulares` | Permisos por rol y página |
| `permisos_modulares` | Permisos por usuario y página |

### Acciones disponibles

- `puede_ver` - Visualizar contenido
- `puede_crear` - Crear registros
- `puede_editar` - Modificar registros
- `puede_eliminar` - Eliminar registros
- `puede_exportar` - Exportar datos
- `puede_aprobar` - Aprobar solicitudes

---

## Estructura del Proyecto

```
src/main/java/com/styp/cenate/
├── api/                    # Controladores REST
│   ├── area/              # Personal externo
│   ├── dashboard/         # Dashboard admin
│   ├── mbac/              # Permisos modulares
│   ├── seguridad/         # Auth y password reset
│   └── usuario/           # Gestión de usuarios
├── config/                 # Configuración Spring
├── dto/                    # Data Transfer Objects
├── model/                  # Entidades JPA
├── repository/             # Repositorios JPA
├── security/               # Configuración de seguridad
│   └── mbac/              # Evaluadores MBAC
├── service/                # Lógica de negocio
│   ├── email/             # Servicio de emails
│   ├── mbac/              # Servicio de permisos
│   ├── security/          # Tokens de contraseña
│   ├── solicitud/         # Solicitudes de registro
│   └── usuario/           # Gestión de usuarios
└── utils/                  # Utilidades
```

---

## Comandos de Desarrollo

```bash
# Compilar
./gradlew compileJava

# Ejecutar
./gradlew bootRun

# Tests
./gradlew test

# Build JAR
./gradlew build
```

---

## Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/refresh` | Refrescar token |
| POST | `/auth/solicitar-registro` | Solicitar cuenta (público) |

### Usuarios

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/api/usuarios` | AUTH | Listar usuarios |
| POST | `/api/usuarios/crear` | ADMIN | Crear usuario |
| PUT | `/api/usuarios/id/{id}` | ADMIN | Actualizar usuario |
| PUT | `/api/usuarios/id/{id}/reset-password` | ADMIN | Resetear contraseña |
| DELETE | `/api/usuarios/id/{id}` | ADMIN | Eliminar usuario |

### Solicitudes de Registro

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/admin/solicitudes-registro` | ADMIN | Listar todas |
| GET | `/admin/solicitudes-registro/pendientes` | ADMIN | Listar pendientes |
| PUT | `/admin/solicitudes-registro/{id}/aprobar` | ADMIN | Aprobar solicitud |
| PUT | `/admin/solicitudes-registro/{id}/rechazar` | ADMIN | Rechazar solicitud |

### MBAC (Permisos)

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/api/mbac/modulos` | ADMIN | Listar módulos |
| GET | `/api/permisos/usuario/{id}` | AUTH | Permisos del usuario |

---

## Seguridad

### Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| SUPERADMIN | Acceso total al sistema |
| ADMIN | Administración de usuarios y configuración |
| USER | Usuario interno básico |
| MEDICO | Personal médico |
| COORDINADOR | Coordinador médico |
| INSTITUCION_EX | Usuario externo de IPRESS |

### Endpoints Públicos (sin autenticación)

- `/api/auth/**` - Autenticación y tokens de contraseña
- `/api/public/**` - Recursos públicos
- `/actuator/**` - Health checks
- `/swagger-ui/**` - Documentación API

---

## Licencia

Propiedad de EsSalud - CENATE. Todos los derechos reservados.
