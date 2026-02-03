# 📌 RESUMEN ENDPOINTS DetalleMedicoController

## 📋 Información Base

**Base URL:** `http://localhost:8080`

**Autenticación:** Bearer Token (JWT)

**Content-Type:** `application/json` (en Headers)

---

## 🔴 ENDPOINT 1: Obtener Médicos por Servicio

### Detalles
- **Método:** `GET`
- **Path:** `/api/atenciones-clinicas/detalle-medico/por-servicio/{idServicio}`
- **URL Completa:** `GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1`
- **Body:** ❌ **NO tiene body**
- **Token:** ✅ **Requerido**

### Headers Requeridos
```
Authorization: Bearer {tu_token_jwt}
Content-Type: application/json
```

### Parámetros
```
idServicio = 1 (en la URL, no en body)
```

### Ejemplos de IDs de Servicios
```
1 → Medicina General
2 → Pediatría
3 → Cardiología
4 → Nutrición
5 → Psicología
```

### Respuesta (HTTP 200)
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
    }
  ]
}
```

---

## 🔴 ENDPOINT 2: Obtener Detalles de un Médico

### Detalles
- **Método:** `GET`
- **Path:** `/api/atenciones-clinicas/detalle-medico/{idPers}`
- **URL Completa:** `GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5`
- **Body:** ❌ **NO tiene body**
- **Token:** ✅ **Requerido**

### Headers Requeridos
```
Authorization: Bearer {tu_token_jwt}
Content-Type: application/json
```

### Parámetros
```
idPers = 5 (en la URL, no en body)
```

### Respuesta (HTTP 200)
```json
{
  "status": "success",
  "message": "Detalles del médico obtenidos correctamente",
  "data": {
    "idPers": 5,
    "nombre": "Dr. Juan López Martínez",
    "numDocPers": "11223344",
    "emailPers": "juan@example.com",
    "emailCorpPers": "juan@cenate.com.pe",
    "movilPers": "987654325",
    "genPers": "M",
    "idArea": 6,
    "descArea": "Cardiología",
    "idRegimenLaboral": 3,
    "descRegimenLaboral": "Decreto Legislativo 728",
    "statPers": "A",
    "colegPers": "CMP-45680",
    "perPers": "Cardiología Clínica"
  }
}
```

### Respuesta No Encontrado (HTTP 404)
```json
{
  "status": "not_found",
  "message": "Médico no encontrado",
  "data": null
}
```

---

## 📊 TABLA RESUMEN

| Aspecto | Endpoint 1 | Endpoint 2 |
|---------|-----------|-----------|
| **Método HTTP** | GET | GET |
| **Base URL** | `/api/atenciones-clinicas/detalle-medico` | `/api/atenciones-clinicas/detalle-medico` |
| **Path Param** | `/por-servicio/{idServicio}` | `/{idPers}` |
| **Body** | ❌ No | ❌ No |
| **Token** | ✅ Sí | ✅ Sí |
| **Respuesta** | Array de médicos | Objeto médico |
| **Códigos HTTP** | 200, 500 | 200, 404, 500 |

---

## ✅ CHECKLIST PARA POSTMAN

- ✅ Cambiar método a **GET**
- ✅ Copiar URL completa
- ✅ Ir a tab **Headers**
- ✅ Agregar: `Authorization: Bearer {token}`
- ✅ Agregar: `Content-Type: application/json`
- ✅ **NO agregar body** (dejarlo vacío)
- ✅ Click **Send**

---

## 🚀 EJEMPLOS CURL

### Obtener médicos de un servicio
```bash
curl -X GET "http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Obtener detalles de un médico
```bash
curl -X GET "http://localhost:8080/api/atenciones-clinicas/detalle-medico/5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 🔐 Notas de Seguridad

- ✅ Ambos endpoints requieren **token JWT válido**
- ✅ Protegidos con `@CheckMBACPermission`
- ✅ Requieren página: `/atenciones-clinicas` y acción: `ver`
- ✅ Sin token: **HTTP 401 Unauthorized**
- ✅ Token inválido: **HTTP 401 Unauthorized**

---

## 📝 Campos Retornados (14)

1. **idPers** - ID del personal
2. **nombre** - Nombre completo formateado
3. **numDocPers** - Número de documento (DNI)
4. **emailPers** - Correo personal
5. **emailCorpPers** - Correo corporativo
6. **movilPers** - Teléfono móvil
7. **genPers** - Género (M/F)
8. **idArea** - ID del área
9. **descArea** - Descripción del área
10. **idRegimenLaboral** - ID del régimen
11. **descRegimenLaboral** - Descripción del régimen
12. **statPers** - Estado (A=Activo, I=Inactivo)
13. **colegPers** - Número de colegiatura
14. **perPers** - Especialidad/Perito

