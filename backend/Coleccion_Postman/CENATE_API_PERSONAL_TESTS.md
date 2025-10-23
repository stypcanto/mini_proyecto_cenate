# 🧭 API de Personal Unificado – CENATE 2025

## ✅ Health Check
```bash
curl -X GET http://localhost:8080/actuator/health | jq
```

## 📋 Listar todo el personal
```bash
curl -X GET http://localhost:8080/api/personal | jq
```

## 🔍 Buscar por ID
```bash
curl -X GET http://localhost:8080/api/personal/1 | jq
```

## 🔎 Buscar por nombre
```bash
curl -X GET "http://localhost:8080/api/personal/buscar?nombre=styp" | jq
```

## 🎂 Buscar por mes de cumpleaños
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-mes?mes=February" | jq
```

## 🎉 Buscar por fecha exacta de cumpleaños
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-fecha?fecha=1988-02-25" | jq
```

## 🏢 Buscar por área
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-area?area=GESTIÓN%20TI" | jq
```

## 🎓 Buscar por profesión
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-profesion?profesion=MEDICO" | jq
```

## 🩻 Buscar por especialidad
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-especialidad?especialidad=CARDIOLOGIA" | jq
```

## 👤 Buscar por rol
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-rol?rol=SUPERADMIN" | jq
```

## 📄 Buscar por régimen laboral
```bash
curl -X GET "http://localhost:8080/api/personal/buscar-por-regimen?regimen=LOCADOR" | jq
```

## 🧍‍♂️ Crear personal CENATE
```bash
curl -X POST http://localhost:8080/api/personal/cenate   -H "Content-Type: application/json"   -d '{
    "nombres": "JUAN",
    "apellidoPaterno": "RAMIREZ",
    "apellidoMaterno": "ROJAS",
    "numeroDocumento": "78945612",
    "tipoDocumento": "DNI",
    "fechaNacimiento": "1990-05-20",
    "genero": "M",
    "correoInstitucional": "juan.ramirez@essalud.gob.pe",
    "telefono": "987654321",
    "direccion": "Av. Salud 123, Lima",
    "idArea": 4,
    "idRegimen": 3,
    "estado": "A",
    "tipoPersonal": "CENATE"
  }'
```

## ✏️ Actualizar personal CENATE
```bash
curl -X PUT http://localhost:8080/api/personal/cenate/1   -H "Content-Type: application/json"   -d '{
    "correoInstitucional": "nuevo.correo@essalud.gob.pe",
    "telefono": "999888777",
    "direccion": "Av. Reforma 456"
  }'
```

## ❌ Eliminar personal CENATE
```bash
curl -X DELETE http://localhost:8080/api/personal/cenate/1
```

## 🌐 Crear personal externo
```bash
curl -X POST http://localhost:8080/api/personal/externo   -H "Content-Type: application/json"   -d '{
    "nombres": "MARIA ELENA",
    "apellidoPaterno": "GONZALES",
    "apellidoMaterno": "TORRES",
    "numeroDocumento": "75894621",
    "tipoDocumento": "DNI",
    "fechaNacimiento": "1985-03-15",
    "genero": "F",
    "correoPersonal": "maria.elena.gonzales@hsj.gob.pe",
    "telefono": "999777666",
    "institucion": "HOSPITAL SAN JUAN DE MIRAFLORES",
    "idIpress": 356,
    "tipoPersonal": "EXTERNO"
  }'
```

## ✏️ Actualizar personal externo
```bash
curl -X PUT http://localhost:8080/api/personal/externo/2   -H "Content-Type: application/json"   -d '{
    "correoPersonal": "nuevo.correo@hsj.gob.pe",
    "telefono": "987111222"
  }'
```

## ❌ Eliminar personal externo
```bash
curl -X DELETE http://localhost:8080/api/personal/externo/2
```

## 🖼️ Subir foto
```bash
curl -X POST "http://localhost:8080/api/personal/1/foto"   -F "file=@foto.jpg"
```

## 📷 Ver foto
```bash
curl -X GET "http://localhost:8080/api/personal/foto/personal_1_<timestamp>.jpg"   --output foto_descargada.jpg
```

## 🗑️ Eliminar foto
```bash
curl -X DELETE http://localhost:8080/api/personal/1/foto
```
