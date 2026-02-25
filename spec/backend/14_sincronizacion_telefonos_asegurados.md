# Sincronización de Teléfonos desde Asegurados

> **Versión:** v1.67.0
> **Fecha:** 2026-02-25
> **Estado:** Operativo

---

## Problema

Los pacientes importados desde bolsas (especialmente PADOMI) se cargaron sin teléfonos.
La tabla `asegurados` sí contiene teléfonos (`tel_fijo`, `tel_celular`) para muchos de estos pacientes.
Se necesita sincronizar esos teléfonos hacia `dim_solicitud_bolsa`.

## Solución

Endpoint que busca solicitudes activas sin teléfono y completa los datos desde la tabla `asegurados`, haciendo match por DNI.

---

## Endpoint

```
POST /api/bolsas/solicitudes/sincronizar-telefonos
```

### Roles permitidos
`SUPERADMIN`, `ADMIN`, `COORDINADOR`, `COORD. GESTION CITAS`, `GESTOR DE CITAS`

### Respuesta exitosa
```json
{
  "estado": "exito",
  "mensaje": "Sincronización completada: 1335 actualizados, 209 sin teléfono en asegurados",
  "total_sin_telefono": 1544,
  "actualizados": 1335,
  "sin_telefono_en_asegurados": 209,
  "dnis_actualizados": ["12345678", "..."],
  "fecha": "2026-02-25T11:16:20.243060"
}
```

---

## Mapeo de campos

| Tabla `asegurados` | Tabla `dim_solicitud_bolsa` | Prioridad |
|---------------------|------------------------------|-----------|
| `tel_fijo`          | `paciente_telefono`          | Principal |
| `tel_celular`       | `paciente_telefono_alterno`  | Alterno   |

### Lógica de asignación
1. Si el asegurado tiene `tel_fijo` → se usa como `paciente_telefono` (principal)
2. Si tiene `tel_celular` y ya se asignó fijo → se usa como `paciente_telefono_alterno`
3. Si solo tiene `tel_celular` (sin fijo) → se usa como `paciente_telefono` (principal)
4. Si no tiene ninguno → se cuenta como `sin_telefono_en_asegurados` y se omite

### Match
- `asegurados.doc_paciente` = `dim_solicitud_bolsa.paciente_dni`

---

## Alcance

- Aplica a **todas las bolsas** (PADOMI, Módulo 107, Dengue, Mesa de Ayuda, etc.)
- Solo actualiza solicitudes **activas** (`activo = true`)
- Solo actualiza solicitudes con **teléfono principal vacío o null**
- No sobreescribe teléfonos existentes

---

## Arquitectura

### Backend

| Capa | Archivo | Método |
|------|---------|--------|
| Controller | `SolicitudBolsaController.java` | `sincronizarTelefonos()` |
| Service (interfaz) | `SolicitudBolsaService.java` | `sincronizarTelefonosDesdeAsegurados()` |
| Service (impl) | `SolicitudBolsaServiceImpl.java` | `sincronizarTelefonosDesdeAsegurados()` |
| Repository | `AseguradoRepository.java` | `findByDocPacienteIn(List<String>)` |

### Frontend

| Capa | Archivo | Función/Componente |
|------|---------|---------------------|
| Service | `bolsasService.js` | `sincronizarTelefonos()` |
| Página | `Solicitudes.jsx` | Botón "Sincronizar Teléfonos" con tooltip |

### Flujo de ejecución

```
1. Usuario hace click en botón "Sincronizar Teléfonos"
2. Frontend → POST /api/bolsas/solicitudes/sincronizar-telefonos
3. Backend:
   a. Carga todas las solicitudes activas sin teléfono principal
   b. Extrae DNIs únicos
   c. Batch query: aseguradoRepository.findByDocPacienteIn(dnis)
   d. Mapea tel_fijo → paciente_telefono, tel_celular → paciente_telefono_alterno
   e. solicitudRepository.saveAll(paraGuardar)  ← batch save
4. Retorna reporte con métricas
5. Frontend muestra toast con resultado y recarga la tabla
```

---

## UI

- **Ubicación:** Página `/bolsas/solicitudespendientes`, junto al botón "Ver Pacientes Nuevos"
- **Estilo:** Botón azul claro con icono `Phone` de Lucide
- **Tooltip:** "Completa los teléfonos vacíos buscando en la base de asegurados por DNI"
- **Estado loading:** Texto cambia a "Sincronizando..." con icono pulsante
- **Post-sync:** Toast de éxito con conteo + recarga automática de tabla

---

## Primera ejecución (2026-02-25)

| Métrica | Valor |
|---------|-------|
| Solicitudes sin teléfono | 1,544 |
| Teléfonos completados | 1,335 (86.5%) |
| Sin teléfono en asegurados | 209 (13.5%) |
