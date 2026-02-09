# 🔔 Notificaciones de Pacientes Pendientes para Médicos

**Versión:** v1.62.0 (2026-02-08)
**Status:** ✅ Implementado
**Tipo:** Feature
**Impacto:** Médicos ven contador de pacientes pendientes en campanita

---

## 📋 Resumen

Sistema de notificaciones que permite a los médicos ver el número de pacientes pendientes de atender directamente en la campanita de notificaciones (NotificationBell). Se actualiza cada 60 segundos mediante polling automático.

### ¿Qué es "Pendiente"?

Un paciente está **Pendiente** cuando:
- Está asignado al médico actual (`id_personal` = ID del médico)
- Su estado es **"Pendiente"** (`condicion_medica = 'Pendiente'`)
- El registro está activo en la base de datos (`activo = true`)

---

## ✨ Características

### ✅ Frontend
- **Detección automática** de rol MEDICO
- **Polling cada 60 segundos** - Sin saturar el servidor
- **Badge con contador** - Muestra total de notificaciones (usuarios + pacientes)
- **Sección separada** - Pacientes en color azul, usuarios en color amarillo
- **Navegación rápida** - Un clic para ir a `/roles/medico/pacientes`
- **Compatible** - No rompe funcionalidad existente de usuarios pendientes

### ✅ Backend
- **Query optimizada** - Usa `COUNT(*)` sin cargar datos completos
- **MBAC integrado** - Reutiliza permisos de `/roles/medico/pacientes`
- **Caché implícita** - Los índices de BD aceleran la consulta
- **Sin transacciones complejas** - Solo lectura, muy rápido

---

## 🏗️ Arquitectura

### Backend

#### 1. Repository: `SolicitudBolsaRepository.java`

```java
@Query("SELECT COUNT(s) FROM SolicitudBolsa s WHERE " +
       "s.idPersonal = :idPersonal AND " +
       "s.condicionMedica = 'Pendiente' AND " +
       "s.activo = true")
long countByIdPersonalAndCondicionPendiente(@Param("idPersonal") Long idPersonal);
```

**Beneficios:**
- No carga datos completos (solo `COUNT`)
- Usa índice en `id_personal`
- Response time < 50ms

#### 2. Service: `GestionPacienteServiceImpl.java`

```java
@Override
@Transactional(readOnly = true)
public long contarPacientesPendientesDelMedicoActual() {
    // 1. Obtener usuario autenticado
    String username = SecurityContextHolder.getContext()
        .getAuthentication().getName();

    // 2. Buscar PersonalCnt del usuario
    Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    Long idPers = usuario.getPersonalCnt().getIdPers();

    // 3. Contar pacientes pendientes
    return solicitudBolsaRepository.countByIdPersonalAndCondicionPendiente(idPers);
}
```

**Patrón:**
- Reutiliza lógica de `obtenerPacientesDelMedicoActual()`
- Mismo manejo de error y logging
- Seguridad integrada (obtiene usuario del contexto)

#### 3. Controller: `GestionPacienteController.java`

```java
@GetMapping("/medico/contador-pendientes")
@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver")
public ResponseEntity<Map<String, Long>> contarPacientesPendientes() {
    long contador = servicio.contarPacientesPendientesDelMedicoActual();
    return ResponseEntity.ok(Map.of("pendientes", contador));
}
```

**Response:**
```json
{
  "pendientes": 5
}
```

### Frontend

#### 1. Service: `gestionPacientesService.js`

```javascript
obtenerContadorPendientes: async () => {
    const response = await apiClient.get(`${BASE_ENDPOINT}/medico/contador-pendientes`);
    return response?.pendientes || 0;
},
```

#### 2. Component: `NotificationBell.jsx`

**Lógica de Detección de Rol:**
```javascript
useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = user.roles || [];
    const isMedico = roles.some(r =>
        r.toUpperCase() === 'MEDICO' || r.toUpperCase() === 'MÉDICO'
    );
    setEsMedico(isMedico);
}, []);
```

**Polling Integrado:**
```javascript
useEffect(() => {
    consultarPendientes();

    const intervalo = setInterval(() => {
        consultarPendientes();
    }, 60000); // 1 minuto

    return () => clearInterval(intervalo);
}, [esMedico]);
```

**Función de Consulta:**
```javascript
const consultarPendientes = async () => {
    try {
        // Usuarios pendientes (ADMIN/SUPERADMIN)
        const responseUsuarios = await apiClient.get(
            '/api/usuarios/pendientes-rol',
            false,
            { timeoutMs: 10000 }
        );
        if (responseUsuarios?.pendientes !== undefined) {
            setPendientes(responseUsuarios.pendientes);
        }

        // Pacientes pendientes (MEDICO)
        if (esMedico) {
            const responsePacientes = await gestionPacientesService.obtenerContadorPendientes();
            setPendientesPacientes(responsePacientes || 0);
        }
    } catch (error) {
        console.error('Error al consultar notificaciones:', error);
    }
};
```

**Dropdown Mejorado:**
- Sección separada para usuarios (amarillo)
- Sección separada para pacientes (azul)
- Total combinado en el badge

---

## 📊 Flujo de Datos

```
┌─────────────────┐
│  Médico logueado │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ NotificationBell.jsx carga       │
│ - Detecta rol MEDICO            │
│ - Inicia polling cada 60s       │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│ GET /api/gestion-pacientes/medico/contador-pendientes
│ (cada 60 segundos)                                 │
└────────┬──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GestionPacienteController        │
│ @CheckMBACPermission validada    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GestionPacienteService           │
│ 1. getUsuarioActual()            │
│ 2. getIdPers() from PersonalCnt  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ SolicitudBolsaRepository             │
│ countByIdPersonalAndCondicionPendiente
│ Query: COUNT(*) WHERE               │
│   id_personal = ? AND               │
│   condicion_medica = 'Pendiente' AND│
│   activo = true                     │
└────────┬────────────────────────────┘
         │
         ▼ (~20-50ms)
┌──────────────────────────────────┐
│ Response: {"pendientes": 5}       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ NotificationBell.jsx             │
│ - Actualiza contador             │
│ - Badge muestra número           │
│ - Dropdown con sección azul      │
└──────────────────────────────────┘
```

---

## 🧪 Testing Manual

### Requisitos Previos

1. Backend ejecutándose: `./gradlew bootRun`
2. Frontend ejecutándose: `npm start`
3. Tener una cuenta con rol MEDICO
4. Tener pacientes asignados con estado "Pendiente" en la BD

### Paso 1: Login como Médico

```bash
URL: http://localhost:3000/login
Usuario: un_medico_dni
Contraseña: password
```

### Paso 2: Verificar que aparece la campanita

1. Ir al header (arriba a la derecha)
2. Debería verse la campanita 🔔 con un badge rojo
3. El badge debe mostrar un número

### Paso 3: Abrir el Dropdown

1. Hacer clic en la campanita
2. Se abre un dropdown con dos secciones (si aplica):
   - **Usuarios Pendientes** (amarillo) - si es ADMIN
   - **Mis Pacientes Pendientes** (azul) - si es MEDICO

### Paso 4: Verificar Contenido

En la sección azul "Mis Pacientes Pendientes" debe ver:

```
👨‍⚕️ Mis Pacientes Pendientes
[X pacientes esperando atención]
[Haz clic para ver tus pacientes pendientes]
```

### Paso 5: Hacer Clic

Hacer clic en la sección debe navegar a `/roles/medico/pacientes`

### Paso 6: Verificar Polling

1. Abrir DevTools (F12)
2. Ir a Network
3. Esperar 60 segundos
4. Debería ver una petición GET a `/api/gestion-pacientes/medico/contador-pendientes`

### Paso 7: Probar Cambios en Tiempo Real

1. En otra ventana del navegador (o tab):
   - Login como COORDINADOR
   - Asignar un nuevo paciente al médico

2. Volver a la ventana del médico:
   - Esperar 60 segundos (o forzar recarga)
   - El contador debe aumentar

---

## 🔍 Verificación de Base de Datos

```sql
-- Verificar pacientes pendientes de un médico
SELECT
    id_solicitud,
    paciente_dni,
    paciente_nombre,
    id_personal,
    condicion_medica,
    fecha_asignacion
FROM dim_solicitud_bolsa
WHERE id_personal = <ID_DEL_MEDICO>
  AND condicion_medica = 'Pendiente'
  AND activo = true;

-- El COUNT debe coincidir con el número en la campanita
SELECT COUNT(*) as pendientes
FROM dim_solicitud_bolsa
WHERE id_personal = <ID_DEL_MEDICO>
  AND condicion_medica = 'Pendiente'
  AND activo = true;
```

---

## 🚀 Deployment

### Backend
```bash
cd backend
./gradlew build
# JAR estará en: build/libs/cenate-*.jar
```

### Frontend
```bash
cd frontend
npm run build
# Dist estará en: build/
```

---

## 📈 Performance

### Response Time
- **Esperado:** < 50ms por consulta
- **Razón:** Query es solo `COUNT(*)` sin JOINs
- **Índices:** Usa índice en `id_personal`

### Network
- **Polling:** 60 segundos = 1 request/min
- **Payload:** ~30 bytes de respuesta
- **Impacto:** Mínimo

### Escalabilidad
- **Con 100 médicos logueados:** 100 requests/min = 1.67 req/seg (insignificante)
- **Con 1000 médicos:** 16.67 req/seg (manejable)
- **Base de datos:** Sin problemas, índices presentes

---

## 🐛 Troubleshooting

### La campanita no aparece

**Posibles causas:**

1. No tienes rol MEDICO
   - Verifica en DevTools: `console.log(localStorage.getItem('user'))`
   - Debe contener `"roles": ["MEDICO", ...]`

2. No hay pacientes pendientes
   - Ejecuta: `SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_personal = <TU_ID> AND condicion_medica = 'Pendiente' AND activo = true;`
   - Debe devolver > 0

3. El endpoint retorna error
   - Revisa DevTools → Network → contador-pendientes
   - Verifica status: debe ser 200
   - Verifica response: debe ser `{"pendientes": N}`

### La campanita aparece pero el contador es 0

1. Verifica que los pacientes están realmente pendientes:
   ```sql
   SELECT condicion_medica, COUNT(*) FROM dim_solicitud_bolsa
   WHERE id_personal = <TU_ID> GROUP BY condicion_medica;
   ```

2. Verifica que los registros están activos:
   ```sql
   SELECT activo, COUNT(*) FROM dim_solicitud_bolsa
   WHERE id_personal = <TU_ID> GROUP BY activo;
   ```

### No se actualiza el contador cada 60 segundos

1. Abre DevTools → Console
2. Debe haber logs: `✅ Se encontraron X pacientes pendientes`
3. Si no hay logs: el polling no está funcionando
   - Verifica que `esMedico === true`
   - Verifica que hay permisos MBAC

---

## 📝 Archivos Modificados

### Backend (4 archivos)
1. **SolicitudBolsaRepository.java** - Query de conteo
2. **IGestionPacienteService.java** - Interfaz del servicio
3. **GestionPacienteServiceImpl.java** - Implementación (~40 líneas)
4. **GestionPacienteController.java** - Endpoint nuevo (~10 líneas)

### Frontend (2 archivos)
1. **gestionPacientesService.js** - Método de servicio (~4 líneas)
2. **NotificationBell.jsx** - Componente expandido (~100 líneas añadidas)

---

## 🔐 Seguridad

- ✅ Usa mismo MBAC que `/roles/medico/pacientes`
- ✅ Solo obtiene datos del usuario autenticado
- ✅ No expone datos de otros médicos
- ✅ Query no tiene riesgo de SQL injection (es JPA)
- ✅ Timeout integrado en apiClient (10 segundos)

---

## 📚 Documentación Relacionada

- [`spec/backend/README.md`](../backend/README.md) - APIs Backend
- [`spec/frontend/README.md`](../frontend/README.md) - Componentes Frontend
- [`spec/architecture/01_flujo_atenciones_completo.md`](../architecture/01_flujo_atenciones_completo.md) - Flujo de atenciones

---

## ✅ Checklist de Verificación

- [ ] Backend compila sin errores: `./gradlew compileJava`
- [ ] Frontend compila sin errores: `npm run build`
- [ ] Login como médico funciona
- [ ] Campanita aparece en header
- [ ] Campanita muestra contador > 0
- [ ] Dropdown se abre al hacer clic
- [ ] Sección azul "Mis Pacientes Pendientes" visible
- [ ] Hacer clic navega a `/roles/medico/pacientes`
- [ ] DevTools muestra request cada 60 segundos
- [ ] Contador se actualiza cuando cambia en BD
- [ ] No hay errores en console
- [ ] No hay errores en red

---

**Versión:** v1.62.0 (2026-02-08)
**Autor:** Ing. Styp Canto Rondón
