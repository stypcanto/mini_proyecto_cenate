# 📋 Documentación - Obtención del Código del Personal en Solicitud de Turnos

## 📍 Ubicación del Módulo
**Frontend:** `frontend/src/pages/roles/externo/solicitud-turnos/`  
**Backend Controller:** `SolicitudTurnoIpressController`  
**Backend Service:** `SolicitudTurnoIpressServiceImpl`  
**Base URL API:** `/api/solicitudes-turno`

---

## 🎯 Resumen Ejecutivo

**El código del personal (`idPers`) NO se envía desde el frontend.** El backend lo obtiene automáticamente del usuario autenticado mediante el token JWT. Esto garantiza seguridad y evita que usuarios modifiquen datos de otros usuarios.

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario hace LOGIN                                           │
│    → Token JWT generado con username                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend envía solicitud                                     │
│    POST /api/solicitudes-turno/borrador                         │
│    Headers: Authorization: Bearer <token>                       │
│    Body: { idPeriodo, detalles, ... }                          │
│    ❌ NO incluye idPers                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend recibe request                                       │
│    → Extrae username del SecurityContext                        │
│    → Llama a obtenerPersonalActual()                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend busca PersonalCnt                                    │
│    Usuario → PersonalCnt → idPers                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Backend crea solicitud                                       │
│    SolicitudTurnoIpress.personal = personal                     │
│    (idPers se asocia automáticamente)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Backend: Obtención Automática

### Método Principal

**Ubicación:** `SolicitudTurnoIpressServiceImpl.obtenerPersonalActual()`

```java
private PersonalCnt obtenerPersonalActual() {
    // 1. Obtiene el username del usuario autenticado
    String username = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();
    
    // 2. Busca el Usuario en la base de datos
    Usuario usuario = usuarioRepository.findByNameUser(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    
    // 3. Busca el PersonalCnt asociado a ese usuario
    return personalCntRepository.findByUsuario_IdUser(usuario.getIdUser())
        .orElseThrow(() -> new RuntimeException("Personal no encontrado para el usuario: " + username));
}
```

### Uso en Crear Solicitud

```java
@Override
@Transactional
public SolicitudTurnoIpressResponse crear(SolicitudTurnoIpressRequest request) {
    // ✅ Obtiene el personal del usuario autenticado automáticamente
    PersonalCnt personal = obtenerPersonalActual();
    
    log.info("Creando solicitud para usuario {} en periodo {}", 
             personal.getIdPers(), request.getIdPeriodo());
    
    // Validar que no exista solicitud previa
    if (solicitudRepository.existsByPeriodoIdPeriodoAndPersonalIdPers(
            request.getIdPeriodo(), personal.getIdPers())) {
        throw new RuntimeException("Ya existe una solicitud para este periodo.");
    }
    
    // Crear solicitud asociada al personal
    SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder()
        .periodo(periodo)
        .personal(personal)  // ← idPers se asocia aquí automáticamente
        .estado("INICIADO")
        .totalEspecialidades(0)
        .totalTurnosSolicitados(0)
        .build();
    
    solicitud = solicitudRepository.save(solicitud);
    // ... resto del código
}
```

### Uso en Guardar Borrador

```java
@Override
@Transactional
public SolicitudTurnoIpressResponse guardarBorrador(
        SolicitudTurnoIpressBorradorRequest request) {
    // ✅ Obtiene el personal automáticamente
    PersonalCnt personal = obtenerPersonalActual();
    
    // Verificar si ya existe una solicitud
    var existente = solicitudRepository.findByPeriodoIdPeriodoAndPersonalIdPers(
        request.getIdPeriodo(), personal.getIdPers());
    
    if (existente.isPresent()) {
        // Actualizar existente
        SolicitudTurnoIpress solicitud = existente.get();
        // ... actualizar detalles
    } else {
        // Crear nueva
        SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder()
            .periodo(periodo)
            .personal(personal)  // ← idPers automático
            .estado("BORRADOR")
            .build();
    }
}
```

---

## 🎨 Frontend: NO Envía el Código

### Estructura del Payload

El frontend **NO incluye** el código del personal en el payload:

```javascript
// frontend/src/pages/roles/externo/solicitud-turnos/FormularioSolicitudTurnos.jsx

const buildPayload = () => {
  if (!periodoSeleccionado?.idPeriodo) return null;

  const todosLosDetalles = (registros || []).map((r) => {
    return {
      idServicio: r.idServicio,
      idDetalle: r.idDetalle || null,
      requiere: totalTurnos > 0,
      turnos: totalTurnos,
      turnoManana: turnoManana,
      turnoTarde: turnoTarde,
      tc: r.tc !== undefined ? r.tc : false,
      tl: r.tl !== undefined ? r.tl : false,
      observacion: "",
      estado: r.estado || "PENDIENTE"
    };
  });

  // ❌ NO incluye idPers
  const payload = {
    idPeriodo: periodoSeleccionado.idPeriodo,
    totalTurnosSolicitados: totalTurnosSolicitados,
    totalEspecialidades: totalEspecialidades,
    detalles: detallesConTurnos,
    detallesEliminar: detallesEliminar
    // ❌ NO hay campo idPers aquí
  };

  // Solo si es edición, incluir idSolicitud
  if (solicitudActual?.idSolicitud) {
    payload.idSolicitud = solicitudActual.idSolicitud;
  }

  return { payloadCompat: payload };
};
```

### Envío de la Solicitud

```javascript
const handleGuardarBorrador = async () => {
  setSaving(true);
  try {
    const { payloadCompat } = buildPayload();
    
    // El payload NO incluye idPers
    // El backend lo obtiene automáticamente del token
    const resultado = await solicitudTurnoService.guardarBorrador(payloadCompat);
    
    setSolicitudActual(resultado);
    setSuccess("Progreso guardado exitosamente");
  } catch (err) {
    setError(err?.message || "Error al guardar");
  } finally {
    setSaving(false);
  }
};
```

---

## 📊 DTOs y Estructura de Datos

### SolicitudTurnoIpressRequest (Backend)

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnoIpressRequest {
    @NotNull(message = "El id del periodo es obligatorio")
    private Long idPeriodo;

    @Valid
    private List<DetalleSolicitudTurnoRequest> detalles;
    
    // ❌ NO tiene campo idPers
    // Nota en el código: "idPers se obtiene automáticamente del usuario autenticado"
}
```

### SolicitudTurnoIpressResponse (Backend)

```java
@Data
@Builder
public class SolicitudTurnoIpressResponse {
    private Long idSolicitud;
    private Long idPeriodo;
    private String estado;
    
    // ✅ Datos del usuario (incluidos en la respuesta)
    private Long idPers;              // ← Código del personal
    private String dniUsuario;
    private String nombreCompleto;
    private String emailContacto;
    private String telefonoContacto;
    
    // ✅ Datos de IPRESS (auto-detectados)
    private Long idIpress;
    private String codIpress;
    private String nombreIpress;
    
    // ✅ Datos de Red (auto-detectados)
    private Long idRed;
    private String nombreRed;
    
    private List<DetalleSolicitudTurnoResponse> detalles;
    private Integer totalTurnosSolicitados;
    private Integer totalEspecialidades;
}
```

### Modelo SolicitudTurnoIpress

```java
@Entity
@Table(name = "solicitud_turno_ipress", schema = "public",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_periodo", "id_pers"}))
public class SolicitudTurnoIpress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoSolicitudTurno periodo;
    
    // ✅ Relación con PersonalCnt (idPers se guarda aquí)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers", nullable = false)
    private PersonalCnt personal;  // ← Contiene idPers
    
    @Column(name = "estado", length = 20)
    private String estado = "BORRADOR";
    
    // ... otros campos
}
```

---

## 🔍 Consulta de Datos del Usuario (Frontend)

Aunque el frontend no envía el código del personal, puede **consultar** los datos del usuario mediante el endpoint `/mi-ipress`:

### Endpoint

```javascript
// GET /api/solicitudes-turno/mi-ipress
const miIpress = await solicitudTurnoService.obtenerMiIpress();
```

### Respuesta

```json
{
  "idPers": 123,                    // ← Código del personal
  "dniUsuario": "12345678",
  "nombreCompleto": "Juan García López",
  "emailContacto": "juan@cenate.gob.pe",
  "telefonoContacto": "987654321",
  "idIpress": 45,
  "codIpress": "IPRESS001",
  "nombreIpress": "Centro de Salud Lima",
  "idRed": 5,
  "nombreRed": "Red Lima Norte",
  "datosCompletos": true,
  "mensajeValidacion": "Datos completos"
}
```

### Uso en el Componente

```javascript
// frontend/src/pages/roles/externo/solicitud-turnos/FormularioSolicitudTurnos.jsx

const [miIpress, setMiIpress] = useState(null);

const inicializar = async () => {
  try {
    // Obtener datos del usuario/IPRESS
    const ipressData = await solicitudTurnoService.obtenerMiIpress();
    setMiIpress(ipressData);
    
    // ipressData contiene:
    // - idPers: código del personal
    // - codIpress: código de la IPRESS
    // - nombreIpress: nombre de la IPRESS
    // - etc.
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  inicializar();
}, []);
```

---

## 🔐 Seguridad y Validaciones

### Validación de Propietario

El backend valida que solo el propietario pueda modificar su solicitud:

```java
private void validarPropietario(SolicitudTurnoIpress solicitud) {
    PersonalCnt personal = obtenerPersonalActual();
    if (!solicitud.getPersonal().getIdPers().equals(personal.getIdPers())) {
        throw new RuntimeException("No tiene permisos para modificar esta solicitud");
    }
}
```

### Uso en Actualización

```java
@Override
@Transactional
public SolicitudTurnoIpressResponse actualizar(Long id, SolicitudTurnoIpressRequest request) {
    SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    
    // ✅ Validar que el usuario autenticado sea el propietario
    validarPropietario(solicitud);
    
    // ... actualizar solicitud
}
```

---

## 📝 Notas Importantes

### ✅ Lo que SÍ hace el Frontend
1. Envía `idPeriodo` (período seleccionado)
2. Envía `detalles` (especialidades y turnos)
3. Envía `totalTurnosSolicitados` y `totalEspecialidades`
4. Puede consultar datos del usuario con `/mi-ipress`

### ❌ Lo que NO hace el Frontend
1. **NO envía `idPers`** (código del personal)
2. **NO envía `idIpress`** (código de IPRESS)
3. **NO envía `idRed`** (código de red)
4. **NO envía datos de contacto** (email, teléfono)

### ✅ Lo que hace el Backend
1. Obtiene `idPers` automáticamente del token
2. Obtiene `idIpress` desde la relación PersonalCnt → Ipress
3. Obtiene `idRed` desde la relación Ipress → Red
4. Obtiene datos de contacto desde PersonalCnt
5. Valida que el usuario solo pueda modificar sus propias solicitudes

---

## 🧪 Ejemplos Prácticos

### Ejemplo 1: Crear Nueva Solicitud

**Frontend:**
```javascript
const payload = {
  idPeriodo: 5,
  totalTurnosSolicitados: 20,
  totalEspecialidades: 3,
  detalles: [
    {
      idServicio: 10,
      turnos: 10,
      turnoManana: 5,
      turnoTarde: 5,
      tc: true,
      tl: false
    }
  ]
};

await solicitudTurnoService.guardarBorrador(payload);
```

**Backend (automático):**
```java
// 1. Obtiene personal del token
PersonalCnt personal = obtenerPersonalActual(); // idPers = 123

// 2. Crea solicitud
SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder()
    .periodo(periodo)           // idPeriodo = 5
    .personal(personal)         // idPers = 123 (automático)
    .estado("BORRADOR")
    .build();

// 3. Guarda en BD
// INSERT INTO solicitud_turno_ipress (id_periodo, id_pers, ...)
// VALUES (5, 123, ...)
```

### Ejemplo 2: Consultar Mis Solicitudes

**Frontend:**
```javascript
const misSolicitudes = await solicitudTurnoService.listarMisSolicitudes();
// El backend filtra automáticamente por idPers del usuario autenticado
```

**Backend:**
```java
@Override
public List<SolicitudTurnoIpressResponse> listarMisSolicitudes() {
    PersonalCnt personal = obtenerPersonalActual(); // idPers = 123
    
    // Filtra automáticamente por idPers
    return solicitudRepository
        .findByPersonalIdPersOrderByCreatedAtDesc(personal.getIdPers())
        .stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
}
```

---

## 🐛 Solución de Problemas

### Error: "Usuario no encontrado"
**Causa:** El username del token no existe en la BD.

**Solución:** Verificar que el usuario esté correctamente registrado.

### Error: "Personal no encontrado para el usuario"
**Causa:** El usuario existe pero no tiene registro de PersonalCnt.

**Solución:** Crear el registro de personal asociado al usuario.

### Error: "No tiene permisos para modificar esta solicitud"
**Causa:** El usuario intenta modificar una solicitud de otro usuario.

**Solución:** Este es el comportamiento esperado. Solo se pueden modificar solicitudes propias.

---

## 📚 Archivos Relacionados

### Backend
- **Controller:** `backend/src/main/java/com/styp/cenate/api/solicitudturno/SolicitudTurnoIpressController.java`
- **Service:** `backend/src/main/java/com/styp/cenate/service/solicitudturno/impl/SolicitudTurnoIpressServiceImpl.java`
- **Model:** `backend/src/main/java/com/styp/cenate/model/SolicitudTurnoIpress.java`
- **Model Personal:** `backend/src/main/java/com/styp/cenate/model/PersonalCnt.java`
- **DTO Request:** `backend/src/main/java/com/styp/cenate/dto/SolicitudTurnoIpressRequest.java`
- **DTO Response:** `backend/src/main/java/com/styp/cenate/dto/SolicitudTurnoIpressResponse.java`

### Frontend
- **Componente:** `frontend/src/pages/roles/externo/solicitud-turnos/FormularioSolicitudTurnos.jsx`
- **Servicio:** `frontend/src/services/solicitudTurnoService.js`

---

## 🔗 Documentación Relacionada

- [Método obtenerPersonalActual()](./obtenerPersonalActual.md) - Detalles del método y valores que retorna

---

**Última actualización:** 2026-01-27
