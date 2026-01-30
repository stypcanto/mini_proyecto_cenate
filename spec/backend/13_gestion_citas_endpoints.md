# 🔧 Endpoints de Gestión de Citas v1.41.0

> **API REST - Solicitudes y Estados de Citas**
> **Versión:** v1.41.0
> **Status:** ✅ Producción
> **Última actualización:** 2026-01-30

---

## 📌 Overview

Conjunto de endpoints REST para gestionar citas de pacientes, incluyendo cambio de estados y actualización de información de contacto. Integración con módulo de Bolsas de Pacientes.

## 🔒 Autorización General

**Header requerido:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Roles válidos:**
- SUPERADMIN
- ADMIN
- COORDINADOR GESTION DE CITAS
- GESTOR DE CITAS

---

## 📋 Endpoints

### 1. Obtener Mi Bandeja (Pacientes Asignados)
```
GET /api/bolsas/solicitudes/mi-bandeja
```

**Descripción:** Obtiene todas las solicitudes asignadas al usuario actual (GESTOR DE CITAS)

**Autorización:** JWT Token
**Sin restricción de rol** (v1.40.4 - permite acceso desde módulo Gestión de Citas)

**Response 200 OK:**
```json
{
  "total": 1,
  "solicitudes": [
    {
      "id_solicitud": 9916,
      "numero_fila": null,
      "paciente_nombre": "MAMANI CCOSI DIEGO JESUS",
      "paciente_dni": "46183586",
      "edad": null,
      "genero": "M",
      "especialidad": "NEUROLOGIA",
      "desc_ipress": "CAP III SURQUILLO",
      "tipo_cita": "Referencia",
      "paciente_telefono": "987654321",
      "paciente_whatsapp": "-",
      "desc_estado_cita": "PENDIENTE",
      "responsable_gestora": null,
      "responsable_gestora_id": 181,
      "fecha_asignacion": "2026-01-29",
      "activo": true
    }
  ],
  "mensaje": "Se encontraron 1 solicitud(es) asignada(s)"
}
```

**Logs:**
```
📬 ENDPOINT: GET /api/bolsas/solicitudes/mi-bandeja
✅ Resultado final: Se encontraron 1 solicitud(es) en la bandeja
```

---

### 2. Cambiar Estado de Cita
```
PATCH /api/bolsas/solicitudes/{id}/estado?nuevoEstadoCodigo={CODIGO}
```

**Descripción:** Actualiza el estado de una solicitud usando el código del estado

**Parámetros:**
| Parámetro | Tipo | Ubicación | Requerido | Ejemplo |
|-----------|------|-----------|-----------|---------|
| id | Long | Path | ✓ | 9916 |
| nuevoEstadoCodigo | String | Query | ✓ | SIN_VIGENCIA |

**Autorización:**
- SUPERADMIN
- ADMIN
- COORDINADOR GESTION DE CITAS
- GESTOR DE CITAS

**Códigos de Estado Válidos:**
```
PENDIENTE_CITA      ID: 11  Paciente nuevo que ingresó a la bolsa
CITADO              ID: 1   Paciente agendado para atención
ATENDIDO_IPRESS     ID: 2   Paciente recibió atención en institución
NO_CONTESTA         ID: 3   Paciente no responde a las llamadas
SIN_VIGENCIA        ID: 4   Seguro del paciente no vigente
APAGADO             ID: 5   Teléfono del paciente apagado
NO_DESEA            ID: 6   Paciente rechaza la atención
REPROG_FALLIDA      ID: 7   No se pudo reprogramar la cita
NUM_NO_EXISTE       ID: 8   Teléfono registrado no existe
HC_BLOQUEADA        ID: 9   Historia clínica bloqueada en sistema
TEL_SIN_SERVICIO    ID: 10  Línea telefónica sin servicio
```

**Response 200 OK:**
```json
{
  "mensaje": "Estado actualizado exitosamente",
  "idSolicitud": 9916,
  "nuevoEstadoCodigo": "SIN_VIGENCIA",
  "nuevoEstadoId": 4
}
```

**Response 404 NOT FOUND:**
```json
{
  "error": "Estado no encontrado: CODIGO_INVALIDO"
}
```

**Response 500 INTERNAL SERVER ERROR:**
```json
{
  "error": "Error: [detalles del error]"
}
```

**Logs:**
```
📊 Cambiando estado de solicitud 9916 a SIN_VIGENCIA
✅ Estado encontrado: SIN_VIGENCIA (ID: 4)
Estado actualizado en solicitud 9916: 4
```

**Flujo:**
1. Validar autorización (rol GESTOR DE CITAS)
2. Buscar estado por código en `DimEstadosGestionCitasRepository`
3. Si no existe → 404 NOT FOUND
4. Obtener ID del estado
5. Llamar a `solicitudBolsaService.cambiarEstado(id, estadoId)`
6. Actualizar campo `estadoGestionCitasId` en solicitud
7. Guardar en BD
8. Retornar respuesta exitosa

---

### 3. Actualizar Teléfonos
```
PATCH /api/bolsas/solicitudes/{id}/actualizar-telefonos
```

**Descripción:** Actualiza los números de teléfono principal y/o alterno

**Parámetros:**
| Parámetro | Tipo | Ubicación | Requerido | Ejemplo |
|-----------|------|-----------|-----------|---------|
| id | Long | Path | ✓ | 9916 |
| pacienteTelefono | String | Body | ✗ | 987654321 |
| pacienteTelefonoAlterno | String | Body | ✗ | 912345678 |

**Request Body:**
```json
{
  "pacienteTelefono": "987654321",
  "pacienteTelefonoAlterno": "912345678"
}
```

**Validaciones:**
- ✓ Al menos uno de los teléfonos es requerido
- ✓ Se permiten valores vacíos o "-"
- ✓ Se trimean los espacios en blanco

**Autorización:**
- Requiere permiso MBAC: `/modulos/bolsas/solicitudes` → `actualizar`

**Response 200 OK:**
```json
{
  "mensaje": "Teléfonos actualizados correctamente",
  "solicitud": {
    "idSolicitud": 9916,
    "pacienteTelefono": "987654321",
    "pacienteTelefonoAlterno": "912345678"
  }
}
```

**Response 400 BAD REQUEST:**
```json
{
  "error": "Al menos uno de los teléfonos es requerido"
}
```

**Response 404 NOT FOUND:**
```json
{
  "error": "Solicitud no encontrada"
}
```

**Response 500 INTERNAL SERVER ERROR:**
```json
{
  "error": "Error al actualizar teléfonos: [detalles]"
}
```

**Logs:**
```
📞 Actualizando teléfonos para solicitud ID: 9916
✅ Teléfonos actualizados para solicitud 9916
```

**Flujo:**
1. Validar autorización (MBAC)
2. Validar que al menos uno de los teléfonos está presente
3. Obtener solicitud por ID
4. Si no existe → 404 NOT FOUND
5. Actualizar campos:
   - `pacienteTelefono`
   - `pacienteTelefonoAlterno`
6. Guardar en BD
7. Retornar datos actualizados

---

## 🗂️ Entidades Relacionadas

### SolicitudBolsa
```java
@Column(name = "paciente_telefono")
private String pacienteTelefono;

@Column(name = "paciente_telefono_alterno")
private String pacienteTelefonoAlterno;

@Column(name = "estado_gestion_citas_id", nullable = false)
private Long estadoGestionCitasId;

@Column(name = "estado", length = 20, nullable = false)
private String estado;  // Display value, ej: "PENDIENTE"
```

### DimEstadosGestionCitas
```java
@Column(name = "id_estado_cita")
private Long idEstado;

@Column(name = "cod_estado_cita", unique = true)
private String codigoEstado;  // CITADO, SIN_VIGENCIA, etc.

@Column(name = "desc_estado_cita")
private String descripcionEstado;
```

---

## 🔄 Flujos de Negocio

### Cambiar Estado - Happy Path
```
1. Gestor visualiza paciente en Mi Bandeja
2. Hace clic en dropdown de Estado
3. Selecciona nuevo estado (ej: SIN_VIGENCIA)
4. Frontend: PATCH /api/bolsas/solicitudes/9916/estado?nuevoEstadoCodigo=SIN_VIGENCIA
5. Backend:
   - Autentica con JWT
   - Valida rol GESTOR DE CITAS ✓
   - Busca estado por código SIN_VIGENCIA (ID: 4) ✓
   - Actualiza estadoGestionCitasId = 4
   - Guardar en BD
6. Frontend: refrescar tabla
7. Mostrar toast: "Estado actualizado correctamente"
```

### Actualizar Teléfono - Happy Path
```
1. Gestor visualiza paciente en Mi Bandeja
2. Hace clic en botón "📱 Teléfono"
3. Se abre modal con datos del paciente
4. Ingresa número: 987654321
5. Hace clic en "Guardar"
6. Frontend: PATCH /api/bolsas/solicitudes/9916/actualizar-telefonos
   Body: {"pacienteTelefono": "987654321", "pacienteTelefonoAlterno": "-"}
7. Backend:
   - Autentica con JWT
   - Valida permiso MBAC ✓
   - Valida al menos un teléfono ✓
   - Obtiene solicitud 9916 ✓
   - Actualiza pacienteTelefono = "987654321"
   - Guardar en BD
8. Frontend: refrescar tabla
9. Mostrar toast: "Teléfonos actualizados correctamente"
10. Modal se cierra
11. Tabla muestra nuevo teléfono
```

---

## 🗄️ Base de Datos

### Tabla: dim_solicitud_bolsa
```sql
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS paciente_telefono_alterno VARCHAR(20),
ADD COLUMN IF NOT EXISTS estado_gestion_citas_id BIGINT
  REFERENCES dim_estados_gestion_citas(id_estado_cita);
```

### Tabla: dim_estados_gestion_citas
```sql
CREATE TABLE IF NOT EXISTS dim_estados_gestion_citas (
  id_estado_cita BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  cod_estado_cita TEXT NOT NULL UNIQUE,
  desc_estado_cita TEXT NOT NULL,
  stat_estado_cita TEXT NOT NULL DEFAULT 'A' CHECK (stat_estado_cita IN ('A', 'I')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_estados_gestion_citas_cod ON dim_estados_gestion_citas(cod_estado_cita);
CREATE INDEX idx_estados_gestion_citas_stat ON dim_estados_gestion_citas(stat_estado_cita);
```

---

## 🧪 Testing

### Curl Examples

**Obtener Mi Bandeja:**
```bash
curl -X GET http://localhost:8080/api/bolsas/solicitudes/mi-bandeja \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Cambiar Estado:**
```bash
curl -X PATCH "http://localhost:8080/api/bolsas/solicitudes/9916/estado?nuevoEstadoCodigo=SIN_VIGENCIA" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Actualizar Teléfono:**
```bash
curl -X PATCH http://localhost:8080/api/bolsas/solicitudes/9916/actualizar-telefonos \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteTelefono": "987654321",
    "pacienteTelefonoAlterno": "912345678"
  }'
```

---

## 📊 Métricas y Logs

### Success Logs
```
[INFO] 📬 ENDPOINT: GET /api/bolsas/solicitudes/mi-bandeja
[INFO] ✅ Resultado final: Se encontraron 1 solicitud(es) en la bandeja
[INFO] 📊 Cambiando estado de solicitud 9916 a SIN_VIGENCIA
[INFO] ✅ Estado encontrado: SIN_VIGENCIA (ID: 4)
[INFO] Estado actualizado en solicitud 9916: 4
[INFO] 📞 Actualizando teléfonos para solicitud ID: 9916
[INFO] ✅ Teléfonos actualizados para solicitud 9916
```

### Error Logs
```
[ERROR] ❌ Estado no encontrado: CODIGO_INVALIDO
[ERROR] ❌ Solicitud no encontrada
[ERROR] ❌ RuntimeException: Access Denied
[WARN] Authorized [granted=false]
```

---

## 🔧 Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token inválido o expirado | Renovar token de autenticación |
| 403 Forbidden | Usuario no tiene rol GESTOR DE CITAS | Asignar rol correcto en BD |
| 404 Estado no encontrado | Código de estado inválido | Verificar código en dim_estados_gestion_citas |
| 404 Solicitud no encontrada | ID de solicitud no existe | Verificar ID en dim_solicitud_bolsa |
| 400 Teléfono requerido | Ambos teléfonos están vacíos | Proporcionar al menos uno |
| 500 Internal Server Error | Error en BD o procesamiento | Ver logs de backend |

---

## 📝 Changelog

### v1.41.0 (2026-01-30)
- ✅ Nuevo endpoint: PATCH /api/bolsas/solicitudes/{id}/estado
- ✅ Nuevo endpoint: PATCH /api/bolsas/solicitudes/{id}/actualizar-telefonos
- ✅ Nueva entidad: DimEstadosGestionCitas
- ✅ Nueva entidad: DimEstadosGestionCitasRepository
- ✅ Fix: @PreAuthorize role strings con espacios (GESTOR DE CITAS)
- ✅ Fix: Mapeo de código estado a ID en backend

### v1.40.0
- ✓ Módulo Bolsas v3.0.0

---

## 📚 Referencias

- [`spec/frontend/12_modulo_gestion_citas.md`](../frontend/12_modulo_gestion_citas.md) - Frontend Docs
- [`spec/backend/09_modules_bolsas/README.md`](../backend/09_modules_bolsas/README.md) - Módulo Bolsas
- [`spec/database/README.md`](../database/README.md) - Schema Database
- CLAUDE.md - Project Instructions

---

**API Version:** v1.41.0
**Última actualización:** 2026-01-30
**Autor:** Claude Haiku 4.5
**Status:** ✅ Producción
