# ⚡ ENDPOINTS DETALLE MEDICO - REFERENCIA RÁPIDA

## 🔴 ENDPOINT 1: Obtener Médicos por Especialidad

```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/por-servicio/1
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (Vacío - No tiene body)

**Respuesta:**
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

```
GET http://localhost:8080/api/atenciones-clinicas/detalle-medico/5
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (Vacío - No tiene body)

**Respuesta:**
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

---

## 📋 TABLA COMPARATIVA

| Campo | Endpoint 1 | Endpoint 2 | Tipo de Dato |
|-------|-----------|-----------|--------------|
| Método | GET | GET | - |
| Path Param | idServicio (obligatorio) | idPers (obligatorio) | Long |
| Body | Vacío | Vacío | - |
| Respuesta | Array de médicos | Objeto médico | JSON |
| HTTP Status | 200, 500 | 200, 404, 500 | - |

---

## 🧪 PRUEBAS RÁPIDAS EN POSTMAN

### Test 1: IDs de Servicios Válidos
```
/por-servicio/1  → Medicina General
/por-servicio/2  → Pediatría
/por-servicio/3  → Cardiología
/por-servicio/4  → Nutrición
/por-servicio/5  → Psicología
```

### Test 2: IDs de Médicos Válidos
```
/detalle-medico/1
/detalle-medico/2
/detalle-medico/5
/detalle-medico/10
```

---

## ✨ NOTAS IMPORTANTES

- ✅ **Sin Body:** Ambos endpoints son GET sin body
- ✅ **Token Requerido:** Incluir siempre header `Authorization: Bearer {token}`
- ✅ **No hay Parámetros Query:** Los parámetros van en la URL como Path params
- ✅ **Respuestas Estándar:** Todas usan estructura `{status, message, data}`

