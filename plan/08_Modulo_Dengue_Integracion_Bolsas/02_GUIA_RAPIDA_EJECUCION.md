# ⚡ Guía Rápida de Ejecución - Módulo Dengue

**Estado:** ✅ Listo para ejecutar
**Fecha:** 2026-01-29
**Inicio recomendado:** Ya!

---

## 🚀 Comenzar Ahora

### **Paso 1: Revisar Plan**
```bash
cat /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/plan/08_Modulo_Dengue_Integracion_Bolsas/01_PLAN_FINAL_DENGUE.md
```

### **Paso 2: Ver Tareas**
```bash
# Listar todas las tareas del proyecto
# (Tareas #2-#8 en tu sistema de tickets)

# Fases:
# ✅ #2 - Phase 1: Database
# ✅ #3 - Phase 2: Backend - Entity/DTOs
# ✅ #4 - Phase 3: Backend - Services
# ✅ #5 - Phase 4: Backend - Controller
# ✅ #6 - Phase 5: Backend - Testing
# ✅ #7 - Phase 6: Frontend - Components
# ✅ #8 - Phase 7: Integration + UAT
```

---

## 📂 Estructura de Carpetas a Crear

```bash
# Backend
mkdir -p backend/src/main/java/com/styp/cenate/service/dengue/impl
mkdir -p backend/src/main/java/com/styp/cenate/api/dengue
mkdir -p backend/src/main/java/com/styp/cenate/dto/dengue
mkdir -p backend/src/main/resources/db/migration

# Frontend
mkdir -p frontend/src/pages/bolsas/dengue
mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
```

---

## 📋 Archivos a Crear (Quick Reference)

### **Database (1)**
- [ ] `V2026_01_29_000001__add_dengue_fields.sql`

### **Backend Java (9)**
- [ ] `SolicitudBolsa.java` (UPDATE)
- [ ] `DengueService.java`
- [ ] `DengueServiceImpl.java`
- [ ] `DengueExcelParserService.java`
- [ ] `DengueController.java`
- [ ] `DengueExcelRowDTO.java`
- [ ] `DengueImportResultDTO.java`
- [ ] `SolicitudBolsaRepository.java` (UPDATE)
- [ ] Test files (2)

### **Frontend (7)**
- [ ] `DengueDashboard.jsx`
- [ ] `DengueUploadForm.jsx`
- [ ] `DengueCasosList.jsx`
- [ ] `TablaDengueCompleta.jsx`
- [ ] `TablaEstandar.jsx`
- [ ] `DengueValidationReport.jsx`
- [ ] `dengueService.js`
- [ ] `useDengue.js`

**Total:** 18 archivos

---

## 🔑 5 Vinculaciones Clave (Recordatorio)

```
1. dx_main → CIE-10 (Validar contra /api/cie10/codigo)
2. cenasicod → IPRESS (Lookup en dim_ipress, cargar nombre + red)
3. dni → Asegurados (Normalizar, buscar/crear en BD)
4. fec_aten → fecha_atencion (Campo existente)
5. fec_st + semana → Guardar en BD, mostrar después
```

---

## 🎯 Flujo Rápido

```
Excel (6,548 filas)
    ↓
DNI Normalize (370941 → 00370941)
    ↓
CIE-10 Validate (A97.0/A97.1/A97.2)
    ↓
IPRESS Lookup (cenasicod=292 → H.I CARLOS...)
    ↓
Asegurados Lookup (crear si no existe)
    ↓
Dedup Check (DNI + fecha_atencion)
    ↓
INSERT dim_solicitud_bolsa
    ↓
Auditoría + Report
```

---

## 📊 Tabla Dinámica (Frontend Magic)

```javascript
// Pseudo-código del componente

if (filtroTipoBolsa === 'BOLSA_DENGUE') {
  return <TablaDengueCompleta />;  // 11 columnas con colores
} else {
  return <TablaEstandar />;         // 9 columnas estándar
}

// TablaDengueCompleta muestra:
// - dx_main (A97.0 🔵 / A97.1 🟠 / A97.2 🔴)
// - cenasicod
// - fecha_sintomas
// - semana_epidem
```

---

## ⏱️ Timeline

| Fase | Estimado | Acción |
|------|----------|--------|
| Database | 1 día | CREATE migration |
| Backend Setup | 1 día | Entity + DTOs |
| Backend Logic | 2 días | Services + 5 vinculaciones |
| Backend API | 1 día | Controller + endpoints |
| Backend Testing | 1 día | Unit + Integration |
| Frontend | 2 días | React componentes |
| UAT | 1 día | E2E + Coronado |
| **TOTAL** | **~9 días** | |

---

## ✅ Criterios de Éxito

- [x] Plan aprobado (29-01-2026)
- [ ] Database migración ejecutada
- [ ] 6,548 registros importados < 10 seg
- [ ] DNI normalizados (8 dígitos)
- [ ] IPRESS cargadas automáticamente
- [ ] CIE-10 validados
- [ ] Tabla dinámica funciona
- [ ] Colores por riesgo visibles
- [ ] Auditoría registrada
- [ ] Coronado aprueba

---

## 🔗 Enlaces Útiles

- **Plan:** `plan/08_Modulo_Dengue_Integracion_Bolsas/01_PLAN_FINAL_DENGUE.md`
- **Excel:** `/Users/styp/Downloads/Atendidos Dengue CENATE 2026-01-27.xlsx`
- **Endpoint CIE-10:** `GET /api/cie10/codigo?codigo=A97.0`
- **Tabla Asegurados:** `SELECT * FROM asegurados`
- **Tabla IPRESS:** `SELECT * FROM dim_ipress WHERE codigo_cas = 292`

---

## 💡 Tips Importantes

1. **Normalizar DNI:** `String.format("%08d", Long.parseLong(dni))`
2. **Colores Dengue:** A97.0=🔵, A97.1=🟠, A97.2=🔴
3. **Índice Dedup:** `(paciente_dni, fecha_atencion)` único
4. **Guardar TODO:** 4 campos nuevos en backend (mostrar después en frontend)
5. **Reutilizar:** CIE-10, IPRESS, Asegurados existen

---

## 🆘 Si Hay Problemas

```
❌ CIE-10 no valida:
   → Verificar endpoint: /api/cie10/codigo?codigo=A97.0
   → Datos válidos: A97.0, A97.1, A97.2 solo

❌ IPRESS no carga:
   → Verificar tabla: SELECT * FROM dim_ipress WHERE codigo_cas = 292
   → Columna debe existir: codigo_cas

❌ DNI no normaliza:
   → Verificar input: ¿tiene solo números?
   → Formula: rellenar con ceros a 8 dígitos

❌ Duplicados no se detectan:
   → Verificar índice único se creó
   → Condición: WHERE dx_main IS NOT NULL AND activo = true
```

---

**ESTADO: ✅ LISTO PARA EJECUTAR**

Próximo: Crear archivo DB migration (Phase 1)

