# 🧪 TESTING MANUAL END-TO-END
## Asignación de Gestora de Citas - Módulo Bolsas v2.4.0

**Fecha:** 2026-01-29
**Versión:** v1.0.0
**Status:** ✅ Listo para Testing

---

## 🎯 Checklist de Testing

- [ ] Backend levantado en localhost:8080
- [ ] Base de datos actualizada (migrations V3_2_0, V3_2_1)
- [ ] Permisos MBAC configurados
- [ ] Frontend levantado en localhost:3000
- [ ] Usuario COORDINADOR_DE_CITAS creado en BD
- [ ] Usuarios GESTOR_DE_CITAS creados (mínimo 2)

---

## 📋 CASOS DE TEST

### **CASO 1: Listar Gestoras Disponibles**

**Objetivo:** Verificar que el endpoint retorna gestoras activas con rol GESTOR_DE_CITAS

**URL:** `GET http://localhost:8080/api/bolsas/solicitudes/gestoras-disponibles`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Comando curl:**
```bash
curl -X GET http://localhost:8080/api/bolsas/solicitudes/gestoras-disponibles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Respuesta Esperada (200):**
```json
{
  "total": 2,
  "gestoras": [
    {
      "id": 100,
      "nombre": "maria.gestor",
      "nombreCompleto": "maria.gestor",
      "activo": true
    },
    {
      "id": 101,
      "nombre": "juan.gestor",
      "nombreCompleto": "juan.gestor",
      "activo": true
    }
  ],
  "mensaje": "Se encontraron 2 gestora(s) disponible(s)"
}
```

**✅ VALIDACIÓN:**
- [ ] Status 200 OK
- [ ] Array de gestoras no vacío
- [ ] Cada gestora tiene id, nombre, activo
- [ ] Solo usuarios activos listados
- [ ] Mensaje correcto

---

### **CASO 2: Asignar Gestora Exitosamente**

**Objetivo:** Verificar asignación exitosa de gestora a solicitud

**URL:** `PATCH http://localhost:8080/api/bolsas/solicitudes/{idSolicitud}/asignar?idGestora={idGestora}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Comando curl:**
```bash
curl -X PATCH "http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=100" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Respuesta Esperada (200):**
```json
{
  "mensaje": "Gestora asignada exitosamente",
  "idSolicitud": 1,
  "idGestora": 100
}
```

**✅ VALIDACIÓN:**
- [ ] Status 200 OK
- [ ] Mensaje contiene "Gestora asignada"
- [ ] IDs coinciden con enviados
- [ ] BD se actualizó (responsable_gestora_id = 100)
- [ ] Timestamp se guardó (fecha_asignacion)

**Verificar en BD:**
```sql
SELECT id_solicitud, responsable_gestora_id, fecha_asignacion
FROM dim_solicitud_bolsa
WHERE id_solicitud = 1;
```

---

### **CASO 3: Error - Solicitud No Encontrada**

**Objetivo:** Verificar manejo de solicitud inexistente

**URL:** `PATCH http://localhost:8080/api/bolsas/solicitudes/999/asignar?idGestora=100`

**Respuesta Esperada (404):**
```json
{
  "error": "Solicitud 999 no encontrada"
}
```

**✅ VALIDACIÓN:**
- [ ] Status 404 Not Found
- [ ] Mensaje claro del error
- [ ] BD no se modificó

---

### **CASO 4: Error - Gestora No Encontrada**

**Objetivo:** Verificar que gestora inexistente es rechazada

**URL:** `PATCH http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=999`

**Respuesta Esperada (404):**
```json
{
  "error": "Usuario 999 no encontrado"
}
```

**✅ VALIDACIÓN:**
- [ ] Status 404 Not Found
- [ ] Mensaje contiene "Usuario 999"
- [ ] Solicitud no fue modificada

---

### **CASO 5: Error - Usuario Sin Rol GESTOR_DE_CITAS**

**Objetivo:** Validar que solo usuarios con rol GESTOR_DE_CITAS se pueden asignar

**Preparación:** Crear usuario sin rol gestor (ID 200)

**URL:** `PATCH http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=200`

**Respuesta Esperada (400):**
```json
{
  "error": "El usuario ... no tiene el rol GESTOR_DE_CITAS"
}
```

**✅ VALIDACIÓN:**
- [ ] Status 400 Bad Request
- [ ] Mensaje menciona falta de rol
- [ ] Solicitud no fue modificada

---

### **CASO 6: Error - Gestora Inactiva**

**Objetivo:** Validar que gestoras inactivas no pueden ser asignadas

**Preparación:** Desactivar gestora (setear statUser = 'I')

**URL:** `PATCH http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=100`

**Respuesta Esperada (400):**
```json
{
  "error": "El usuario ... está inactivo"
}
```

**✅ VALIDACIÓN:**
- [ ] Status 400 Bad Request
- [ ] Mensaje menciona "inactivo"
- [ ] Solicitud no fue modificada

---

### **CASO 7: Reasignación de Gestora**

**Objetivo:** Verificar cambio de gestora asignada

**Preparación:** Asignar gestora 100, luego asignar gestora 101

**Pasos:**
1. PATCH `/api/bolsas/solicitudes/1/asignar?idGestora=100` → 200 OK
2. Verificar BD: `responsable_gestora_id = 100`
3. PATCH `/api/bolsas/solicitudes/1/asignar?idGestora=101` → 200 OK
4. Verificar BD: `responsable_gestora_id = 101`

**✅ VALIDACIÓN:**
- [ ] Primera asignación exitosa
- [ ] Segunda asignación exitosa (reasignación)
- [ ] BD tiene nueva gestora (ID 101)
- [ ] fecha_asignacion actualizado a nuevo timestamp

---

### **CASO 8: Frontend - Modal de Asignación**

**Objetivo:** Verificar flujo completo en UI

**Pasos:**
1. [ ] Ir a http://localhost:3000/bolsas/solicitudes
2. [ ] Seleccionar una solicitud
3. [ ] Hacer clic en botón "Asignar Gestora"
4. [ ] Verificar que modal abre
5. [ ] Verificar que gestoras se cargan desde backend
6. [ ] Seleccionar una gestora
7. [ ] Hacer clic en "Asignar"
8. [ ] Verificar mensaje de éxito
9. [ ] Verificar que tabla se actualiza
10. [ ] Recargar página y verificar persistencia

**✅ VALIDACIÓN:**
- [ ] Modal carga correctamente
- [ ] Dropdown muestra gestoras dinámicas
- [ ] No hay gestoras hardcodeadas
- [ ] Asignación es exitosa
- [ ] Datos persisten en BD
- [ ] Tabla se actualiza sin recargar

---

### **CASO 9: Permisos MBAC**

**Objetivo:** Verificar control de acceso por roles

**Preparación:**
- Usuario 1: COORDINADOR_DE_CITAS (debe tener acceso)
- Usuario 2: GESTOR_DE_CITAS (NO debe tener acceso de escritura)
- Usuario 3: SIN_PERMISOS (NO debe tener acceso)

**Test 1: COORDINADOR_DE_CITAS**
```bash
# Usuario con rol COORDINADOR_DE_CITAS
curl -X PATCH "http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=100" \
  -H "Authorization: Bearer <token_coordinador>"
```
**Esperado:** 200 OK ✅

**Test 2: GESTOR_DE_CITAS**
```bash
# Usuario con rol GESTOR_DE_CITAS
curl -X PATCH "http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=100" \
  -H "Authorization: Bearer <token_gestor>"
```
**Esperado:** 403 Forbidden (sin permiso de escritura) ✅

**✅ VALIDACIÓN:**
- [ ] COORDINADOR tiene acceso (200)
- [ ] GESTOR es denegado (403)
- [ ] Sin permisos es denegado (403)

---

## 📊 MATRIZ DE RESULTADOS

| Caso | Descripción | Status | Observaciones |
|------|-------------|--------|---------------|
| 1 | Listar gestoras | ⏳ | |
| 2 | Asignar exitoso | ⏳ | |
| 3 | Solicitud no existe | ⏳ | |
| 4 | Gestora no existe | ⏳ | |
| 5 | Sin rol GESTOR | ⏳ | |
| 6 | Gestora inactiva | ⏳ | |
| 7 | Reasignación | ⏳ | |
| 8 | Frontend E2E | ⏳ | |
| 9 | MBAC | ⏳ | |

---

## 🚀 NOTAS IMPORTANTES

### Obtener Token JWT

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "coordinador.user",
    "password": "Essalud2025"
  }'
```

Copiar el token del `accessToken` en la respuesta.

### Migrations

Asegúrate de que las migrations se ejecutaron:

```sql
-- Verificar columnas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
  AND column_name IN ('responsable_gestora_id', 'fecha_asignacion');

-- Verificar índices
SELECT * FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
  AND indexname LIKE '%gestora%';

-- Verificar FK
SELECT constraint_name, table_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'dim_solicitud_bolsa'
  AND column_name = 'responsable_gestora_id';
```

### Logs

Buscar logs de auditoría:

```bash
# Backend
tail -f /var/log/cenate/spring-boot.log | grep "asignar\|gestora"

# Frontend console
// Abrir DevTools > Console
// Buscar mensajes con "asignar" o "gestora"
```

---

## ✅ CRITERIOS DE ÉXITO

✅ Todos 8 casos de test pasan
✅ No hay errores en backend
✅ No hay errores en frontend (console)
✅ BD se actualiza correctamente
✅ Permisos MBAC funcionan
✅ Auditoría registra cambios
✅ UI es responsiva
✅ Validaciones funcionan

---

**Status:** ⏳ En Testing
**Reportar:** Cualquier fallo al coordinador del proyecto
**Fecha Completación:** ___/___/___
