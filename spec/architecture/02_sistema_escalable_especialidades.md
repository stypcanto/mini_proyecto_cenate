# 🏗️ Sistema Escalable de Especialidades (v1.78.0+)

## Visión General

Este documento describe la **arquitectura escalable** para agregar funcionalidades específicas por especialidad médica. El patrón permite reutilizar el código para **Cardiología, Dermatología, Neurología, Oncología, etc.**

---

## 🎯 Patrón de Diseño: Specialty-Driven Features

### Concepto

```
┌─────────────────────────────────────────────────────────┐
│  Doctor se loguea                                       │
│  ↓                                                      │
│  Detectar especialidad (desde API /medico/info)        │
│  ↓                                                      │
│  Cargar configuración de SPECIALTY_FEATURES             │
│  ↓                                                      │
│  Mostrar columnas/botones SOLO para esa especialidad   │
│  ↓                                                      │
│  Cada fila se colorea según urgencia/estado            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes del Sistema

### 1️⃣ Backend - Endpoint `/medico/info`

```java
// Retorna:
{
  "nombre": "Dr. Juan García",
  "especialidad": "Cardiología"  // ← Clave para activar features
}
```

**Ubicación:** `GestionPacienteServiceImpl.obtenerInfoMedicoActual()`

---

### 2️⃣ Frontend - SPECIALTY_FEATURES Map

```javascript
const SPECIALTY_FEATURES = {
  CARDIOLOGIA: {
    keywords: ['cardio', 'corazón'],
    features: ['EKG_COLUMNS', 'EKG_ACTION'],
    name: 'Cardiología'
  },
  DERMATOLOGIA: {
    keywords: ['dermato', 'piel'],
    features: ['SKIN_IMAGES', 'LESION_CLASSIFICATION'],
    name: 'Dermatología'
  },
  NEUROLOGIA: {
    keywords: ['neurolog', 'cerebro', 'neuro'],
    features: ['NEURO_TESTS', 'MRI_VIEWER'],
    name: 'Neurología'
  },
  ONCOLOGIA: {
    keywords: ['onco', 'cancer', 'tumor'],
    features: ['TUMOR_TRACKING', 'CHEMO_SCHEDULE'],
    name: 'Oncología'
  }
};
```

---

### 3️⃣ Detección de Especialidad

```javascript
// En MisPacientes.jsx - useEffect al montar
useEffect(() => {
  const cargarInfoMedico = async () => {
    const info = await gestionPacientesService.obtenerInfoMedicoActual();
    setDoctorInfo(info);  // Contiene "especialidad"
  };
  cargarInfoMedico();
}, []);

// useMemo que detecta la especialidad
const specialtyConfig = useMemo(() => {
  if (doctorInfo?.especialidad) {
    const detected = detectSpecialtyByKeywords(doctorInfo.especialidad);
    return SPECIALTY_FEATURES[detected];
  }
  return null;
}, [doctorInfo]);
```

---

### 4️⃣ Mostrar Columnas Condicionales

**Cardiología:**
```javascript
{specialtyConfig?.features?.includes('EKG_COLUMNS') && (
  <th>📅 Fecha toma EKG</th>
)}

{specialtyConfig?.features?.includes('EKG_ACTION') && (
  <th>🔍 Atender Lectura EKG</th>
)}
```

**Dermatología (ejemplo):**
```javascript
{specialtyConfig?.features?.includes('SKIN_IMAGES') && (
  <th>🖼️ Imágenes de Lesiones</th>
)}
```

---

## 📋 Ejemplo: Implementar Dermatología

### Paso 1: Agregar a SPECIALTY_FEATURES
```javascript
DERMATOLOGIA: {
  keywords: ['dermato', 'piel', 'dermatología'],
  features: ['SKIN_IMAGES', 'LESION_CLASSIFICATION'],
  name: 'Dermatología'
}
```

### Paso 2: Backend - DTO
```java
@Data
public class GestionPacienteDTO {
  // Campos existentes...

  // ✅ v1.80.0: Dermatología
  @JsonProperty("imagenesSkin")
  private List<String> imagenesSkin;  // URLs de imágenes de lesiones

  @JsonProperty("tipoCIEDermato")
  private String tipoCIEDermato;  // Código CIE-10 de la lesión
}
```

### Paso 3: Frontend - Columnas
```javascript
// En tabla headers
{specialtyConfig?.features?.includes('SKIN_IMAGES') && (
  <th>🖼️ Imágenes Lesión</th>
)}

// En tabla rows
{specialtyConfig?.features?.includes('SKIN_IMAGES') && (
  <td>
    {paciente.imagenesSkin?.length > 0 ? (
      <button onClick={() => abrirCarruselSkinImages(paciente)}>
        Ver {paciente.imagenesSkin.length} imágenes
      </button>
    ) : '-'}
  </td>
)}
```

---

## 🎨 Estilos por Especialidad

### Cardiología: Rojo para urgentes
```javascript
className={`${paciente.esUrgente ? 'bg-red-100' : 'bg-white'}`}
```

### Dermatología: Verde para lesiones activas
```javascript
className={`${paciente.lesionActiva ? 'bg-green-100' : 'bg-white'}`}
```

### Neurología: Amarillo para requiere MRI
```javascript
className={`${paciente.requiereMRI ? 'bg-yellow-100' : 'bg-white'}`}
```

---

## 🔄 Flujo Completo - Cardiología ✅ (Implementado)

1. **Login:** Doctor ingresa
2. **Info Médico:** API retorna `especialidad: "Cardiología"`
3. **Detectar:** Sistema identifica `CARDIOLOGIA`
4. **Cargar Features:** `EKG_COLUMNS`, `EKG_ACTION`
5. **Mostrar UI:**
   - Columna "Fecha toma EKG"
   - Botón "Atender Lectura EKG"
   - Rows rojos si `esUrgente=true`
6. **Interacción:** Doctor clica botón → Abre modal evaluación ECG

---

## 🚀 Roadmap Escalable

| Especialidad | Features | Estado | Prioridad |
|---|---|---|---|
| **Cardiología** | EKG viewing + urgencia | ✅ Hecho | ⭐⭐⭐ |
| **Dermatología** | Imágenes lesiones | 📋 Planeado | ⭐⭐ |
| **Neurología** | MRI viewer + tests | 📋 Planeado | ⭐⭐ |
| **Oftalmología** | Fundus images + campos | 📋 Planeado | ⭐ |
| **Oncología** | Tumor tracking + quimio | 📋 Planeado | ⭐ |

---

## 📊 Estructura de Datos Escalable

### DTO Base (todos usan esto)
```java
@Data
public class GestionPacienteDTO {
  // Campos comunes a todas las especialidades
  String numDoc;
  String apellidosNombres;
  String condicion;
  LocalDate fechaAtencion;
  Boolean esUrgente;

  // Campos específicos - cada especialidad agrega los suyos

  // ✅ Cardiología
  LocalDate fechaTomaEKG;
  String especialidadMedico;

  // 📋 Dermatología (futura)
  List<String> imagenesSkin;
  String tipoCIEDermato;

  // 📋 Neurología (futura)
  String ultimaPruebaNeuro;
  LocalDate requiereMRI;
}
```

---

## 🔐 MBAC - Control de Acceso por Especialidad

```sql
-- En tabla de permisos
INSERT INTO dim_permisos_modulo VALUES (
  'especialidad_cardiologia',
  'Cardiología - Visualizar EKG',
  'ver_ekg_columns',
  1
);

-- Asignar a roles de cardiólogos
INSERT INTO rol_permisos VALUES (
  'ROLE_MEDICO_CARDIOLOGIA',
  'especialidad_cardiologia'
);
```

---

## ✨ Ventajas del Patrón

✅ **Reutilizable:** Mismo código para N especialidades
✅ **Escalable:** Agregar especialidad = agregar config + DTOs
✅ **Mantenible:** Lógica centralizada en `SPECIALTY_FEATURES`
✅ **Seguro:** MBAC controla acceso por especialidad
✅ **Performante:** Detecta especialidad UNA VEZ al login

---

## 📝 Próximas Fases

- **v1.79.0:** Refactorizar para abstraer `BaseSpecialtyComponent`
- **v1.80.0:** Implementar Dermatología (imágenes de lesiones)
- **v1.81.0:** Implementar Neurología (MRI viewer)
- **v1.82.0:** Dashboard consolidado de todas las especialidades

---

**Arquitecto:** Sistema escalable diseñado para crecer con nuevas especialidades sin modificar código base.
