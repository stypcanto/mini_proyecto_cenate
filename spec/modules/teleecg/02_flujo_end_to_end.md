# 🔄 Flujo End-to-End TeleEKG v1.51.0

**Versión:** v1.51.0 (2026-02-06)
**Estado:** ✅ Completo
**Documentación:** Flujo Upload → Listar → Recibidas con sincronización

---

## 📊 Resumen del Flujo

```
IPRESS Upload EKG              → IPRESS Ve Cargas           → CENATE Ve Consolidado
/teleekgs/upload              /teleekgs/listar             /teleecg/recibidas
(4-10 imágenes + DNI)         (Filtrado por DNI)           (Auto-refresh 30s)
      ↓                              ↓                            ↓
Redirige automático (2s)    Toast + Botón CENATE     Estados transformados
      │                            │                          │
      └────────────────────────────┴──────────────────────────┘
               Breadcrumb Navigation (3 pasos visuales)
```

---

## 🎯 ETAPA 1: IPRESS Sube EKG

### Ruta: `/teleekgs/upload`
**Componente:** `UploadImagenECG.jsx`

#### Entrada del Usuario
```
1. Ir a /teleekgs/upload
2. Seleccionar 4-10 imágenes ECG
   ├─ JPEG o PNG
   ├─ Máximo 5MB cada una
   └─ Se muestran previews
3. Ingresar DNI del paciente
4. Click "Cargar EKGs"
```

#### Procesamiento
```javascript
// UploadImagenECG.jsx (línea 230-245)
const respuesta = await teleekgService.subirMultiplesImagenes(formData);

setRespuestaServidor(respuesta);
setEnviado(true);
toast.success(`✅ ${archivos.length} EKGs cargados exitosamente`);

setTimeout(() => {
  resetFormulario();
  if (onSuccess) onSuccess();

  // ✅ NUEVO: Redirigir a listar con information
  navigate("/teleekgs/listar", {
    state: {
      mensaje: `✅ ${archivos.length} EKGs subidos correctamente`,
      numDoc: numDocPaciente,
    },
  });
}, 2000);
```

#### Backend Processing
```
POST /api/teleekgs/upload-multiple
├─ Request: FormData
│  ├─ archivos: File[]
│  ├─ numDocPaciente: "12345678"
│  └─ nombresPaciente: "Juan"
│
├─ TeleECGController.subirMultiples()
│  └─ Valida JWT + MBAC
│
├─ TeleECGService.guardarImagenes()
│  ├─ Comprime imágenes
│  ├─ Convierte a base64
│  └─ Inserta en BD (estado: ENVIADA)
│
└─ Response: { success: true, data: [...] }
```

#### Resultados
```
✅ Toast: "✅ 6 EKGs cargados exitosamente"
✅ Redirección automática a /teleekgs/listar (2 segundos)
✅ Estado BD: ENVIADA
✅ Estado IPRESS: ENVIADA ✈️
✅ Estado CENATE: PENDIENTE ⏳
```

---

## 🎯 ETAPA 2: IPRESS Ve Sus Cargas

### Ruta: `/teleekgs/listar`
**Componente:** `RegistroPacientes.jsx`

#### Detección de Redirección
```javascript
// RegistroPacientes.jsx (línea 40-48)
const location = useLocation();

useEffect(() => {
  if (location.state?.mensaje) {
    // Viene del upload
    toast.success(location.state.mensaje);  // Toast: "✅ 6 EKGs subidos..."

    // Auto-filtrar por DNI
    if (location.state.numDoc) {
      setSearchTerm(location.state.numDoc);  // "12345678"
    }

    // Limpiar state
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
```

#### Tabla con Auto-Filtrado
```
Columnas:
├─ Fecha
├─ DNI              (filtrado: 12345678 ✅)
├─ Paciente         (filtrado: Juan Pérez ✅)
├─ Estado           (ENVIADA ✈️)
├─ Evaluación       (—)
├─ Archivo
└─ Acciones
   ├─ 👁️ Ver         (preview)
   ├─ 📥 Descargar   (download)
   └─ 🔗 Ver CENATE  (nueva pestaña)
```

#### Breadcrumb Navigation
```
┌───────────────────────────────────┐
│ 📤 Cargar EKG → 📋 Mis EKGs → 📊 CENATE │
│           ■■■■■■ 66% completado        │
└───────────────────────────────────┘
```

#### Resultados
```
✅ Toast: "✅ 6 EKGs subidos correctamente"
✅ Tabla filtrada solo por DNI 12345678
✅ 6 imágenes visibles
✅ Breadcrumb: paso 2 (azul)
✅ Botón "Ver en CENATE" disponible
```

---

## 🎯 ETAPA 3: CENATE Ve Todas las Cargas

### Ruta: `/teleecg/recibidas`
**Componente:** `TeleECGRecibidas.jsx`

#### Carga Inicial
```javascript
// TeleECGRecibidas.jsx (línea 67-87)
useEffect(() => {
  cargarEKGs();
  cargarEstadisticasGlobales();
}, []);

// Auto-refresh cada 30 segundos
useEffect(() => {
  const interval = setInterval(async () => {
    await Promise.all([
      cargarEKGs(),
      cargarEstadisticasGlobales()
    ]);
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

#### Transformación de Estados
```javascript
// Backend: TeleECGEstadoTransformer.java
ENVIADA (BD)    → PENDIENTE ⏳ (CENATE)
OBSERVADA (BD)  → OBSERVADA 👁️ (CENATE)
ATENDIDA (BD)   → ATENDIDA ✅ (CENATE)

// Frontend: ModalEvaluacionECG.jsx
Datos se transforman automáticamente según rol
```

#### Vista Consolidada
```
Estadísticas (Cards):
├─ Total EKGs        : 10
├─ Pendientes        : 7
├─ Observadas        : 0
└─ Atendidas         : 3

Tabla de Imágenes:
├─ Paciente
├─ DNI
├─ Estado            (PENDIENTE ⏳)
├─ Evaluación        (—)
├─ Acciones
│  ├─ 👁️ Ver
│  ├─ 📥 Descargar
│  └─ ✅ Evaluar (NORMAL/ANORMAL)
└─ Filtros
   ├─ IPRESS
   ├─ Estado
   ├─ Fecha
   └─ Búsqueda
```

#### Breadcrumb Navigation
```
┌───────────────────────────────────┐
│ 📤 Cargar EKG → 📋 Mis EKGs → 📊 CENATE │
│           ■■■■■■■■■ 100% completo       │
└───────────────────────────────────┘
```

#### Resultados
```
✅ Mismas 6 imágenes visibles
✅ Estados transformados: ENVIADA → PENDIENTE
✅ Estadísticas actualizadas
✅ Breadcrumb: paso 3 (azul)
✅ Auto-refresh cada 30 segundos (silencioso)
```

---

## 🎯 ETAPA 4: CENATE Evalúa Imágenes

### Modal: `ModalEvaluacionECG.jsx`

#### Flujo de Evaluación
```
1. Click en botón "Evaluar" (primera imagen)
   └─ Modal abre con preview

2. Seleccionar: NORMAL o ANORMAL
   └─ Campo requerido

3. Ingreso descripción (opcional)
   └─ Notas del evaluador

4. Click "Guardar"
   └─ Backend actualiza imagen
   └─ Estado: ENVIADA → ATENDIDA
   └─ Toast de confirmación

5. Tabla se actualiza automáticamente
   └─ Estadísticas recalculadas
```

#### Backend Processing
```
PUT /api/teleekgs/{id}/evaluar
├─ Request Body:
│  ├─ resultado: "NORMAL" | "ANORMAL"
│  └─ descripcion: "Sin observaciones"
│
├─ TeleECGController.evaluarImagen()
│
├─ TeleECGService.evaluarImagen()
│  ├─ Actualiza estado: ATENDIDA
│  ├─ Crea registro de evaluación
│  └─ Registra auditoría
│
└─ Response: { success: true }
```

#### Resultados
```
✅ Estado cambia: PENDIENTE → ATENDIDA ✅
✅ Toast: "✅ EKG evaluada como NORMAL"
✅ Cards actualizan: Pendientes -1, Atendidas +1
✅ Tabla se actualiza sin refrescar
```

---

## 🔄 Ciclo Completo (Flujo Total)

```
TIME: 0s
└─ IPRESS: Upload
   ├─ Selecciona 5 imágenes
   ├─ DNI: 11111111
   └─ Click "Cargar EKGs"

TIME: 2s
└─ Sistema redirige automáticamente

TIME: 3-5s
└─ IPRESS: Listar
   ├─ Toast: "✅ 5 EKGs subidos"
   ├─ Tabla filtrada por DNI
   ├─ 5 imágenes visibles
   └─ Click "Ver en CENATE"

TIME: 5s (nueva pestaña)
└─ CENATE: Recibidas
   ├─ Mismas 5 imágenes visibles
   ├─ Estados: PENDIENTE ⏳
   └─ Click "Evaluar" (primera)

TIME: 6-8s
└─ CENATE: Evaluación
   ├─ Modal abre
   ├─ Selecciona NORMAL
   ├─ Click "Guardar"
   └─ Toast: "✅ EKG evaluada como NORMAL"

TIME: 8-9s
└─ CENATE: Actualización
   ├─ Estado: PENDIENTE → ATENDIDA ✅
   ├─ Cards: Pendientes -1, Atendidas +1
   ├─ Tabla actualizada
   └─ 30 segundos después (auto-refresh)

TIME: 39s
└─ Auto-refresh silencioso
   ├─ Datos recargados
   ├─ Cambios persistidos
   └─ Sincronización confirmada

FIN: Flujo completado exitosamente ✅
```

---

## 📊 Sincronización Multi-Usuario

### Escenario: 2 Navegadores Abiertos

```
Navegador 1 (CENATE - Recibidas)     Navegador 2 (IPRESS - Upload)
├─ Abierto en /teleecg/recibidas     ├─ Abierto en /teleekgs/upload
├─ Total: 10 imágenes                └─ Sube 3 nuevas imágenes
│
TIME: 0s
└─ Sin refrescar manual

TIME: 30s (auto-refresh)
├─ Recarga datos silenciosamente
├─ Total: 10 → 13 imágenes ✅
├─ Nueva fila: DNI con 3 imágenes
└─ Estadísticas actualizadas
```

---

## 🎨 Componentes Visuales

### Breadcrumb Estados

```
PASO 1: Upload
├─ Color: 🔵 Azul (actual)
├─ Ícono: 📤
└─ Estado: Usuario aquí

PASO 2: Listar
├─ Color: 🟢 Verde (completado)
├─ Ícono: 📋
└─ Estado: Visitó

PASO 3: Recibidas
├─ Color: ⚪ Gris (pendiente)
├─ Ícono: 📊
└─ Estado: Próximo

---

PASO 1: Upload
├─ Color: 🟢 Verde (completado)
├─ Ícono: 📤
└─ Estado: Pasó

PASO 2: Listar
├─ Color: 🔵 Azul (actual)
├─ Ícono: 📋
└─ Estado: Usuario aquí

PASO 3: Recibidas
├─ Color: ⚪ Gris (pendiente)
├─ Ícono: 📊
└─ Estado: Próximo
```

### Progress Bar

```
PASO 1:     PASO 2:     PASO 3:
■□□         ■■□         ■■■
33%         66%         100%
```

---

## 🔐 Flujo de Seguridad

```
IPRESS User
├─ JWT Token
├─ MBAC Role: EXTERNO
└─ Permisos:
   ├─ POST   /api/teleekgs/upload-multiple      ✅
   ├─ GET    /api/teleekgs/listar               ✅
   └─ PUT    /api/teleekgs/{id}/evaluar         ❌

CENATE User
├─ JWT Token
├─ MBAC Role: ADMIN, COORDINADOR_RED
└─ Permisos:
   ├─ POST   /api/teleekgs/upload-multiple      ❌
   ├─ GET    /api/teleekgs/agrupar-por-asegurado ✅
   └─ PUT    /api/teleekgs/{id}/evaluar         ✅
```

---

## ⏱️ Tiempos y Performance

| Operación | Tiempo Esperado | Notas |
|-----------|-----------------|-------|
| Upload (4-10 imágenes) | 3-5s | Depende tamaño |
| Redirección automática | 2s | Configurable |
| Carga tabla Listar | <1s | Índices optimizados |
| Carga consolidado CENATE | <2s | Con paginación |
| Auto-refresh CENATE | <1s | Silencioso, cada 30s |
| Evaluación guardar | <1s | Actualización tabla |

---

## 🚀 Próximos Pasos (Opcionales)

### Mejora 1: WebSocket (Tiempo Real Puro)
```javascript
// Reemplazar auto-refresh (30s) por WebSocket
// Sincronización instantánea
// Notificaciones en tiempo real
```

### Mejora 2: Filtro DNI en URL
```
/teleecg/recibidas?dni=12345678
├─ Auto-aplica filtro
├─ Mejor integración con botón "Ver en CENATE"
└─ Shareability mejorada
```

### Mejora 3: Notificaciones Push
```
- Notificar a CENATE cuando IPRESS sube
- Notificar a IPRESS cuando CENATE evalúa
- Sistema de alertas inteligentes
```

---

**Flujo End-to-End Completo y Documentado** ✅
Última actualización: 2026-02-06
