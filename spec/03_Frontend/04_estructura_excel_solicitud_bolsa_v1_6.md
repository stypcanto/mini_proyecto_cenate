# 📊 Estructura Excel - Carga de Solicitudes de Bolsa v1.6.0

> **Versión:** 1.6.0 | **Fecha:** 2026-01-23 | **Módulo:** Bolsas de Pacientes
> **Integración:** dim_estados_gestion_citas (PENDIENTE_CITA inicial)

---

## 🎯 Resumen Ejecutivo

La carga de solicitudes de bolsa requiere un archivo Excel **mínimo con solo 2 campos obligatorios**:

| # | Campo | Obligatorio | Descripción |
|---|-------|------------|-------------|
| 1 | **DNI** | ✅ SÍ | Documento Nacional de Identidad (8 dígitos) |
| 2 | **Código Adscripción** | ✅ SÍ | Código IPRESS donde está adscrito el paciente |

**Campos opcionales** (el sistema los obtiene automáticamente de `asegurados`):
- Nombre / Nombres
- Apellido Paterno
- Apellido Materno
- Teléfono / Teléfono Celular
- Email / Correo Electrónico

---

## 📋 Estructura Detallada del Excel

### **FILA 1 (Encabezados)**

```
┌─────────────────────────────────────────────────────────────────┐
│ DNI │ Código Adscripción │ Nombre │ Apellido Paterno │ ... más │
└─────────────────────────────────────────────────────────────────┘
```

### **FILA 2+ (Datos de Pacientes)**

```
┌─────────────┬────────────────────┬──────────┬──────────────────┐
│ 12345678    │ 349                │ Juan     │ Pérez            │
│ 87654321    │ 349                │ María    │ López            │
│ 56789012    │ 350                │ Carlos   │ Ruiz             │
│ ...         │ ...                │ ...      │ ...              │
└─────────────┴────────────────────┴──────────┴──────────────────┘
```

---

## 📌 Campos Obligatorios (Mínimo)

### **1️⃣ DNI (Documento Nacional de Identidad)**

| Propiedad | Valor |
|-----------|-------|
| **Nombre en Excel** | `DNI` |
| **Tipo de Dato** | Texto / Número (8 dígitos) |
| **Longitud** | 8 caracteres sin espacios |
| **Validación** | Solo dígitos (0-9) |
| **Obligatorio** | ✅ SÍ |
| **Propósito** | Búsqueda en tabla `asegurados` |
| **Ejemplo** | `12345678` |
| **¿Qué sucede si falta?** | Registro rechazado |
| **¿Qué sucede si es inválido?** | Registro rechazado con error |

### **2️⃣ Código Adscripción**

| Propiedad | Valor |
|-----------|-------|
| **Nombre en Excel** | `Código Adscripción` |
| **Tipo de Dato** | Texto / Número |
| **Longitud** | Variable (típicamente 3-4 dígitos) |
| **Validación** | Debe existir en `dim_ipress` |
| **Obligatorio** | ✅ SÍ |
| **Propósito** | Búsqueda en tabla `dim_ipress` |
| **Ejemplo** | `349` (H.II PUCALLPA), `350`, `351` |
| **¿Qué sucede si falta?** | Registro rechazado |
| **¿Qué sucede si es inválido?** | Registro rechazado con error |

---

## 📌 Campos Opcionales (Auto-Enriquecimiento)

Si estos campos **NO están presentes**, el sistema los obtiene automáticamente de la tabla `asegurados` usando el DNI:

### **Nombre / Nombres**
```
Nombre en Excel: "Nombre" o "Nombres"
Origen: asegurados.paciente
Si falta: Se obtiene automáticamente
```

### **Apellido Paterno**
```
Nombre en Excel: "Apellido Paterno" o "Apellido Pat."
Origen: asegurados (si está disponible)
Si falta: Se obtiene automáticamente
```

### **Apellido Materno**
```
Nombre en Excel: "Apellido Materno" o "Apellido Mat."
Origen: asegurados (si está disponible)
Si falta: Se obtiene automáticamente
```

### **Teléfono**
```
Nombres en Excel: "Teléfono", "Tel.", "Teléfono Celular", "Celular"
Origen: asegurados.tel_celular o asegurados.tel_fijo
Si falta: Se obtiene automáticamente
```

### **Email / Correo**
```
Nombres en Excel: "Email", "Correo", "Correo Electrónico"
Origen: asegurados.correo_electronico
Si falta: Se obtiene automáticamente
```

---

## 📊 Ejemplo Completo: 3 Escenarios

### **Escenario 1: Excel MÍNIMO (Solo 2 campos)**

```excel
┌─────────────┬────────────────────┐
│ DNI         │ Código Adscripción │
├─────────────┼────────────────────┤
│ 12345678    │ 349                │
│ 87654321    │ 349                │
│ 56789012    │ 350                │
└─────────────┴────────────────────┘
```

**Resultado en BD:**
- ✅ Sistema busca DNI en `asegurados`
- ✅ Sistema busca código en `dim_ipress`
- ✅ Sistema obtiene: nombre, apellidos, teléfono, email automáticamente
- ✅ Solicitud creada con estado: **PENDIENTE_CITA**

---

### **Escenario 2: Excel COMPLETO (Todos los campos)**

```excel
┌─────────────┬────────────────────┬──────────┬──────────────────┬──────────────────┬────────────────┬─────────────────────┐
│ DNI         │ Código Adscripción │ Nombre   │ Apellido Paterno │ Apellido Materno │ Teléfono       │ Email               │
├─────────────┼────────────────────┼──────────┼──────────────────┼──────────────────┼────────────────┼─────────────────────┤
│ 12345678    │ 349                │ Juan     │ Pérez            │ García           │ 987654321      │ juan@example.com    │
│ 87654321    │ 349                │ María    │ López            │ Rodríguez        │ 987654322      │ maria@example.com   │
│ 56789012    │ 350                │ Carlos   │ Ruiz             │ Mamani           │ 987654323      │ carlos@example.com  │
└─────────────┴────────────────────┴──────────┴──────────────────┴──────────────────┴────────────────┴─────────────────────┘
```

**Resultado en BD:**
- ✅ Sistema valida todo está completo
- ✅ Sistema verifica no hay duplicados
- ✅ Solicitud creada con estado: **PENDIENTE_CITA**

---

### **Escenario 3: Excel MIXTO (Algunos campos opcionales)**

```excel
┌─────────────┬────────────────────┬──────────┬────────────────┐
│ DNI         │ Código Adscripción │ Nombre   │ Teléfono       │
├─────────────┼────────────────────┼──────────┼────────────────┤
│ 12345678    │ 349                │ Juan     │ 987654321      │
│ 87654321    │ 349                │ María    │ (vacío)        │
│ 56789012    │ 350                │ (vacío)  │ 987654323      │
└─────────────┴────────────────────┴──────────┴────────────────┘
```

**Resultado en BD:**
- ✅ Fila 1: Completa con teléfono proporcionado
- ✅ Fila 2: Teléfono obtenido de `asegurados` (si existe)
- ✅ Fila 3: Nombre obtenido de `asegurados`, teléfono proporcionado
- ✅ Todas creadas con estado: **PENDIENTE_CITA**

---

## 🔍 Proceso de Validación y Procesamiento

```
USUARIO SUBE EXCEL
         ↓
┌─────────────────────────────────────────┐
│ 1. VALIDACIÓN DE FORMATO               │
│    - ¿Es .xlsx, .xls o .csv?           │
│    - ¿Primera fila = encabezados?      │
│    - ¿Máximo 10,000 registros?         │
└─────────────────────────────────────────┘
         ↓ ✅ OK
┌─────────────────────────────────────────┐
│ 2. LECTURA DE DATOS                    │
│    - Parsear cada fila                 │
│    - Extraer: DNI, Código Adscripción  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 3. VALIDACIÓN POR FILA                 │
│    ├─ ¿DNI válido (8 dígitos)?        │
│    ├─ ¿Existe DNI en asegurados?      │
│    ├─ ¿Código adscripción existe?     │
│    ├─ ¿Combinación única?             │
│    └─ ¿Sin duplicados en este archivo?│
└─────────────────────────────────────────┘
         ↓ ✅ OK
┌─────────────────────────────────────────┐
│ 4. AUTO-ENRIQUECIMIENTO                │
│    - Obtener paciente_id de asegurados │
│    - Obtener id_ipress de dim_ipress   │
│    - Obtener nombre, apellidos, etc.   │
│    - Obtener red_asistencial           │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 5. ASIGNACIÓN DE VALORES INICIALES     │
│    - estado_gestion_citas_id = 5       │
│    - cod_estado_cita = "PENDIENTE_CITA"│
│    - desc_estado_cita = "..."          │
│    - solicitante_id = usuario actual   │
│    - fecha_solicitud = NOW()           │
│    - activo = true                     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 6. INSERCIÓN EN BD                     │
│    INSERT INTO dim_solicitud_bolsa     │
│    (26 campos con todos los datos)     │
└─────────────────────────────────────────┘
         ↓ ✅ ÉXITO
┌─────────────────────────────────────────┐
│ RESULTADO AL USUARIO                   │
│ ✅ Registros Exitosos: X               │
│ 📊 Total Procesados: Y                 │
│ ❌ Registros Fallidos: Z               │
└─────────────────────────────────────────┘
```

---

## ⚠️ Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| **DNI no válido** | No es número de 8 dígitos | Verificar formato: 12345678 |
| **DNI no existe** | Paciente no está en `asegurados` | Verificar que el paciente esté registrado |
| **Código adscripción no existe** | IPRESS no está en `dim_ipress` | Solicitar código IPRESS válido |
| **Registro duplicado** | DNI + Tipo Bolsa ya existe | Eliminar fila duplicada del Excel |
| **Excel con formato incorrecto** | Primera fila no es encabezados | Agregar fila con nombres de columnas |
| **Archivo muy grande** | Más de 10,000 registros | Dividir en varios archivos |

---

## 💾 Descarga de Plantilla

**Desde la página de carga, el usuario puede descargar una plantilla Excel preformateada:**

```excel
┌─────────────┬────────────────────┬──────────────────┬──────────────────┬────────────────┐
│ DNI         │ Código Adscripción │ Apellido Paterno │ Apellido Materno │ Nombre         │
├─────────────┼────────────────────┼──────────────────┼──────────────────┼────────────────┤
│ 12345678    │ 349                │ Pérez            │ García           │ Juan           │
│ 87654321    │ 349                │ López            │ Rodríguez        │ María          │
└─────────────┴────────────────────┴──────────────────┴──────────────────┴────────────────┘
```

**Archivo:** `PLANTILLA_SOLICITUD_BOLSA.xlsx`

---

## 📝 Campos en BD Después de la Importación

Después de una carga exitosa, `dim_solicitud_bolsa` contendrá estos valores:

```
IDENTIFICACIÓN:
  • id_solicitud: Auto-generado (BIGSERIAL)
  • numero_solicitud: BOLSA-YYYYMMDD-XXXXX

TIPO BOLSA (del selector en página):
  • id_tipo_bolsa: Seleccionado por usuario
  • cod_tipo_bolsa: Auto-obtenido de dim_tipos_bolsas
  • desc_tipo_bolsa: Auto-obtenido de dim_tipos_bolsas

ESPECIALIDAD (del selector en página - v1.6.0):
  • id_servicio: Seleccionado por usuario (nuevo selector)
  • especialidad: Auto-obtenido de dim_servicio_essi
  • cod_servicio: Auto-obtenido de dim_servicio_essi

PACIENTE (del Excel):
  • paciente_dni: Del Excel
  • paciente_id: Buscado en asegurados.pk_asegurado
  • paciente_nombre: Del Excel o de asegurados

IPRESS (del Excel):
  • codigo_adscripcion: Del Excel
  • id_ipress: Buscado en dim_ipress
  • nombre_ipress: Auto-obtenido de dim_ipress
  • red_asistencial: Auto-obtenido de dim_red (vía dim_ipress)

ESTADO INICIAL (v1.6.0):
  • estado_gestion_citas_id: 5 (PENDIENTE_CITA)
  • cod_estado_cita: "PENDIENTE_CITA"
  • desc_estado_cita: "Pendiente de Cita"

AUDITORÍA:
  • solicitante_id: Usuario logueado
  • solicitante_nombre: Usuario logueado
  • responsable_gestora_id: NULL (Se asigna después)
  • fecha_asignacion: NULL (Se asigna después)
  • recordatorio_enviado: false
  • fecha_solicitud: NOW()
  • fecha_actualizacion: NOW()
  • activo: true
```

---

## ✅ Checklist Pre-Importación

Antes de subir el Excel, verificar:

- [ ] ¿El archivo es .xlsx, .xls o .csv?
- [ ] ¿Primera fila tiene encabezados?
- [ ] ¿Todos los DNI tienen exactamente 8 dígitos?
- [ ] ¿Todos los códigos de adscripción son válidos?
- [ ] ¿Menos de 10,000 registros?
- [ ] ¿No hay filas completamente vacías?
- [ ] ¿Los datos están en columnas correctas?
- [ ] ¿Se descargó y usó la plantilla como guía?

---

## 🎯 Próximos Pasos Después de Importar

Una vez que las solicitudes se cargan exitosamente en estado **PENDIENTE_CITA**:

1. **Coordinador visualiza** en: `http://localhost:3000/bolsas/solicitudes`
2. **Coordinador asigna** a Gestor de Citas
3. **Estado cambia** a: CITADO (cuando se asigna)
4. **Gestora contacta** al paciente
5. **Registro de estado** durante seguimiento

---

**Versión:** 1.6.0 | **Fecha:** 2026-01-23 | **Estado:** ✅ COMPLETO

