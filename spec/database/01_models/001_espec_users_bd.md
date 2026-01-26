# 001 - Especificación del Sistema de Usuarios

> Documentación técnica del modelo de datos de usuarios en CENATE
> Fecha: 2025-12-23 | Versión: 1.0

---

## 1. Resumen Ejecutivo

El sistema de usuarios de CENATE gestiona dos tipos principales de personal:
- **INTERNO**: Personal que trabaja directamente en CENATE
- **EXTERNO**: Personal de IPRESS externas que accede al sistema

---

## 2. Diagrama de Relaciones (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MODELO DE DATOS DE USUARIOS                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────┐
                                    │ account_requests │
                                    │ (Solicitudes)    │
                                    ├──────────────────┤
                                    │ id_request (PK)  │
                                    │ num_documento    │◄──────┐
                                    │ tipo_usuario     │       │
                                    │ estado           │       │ Se convierte en
                                    │ correo_personal  │       │
                                    │ id_ipress (FK)   │       │
                                    └────────┬─────────┘       │
                                             │                 │
                                             │ Al aprobar      │
                                             ▼                 │
┌──────────────────────────────────────────────────────────────┴───────────────────┐
│                                                                                   │
│    ┌─────────────────────┐           ┌─────────────────────┐                     │
│    │    dim_usuarios     │           │  dim_personal_cnt   │                     │
│    │    (Credenciales)   │◄─────────►│  (Datos Personales) │                     │
│    ├─────────────────────┤   1:1     ├─────────────────────┤                     │
│    │ id_user (PK)        │           │ id_pers (PK)        │                     │
│    │ name_user (DNI)     │───────────│ id_usuario (FK)     │                     │
│    │ pass_user           │           │ num_doc_pers        │                     │
│    │ stat_user           │           │ nom_pers            │                     │
│    │ requiere_cambio_pwd │           │ ape_pater_pers      │                     │
│    │ failed_attempts     │           │ email_pers          │                     │
│    │ locked_until        │           │ id_origen (FK)──────┼──► dim_origen_personal
│    └──────────┬──────────┘           │ id_ipress (FK)──────┼──► dim_ipress      │
│               │                      │ id_area (FK)────────┼──► dim_area        │
│               │ M:N                  │ id_reg_lab (FK)─────┼──► dim_regimen_lab │
│               ▼                      └──────────┬──────────┘                     │
│    ┌─────────────────────┐                      │                                │
│    │   rel_user_roles    │                      │ 1:N                            │
│    ├─────────────────────┤                      ▼                                │
│    │ id_user (FK)        │           ┌─────────────────────┐                     │
│    │ id_rol (FK)─────────┼──────────►│  dim_personal_prof  │                     │
│    └─────────────────────┘           │  (Profesiones)      │                     │
│               │                      ├─────────────────────┤                     │
│               ▼                      │ id_pers (PK,FK)     │                     │
│    ┌─────────────────────┐           │ id_prof (PK,FK)─────┼──► dim_profesion   │
│    │     dim_roles       │           │ id_servicio (FK)────┼──► dim_servicio_essi
│    ├─────────────────────┤           │ rne_prof            │   (especialidad)    │
│    │ id_rol (PK)         │           └─────────────────────┘                     │
│    │ desc_rol            │                      │                                │
│    │ stat_rol            │                      │ 1:N                            │
│    └─────────────────────┘                      ▼                                │
│                                      ┌─────────────────────┐                     │
│                                      │  dim_personal_tipo  │                     │
│                                      │  (Tipo Profesional) │                     │
│                                      ├─────────────────────┤                     │
│                                      │ id_pers (PK,FK)     │                     │
│                                      │ id_tip_pers (PK,FK)─┼──► dim_tipo_personal
│                                      └─────────────────────┘                     │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tablas Principales

### 3.1 `dim_usuarios` - Credenciales de Acceso

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_user` | BIGINT (PK) | ID único del usuario |
| `name_user` | VARCHAR | Username (generalmente el DNI) |
| `pass_user` | VARCHAR | Contraseña encriptada (BCrypt) |
| `stat_user` | VARCHAR | Estado: 'ACTIVO' o 'INACTIVO' |
| `requiere_cambio_password` | BOOLEAN | Si debe cambiar contraseña al iniciar sesión |
| `failed_attempts` | INTEGER | Intentos fallidos de login |
| `locked_until` | TIMESTAMP | Fecha hasta la que está bloqueado |
| `last_login_at` | TIMESTAMP | Último inicio de sesión |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

**Índices importantes:**
- `name_user` - UNIQUE (no puede haber usuarios duplicados)

---

### 3.2 `dim_personal_cnt` - Datos Personales

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_pers` | BIGINT (PK) | ID único del personal |
| `id_usuario` | BIGINT (FK) | Referencia a dim_usuarios |
| `num_doc_pers` | VARCHAR | Número de documento (DNI) |
| `nom_pers` | VARCHAR | Nombres |
| `ape_pater_pers` | VARCHAR | Apellido paterno |
| `ape_mater_pers` | VARCHAR | Apellido materno |
| `email_pers` | VARCHAR | Correo personal |
| `email_corp_pers` | VARCHAR | Correo corporativo/institucional |
| `movil_pers` | VARCHAR | Teléfono móvil |
| `gen_pers` | VARCHAR(1) | Género: 'M' o 'F' |
| `fech_naci_pers` | DATE | Fecha de nacimiento |
| `id_origen` | SMALLINT (FK) | 1=INTERNO, 2=EXTERNO |
| `id_ipress` | BIGINT (FK) | IPRESS asignada |
| `id_area` | BIGINT (FK) | Área de trabajo |
| `id_reg_lab` | BIGINT (FK) | Régimen laboral |
| `stat_pers` | VARCHAR(1) | Estado: 'A'=Activo, 'I'=Inactivo |
| `per_pers` | VARCHAR | Período de ingreso (YYYYMM) |

---

### 3.3 `account_requests` - Solicitudes de Registro

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_request` | BIGINT (PK) | ID único de la solicitud |
| `num_documento` | VARCHAR | DNI del solicitante |
| `tipo_documento` | VARCHAR | Tipo: 'DNI', 'PASAPORTE', etc. |
| `nombres` | VARCHAR | Nombres |
| `apellido_paterno` | VARCHAR | Apellido paterno |
| `apellido_materno` | VARCHAR | Apellido materno |
| `correo_personal` | VARCHAR | Correo para notificaciones |
| `tipo_usuario` | VARCHAR | 'INTERNO' o 'EXTERNO' |
| `estado` | VARCHAR | 'PENDIENTE', 'APROBADO', 'RECHAZADO' |
| `id_ipress` | BIGINT (FK) | IPRESS seleccionada |
| `id_admin` | BIGINT (FK) | Admin que procesó la solicitud |
| `fecha_creacion` | TIMESTAMP | Fecha de la solicitud |
| `fecha_respuesta` | TIMESTAMP | Fecha de aprobación/rechazo |

---

### 3.4 `dim_origen_personal` - Clasificación de Origen

| id_origen | desc_origen | Descripción |
|-----------|-------------|-------------|
| 1 | INTERNO | Personal de CENATE |
| 2 | EXTERNO | Personal de IPRESS externas |

---

### 3.5 `rel_user_roles` - Relación Usuario-Rol

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_user` | BIGINT (FK) | ID del usuario |
| `id_rol` | BIGINT (FK) | ID del rol asignado |

**Relación M:N** - Un usuario puede tener múltiples roles.

---

## 4. Identificación de Usuarios Internos vs Externos

### 4.1 Lógica de Clasificación

```
┌─────────────────────────────────────────────────────────────────┐
│                  ¿CÓMO SE CLASIFICA UN USUARIO?                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Por campo id_origen en dim_personal_cnt:                    │
│     ├── id_origen = 1 → INTERNO                                 │
│     └── id_origen = 2 → EXTERNO                                 │
│                                                                  │
│  2. Por existencia en tablas:                                   │
│     ├── Existe en dim_personal_cnt → INTERNO                    │
│     ├── Existe en dim_personal_externo → EXTERNO                │
│     └── No existe en ninguna → SIN_CLASIFICAR                   │
│                                                                  │
│  3. Por rol asignado:                                           │
│     ├── Rol INSTITUCION_EX (id=18) → EXTERNO                    │
│     └── Otros roles → Depende del contexto                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Código Java (UsuarioServiceImpl.java)

```java
// Determinación del tipo de personal
PersonalCnt personalCnt = usuario.getPersonalCnt();
PersonalExterno personalExterno = usuario.getPersonalExterno();

String tipoPersonal;
if (personalCnt != null) {
    tipoPersonal = "INTERNO";
} else if (personalExterno != null) {
    tipoPersonal = "EXTERNO";
} else {
    tipoPersonal = "SIN_CLASIFICAR";
}
```

### 4.3 Diferencias entre INTERNO y EXTERNO

| Aspecto | INTERNO | EXTERNO |
|---------|---------|---------|
| Tabla de datos | `dim_personal_cnt` | `dim_personal_cnt` (con id_origen=2) |
| Rol por defecto | USER | INSTITUCION_EX |
| Acceso a módulos | Completo según permisos | Solo formulario diagnóstico |
| IPRESS | CENATE u otra asignada | IPRESS externa |
| Proceso de registro | Solicitud → Aprobación → Usuario | Solicitud → Aprobación → Usuario |

---

## 5. Flujo de Registro de Usuarios

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE REGISTRO DE USUARIOS                             │
└─────────────────────────────────────────────────────────────────────────────────┘

  Usuario                    Sistema                     Admin                BD
     │                          │                          │                   │
     │  1. Llena formulario     │                          │                   │
     │  (/crear-cuenta)         │                          │                   │
     │─────────────────────────►│                          │                   │
     │                          │                          │                   │
     │                          │  2. Validar DNI y correo │                   │
     │                          │  no duplicados           │                   │
     │                          │─────────────────────────────────────────────►│
     │                          │◄─────────────────────────────────────────────│
     │                          │                          │                   │
     │                          │  3. Crear solicitud      │                   │
     │                          │  estado='PENDIENTE'      │                   │
     │                          │─────────────────────────────────────────────►│
     │                          │                          │                   │
     │  4. Mensaje "Solicitud   │                          │                   │
     │     enviada"             │                          │                   │
     │◄─────────────────────────│                          │                   │
     │                          │                          │                   │
     │                          │  5. Admin ve solicitud   │                   │
     │                          │  en panel                │                   │
     │                          │◄─────────────────────────│                   │
     │                          │                          │                   │
     │                          │  6. Admin APRUEBA        │                   │
     │                          │◄─────────────────────────│                   │
     │                          │                          │                   │
     │                          │  7. Sistema crea:        │                   │
     │                          │  - dim_usuarios          │                   │
     │                          │  - dim_personal_cnt      │                   │
     │                          │  - rel_user_roles        │                   │
     │                          │  - permisos_modulares    │                   │
     │                          │─────────────────────────────────────────────►│
     │                          │                          │                   │
     │                          │  8. Genera token y envía │                   │
     │                          │  email con enlace        │                   │
     │◄─────────────────────────│                          │                   │
     │                          │                          │                   │
     │  9. Usuario configura    │                          │                   │
     │  su contraseña           │                          │                   │
     │─────────────────────────►│                          │                   │
     │                          │                          │                   │
     │                          │  10. requiere_cambio_pwd │                   │
     │                          │  = false                 │                   │
     │                          │─────────────────────────────────────────────►│
     │                          │                          │                   │
     │  11. Puede usar el       │                          │                   │
     │  sistema normalmente     │                          │                   │
     │◄─────────────────────────│                          │                   │
     ▼                          ▼                          ▼                   ▼
```

---

## 6. Estados de Usuario

### 6.1 Estados de Solicitud (account_requests)

```
                    ┌─────────────┐
                    │  PENDIENTE  │ ◄── Estado inicial
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  APROBADO   │          │  RECHAZADO  │
       └──────┬──────┘          └─────────────┘
              │                        ▲
              │ Crea usuario           │
              │                        │ Si se elimina
              ▼                        │ usuario pendiente
       ┌─────────────┐                 │
       │  Usuario    │─────────────────┘
       │  creado     │
       └─────────────┘
```

### 6.2 Estados de Usuario (dim_usuarios)

| Campo | Valor | Significado |
|-------|-------|-------------|
| `stat_user` | 'ACTIVO' | Usuario puede iniciar sesión |
| `stat_user` | 'INACTIVO' | Usuario deshabilitado |
| `requiere_cambio_password` | true | Debe configurar contraseña |
| `requiere_cambio_password` | false | Ya configuró contraseña |
| `locked_until` | NULL | No bloqueado |
| `locked_until` | fecha_futura | Bloqueado hasta esa fecha |

---

## 7. Tablas de Dependencias (Cascada de Eliminación)

Cuando se elimina un usuario, se debe eliminar en este orden:

```
┌─────────────────────────────────────────────────────────────────┐
│              ORDEN DE ELIMINACIÓN (evitar FK errors)            │
└─────────────────────────────────────────────────────────────────┘

1. permisos_modulares      ─┐
                            ├── Tablas que referencian a usuario
2. rel_user_roles          ─┘

3. dim_personal_prof       ─┐
                            ├── Tablas que referencian a personal
4. dim_personal_tipo       ─┘

5. UPDATE dim_personal_cnt SET id_usuario = NULL  ◄── Desvincular

6. dim_usuarios            ◄── Eliminar usuario

7. dim_personal_cnt        ◄── Eliminar personal (si aplica)

8. UPDATE account_requests SET estado = 'RECHAZADO'  ◄── Liberar DNI
```

### 7.1 SQL de Eliminación Completa

```sql
-- Para eliminar un usuario y todos sus datos relacionados por DNI:

-- 1. Obtener IDs
SELECT id_user FROM dim_usuarios WHERE name_user = '{DNI}';
SELECT id_pers FROM dim_personal_cnt WHERE num_doc_pers = '{DNI}';

-- 2. Eliminar permisos
DELETE FROM permisos_modulares WHERE id_user = {id_user};

-- 3. Eliminar roles
DELETE FROM rel_user_roles WHERE id_user = {id_user};

-- 4. Eliminar profesiones del personal
DELETE FROM dim_personal_prof WHERE id_pers = {id_pers};

-- 5. Eliminar tipos del personal
DELETE FROM dim_personal_tipo WHERE id_pers = {id_pers};

-- 6. Desvincular personal
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = {id_pers};

-- 7. Eliminar usuario
DELETE FROM dim_usuarios WHERE id_user = {id_user};

-- 8. Eliminar personal
DELETE FROM dim_personal_cnt WHERE id_pers = {id_pers};

-- 9. Liberar solicitud
UPDATE account_requests
SET estado = 'RECHAZADO', observacion_admin = 'Usuario eliminado'
WHERE num_documento = '{DNI}' AND estado IN ('PENDIENTE', 'APROBADO');
```

---

## 8. Roles del Sistema

| ID | Rol | Descripción | Tipo Usuario |
|----|-----|-------------|--------------|
| 1 | SUPERADMIN | Administrador total | INTERNO |
| 2 | ADMIN | Administrador | INTERNO |
| 3 | MEDICO | Personal médico | INTERNO |
| 4 | ENFERMERIA | Personal de enfermería | INTERNO |
| 5 | OBSTETRA | Obstetras | INTERNO |
| 15 | COORD. ESPECIALIDADES | Coordinador | INTERNO |
| 18 | INSTITUCION_EX | Institución externa | EXTERNO |
| 19 | ASEGURADORA | Aseguradora | EXTERNO |

---

## 9. Endpoints de API Relacionados

### 9.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/solicitar-registro` | Crear solicitud |
| PUT | `/api/auth/change-password` | Cambiar contraseña |

### 9.2 Gestión de Solicitudes (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/solicitudes-registro` | Listar todas |
| GET | `/api/admin/solicitudes-registro/pendientes` | Solo pendientes |
| PUT | `/api/admin/solicitudes-registro/{id}/aprobar` | Aprobar |
| PUT | `/api/admin/solicitudes-registro/{id}/rechazar` | Rechazar |

### 9.3 Gestión de Usuarios Pendientes (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/usuarios/pendientes-activacion` | Listar pendientes |
| POST | `/api/admin/usuarios/{id}/reenviar-activacion` | Reenviar email |
| DELETE | `/api/admin/usuarios/{id}/pendiente-activacion` | Eliminar usuario |

### 9.4 Limpieza de Datos Huérfanos (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/datos-huerfanos/{dni}` | Verificar datos |
| DELETE | `/api/admin/datos-huerfanos/{dni}` | Limpiar datos |

---

## 10. Estadísticas Actuales (2025-12-23)

| Métrica | Valor |
|---------|-------|
| Total usuarios | 100 |
| Usuarios activos | 100 |
| Pendientes de activación | 90 |
| Personal registrado | 99 |
| Personal huérfano | 0 |
| Solicitudes totales | 26 |
| Solicitudes pendientes | 1 |
| Solicitudes aprobadas | 4 |
| Solicitudes rechazadas | 21 |

---

## 11. Queries Útiles de Diagnóstico

### 11.1 Verificar usuario por DNI

```sql
SELECT
    u.id_user, u.name_user, u.stat_user, u.requiere_cambio_password,
    p.id_pers, p.nom_pers, p.ape_pater_pers, p.email_pers,
    o.desc_origen as tipo_personal
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
LEFT JOIN dim_origen_personal o ON o.id_origen = p.id_origen
WHERE u.name_user = '{DNI}';
```

### 11.2 Buscar datos huérfanos por DNI

```sql
SELECT 'dim_usuarios' as tabla, COUNT(*) FROM dim_usuarios WHERE name_user = '{DNI}'
UNION ALL
SELECT 'dim_personal_cnt', COUNT(*) FROM dim_personal_cnt WHERE num_doc_pers = '{DNI}'
UNION ALL
SELECT 'account_requests (activas)', COUNT(*)
FROM account_requests WHERE num_documento = '{DNI}' AND estado IN ('PENDIENTE', 'APROBADO');
```

### 11.3 Solicitudes aprobadas sin usuario

```sql
SELECT ar.*
FROM account_requests ar
WHERE ar.estado = 'APROBADO'
AND NOT EXISTS (
    SELECT 1 FROM dim_usuarios u WHERE u.name_user = ar.num_documento
);
```

### 11.4 Usuarios pendientes de activación

```sql
SELECT u.id_user, u.name_user, u.created_at,
       p.nom_pers, p.ape_pater_pers, p.email_pers
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
WHERE u.requiere_cambio_password = true
ORDER BY u.created_at DESC;
```

---

## 12. Archivos de Código Relacionados

### Backend (Java/Spring Boot)

| Archivo | Descripción |
|---------|-------------|
| `model/Usuario.java` | Entidad JPA de usuarios |
| `model/PersonalCnt.java` | Entidad JPA de personal |
| `model/AccountRequest.java` | Entidad de solicitudes |
| `repository/UsuarioRepository.java` | Repositorio de usuarios |
| `repository/PersonalCntRepository.java` | Repositorio de personal |
| `repository/AccountRequestRepository.java` | Repositorio de solicitudes |
| `service/usuario/UsuarioServiceImpl.java` | Lógica de negocio de usuarios |
| `service/solicitud/AccountRequestService.java` | Lógica de solicitudes |
| `api/seguridad/SolicitudRegistroController.java` | Endpoints de registro |
| `api/usuario/UsuarioController.java` | Endpoints de usuarios |

### Frontend (React)

| Archivo | Descripción |
|---------|-------------|
| `pages/CrearCuenta.jsx` | Formulario de registro |
| `pages/Login.js` | Página de login |
| `pages/admin/AprobacionSolicitudes.jsx` | Panel de solicitudes |
| `pages/user/UsersManagement.jsx` | Gestión de usuarios |
| `context/AuthContext.js` | Estado de autenticación |

---

## 13. Contacto

| Rol | Correo |
|-----|--------|
| Soporte técnico | cenate.analista@essalud.gob.pe |
| Desarrollador | Ing. Styp Canto Rondón |

---

*Documento generado automáticamente - CENATE 2025*
