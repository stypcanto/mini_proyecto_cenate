# 👤 INTEGRACIÓN: Creación de Asegurados desde TeleEKG

**Fecha:** 2026-01-13
**Contexto:** Si el DNI no existe en CENATE, permitir crear un nuevo asegurado

---

## 📋 FLUJO: Paciente Nuevo

```
IPRESS Externa envía ECG
    ↓
Backend busca usuario por DNI
    ↓
¿DNI existe en dim_usuarios?
    │
    ├─ SÍ: Vincular a usuario existente
    │
    └─ NO: Mostrar formulario para crear nuevo asegurado
            ↓
        Ingresar:
        ├─ Tipo Documento (DNI, CE, Pasaporte)
        ├─ Número Documento
        ├─ Nombres
        ├─ Apellidos
        ├─ Género
        ├─ Fecha Nacimiento
        ├─ Email
        └─ Teléfono
            ↓
        Crear Usuario + PersonalCnt + Asegurado
            ↓
        Vincular con la imagen ECG
            ↓
        Crear sesión de atención médica
```

---

## 🏗️ ARQUITECTURA

### Backend: Nueva Tabla `dim_asegurados`

Esta tabla ya existe en CENATE pero necesita validar su estructura:

```sql
CREATE TABLE dim_asegurados (
    id_aseg SERIAL PRIMARY KEY,
    num_doc_aseg VARCHAR(20) NOT NULL UNIQUE,
    tip_doc_aseg VARCHAR(5),
    nom_aseg VARCHAR(100),
    ape_pat_aseg VARCHAR(100),
    ape_mat_aseg VARCHAR(100),
    fech_nac_aseg DATE,
    gen_aseg CHAR(1),  -- M, F
    email_aseg VARCHAR(150),
    telef_aseg VARCHAR(20),
    id_usuario BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,
    id_ipress BIGINT REFERENCES dim_ipress(id_ipress),
    estado_aseg CHAR(1) DEFAULT 'A',  -- A=Activo, I=Inactivo
    fecha_afiliacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend: DTO para Crear Asegurado

```java
public record CrearAseguradoDTO(
    String tipoDocumento,        // DNI, CE, Pasaporte
    String numeroDocumento,      // Validado 8 dígitos
    String nombres,
    String apellidoPaterno,
    String apellidoMaterno,
    String genero,               // M, F
    LocalDate fechaNacimiento,
    String email,                // Opcional
    String telefono
) {}
```

### Backend: Service para Crear Asegurado

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AseguradoService {

    private final AseguradoRepository aseguradoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PersonalCntRepository personalCntRepository;
    private final IpressRepository ipressRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    /**
     * Crear nuevo asegurado desde TeleEKG
     * Devuelve el usuario creado para vincular con imagen ECG
     */
    @Transactional
    public UsuarioResponse crearAseguradoDesdeTeelEKG(
            CrearAseguradoDTO dto,
            Long idIPressOrigen) {

        log.info("Creando nuevo asegurado desde TeleEKG: DNI={}", dto.numeroDocumento());

        // 1. Validar que no exista
        if (aseguradoRepository.existsByNumDocAseg(dto.numeroDocumento())) {
            throw new RuntimeException("Asegurado con DNI " + dto.numeroDocumento() + " ya existe");
        }

        // 2. Crear usuario (con rol ASEGURADO)
        Usuario usuario = Usuario.builder()
            .nameUser(dto.numeroDocumento())  // Username = DNI
            .passUser(generarPasswordTemporal())
            .statUser("A")
            .requiereCambioPassword(true)
            .build();

        usuario = usuarioRepository.save(usuario);
        Long idUsuario = usuario.getIdUser();

        log.info("Usuario creado: ID={}, DNI={}", idUsuario, dto.numeroDocumento());

        // 3. Crear PersonalCnt
        Ipress ipress = ipressRepository.findById(idIPressOrigen)
            .orElseThrow(() -> new RuntimeException("IPRESS no encontrada"));

        PersonalCnt personal = PersonalCnt.builder()
            .usuario(usuario)
            .tipoDocumento(obtenerTipoDocumento(dto.tipoDocumento()))
            .numDocPers(dto.numeroDocumento())
            .nomPers(dto.nombres())
            .apePaterPers(dto.apellidoPaterno())
            .apeMaterPers(dto.apellidoMaterno())
            .fechNaciPers(java.sql.Date.valueOf(dto.fechaNacimiento()))
            .genPers(dto.genero().substring(0, 1).toUpperCase())
            .emailPers(dto.email())
            .movilPers(dto.telefono())
            .ipress(ipress)
            .origenPersonal(obtenerOrigenAsegurado())  // id_origen = 3 (ASEGURADO)
            .statPers("A")
            .perPers(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")))
            .build();

        personalCntRepository.save(personal);

        log.info("PersonalCnt creado: ID={}", personal.getIdPers());

        // 4. Crear registro Asegurado
        Asegurado asegurado = Asegurado.builder()
            .numDocAseg(dto.numeroDocumento())
            .tipDocAseg(dto.tipoDocumento())
            .nomAseg(dto.nombres())
            .apePatAseg(dto.apellidoPaterno())
            .apeMatAseg(dto.apellidoMaterno())
            .fechNacAseg(java.sql.Date.valueOf(dto.fechaNacimiento()))
            .genAseg(dto.genero().substring(0, 1).toUpperCase())
            .emailAseg(dto.email())
            .telefAseg(dto.telefono())
            .usuario(usuario)
            .ipress(ipress)
            .estadoAseg("A")
            .build();

        aseguradoRepository.save(asegurado);

        log.info("Asegurado creado: ID={}", asegurado.getIdAseg());

        // 5. Asignar rol ASEGURADO
        asignarRolAsegurado(usuario);

        // 6. Asignar permisos básicos
        asignarPermisosAsegurado(usuario);

        // 7. Auditoría
        auditLogService.registrarEvento(
            "SYSTEM",
            "CREATE_ASEGURADO_TELEEKG",
            "ASEGURADOS",
            String.format("Nuevo asegurado creado desde TeleEKG - DNI: %s, IPRESS: %s",
                dto.numeroDocumento(),
                ipress.getDescIpress()),
            "INFO",
            "SUCCESS"
        );

        // 8. Notificar por email
        enviarBienvenidaAsegurado(usuario, dto);

        return convertirAResponse(usuario);
    }

    /**
     * Obtener origen = ASEGURADO (id_origen = 3)
     */
    private DimOrigenPersonal obtenerOrigenAsegurado() {
        return dimOrigenPersonalRepository.findById(3L)
            .orElseThrow(() -> new RuntimeException("Origen ASEGURADO no encontrado"));
    }

    /**
     * Asignar rol ASEGURADO
     */
    private void asignarRolAsegurado(Usuario usuario) {
        Rol rolAsegurado = rolRepository.findByDescRol("ASEGURADO")
            .orElseThrow(() -> new RuntimeException("Rol ASEGURADO no encontrado"));

        RelUserRoles relUserRoles = RelUserRoles.builder()
            .usuario(usuario)
            .rol(rolAsegurado)
            .build();

        relUserRolesRepository.save(relUserRoles);

        log.info("Rol ASEGURADO asignado a usuario: {}", usuario.getIdUser());
    }

    /**
     * Asignar permisos básicos
     */
    private void asignarPermisosAsegurado(Usuario usuario) {
        // Acceso a "Mi Información" en portal de asegurados
        PermisoModular permiso = PermisoModular.builder()
            .usuario(usuario)
            .rol(obtenerRolAsegurado())
            .modulo(obtenerModuloAsegurados())
            .pagina(obtenerPaginaPerfil())
            .accion("ver")
            .ver(true)
            .crear(false)
            .editar(true)  // Puede editar su perfil
            .eliminar(false)
            .exportar(false)
            .aprobar(false)
            .build();

        permisoModularRepository.save(permiso);

        log.info("Permisos asignados a usuario: {}", usuario.getIdUser());
    }

    /**
     * Enviar email de bienvenida
     */
    private void enviarBienvenidaAsegurado(Usuario usuario, CrearAseguradoDTO dto) {
        // Mensaje informativo (no requiere activación, está activo inmediatamente)
        emailService.enviarCorreoBienvenidaAsegurado(
            dto.email(),
            dto.nombres() + " " + dto.apellidoPaterno(),
            usuario.getNameUser(),
            "Tu perfil fue creado desde la imagen de electrocardiograma. " +
            "Puedes acceder al sistema con tu DNI como usuario."
        );
    }

    private String generarPasswordTemporal() {
        return new PasswordTokenService().generarPasswordTemporal();
    }
}
```

---

## 🎯 INTEGRACIÓN EN TeleECGService

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TeleECGService {

    private final AseguradoService aseguradoService;
    private final UsuarioRepository usuarioRepository;

    /**
     * Subir imagen ECG - ACTUALIZADO
     * Ahora también crea asegurado si no existe
     */
    @Transactional
    public TeleECGImagenDTO subirImagenECG(
            MultipartFile archivo,
            String numDoc,
            String nombres,
            String apellidos,
            String tipoDoc,
            String genero,
            LocalDate fechaNac,
            String email,
            String telefono) {

        // 1. Validar archivo
        validarArchivo(archivo);

        // 2. Obtener IPRESS origen
        Usuario usuarioActual = obtenerUsuarioActual();
        Ipress ipressOrigen = usuarioActual.getPersonalCnt().getIpress();

        // 3. ✅ NUEVO: Buscar usuario por DNI
        Usuario usuarioPaciente = usuarioRepository.findByNameUser(numDoc)
            .orElse(null);

        // 4. ✅ NUEVO: Si no existe, crear asegurado
        if (usuarioPaciente == null) {
            log.info("DNI {} no existe. Creando nuevo asegurado...", numDoc);

            CrearAseguradoDTO crearDto = new CrearAseguradoDTO(
                tipoDoc,
                numDoc,
                nombres,
                apellidos,
                apellidos,  // Usar apellidos enviados
                genero,
                fechaNac,
                email,
                telefono
            );

            var usuarioResponse = aseguradoService.crearAseguradoDesdeTeelEKG(
                crearDto,
                ipressOrigen.getIdIpress()
            );

            // Obtener usuario nuevamente
            usuarioPaciente = usuarioRepository.findByNameUser(numDoc)
                .orElseThrow(() -> new RuntimeException("No se pudo crear asegurado"));

            log.info("Asegurado creado exitosamente: ID={}", usuarioPaciente.getIdUser());
        }

        // 5. Guardar imagen
        String nombreArchivo = generarNombreArchivo(numDoc);
        String rutaArchivo = storageService.guardarArchivo(archivo, uploadDir + "/nuevas");
        String hashArchivo = calcularHash(archivo);

        // 6. Crear registro TeleEKG
        TeleECGImagen imagen = TeleECGImagen.builder()
            .numDocPaciente(numDoc)
            .nombresPaciente(nombres)
            .apellidosPaciente(apellidos)
            .usuarioPaciente(usuarioPaciente)  // ✅ Vinculado
            .nombreArchivo(nombreArchivo)
            .rutaArchivo(rutaArchivo)
            .tipoContenido(archivo.getContentType())
            .tamanioBytes(archivo.getSize())
            .hashArchivo(hashArchivo)
            .ipressOrigen(ipressOrigen)
            .fechaEnvio(new Date())
            .estado("PENDIENTE")
            .statImagen("A")
            .build();

        imagen = imagenRepository.save(imagen);

        // 7. Auditoría
        auditLogService.registrarEvento(
            usuarioActual.getNameUser(),
            "UPLOAD_ECG",
            "TELEEKGS",
            "Imagen ECG subida - Paciente: " + numDoc + " (ASEGURADO NUEVO)",
            "INFO",
            "SUCCESS"
        );

        // 8. ✅ NUEVO: Notificar a CENATE
        notificarNuevaImagenECG(imagen);

        // 9. ✅ NUEVO: Si se creó asegurado nuevo, notificar también
        if (usuarioPaciente != null && usuarioPaciente.getCreatedAt().after(
                new Date(System.currentTimeMillis() - 60000))) {  // Creado hace menos de 1 minuto
            notificarNuevoAseguradoDesdeECG(usuarioPaciente, imagen);
        }

        return convertirADTO(imagen);
    }

    /**
     * Notificar que se creó un nuevo asegurado desde ECG
     */
    private void notificarNuevoAseguradoDesdeECG(Usuario usuario, TeleECGImagen imagen) {
        log.info("Notificando creación de nuevo asegurado desde ECG: {}", usuario.getNameUser());

        // Email a administradores
        emailService.enviarCorreoNotificacionAdministrador(
            "Nuevo Asegurado Creado desde TeleEKG",
            String.format(
                "Se creó un nuevo asegurado como resultado de una imagen ECG:<br>" +
                "DNI: %s<br>" +
                "Nombres: %s<br>" +
                "IPRESS: %s<br>" +
                "ID Imagen ECG: %d",
                usuario.getNameUser(),
                usuario.getPersonalCnt().getNomPers(),
                imagen.getIpressOrigen().getDescIpress(),
                imagen.getIdImagen()
            )
        );
    }
}
```

---

## 🎨 Frontend: Flujo de Creación de Asegurado

### Paso 1: Detectar DNI No Existe

```javascript
// En UploadImagenECG.jsx
const [pacienteNuevo, setPacienteNuevo] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();

    // Buscar si el DNI existe
    const response = await fetch(
        `http://localhost:8080/api/usuarios/existe-dni?dni=${formData.numDocPaciente}`
    );

    if (response.status === 404) {
        // DNI no existe → mostrar formulario de creación
        setPacienteNuevo(true);
    } else {
        // DNI existe → proceder con upload
        subirImagenECG();
    }
};
```

### Paso 2: Formulario de Creación

```javascript
// CrearAseguradoForm.jsx
const CrearAseguradoForm = ({ dniPaciente, onCreated }) => {
    const [formData, setFormData] = useState({
        tipoDocumento: 'DNI',
        numeroDocumento: dniPaciente,
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        genero: 'M',
        fechaNacimiento: '',
        email: '',
        telefono: ''
    });

    const handleCrear = async () => {
        const response = await fetch(
            'http://localhost:8080/api/asegurados/crear-desde-teleekg',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            }
        );

        if (response.ok) {
            alert('✅ Asegurado creado exitosamente. Continúa con el envío de imagen.');
            onCreated(true);
        }
    };

    return (
        <div className="formulario-asegurado">
            <h2>Crear Nuevo Asegurado</h2>
            {/* Formulario con campos */}
            <button onClick={handleCrear}>Crear Asegurado</button>
        </div>
    );
};
```

---

## 📊 FLUJO COMPLETO (CON ASEGURADO NUEVO)

```
1. IPRESS envía ECG con DNI=12345678

2. Backend busca usuario → No existe

3. Mostrar formulario:
   ├─ Tipo Documento: DNI
   ├─ Número: 12345678
   ├─ Nombres: [Ingresa]
   ├─ Apellidos: [Ingresa]
   ├─ Género: [Selecciona]
   ├─ Fecha Nacimiento: [Selecciona]
   ├─ Email: [Ingresa]
   └─ Teléfono: [Ingresa]

4. Click "Crear Asegurado"
   ├─ Crear Usuario (role=ASEGURADO)
   ├─ Crear PersonalCnt
   ├─ Crear Asegurado
   ├─ Asignar permisos
   └─ Enviar email bienvenida

5. Proceder con upload de ECG
   ├─ Vinculado automáticamente a usuario creado
   ├─ Estado: PENDIENTE
   └─ Notificar a CENATE

6. Personal CENATE ve:
   ├─ Imagen ECG
   ├─ Asegurado: Juan García López (NUEVO)
   ├─ Opción: Aceptar / Rechazar / Procesar
   └─ Crear cita médica
```

---

## ✅ CHECKLIST

- [ ] Tabla `dim_asegurados` validada en BD
- [ ] Tabla `dim_origen_personal` con id_origen=3 (ASEGURADO)
- [ ] Rol `ASEGURADO` creado en BD
- [ ] DTO `CrearAseguradoDTO` implementado
- [ ] `AseguradoService.crearAseguradoDesdeTeelEKG()` implementado
- [ ] Integración en `TeleECGService`
- [ ] Endpoint para verificar si DNI existe
- [ ] Componente React para crear asegurado
- [ ] Emails de notificación implementados
- [ ] Auditoría en cada creación de asegurado
- [ ] Testing: crear asegurado → upload ECG → procesar

---

**Conclusión:** Si DNI no existe, se crea automáticamente un nuevo asegurado con todos sus datos, vinculado directamente a la imagen ECG.

