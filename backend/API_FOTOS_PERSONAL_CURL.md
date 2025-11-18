# 📸 API CRUD de Fotos del Personal - Comandos cURL

## 🔐 Variables de Entorno

Antes de ejecutar los comandos, configura estas variables:

```bash
# URL base del backend
export BASE_URL="http://localhost:8080"

# Token JWT (obtenerlo del login)
export TOKEN="tu_token_jwt_aqui"

# ID del usuario (id_usuario de dim_usuarios)
export USER_ID=1

# Nombre del archivo de foto (después de subir)
export FILENAME="personal_1_uuid_foto.jpg"
```

---

## 1️⃣ SUBIR FOTO (POST)

Sube una nueva foto o reemplaza la existente.

```bash
curl -X POST "${BASE_URL}/api/personal/foto/${USER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/ruta/a/tu/foto.jpg"
```

**Ejemplo con archivo local:**
```bash
curl -X POST "http://localhost:8080/api/personal/foto/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@./foto_perfil.jpg"
```

**Respuesta exitosa:**
```json
{
  "message": "Foto subida correctamente",
  "filename": "personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg",
  "url": "/api/personal/foto/personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg"
}
```

---

## 2️⃣ OBTENER FOTO (GET)

Obtiene la foto por nombre de archivo.

```bash
curl -X GET "${BASE_URL}/api/personal/foto/${FILENAME}" \
  -H "Authorization: Bearer ${TOKEN}" \
  --output foto_descargada.jpg
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8080/api/personal/foto/personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output foto_descargada.jpg
```

**Nota:** Este endpoint es público (no requiere autenticación según el código actual).

**Para ver la foto en el navegador:**
```
http://localhost:8080/api/personal/foto/personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg
```

---

## 3️⃣ ELIMINAR FOTO (DELETE)

Elimina la foto asociada a un usuario.

```bash
curl -X DELETE "${BASE_URL}/api/personal/foto/${USER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:8080/api/personal/foto/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Respuesta exitosa:**
```json
{
  "message": "Foto eliminada correctamente",
  "deleted": true,
  "filename": "personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg"
}
```

**Respuesta si no hay foto:**
```json
{
  "message": "No hay foto asociada a este usuario",
  "deleted": false
}
```

---

## 4️⃣ OBTENER FOTO POR ID DE PERSONAL (GET)

Obtiene la foto usando el ID del personal (no del usuario).

```bash
curl -X GET "${BASE_URL}/api/personal-cnt/${PERSONAL_ID}/foto" \
  -H "Authorization: Bearer ${TOKEN}" \
  --output foto_personal.jpg
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8080/api/personal-cnt/58/foto" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output foto_personal.jpg
```

---

## 🔑 OBTENER TOKEN JWT

Para obtener el token, primero debes hacer login:

```bash
curl -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tu_usuario",
    "password": "tu_password"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "tu_usuario",
  "roles": ["ROLE_ADMIN"]
}
```

Copia el valor de `token` y úsalo en la variable `${TOKEN}`.

---

## 📋 FLUJO COMPLETO DE PRUEBA

```bash
# 1. Configurar variables
export BASE_URL="http://localhost:8080"
export TOKEN="tu_token_aqui"
export USER_ID=1

# 2. Subir foto
curl -X POST "${BASE_URL}/api/personal/foto/${USER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@./foto.jpg"

# 3. Guardar el filename de la respuesta en una variable
export FILENAME="personal_1_550e8400-e29b-41d4-a716-446655440000_foto.jpg"

# 4. Obtener la foto
curl -X GET "${BASE_URL}/api/personal/foto/${FILENAME}" \
  --output foto_descargada.jpg

# 5. Eliminar la foto
curl -X DELETE "${BASE_URL}/api/personal/foto/${USER_ID}" \
  -H "Authorization: Bearer ${TOKEN}"

# 6. Verificar que se eliminó (debe retornar 404 o mensaje de "no hay foto")
curl -X GET "${BASE_URL}/api/personal/foto/${FILENAME}" \
  -v
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Permisos requeridos:**
   - `POST /api/personal/foto/{id}` requiere: `/roles/admin/personal/editar`
   - `DELETE /api/personal/foto/{id}` requiere: `/roles/admin/personal/editar`
   - `GET /api/personal/foto/{filename}` es público

2. **ID del usuario:**
   - Los endpoints usan `id_usuario` (de `dim_usuarios`), no `id_pers`
   - Para obtener el `id_usuario`, consulta la tabla `dim_usuarios` o usa el endpoint `/api/usuario/me`

3. **Formato de archivo:**
   - Acepta imágenes: JPG, PNG, etc.
   - El backend valida que sea una imagen válida

4. **Directorio de almacenamiento:**
   - Por defecto: `uploads/personal/`
   - Configurable en `application.properties`: `cenate.storage.fotos-dir`

5. **Reemplazo de fotos:**
   - Si subes una nueva foto, reemplaza la anterior automáticamente
   - El archivo anterior se elimina del sistema de archivos

---

## 🧪 PRUEBAS CON HTTPIE (Alternativa a cURL)

Si prefieres usar `httpie`:

```bash
# Subir foto
http POST "${BASE_URL}/api/personal/foto/${USER_ID}" \
  "Authorization:Bearer ${TOKEN}" \
  "file@./foto.jpg"

# Eliminar foto
http DELETE "${BASE_URL}/api/personal/foto/${USER_ID}" \
  "Authorization:Bearer ${TOKEN}"

# Obtener foto
http GET "${BASE_URL}/api/personal/foto/${FILENAME}" \
  --download
```

---

## 📝 EJEMPLO COMPLETO CON RESPUESTAS

```bash
# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token obtenido: ${TOKEN}"

# 2. Subir foto
RESPONSE=$(curl -s -X POST "http://localhost:8080/api/personal/foto/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@./foto.jpg")

FILENAME=$(echo $RESPONSE | jq -r '.filename')
echo "Foto subida: ${FILENAME}"

# 3. Obtener foto
curl -X GET "http://localhost:8080/api/personal/foto/${FILENAME}" \
  --output foto_descargada.jpg

# 4. Eliminar foto
curl -X DELETE "http://localhost:8080/api/personal/foto/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 🔍 VERIFICAR EN BASE DE DATOS

Para verificar que la foto se guardó correctamente:

```sql
SELECT id_usuario, foto_pers 
FROM dim_personal_cnt 
WHERE id_usuario = 1;
```

Para ver todos los usuarios con foto:

```sql
SELECT id_usuario, foto_pers 
FROM dim_personal_cnt 
WHERE foto_pers IS NOT NULL;
```

