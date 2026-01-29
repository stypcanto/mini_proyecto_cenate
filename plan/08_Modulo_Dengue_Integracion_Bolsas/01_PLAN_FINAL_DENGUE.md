# 🦟 PLAN FINAL: Integración Dengue en Módulo Bolsas

**Versión:** 1.0
**Fecha:** 2026-01-29
**Status:** ✅ Aprobado - Listo para Ejecutar
**Solicitante:** Coronado Davila Fernando (Subdirector de Gestión en Telesalud)
**Desarrollador:** Ing. Styp Canto Rondón

---

## 🎯 Visión General

Integrar **6,548 casos de Dengue** en el módulo de Bolsas existente usando:
- **Tabla única:** `dim_solicitud_bolsa` (extender con 4 campos nuevos)
- **Sin duplicación:** Reutilizar 100% de infraestructura existente
- **Inteligencia visual:** Tabla dinámica según tipo de bolsa
- **Datos clínicos:** Guardar todo en backend, mostrar en frontend cuando sea Dengue

---

## 📊 Las 5 Vinculaciones Clave

| # | Campo Excel | Vincula Con | Tabla | Acción | Backend | Frontend |
|---|------------|-------------|-------|--------|---------|----------|
| **1** | `dx_main` | CIE-10 | `dim_cie10` | Validar contra catálogo | ✅ GUARDAR | ✅ SÍ |
| **2** | `cenasicod` | CAS Adscripción | `dim_ipress` | Cargar IPRESS + Red | ✅ GUARDAR | ✅ SÍ |
| **3** | `dni` | Asegurado | `asegurados` | Normalizar + Buscar/Crear | ✅ GUARDAR | ✅ SÍ |
| **4** | `fec_aten` | Fecha Atención | `dim_solicitud_bolsa` | Campo existente | ✅ GUARDAR | ✅ SÍ |
| **5a** | `fec_st` | Fecha Síntomas | `dim_solicitud_bolsa` | Guardar (oculto por ahora) | ✅ GUARDAR | ⏳ Después |
| **5b** | `semana` | Semana Epidem | `dim_solicitud_bolsa` | Guardar (oculto por ahora) | ✅ GUARDAR | ⏳ Después |

---

## 🗄️ Database: 4 Columnas Nuevas

```sql
-- Migration: 2026_01_29_add_dengue_fields.sql
ALTER TABLE dim_solicitud_bolsa ADD COLUMN IF NOT EXISTS (
    cenasicod INTEGER,              -- FK a dim_ipress.codigo_cas
    dx_main VARCHAR(10),            -- CIE-10: A97.0, A97.1, A97.2
    fecha_sintomas DATE,            -- Fecha síntomas (fec_st)
    semana_epidem VARCHAR(20)       -- Semana epidemiológica
);

-- Índices
CREATE UNIQUE INDEX idx_dengue_dedup
ON dim_solicitud_bolsa(paciente_dni, fecha_atencion)
WHERE dx_main IS NOT NULL AND activo = true;

CREATE INDEX idx_dengue_search
ON dim_solicitud_bolsa(dx_main, cenasicod)
WHERE activo = true;
```

---

## 💻 Backend: Archivos a Crear/Modificar

### **1. Entity Update**
- **Archivo:** `SolicitudBolsa.java`
- **Acción:** ADD 4 fields (cenasicod, dx_main, fechaSintomas, semanaEpidem)

### **2. Services (3 archivos)**
- **DengueService.java** - Interface
- **DengueServiceImpl.java** - Lógica de 5 vinculaciones
- **DengueExcelParserService.java** - Parseo Excel con Apache POI

### **3. Controller**
- **DengueController.java** - 3 endpoints:
  - `POST /api/dengue/cargar-excel` - Cargar archivo
  - `GET /api/dengue/casos` - Listar casos Dengue
  - `GET /api/dengue/buscar` - Búsqueda con filtros

### **4. DTOs (2 archivos)**
- **DengueExcelRowDTO.java** - Mapeo de fila Excel
- **DengueImportResultDTO.java** - Resultado de importación

### **5. Repository Update**
- **SolicitudBolsaRepository.java** - ADD 3 métodos query

---

## 🎨 Frontend: Componentes Dinámicos

### **Estructura: `/pages/bolsas/dengue/`**

```
DengueDashboard.jsx (Página principal)
├── DengueUploadForm.jsx (Drag & drop Excel)
├── DengueCasosList.jsx (🆕 INTELIGENCIA DINÁMICA)
│   ├── TablaDengueCompleta.jsx (Cuando filtro = DENGUE)
│   │   └── Muestra: DNI, Nombre, Edad, Sexo, IPRESS, Red, Tel,
│   │            🦟Diagnóstico, 📍CAS, 🗓️Síntomas, 📊Semana Epidem
│   │
│   └── TablaEstandar.jsx (Cuando filtro ≠ DENGUE)
│       └── Muestra: DNI, Nombre, Edad, Sexo, IPRESS, Red, Tel, Estado
│
└── DengueValidationReport.jsx (Reporte post-carga)

Servicios:
├── dengueService.js (API calls)
└── useDengue.js (Custom hook)
```

---

## 🔄 Flujo de Procesamiento: Excel → BD

```
Para cada fila del Excel:

1️⃣ NORMALIZAR DNI
   "370941" → "00370941" (rellenar con ceros a 8 dígitos)

2️⃣ VALIDAR CIE-10 (dx_main)
   GET /api/cie10/codigo?codigo=A97.0
   ✅ Si válido → Continuar
   ❌ Si inválido → RECHAZAR fila

3️⃣ CARGAR IPRESS + RED (por cenasicod)
   SELECT nombre_ipress, red_asistencial FROM dim_ipress
   WHERE codigo_cas = cenasicod
   ✅ Si existe → Usar datos
   ❌ Si no existe → RECHAZAR fila

4️⃣ BUSCAR/CREAR EN ASEGURADOS
   SELECT * FROM asegurados WHERE doc_paciente = '00370941'
   ✅ Si existe → Usar datos (nombre, sexo, edad)
   ❌ Si no existe → CREAR nuevo registro

5️⃣ VERIFICAR DUPLICADO
   SELECT * FROM dim_solicitud_bolsa
   WHERE paciente_dni = '00370941' AND fecha_atencion = '2025-06-16'
   ✅ Si existe → ACTUALIZAR
   ❌ Si no existe → INSERTAR

6️⃣ GUARDAR EN dim_solicitud_bolsa
   INSERT INTO dim_solicitud_bolsa (
     paciente_dni, paciente_nombre, paciente_sexo, paciente_edad,
     paciente_telefono, paciente_telefono_alterno,
     nombre_ipress, red_asistencial,
     id_bolsa=2, cod_tipo_bolsa='BOLSA_DENGUE',
     dx_main, cenasicod, fecha_sintomas, semana_epidem,
     fecha_atencion, estado='PENDIENTE', activo=true
   )

7️⃣ AUDITORÍA
   AuditLogService.registrar(usuario, "DENGUE_IMPORT", detalles)
```

---

## 📋 Clasificación de Casos (Tabla Dengue)

Los casos se colorean automáticamente en frontend:

| CIE-10 | Clasificación | Color | Icono |
|--------|---------------|-------|-------|
| **A97.0** | Dengue sin signos de alarma | 🔵 Azul | Bajo riesgo |
| **A97.1** | Dengue con signos de alarma | 🟠 Naranja | Riesgo moderado |
| **A97.2** | Dengue grave | 🔴 Rojo | Alto riesgo |

---

## ✅ Checklist Pre-Implementación

- [x] Existe tabla `dim_ipress` con columna `codigo_cas`
- [x] Endpoint `/api/cie10/codigo?codigo=A97.0` funciona
- [x] Tabla `asegurados` existe y se puede INSERT
- [x] DNI en Excel solo tiene números
- [x] CIE-10: A97.0, A97.1, A97.2 son los 3 códigos
- [x] Plan aprobado por usuario (29-01-2026)

---

## 🚀 Fases de Ejecución

| Fase | Duración | Tareas | Status |
|------|----------|--------|--------|
| **1. Database** | 1 día | DDL + Índices + Tests | ⏳ PENDING |
| **2. Backend - Setup** | 1 día | Entity + Repository + DTOs | ⏳ PENDING |
| **3. Backend - Services** | 2 días | DengueService + Excel Parser | ⏳ PENDING |
| **4. Backend - API** | 1 día | Controller + Endpoints | ⏳ PENDING |
| **5. Backend - Testing** | 1 día | Unit + Integration tests | ⏳ PENDING |
| **6. Frontend** | 2 días | Componentes + Tabla dinámica | ⏳ PENDING |
| **7. Integration + UAT** | 1 día | E2E + Coronado review | ⏳ PENDING |
| **TOTAL** | **~9 días** | | |

---

## 🎯 Métricas de Éxito

✅ 6,548 registros importados en <10 segundos
✅ DNI normalizados correctamente (8 dígitos)
✅ IPRESS cargadas automáticamente (código 292 → H.I CARLOS ALBERTO...)
✅ CIE-10 validados contra catálogo existente
✅ Duplicados detectados y actualizados
✅ Asegurados nuevos creados si no existen
✅ Tabla Dengue muestra 11 columnas (incluyendo dx_main, CAS, síntomas)
✅ Tabla Estándar muestra 9 columnas (sin campos Dengue)
✅ Auditoría completa de carga
✅ Colores por riesgo funcionan (A97.0/A97.1/A97.2)

---

## 📁 Archivos a Crear (Resumen)

### Backend (9 archivos)
```
backend/src/main/java/com/styp/cenate/
├── model/bolsas/
│   └── SolicitudBolsa.java (UPDATE - ADD 4 fields)
├── service/dengue/
│   ├── DengueService.java (CREATE)
│   └── impl/
│       ├── DengueServiceImpl.java (CREATE)
│       └── DengueExcelParserService.java (CREATE)
├── api/dengue/
│   └── DengueController.java (CREATE)
├── dto/dengue/
│   ├── DengueExcelRowDTO.java (CREATE)
│   └── DengueImportResultDTO.java (CREATE)
└── repository/
    └── SolicitudBolsaRepository.java (UPDATE - ADD 3 methods)
```

### Database (1 archivo)
```
backend/src/main/resources/db/migration/
└── V2026_01_29_000001__add_dengue_fields.sql (CREATE)
```

### Frontend (7 archivos)
```
frontend/src/pages/bolsas/dengue/
├── DengueDashboard.jsx (CREATE)
├── DengueUploadForm.jsx (CREATE)
├── DengueCasosList.jsx (CREATE - INTELIGENCIA DINÁMICA)
├── TablaDengueCompleta.jsx (CREATE)
├── TablaEstandar.jsx (CREATE)
└── DengueValidationReport.jsx (CREATE)

frontend/src/services/
└── dengueService.js (CREATE)

frontend/src/hooks/
└── useDengue.js (CREATE)
```

---

## 🔗 Integraciones Existentes (Reutilizar)

✅ **Endpoint CIE-10:** `/api/cie10/codigo?codigo=A97.0`
✅ **Tabla dim_ipress:** (lookup por codigo_cas)
✅ **Tabla asegurados:** (búsqueda/inserción de pacientes)
✅ **AuditLogService:** (registrar auditoría)
✅ **@PreAuthorize + @CheckMBACPermission:** (seguridad existente)

---

## 📝 Notas Importantes

1. **Sin breaking changes:** Todo se extiende, nada se reemplaza
2. **Reutilizar al máximo:** Todas las integraciones ya existen
3. **Datos clínicos guardados:** Aunque no se muestren en frontend aún
4. **Tabla inteligente:** Frontend cambia vista según tipo de bolsa
5. **Listo para después:** Cuando Coronado pida ver síntomas/semana, solo agregar columnas

---

## 👤 Responsables

- **Planificación:** Styp Canto Rondón
- **Aprobador:** Coronado Davila Fernando
- **Ejecutor:** (Pendiente asignación)

---

**LISTO PARA EJECUTAR ✅**

Próximo paso: Iniciar con Fase 1 (Database)
