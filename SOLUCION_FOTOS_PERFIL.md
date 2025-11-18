# 📸 Solución: Fotos de Usuario No Se Muestran en Producción

## 🔍 Problema Identificado

Las fotos de perfil de los usuarios **no se muestran en producción** (Docker) pero **sí funcionaban en desarrollo**. Esto ocurre porque:

1. **En desarrollo**: Las fotos estaban almacenadas localmente en tu máquina
2. **En producción (Docker)**: Los contenedores no tienen acceso a esas fotos porque:
   - No hay un volumen montado para acceder a las imágenes
   - No existe un endpoint del backend que sirva las fotos
   - Las rutas de las fotos en la base de datos son inválidas para el contenedor

## ✅ Solución Implementada

He implementado una solución completa con 3 componentes:

### 1️⃣ Controlador Backend para Servir Fotos

**Archivo**: `/backend/src/main/java/com/styp/cenate/api/usuario/FotoPerfilController.java`

Este controlador:
- ✅ Sirve fotos desde `/api/personal/foto/{filename}`
- ✅ Devuelve imagen por defecto si la foto no existe
- ✅ Ya está configurado como endpoint público en `SecurityConfig`

### 2️⃣ Volumen Docker para Persistir Fotos

**Archivo**: `docker-compose.yml`

Agregué un volumen para almacenar las fotos:
```yaml
volumes:
  - ./uploads/fotos:/app/uploads/fotos
```

### 3️⃣ Configuración en Application Properties

**Archivo**: `backend/src/main/resources/application.properties`

```properties
app.upload.foto.dir=/app/uploads/fotos
app.upload.foto.url=/api/personal/foto
```

## 🚀 Pasos para Activar la Solución

### Paso 1: Crear el directorio de fotos

```bash
# Desde la raíz del proyecto
cd /Users/cenate2/PortalWeb/Intranet
mkdir -p uploads/fotos
chmod 755 uploads/fotos
```

### Paso 2: Agregar una imagen por defecto

Descarga o crea una imagen `default-profile.png` y colócala en:
```bash
cp /ruta/tu/imagen.png uploads/fotos/default-profile.png
```

### Paso 3: Reconstruir y levantar Docker

```bash
# Detener contenedores
docker compose down

# Reconstruir (solo si hiciste cambios en el código)
docker compose build backend --no-cache

# Levantar todo
docker compose up -d

# Ver logs
docker compose logs -f backend
```

### Paso 4: Verificar que funciona

```bash
# Probar el endpoint de fotos
curl http://localhost:8080/api/personal/foto/default-profile.png

# Deberías ver la imagen o un mensaje de error si no existe
```

## 📊 Cómo Usar las Fotos de Perfil

### Opción A: Guardar Fotos en la Base de Datos

Si las rutas de las fotos en `dim_personal_cnt.foto_pers` son **solo el nombre del archivo**:

```sql
-- Ejemplo de cómo deben estar guardadas en la BD
UPDATE dim_personal_cnt 
SET foto_pers = 'juan_perez.jpg' 
WHERE id_pers = 1;
```

El backend automáticamente servirá: `http://localhost:8080/api/personal/foto/juan_perez.jpg`

### Opción B: Subir Fotos Manualmente

```bash
# Copia las fotos de tu desarrollo al directorio de uploads
cp /ruta/fotos/desarrollo/* uploads/fotos/

# O desde otro servidor
scp usuario@servidor:/ruta/fotos/* uploads/fotos/
```

### Opción C: Implementar Upload de Fotos (Futuro)

Si quieres que los usuarios suban sus fotos desde el frontend, necesitarás:

1. **Controlador de Upload**:
```java
@PostMapping("/api/personal/foto/upload")
public ResponseEntity<String> uploadFoto(
    @RequestParam("file") MultipartFile file,
    @RequestParam("idPersonal") Long idPersonal
) {
    // Guardar archivo en /app/uploads/fotos/
    // Actualizar dim_personal_cnt.foto_pers
    return ResponseEntity.ok("Foto subida exitosamente");
}
```

2. **Frontend Component**:
```jsx
<input 
  type="file" 
  accept="image/*" 
  onChange={handleFileUpload}
/>
```

## 🔧 Solución de Problemas

### Problema 1: Las fotos no se muestran

```bash
# Verificar que el directorio existe
ls -la uploads/fotos/

# Verificar permisos
chmod -R 755 uploads/fotos/

# Ver logs del backend
docker compose logs backend | grep "foto"
```

### Problema 2: Error 404 en /api/personal/foto/

```bash
# Verificar que el controlador está registrado
curl http://localhost:8080/api/personal/foto/test.jpg

# Ver logs
docker compose logs backend
```

### Problema 3: El volumen no se monta correctamente

```bash
# Verificar el volumen en Docker
docker inspect cenate-backend | grep -A 10 Mounts

# Debería mostrar algo como:
# "Source": "/Users/cenate2/PortalWeb/Intranet/uploads/fotos",
# "Destination": "/app/uploads/fotos"
```

## 📝 Actualizar el Frontend

Para mostrar las fotos en el frontend, actualiza tus componentes:

```jsx
// En UsersCards.jsx o AvatarCard.jsx
const photoUrl = user.foto_url 
  ? `${process.env.REACT_APP_API_URL}/personal/foto/${user.foto_url}`
  : '/images/default-profile.png';

<img src={photoUrl} alt={user.nombre_completo} />
```

## 🎯 Migración de Fotos Existentes

Si ya tienes fotos en desarrollo:

```bash
# 1. Exportar rutas de fotos de la BD
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c \
  "SELECT id_pers, foto_pers FROM dim_personal_cnt WHERE foto_pers IS NOT NULL;"

# 2. Copiar fotos al nuevo directorio
cp /ruta/desarrollo/fotos/* uploads/fotos/

# 3. Actualizar BD para usar solo nombres de archivo (sin rutas completas)
UPDATE dim_personal_cnt 
SET foto_pers = REGEXP_REPLACE(foto_pers, '.*/(.+)$', '\1')
WHERE foto_pers IS NOT NULL;
```

## ✨ Próximos Pasos Recomendados

1. ✅ **Implementar upload de fotos**: Permitir que usuarios suban sus fotos
2. ✅ **Optimización de imágenes**: Redimensionar automáticamente a 200x200px
3. ✅ **CDN o almacenamiento en nube**: Para mejor rendimiento (S3, Cloudinary, etc.)
4. ✅ **Validación de archivos**: Solo permitir jpg, png, webp
5. ✅ **Límite de tamaño**: Máximo 2MB por foto

## 📞 Soporte

Si tienes problemas, verifica:
- Logs del backend: `docker compose logs -f backend`
- Permisos del directorio: `ls -la uploads/fotos/`
- Que el endpoint esté accesible: `curl http://localhost:8080/api/personal/foto/test.jpg`
