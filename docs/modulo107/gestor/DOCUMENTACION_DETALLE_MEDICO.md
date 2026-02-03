# 🏥 Endpoint: Detalle Médico por Especialidad

## 📋 Resumen
Se ha creado un nuevo módulo backend para obtener información de médicos asociados a un servicio/especialidad específico. El flujo utiliza las tablas:
- `dim_personal_cnt` (Personal)
- `dim_servicio_essi` (Servicios/Especialidades)
- `dim_regimen_laboral` (Régimen Laboral)
- `dim_area` (Áreas)

## 📁 Archivos Creados

### 1. **DTO: DetalleMedicoDTO**
   - **Ubicación:** `backend/src/main/java/com/styp/cenate/dto/DetalleMedicoDTO.java`
   - **Propósito:** Transferencia de datos de médicos
   - **Campos:**
     - `idPers` - ID del personal
     - `nombre` - Nombre completo del médico
     - `numDocPers` - Número de documento
     - `emailPers` - Correo personal
     - `emailCorpPers` - Correo corporativo
     - `movilPers` - Teléfono móvil
     - `genPers` - Género (M/F)
     - `idArea` - ID del área
     - `descArea` - Descripción del área
     - `idRegimenLaboral` - ID del régimen laboral
     - `descRegimenLaboral` - Descripción del régimen laboral
     - `statPers` - Estado (A=Activo, I=Inactivo)
     - `colegPers` - Número de colegiatura
     - `perPers` - Especialidad/Perito

### 2. **Service (Interface): DetalleMedicoService**
   - **Ubicación:** `backend/src/main/java/com/styp/cenate/service/atenciones_clinicas/DetalleMedicoService.java`
   - **Métodos:**
     - `List<DetalleMedicoDTO> obtenerMedicosPorServicio(Long idServicio)` - Obtiene todos los médicos de un servicio
     - `DetalleMedicoDTO obtenerDetalleMedico(Long idPers)` - Obtiene detalles de un médico específico

### 3. **Service Implementation: DetalleMedicoServiceImpl**
   - **Ubicación:** `backend/src/main/java/com/styp/cenate/service/atenciones_clinicas/impl/DetalleMedicoServiceImpl.java`
   - **Características:**
     - Implementa la interfaz `DetalleMedicoService`
     - Utiliza `PersonalCntRepository` para acceder a datos
     - Convierte entidades a DTOs
     - Incluye logging detallado
     - Transaccional (read-only)

### 4. **Repository: PersonalCntRepository**
   - **Ubicación:** `backend/src/main/java/com/styp/cenate/repository/PersonalCntRepository.java`
   - **Nuevo Método Agregado:**
     ```java
     List<PersonalCnt> findByServicioEssi_IdServicio(Long idServicio);
     ```
   - **Nota:** No se modificaron métodos existentes, solo se agregó uno nuevo

### 5. **Controller: DetalleMedicoController**
   - **Ubicación:** `backend/src/main/java/com/styp/cenate/api/atenciones_clinicas/DetalleMedicoController.java`
   - **Base URL:** `/api/atenciones-clinicas/detalle-medico`
   - **Permisos:** Protegido con `@CheckMBACPermission`

## 🔌 Endpoints Disponibles

### Endpoint 1: Obtener Médicos por Servicio
```
GET /api/atenciones-clinicas/detalle-medico/por-servicio/{idServicio}
```

**Parámetros:**
- `idServicio` (Path) - ID del servicio/especialidad (requerido)

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "message": "Médicos obtenidos correctamente",
  "data": [
    {
      "idPers": 1,
      "nombre": "Dr. Carlos García López",
      "numDocPers": "12345678",
      "emailPers": "carlos@example.com",
      "emailCorpPers": "carlos@cenate.com.pe",
      "movilPers": "987654321",
      "genPers": "M",
      "idArea": 5,
      "descArea": "Medicina General",
      "idRegimenLaboral": 2,
      "descRegimenLaboral": "Contratación Administrativa de Servicios (CAS)",
      "statPers": "A",
      "colegPers": "CMP-45678",
      "perPers": "Medicina Interna"
    },
    {
      "idPers": 2,
      "nombre": "Dra. María Rodríguez Pérez",
      "numDocPers": "87654321",
      "emailPers": "maria@example.com",
      "emailCorpPers": "maria@cenate.com.pe",
      "movilPers": "987654322",
      "genPers": "F",
      "idArea": 5,
      "descArea": "Medicina General",
      "idRegimenLaboral": 2,
      "descRegimenLaboral": "Contratación Administrativa de Servicios (CAS)",
      "statPers": "A",
      "colegPers": "CMP-45679",
      "perPers": "Medicina Interna"
    }
  ]
}
```

**Respuesta de Error (500):**
```json
{
  "status": "error",
  "message": "Error al obtener médicos: [mensaje de error]",
  "data": null
}
```

---

### Endpoint 2: Obtener Detalles de un Médico
```
GET /api/atenciones-clinicas/detalle-medico/{idPers}
```

**Parámetros:**
- `idPers` (Path) - ID del personal médico (requerido)

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "message": "Detalles del médico obtenidos correctamente",
  "data": {
    "idPers": 1,
    "nombre": "Dr. Carlos García López",
    "numDocPers": "12345678",
    "emailPers": "carlos@example.com",
    "emailCorpPers": "carlos@cenate.com.pe",
    "movilPers": "987654321",
    "genPers": "M",
    "idArea": 5,
    "descArea": "Medicina General",
    "idRegimenLaboral": 2,
    "descRegimenLaboral": "Contratación Administrativa de Servicios (CAS)",
    "statPers": "A",
    "colegPers": "CMP-45678",
    "perPers": "Medicina Interna"
  }
}
```

**Respuesta No Encontrado (404):**
```json
{
  "status": "not_found",
  "message": "Médico no encontrado",
  "data": null
}
```

---

## 📊 Ejemplo de Uso

### Con curl:
```bash
# Obtener médicos de un servicio (por ejemplo, servicio ID 1)
curl -X GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Obtener detalles de un médico (por ejemplo, personal ID 5)
curl -X GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Con JavaScript/Fetch:
```javascript
// Obtener médicos por servicio
const idServicio = 1;
const response = await fetch(`/api/atenciones-clinicas/detalle-medico/por-servicio/${idServicio}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.data); // Array de médicos
```

---

## 🔐 Permisos Requeridos

Ambos endpoints están protegidos con:
- **Página:** `/atenciones-clinicas`
- **Acción:** `ver`
- **Mensaje de Error:** "No tiene permiso para ver detalles de médicos"

Requiere autenticación con JWT.

---

## 🏗️ Arquitectura de Datos

```
dim_servicio_essi (id_servicio) ← 1:N → dim_personal_cnt (id_servicio)
                                              ↓
                                    id_area → dim_area
                                    id_reg_lab → dim_regimen_laboral
```

**Flujo de Consulta:**
1. Usuario envía `idServicio`
2. Controller valida permisos
3. Service llama a Repository
4. Repository busca PersonalCnt por `servicioEssi.idServicio`
5. Service convierte PersonalCnt → DetalleMedicoDTO
6. Controller retorna lista de DTOs

---

## ✅ Estado de Implementación

- ✅ DTO creado
- ✅ Service (interfaz) creado
- ✅ ServiceImpl creado
- ✅ Repository actualizado (nuevo método)
- ✅ Controller creado
- ✅ Permisos implementados
- ✅ Logging completo
- ✅ Manejo de errores
- ✅ Sin errores de compilación
- ✅ Transacciones correctas

---

## 📝 Notas Importantes

1. **No se modificaron entidades existentes** - Solo se utilizan las relaciones ya definidas
2. **No se afectaron métodos existentes** - Solo se agregó nuevo método al repositorio
3. **Búsqueda por estado** - Retorna todos los médicos sin filtrar por estado (se pueden agregar filtros si es necesario)
4. **Información completa** - Se obtienen datos de área y régimen laboral a través de relaciones
5. **Logging detallado** - Todos los pasos están registrados para debugging

---

## 🚀 Próximas Mejoras Sugeridas

1. Agregar filtro por `statPers` (solo activos)
2. Agregar paginación si hay muchos médicos por servicio
3. Agregar endpoint para obtener servicios disponibles
4. Agregar búsqueda por nombre de médico
5. Agregar relación con disponibilidad médica si existe

