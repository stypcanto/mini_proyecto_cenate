# 🎯 ESTRUCTURA DEL MÓDULO: DetalleMedicoController

```
📦 Módulo Atenciones Clínicas
│
├── 🔌 API Layer
│   └── DetalleMedicoController.java
│       ├── GET /por-servicio/{idServicio}   → List<DetalleMedicoDTO>
│       └── GET /{idPers}                    → DetalleMedicoDTO
│
├── 🎯 Service Layer
│   ├── DetalleMedicoService.java (Interface)
│   └── DetalleMedicoServiceImpl.java (Implementation)
│       ├── obtenerMedicosPorServicio(Long)
│       └── obtenerDetalleMedico(Long)
│
├── 📚 Repository Layer
│   └── PersonalCntRepository.java (Existente + 1 método nuevo)
│       └── findByServicioEssi_IdServicio(Long)
│
└── 📋 DTO Layer
    └── DetalleMedicoDTO.java (New)
        ├── Personal: 7 campos
        ├── Área: 2 campos
        ├── Régimen: 2 campos
        └── Profesional: 3 campos
```

---

## 📊 DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────┐
│ 1. Cliente (Frontend/Postman)                           │
│    Solicitud: GET /detalle-medico/por-servicio/1      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. DetalleMedicoController                              │
│    - Valida permisos (@CheckMBACPermission)             │
│    - Loguea solicitud                                   │
│    - Llama a service                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. DetalleMedicoService (Interface)                     │
│    - Define contrato de métodos                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. DetalleMedicoServiceImpl                              │
│    - Implementa lógica de negocio                       │
│    - Llama a repository                                │
│    - Convierte entidades a DTOs                        │
│    - Loguea operaciones                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. PersonalCntRepository                                │
│    Método: findByServicioEssi_IdServicio(Long)         │
│    SELECT * FROM dim_personal_cnt                      │
│    WHERE id_servicio = ?                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Base de Datos                                        │
│    ┌─────────────────────────────────────────────────┐  │
│    │ dim_personal_cnt (múltiples registros)         │  │
│    │  - id_pers                                     │  │
│    │  - nom_pers, ape_pater_pers, ape_mater_pers   │  │
│    │  - num_doc_pers                               │  │
│    │  - email_pers, movil_pers                     │  │
│    │  - id_area (FK)                               │  │
│    │  - id_reg_lab (FK)                            │  │
│    │  - stat_pers                                  │  │
│    │  - coleg_pers, per_pers                       │  │
│    └─────────────────────────────────────────────────┘  │
│    ┌─────────────────────────────────────────────────┐  │
│    │ dim_area (unido por id_area)                  │  │
│    │  - id_area                                     │  │
│    │  - desc_area                                  │  │
│    └─────────────────────────────────────────────────┘  │
│    ┌─────────────────────────────────────────────────┐  │
│    │ dim_regimen_laboral (unido por id_reg_lab)   │  │
│    │  - id_reg_lab                                 │  │
│    │  - desc_reg_lab                               │  │
│    └─────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Service -> DTO Conversion                            │
│    PersonalCnt[] → DetalleMedicoDTO[]                   │
│    - Extrae datos relevantes                           │
│    - Obtiene nombre completo                           │
│    - Mapea relaciones                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Response Assembly                                    │
│    ApiResponse {                                        │
│      status: "success",                                 │
│      message: "Médicos obtenidos correctamente",       │
│      data: [DetalleMedicoDTO[], ...]                   │
│    }                                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 9. Cliente Recibe Response (JSON)                       │
│    HTTP 200 OK                                          │
│    Content-Type: application/json                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 TABLA COMPARATIVA

| Aspecto | Antes | Después |
|---------|-------|---------|
| Médicos por especialidad | No disponible | ✅ GET `/por-servicio/{id}` |
| Detalles de un médico | No disponible | ✅ GET `/{idPers}` |
| Datos disponibles | - | 14 campos relevantes |
| Área del médico | No | ✅ Sí (con descripción) |
| Régimen laboral | No | ✅ Sí (con descripción) |
| Información profesional | No | ✅ Sí (colegiatura, especialidad) |
| Logging | - | ✅ Completo |
| Manejo de errores | - | ✅ Completo |

---

## 🔄 RELACIONES DE BD UTILIZADAS

```javascript
// Relación: dim_personal_cnt.id_servicio → dim_servicio_essi.id_servicio
PersonalCnt.servicioEssi ← DimServicioEssi

// Relación: dim_personal_cnt.id_area → dim_area.id_area
PersonalCnt.area ← Area

// Relación: dim_personal_cnt.id_reg_lab → dim_regimen_laboral.id_reg_lab
PersonalCnt.regimenLaboral ← RegimenLaboral
```

---

## 📦 CAMPOS DEL DTO (14)

### Personales (7)
```json
{
  "idPers": 1,
  "nombre": "Dr. Carlos García López",
  "numDocPers": "12345678",
  "emailPers": "carlos@example.com",
  "emailCorpPers": "carlos@cenate.com.pe",
  "movilPers": "987654321",
  "genPers": "M"
}
```

### Área (2)
```json
{
  "idArea": 5,
  "descArea": "Medicina General"
}
```

### Régimen (2)
```json
{
  "idRegimenLaboral": 2,
  "descRegimenLaboral": "Contratación Administrativa de Servicios"
}
```

### Profesionales (3)
```json
{
  "statPers": "A",
  "colegPers": "CMP-45678",
  "perPers": "Medicina Interna"
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- ✅ DTO creado con 14 campos
- ✅ Service (interfaz) creado
- ✅ ServiceImpl implementado
- ✅ Repository actualizado (+1 método)
- ✅ Controller creado con 2 endpoints
- ✅ Permisos MBAC aplicados
- ✅ Logging completo (Slf4j)
- ✅ Manejo de excepciones
- ✅ Transacciones correctas
- ✅ DTOs bien estructurados
- ✅ Documentación completa
- ✅ Sin errores de compilación
- ✅ Cumplimiento de requisitos

---

## 🚀 USO DESDE EL FRONTEND

### Obtener médicos de una especialidad:
```javascript
const idServicio = 1; // ID de la especialidad
const response = await fetch(
  `/api/atenciones-clinicas/detalle-medico/por-servicio/${idServicio}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { data: medicos } = await response.json();
// medicos = [DetalleMedicoDTO, ...]
```

### Poblar el selector "Especialista" en GestionAsegurado.jsx:
```javascript
const [especialistasDisponibles, setEspecialistasDisponibles] = useState([]);

// Cargar cuando selecciona un servicio/especialidad
const cargarMedicosDelServicio = async (idServicio) => {
  const response = await fetch(
    `/api/atenciones-clinicas/detalle-medico/por-servicio/${idServicio}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const { data } = await response.json();
  // Mapear a opciones del select
  const opciones = data.map(m => ({
    value: m.idPers,
    label: m.nombre
  }));
  setEspecialistasDisponibles(opciones);
};
```

