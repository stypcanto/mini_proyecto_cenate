guarda toda esta coleccion de curl en un archivo md y dame eldescargable, manaa contiuare trabajando


2 pasos

Identificó restricción de permisos y redirigió almacenamiento.

F


Write file
Solicitud

{
  `content`: `# 🏥 CENATE API - Colección de Endpoints con cURL

**Sistema:** Centro Nacional de Telemedicina (CENATE)  
**Backend:** Spring Boot 3.5.6 + PostgreSQL 16.9  
**Fecha:** 30 de Octubre, 2025  
**Documentado por:** Claude

---

## 📑 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación](#autenticación)
3. [Endpoints de Usuarios](#endpoints-de-usuarios)
4. [Endpoints de Personal Externo](#endpoints-de-personal-externo)
5. [Endpoints de IPRESS](#endpoints-de-ipress)
6. [Endpoints de Roles](#endpoints-de-roles)
7. [Endpoints de Profesiones](#endpoints-de-profesiones)
8. [Endpoints de Dashboard](#endpoints-de-dashboard)
9. [Scripts de Automatización](#scripts-de-automatización)
10. [Tips y Troubleshooting](#tips-y-troubleshooting)

---

## 🔧 Configuración Inicial

### Variables de Entorno

```bash
# URL base del backend
export BASE_URL=\"http://localhost:8080\"

# Credenciales por defecto
export USERNAME=\"scantor\"
export PASSWORD=\"@Rodrigo28\"
```

### Instalar jq (opcional pero recomendado)

```bash
# macOS
brew install jq

# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (CentOS/RHEL)
sudo yum install jq
```

---

## 🔐 Autenticación

### Login y obtener token JWT

```bash
# Método 1: Ver respuesta completa
curl -X POST \"http://localhost:8080/api/auth/login\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"username\": \"scantor\",
    \"password\": \"@Rodrigo28\"
  }' | jq

# Método 2: Extraer solo el token y guardarlo en variable
export JWT_TOKEN=$(curl -s -X POST \"http://localhost:8080/api/auth/login\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"username\":\"scantor\",\"password\":\"@Rodrigo28\"}' | jq -r '.token')

# Método 3: Crear alias TOKEN para compatibilidad
export TOKEN=$JWT_TOKEN

# Verificar que el token se guardó correctamente
echo $TOKEN

# Ver el contenido del token (payload decodificado)
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq
```

**Respuesta esperada del login:**
```json
{
  \"token\": \"eyJhbGciOiJIUzI1NiJ9...\",
  \"id_user\": 1,
  \"username\": \"scantor\",
  \"nombreCompleto\": null,
  \"roles\": [\"SUPERADMIN\"],
  \"permisos\": [
    \"/roles/citas/dashboard\",
    \"/roles/medico/pacientes\",
    \"/roles/admin/usuarios\",
    \"/roles/reportes\"
  ],
  \"message\": \"Inicio de sesión exitoso\"
}
```

---

## 👤 Endpoints de Usuarios

**Base Path:** `/api/usuarios`

### 📋 Consultas

#### Obtener perfil del usuario actual
```bash
curl -X GET \"http://localhost:8080/api/usuarios/me\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

**Respuesta:**
```json
{
  \"idUser\": 1,
  \"username\": \"scantor\",
  \"estado\": \"ACTIVO\",
  \"activo\": false,
  \"locked\": false,
  \"roles\": [\"SUPERADMIN\"]
}
```

#### Listar todos los usuarios
```bash
curl -X GET \"http://localhost:8080/api/usuarios\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar usuario por ID
```bash
# Nota: La ruta usa /id/ en el path
curl -X GET \"http://localhost:8080/api/usuarios/id/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener detalle completo de usuario
```bash
curl -X GET \"http://localhost:8080/api/usuarios/detalle/scantor\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener roles de un usuario
```bash
curl -X GET \"http://localhost:8080/api/usuarios/roles/scantor\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Listar usuarios internos
```bash
curl -X GET \"http://localhost:8080/api/usuarios/internos\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Listar usuarios externos
```bash
curl -X GET \"http://localhost:8080/api/usuarios/externos\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### ✨ Crear Usuario

```bash
curl -X POST \"http://localhost:8080/api/usuarios/crear\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"username\": \"nuevo_usuario\",
    \"password\": \"Password123!\",
    \"email\": \"nuevo.usuario@essalud.gob.pe\",
    \"nombres\": \"Juan Carlos\",
    \"apellidoPaterno\": \"Pérez\",
    \"apellidoMaterno\": \"García\",
    \"idRol\": 2,
    \"estadoUser\": \"ACTIVO\"
  }' | jq
```

### ✏️ Actualizar Usuario

```bash
curl -X PUT \"http://localhost:8080/api/usuarios/id/2\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"email\": \"actualizado@essalud.gob.pe\",
    \"nombres\": \"Juan Carlos Actualizado\"
  }' | jq
```

### 🟢 Activar Usuario

```bash
curl -X PUT \"http://localhost:8080/api/usuarios/id/2/activate\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### 🔴 Desactivar Usuario

```bash
curl -X PUT \"http://localhost:8080/api/usuarios/id/2/deactivate\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### 🔓 Desbloquear Usuario

```bash
curl -X PUT \"http://localhost:8080/api/usuarios/id/2/unlock\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### 🔄 Cambiar Estado del Usuario

```bash
curl -X PATCH \"http://localhost:8080/api/usuarios/2/estado\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"estado\": \"ACTIVO\"
  }' | jq
```

### 🔑 Cambiar Contraseña

```bash
# Cambiar tu propia contraseña
curl -X PUT \"http://localhost:8080/api/usuarios/change-password\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"oldPassword\": \"@Rodrigo28\",
    \"newPassword\": \"NuevaPassword123!\"
  }' | jq

# Cambiar contraseña de otro usuario (como admin)
curl -X PUT \"http://localhost:8080/api/usuarios/change-password\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"username\": \"otro_usuario\",
    \"oldPassword\": \"PasswordViejo123\",
    \"newPassword\": \"NuevaPassword123!\"
  }' | jq
```

### 🗑️ Eliminar Usuario

```bash
# Solo SUPERADMIN puede eliminar usuarios
curl -X DELETE \"http://localhost:8080/api/usuarios/id/2\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

---

## 🏥 Endpoints de Personal Externo

**Base Path:** `/api/personal-externo`

### 📋 Consultas

#### Listar todo el personal externo
```bash
curl -X GET \"http://localhost:8080/api/personal-externo\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar personal externo por ID
```bash
curl -X GET \"http://localhost:8080/api/personal-externo/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar por número de documento
```bash
curl -X GET \"http://localhost:8080/api/personal-externo/buscar?numDoc=12345678\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar por email
```bash
curl -X GET \"http://localhost:8080/api/personal-externo/buscar-email?email=maria@gmail.com\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar por IPRESS
```bash
curl -X GET \"http://localhost:8080/api/personal-externo/ipress/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### ✨ Crear Personal Externo

```bash
curl -X POST \"http://localhost:8080/api/personal-externo\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"idTipDoc\": 1,
    \"numDoc\": \"87654321\",
    \"nombres\": \"María Elena\",
    \"apellidoPaterno\": \"González\",
    \"apellidoMaterno\": \"López\",
    \"fechaNacimiento\": \"1990-05-15\",
    \"genero\": \"F\",
    \"idIpress\": 1,
    \"movil\": \"987654321\",
    \"emailPersonal\": \"maria.gonzalez@gmail.com\",
    \"emailCorporativo\": \"maria.gonzalez@essalud.gob.pe\",
    \"institucionExterna\": \"Hospital Rebagliati\",
    \"tipoPersonal\": \"EXTERNO\"
  }' | jq
```

### ✏️ Actualizar Personal Externo

```bash
curl -X PUT \"http://localhost:8080/api/personal-externo/1\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"movil\": \"999888777\",
    \"emailPersonal\": \"maria.nuevo@gmail.com\"
  }' | jq
```

### 🗑️ Eliminar Personal Externo

```bash
curl -X DELETE \"http://localhost:8080/api/personal-externo/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

---

## 🏥 Endpoints de IPRESS

**Base Path:** `/api/ipress`

### 📋 Consultas

#### Listar todas las IPRESS
```bash
curl -X GET \"http://localhost:8080/api/ipress\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar IPRESS por ID
```bash
curl -X GET \"http://localhost:8080/api/ipress/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar IPRESS activas
```bash
curl -X GET \"http://localhost:8080/api/ipress?estado=A\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar IPRESS por distrito
```bash
# Distrito 1501 (ejemplo)
curl -X GET \"http://localhost:8080/api/ipress/distrito/1501?estado=A\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar IPRESS por nombre
```bash
curl -X GET \"http://localhost:8080/api/ipress/buscar?nombre=Hospital\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar IPRESS por código
```bash
curl -X GET \"http://localhost:8080/api/ipress/codigo/IP001\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

---

## 👔 Endpoints de Roles

**Base Path:** `/api/roles`

### 📋 Consultas

#### Listar todos los roles
```bash
curl -X GET \"http://localhost:8080/api/roles\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener roles activos
```bash
curl -X GET \"http://localhost:8080/api/roles?estado=A\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar rol por ID
```bash
curl -X GET \"http://localhost:8080/api/roles/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Verificar si existe un rol
```bash
curl -X GET \"http://localhost:8080/api/roles/existe/SUPERADMIN\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### ✨ Crear Rol

```bash
curl -X POST \"http://localhost:8080/api/roles\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"descRol\": \"COORDINADOR_MEDICO\",
    \"statRol\": \"A\"
  }' | jq
```

### ✏️ Actualizar Rol

```bash
curl -X PUT \"http://localhost:8080/api/roles/5\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"descRol\": \"COORDINADOR_MEDICO_ACTUALIZADO\",
    \"statRol\": \"A\"
  }' | jq
```

---

## 🎓 Endpoints de Profesiones

**Base Path:** `/api/profesiones`

### 📋 Consultas

#### Listar todas las profesiones
```bash
curl -X GET \"http://localhost:8080/api/profesiones\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener profesiones activas ordenadas
```bash
curl -X GET \"http://localhost:8080/api/profesiones?estado=A\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Buscar profesión por ID
```bash
curl -X GET \"http://localhost:8080/api/profesiones/1\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

### ✨ Crear Profesión

```bash
curl -X POST \"http://localhost:8080/api/profesiones\" \\
  -H \"Authorization: Bearer $TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"descProf\": \"Cardiólogo\",
    \"statProf\": \"A\"
  }' | jq
```

---

## 📊 Endpoints de Dashboard

**Base Path:** `/api/dashboard`

### 📋 Estadísticas

#### Obtener estadísticas generales
```bash
curl -X GET \"http://localhost:8080/api/dashboard/stats\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener métricas de usuarios
```bash
curl -X GET \"http://localhost:8080/api/dashboard/usuarios/stats\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

#### Obtener métricas de citas
```bash
curl -X GET \"http://localhost:8080/api/dashboard/citas/stats\" \\
  -H \"Authorization: Bearer $TOKEN\" | jq
```

---

## 🤖 Scripts de Automatización

### Script 1: Login automático y guardar token

Crear archivo: `login.sh`

```bash
#!/bin/bash

# Colores
GREEN='\\033[0;32m'
RED='\\033[0;31m'
NC='\\033[0m'

echo \"🔐 Obteniendo token de autenticación...\"

# Login y extraer token
export TOKEN=$(curl -s -X POST \"http://localhost:8080/api/auth/login\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"username\":\"scantor\",\"password\":\"@Rodrigo28\"}' | jq -r '.token')

if [ \"$TOKEN\" == \"null\" ] || [ -z \"$TOKEN\" ]; then
  echo -e \"${RED}❌ Error al obtener token${NC}\"
  exit 1
fi

# Guardar token en archivo
echo $TOKEN > .api-token
export JWT_TOKEN=$TOKEN

echo -e \"${GREEN}✅ Token obtenido y guardado en .api-token${NC}\"
echo \"Token: ${TOKEN:0:50}...\"

# Exportar para la sesión actual
echo \"export TOKEN=$TOKEN\" >`
}