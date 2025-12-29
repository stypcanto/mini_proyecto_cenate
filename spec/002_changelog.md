# Historial de Cambios - CENATE

> Changelog detallado del proyecto

---

## v1.12.0 (2025-12-29) - Feature: Recuperación de Contraseña con Selección de Correo

### Nueva Funcionalidad

Flujo inteligente de recuperación de contraseña que permite al usuario **elegir a qué correo** (personal o corporativo) desea recibir el enlace de recuperación.

### Problema Anterior

**Antes (v1.11.2 y anteriores):**
- ❌ El usuario debía escribir manualmente su correo electrónico
- ❌ No sabía qué correo tenía registrado en el sistema
- ❌ Si se equivocaba al escribir, no recibía el enlace
- ❌ No podía elegir entre correo personal o corporativo
- ❌ Mala experiencia de usuario

### Solución Implementada

**Ahora (v1.12.0):**
- ✅ **Paso 1:** Usuario ingresa su DNI
- ✅ **Paso 2:** Sistema muestra los correos registrados (personal y/o corporativo)
- ✅ Usuario **elige** a qué correo desea recibir el enlace
- ✅ Interfaz visual intuitiva con radio buttons
- ✅ Correos enmascarados para seguridad (`st***06@gmail.com`)
- ✅ Indicador de progreso (Paso 1 → Paso 2)

### Flujo de Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│                   PANTALLA DE LOGIN                              │
│                                                                  │
│  Usuario hace clic en "Olvidé mi contraseña"                    │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          PASO 1: Ingresar DNI                           │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  DNI: [44914706________________]  [Continuar]│      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Backend consulta: GET /api/sesion/correos-disponibles/44914706 │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          PASO 2: Seleccionar Correo                     │    │
│  │                                                          │    │
│  │  👤 NOMBRE USUARIO                                       │    │
│  │  DNI: 44914706                                           │    │
│  │                                                          │    │
│  │  Selecciona dónde recibir el enlace:                    │    │
│  │                                                          │    │
│  │  ⚪ Correo Personal                                      │    │
│  │     st***06@gmail.com                                    │    │
│  │                                                          │    │
│  │  ⚪ Correo Institucional                                 │    │
│  │     styp.***do@essalud.gob.pe                           │    │
│  │                                                          │    │
│  │  [Volver]  [Enviar enlace]                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Backend envía email: POST /api/sesion {username, email}        │
│                           ↓                                      │
│  ✅ "Se ha enviado un enlace a: st***06@gmail.com"             │
└─────────────────────────────────────────────────────────────────┘
```

### Cambios Técnicos

**Backend:**

1. **Nuevo endpoint:** `GET /api/sesion/correos-disponibles/{username}`
   - Busca usuario en PersonalCnt y PersonalExterno
   - Retorna correos disponibles (personal y corporativo)
   - Enmascara correos para seguridad
   - Incluye nombre completo del usuario

2. **Endpoint modificado:** `POST /api/sesion` (retrocompatible)
   - **Flujo nuevo:** Acepta `{username, email}` → valida que el email pertenezca al usuario
   - **Flujo antiguo:** Acepta `{email}` → busca por correo (retrocompatibilidad)
   - Envía enlace al correo específico seleccionado
   - Usa `passwordTokenService.crearTokenYEnviarEmail(idUsuario, email, "RECUPERACION")`

**Frontend:**

1. **ForgotPasswordModal.jsx** - Rediseño completo:
   - Flujo de 2 pasos (DNI → Selección de correo)
   - Indicador visual de progreso
   - Radio buttons para selección de correo
   - Muestra nombre completo del usuario
   - Correos enmascarados para seguridad
   - Pre-selección del correo personal por defecto
   - Botón "Volver" para regresar al paso 1

### Archivos Modificados

**Backend:**
- `backend/src/main/java/com/styp/cenate/api/sesion/SesionController.java`
  - Nuevo método `obtenerCorreosDisponibles()` (líneas 163-267)
  - Método `recuperar()` modificado para soportar nuevo flujo (líneas 48-251)

**Frontend:**
- `frontend/src/components/modals/ForgotPasswordModal.jsx`
  - Rediseño completo con flujo de 2 pasos
  - Nuevos estados: `paso`, `username`, `correosDisponibles`, `correoSeleccionado`
  - Nuevos handlers: `handleBuscarCorreos()`, `handleEnviarEnlace()`, `handleVolver()`
  - UI mejorada con indicador de progreso y radio buttons

**Documentación:**
- `frontend/src/config/version.js` - v1.12.0
- `CLAUDE.md` - v1.12.0
- `spec/002_changelog.md` - Esta entrada

### Validaciones de Seguridad

✅ **Usuario no encontrado:** Mensaje claro "No se encontró ningún usuario con ese DNI"
✅ **Sin correos registrados:** Alerta al usuario que contacte al administrador
✅ **Correo no coincide:** Valida que el email seleccionado pertenezca al username
✅ **Enmascaramiento:** Correos parcialmente ocultos (`st***06@gmail.com`)
✅ **Idempotencia:** Previene solicitudes duplicadas con mismo token
✅ **Retrocompatibilidad:** Flujo antiguo (solo email) sigue funcionando

### Beneficios

📱 **Mejor UX:** Usuario no necesita recordar o escribir su email
🔒 **Más seguro:** Validación de que el email pertenece al usuario
⚡ **Más rápido:** Solo 2 pasos (DNI → Seleccionar → Listo)
🎯 **Mayor control:** Usuario elige a qué correo recibir el enlace
✅ **Retrocompatible:** No rompe flujos existentes

### Casos de Uso

**Caso 1: Usuario con solo correo personal**
```
DNI: 44914706
→ Muestra: ⚫ Correo Personal (pre-seleccionado)
```

**Caso 2: Usuario con ambos correos**
```
DNI: 44914706
→ Muestra: ⚪ Correo Personal
          ⚪ Correo Institucional
→ Usuario elige el que prefiera
```

**Caso 3: Usuario sin correos registrados**
```
DNI: 12345678
→ Error: "El usuario no tiene correos registrados. Contacte al administrador."
```

### Testing Recomendado

1. ✅ Probar con DNI válido que tenga ambos correos
2. ✅ Probar con DNI que solo tenga correo personal
3. ✅ Probar con DNI que solo tenga correo corporativo
4. ✅ Probar con DNI inexistente (debe dar error claro)
5. ✅ Verificar enmascaramiento de correos
6. ✅ Confirmar que el email llega al correo seleccionado
7. ✅ Probar botón "Volver" y flujo de 2 pasos
8. ✅ Verificar retrocompatibilidad (flujo antiguo aún funciona)

---

## v1.11.2 (2025-12-29) - Fix: URL de Recuperación de Contraseña en Producción

### Problema Corregido

**Síntoma:**
- ❌ Enlaces de recuperación de contraseña enviados por email apuntaban a `localhost:3000/cambiar-contrasena?token=...`
- ❌ En producción, los usuarios recibían error `ERR_CONNECTION_REFUSED` al hacer clic en el enlace
- ❌ Los emails no funcionaban fuera del entorno de desarrollo

**Causa raíz:**
La variable de entorno `FRONTEND_URL` no estaba configurada en el archivo `docker-compose.yml`, por lo que el backend usaba el valor por defecto `http://localhost:3000` definido en `application.properties`.

### Solución Implementada

**Agregado `FRONTEND_URL` a docker-compose.yml:**
```yaml
# docker-compose.yml - servicio backend
environment:
  # 🔗 Frontend URL (para enlaces en emails de recuperación de contraseña)
  FRONTEND_URL: ${FRONTEND_URL:-http://10.0.89.239}
```

**Ahora:**
- ✅ Los enlaces de recuperación usan la URL de producción correcta
- ✅ Usuarios pueden restablecer contraseña desde cualquier dispositivo
- ✅ Configurable mediante variable de entorno o valor por defecto
- ✅ Compatible con múltiples entornos (dev, staging, producción)

### Archivos Modificados

**Infraestructura:**
- `docker-compose.yml`
  - Agregada variable `FRONTEND_URL: ${FRONTEND_URL:-http://10.0.89.239}`
  - Comentario explicativo

**Documentación:**
- `CLAUDE.md`
  - Actualizada sección "Variables de Entorno - Backend (Docker)"
  - Agregado FRONTEND_URL a la documentación
  - Versión actualizada a v1.11.2

- `frontend/src/config/version.js` - v1.11.2
- `spec/002_changelog.md` - Esta entrada

### Archivos de Referencia (sin cambios)

Estos archivos ya tenían el soporte correcto:
- `backend/src/main/resources/application.properties:139`
  - `app.frontend.url=${FRONTEND_URL:http://localhost:3000}`
- `backend/src/main/java/com/styp/cenate/service/security/PasswordTokenService.java:34-35`
  - `@Value("${app.frontend.url:http://localhost:3000}")`
  - `private String frontendUrl;`
- Línea 183: `String enlace = frontendUrl + "/cambiar-contrasena?token=" + tokenValue;`

### Cómo Aplicar el Fix en Producción

```bash
# 1. Detener contenedores actuales
docker-compose down

# 2. Reconstruir solo el backend (opcional, no hay cambios en código)
# docker-compose build backend

# 3. Levantar con nueva configuración
docker-compose up -d

# 4. Verificar que la variable se leyó correctamente
docker-compose logs backend | grep -i "frontend"
```

**Alternativa: Cambiar la IP de producción**

Si tu servidor de producción NO es `10.0.89.239`, puedes:

```bash
# Opción 1: Exportar variable de entorno antes de docker-compose up
export FRONTEND_URL=http://TU_IP_PRODUCCION
docker-compose up -d

# Opción 2: Editar el valor por defecto en docker-compose.yml
FRONTEND_URL: ${FRONTEND_URL:-http://TU_IP_PRODUCCION}
```

### Impacto

- **Usuarios afectados:** Todos los que requieran restablecer contraseña
- **Severidad:** ALTA (bloqueaba funcionalidad crítica en producción)
- **Tipo de cambio:** Configuración
- **Requiere rebuild:** No (solo restart con nueva config)
- **Backward compatible:** Sí

### Testing Recomendado

1. ✅ Probar "Enviar correo de recuperación" desde panel de admin
2. ✅ Verificar que el enlace en el email use la IP/dominio de producción
3. ✅ Hacer clic en el enlace y confirmar que abre la página de cambio de contraseña
4. ✅ Completar el flujo de cambio de contraseña

---

## v1.11.1 (2025-12-29) - Feature: Filtro en Cascada RED → IPRESS

### Nueva Funcionalidad

Implementación de filtro en cascada para gestión de usuarios: primero se selecciona la **Red Asistencial** y luego solo se muestran las **IPRESS** que pertenecen a esa red y tienen usuarios asignados.

### Características

**Filtro de RED Asistencial:**
- Selector dropdown con todas las redes disponibles (solo redes con usuarios)
- Posicionado ANTES del filtro de IPRESS
- Al seleccionar una red, automáticamente filtra las IPRESS disponibles
- Color morado para distinguirlo visualmente

**Filtro de IPRESS mejorado:**
- Solo muestra IPRESS de la red seleccionada
- Si no hay red seleccionada, muestra todas las IPRESS
- Filtrado dinámico en tiempo real

**Comportamiento en cascada:**
- Al cambiar la RED, el filtro de IPRESS se resetea automáticamente
- Las listas se generan dinámicamente según los usuarios existentes
- Performance optimizada con `useMemo`

### Ejemplo de Uso

```
1. Usuario abre "Filtros Avanzados"
2. Selecciona "RED ASISTENCIAL AREQUIPA"
   → Dropdown de IPRESS se actualiza mostrando solo:
     - HOSPITAL GOYENECHE
     - HOSPITAL HONORIO DELGADO
     - POLICLINICO METROPOLITANO
3. Selecciona "HOSPITAL GOYENECHE"
4. Resultado: Solo usuarios de ese hospital en Arequipa
```

### Archivos Modificados

**Frontend:**
- `frontend/src/pages/user/UsersManagement.jsx`
  - Agregado estado `filters.red`
  - Nueva función `getRedesListFromUsers()`
  - Nuevo `useMemo` para `redesList`
  - Filtro de RED en `ipressList`
  - Pasado `redesList` a FiltersPanel

- `frontend/src/pages/user/components/FiltersPanel.jsx`
  - Agregado parámetro `redesList`
  - Nuevo selector de RED (color morado, icono Building2)
  - Grid ampliado a 4 columnas: RED | IPRESS | Fecha Desde | Fecha Hasta
  - Lógica de reseteo automático de IPRESS al cambiar RED
  - Actualizado contador y badges de filtros activos

- `frontend/src/config/version.js` - v1.11.1

### Datos Utilizados

El backend YA envía la información necesaria en `UsuarioResponse.java`:
- `id_red` (Long)
- `nombre_red` (String)
- `codigo_red` (String)

No se requieren cambios en el backend.

### Beneficios

✅ **Mejor UX**: Navegación más intuitiva para encontrar usuarios por ubicación
✅ **Filtrado inteligente**: Solo muestra opciones con usuarios reales
✅ **Performance**: Listas dinámicas calculadas eficientemente
✅ **Consistencia**: Sigue el diseño visual existente
✅ **Escalable**: Fácil de mantener y extender

---

## v1.11.0 (2025-12-29) - Feature: Selección de Correo para Reenvío de Activación

### Nueva Funcionalidad

Los administradores ahora pueden reenviar el correo de activación a usuarios pendientes, seleccionando explícitamente el tipo de correo (personal o corporativo) al que desean enviarlo.

### Problema Solucionado

**Antes:**
- ❌ El sistema reenviaba automáticamente al correo personal (fallback a corporativo)
- ❌ No había control sobre el destino del correo
- ❌ Si un correo estaba bloqueado/lleno, no se podía intentar con el otro

**Ahora:**
- ✅ Modal elegante muestra ambos correos disponibles
- ✅ Admin elige explícitamente a qué correo enviar
- ✅ Opciones deshabilitadas si el correo no está registrado
- ✅ Mayor flexibilidad y control

### Características

**Backend:**
- **Endpoint modificado:** `POST /api/admin/usuarios/{id}/reenviar-activacion`
  - Acepta body opcional: `{ "tipoCorreo": "PERSONAL" | "CORPORATIVO" }`
  - Sin body: comportamiento por defecto (prioriza personal)
- **Lógica en `AccountRequestService.reenviarEmailActivacion()`:**
  ```java
  if ("CORPORATIVO".equalsIgnoreCase(tipoCorreo)) {
      email = (emailCorp != null) ? emailCorp : emailPers;
  } else if ("PERSONAL".equalsIgnoreCase(tipoCorreo)) {
      email = (emailPers != null) ? emailPers : emailCorp;
  } else {
      email = (emailPers != null) ? emailPers : emailCorp; // Default
  }
  ```
- **Validaciones:**
  - Usuario debe existir
  - Usuario debe estar pendiente (`requiere_cambio_password = true`)
  - Usuario debe tener al menos un correo registrado
  - Fallback automático si el correo solicitado no existe

**Frontend - Modal de Selección:**
- **Ubicación:** `AprobacionSolicitudes.jsx` → Tab "Pendientes de Activación"
- **Diseño:**
  - Título: "Seleccionar Tipo de Correo"
  - Muestra nombre completo del usuario
  - Dos tarjetas interactivas grandes:
    - **Correo Personal:** Fondo azul gradiente, icono de sobre
    - **Correo Corporativo:** Fondo verde gradiente, icono de edificio
  - Tarjetas deshabilitadas (gris) si el correo no está registrado
- **Funcionalidad:**
  - Estado `modalTipoCorreo` controla apertura/cierre
  - Función `abrirModalTipoCorreo(usuario)` pre-carga datos del usuario
  - Función `reenviarEmailActivacion(tipoCorreo)` envía petición con tipo elegido
  - Botón "Cancelar" para cerrar sin enviar

### Casos de Uso

| Caso | Comportamiento |
|------|----------------|
| Usuario tiene ambos correos | Admin elige cuál usar libremente |
| Usuario solo tiene correo personal | Opción corporativa deshabilitada en gris |
| Usuario solo tiene correo corporativo | Opción personal deshabilitada en gris |
| Usuario sin ningún correo | Botón de reenvío deshabilitado desde la tabla |
| Admin selecciona PERSONAL | Envía a correo personal, fallback a corporativo |
| Admin selecciona CORPORATIVO | Envía a correo corporativo, fallback a personal |

### Beneficios

1. **🎯 Flexibilidad:** Admin decide el mejor canal según contexto
2. **🔄 Redundancia:** Si un correo falla/rebota, puede intentar con el otro
3. **👁️ Transparencia:** Muestra claramente qué correos tiene registrados el usuario
4. **✨ UX Mejorada:** Modal visualmente atractivo y fácil de usar
5. **🛡️ Seguro:** Solo SUPERADMIN y ADMIN pueden usar esta función

### Archivos Modificados

**Backend:**
- `backend/src/main/java/com/styp/cenate/api/seguridad/SolicitudRegistroController.java`
  - Endpoint acepta body opcional con `tipoCorreo`
- `backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java`
  - Método `reenviarEmailActivacion()` ahora recibe parámetro `tipoCorreo`
  - Lógica de selección según tipo solicitado con fallback

**Frontend:**
- `frontend/src/pages/admin/AprobacionSolicitudes.jsx`
  - Estado `modalTipoCorreo` agregado
  - Función `abrirModalTipoCorreo()` agregada
  - Función `reenviarEmailActivacion()` modificada para enviar tipo
  - Modal de selección completo (120+ líneas de JSX)
- `frontend/src/config/version.js` - v1.11.0

### Documentación

- CLAUDE.md: Sección "Reenvío de Correo de Activación con Selección de Tipo"
- Ubicación: Después de "Recuperación de Contraseña con Selección de Correo"

---

## v1.10.4 (2025-12-29) - Fix: Vista de Auditoría Completa

### Problema Resuelto

**Síntoma:** La vista de auditoría (`/admin/logs`) no mostraba eventos críticos del sistema:
- ❌ Eliminación de usuarios (DELETE_USER)
- ❌ Creación de usuarios (CREATE_USER)
- ❌ Login/Logout (LOGIN, LOGOUT)
- ❌ Aprobación/Rechazo de solicitudes (APPROVE_REQUEST, REJECT_REQUEST)
- ❌ Gestión de disponibilidad médica

Solo mostraba 530 registros de cambios en permisos modulares (de 2732 totales).

### Causa Raíz

La vista `vw_auditoria_modular_detallada` contenía un filtro WHERE que limitaba los resultados a solo 2 módulos específicos:

```sql
WHERE a.modulo = ANY (ARRAY[
  'dim_permisos_modulares',
  'dim_permisos_pagina_rol'
])
```

**Resultado:**
- ✅ Tabla audit_logs: 2732 registros (completo)
- ❌ Vista: 530 registros (solo 19% del total)

### Solución Implementada

1. **Recrear vista sin filtro de módulos** (`spec/scripts/009_fix_vista_auditoria_completa.sql`):
   - Eliminación completa del filtro WHERE
   - Ahora muestra TODOS los módulos sin excepción
   - Join optimizado por nombre de usuario (audit_logs.usuario = dim_usuarios.name_user)

2. **Mejorar mapeo de eventos con emojis descriptivos**:
   ```sql
   WHEN a.action = 'LOGIN' THEN '🔑 Inicio de sesión'
   WHEN a.action = 'DELETE_USER' THEN '🗑️ Eliminación de usuario'
   WHEN a.action = 'APPROVE_REQUEST' THEN '✔️ Aprobación de solicitud'
   -- ... más eventos
   ```

3. **Crear documentación completa del sistema de auditoría** (`spec/011_guia_auditoria.md`):
   - Arquitectura y flujo completo
   - Estructura de tabla audit_logs e índices
   - Definición de vista y columnas generadas
   - Patrón de implementación en servicios
   - Troubleshooting y mantenimiento
   - Consultas SQL útiles y reportes

### Resultados

**Antes del fix:**
- Vista: 530 registros (19%)
- Usuario en logs: "backend_user" (incorrecto)
- Eventos críticos invisibles

**Después del fix:**
- Vista: 2732 registros (100%)
- Usuario correcto: "44914706 (Styp Canto Rondón)"
- Todos los eventos visibles

**Ejemplo verificado:**
```
ID: 2757
Fecha: 2025-12-29 12:40:14
Usuario: 44914706 (Styp Canto Rondón)
Acción: DELETE_USER
Módulo: USUARIOS
Detalle: Usuario eliminado: 44444444 (ID: 254)
Estado: SUCCESS
```

### Archivos Creados/Modificados

- ✅ `spec/scripts/009_fix_vista_auditoria_completa.sql` - Script de corrección
- ✅ `spec/011_guia_auditoria.md` - Guía completa del sistema de auditoría

### Cómo Aplicar

```bash
# Aplicar fix de vista
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/009_fix_vista_auditoria_completa.sql

# Verificar resultado
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -c "SELECT COUNT(*) FROM vw_auditoria_modular_detallada;"
# Debe retornar 2732 (igual a audit_logs)
```

**⚠️ Nota:** Recargar frontend (Ctrl+Shift+R o Cmd+Shift+R) después de aplicar para ver cambios.

### Documentación Relacionada

- Guía completa de auditoría: `spec/011_guia_auditoria.md`
- Script de corrección: `spec/scripts/009_fix_vista_auditoria_completa.sql`

---

## v1.10.3 (2025-12-29) - Fix: Eliminación de Usuarios con Disponibilidad Médica

### Problema Crítico Resuelto

**Síntoma:** Los usuarios SUPERADMIN no podían eliminar usuarios que tenían registros de disponibilidad médica asociados. El sistema mostraba errores como:
- "No se pudo eliminar el usuario" (violación de restricción FK)
- `ObjectOptimisticLockingFailureException` (bloqueo optimista de JPA)
- `TransientObjectException` (instancia transiente no guardada)

**Causas Raíz:**
1. El método `deleteUser` no eliminaba los registros de `disponibilidad_medica` y `detalle_disponibilidad` antes de eliminar el personal (violación de FK)
2. Mezclar operaciones JPA con jdbcTemplate causaba conflictos de estado en Hibernate (bloqueo optimista y entidades transientes)

### Solución Implementada

**Modificaciones en UsuarioServiceImpl.java:**

**1. Eliminar en cascada disponibilidades médicas (paso 3):**
```java
// 3. Eliminar registros de disponibilidad médica asociados al personal
if (idPersonal != null) {
    // Primero eliminar detalles de disponibilidad (tabla hija)
    int detalles = jdbcTemplate.update("""
        DELETE FROM detalle_disponibilidad
        WHERE id_disponibilidad IN (
            SELECT id_disponibilidad FROM disponibilidad_medica WHERE id_pers = ?
        )
        """, idPersonal);

    // Luego eliminar disponibilidades médicas
    int disponibilidades = jdbcTemplate.update("DELETE FROM disponibilidad_medica WHERE id_pers = ?", idPersonal);
}
```

**2. Usar jdbcTemplate en lugar de JPA para eliminar usuario (paso 5):**
```java
// 5. Eliminar usuario (usando jdbcTemplate para evitar conflictos de JPA)
int usuarioEliminado = jdbcTemplate.update("DELETE FROM dim_usuarios WHERE id_user = ?", id);
```

**Razón:** Al mezclar operaciones JPA (para cargar el usuario) con jdbcTemplate (para modificar tablas relacionadas), JPA detectaba cambios en las entidades y lanzaba errores de bloqueo optimista (`ObjectOptimisticLockingFailureException`) o entidades transientes (`TransientObjectException`). La solución es usar jdbcTemplate consistentemente para todas las operaciones de eliminación.

**Orden de eliminación actualizado (21 tablas):**

**Paso 1-4: Limpiar datos del usuario**
1. **[NUEVO]** Tokens de recuperación (`password_reset_tokens`)
2. **[NUEVO]** Solicitudes de cambio de contraseña (`solicitud_contrasena`)
3. **[NUEVO]** Permisos modulares (`permisos_modulares`)
4. **[NUEVO]** Permisos de seguridad (`segu_permisos_usuario_pagina`)
5. **[NUEVO]** Permisos autorizados (`dim_permisos_modulares`)
6. **[NUEVO]** Referencias en períodos de control (`ctr_periodo` - UPDATE NULL)
7. Roles del usuario (`rel_user_roles`)

**Paso 6: Limpiar datos del personal asociado**
8. **[NUEVO]** Solicitudes de cita (`solicitud_cita`)
9. **[NUEVO]** Solicitudes de turno (`solicitud_turno_ipress`)
10. **[NUEVO]** Logs de horarios (`ctr_horario_log`)
11. **[NUEVO]** Horarios de control (`ctr_horario`)
12. **[NUEVO]** Detalles de disponibilidad (`detalle_disponibilidad`)
13. **[NUEVO]** Disponibilidades médicas (`disponibilidad_medica`)
14. **[NUEVO]** Relaciones personal-programa (`persona_programa`)
15. **[NUEVO]** Firmas digitales (`dim_personal_firma`)
16. **[NUEVO]** Órdenes de compra (`dim_personal_oc`)
17. Profesiones del personal (`dim_personal_prof`)
18. Tipos del personal (`dim_personal_tipo`)

**Paso 7-9: Eliminar registros principales**
19. Usuario (`dim_usuarios`) - **[MODIFICADO]** Ahora usa `jdbcTemplate` en lugar de JPA
20. Personal huérfano (`dim_personal_cnt`)
21. Solicitudes de cuenta (`account_requests` - UPDATE RECHAZADO)

**Nota:** `audit_logs` NO se elimina para preservar el historial de auditoría del sistema.

### Archivos Modificados

```
backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java
```

### Impacto

- ✅ Los SUPERADMIN ahora pueden eliminar usuarios sin importar qué datos asociados tengan
- ✅ **Eliminación completa SIN huérfanos**: Se limpian **21 tablas** incluyendo:
  - Tokens y solicitudes de contraseña
  - Permisos modulares y de seguridad
  - Disponibilidades médicas y turnos
  - Solicitudes de cita y turno
  - Horarios y logs de control
  - Firmas digitales y órdenes de compra
  - Profesiones, tipos, programas y personal
- ✅ Resuelve conflictos entre JPA y jdbcTemplate usando `jdbcTemplate` consistentemente
- ✅ Mantiene integridad referencial en toda la base de datos
- ✅ Auditoría completa de la operación de eliminación
- ✅ Preserva el historial de auditoría (`audit_logs` no se elimina)
- ✅ Los registros en `account_requests` se marcan como RECHAZADO para permitir re-registro futuro

---

## v1.10.2 (2025-12-29) - Selección de Correo para Recuperación de Contraseña

### Funcionalidad Agregada

Los administradores ahora pueden elegir a qué correo enviar el enlace de recuperación de contraseña cuando hacen clic en "Enviar correo de recuperación".

### Problema Resuelto

Anteriormente, el sistema enviaba automáticamente el correo de recuperación sin permitir al administrador elegir a qué correo enviarlo. Esto era problemático cuando:
- El usuario tiene correo personal y corporativo registrados
- Solo uno de los correos está activo o es accesible para el usuario
- El administrador quiere asegurarse de que el correo llegue a la cuenta que el usuario revisa frecuentemente

### Solución Implementada

**Modal de Selección de Correo en Recuperación:**

Cuando el administrador hace clic en "Enviar correo de recuperación" desde el modal de editar usuario:
1. Se muestra un diálogo preguntando a qué correo desea enviar el enlace
2. Aparecen opciones con radio buttons para seleccionar entre:
   - **Correo Personal** (si existe)
   - **Correo Institucional** (si existe)
3. El botón "Enviar Correo" está deshabilitado hasta que se seleccione una opción
4. Al confirmar, el sistema envía el enlace solo al correo seleccionado

**Archivos Modificados:**

Backend:
```
backend/src/main/java/com/styp/cenate/
├── api/usuario/UsuarioController.java           # Acepta parámetro email opcional
└── service/security/PasswordTokenService.java    # Nuevo método sobrecargado
```

Frontend:
```
frontend/src/pages/user/components/common/ActualizarModel.jsx  # Modal con selector
```

### Cambios Técnicos

**1. UsuarioController.java**
- Endpoint `/id/{id}/reset-password` ahora acepta un parámetro opcional `email`
- Si se proporciona `email`, envía el correo a esa dirección específica
- Si no se proporciona, usa el correo registrado del usuario (comportamiento anterior)

```java
@PutMapping("/id/{id}/reset-password")
public ResponseEntity<?> resetPassword(@PathVariable("id") Long id,
        @RequestParam(required = false) String email,
        Authentication authentication)
```

**2. PasswordTokenService.java**
- Nuevo método sobrecargado: `crearTokenYEnviarEmail(Long idUsuario, String email, String tipoAccion)`
- Permite especificar el correo al que se debe enviar el token
- Mantiene retrocompatibilidad con métodos existentes

**3. ActualizarModel.jsx**
- Nuevo estado: `correoSeleccionado`
- Modal actualizado con selector de radio buttons
- Validación: el botón de envío se deshabilita si no se selecciona correo
- Envía el correo seleccionado como query parameter a la API

### Experiencia de Usuario

**Modal de Recuperación:**
```
┌─────────────────────────────────────────────────┐
│ Recuperación de Contraseña                      │
│ ¿A qué correo desea enviar el enlace?          │
│                                                  │
│ Seleccione el correo de destino: *              │
│                                                  │
│ ○ Correo Personal (stypcanto@gmail.com)         │
│ ○ Correo Institucional (cenate.analista@        │
│                          essalud.gob.pe)        │
│                                                  │
│ [Cancelar]  [Enviar Correo]                    │
└─────────────────────────────────────────────────┘
```

### Logs Mejorados

El sistema ahora registra a qué correo se envió el enlace:
```
📧 Enviando correo de reset al correo especificado: stypcanto@gmail.com
✅ Correo de reset enviado exitosamente para usuario ID: 123
emailSentTo: "stypcanto@gmail.com"
```

### Notas Importantes

**Variables de Entorno Requeridas:**

Para que el envío de correos funcione, el backend DEBE iniciarse con estas variables de entorno:
```bash
export MAIL_USERNAME="cenateinformatica@gmail.com"
export MAIL_PASSWORD="nolq uisr fwdw zdly"
export DB_URL="jdbc:postgresql://10.0.89.13:5432/maestro_cenate"
export DB_USERNAME="postgres"
export DB_PASSWORD="Essalud2025"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export FRONTEND_URL="http://localhost:3000"
```

**Tiempos de Entrega de Correo:**
- Gmail personal: 10-30 segundos
- Correo corporativo @essalud.gob.pe: 1-5 minutos (puede tardar más o ser bloqueado por filtros)

**Posibles Problemas:**
- Los correos corporativos pueden tener filtros anti-spam que bloqueen correos de Gmail
- Revisar carpeta de SPAM si no llega el correo
- Contactar al área de TI de EsSalud para agregar cenateinformatica@gmail.com a lista blanca

---

## v1.10.1 (2025-12-29) - Selección de Correo Preferido para Notificaciones

### Funcionalidad Agregada

Los usuarios ahora pueden elegir a qué correo electrónico desean recibir las notificaciones del sistema durante el proceso de registro.

### Problema Resuelto

Anteriormente, el sistema enviaba automáticamente todas las notificaciones (credenciales de acceso, recuperación de contraseña, etc.) al correo personal del usuario. Esto no era ideal para usuarios que:
- Solo pueden acceder a su correo institucional durante horas de trabajo
- Prefieren mantener comunicaciones laborales en su correo institucional
- No tienen acceso regular a su correo personal

### Solución Implementada

**Selección de Correo Preferido en el Formulario de Registro:**

Se agregó un selector en el formulario `/crear-cuenta` que permite al usuario elegir entre:
- **Correo Personal** (opción por defecto)
- **Correo Institucional** (solo si se proporcionó uno)

**Archivos Modificados:**

Backend:
```
backend/src/main/java/com/styp/cenate/
├── model/AccountRequest.java                    # Nuevo campo emailPreferido
├── dto/SolicitudRegistroDTO.java                # Nuevo campo emailPreferido
└── service/solicitud/AccountRequestService.java # Usa correo preferido al enviar emails
```

Frontend:
```
frontend/src/pages/CrearCuenta.jsx               # Selector de correo preferido
```

Base de Datos:
```
spec/scripts/007_agregar_email_preferido.sql     # Nueva columna email_preferido
```

### Estructura de la Base de Datos

```sql
ALTER TABLE account_requests
ADD COLUMN email_preferido VARCHAR(20) DEFAULT 'PERSONAL';
```

**Valores válidos:**
- `PERSONAL` - Usar correo personal
- `INSTITUCIONAL` - Usar correo institucional

### Método Helper en AccountRequest

Se agregó el método `obtenerCorreoPreferido()` que:
1. Retorna el correo según la preferencia del usuario
2. Proporciona fallback automático si el correo preferido no está disponible
3. Garantiza que siempre se obtenga un correo válido

```java
public String obtenerCorreoPreferido() {
    if ("INSTITUCIONAL".equalsIgnoreCase(emailPreferido)) {
        return (correoInstitucional != null && !correoInstitucional.isBlank())
                ? correoInstitucional
                : correoPersonal; // Fallback
    }
    return (correoPersonal != null && !correoPersonal.isBlank())
            ? correoPersonal
            : correoInstitucional; // Fallback
}
```

### Puntos de Uso del Correo Preferido

El correo preferido se utiliza automáticamente en:
1. **Aprobación de solicitud** - Envío de credenciales de activación
2. **Rechazo de solicitud** - Notificación de rechazo
3. **Recuperación de contraseña** - Enlaces de recuperación
4. **Cambio de contraseña** - Notificaciones de cambio

### Experiencia de Usuario

**Formulario de Registro:**
- Selector visual con radio buttons
- Muestra el correo seleccionado en tiempo real
- Deshabilita la opción institucional si no se ingresó un correo institucional
- Ayuda contextual explicando para qué se usa la preferencia

**Comportamiento Inteligente:**
- Si el usuario selecciona "INSTITUCIONAL" pero no ingresó correo institucional, el sistema usa el correo personal automáticamente
- Los registros existentes se actualizan automáticamente con preferencia "PERSONAL"

### Migración de Datos Existentes

El script SQL incluye migración automática:
```sql
UPDATE account_requests
SET email_preferido = 'PERSONAL'
WHERE email_preferido IS NULL AND correo_personal IS NOT NULL;
```

### Logs y Auditoría

Los logs ahora incluyen información sobre la preferencia del usuario:
```
Preparando envío de correo a: user@gmail.com (preferencia: PERSONAL) para usuario: Juan Pérez
Correo de rechazo enviado a: user@essalud.gob.pe (preferencia: INSTITUCIONAL)
```

---

## v1.9.2 (2025-12-23) - Tokens de Recuperacion Persistentes

### Problema Resuelto

Los tokens de recuperacion de contrasena se almacenaban en memoria y se perdian al reiniciar el backend, invalidando los enlaces enviados por correo.

### Solucion Implementada

**Persistencia en Base de Datos:**

Se creo una nueva tabla `segu_password_reset_tokens` para almacenar los tokens de forma permanente.

**Archivos Creados:**
```
backend/src/main/java/com/styp/cenate/
├── model/PasswordResetToken.java          # Entidad JPA
└── repository/PasswordResetTokenRepository.java  # Repositorio
```

**Archivos Modificados:**
- `PasswordTokenService.java` - Usa BD en lugar de memoria
- `application.properties` - URL frontend configurable por ambiente
- `ActualizarModel.jsx` - Nuevo boton "Enviar correo de recuperacion"

### Estructura de la Tabla

```sql
CREATE TABLE segu_password_reset_tokens (
    id_token BIGSERIAL PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    tipo_accion VARCHAR(50),
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Configuracion por Ambiente

| Ambiente | Variable | Frontend URL |
|----------|----------|--------------|
| Desarrollo | (default) | `http://localhost:3000` |
| Produccion | `FRONTEND_URL=http://10.0.89.239` | `http://10.0.89.239` |

### Mejora UX - Boton de Recuperacion

**Antes:** Boton amarillo "Resetear a @Cenate2025" (mostraba contrasena en texto plano)

**Ahora:** Boton azul "Enviar correo de recuperacion" con modal explicativo que indica:
- Se enviara un enlace seguro al correo del usuario
- El enlace expira en 24 horas
- El usuario configura su propia contrasena

### Flujo de Recuperacion

1. Admin abre modal de edicion de usuario
2. Clic en "Enviar correo de recuperacion"
3. Confirma en el modal
4. Usuario recibe correo con enlace
5. Usuario abre enlace y configura su nueva contrasena
6. Token se marca como usado en BD

### Limpieza Automatica

Los tokens expirados o usados se eliminan automaticamente cada hora mediante `@Scheduled`.

---

## v1.9.1 (2025-12-23) - Selector de Red para Coordinadores

### Mejoras en Asignacion de COORDINADOR_RED

Se agrego funcionalidad para asignar una Red automaticamente al usuario cuando se le asigna el rol `COORDINADOR_RED` desde el modal de edicion de usuarios.

### Cambios en Backend

**UsuarioUpdateRequest.java:**
- Nuevo campo `idRed` para recibir la Red asignada

**UsuarioServiceImpl.java:**
- Inyeccion de `RedRepository`
- Logica en `updateUser()` para asignar/quitar Red segun rol COORDINADOR_RED
- Actualizacion de `convertToResponse()` para incluir Red del usuario

### Cambios en Frontend

**ActualizarModel.jsx:**
- `handleRoleToggle()` ahora carga redes cuando se selecciona COORDINADOR_RED
- Nuevo selector de Red que aparece al seleccionar rol COORDINADOR_RED
- Validacion obligatoria de Red para COORDINADOR_RED
- Envio de `idRed` en datos de actualizacion de usuario
- useEffect para inicializar Red cuando usuario ya tiene el rol

### Flujo de Uso

1. Abrir modal de edicion de usuario
2. Ir a pestana "Roles"
3. Marcar checkbox de "COORDINADOR_RED"
4. Aparece selector "Asignar Red al Coordinador"
5. Seleccionar la Red (obligatorio)
6. Guardar cambios

La Red se guarda en `dim_usuarios.id_red` y el usuario podra acceder al modulo "Gestion de Red" viendo solo datos de su red asignada.

---

## v1.9.0 (2025-12-23) - Modulo de Red para Coordinadores

### Nuevo Modulo

Se agrego un nuevo modulo **Gestion de Red** para Coordinadores de Red que permite visualizar:
- Personal externo de las IPRESS de su red asignada
- Formularios de diagnostico de su red
- Estadisticas consolidadas (total IPRESS, personal, formularios)

### Cambios en Backend

**Modelo Usuario:**
- Nuevo campo `id_red` para asignar red directamente al usuario
- Relacion `@ManyToOne` con entidad `Red`

**Nuevo Rol:**
- `COORDINADOR_RED` (nivel jerarquico 4)

**Nuevos Endpoints:**
- `GET /api/red/mi-red` - Dashboard con info de la red y estadisticas
- `GET /api/red/personal` - Personal externo de la red
- `GET /api/red/formularios` - Formularios de diagnostico de la red

**Archivos Creados:**
```
backend/src/main/java/com/styp/cenate/
├── api/red/RedDashboardController.java
├── service/red/RedDashboardService.java
├── service/red/impl/RedDashboardServiceImpl.java
└── dto/red/RedDashboardResponse.java
```

**Repositorios Modificados:**
- `PersonalExternoRepository` - Nuevos metodos por Red
- `IpressRepository` - Conteo por Red
- `FormDiagFormularioRepository` - Conteo por Red y Estado

### Cambios en Frontend

**Nueva Pagina:**
- `frontend/src/pages/red/RedDashboard.jsx`
- Ruta: `/red/dashboard`

**Caracteristicas:**
- Header con info de la red y macroregion
- Cards de estadisticas (IPRESS, Personal, Formularios)
- Tabs para alternar entre Personal y Formularios
- Exportacion a CSV
- Diseno responsive

### Script SQL

**Archivo:** `spec/scripts/003_modulo_red_coordinador.sql`

Ejecutar con:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/003_modulo_red_coordinador.sql
```

### Asignar Red a Usuario

```sql
-- Asignar red a usuario
UPDATE dim_usuarios
SET id_red = (SELECT id_red FROM dim_red WHERE cod_red = 'RXXX' LIMIT 1)
WHERE name_user = 'DNI_USUARIO';

-- Asignar rol COORDINADOR_RED
INSERT INTO rel_user_roles (id_user, id_rol)
SELECT u.id_user, r.id_rol
FROM dim_usuarios u, dim_roles r
WHERE u.name_user = 'DNI_USUARIO'
AND r.desc_rol = 'COORDINADOR_RED'
ON CONFLICT DO NOTHING;
```

### Documentacion

- Plan detallado: `spec/007_plan_modulo_red.md`

---

## v1.8.1 (2025-12-23) - Fix Usuarios Huerfanos

### Problema Identificado

Los usuarios externos (IPRESS) podian hacer login pero no aparecian en la busqueda de "Gestion de Usuarios". Esto ocurria porque:

1. La busqueda solo consultaba `dim_personal_cnt` (internos)
2. Usuarios externos estan en `dim_personal_externo`
3. Al eliminar usuarios, quedaban datos huerfanos que permitian login

### Correccion: Limpieza de Personal Externo

Se mejoraron dos metodos en `AccountRequestService.java`:

**`limpiarDatosHuerfanos()`**
```java
// Ahora desvincula personal externo ANTES de eliminar usuario
UPDATE dim_personal_externo SET id_user = NULL WHERE id_user = ?;
// Luego elimina el usuario
DELETE FROM dim_usuarios WHERE id_user = ?;
// Finalmente elimina el personal externo
DELETE FROM dim_personal_externo WHERE id_pers_ext = ?;
```

**`eliminarUsuarioPendienteActivacion()`**
- Ahora detecta si el usuario es INTERNO o EXTERNO
- Limpia `dim_personal_externo` ademas de `dim_personal_cnt`
- Orden correcto: desvincular → eliminar usuario → eliminar personal

### Usuarios Huerfanos Limpiados

| DNI | Nombre | IPRESS | Accion |
|-----|--------|--------|--------|
| 11111111 | Testing Testing | P.M. QUEROBAMBA | Eliminado |
| 32323232 | Tess Testing | P.M. QUEROBAMBA | Eliminado |

### Tablas del Sistema de Personal

| Tabla | Tipo | Descripcion |
|-------|------|-------------|
| `dim_personal_cnt` | INTERNO | Personal de CENATE |
| `dim_personal_externo` | EXTERNO | Personal de IPRESS |
| `dim_usuarios` | Ambos | Credenciales de acceso |

**Nota:** La pagina "Gestion de Usuarios" (`/admin/users`) solo muestra personal INTERNO. Para gestionar personal externo, usar la opcion correspondiente del menu.

### Archivos Modificados

```
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
├── limpiarDatosHuerfanos() - Incluye dim_personal_externo
└── eliminarUsuarioPendienteActivacion() - Maneja ambos tipos de personal
```

---

## v1.8.0 (2025-12-23) - Mejoras en Auditoria

### Renombrado de Menu

El menu "Logs del Sistema" fue renombrado a **"Auditoría"** para reflejar mejor su funcion.

**Script SQL:**
```sql
-- spec/scripts/002_rename_logs_to_auditoria.sql
UPDATE dim_paginas_modulo
SET nombre_pagina = 'Auditoría',
    descripcion = 'Auditoría completa del sistema - Trazabilidad de acciones'
WHERE ruta_pagina = '/admin/logs';
```

### Fix: Usuario N/A en Logs

**Problema:** Los registros de auditoria mostraban "N/A" en lugar del nombre de usuario.

**Causa:** El mapper en `AuditoriaServiceImpl.java` usaba `view.getUsername()` que viene del JOIN con `dim_usuarios`. Los usuarios de sistema como "backend_user" no existen en esa tabla.

**Solucion:**
```java
// AuditoriaServiceImpl.java - mapToAuditoriaResponseDTO()
String usuario = view.getUsuarioSesion();  // Prioriza campo de audit_logs
if (usuario == null || usuario.isBlank()) {
    usuario = view.getUsername();
}
if (usuario == null || usuario.isBlank()) {
    usuario = "SYSTEM";  // Fallback para acciones del sistema
}
```

### Mejoras en AdminDashboard - Actividad Reciente

Se mejoro la seccion "Actividad Reciente" del dashboard administrativo:

| Antes | Despues |
|-------|---------|
| 5 actividades | 8 actividades |
| Acciones en codigo (LOGIN, INSERT) | Acciones legibles ("Inicio de sesión", "Registro creado") |
| Solo usuario | Usuario + nombre completo |
| Sin indicador visual | Indicador de estado (verde/rojo) |

**Funciones agregadas:**
- `formatAccionEjecutiva()` - Traduce acciones a formato ejecutivo
- `getDetalleCorto()` - Extrae detalle resumido
- `getNombreCompleto()` - Obtiene nombre completo del log
- `getLogUsuario()` - Obtiene usuario con fallback a "SYSTEM"

**Archivos modificados:**
```
backend/src/main/java/com/styp/cenate/service/mbac/impl/AuditoriaServiceImpl.java
frontend/src/pages/AdminDashboard.js
frontend/src/pages/admin/LogsDelSistema.jsx
spec/scripts/002_rename_logs_to_auditoria.sql (NUEVO)
```

---

## v1.7.9 (2025-12-23) - Dashboard ChatBot Mejorado

### Footer con Version del Sistema en toda la Intranet

Se agrego un footer visible en todas las paginas de la intranet mostrando la version del sistema.

**Ubicaciones del footer con version:**

| Ubicacion | Archivo | Contenido |
|-----------|---------|-----------|
| Sidebar | `DynamicSidebar.jsx` | `v{VERSION.number}` |
| Intranet (todas las paginas) | `AppLayout.jsx` | Nombre, organizacion, version |
| Login | `Login.js` | `CENATE v{VERSION.number}` |
| Crear Cuenta | `CrearCuenta.jsx` | `CENATE v{VERSION.number}` |
| Recuperar Contrasena | `PasswordRecovery.js` | `CENATE v{VERSION.number}` |
| Home (publico) | `FooterCenate.jsx` | Version completa con links |

**Archivo de configuracion centralizado:**

```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.9",
  name: "Dashboard ChatBot Mejorado",
  date: "2025-12-23",
  description: "..."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};
```

**Archivo modificado:**

```
frontend/src/components/AppLayout.jsx
├── Importado VERSION y APP_INFO desde config/version.js
└── Agregado footer al final del contenido con version dinamica
```

---

### Correccion de mapeo de estado en Dashboard de Citas

Se corrigio el mapeo del campo estado en `ChatbotBusqueda.jsx` que mostraba "N/A" y se agrego funcionalidad para cambiar el estado de las citas.

**Problema resuelto:**

El campo "Estado" en la tabla de citas mostraba "N/A" porque el frontend buscaba campos incorrectos (`cod_estado_cita`, `codEstadoCita`) cuando el backend retorna `descEstadoPaciente`.

**Correccion aplicada:**

```javascript
// Antes (incorrecto)
estado: c.cod_estado_cita || c.codEstadoCita || c.estadoPaciente || c.estado

// Ahora (correcto)
estado: c.desc_estado_paciente || c.descEstadoPaciente || c.estadoPaciente || c.estado
```

### Nueva funcionalidad: Cambiar Estado de Citas

Se agrego columna de acciones con boton para cambiar el estado de las citas.

**Caracteristicas:**

| Funcionalidad | Descripcion |
|---------------|-------------|
| Columna Acciones | Nueva columna en tabla con boton "Editar" |
| Modal de Estado | Formulario para seleccionar nuevo estado |
| Catalogo de Estados | Carga desde `/api/v1/chatbot/estado-cita` |
| Observacion | Campo opcional para registrar motivo del cambio |
| Actualizacion | Llama a `PUT /api/v1/chatbot/solicitud/estado/{id}` |

**Estados disponibles:**
- PENDIENTE
- RESERVADO
- CONFIRMADA
- CANCELADA
- NO_PRESENTADO
- ATENDIDO

**Archivos modificados:**

```
frontend/src/pages/chatbot/ChatbotBusqueda.jsx
├── Corregido normalizeCita() - mapeo de estado
├── Corregido actualizarOpciones() - opciones de filtro
├── Corregido calcularKPIs() - conteo de reservadas
├── Agregado estado para modal (modalEstado, nuevoEstado, etc.)
├── Agregado cargarCatalogoEstados() - cargar estados del backend
├── Agregado abrirModalEstado() / cerrarModalEstado()
├── Agregado cambiarEstadoCita() - llamada API
├── Agregado columna "Acciones" en thead
├── Agregado boton "Editar" en cada fila
└── Agregado Modal de cambio de estado
```

---

## v1.7.8 (2025-12-23) - Integracion ChatBot de Citas

### Sistema de Solicitud de Citas Medicas via ChatBot

Se integro el modulo de ChatBot desarrollado externamente (`chatbot-erick`) al proyecto principal React, migrando los archivos HTML a componentes React siguiendo los patrones del sistema.

**Funcionalidades principales:**

| Funcionalidad | Descripcion |
|---------------|-------------|
| Consulta de paciente | Buscar por DNI, obtener datos y servicios disponibles |
| Disponibilidad | Ver fechas y horarios disponibles por servicio |
| Solicitud de cita | Generar solicitud con validacion de conflictos |
| Dashboard reportes | KPIs, filtros avanzados, tabla paginada, exportar CSV |

### Archivos Creados

**Servicio API:**
```
frontend/src/services/chatbotService.js
```

Funciones disponibles:
- `consultarPaciente(documento)` - Consultar datos del paciente
- `getFechasDisponibles(codServicio)` - Obtener fechas disponibles
- `getSlotsDisponibles(fecha, codServicio)` - Obtener horarios disponibles
- `crearSolicitud(solicitud)` - Crear solicitud de cita
- `buscarCitas(filtros)` - Buscar citas con filtros
- `getKPIs(filtros)` - Obtener KPIs del dashboard
- Y mas...

**Componentes React:**
```
frontend/src/pages/chatbot/ChatbotCita.jsx     - Wizard de 3 pasos
frontend/src/pages/chatbot/ChatbotBusqueda.jsx - Dashboard de reportes
```

**Script SQL para menu dinamico:**
```
spec/sql/chatbot_menu_setup.sql
```

### Rutas Configuradas

```jsx
// App.js - Nuevas rutas protegidas
<Route path="/chatbot/cita" element={<ChatbotCita />} />
<Route path="/chatbot/busqueda" element={<ChatbotBusqueda />} />
```

### Flujo del Wizard (ChatbotCita.jsx)

```
Paso 1: Consultar Paciente
├── Input: Numero de documento (DNI/CE)
├── Endpoint: GET /api/chatbot/documento/{doc}
└── Output: Datos del paciente + servicios disponibles

Paso 2: Seleccionar Disponibilidad
├── 2a. Seleccionar servicio
│   ├── Endpoint: GET /api/v2/chatbot/disponibilidad/servicio?codServicio=
│   └── Output: Lista de fechas disponibles
├── 2b. Seleccionar horario
│   ├── Endpoint: GET /api/v2/chatbot/disponibilidad/servicio-detalle?fecha_cita=&cod_servicio=
│   └── Output: Lista de slots con profesionales

Paso 3: Confirmar Solicitud
├── Resumen de cita seleccionada
├── Campo de observaciones
├── Endpoint: POST /api/v1/chatbot/solicitud
└── Output: Confirmacion con numero de solicitud
```

### Dashboard de Reportes (ChatbotBusqueda.jsx)

**KPIs mostrados:**
- Total de citas
- Citas reservadas
- Pacientes unicos
- Profesionales activos

**Filtros disponibles:**
- Fecha inicio/fin
- Periodo (YYYYMM)
- DNI Paciente
- DNI Personal
- Area hospitalaria
- Servicio
- Estado

**Funcionalidades:**
- Tabla paginada (10 registros por pagina)
- Exportar a CSV
- Mostrar/Ocultar filtros
- Badges de estado con colores

### Iconos Agregados

```javascript
// DynamicSidebar.jsx - Nuevos iconos de Lucide
import { MessageSquare, Bot } from "lucide-react";

const iconMap = {
  // ... iconos existentes
  'MessageSquare': MessageSquare,
  'Bot': Bot,
};
```

### Endpoints Backend Utilizados

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{doc}` | Consultar paciente |
| GET | `/api/chatbot/atencioncenate` | Atenciones CENATE |
| GET | `/api/chatbot/atencionglobal/{doc}` | Atenciones globales |
| GET | `/api/v2/chatbot/disponibilidad/servicio` | Fechas disponibles |
| GET | `/api/v2/chatbot/disponibilidad/servicio-detalle` | Slots horarios |
| POST | `/api/v1/chatbot/solicitud` | Crear solicitud |
| PUT | `/api/v1/chatbot/solicitud/{id}` | Actualizar solicitud |
| PUT | `/api/v1/chatbot/solicitud/estado/{id}` | Cambiar estado |
| GET | `/api/v1/chatbot/solicitud/paciente/{doc}` | Solicitudes del paciente |
| GET | `/api/v1/chatbot/estado-cita` | Catalogo de estados |
| GET | `/api/v1/chatbot/reportes/citas/buscar` | Busqueda avanzada |

### Configuracion del Menu (Base de Datos)

Para activar el menu en el sidebar, ejecutar:

```sql
-- Crear modulo
INSERT INTO dim_modulos_sistema (nombre, icono, orden, activo)
VALUES ('ChatBot Citas', 'Bot', 15, true);

-- Crear paginas
INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, orden, activo)
SELECT id_modulo, 'Solicitar Cita', '/chatbot/cita', 1, true
FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, orden, activo)
SELECT id_modulo, 'Dashboard Citas', '/chatbot/busqueda', 2, true
FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

-- Asignar permisos (ver script completo en spec/sql/chatbot_menu_setup.sql)
```

### Documentacion Tecnica

Se creo documento de analisis arquitectural completo:
```
spec/006_chatbot_citas_ANALYSIS.md
```

Contenido:
- Analisis de impacto (Backend, Frontend, BD)
- Propuesta de solucion
- Plan de implementacion por fases
- Diagramas de arquitectura
- Esquemas de tablas SQL
- Checklist de validacion

---

## v1.7.7 (2025-12-23) - Documentacion de Usuarios

### Especificacion tecnica del sistema de usuarios

Se creo documentacion completa del modelo de datos de usuarios en:
`spec/001_espec_users_bd.md`

**Contenido del documento:**

| Seccion | Descripcion |
|---------|-------------|
| Diagrama ERD | Relaciones entre tablas de usuarios |
| Tablas principales | dim_usuarios, dim_personal_cnt, account_requests |
| Clasificacion INTERNO/EXTERNO | Logica por id_origen y codigo Java |
| Flujo de registro | Diagrama de secuencia completo |
| Estados de usuario | Ciclo de vida de solicitudes y usuarios |
| Cascada de eliminacion | Orden correcto para evitar FK errors |
| Roles del sistema | 20 roles con tipos asignados |
| Endpoints API | Todos los endpoints de usuarios |
| Queries diagnostico | SQL utiles para debugging |

**Tablas documentadas:**

```
dim_usuarios          - Credenciales de acceso
dim_personal_cnt      - Datos personales (INTERNO y EXTERNO)
account_requests      - Solicitudes de registro
dim_origen_personal   - Clasificacion (1=INTERNO, 2=EXTERNO)
rel_user_roles        - Relacion usuario-rol (M:N)
dim_personal_prof     - Profesiones del personal
dim_personal_tipo     - Tipo de profesional
```

**Logica de clasificacion INTERNO/EXTERNO:**

```java
// Por id_origen en dim_personal_cnt:
// id_origen = 1 -> INTERNO
// id_origen = 2 -> EXTERNO

// Por existencia en tablas:
if (personalCnt != null) tipoPersonal = "INTERNO";
else if (personalExterno != null) tipoPersonal = "EXTERNO";
else tipoPersonal = "SIN_CLASIFICAR";
```

### Limpieza de base de datos

Se ejecuto limpieza de 11 solicitudes APROBADAS sin usuario creado:

**DNIs liberados:**
- 99999999, 66666666, 12345679, 56321456, 98575642
- 14851616, 45151515, 54544545, 45415156, 99921626, 87654321

**Correo liberado:** cenate.analista@essalud.gob.pe (estaba bloqueado)

**Estado final de la BD:**

| Metrica | Valor |
|---------|-------|
| Usuarios totales | 100 |
| Pendientes activacion | 90 |
| Solicitudes APROBADAS | 4 (validas) |
| Solicitudes RECHAZADAS | 21 |
| Datos huerfanos | 0 |
| DNIs duplicados | 0 |

---

## v1.7.6 (2025-12-23) - Limpieza de Datos Huerfanos

### Sistema de limpieza de datos residuales

Se mejoro el proceso de eliminacion de usuarios y se agregaron nuevos endpoints para diagnosticar y limpiar datos huerfanos que impiden el re-registro de usuarios.

**Problema resuelto:**

Cuando un usuario era eliminado (ej: desde "Pendientes de Activacion"), podian quedar datos huerfanos en las siguientes tablas:
- `dim_usuarios` - Usuario sin eliminar
- `dim_personal_cnt` - Personal sin usuario asociado
- `dim_personal_prof` - Profesiones del personal
- `dim_personal_tipo` - Tipos de profesional
- `account_requests` - Solicitudes en estado APROBADO

Esto impedia que el usuario volviera a registrarse con el mismo DNI.

**Mejoras al proceso de eliminacion:**

El metodo `eliminarUsuarioPendienteActivacion()` ahora tambien elimina:
- `dim_personal_prof` - Profesiones asociadas al personal
- `dim_personal_tipo` - Tipos de profesional asociados

**Nuevos endpoints:**

```java
// Verificar datos existentes para un DNI (GET)
GET /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEncontrados, personalesEncontrados, solicitudesActivas, puedeRegistrarse, razonBloqueo }

// Limpiar todos los datos huerfanos de un DNI (DELETE)
DELETE /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEliminados, personalesEliminados, solicitudesActualizadas, totalRegistrosEliminados }
```

**Nuevos metodos en AccountRequestService:**

```java
public Map<String, Object> limpiarDatosHuerfanos(String numDocumento)
public Map<String, Object> verificarDatosExistentes(String numDocumento)
```

**Tablas afectadas en la limpieza (orden correcto):**
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_usuario = ?;
DELETE FROM dim_personal_prof WHERE id_pers = ?;
DELETE FROM dim_personal_tipo WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

**Archivos modificados:**
- `AccountRequestService.java` - Mejorado eliminacion, nuevos metodos
- `SolicitudRegistroController.java` - Nuevos endpoints

---

## v1.7.5 (2025-12-23) - Panel de Activaciones Mejorado

### Panel completo para gestion de usuarios pendientes de activacion

**Nueva pestana en Aprobacion de Solicitudes:**

Se agrego una segunda pestana "Pendientes de Activacion" en `AprobacionSolicitudes.jsx` que muestra usuarios aprobados que aun no han configurado su contrasena.

**Caracteristicas del panel:**

1. **Pestanas de navegacion:**
   - "Solicitudes de Registro" - Flujo original de aprobacion
   - "Pendientes de Activacion" - Lista usuarios con `requiere_cambio_password = true`

2. **Buscador integrado:**
   - Filtra por nombre completo, documento, correo
   - Muestra contador de resultados filtrados

3. **Acciones por usuario:**
   - **Reenviar Email**: Genera nuevo token y envia correo de activacion
   - **Eliminar**: Elimina usuario para permitir re-registro

**Endpoints del backend:**
```java
GET /api/admin/usuarios/pendientes-activacion
POST /api/admin/usuarios/{idUsuario}/reenviar-activacion
```

**Correccion de Lazy Loading:**
El metodo ahora usa SQL directo para obtener el email, evitando problemas de lazy loading con JPA.

---

## v1.7.4 (2025-12-23) - Gestion de Activaciones

### Nueva funcionalidad: Eliminar usuarios pendientes de activacion

Permite al administrador eliminar usuarios que fueron aprobados pero nunca activaron su cuenta.

**Backend Controller:**
```java
@DeleteMapping("/admin/usuarios/{idUsuario}/pendiente-activacion")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<?> eliminarUsuarioPendiente(@PathVariable Long idUsuario)
```

**Tablas afectadas (orden correcto para evitar FK constraints):**
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

### Validacion mejorada: Permitir re-registro

Ahora los usuarios pueden volver a registrarse si su solicitud anterior fue RECHAZADA.

```java
// Solo bloquea si hay solicitud PENDIENTE o APROBADO (no RECHAZADO)
@Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.numDocumento = :numDoc AND a.estado IN ('PENDIENTE', 'APROBADO')")
boolean existsSolicitudActivaByNumDocumento(String numDocumento);
```

### URL del Frontend configurable para emails

```properties
app.frontend.url=${FRONTEND_URL:http://10.0.89.239}
```

---

## v1.7.3 (2025-12-23) - Busqueda por Email

### Busqueda de usuarios por correo electronico

El filtro de busqueda general ahora incluye campos de email:
- Correo personal (`correo_personal`)
- Correo corporativo (`correo_corporativo`)
- Correo institucional (`correo_institucional`)

**Nota importante sobre serializacion:**
El backend usa `@JsonProperty` para serializar campos en **snake_case**.

---

## v1.7.2 (2025-12-23) - Seguridad y UX

### Sistema de Versiones Centralizado

```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.0",
  name: "Documentacion y Arquitectura",
  date: "2025-12-23"
};
```

### Validacion de Usuario en Login

- Solo permite numeros y letras (DNI, pasaporte, carnet extranjeria)
- Automaticamente convierte a mayusculas
- maxLength={12}

### Correccion de Aprobacion de Solicitudes

**Problema:** El correo de bienvenida no se enviaba al aprobar solicitudes.
**Causa:** `usuario.getNombreCompleto()` intentaba acceder a `personalCnt` con lazy loading.
**Solucion:** Nuevo metodo sobrecargado que acepta nombre completo explicito.

### Flujo Seguro de Activacion

```
1. Admin aprueba solicitud
2. Sistema crea usuario con contrasena temporal ALEATORIA
3. Sistema genera token de activacion (24h)
4. Sistema envia email con enlace: /cambiar-contrasena?token=xxx
5. Usuario configura su propia contrasena
6. Token se invalida despues de usar
```

**La contrasena NUNCA se envia en texto plano.**

---

## v1.7.1 (2025-12-23) - Configuracion y Correcciones

### Configuracion de Infraestructura

**Base de Datos Remota:**
- Servidor: `10.0.89.13:5432`
- Base de datos: `maestro_cenate`
- Usuario: `postgres` / Contrasena: `Essalud2025`

**Email SMTP (Gmail):**
- Cuenta: `cenateinformatica@gmail.com`
- Contrasena de aplicacion configurada
- Funcionalidades: Recuperacion de contrasena, aprobacion/rechazo de solicitudes

### Correcciones de Bugs

- `apiClient.js`: Corregido manejo de errores para leer tanto `data.message` como `data.error`
- `CrearCuenta.jsx`: Corregido para mostrar `err.message`
- `AccountRequestService.java`: Agregada validacion de correo electronico duplicado
- `AccountRequestRepository.java`: Agregado metodo `existsByCorreoPersonal()`

### Flujos Verificados

1. **Recuperacion de Contrasena:** Usuario solicita -> Sistema genera token -> Usuario cambia contrasena
2. **Solicitud de Registro:** Usuario externo completa formulario -> Admin aprueba/rechaza -> Sistema envia email

---

## Contactos del Sistema

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |
