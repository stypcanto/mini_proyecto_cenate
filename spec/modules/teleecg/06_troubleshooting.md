# 🔧 Troubleshooting - TeleEKG

**Versión:** v1.51.0
**Última actualización:** 2026-02-06

---

## ❌ Problema: Upload NO redirige a Listar

### Síntomas
- Después de subir imágenes, usuario sigue en `/teleekgs/upload`
- No hay redirección automática

### Causas Posibles
1. `useNavigate` no está importado
2. `navigate()` no se ejecuta
3. Timeout de 2000ms no es suficiente
4. Error en el servicio de upload

### Solución

**Paso 1: Verificar import**
```javascript
// frontend/src/components/teleecgs/UploadImagenECG.jsx
// Línea 2 debe tener:
import { useNavigate } from "react-router-dom";
```

**Paso 2: Verificar hook**
```javascript
// Línea 20 debe tener:
const navigate = useNavigate();
```

**Paso 3: Verificar navigate call**
```javascript
// Línea 236-245 debe tener:
setTimeout(() => {
  resetFormulario();
  if (onSuccess) onSuccess();

  navigate("/teleekgs/listar", {
    state: {
      mensaje: `✅ ${archivos.length} EKGs subidos correctamente`,
      numDoc: numDocPaciente,
    },
  });
}, 2000);
```

**Paso 4: Debugging**
```javascript
// En console.log
console.log("Upload exitoso:", respuesta);
console.log("navigate disponible:", navigate);
console.log("Redirigiendo en 2 segundos...");
```

---

## ❌ Problema: Auto-filtrado NO funciona

### Síntomas
- Tabla en `/teleekgs/listar` muestra todos los pacientes
- DNI NO se filtra automáticamente
- Campo búsqueda no contiene DNI del upload

### Causas Posibles
1. `useLocation` no está importado
2. `location.state` es undefined
3. `setSearchTerm()` no se ejecuta
4. State no se pasa del upload

### Solución

**Paso 1: Verificar import**
```javascript
// frontend/src/pages/roles/externo/teleecgs/RegistroPacientes.jsx
// Línea 1 debe tener:
import { useLocation } from "react-router-dom";
```

**Paso 2: Verificar hook**
```javascript
// Línea 24 debe tener:
const location = useLocation();
```

**Paso 3: Verificar useEffect**
```javascript
// Línea 25-48 debe detectar estado:
useEffect(() => {
  if (location.state?.mensaje) {
    toast.success(location.state.mensaje);
    if (location.state.numDoc) {
      setSearchTerm(location.state.numDoc);
    }
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
```

**Paso 4: Debugging**
```javascript
// En console.log
console.log("location.state:", location.state);
console.log("searchTerm actualizado a:", location.state?.numDoc);
```

---

## ❌ Problema: Breadcrumb NO aparece

### Síntomas
- Breadcrumb no se ve en ninguna vista
- Componente no carga

### Causas Posibles
1. Archivo `TeleEKGBreadcrumb.jsx` no existe
2. Import está en ruta incorrecta
3. Componente no está dentro de JSX
4. Errores en el componente

### Solución

**Paso 1: Verificar archivo existe**
```bash
ls -la frontend/src/components/teleecgs/TeleEKGBreadcrumb.jsx
```

Si no existe, crear el archivo.

**Paso 2: Verificar imports**
```javascript
// En UploadImagenECG.jsx:
import TeleEKGBreadcrumb from "../../../../components/teleecgs/TeleEKGBreadcrumb";

// En RegistroPacientes.jsx:
import TeleEKGBreadcrumb from "../../../../components/teleecgs/TeleEKGBreadcrumb";

// En TeleECGRecibidas.jsx:
import TeleEKGBreadcrumb from "../../components/teleecgs/TeleEKGBreadcrumb";
```

**Paso 3: Verificar en JSX**
```javascript
// Debe estar dentro del return:
<div className="min-h-screen...">
  <div className="w-full">
    {/* Header */}
    <div className="mb-8">...</div>

    {/* ✅ Breadcrumb aquí */}
    <TeleEKGBreadcrumb />

    {/* Contenido */}
    ...
  </div>
</div>
```

**Paso 4: Verificar errors en console**
```
DevTools (F12) → Console → buscar "TeleEKGBreadcrumb"
```

---

## ❌ Problema: Auto-refresh NO sincroniza

### Síntomas
- Nuevas imágenes NO aparecen en CENATE
- Stats NO se actualizan cada 30 segundos
- Requiere refrescar manualmente (F5)

### Causas Posibles
1. `setInterval` no está configurado
2. Intervalo es muy largo (> 60000ms)
3. `cargarEKGs()` falla silenciosamente
4. Componente unmount/remount

### Solución

**Paso 1: Verificar setInterval**
```javascript
// frontend/src/pages/teleecg/TeleECGRecibidas.jsx
// Línea 72-85 debe tener:
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await Promise.all([
        cargarEKGs(),
        cargarEstadisticasGlobales()
      ]);
    } catch (error) {
      console.warn("⚠️ Error en auto-refresh:", error);
    }
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}, []);
```

**Paso 2: Verificar intervalo**
```javascript
// Debe ser 30000ms (30 segundos)
// NO:
}, 300000);  // ❌ 300 segundos (5 minutos)

// SÍ:
}, 30000);   // ✅ 30 segundos
```

**Paso 3: Debugging en console**
```javascript
// Agregar logs:
console.log("✅ Auto-refresh iniciado (cada 30s)");

// En el intervalo:
console.log("🔄 Auto-refresh: recargando datos...");
console.log("Nueva cantidad:", ecgs.length);
```

**Paso 4: Ver en DevTools**
```
DevTools (F12) → Network
Filtrar por: /api/teleekgs
Buscar requests cada 30 segundos
```

---

## ❌ Problema: Estados NO se transforman correctamente

### Síntomas
- IPRESS ve "PENDIENTE" en lugar de "ENVIADA ✈️"
- CENATE ve "ENVIADA" en lugar de "PENDIENTE ⏳"
- Emojis no aparecen

### Causas Posibles
1. Backend no aplica transformación
2. Frontend no usa `estadoTransformado`
3. Rol de usuario no se envía correctamente
4. DTO no incluye estado transformado

### Solución

**Paso 1: Verificar Backend**
```java
// backend/src/main/java/.../TeleECGService.java
// Debe transformar estado al enviar DTO:

private TeleECGImagenDTO toDTO(TeleECGImagen imagen) {
  TeleECGImagenDTO dto = new TeleECGImagenDTO();
  dto.setIdImagen(imagen.getIdImagen());
  dto.setEstado(imagen.getEstado());  // Estado original

  // ✅ Agregar transformado:
  String estadoTransformado = estadoTransformer.transformarEstado(
    imagen.getEstado(),
    esExterno  // Según rol
  );
  dto.setEstadoTransformado(estadoTransformado);

  return dto;
}
```

**Paso 2: Verificar Frontend**
```javascript
// frontend/src/components/...
// Usar estadoTransformado en lugar de estado:

// ❌ INCORRECTO:
<span className={getBadge(ecg.estado)}>
  {ecg.estado}
</span>

// ✅ CORRECTO:
<span className={getBadge(ecg.estadoTransformado || ecg.estado)}>
  {ecg.estadoTransformado || ecg.estado}
</span>
```

**Paso 3: Verificar respuesta API**
```bash
# En DevTools (F12) → Network → buscar /api/teleekgs

Response body debe tener:
{
  "estadoTransformado": "PENDIENTE ⏳",
  "estado": "ENVIADA"
}
```

---

## ❌ Problema: Botón "Ver en CENATE" NO abre nueva pestaña

### Síntomas
- Click en botón no hace nada
- No abre nueva pestaña
- No navega a CENATE

### Causas Posibles
1. Botón no está implementado
2. Evento click no está configurado
3. URL incorrecta
4. window.open está bloqueado

### Solución

**Paso 1: Verificar botón existe**
```javascript
// frontend/src/pages/roles/externo/teleecgs/RegistroPacientes.jsx
// Línea 313-325 debe tener:

<button
  onClick={() => {
    window.open(
      `/teleecg/recibidas?dni=${paciente.numDocPaciente}`,
      "_blank"
    );
  }}
  className="flex items-center justify-center h-11 w-11 hover:bg-purple-100 ..."
>
  <ExternalLink className="w-5 h-5" />
</button>
```

**Paso 2: Verificar ExternalLink import**
```javascript
// Línea 9 debe tener:
import { ..., ExternalLink } from "lucide-react";
```

**Paso 3: Verificar DNI se pasa**
```javascript
// URL debe tener DNI:
/teleecg/recibidas?dni=12345678  // ✅ Correcto

// NO:
/teleecg/recibidas              // ❌ Incorrecto
```

**Paso 4: Habilitar pop-ups**
```
Chrome → Configuración → Privacidad → Pop-ups
Permitir ventanas emergentes para localhost:3000
```

---

## ❌ Problema: Tabla NO se actualiza después de evaluación

### Síntomas
- Click en "Evaluar" → Modal abre → Guardar
- Toast de éxito aparece
- Pero tabla NO actualiza estado
- Debe refrescar manualmente (F5)

### Causas Posibles
1. `cargarEKGs()` no se ejecuta después de evaluar
2. Estado no se actualiza en componente
3. Error en la respuesta del backend
4. Cache no se invalida

### Solución

**Paso 1: Verificar re-fetch después de evaluar**
```javascript
// frontend/src/pages/teleecg/TeleECGRecibidas.jsx
// En handleEvaluar (línea 220-266):

// Después de guardar evaluación:
await teleecgService.evaluarImagen(id, resultado, descripcion);

toast.success(`✅ EKG evaluada como ${resultado}`);

// ✅ CRÍTICO: Recargar datos
await Promise.all([
  cargarEKGs(),
  cargarEstadisticasGlobales()
]);

setShowEvaluacionModal(false);
```

**Paso 2: Verificar cargarEKGs() retorna datos**
```javascript
// Verificar que cargarEKGs actualiza state:
const cargarEKGs = async () => {
  try {
    setLoading(true);
    const response = await teleecgService.agruparPorAsegurado();
    setEcgs(response?.content || []);  // ✅ Actualizar state
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    setLoading(false);
  }
};
```

**Paso 3: Verificar en DevTools**
```
DevTools (F12) → Network → buscar PUT /teleekgs/{id}/evaluar
Status debe ser 200
Response debe tener "success": true
```

---

## ❌ Problema: JWT Token Expirado

### Síntomas
- API retorna 401 Unauthorized
- Usuario debe re-loguear
- Endpoints retornan error

### Solución
1. Ir a `/auth/login`
2. Ingresar credenciales
3. Nuevo token se genera
4. Reintentar operación

---

## ⚠️ Problema: Performance lenta (lag)

### Síntomas
- Tabla se demora en cargar
- Scroll es lento
- UI no responde rápidamente

### Optimizaciones
1. Reducir tamaño de imágenes (comprimir)
2. Aumentar page size (pero menos, ej: 5)
3. Implementar lazy loading
4. Virtualizar tabla (large datasets)

```javascript
// Reducir intervalo de auto-refresh si es muy frecuente
}, 60000);  // 60 segundos en lugar de 30
```

---

## 📊 Checklist de Verificación

- [ ] Upload redirige automáticamente
- [ ] Auto-filtrado por DNI funciona
- [ ] Breadcrumb aparece en las 3 vistas
- [ ] Botón CENATE abre nueva pestaña
- [ ] Auto-refresh sincroniza cada 30s
- [ ] Estados transformados correctamente
- [ ] Evaluación guarda y actualiza tabla
- [ ] No hay errores en console
- [ ] No hay errores de red
- [ ] Performance es aceptable

---

## 📞 Contacto para Soporte

Si el problema persiste:

1. Verificar DevTools (F12)
2. Revisar console para errores
3. Revisar Network para requests
4. Ejecutar `npm run build` para limpiar cache
5. Borrar datos del navegador (localStorage)
6. Reiniciar servidor (`npm start`)

---

**Troubleshooting - TeleEKG Completo** ✅
