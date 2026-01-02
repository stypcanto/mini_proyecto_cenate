# Vista vw_personal_total

> Vista unificada de personal (CNT + Externo) con información completa para gestión administrativa

---

## Descripción

Vista SQL de solo lectura que combina datos de personal interno (CNT) y externo con toda su información relacionada: ubicación, IPRESS, área, régimen laboral, profesión, especialidad, usuario del sistema, etc.

**Fuente principal**: `dim_personal_cnt`

---

## Cambios v1.15.1 (2026-01-02)

### ✅ Campo `username` Agregado

**Problema identificado**:
- El frontend en `GestionUsuariosPermisos.jsx` buscaba por campo `username`
- La vista NO incluía este campo
- Causaba que usuarios existentes no aparecieran en búsquedas

**Solución**:
- Agregado `LEFT JOIN` con `dim_usuarios` usando `id_usuario`
- Agregado campo `u.name_user AS username` al SELECT

**Script de actualización**: `spec/04_BaseDatos/06_scripts/016_agregar_username_vw_personal_total.sql`

---

## Estructura de Campos

| Campo | Tipo | Descripción | Origen |
|-------|------|-------------|--------|
| **id_personal** | BIGINT | ID único del personal | `dim_personal_cnt.id_pers` |
| **nombres** | VARCHAR(255) | Nombres del personal | `dim_personal_cnt.nom_pers` |
| **apellido_paterno** | VARCHAR(255) | Apellido paterno | `dim_personal_cnt.ape_pater_pers` |
| **apellido_materno** | VARCHAR(255) | Apellido materno | `dim_personal_cnt.ape_mater_pers` |
| **numero_documento** | VARCHAR(20) | Número de documento (DNI, CE, etc.) | `dim_personal_cnt.num_doc_pers` |
| **tipo_documento** | VARCHAR(50) | Tipo de documento | `dim_tipo_documento.desc_tip_doc` |
| **fecha_nacimiento** | DATE | Fecha de nacimiento | `dim_personal_cnt.fech_naci_pers` |
| **edad** | INTEGER | Edad calculada | Calculado: `EXTRACT(year FROM age(CURRENT_DATE, fecha_nacimiento))` |
| **mes_cumpleanos** | TEXT | Mes de cumpleaños (texto) | Calculado: `to_char(fecha_nacimiento, 'TMMonth')` |
| **cumpleanos_este_anio** | DATE | Fecha de cumpleaños del año actual | Calculado |
| **genero** | VARCHAR(1) | Género (M/F) | `dim_personal_cnt.gen_pers` |
| **correo_institucional** | VARCHAR(100) | Email corporativo (@essalud.gob.pe) | `dim_personal_cnt.email_corp_pers` |
| **correo_personal** | VARCHAR(100) | Email personal | `dim_personal_cnt.email_pers` |
| **telefono** | VARCHAR(20) | Teléfono móvil | `dim_personal_cnt.movil_pers` |
| **direccion** | VARCHAR | Dirección completa | `dim_personal_cnt.direc_pers` |
| **foto_url** | VARCHAR | Ruta de foto de perfil | `dim_personal_cnt.foto_pers` |
| **id_distrito** | BIGINT | ID del distrito | `dim_personal_cnt.id_dist` |
| **nombre_distrito** | VARCHAR(255) | Nombre del distrito | `dim_distrito.desc_dist` |
| **nombre_provincia** | TEXT | Nombre de la provincia | `dim_provincia.desc_prov` |
| **nombre_departamento** | TEXT | Nombre del departamento | `dim_departamento.desc_depart` |
| **id_ipress** | BIGINT | ID de IPRESS asignada | `dim_personal_cnt.id_ipress` |
| **nombre_ipress** | VARCHAR(255) | Nombre de IPRESS | `dim_ipress.desc_ipress` |
| **id_area** | BIGINT | ID del área funcional | `dim_personal_cnt.id_area` |
| **nombre_area** | VARCHAR | Nombre del área | `dim_area.desc_area` |
| **id_regimen** | BIGINT | ID régimen laboral | `dim_personal_cnt.id_reg_lab` |
| **nombre_regimen** | VARCHAR | Régimen laboral (728, CAS, LOCADOR) | `dim_regimen_laboral.desc_reg_lab` |
| **codigo_planilla** | VARCHAR | Código de planilla | `dim_personal_cnt.cod_plan_rem` |
| **estado** | VARCHAR | Estado: ACTIVO, INACTIVO, BLOQUEADO | Calculado desde `dim_personal_cnt.stat_pers` |
| **colegiatura** | VARCHAR | Número de colegiatura profesional | `dim_personal_cnt.coleg_pers` |
| **id_usuario** | BIGINT | ID usuario del sistema | `dim_personal_cnt.id_usuario` |
| **username** ⭐ | VARCHAR(50) | Username del sistema (DNI) | `dim_usuarios.name_user` |
| **rol_usuario** | VARCHAR(50) | Rol principal del usuario | `dim_roles.desc_rol` |
| **tipo_personal_detalle** | TEXT | Tipo de personal (MEDICO, ENFERMERA, etc.) | `dim_tipo_personal.desc_tip_pers` |
| **profesion** | TEXT | Profesión (Medicina General, Enfermería, etc.) | `dim_profesiones.desc_prof` o `dim_personal_prof.desc_prof_otro` |
| **especialidad** | TEXT | Especialidad médica | `dim_servicio_essi.desc_servicio` |
| **rne_especialidad** | VARCHAR | RNE de especialidad | `dim_personal_prof.rne_prof` |
| **tipo_personal** | TEXT | INTERNO o EXTERNO | `dim_origen_personal.desc_origen` |
| **institucion** | VARCHAR | Institución externa (NULL para internos) | NULL |

---

## Tablas Relacionadas

La vista realiza JOIN con las siguientes tablas:

| Tabla | Relación | Propósito |
|-------|----------|-----------|
| **dim_usuarios** ⭐ | `id_usuario = id_user` | Obtener username del sistema |
| **dim_tipo_documento** | `id_tip_doc` | Tipo de documento |
| **dim_ipress** | `id_ipress` | IPRESS asignada |
| **dim_distrito** | `id_dist` | Ubicación geográfica |
| **dim_provincia** | `id_prov` (a través de distrito) | Provincia |
| **dim_departamento** | `id_depart` (a través de provincia) | Departamento |
| **dim_area** | `id_area` | Área funcional |
| **dim_regimen_laboral** | `id_reg_lab` | Régimen laboral |
| **dim_personal_tipo** | `id_pers` | Tipo de personal |
| **dim_tipo_personal** | `id_tip_pers` | Descripción tipo |
| **dim_personal_prof** | `id_pers` | Profesión y RNE |
| **dim_profesiones** | `id_prof` | Descripción profesión |
| **rel_user_roles** | `id_user` | Roles del usuario |
| **dim_roles** | `id_rol` | Descripción del rol |
| **dim_origen_personal** | `id_origen` | Origen (INTERNO/EXTERNO) |
| **dim_servicio_essi** | `id_servicio` | Especialidad |

---

## Uso en el Sistema

### Backend

**Entidad JPA**: `com.styp.cenate.model.view.PersonalTotalView`

```java
@Entity
@Table(name = "vw_personal_total")
@Immutable
public class PersonalTotalView {
    @Id
    @Column(name = "id_personal")
    private Long idPersonal;

    @Column(name = "username")  // ⭐ v1.15.1
    private String username;

    // ... más campos
}
```

**Service**: `com.styp.cenate.service.view.PersonalTotalService`

```java
public interface PersonalTotalService {
    List<PersonalTotalView> listarTodo();
}
```

**Controller**: `com.styp.cenate.api.personal.PersonalController`

```java
@GetMapping
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<List<PersonalTotalView>> getAllPersonal() {
    return ResponseEntity.ok(personalTotalService.listarTodo());
}
```

**Endpoint**: `GET /api/personal`

### Frontend

**Componente**: `frontend/src/pages/admin/GestionUsuariosPermisos.jsx`

```javascript
// Cargar usuarios
const loadUsers = async () => {
  const personal = await api.get('/personal');  // ⭐ v1.15.1 (antes: '/personal/total')
  setUsers(personal);
};

// Filtrar por username
const filteredUsers = useMemo(() => {
  return users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||  // ⭐ v1.15.1
    u.numeroDocumento?.includes(searchTerm)
  );
}, [users, searchTerm]);
```

---

## Consultas SQL Útiles

### Buscar usuario por username

```sql
SELECT id_personal, numero_documento, nombres, apellido_paterno,
       apellido_materno, username, nombre_ipress, estado
FROM vw_personal_total
WHERE username = '47136505';
```

### Listar personal activo de CENATE

```sql
SELECT id_personal, username, nombres, apellido_paterno, apellido_materno,
       nombre_regimen, nombre_area, rol_usuario
FROM vw_personal_total
WHERE nombre_ipress = 'CENTRO NACIONAL DE TELEMEDICINA'
  AND estado = 'ACTIVO'
ORDER BY apellido_paterno, apellido_materno, nombres;
```

### Personal sin usuario asignado

```sql
SELECT id_personal, numero_documento, nombres, apellido_paterno, apellido_materno,
       nombre_ipress, estado
FROM vw_personal_total
WHERE id_usuario IS NULL
  AND estado = 'ACTIVO';
```

### Personal con username duplicado (validación)

```sql
SELECT username, COUNT(*) as cantidad
FROM vw_personal_total
WHERE username IS NOT NULL
GROUP BY username
HAVING COUNT(*) > 1;
```

---

## Notas Importantes

### Performance

- **Índices recomendados**:
  - `dim_personal_cnt.id_usuario` (ya existe: `DIM_PERSONAL_CNT_id_usuario_key`)
  - `dim_usuarios.id_user` (ya existe: `DIM_USUARIOS_pkey`)
  - `dim_personal_cnt.num_doc_pers` (existe: parte de `uq_persona_doc_norm`)

### Limitaciones

- **Vista de solo lectura**: No se puede INSERT, UPDATE o DELETE
- **Performance**: Joins múltiples pueden ser lentos con grandes volúmenes
- **Campo institucion**: Siempre NULL (reservado para futuro uso)

### Cambios Futuros

Si necesitas agregar más campos:

1. Actualiza la vista SQL en el script `016_agregar_username_vw_personal_total.sql`
2. Ejecuta el script con `DROP VIEW ... CASCADE` y `CREATE VIEW`
3. Actualiza la entidad Java `PersonalTotalView.java`
4. Recompila el backend
5. Actualiza esta documentación

---

## Historial de Cambios

| Versión | Fecha | Cambio | Autor |
|---------|-------|--------|-------|
| v1.15.1 | 2026-01-02 | Agregado campo `username` con JOIN a `dim_usuarios` | Styp Canto Rondon |
| v1.0.0 | 2025-11-XX | Vista inicial creada | Styp Canto Rondon |

---

*Última actualización: 2026-01-02*
*Sistema CENATE - Centro Nacional de Telemedicina*
