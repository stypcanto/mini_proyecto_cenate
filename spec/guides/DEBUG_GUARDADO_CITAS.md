# 🔍 GUÍA DE DEBUG: No se guardan Fecha, Hora, Estado ni Especialista

**Última actualización:** 2026-02-03  
**Versión:** v3.5.1

---

## 📋 Checklist de Verificación

### Paso 1: Verificar que el botón "✏️ Editar" esté habilitado

**En la consola (F12):**

```javascript
// Ir a la fila del paciente y ver si hay un botón azul "✏️ Editar"
// Si NO está, significa que pacienteEditandoEstado es diferente del ID del paciente
```

**Esperado:** Botón azul visible

---

### Paso 2: Hacer clic en "✏️ Editar"

Cuando haces clic, debes ver en la consola (F12):

```
🔄 Paciente 5 tiene idPersonal 190, cargando médicos del servicio 3
✅ Se obtuvieron 8 médicos para servicio 3
```

**Esperado:** Filas de médicos se cargan

---

### Paso 3: Seleccionar un estado

En la consola debes ver:

```
Ningún log específico (es solo un onChange normal)
```

**Esperado:** El dropdown muestra estados disponibles

---

### Paso 4: Seleccionar especialista (médico)

En la consola debes ver:

```
Ningún log específico en esta versión
```

**Esperado:** El médico se selecciona en el dropdown

---

### Paso 5: Seleccionar fecha y hora

En el input datetime-local, la fecha debe aparecer como "07/02/2026 13:15"

---

### Paso 6: Hacer clic en "💾 Guardar"

Abre consola (F12) y busca estos logs:

```javascript
// Logs de validación
📝 Paciente a guardar: { id: 5, ... }
📝 Especialista: 190
📝 Fecha/Hora: 2026-02-07T13:15
📝 Estado: CITADO

// Logs de búsqueda de estado
📊 Objeto estado encontrado: { codigo: "CITADO", descripcion: "..." }

// Logs del callback backend
🔍 DEBUG - citaAgendada: { fecha: "2026-02-07T13:15", especialista: 190 }
🔍 DEBUG - datetimeValue: 2026-02-07T13:15
🔍 DEBUG - fecha después split: 2026-02-07
🔍 DEBUG - hora después split: 13:15
🔍 DEBUG - nuevoEstadoCodigo: CITADO

// Logs del fetch
📤 Enviando a nuevo endpoint: { 
  nuevoEstadoCodigo: "CITADO", 
  fechaAtencion: "2026-02-07", 
  horaAtencion: "13:15", 
  idPersonal: 190 
}
```

**Si ves esto:** ✅ Todo bien hasta aquí

---

### Paso 7: Respuesta del Backend

Debes ver:

```javascript
✅ Backend response OK: {
  mensaje: "Estado y cita actualizados exitosamente",
  idSolicitud: 5,
  numeroSolicitud: "BOLSA-...",
  nuevoEstadoCodigo: "CITADO",
  fechaAtencion: "2026-02-07",
  horaAtencion: "13:15",
  idPersonal: 190
}
```

**Si ves "❌ Error response from backend":**
- Verifica que el estado code sea válido
- Verifica que la fecha esté en formato YYYY-MM-DD
- Verifica que la hora esté en formato HH:mm
- Mira el error exacto en la consola

---

### Paso 8: Recarga de Datos

Debes ver:

```javascript
🔄 Recargando datos desde backend...
✅ Datos recargados exitosamente
```

**Esperado:** Los datos se recargan

---

### Paso 9: Tabla se Actualiza

La fila debe mostrar:
- ✅ Especialista con nombre de médico
- ✅ Fecha en formato "07/02/2026 13:15"
- ✅ Estado actualizado (badge de color)

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: El botón "💾 Guardar" está deshabilitado (gris)

**Causas posibles:**

1. **Estado no seleccionado**
   - **Verificación:** Mira el dropdown de estado
   - **Solución:** Selecciona un estado válido

2. **Validación de fecha fallida**
   - **Verificación:** Mira si hay un error rojo "Por favor selecciona la fecha y hora"
   - **Solución:** Llena el campo datetime-local

### Problema 2: No veo los logs en la consola

**Causas posibles:**

1. **Consola no está abierta**
   - **Solución:** Presiona F12 antes de hacer clic en "Editar"

2. **Logs del otro pestaña**
   - **Verificación:** Busca en la consola del navegador, no en otra pestaña
   - **Solución:** Abre las DevTools en la pestaña correcta

### Problema 3: Veo logs hasta "📤 Enviando a nuevo endpoint" pero no "✅ Backend response OK"

**Causas posibles:**

1. **Error en el backend**
   - **Verificación:** Busca "❌ Error response from backend:"
   - **Solución:** Lee el error y valida los datos

2. **Token JWT expirado**
   - **Solución:** Recarga la página y vuelve a loginear

3. **El endpoint no existe**
   - **Verificación:** URL en logs debe ser `http://localhost:8080/api/bolsas/solicitudes/5/estado-y-cita`
   - **Solución:** Verifica que el backend esté compilado y corriendo

### Problema 4: Backend response OK pero los datos no se guardan en BD

**Causas posibles:**

1. **Falta @Transactional en el endpoint**
   - **Verificación:** Abre `SolicitudBolsaController.java` línea ~485
   - **Verificar:** Debe haber `@Transactional` arriba del método
   - **Solución:** Agrégalo si falta

2. **Los valores son NULL en BD**
   - **Verificación:** Ejecuta SQL:
     ```sql
     SELECT id_solicitud, fecha_atencion, hora_atencion, id_personal 
     FROM dim_solicitud_bolsa 
     WHERE id_solicitud = 5;
     ```
   - **Solución:** 
     - Verifica que se envíen desde frontend
     - Verifica que el DTO los reciba
     - Verifica que se asignen a la entidad

---

## 🔧 Fixes Aplicados en v3.5.1

### Fix 1: Pre-seleccionar estado al editar

```javascript
// ANTES (incorrecto)
setNuevoEstadoSeleccionado(
  estadosDisponibles.find(e => e.descripcion === paciente.descEstadoCita)?.codigo || ""
);

// DESPUÉS (correcto)
setNuevoEstadoSeleccionado(paciente.codigoEstado || "");
```

### Fix 2: Cargar especialistas automáticamente

Agregado useEffect que se ejecuta cuando se cargan pacientes:

```javascript
useEffect(() => {
  if (pacientesAsignados.length === 0) return;

  const serviciosConMedicos = new Set();
  
  pacientesAsignados.forEach(paciente => {
    if (paciente.idPersonal && paciente.idServicio) {
      serviciosConMedicos.add(paciente.idServicio);
    }
  });

  serviciosConMedicos.forEach(idServicio => {
    if (!medicosPorServicio[idServicio]) {
      obtenerMedicosPorServicio(idServicio);
    }
  });
}, [pacientesAsignados, medicosPorServicio]);
```

### Fix 3: Pasar código de estado correctamente al backend

```javascript
// ANTES
changeStatus(pacienteEditandoEstado, nuevoEstadoSeleccionado, ...);
// nuevoEstadoSeleccionado = "CITADO" (código)
// Backend recibía código ✅

// DESPUÉS
changeStatus(
  pacienteEditandoEstado,
  estadoObj.descripcion,  // "Citado - Paciente agendado..."
  ...
);
// En callback 2: se extrae el código de la descripción
const estadoObj = estadosDisponibles.find(e => e.descripcion === newStatus);
const nuevoEstadoCodigo = estadoObj?.codigo || newStatus;
```

---

## 📞 Verificación Rápida

**Si todo está funcionando, deberías ver:**

1. ✅ Especialista se carga al abrir (sin hacer clic en Editar)
2. ✅ Estado se pre-selecciona al hacer clic en Editar
3. ✅ Botón Guardar se habilita al llenar todos los campos
4. ✅ Logs de console muestran los valores
5. ✅ Backend responde con 200 OK
6. ✅ Datos se guardan en BD
7. ✅ Tabla se actualiza con los nuevos valores

**Si algo falla:**
1. Abre F12 (DevTools)
2. Busca en la consola los logs rojos (❌)
3. Revisa qué log falta
4. Cruza con la sección "Problemas Comunes" arriba

---

**Fecha:** 2026-02-03  
**Estado:** ✅ Producción
