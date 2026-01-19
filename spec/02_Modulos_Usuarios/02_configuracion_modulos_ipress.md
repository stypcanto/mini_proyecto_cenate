# 🎛️ Configuración de Módulos por IPRESS - CENATE

**Versión:** v1.0
**Fecha:** 19 de Enero, 2026
**Estado:** ✅ Implementado
**Autor:** Equipo CENATE

---

## 📖 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tabla de Control](#tabla-de-control)
4. [Módulos Disponibles](#módulos-disponibles)
5. [Casos de Uso](#casos-de-uso)
6. [Backend: Implementación](#backend-implementación)
7. [Frontend: Implementación](#frontend-implementación)
8. [Procedimientos Administrativos](#procedimientos-administrativos)
9. [FAQ](#faq)

---

## 📌 Descripción General

La **Configuración de Módulos por IPRESS** es un sistema centralizado que controla **qué funcionalidades (módulos) están disponibles para cada institución prestadora de servicios de salud (IPRESS)**.

### Objetivo

- Activar/desactivar módulos dinámicamente sin cambiar código
- Permitir que cada IPRESS tenga su propio conjunto de funcionalidades
- Gestionar acceso a nuevas funcionalidades de forma controlada
- Auditar cambios de configuración

### Usuario Objetivo

- **Administradores del Sistema**: Configurar qué módulos están disponibles
- **Personal IPRESS (rol INSTITUCION_EX)**: Visualizar solo módulos habilitados para su IPRESS
- **Auditores**: Rastrear qué módulos están activos en cada IPRESS

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
Usuario (rol INSTITUCION_EX)
    │
    ├─> Login (DNI + Password)
    │
    ├─> PersonalExterno lookup
    │   └─> id_user → id_ipress
    │
    ├─> IpressModuloConfig query
    │   └─> SELECT habilitado FROM ipress_modulos_config
    │       WHERE id_ipress = ? AND habilitado = true
    │
    └─> Frontend carga módulos disponibles
        └─> Renderiza solo módulos activos
```

### Componentes Clave

| Componente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| `IpressModuloConfig` | Entity JPA | Modelo de BD - configuración módulo/IPRESS |
| `IpressModuloConfigRepository` | Repository | Queries personalizadas a BD |
| `IpressService` | Service | Lógica de negocio - obtener módulos |
| `IpressController` | Controller | Endpoint REST `/ipress/mi-ipress/modulos-disponibles` |
| `ModuloDisponibleDTO` | DTO | Respuesta API con info de módulos |
| `BienvenidaExterno.jsx` | Frontend | Renderiza dinámicamente módulos |
| `ipressService.js` | Frontend Service | API client - obtiene módulos |

---

## 💾 Tabla de Control

### `ipress_modulos_config`

**Ubicación BD:** Base de datos `maestro_cenate`

**Estructura:**

```sql
CREATE TABLE ipress_modulos_config (
    id SERIAL PRIMARY KEY,
    id_ipress BIGINT NOT NULL REFERENCES dim_ipress(id_ipress),
    modulo_codigo VARCHAR(50) NOT NULL,           -- FORMULARIO_DIAGNOSTICO, TELEECG, etc
    modulo_nombre VARCHAR(255) NOT NULL,          -- Nombre mostrado en UI
    habilitado BOOLEAN DEFAULT false,              -- ✅ CLAVE: activa/desactiva módulo
    descripcion TEXT,                              -- Descripción breve
    icono VARCHAR(50),                             -- Icono Lucide React (heart-handshake, etc)
    color VARCHAR(50),                             -- Color Tailwind (indigo, blue, purple, etc)
    orden INTEGER,                                 -- Orden de aparición (1, 2, 3...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_ipress, modulo_codigo)              -- Evita duplicados
);
```

**Índices Recomendados:**

```sql
CREATE INDEX idx_ipress_modulos_habilitado
ON ipress_modulos_config(id_ipress, habilitado);

CREATE INDEX idx_modulos_codigo
ON ipress_modulos_config(modulo_codigo);
```

---

## 🔧 Módulos Disponibles

### Estado Actual (v1.20.1)

| Módulo | Código | Descripción | IPRESS Habilitadas | Ruta Frontend |
|--------|--------|-------------|------------------|----------------|
| **Formulario Diagnóstico** | `FORMULARIO_DIAGNOSTICO` | Diagnóstico situacional de telesalud | Todas | `/roles/externo/formulario-diagnostico` |
| **Solicitud de Turnos** | `SOLICITUD_TURNOS` | Solicitar turnos de telemedicina | Todas | `/roles/externo/solicitud-turnos` |
| **Gestión Modalidad** | `MODALIDAD_ATENCION` | Actualizar modalidad de atención | Todas | `/roles/externo/gestion-modalidad` |
| **TELEECG** | `TELEECG` | Envío de electrocardiogramas | ✅ PADOMI SOLO (id=413) | `/roles/externo/teleecgs` |

---

## 📋 Casos de Uso

### 1️⃣ Caso: TELEECG Exclusivo para PADOMI (v1.20.1)

**Requisito**: El módulo TELEECG debe estar disponible **SOLO para usuarios que se registren en PADOMI** (Programa de Atención Domiciliaria).

**Solución Implementada**:

```sql
-- Deshabilitar en 19 IPRESS
UPDATE ipress_modulos_config
SET habilitado = false
WHERE modulo_codigo = 'TELEECG' AND id_ipress != 413;

-- Habilitar solo en PADOMI
UPDATE ipress_modulos_config
SET habilitado = true
WHERE modulo_codigo = 'TELEECG' AND id_ipress = 413;
```

**Script de Referencia:** `spec/04_BaseDatos/06_scripts/034_teleecg_exclusivo_padomi.sql`

**Impacto**:
- ✅ Usuarios PADOMI ven TELEECG en bienvenida
- ❌ Usuarios de otros hospitales NO ven TELEECG
- ⚡ Cambio efectivo inmediatamente (sin redeploy)

**Verificación**:

```sql
SELECT COUNT(*) FROM ipress_modulos_config
WHERE modulo_codigo = 'TELEECG' AND habilitado = true;
-- Resultado esperado: 1 (PADOMI)
```

---

### 2️⃣ Caso: Habilitar Nuevo Módulo en IPRESS Específica

**Escenario**: Se crea un nuevo módulo llamado "TELECIRUGÍA" y debe estar disponible solo en 3 hospitales.

**Procedimiento**:

1. Crear registros en `ipress_modulos_config`:

```sql
INSERT INTO ipress_modulos_config
(id_ipress, modulo_codigo, modulo_nombre, habilitado, descripcion, icono, color, orden)
VALUES
(13, 'TELECIRUGÍA', 'Telecirugía', true, 'Consultas de cirugía remota', 'stethoscope', 'red', 5),
(14, 'TELECIRUGÍA', 'Telecirugía', true, 'Consultas de cirugía remota', 'stethoscope', 'red', 5),
(15, 'TELECIRUGÍA', 'Telecirugía', true, 'Consultas de cirugía remota', 'stethoscope', 'red', 5);
```

2. Verificar visibilidad:

```sql
SELECT di.desc_ipress FROM dim_ipress di
JOIN ipress_modulos_config imc ON di.id_ipress = imc.id_ipress
WHERE imc.modulo_codigo = 'TELECIRUGÍA' AND imc.habilitado = true;
```

---

### 3️⃣ Caso: Desactivar Módulo Temporalmente

**Escenario**: Formulario Diagnóstico en mantenimiento, debe ocultarse en todas las IPRESS.

```sql
UPDATE ipress_modulos_config
SET habilitado = false
WHERE modulo_codigo = 'FORMULARIO_DIAGNOSTICO';

-- Para reactivar:
UPDATE ipress_modulos_config
SET habilitado = true
WHERE modulo_codigo = 'FORMULARIO_DIAGNOSTICO';
```

---

## 🔧 Backend: Implementación

### 1. Entidad JPA

**Archivo:** `backend/src/main/java/com/styp/cenate/model/IpressModuloConfig.java`

```java
@Entity
@Table(name = "ipress_modulos_config",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"id_ipress", "modulo_codigo"})})
public class IpressModuloConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    @Column(nullable = false)
    private String moduloCodigo;          // FORMULARIO_DIAGNOSTICO, TELEECG, etc

    @Column(nullable = false)
    private String moduloNombre;          // Nombre mostrado

    @Column(nullable = false)
    private Boolean habilitado = false;   // ✅ COLUMNA CRÍTICA

    private String descripcion;
    private String icono;
    private String color;
    private Integer orden;

    @CreationTimestamp
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
```

### 2. Repository

**Archivo:** `backend/src/main/java/com/styp/cenate/repository/IpressModuloConfigRepository.java`

```java
@Repository
public interface IpressModuloConfigRepository extends JpaRepository<IpressModuloConfig, Long> {

    /**
     * Obtiene SOLO módulos habilitados para una IPRESS
     * ✅ Clave: WHERE habilitado = true
     */
    @Query("SELECT c FROM IpressModuloConfig c " +
           "WHERE c.ipress.idIpress = :idIpress AND c.habilitado = true " +
           "ORDER BY c.orden ASC")
    List<IpressModuloConfig> findModulosHabilitados(@Param("idIpress") Long idIpress);

    /**
     * Verifica si un módulo está habilitado
     */
    @Query("SELECT COUNT(c) > 0 FROM IpressModuloConfig c " +
           "WHERE c.ipress.idIpress = :idIpress " +
           "AND c.moduloCodigo = :moduloCodigo " +
           "AND c.habilitado = true")
    boolean isModuloHabilitado(@Param("idIpress") Long idIpress,
                                @Param("moduloCodigo") String moduloCodigo);
}
```

### 3. Service

**Archivo:** `backend/src/main/java/com/styp/cenate/service/ipress/impl/IpressServiceImpl.java`

```java
@Override
public List<ModuloDisponibleDTO> obtenerModulosDisponibles() {
    // 1. Obtener IPRESS del usuario autenticado
    IpressResponse ipress = obtenerIpressPorUsuarioActual();

    // 2. Delegar a método que filtra por habilitado=true
    return obtenerModulosDisponiblesPorIpress(ipress.getIdIpress());
}

@Override
public List<ModuloDisponibleDTO> obtenerModulosDisponiblesPorIpress(Long idIpress) {
    // ✅ Solo retorna módulos con habilitado=true
    List<IpressModuloConfig> modulos =
        ipressModuloConfigRepository.findModulosHabilitados(idIpress);

    return modulos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
}

private ModuloDisponibleDTO convertirADTO(IpressModuloConfig config) {
    return ModuloDisponibleDTO.builder()
            .id(config.getId())
            .moduloCodigo(config.getModuloCodigo())
            .moduloNombre(config.getModuloNombre())
            .descripcion(config.getDescripcion())
            .icono(config.getIcono())
            .color(config.getColor())
            .orden(config.getOrden())
            .habilitado(config.getHabilitado())
            .build();
}
```

### 4. Controller

**Archivo:** `backend/src/main/java/com/styp/cenate/api/entidad/IpressController.java`

```java
/**
 * GET /api/ipress/mi-ipress/modulos-disponibles
 * Retorna módulos habilitados para la IPRESS del usuario
 * Requiere: rol INSTITUCION_EX, ADMIN o SUPERADMIN
 */
@GetMapping("/mi-ipress/modulos-disponibles")
@PreAuthorize("hasAnyRole('INSTITUCION_EX', 'ADMIN', 'SUPERADMIN')")
public ResponseEntity<Map<String, Object>> obtenerModulosDisponibles() {
    try {
        List<ModuloDisponibleDTO> modulos = ipressService.obtenerModulosDisponibles();
        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", modulos,
            "message", "Módulos obtenidos exitosamente"
        ));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of(
            "status", 500,
            "error", "ERROR_OBTENER_MODULOS",
            "message", e.getMessage()
        ));
    }
}
```

### 5. DTO

**Archivo:** `backend/src/main/java/com/styp/cenate/dto/ModuloDisponibleDTO.java`

```java
@Data
@Builder
public class ModuloDisponibleDTO {
    private Long id;
    private String moduloCodigo;           // TELEECG, FORMULARIO_DIAGNOSTICO, etc
    private String moduloNombre;           // Nombre mostrado
    private String descripcion;
    private String icono;                  // Lucide React icon
    private String color;                  // Tailwind color
    private Integer orden;                 // Orden de aparición
    private Boolean habilitado;

    /**
     * Mapeo automático: moduloCodigo → Ruta frontend
     * ✅ Utilizado por BienvenidaExterno.jsx
     */
    public String getRuta() {
        return switch (moduloCodigo) {
            case "FORMULARIO_DIAGNOSTICO" -> "/roles/externo/formulario-diagnostico";
            case "SOLICITUD_TURNOS" -> "/roles/externo/solicitud-turnos";
            case "MODALIDAD_ATENCION" -> "/roles/externo/gestion-modalidad";
            case "TELEECG" -> "/roles/externo/teleecgs";
            default -> "/roles/externo";
        };
    }
}
```

---

## 🖥️ Frontend: Implementación

### 1. Service API

**Archivo:** `frontend/src/services/ipressService.js`

```javascript
/**
 * Obtiene módulos disponibles para la IPRESS del usuario logueado
 * @returns {Promise<Object>} { status, data: ModuloDisponibleDTO[], message }
 */
async obtenerModulosDisponibles() {
    try {
        const response = await apiClient.get(
            "/ipress/mi-ipress/modulos-disponibles",
            true  // requiresAuth
        );
        return response.data || response;
    } catch (error) {
        console.error("❌ Error al obtener módulos disponibles:", error);
        throw error;
    }
}
```

### 2. Componente Bienvenida

**Archivo:** `frontend/src/pages/roles/externo/BienvenidaExterno.jsx`

```javascript
export default function BienvenidaExterno() {
    const [modulos, setModulos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Obtener módulos dinámicamente desde BD
                const modulosData = await ipressService.obtenerModulosDisponibles();
                const modulosOrdenados = (modulosData.data || [])
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
                setModulos(modulosOrdenados);
            } catch (error) {
                console.error("Error al cargar módulos:", error);
                // Fallback a módulos hardcodeados si falla API
                setModulos([...defaultModulos]);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modulos.map(modulo => (
                <Card
                    key={modulo.id}
                    onClick={() => navigate(modulo.getRuta())}
                    className={`bg-gradient-to-br from-${modulo.color}-50 to-white`}
                >
                    <Icon name={modulo.icono} className={`text-${modulo.color}-600`} />
                    <h3 className="font-bold">{modulo.moduloNombre}</h3>
                    <p className="text-sm text-gray-600">{modulo.descripcion}</p>
                </Card>
            ))}
        </div>
    );
}
```

---

## ⚙️ Procedimientos Administrativos

### Agregar Nuevo Módulo a una IPRESS

**Paso 1:** Insertar registro en `ipress_modulos_config`

```sql
INSERT INTO ipress_modulos_config
(id_ipress, modulo_codigo, modulo_nombre, habilitado, descripcion, icono, color, orden)
VALUES
(413, 'TELEECG', 'Envío de Electrocardiogramas (ECG)', true,
 'Permite enviar ECG remotamente', 'heart-handshake', 'red', 4);
```

**Paso 2:** Verificar que aparezca en Frontend

```
Usuarios PADOMI → Bienvenida → Aparece tarjeta TELEECG
```

### Desactivar Módulo en Emergencia

```sql
UPDATE ipress_modulos_config
SET habilitado = false
WHERE modulo_codigo = 'TELEECG' AND id_ipress = 413;
```

**Resultado:** Usuarios PADOMI NO verán TELEECG inmediatamente

### Ver Qué IPRESS Tienen Cada Módulo

```sql
SELECT
    imc.modulo_nombre,
    COUNT(*) as total_ipress_habilitadas,
    STRING_AGG(di.desc_ipress, ', ') as ipress_list
FROM ipress_modulos_config imc
JOIN dim_ipress di ON imc.id_ipress = di.id_ipress
WHERE imc.habilitado = true
GROUP BY imc.modulo_nombre
ORDER BY total_ipress_habilitadas DESC;
```

---

## ❓ FAQ

### P: ¿Si un módulo tiene `habilitado=false`, ¿qué pasa si usuario accede directamente a su URL?

**R:** El módulo no aparecerá en la bienvenida, pero si accede a `/roles/externo/teleecgs` directamente:
- ✅ Si tiene permisos en MBAC → Accede
- ❌ Si no tiene permisos → Redirige a home

**Recomendación:** Agregar validación adicional en el componente para verificar `ipress_modulos_config`.

### P: ¿Cuándo se cachean los módulos?

**R:** Se obtienen de BD en cada:
- Recarga de página
- Relogin del usuario
- Llamada manual a `obtenerModulosDisponibles()`

**No hay caché** → Cambios en BD son inmediatos

### P: ¿Puedo tener el mismo módulo con diferente configuración en 2 IPRESS?

**R:** Sí. Ejemplo:
- TELEECG en PADOMI: `habilitado=true, orden=4`
- TELEECG en Hospital A: `habilitado=false, orden=4`

Cada registro es independiente.

### P: ¿Cómo agrego un nuevo módulo completamente?

**R:**
1. Crear código único: `NUEVO_MODULO`
2. Insertar registros en `ipress_modulos_config` para cada IPRESS
3. Crear componente React en `frontend/src/pages/roles/externo/`
4. Registrar ruta en `componentRegistry.js`
5. Agregar case en `ModuloDisponibleDTO.getRuta()`

---

## 📚 Referencias

- **Tabla BD:** `ipress_modulos_config`
- **Backend Repository:** `IpressModuloConfigRepository`
- **Backend Service:** `IpressServiceImpl`
- **Backend Controller:** `IpressController`
- **Frontend Service:** `ipressService.js`
- **Frontend Component:** `BienvenidaExterno.jsx`
- **Scripts SQL:** `spec/04_BaseDatos/06_scripts/034_teleecg_exclusivo_padomi.sql`

---

**Última actualización:** 19 de Enero, 2026
**Próxima revisión:** Cuando se agreguen nuevos módulos o casos de uso
**Contacto:** Equipo CENATE
