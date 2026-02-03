# 🔌 ENDPOINTS DetalleMedicoController - GUÍA POSTMAN

## 📌 Información Base

**Base URL:** `http://localhost:8080`

**Content-Type:** `application/json`

**Autenticación:** Bearer Token (JWT) requerida

---

## 🔐 Header Obligatorio

```
Authorization: Bearer {tu_token_jwt}
Content-Type: application/json
```

---

## 📋 ENDPOINT 1: Obtener Médicos por Servicio/Especialidad

### Información General
- **Método:** `GET`
- **Endpoint:** `/api/atenciones-clinicas/detalle-medico/por-servicio/{idServicio}`
- **Descripción:** Retorna lista de todos los médicos asociados a una especialidad
- **Body:** ❌ NO tiene body

### URL Completa
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1
```

### Parámetros
| Parámetro | Tipo | Ubicación | Requerido | Ejemplo | Descripción |
|-----------|------|-----------|-----------|---------|------------|
| idServicio | Long | Path | ✅ Sí | 1 | ID del servicio/especialidad |

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body
```
(Vacío - GET sin body)
```

### Respuesta Exitosa (200 OK)
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

### Respuesta Error (500)
```json
{
  "status": "error",
  "message": "Error al obtener médicos: [detalles del error]",
  "data": null
}
```

### Curl
```bash
curl -X GET "http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Ejemplos de IDs de Servicios
| ID | Servicio | Especialidad |
|----|----------|--------------|
| 1 | MEDICINA_GENERAL | Medicina General |
| 2 | PEDIATRIA | Pediatría |
| 3 | CARDIOLOGIA | Cardiología |
| 4 | NUTRICION | Nutrición |
| 5 | PSICOLOGIA | Psicología |

---

## 📋 ENDPOINT 2: Obtener Detalles de un Médico Específico

### Información General
- **Método:** `GET`
- **Endpoint:** `/api/atenciones-clinicas/detalle-medico/{idPers}`
- **Descripción:** Retorna detalles completos de un médico específico
- **Body:** ❌ NO tiene body

### URL Completa
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5
```

### Parámetros
| Parámetro | Tipo | Ubicación | Requerido | Ejemplo | Descripción |
|-----------|------|-----------|-----------|---------|------------|
| idPers | Long | Path | ✅ Sí | 5 | ID del personal/médico |

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body
```
(Vacío - GET sin body)
```

### Respuesta Exitosa (200 OK)
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

### Respuesta No Encontrado (404)
```json
{
  "status": "not_found",
  "message": "Médico no encontrado",
  "data": null
}
```

### Curl
```bash
curl -X GET "http://localhost:8080/api/atenciones-clinicas/detalle-medico/5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 INSTRUCCIONES PARA POSTMAN

### Paso 1: Crear Colección
1. Abre Postman
2. Click en **"New"** → **"Collection"**
3. Nombre: `DetalleMedicoAPI`
4. Click **"Create"**

### Paso 2: Agregar Variables (Opcional pero Recomendado)
1. Click en la colección
2. Tab **"Variables"**
3. Agregar:

```
Variable: base_url
Initial value: http://localhost:8080
Current value: http://localhost:8080

Variable: token
Initial value: (tu token JWT)
Current value: (tu token JWT)

Variable: idServicio
Initial value: 1
Current value: 1

Variable: idPers
Initial value: 5
Current value: 5
```

### Paso 3: Crear Request 1 (Médicos por Servicio)
1. Click **"Add request"** en la colección
2. Nombre: `Obtener Médicos por Servicio`
3. Método: `GET`
4. URL: `{{base_url}}/api/atenciones-clinicas/detalle-medico/por-servicio/{{idServicio}}`
5. Tab **"Headers"**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
   - Key: `Content-Type`
   - Value: `application/json`
6. Click **"Send"**

### Paso 4: Crear Request 2 (Detalles de Médico)
1. Click **"Add request"** en la colección
2. Nombre: `Obtener Detalles de Médico`
3. Método: `GET`
4. URL: `{{base_url}}/api/atenciones-clinicas/detalle-medico/{{idPers}}`
5. Tab **"Headers"**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
   - Key: `Content-Type`
   - Value: `application/json`
6. Click **"Send"**

---

## 🧪 CASOS DE PRUEBA RECOMENDADOS

### Caso 1: Servicio Válido (ID existente)
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1
```
**Esperado:** HTTP 200 con lista de médicos

---

### Caso 2: Servicio Inválido (ID no existe)
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/999
```
**Esperado:** HTTP 200 con array vacío `[]`

---

### Caso 3: Médico Válido (ID existente)
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5
```
**Esperado:** HTTP 200 con objeto médico

---

### Caso 4: Médico Inválido (ID no existe)
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/999
```
**Esperado:** HTTP 404 con status `not_found`

---

### Caso 5: Sin Autenticación
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5
(Sin header Authorization)
```
**Esperado:** HTTP 401 (Unauthorized)

---

### Caso 6: Token Inválido
```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5
Authorization: Bearer invalid_token_12345
```
**Esperado:** HTTP 401 (Invalid token)

---

## 🚀 QUICK TEST (JSON para importar en Postman)

Si deseas importar la colección directamente en Postman, copia esto en un archivo `.json`:

```json
{
  "info": {
    "name": "DetalleMedicoAPI",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Obtener Médicos por Servicio",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/atenciones-clinicas/detalle-medico/por-servicio/{{idServicio}}",
          "host": ["{{base_url}}"],
          "path": ["api", "atenciones-clinicas", "detalle-medico", "por-servicio", "{{idServicio}}"]
        }
      }
    },
    {
      "name": "Obtener Detalles de Médico",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/atenciones-clinicas/detalle-medico/{{idPers}}",
          "host": ["{{base_url}}"],
          "path": ["api", "atenciones-clinicas", "detalle-medico", "{{idPers}}"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    },
    {
      "key": "idServicio",
      "value": "1"
    },
    {
      "key": "idPers",
      "value": "5"
    }
  ]
}
```

### Cómo importar:
1. Postman → **"Import"**
2. Pega el JSON arriba
3. Click **"Import"**
4. Define el valor de `token` en Variables

---

## 📊 RESUMEN RÁPIDO

| Endpoint | Método | URL | Body | Token |
|----------|--------|-----|------|-------|
| Médicos por Servicio | GET | `/api/atenciones-clinicas/detalle-medico/por-servicio/{id}` | ❌ No | ✅ Sí |
| Detalles de Médico | GET | `/api/atenciones-clinicas/detalle-medico/{id}` | ❌ No | ✅ Sí |

---

## ✅ CHECKLIST ANTES DE PROBAR

- ✅ Backend ejecutándose en puerto 8080
- ✅ Token JWT válido
- ✅ Permisos MBAC asignados
- ✅ Headers con Authorization
- ✅ URL correcta sin espacios

