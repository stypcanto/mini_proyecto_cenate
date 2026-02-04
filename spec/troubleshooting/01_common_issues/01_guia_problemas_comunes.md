# Troubleshooting - CENATE

> Guía de solución de problemas comunes

---

## 📚 Guías Especializadas

Para problemas específicos, consulta estas guías detalladas:

- **[Coherencia de Datos de Personal](./02_coherencia_datos_personal.md)** - Discrepancias entre Dashboard y API, clasificación Interno/Externo (v1.16.2, v1.16.3)

---

## Backend

### Backend no inicia

```bash
# Verificar conexion a PostgreSQL remoto
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate -c "SELECT 1"

# Verificar puerto 8080
lsof -i :8080
```

### Error "Could not open JPA EntityManager"

Verificar que `application.properties` apunte al servidor correcto:
```properties
spring.datasource.url=jdbc:postgresql://10.0.89.241:5432/maestro_cenate
spring.datasource.password=Essalud2025
```

### JWT WeakKeyException

El secret debe tener minimo 32 caracteres (256 bits).

```properties
jwt.secret=dev-secret-key-change-in-production-min-32-chars
```

---

## Base de Datos

### Usuario bloqueado

```sql
UPDATE dim_usuarios
SET failed_attempts = 0, locked_until = NULL
WHERE name_user = 'usuario';
```

### Verificar datos huerfanos

```sql
-- Buscar usuarios sin personal asociado
SELECT u.id_user, u.name_user
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON u.id_user = p.id_usuario
WHERE p.id_pers IS NULL;

-- Buscar personal sin usuario
SELECT p.id_pers, p.num_doc_pers
FROM dim_personal_cnt p
WHERE p.id_usuario IS NULL;

-- Solicitudes en estado inconsistente
SELECT ar.num_documento, ar.estado, u.id_user
FROM account_requests ar
LEFT JOIN dim_usuarios u ON ar.num_documento = u.name_user
WHERE ar.estado = 'APROBADO' AND u.id_user IS NULL;
```

### Limpiar datos huerfanos (orden correcto)

```sql
-- 1. Permisos del usuario
DELETE FROM permisos_modulares WHERE id_user = ?;
-- 2. Roles del usuario
DELETE FROM rel_user_roles WHERE id_user = ?;
-- 3. Desvincular personal
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_usuario = ?;
-- 4. Profesiones del personal
DELETE FROM dim_personal_prof WHERE id_pers = ?;
-- 5. Tipos del personal
DELETE FROM dim_personal_tipo WHERE id_pers = ?;
-- 6. Usuario
DELETE FROM dim_usuarios WHERE id_user = ?;
-- 7. Personal
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
-- 8. Actualizar solicitudes a RECHAZADO
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

---

## Frontend

### CORS Error

Agregar origen en `application.properties`:

```properties
cors.allowed-origins=http://nuevo-origen:3000
```

### Modulo no aparece en sidebar

1. Verificar `activo = true` en `dim_modulos_sistema`
2. Verificar permiso en `segu_permisos_rol_modulo`
3. Verificar pagina con permiso en `segu_permisos_rol_pagina`

### Token expirado / 401 Unauthorized

El token JWT expira despues de 24 horas. El frontend debe:
1. Detectar error 401
2. Limpiar localStorage
3. Redirigir a `/login`

---

## Email

### Correos no se envian (recuperacion de contrasena)

1. Verificar credenciales Gmail en `application.properties`:
```properties
spring.mail.username=cenateinformatica@gmail.com
spring.mail.password=nolq uisr fwdw zdly
```

2. La contrasena debe ser una **Contrasena de Aplicacion** de Google (no la contrasena normal)
3. Generar en: myaccount.google.com -> Seguridad -> Contrasenas de aplicaciones
4. Los metodos de email son `@Async`, los errores solo aparecen en logs

### Verificar logs de email

```bash
# Ver logs del backend
tail -f backend/logs/spring.log | grep -i email
```

---

## Problemas de Lazy Loading

### Sintoma
Error `LazyInitializationException` o datos null al acceder a relaciones.

### Solucion
Usar SQL directo con JdbcTemplate en lugar de JPA para evitar lazy loading:

```java
String sql = """
    SELECT p.email_pers, p.nom_pers
    FROM dim_personal_cnt p
    WHERE p.id_usuario = ?
""";
var result = jdbcTemplate.queryForMap(sql, idUsuario);
```

---

## Comandos Utiles

### Reiniciar servicios

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start
```

### Limpiar cache

```bash
# Backend
cd backend && ./gradlew clean build

# Frontend
cd frontend && rm -rf node_modules && npm install
```

### Ver logs en tiempo real

```bash
# Backend
tail -f backend/logs/spring.log

# Frontend (browser console)
# F12 -> Console
```

---

## Contacto de Soporte

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |
