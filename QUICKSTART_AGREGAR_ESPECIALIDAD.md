# 🚀 QUICK START - Agregar Nueva Especialidad (1.5 horas)

Sigue estos pasos para agregar una nueva especialidad médica al sistema.
**Ejemplo:** Dermatología

---

## 📋 Checklist Pre-Implementación

- [ ] Especialidad identificada: **Dermatología**
- [ ] Features identificadas: **Imágenes de lesiones, Clasificación CIE-10**
- [ ] Tablas BD identificadas: **dermatologia_imagenes, dermatologia_evaluaciones**
- [ ] Mock data preparado (opcional)

---

## 🎯 Paso 1: Configurar SPECIALTY_FEATURES (5 min)

**Archivo:** `MisPacientes.jsx` (línea ~40)

```javascript
const SPECIALTY_FEATURES = {
  // ... especialidades existentes ...

  // ✨ NUEVA ESPECIALIDAD
  DERMATOLOGIA: {
    keywords: ['dermato', 'piel', 'dermatología'],
    features: ['SKIN_IMAGES', 'LESION_CLASSIFICATION'],
    name: 'Dermatología',
    icon: '🖼️',
    description: 'Dermatología - Con imágenes de lesiones'
  }
};
```

✅ **¡Listo!** Ya se detecta automáticamente si el doctor es dermatólogo.

---

## 🔧 Paso 2: Extender DTO Backend (10 min)

**Archivo:** `GestionPacienteDTO.java`

```java
@Data
@Builder
public class GestionPacienteDTO {
  // Campos existentes...

  // ✨ v1.80.0: DERMATOLOGÍA
  @JsonProperty("imagenesSkin")
  private List<String> imagenesSkin;

  @JsonProperty("tipoCIEDermato")
  private String tipoCIEDermato;

  @JsonProperty("tamañoLesion")
  private String tamañoLesion;

  @JsonProperty("clasificacionLesion")
  private String clasificacionLesion;
}
```

---

## 📡 Paso 3: Agregar Queries JDBC (15 min)

**Archivo:** `GestionPacienteServiceImpl.java`

```java
// En el método bolsaToGestionDTO(), agregar:

private void enriquecerConDatosDermato(GestionPaciente bolsa,
    GestionPacienteDTO.GestionPacienteDTOBuilder dto) {
  try {
    String dni = bolsa.getPacienteDni();

    // Obtener imágenes
    String sqlImagenes = "SELECT url_imagen FROM dermatologia_imagenes " +
        "WHERE num_doc = ? AND activo = true ORDER BY fecha DESC";
    List<String> imagenes = jdbcTemplate.queryForList(sqlImagenes, String.class, dni);

    // Obtener clasificación
    String sqlClasif = "SELECT clasificacion, cie10, tamanio FROM dermatologia_evaluaciones " +
        "WHERE num_doc = ? ORDER BY fecha DESC LIMIT 1";
    Map<String, Object> clasif = jdbcTemplate.queryForMap(sqlClasif, dni);

    if (clasif != null) {
      dto.imagenesSkin(imagenes)
         .clasificacionLesion((String) clasif.get("clasificacion"))
         .tipoCIEDermato((String) clasif.get("cie10"))
         .tamañoLesion((String) clasif.get("tamanio"));
    }
  } catch (Exception e) {
    log.warn("Error dermatología: {}", e.getMessage());
  }
}

// Llamar desde bolsaToGestionDTO():
enriquecerConDatosDermato(bolsa, dtoBuilder);
```

---

## 🎨 Paso 4: Agregar Columnas Frontend (20 min)

**Archivo:** `MisPacientes.jsx` (en la tabla headers)

```javascript
{/* Headers tabla */}
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

{/* Cells en tabla */}
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
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        paciente.clasificacionLesion === 'Maligna' ? 'bg-red-200'
        : paciente.clasificacionLesion === 'Precancerosa' ? 'bg-orange-200'
        : 'bg-green-200'
      }`}>
        {paciente.clasificacionLesion}
      </span>
    </td>
  </>
)}
```

---

## 🎬 Paso 5: Crear Modal/Componente Específico (15 min)

**Archivo:** `components/teleecgs/ModalCarruselSkinImages.jsx`

```javascript
import React, { useState } from 'react';

export default function ModalCarruselSkinImages({ paciente, isOpen, onClose }) {
  const [imagenActual, setImagenActual] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">
          🖼️ Lesiones de {paciente.apellidosNombres}
        </h2>

        {paciente.imagenesSkin?.[imagenActual] && (
          <img
            src={paciente.imagenesSkin[imagenActual]}
            alt={`Lesión ${imagenActual + 1}`}
            className="w-full h-96 object-contain mb-4 rounded"
          />
        )}

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => setImagenActual(Math.max(0, imagenActual - 1))}
            disabled={imagenActual === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ← Anterior
          </button>

          <span className="font-semibold">
            {imagenActual + 1} / {paciente.imagenesSkin?.length}
          </span>

          <button
            onClick={() => setImagenActual(Math.min(
              paciente.imagenesSkin.length - 1,
              imagenActual + 1
            ))}
            disabled={imagenActual >= paciente.imagenesSkin.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Siguiente →
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-semibold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Paso 6: Testing (20 min)

### Testing Manual Checklist

- [ ] Loguear como dermatólogo (doc con especialidad "Dermatología")
- [ ] Verificar que especialidad aparece en header
- [ ] Verificar que columnas de imágenes aparecen
- [ ] Verificar que botón abre modal de imágenes
- [ ] Verificar que código CIE-10 se muestra
- [ ] Verificar que clasificación muestra colores correctos
- [ ] Verificar que loguear como cardiólogo NO muestra columnas de dermatología

### Testing Automatizado (Playwright)

```javascript
// tests/MisPacientes.dermatologia.spec.js
test('Dermatólogo ve columnas de imágenes de lesiones', async ({ page }) => {
  await page.goto('/roles/medico/pacientes');

  // Esperar columna específica de dermatología
  const columnaImágenes = page.locator('th:has-text("🖼️ Imágenes Lesión")');
  await expect(columnaImágenes).toBeVisible();

  // Verificar que botón abre modal
  const btnImagenes = page.locator('button:has-text("🖼️")').first();
  await btnImagenes.click();

  // Verificar modal
  const modal = page.locator('text=Lesiones de');
  await expect(modal).toBeVisible();
});
```

---

## ✅ Paso 7: Verificar (5 min)

```bash
# 1. Backend: Asegurarse que compila
./gradlew clean bootRun

# 2. Frontend: No hay errores
npm run dev

# 3. Tests: Todos pasan
npm test

# 4. Browser: Verificar visualmente
# http://localhost:3000/roles/medico/pacientes
```

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo | Estado |
|-------|--------|--------|
| Paso 1: SPECIALTY_FEATURES | 5 min | ✅ |
| Paso 2: Extender DTO | 10 min | ✅ |
| Paso 3: Queries JDBC | 15 min | ✅ |
| Paso 4: Columnas frontend | 20 min | ✅ |
| Paso 5: Modal componente | 15 min | ✅ |
| Paso 6: Testing | 20 min | ✅ |
| Paso 7: Verificar | 5 min | ✅ |
| **TOTAL** | **~1.5 horas** | ✅ |

---

## 🎯 Checklist Final

- [ ] SPECIALTY_FEATURES contiene entrada nueva
- [ ] DTO extendido con nuevos campos
- [ ] Queries JDBC escritas y testeadas
- [ ] Columnas condicionales agregadas
- [ ] Modal/componente creado
- [ ] Testing manual completado
- [ ] Código compila sin errores
- [ ] Documentación actualizada
- [ ] PR creado con descripción clara
- [ ] Code review completado

---

## 📚 Archivos Relevantes

| Archivo | Línea | Acción |
|---------|-------|--------|
| MisPacientes.jsx | ~40 | Agregar SPECIALTY_FEATURES |
| MisPacientes.jsx | ~1500 | Agregar columnas |
| GestionPacienteDTO.java | ~150 | Extender DTO |
| GestionPacienteServiceImpl.java | ~700 | Agregar método enriquecer |
| ModalCarruselSkinImages.jsx | NEW | Crear componente |

---

## 🆘 Troubleshooting

### ❌ Columnas no aparecen
**Solución:** Verificar que:
1. SPECIALTY_FEATURES contiene la entrada
2. `specialtyConfig?.features?.includes('FEATURE_NAME')` es correcto
3. Browser cache limpiado (Ctrl+Shift+R)

### ❌ Datos no cargan
**Solución:** Verificar:
1. Queries JDBC son sintácticamente correctas
2. Tablas BD existen
3. Datos mock existen en BD
4. Logs backend para errores JDBC

### ❌ Modal no abre
**Solución:**
1. Verificar que componente está importado
2. Estado isOpen se actualiza correctamente
3. onClick handler está correcto

---

## 🚀 Siguientes Especialidades

Una vez que Dermatología esté lista, seguir el mismo proceso para:

1. **Neurología** (Paso 8-12)
   - Agregar NEURO_TESTS, MRI_VIEWER
   - DTO: ultimaPruebaNeuro, requiereMRI
   - Modal: MRI Viewer

2. **Oftalmología** (Paso 8-12)
   - Agregar FUNDUS_IMAGES, VISUAL_FIELDS
   - DTO: imagenesFundus, camposVisuales
   - Modal: Fundus Image Viewer

3. **Oncología** (Paso 8-12)
   - Agregar TUMOR_TRACKING, CHEMO_SCHEDULE
   - DTO: tamaño tumor, próxima quimio
   - Modal: Tumor Timeline

---

## 📞 Soporte

**¿Preguntas?** Ver:
- `spec/architecture/02_sistema_escalable_especialidades.md` - Arquitectura completa
- `spec/backend/13_especialidades_dermatologia.md` - Ejemplo detallado
- `SISTEMA_ESCALABLE_ESPECIALIDADES.md` - Visión general

---

**Tiempo estimado:** 1.5 horas ⏱️
**Dificultad:** 🟢 Baja (95% código ya existe)
**Status:** ✅ Listo para implementar
