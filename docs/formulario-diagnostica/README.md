# 📋 Formulario de Diagnóstico Situacional de Telesalud

## 📍 Información General

**Ubicación:**
- **Ruta URL:** `/roles/externo/formulario-diagnostico`
- **Componente:** `frontend/src/pages/roles/externo/FormularioDiagnostico.jsx`
- **Configuración:** `frontend/src/config/componentRegistry.js#L225`

**Estructura del Formulario:**
El formulario está organizado en **8 pestañas** principales:

1. **Datos Generales** (`datos-generales`) - 📄 FileText
2. **Recursos Humanos** (`recursos-humanos`) - 👥 Users  
3. **Infraestructura** (`infraestructura`) - 🏢 Building2
4. **Equipamiento** (`equipamiento`) - 💻 Monitor
5. **Conectividad** (`conectividad`) - 📶 Wifi
6. **Servicios** (`servicios`) - 🩺 Stethoscope
7. **Necesidades** (`necesidades`) - ❓ FileQuestion
8. **Vista Previa** (`vista-previa`) - 👁️ Eye (solo lectura)

**Características principales:**
- ✅ Formulario progresivo con validaciones
- 💾 Guardado automático de progreso
- 📑 Generación de PDF
- ✍️ Integración con firma digital
- 📤 Envío y gestión de estados (BORRADOR → ENVIADO → FIRMADO)
- 🔒 Control de permisos MBAC (requiere acción "ver")

**Estados del formulario:**
- `BORRADOR` - En edición
- `ENVIADO` - Enviado sin firma
- `FIRMADO` - Firmado digitalmente

---

## 📊 TABLAS DE LA BASE DE DATOS

### **Tablas Principales:**
1. **`form_diag_formulario`** - Tabla principal del formulario
2. **`form_diag_datos_generales`** - Datos generales de la IPRESS
3. **`form_diag_recursos_humanos`** - Información de recursos humanos
4. **`form_diag_rh_apoyo`** - Personal de apoyo adicional
5. **`form_diag_infra_fis`** - Infraestructura física
6. **`form_diag_infra_tec`** - Infraestructura tecnológica
7. **`form_diag_conectividad_sist`** - Conectividad y sistemas
8. **`form_diag_equipamiento`** - Equipamiento médico/informático
9. **`form_diag_servicio`** - Servicios de telesalud
10. **`form_diag_necesidad`** - Necesidades identificadas
11. **`form_diag_nec_capacitacion`** - Necesidades de capacitación

### **Tablas de Catálogos:**
12. **`form_diag_cat_categoria_profesional`** - Categorías profesionales
13. **`form_diag_cat_estado_equipo`** - Estados del equipamiento
14. **`form_diag_cat_equipamiento`** - Catálogo de equipamiento
15. **`form_diag_cat_necesidad`** - Catálogo de necesidades
16. **`form_diag_cat_prioridad`** - Catálogo de prioridades
17. **`form_diag_cat_servicio_telesalud`** - Servicios de telesalud

### **Tablas de Firma Digital:**
18. **`dim_firma_digital`** - Firma digital del personal
19. **`firmadigitalpersonal`** - Relación personal-firma digital

### **Tablas Relacionadas:**
20. **`ipress`** - Información de instituciones prestadoras
21. **`usuarios`** - Datos del usuario

---

## 🔗 ENDPOINTS DE LA API

### **Gestión Principal:**
- **GET** `/api/usuarios/detalle/{username}` - Obtener datos del usuario
- **POST** `/api/formulario-diagnostico/borrador` - Guardar borrador
- **POST** `/api/formulario-diagnostico` - Crear formulario nuevo
- **PUT** `/api/formulario-diagnostico/{id}` - Actualizar formulario
- **POST** `/api/formulario-diagnostico/{id}/enviar` - Enviar formulario
- **DELETE** `/api/formulario-diagnostico/{id}` - Eliminar formulario

### **Consultas:**
- **GET** `/api/formulario-diagnostico/{id}` - Obtener por ID
- **GET** `/api/formulario-diagnostico/borrador/ipress/{idIpress}` - Borrador por IPRESS
- **GET** `/api/formulario-diagnostico/ultimo/ipress/{idIpress}` - Último por IPRESS
- **GET** `/api/formulario-diagnostico` - Listar todos
- **GET** `/api/formulario-diagnostico/ipress/{idIpress}` - Listar por IPRESS
- **GET** `/api/formulario-diagnostico/red/{idRed}` - Listar por Red
- **GET** `/api/formulario-diagnostico/estado/{estado}` - Listar por estado
- **GET** `/api/formulario-diagnostico/anio/{anio}` - Listar por año
- **GET** `/api/formulario-diagnostico/existe-en-proceso/ipress/{idIpress}` - Verificar proceso

### **Firma Digital:**
- **POST** `/api/formulario-diagnostico/{id}/firmar` - Firmar formulario
- **GET** `/api/formulario-diagnostico/{id}/verificar-firma` - Verificar firma
- **GET** `/api/formulario-diagnostico/{id}/pdf` - Descargar PDF firmado
- **GET** `/api/formulario-diagnostico/{id}/esta-firmado` - Verificar si está firmado
- **POST** `/api/formulario-diagnostico/descargar-zip` - Descargar múltiples PDFs

### **Catálogos:**
- **GET** `/api/formulario-diagnostico/catalogos/necesidades` - Catálogo de necesidades
- **GET** `/api/formulario-diagnostico/catalogos/necesidades/categoria/{categoria}` - Por categoría
- **GET** `/api/formulario-diagnostico/catalogos/prioridades` - Catálogo de prioridades

---

## 📁 Archivos Principales

### **Frontend:**
- **Componente principal:** `frontend/src/pages/roles/externo/FormularioDiagnostico.jsx` (5,022 líneas)
- **Servicio:** `frontend/src/services/formularioDiagnosticoService.js` (1,026 líneas)
- **Servicio de firma:** `frontend/src/services/firmaDigitalService.js` (437 líneas)
- **Modal de firma:** `frontend/src/components/modals/FirmaDigitalModal.jsx`

### **Backend:**
- **Controlador:** `backend/src/main/java/com/styp/cenate/api/formdiag/FormDiagController.java`
- **Servicio:** `backend/src/main/java/com/styp/cenate/service/formdiag/FormDiagService.java`
- **Servicio de firma:** `backend/src/main/java/com/styp/cenate/service/formdiag/FirmaDigitalService.java`
- **Entidades:** `backend/src/main/java/com/styp/cenate/model/formdiag/` (17 archivos)

---

## 📊 Resumen Estadístico

- **Total de tablas:** 21
- **Total de endpoints:** 23
- **Líneas de código (frontend):** ~6,485
- **Pestañas del formulario:** 8
- **Entidades JPA:** 17
- **Estados del formulario:** 3 (BORRADOR, ENVIADO, FIRMADO)

---

**Fecha de documentación:** Febrero 5, 2026
**Sistema:** CENATE - Centro Nacional de Telemedicina