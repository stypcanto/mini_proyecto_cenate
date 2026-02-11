# 🖼️ Dermatología (v1.80.0) - Ejemplo de Escalabilidad

## 📋 Resumen

Este documento muestra cómo se agregaría **Dermatología** usando el patrón escalable de v1.78.0.
Sirve como **plantilla para agregar más especialidades** (Neurología, Oncología, etc.)

---

## 🔄 Flujo Dermatología

```
Doctor loguea (es Dermatólogo)
  ↓
API /medico/info retorna "Dermatología"
  ↓
Sistema detecta especialidad
  ↓
Carga SPECIALTY_FEATURES['DERMATOLOGIA']
  ↓
Muestra columnas especializadas:
  - 🖼️ Imágenes de Lesiones
  - 🏷️ Código CIE-10
  - 📏 Tamaño de Lesión
  - 🎯 Clasificación Lesión
  ↓
Rows se colorean por severidad
```

---

## 🔧 Implementación (Paso a Paso)

### 1️⃣ Backend - DTO (GestionPacienteDTO.java)

```java
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GestionPacienteDTO {
  // ✅ Campos existentes
  String numDoc;
  String apellidosNombres;
  LocalDate fechaAtencion;
  Boolean esUrgente;

  // ✨ v1.80.0: DERMATOLOGÍA
  @JsonProperty("imagenesSkin")
  private List<String> imagenesSkin;  // URLs de imágenes de lesiones

  @JsonProperty("tipoCIEDermato")
  private String tipoCIEDermato;  // Ej: "L98.9" - Trastorno de la piel

  @JsonProperty("tamañoLesion")
  private String tamañoLesion;  // "< 1cm", "1-5cm", "> 5cm"

  @JsonProperty("clasificacionLesion")
  private String clasificacionLesion;  // "Maligna", "Benigna", "Precancerosa"

  @JsonProperty("severidadDermato")
  private Integer severidadDermato;  // 1-5 (para colores)
}
```

### 2️⃣ Backend - Service (GestionPacienteServiceImpl.java)

```java
private void enriquecerConDatosDermato(GestionPaciente bolsa, GestionPacienteDTO.GestionPacienteDTOBuilder dto) {
  try {
    String dni = bolsa.getPacienteDni();

    // Obtener imágenes de lesiones desde tabla de dermatología
    String sqlImagenes = "SELECT url_imagen FROM dermatologia_imagenes " +
        "WHERE num_doc = ? AND activo = true " +
        "ORDER BY fecha_captura DESC";
    List<String> imagenes = jdbcTemplate.queryForList(sqlImagenes, String.class, dni);

    // Obtener clasificación
    String sqlClasif = "SELECT clasificacion, cie10, tamanio, severidad " +
        "FROM dermatologia_evaluaciones WHERE num_doc = ? " +
        "ORDER BY fecha DESC LIMIT 1";

    Map<String, Object> clasif = jdbcTemplate.queryForMap(sqlClasif, dni);
    if (clasif != null) {
      dto.clasificacionLesion((String) clasif.get("clasificacion"))
         .tipoCIEDermato((String) clasif.get("cie10"))
         .tamañoLesion((String) clasif.get("tamanio"))
         .severidadDermato(((Number) clasif.get("severidad")).intValue())
         .imagenesSkin(imagenes);
    }
  } catch (Exception e) {
    log.warn("Error enriqueciendo datos dermatología: {}", e.getMessage());
  }
}
```

### 3️⃣ Frontend - SPECIALTY_FEATURES

```javascript
const SPECIALTY_FEATURES = {
  // ✅ Cardiología (existente)
  CARDIOLOGIA: {
    keywords: ['cardio', 'corazón'],
    features: ['EKG_COLUMNS', 'EKG_ACTION'],
    name: 'Cardiología'
  },

  // ✨ v1.80.0: DERMATOLOGÍA
  DERMATOLOGIA: {
    keywords: ['dermato', 'piel', 'dermatología'],
    features: ['SKIN_IMAGES', 'LESION_CLASSIFICATION', 'SEVERITY_COLORS'],
    name: 'Dermatología'
  }
};
```

### 4️⃣ Frontend - Columnas (MisPacientes.jsx)

```javascript
// Headers tabla
{specialtyConfig?.features?.includes('SKIN_IMAGES') && (
  <th className="px-4 py-3">🖼️ Imágenes Lesión</th>
)}

{specialtyConfig?.features?.includes('LESION_CLASSIFICATION') && (
  <>
    <th className="px-4 py-3">🏷️ CIE-10</th>
    <th className="px-4 py-3">📏 Tamaño</th>
    <th className="px-4 py-3">🎯 Clasificación</th>
  </>
)}

// Row styling para severidad
className={`${
  specialtyConfig?.features?.includes('SEVERITY_COLORS')
    ? paciente.severidadDermato === 5 ? 'bg-red-100'
    : paciente.severidadDermato >= 3 ? 'bg-yellow-100'
    : 'bg-green-100'
    : ''
}`}

// Cells en tabla
{specialtyConfig?.features?.includes('SKIN_IMAGES') && (
  <td className="px-4 py-3">
    {paciente.imagenesSkin?.length > 0 ? (
      <button onClick={() => abrirCarruselSkinImages(paciente)}>
        🖼️ {paciente.imagenesSkin.length} imágenes
      </button>
    ) : '-'}
  </td>
)}

{specialtyConfig?.features?.includes('LESION_CLASSIFICATION') && (
  <>
    <td>{paciente.tipoCIEDermato || '-'}</td>
    <td>{paciente.tamañoLesion || '-'}</td>
    <td>
      {paciente.clasificacionLesion && (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          paciente.clasificacionLesion === 'Maligna' ? 'bg-red-200 text-red-900'
          : paciente.clasificacionLesion === 'Precancerosa' ? 'bg-orange-200'
          : 'bg-green-200'
        }`}>
          {paciente.clasificacionLesion}
        </span>
      )}
    </td>
  </>
)}
```

### 5️⃣ Frontend - Modal Carrusel Imágenes

```javascript
// Nuevo componente
const ModalCarruselSkinImages = ({ paciente, isOpen, onClose }) => {
  const [imagenActual, setImagenActual] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          🖼️ Imágenes de Lesiones - {paciente.apellidosNombres}
        </h2>

        {paciente.imagenesSkin?.[imagenActual] && (
          <img
            src={paciente.imagenesSkin[imagenActual]}
            alt={`Lesión ${imagenActual + 1}`}
            className="w-full h-96 object-contain mb-4"
          />
        )}

        <div className="flex justify-between items-center">
          <button onClick={() => setImagenActual(Math.max(0, imagenActual - 1))}>
            ← Anterior
          </button>
          <span>{imagenActual + 1} / {paciente.imagenesSkin?.length}</span>
          <button onClick={() => setImagenActual(Math.min(paciente.imagenesSkin.length - 1, imagenActual + 1))}>
            Siguiente →
          </button>
        </div>

        <button onClick={onClose} className="mt-4 bg-gray-200 px-4 py-2 rounded">
          Cerrar
        </button>
      </div>
    </div>
  );
};
```

---

## 📊 Resultado Visual

```
┌──────────────────────────────────────────────────────┐
│ 👨‍⚕️ Mis Pacientes                                    │
│ MÉDICO: Dr. García                                   │
│ Dermatología  ← Se detecta automáticamente           │
│                                                      │
│ TABLA:                                               │
│ Paciente  │ Teléfono  │ 🖼️ Imágenes │ CIE-10 │ ...│
│ ──────────────────────────────────────────────────  │
│ JUAN PÉREZ│ 9xxxxxxxx │ 🖼️ 3 imágenes│ L98.9 │    │
│           │           │ (fondo ROJO) │              │
│ MARÍA RDZ │ 9xxxxxxxx │ 🖼️ 1 imagen │ D84.3 │    │
│           │           │ (fondo YLW)  │              │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Ventajas de Este Patrón

✅ **No se modifica código de Cardiología**
✅ **Reutiliza toda la infraestructura existente**
✅ **Solo agregar configuración + DTOs específicos**
✅ **Columnas condicionales automáticas**
✅ **Estilos dinámicos por severidad**

---

## ⏱️ Tiempo de Implementación

| Tarea | Tiempo |
|-------|--------|
| Agregar SPECIALTY_FEATURES | 5 min |
| Extender DTO | 10 min |
| Queries JDBC | 15 min |
| Columnas frontend | 20 min |
| Modal carrusel | 15 min |
| Tests | 20 min |
| **TOTAL** | **~1.5 horas** |

Comparado con si no tuviéramos el patrón: **6-8 horas**

---

## 📋 Checklist para Implementar Dermatología

- [ ] Agregar entrada `DERMATOLOGIA` a `SPECIALTY_FEATURES`
- [ ] Extender `GestionPacienteDTO` con campos dermatología
- [ ] Crear method `enriquecerConDatosDermato()` en service
- [ ] Agregar columnas condicionales en `MisPacientes.jsx`
- [ ] Crear `ModalCarruselSkinImages` component
- [ ] Agregar estilos por severidad
- [ ] Probar con doctor dermatólogo
- [ ] Documentar en CHANGELOG

---

## 🚀 Siguiente: Neurología

Una vez que Dermatología esté lista, seguir el mismo patrón para:
- MRI Viewer
- Pruebas neurológicas
- Seguimiento de pacientes

---

**Plantilla para:** Cualquier nueva especialidad
**Complejidad:** Baja (95% reutilizable)
**Estatus:** Listo para implementar
