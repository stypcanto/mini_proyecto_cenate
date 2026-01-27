# 📋 Módulo de Solicitudes de Bolsa - Documentación v1.12.0

> **Sistema completo de importación, gestión y auto-detección de solicitudes de bolsas de pacientes**
> **Versión:** v1.12.0 | **Status:** ✅ Production Ready
> **Última actualización:** 2026-01-27

---

## 🎯 Documentación Disponible

### ⭐ PRINCIPAL - Solicitudes de Bolsa v1.12.0

**[`12_modulo_solicitudes_bolsa_v1.12.0.md`](./12_modulo_solicitudes_bolsa_v1.12.0.md)** ← **COMIENZA AQUÍ**

Documentación completa y actualizada del módulo:

✨ **Características v1.12.0:**
- Auto-detección inteligente de bolsa y servicio por nombre de archivo
- Soft delete de solicitudes en lote
- Corrección de fechas en Excel (cellDateStr)
- Mensajes de error amigables (sin jerga técnica)
- Validación sin headers
- Logging mejorado para debugging

📚 **Contenido:**
- Visión general y cambios en v1.12.0
- Arquitectura y flujos visuales
- Componentes frontend y backend
- Campos de Excel v1.8.0
- Auto-detección inteligente
- Validación y enriquecimiento
- API endpoints completos
- Errores y manejo
- Ejemplos de uso
- Tablas relacionadas
- Production notes

---

## 📚 Documentación Complementaria

### Catálogo: Tipos de Bolsas v1.1.0

**[`05_modulo_tipos_bolsas_crud.md`](./05_modulo_tipos_bolsas_crud.md)**

CRUD completo del catálogo de tipos de bolsas:
- ✅ Gestión de 7 tipos de bolsas predefinidas
- ✅ Búsqueda avanzada
- ✅ Paginación
- ✅ Modales profesionales
- ✅ Auditoría (timestamps)

**Integración con v1.12.0:**
- Las bolsas creadas aquí se auto-detectan por nombre de archivo
- Ejemplo: "BOLSA OTORRINO..." → busca bolsa que contenga "OTORRINO"

---

### Estados: Gestión de Citas v1.33.0

**[`07_modulo_estados_gestion_citas_crud.md`](./07_modulo_estados_gestion_citas_crud.md)**

CRUD de estados para seguimiento de citas:
- ✅ 10 estados predefinidos (CITADO, ATENDIDO, NO_CONTESTA, etc.)
- ✅ Gestión centralizada
- ✅ Reutilizable en otros módulos
- ✅ Patrón arquitectónico idéntico a Tipos de Bolsas

**Integración con v1.12.0:**
- Al importar solicitudes, se asigna estado inicial: PENDIENTE_CITA (id=5)
- Campo `estado_gestion_citas_id` en cada solicitud

---

## 🌊 Flujo del Sistema Completo

```
1️⃣ IMPORTACIÓN (v1.12.0)
   - Usuario carga archivo Excel
   - Sistema auto-detecta bolsa + servicio
   - Excel validado y procesado
   ↓
2️⃣ ALMACENAMIENTO
   - 39 solicitudes importadas
   - Datos enriquecidos desde dim_asegurados
   - Datos enriquecidos desde dim_ipress y dim_red
   ↓
3️⃣ GESTIÓN DE SOLICITUDES
   - Coordinador visualiza todas las solicitudes
   - Puede borrar seleccionadas o todas
   - Soft delete con auditoría completa
   ↓
4️⃣ CAMBIO DE ESTADO (v1.33.0)
   - Cada solicitud tiene estado de gestión
   - 10 estados posibles
   - Tracking de citas
```

---

## 📊 Estructura de Datos

### Tabla Central: `dim_solicitud_bolsa`

| Campo | Descripción |
|-------|-------------|
| **Identificación** | id_solicitud, numero_solicitud |
| **Paciente** | paciente_dni, paciente_nombre, paciente_id |
| **Excel v1.8.0** | fecha_preferida, tipo_doc, sexo, fecha_nac, teléfono, correo, cod_ipress, tipo_cita |
| **Enriquecimiento** | especialidad, desc_ipress, desc_red |
| **Auditoría** | fecha_solicitud, fecha_actualizacion, activo (soft delete) |
| **Estado** | estado_gestion_citas_id (referencia a dim_estados_gestion_citas) |
| **Bolsa** | id_bolsa (referencia a dim_tipos_bolsas) |

### Tablas de Referencia

| Tabla | Propósito | Versión |
|-------|----------|---------|
| **dim_tipos_bolsas** | Catálogo de tipos de bolsa (BOLSA_107, BOLSA_DENGUE, etc.) | v1.1.0 |
| **dim_estados_gestion_citas** | 10 estados de citas | v1.33.0 |
| **dim_asegurados** | Enriquecimiento de sexo, fecha nac, correo | v1.0.0 |
| **dim_ipress** | Enriquecimiento IPRESS + RED | v1.0.0 |
| **dim_red** | Redes asistenciales | v1.0.0 |
| **dim_historial_importacion_bolsa** | Histórico de importaciones desde Excel | v1.0.0 |

### ⚠️ Tablas Eliminadas en v1.12.0

| Tabla | Razón | Migración |
|-------|-------|-----------|
| **dim_bolsa** ❌ | Tabla intermedia no utilizada - Arquitectura simplificada | V3_0_6 |

**Nota:** `dim_bolsa` fue diseñada en v1.0.0 como tabla intermedia entre `dim_tipos_bolsas` y `dim_solicitud_bolsa`, pero nunca se implementó en código. La arquitectura actual usa `dim_tipos_bolsas` → `dim_solicitud_bolsa` directamente. Tabla eliminada por: Limpieza de arquitectura (v1.12.0).

---

## 🔗 Integración Arquitectónica

### v1.12.0 - Solicitudes de Bolsa

```
Frontend (React)
├── CargarDesdeExcel.jsx v1.12.0
│   ├── Auto-detección (extraerTipoBolsaDelNombre)
│   ├── Validación sin headers (validarEstructuraExcel)
│   └── Enriquecimiento preview
│
├── Solicitudes.jsx v2.3.0
│   ├── Listado con filtros
│   ├── Soft delete selectivo
│   └── Borrar TODAS
│
└── bolsasService.js v1.0.1
    ├── importarSolicitudesDesdeExcel()
    └── eliminarMultiplesSolicitudes()

Backend (Spring Boot)
├── SolicitudBolsaController v1.8.0
│   ├── POST /importar
│   ├── GET / (listar)
│   ├── GET /{id}
│   ├── POST /borrar (nuevo)
│   └── PATCH /{id}/estado
│
├── ExcelImportService v1.9.1
│   ├── leerExcelYProcesarDirecto()
│   └── cellDateStr() para fechas
│
├── SolicitudBolsaServiceImpl v1.8.0
│   ├── importarDesdeExcel()
│   └── eliminarMultiples()
│
└── SolicitudBolsaRepository
    └── findAllWithBolsaDescription()

Database (PostgreSQL)
└── dim_solicitud_bolsa
    ├── dim_tipos_bolsas (FK)
    ├── dim_asegurados (FK)
    ├── dim_ipress (FK)
    └── dim_red (FK)
```

---

## 🚀 Guía de Implementación

### 1. Setup Inicial

```bash
# Backend
cd backend && ./gradlew clean bootRun

# Frontend
cd frontend && npm start
```

### 2. Crear Tipos de Bolsas

→ Usar módulo **05_modulo_tipos_bolsas_crud.md**
- Admin crea tipos: OTORRINO, CARDIOLOGIA, etc.

### 3. Importar Solicitudes

→ Usar módulo **12_modulo_solicitudes_bolsa_v1.12.0.md**
- Archivo: `BOLSA OTORRINO EXPLOTADOS 26012026.xlsx`
- Sistema auto-detecta bolsa y servicio
- 39 solicitudes importadas correctamente

### 4. Gestionar Estados

→ Usar módulo **07_modulo_estados_gestion_citas_crud.md**
- Cambiar estado de solicitudes
- Usar uno de 10 estados disponibles
- Auditoría automática

---

## 📋 Cambios en v1.12.0

### ✨ Nuevas Características

| Área | Cambio | Beneficio |
|------|--------|----------|
| **Auto-Detección** | Palabras clave del nombre archivo | Bolsa + servicio automáticos |
| **Soft Delete** | Borrado en lote | Eficiencia + auditoría |
| **Fechas** | cellDateStr en lugar de cellStr | Fechas correctas en BD |
| **Mensajes** | Amigables al usuario | Menos confusión |
| **Validación** | Sin headers requeridos | Excel más flexible |

### 🐛 Bugs Corregidos

| Bug | Solución | Versión |
|-----|----------|---------|
| FECHA PREFERIDA = "N/A" | cellDateStr() | v1.9.1 |
| idBolsa no llega al backend | Rename FormData parameter | v1.7.0 |
| Errores 500 en borrado | Mejor conversión de tipos | v1.8.0 |
| Auto-selección falla | Esperar catálogos + múltiples palabras | v1.12.0 |

---

## 📁 Estructura de Carpetas

```
spec/backend/09_modules_bolsas/
├── 12_modulo_solicitudes_bolsa_v1.12.0.md    ⭐ PRINCIPAL (v1.12.0)
├── 05_modulo_tipos_bolsas_crud.md            📚 Tipos de bolsas (v1.1.0)
├── 07_modulo_estados_gestion_citas_crud.md   📚 Estados citas (v1.33.0)
└── README.md                                  📄 Este archivo (v1.12.0)
```

**Archivos eliminados (v1.12.0):**
- ❌ `04_auto_normalizacion_excel_107.md` (Form 107, no relevante)
- ❌ `06_resumen_modulo_bolsas_completo.md` (redundante)
- ❌ `08_modulo_bolsas_pacientes_completo.md` (v1.6.0 obsoleto)
- ❌ `09_modulo_solicitudes_bolsa_import_v1.9.0.md` (reemplazado por v1.12.0)
- ❌ `10_quick_reference_solicitudes_bolsa.md` (contenido en v1.12.0)
- ❌ `11_cambios_tecnicos_v1.9.0.md` (obsoleto)

---

## 🔍 Búsqueda Rápida

**¿Cómo importar una bolsa?**
→ `12_modulo_solicitudes_bolsa_v1.12.0.md` → "Ejemplos de Uso"

**¿Cómo crear un tipo de bolsa?**
→ `05_modulo_tipos_bolsas_crud.md` → "Crear Nuevo Tipo"

**¿Cómo cambiar el estado de una solicitud?**
→ `07_modulo_estados_gestion_citas_crud.md` → "Estados Disponibles"

**¿Cómo funciona la auto-detección?**
→ `12_modulo_solicitudes_bolsa_v1.12.0.md` → "Auto-Detección Inteligente"

**¿Qué hacer si hay errores?**
→ `12_modulo_solicitudes_bolsa_v1.12.0.md` → "Errores y Manejo"

---

## 📞 Contacto

**Desarrollador:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Última actualización:** 2026-01-27
**Versión Sistema:** v1.35.1

---

## ✅ Estado General

| Componente | Versión | Status |
|-----------|---------|--------|
| Solicitudes de Bolsa | v1.12.0 | ✅ Production Ready |
| Tipos de Bolsas | v1.1.0 | ✅ Production Ready |
| Estados Gestión Citas | v1.33.0 | ✅ Production Ready |
| **Documentación** | **v1.12.0** | **✅ Actualizada** |

**Todos los módulos listos para producción.** 🚀
