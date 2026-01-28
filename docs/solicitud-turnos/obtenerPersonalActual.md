# 📋 Documentación - Método `obtenerPersonalActual()`

## 📍 Ubicación
**Clase:** `SolicitudTurnoIpressServiceImpl`  
**Paquete:** `com.styp.cenate.service.solicitudturno.impl`  
**Archivo:** `backend/src/main/java/com/styp/cenate/service/solicitudturno/impl/SolicitudTurnoIpressServiceImpl.java`

---

## 🎯 Descripción
Método privado que obtiene el objeto `PersonalCnt` del usuario autenticado actualmente en la sesión. Se utiliza para asociar automáticamente las solicitudes de turnos con el personal correspondiente sin necesidad de que el frontend envíe esta información.

---

## 🔧 Implementación

```java
private PersonalCnt obtenerPersonalActual() {
    // 1. Obtiene el username del usuario autenticado desde el SecurityContext
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    
    // 2. Busca el Usuario en la base de datos
    Usuario usuario = usuarioRepository.findByNameUser(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    
    // 3. Busca el PersonalCnt asociado a ese usuario
    return personalCntRepository.findByUsuario_IdUser(usuario.getIdUser())
            .orElseThrow(() -> new RuntimeException("Personal no encontrado para el usuario: " + username));
}
```

---

## 📦 Valores que Devuelve

El método retorna un objeto **`PersonalCnt`** con los siguientes campos:

### 🆔 Identificador Principal

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `idPers` | `Long` | ID único del personal (código del personal) | `123` |

### 🧍 Datos Personales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nomPers` | `String` | Nombres del personal | `"Juan Carlos"` |
| `apePaterPers` | `String` | Apellido paterno | `"García"` |
| `apeMaterPers` | `String` | Apellido materno | `"López"` |
| `numDocPers` | `String` | Número de documento (DNI) | `"12345678"` |
| `fechNaciPers` | `LocalDate` | Fecha de nacimiento | `1990-05-15` |
| `genPers` | `String` | Género (M/F) | `"M"` |
| `emailPers` | `String` | Email personal | `"juan@gmail.com"` |
| `emailCorpPers` | `String` | Email corporativo | `"juan.garcia@cenate.gob.pe"` |
| `emailPreferido` | `String` | Preferencia de email (PERSONAL/INSTITUCIONAL) | `"INSTITUCIONAL"` |
| `movilPers` | `String` | Teléfono móvil | `"987654321"` |
| `fotoPers` | `String` | Ruta/URL de la foto | `"/uploads/fotos/juan.jpg"` |
| `direcPers` | `String` | Dirección | `"Av. Principal 123"` |

### ⚙️ Datos Laborales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `statPers` | `String` | Estado (A=Activo, I=Inactivo) | `"A"` |
| `codPlanRem` | `String` | Código de planilla/remuneración | `"PL001"` |
| `colegPers` | `String` | Número de colegiatura | `"12345"` |
| `perPers` | `String` | Período | `"2026"` |

### 🕓 Auditoría

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `createdAt` | `OffsetDateTime` | Fecha de creación del registro | `2025-01-15T10:30:00Z` |
| `updatedAt` | `OffsetDateTime` | Fecha de última actualización | `2026-01-20T14:45:00Z` |

### 🔗 Relaciones (Objetos Relacionados)

| Campo | Tipo | Descripción | Nota |
|-------|------|-------------|------|
| `area` | `Area` | Área a la que pertenece | `LAZY` - Cargado bajo demanda |
| `regimenLaboral` | `RegimenLaboral` | Régimen laboral | `LAZY` - Cargado bajo demanda |
| `tipoDocumento` | `TipoDocumento` | Tipo de documento (DNI, CE, etc.) | `LAZY` - Cargado bajo demanda |
| `ipress` | `Ipress` | IPRESS asignada | `LAZY` - Cargado bajo demanda |
| `usuario` | `Usuario` | Usuario asociado | `LAZY` - Cargado bajo demanda |
| `servicioEssi` | `DimServicioEssi` | Servicio/Especialidad ESSI | `LAZY` - Cargado bajo demanda |
| `origenPersonal` | `DimOrigenPersonal` | Origen del personal | `LAZY` - Cargado bajo demanda |
| `profesiones` | `Set<PersonalProf>` | Profesiones del personal | `LAZY` - Cargado bajo demanda |
| `tipos` | `Set<PersonalTipo>` | Tipos de personal | `LAZY` - Cargado bajo demanda |
| `ocs` | `Set<PersonalOc>` | OCs (Órdenes de Compra) | `LAZY` - Cargado bajo demanda |
| `firmas` | `Set<PersonalFirma>` | Firmas digitales | `LAZY` - Cargado bajo demanda |

---

## 🧩 Métodos Utilitarios Disponibles

El objeto `PersonalCnt` incluye métodos helper que pueden ser útiles:

### `getNombreCompleto()`
```java
String nombreCompleto = personal.getNombreCompleto();
// Retorna: "Juan Carlos García López"
```

### `obtenerCorreoPreferido()`
```java
String email = personal.obtenerCorreoPreferido();
// Retorna el email según la preferencia del usuario
// Si prefiere INSTITUCIONAL → emailCorpPers (o emailPers como fallback)
// Si prefiere PERSONAL → emailPers (o emailCorpPers como fallback)
```

### `isActivo()`
```java
boolean activo = personal.isActivo();
// Retorna true si statPers == "A"
```

### `getNombreArea()`
```java
String nombreArea = personal.getNombreArea();
// Retorna el nombre del área o "—" si no tiene
```

### `getNombreRegimen()`
```java
String regimen = personal.getNombreRegimen();
// Retorna el nombre del régimen laboral o "—" si no tiene
```

### `getNombreTipoDocumento()`
```java
String tipoDoc = personal.getNombreTipoDocumento();
// Retorna el nombre del tipo de documento o "—" si no tiene
```

### `getFotoUrl()`
```java
String fotoUrl = personal.getFotoUrl();
// Retorna la URL de la foto o "/images/default-profile.png" si no tiene
```

---

## 📊 Ejemplo de Uso en el Código

### Crear Solicitud
```java
@Override
@Transactional
public SolicitudTurnoIpressResponse crear(SolicitudTurnoIpressRequest request) {
    // Obtener el personal del usuario autenticado
    PersonalCnt personal = obtenerPersonalActual();
    
    log.info("Creando solicitud para usuario {} en periodo {}", 
             personal.getIdPers(), request.getIdPeriodo());
    
    // Crear solicitud asociada al personal
    SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder()
        .periodo(periodo)
        .personal(personal)  // ← Se asigna automáticamente
        .estado("INICIADO")
        .totalEspecialidades(0)
        .totalTurnosSolicitados(0)
        .build();
    
    // ... resto del código
}
```

### Listar Mis Solicitudes
```java
@Override
public List<SolicitudTurnoIpressResponse> listarMisSolicitudes() {
    PersonalCnt personal = obtenerPersonalActual();
    log.info("Listando solicitudes del usuario: {}", personal.getIdPers());
    
    return solicitudRepository
        .findByPersonalIdPersOrderByCreatedAtDesc(personal.getIdPers())
        .stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
}
```

### Obtener Mi IPRESS
```java
@Override
public MiIpressResponse obtenerMiIpress() {
    PersonalCnt personal = obtenerPersonalActual();
    
    MiIpressResponse.MiIpressResponseBuilder builder = MiIpressResponse.builder()
        .idPers(personal.getIdPers())
        .dniUsuario(personal.getNumDocPers())
        .nombreCompleto(personal.getNombreCompleto())
        .emailContacto(
            personal.getEmailCorpPers() != null 
                ? personal.getEmailCorpPers() 
                : personal.getEmailPers()
        )
        .telefonoContacto(personal.getMovilPers());
    
    // Obtener datos de IPRESS si existe
    Ipress ipress = personal.getIpress();
    if (ipress != null) {
        builder.idIpress(ipress.getIdIpress())
               .codIpress(ipress.getCodIpress())
               .nombreIpress(ipress.getDescIpress());
    }
    
    return builder.build();
}
```

---

## ⚠️ Manejo de Errores

El método puede lanzar las siguientes excepciones:

### `RuntimeException: "Usuario no encontrado: {username}"`
**Causa:** El username del token no existe en la base de datos.

**Solución:** Verificar que el usuario esté correctamente registrado.

### `RuntimeException: "Personal no encontrado para el usuario: {username}"`
**Causa:** El usuario existe pero no tiene un registro de `PersonalCnt` asociado.

**Solución:** Crear el registro de personal para ese usuario.

---

## 🔐 Seguridad

- El método utiliza `SecurityContextHolder` para obtener el usuario autenticado.
- No requiere parámetros adicionales, todo se obtiene del contexto de seguridad.
- Garantiza que solo se puede acceder a datos del propio usuario autenticado.

---

## 📝 Notas Importantes

1. **Carga Lazy:** Las relaciones (area, ipress, etc.) se cargan bajo demanda. Si necesitas acceder a ellas, asegúrate de que la sesión de Hibernate esté activa o usa `@Transactional`.

2. **ID del Personal:** El campo más importante es `idPers`, que es el código del personal usado para asociar solicitudes.

3. **No se envía desde Frontend:** El frontend **NO** debe enviar el código del personal. El backend lo obtiene automáticamente.

4. **Uso Interno:** Este método es `private` y solo se usa dentro de la clase `SolicitudTurnoIpressServiceImpl`.

---

## 🔗 Archivos Relacionados

- **Modelo:** `backend/src/main/java/com/styp/cenate/model/PersonalCnt.java`
- **Repository:** `backend/src/main/java/com/styp/cenate/repository/PersonalCntRepository.java`
- **Service:** `backend/src/main/java/com/styp/cenate/service/solicitudturno/impl/SolicitudTurnoIpressServiceImpl.java`

---

**Última actualización:** 2026-01-27
