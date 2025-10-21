# ✅ CORRECCIÓN: CARGA DE FOTOS DE PERFIL

## 🔧 Problema Identificado

El sistema no podía cargar fotos de perfil porque:
1. **No existía el endpoint POST** `/api/personal/{id}/foto` para subir fotos
2. El frontend estaba intentando usar ese endpoint pero el backend no lo tenía implementado
3. La foto no se mostraba en el modal de edición

## ✅ Solución Implementada

### Backend - PersonalTotalController.java

He agregado dos endpoints nuevos al controlador:

#### 1. **POST `/api/personal/{id}/foto`** - Subir Foto
```java
@PostMapping("/{id}/foto")
@PreAuthorize("hasAnyAuthority('EDITAR_PERSONAL','CREAR_PERSONAL','SUPERADMIN')")
public ResponseEntity<Map<String, String>> uploadFoto(
        @PathVariable Long id,
        @RequestParam("foto") MultipartFile file)
```

**Funcionalidades:**
- ✅ Valida que el archivo no esté vacío
- ✅ Valida que sea una imagen (content-type image/*)
- ✅ Valida tamaño máximo de 5MB
- ✅ Genera nombre único para cada archivo: `user_{id}_{UUID}.{extension}`
- ✅ Guarda el archivo en el disco en la carpeta configurada
- ✅ Actualiza la base de datos (tablas `dim_personal_cnt` o `dim_personal_externo`)
- ✅ Retorna información del archivo guardado

**Respuesta Exitosa:**
```json
{
  "message": "Foto subida correctamente",
  "fileName": "user_123_abc-def-ghi.jpg",
  "url": "/api/personal/foto/user_123_abc-def-ghi.jpg"
}
```

#### 2. **GET `/api/personal/foto/{fileName}`** - Obtener Foto
```java
@GetMapping("/foto/{fileName}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<Resource> getFoto(@PathVariable String fileName)
```

**Funcionalidades:**
- ✅ Busca el archivo en el disco
- ✅ Retorna el archivo con el content-type correcto
- ✅ Añade cache headers (7 días) para optimizar rendimiento
- ✅ Maneja errores si el archivo no existe

---

## 📝 Cambios en el Código Backend

### Ubicación del Archivo
```
/backend/src/main/java/com/styp/cenate/api/area/PersonalTotalController.java
```

### Imports Agregados
```java
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.nio.file.*;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
```

### Configuración de Directorio de Uploads
```java
@Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
private String uploadDir;

@PostConstruct
private void initUploadDir() throws IOException {
    Path path = Paths.get(uploadDir);
    if (!Files.exists(path)) {
        Files.createDirectories(path);
        log.info("📂 Carpeta de uploads creada en: {}", uploadDir);
    }
}
```

### Actualización de Base de Datos
El endpoint actualiza automáticamente la columna de foto en la tabla correspondiente:

**Para Personal CNT:**
```sql
UPDATE dim_personal_cnt 
SET foto_pers = ? 
WHERE id_usuario = ?
```

**Para Personal Externo:**
```sql
UPDATE dim_personal_externo 
SET foto_ext = ? 
WHERE id_user = ?
```

---

## 🎨 Frontend - Cómo Funciona Ahora

### En el Modal de Edición

1. **Cargar Foto Actual:**
   - Al abrir el modal de edición, se carga la foto desde `/api/personal/foto/{fileName}`
   - Si no hay foto, se muestra la inicial del usuario

2. **Cambiar Foto:**
   - Click en el icono de cámara
   - Seleccionar imagen (validación de tamaño y tipo en frontend)
   - Vista previa instantánea
   - Al guardar, se sube automáticamente

3. **Subir Foto:**
   ```javascript
   const formDataPhoto = new FormData();
   formDataPhoto.append('foto', photoFile);
   
   await fetch(`/api/personal/${user.id_user}/foto`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
     },
     body: formDataPhoto
   });
   ```

### En el Modal de Creación

1. **Seleccionar Foto (Opcional):**
   - Click en el icono de cámara
   - Vista previa antes de crear el usuario

2. **Proceso de Creación:**
   - Primero se crea el usuario
   - Luego se sube la foto usando el ID del usuario recién creado

---

## 🔐 Seguridad y Validaciones

### Backend
- ✅ Autenticación requerida (JWT Token)
- ✅ Permisos específicos (`EDITAR_PERSONAL`, `CREAR_PERSONAL`, `SUPERADMIN`)
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Validación de tamaño (máximo 5MB)
- ✅ Nombres de archivo únicos con UUID
- ✅ Sanitización de nombres de archivo

### Frontend
- ✅ Validación de tamaño antes de enviar
- ✅ Validación de tipo de archivo
- ✅ Mensajes de error descriptivos
- ✅ Token JWT en todas las peticiones

---

## 📂 Estructura de Archivos

### Ubicación de Fotos en el Servidor
```
{user.home}/cenate-uploads/personal/
├── user_1_a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6.jpg
├── user_2_b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7.png
└── user_3_c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8.jpeg
```

### Configuración en application.properties
```properties
# Directorio de uploads (opcional, por defecto usa user.home)
app.upload.dir=/var/cenate/uploads/personal

# Tamaño máximo de archivos (opcional)
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

---

## 🧪 Cómo Probar

### 1. Con Postman

**Subir Foto:**
```
POST http://localhost:8080/api/personal/1/foto
Headers:
  Authorization: Bearer {tu_token}
Body:
  form-data
    Key: foto
    Value: [Seleccionar archivo de imagen]
```

**Obtener Foto:**
```
GET http://localhost:8080/api/personal/foto/user_1_abc123.jpg
Headers:
  Authorization: Bearer {tu_token}
```

### 2. Desde la Interfaz

1. **Editar Usuario:**
   - Click en el botón de editar (lápiz verde)
   - Click en el icono de cámara
   - Seleccionar imagen
   - Ver vista previa
   - Click en "Guardar Cambios"

2. **Crear Usuario:**
   - Click en "Crear Usuario"
   - Llenar formulario
   - (Opcional) Click en icono de cámara para agregar foto
   - Click en "Crear Usuario"

---

## 🐛 Troubleshooting

### Problema: "Error al subir la foto"

**Posibles causas:**
1. El directorio de uploads no tiene permisos de escritura
2. El archivo supera los 5MB
3. El archivo no es una imagen válida
4. No hay espacio en disco

**Solución:**
```bash
# Verificar permisos
ls -la ~/cenate-uploads/personal/

# Dar permisos
chmod 755 ~/cenate-uploads/personal/

# Verificar espacio en disco
df -h
```

### Problema: "Foto no se muestra"

**Posibles causas:**
1. El archivo no existe en el servidor
2. El nombre del archivo en la BD no coincide con el archivo físico
3. Permisos de lectura del archivo

**Solución:**
```bash
# Verificar que el archivo existe
ls ~/cenate-uploads/personal/

# Verificar en la base de datos
SELECT id_pers, foto_pers FROM dim_personal_cnt WHERE id_usuario = 1;
```

### Problema: "No se puede subir foto en Crear Usuario"

**Causa:**
El usuario aún no tiene ID hasta que se crea

**Solución:**
Ya está implementado: primero se crea el usuario, luego se sube la foto con el ID obtenido

---

## 📊 Logs para Debugging

El sistema genera logs descriptivos:

```
📸 Subiendo foto para usuario ID: 123
✅ Foto guardada exitosamente: user_123_abc-def.jpg
🖼️ Obteniendo foto: user_123_abc-def.jpg
⚠️ Foto no encontrada: user_999_xyz.jpg
❌ Error al subir foto: Permission denied
```

---

## ✨ Características Adicionales

### Cache de Imágenes
Las fotos se cachean por 7 días en el navegador para mejorar el rendimiento:
```java
.cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
```

### Nombres de Archivo Únicos
Se genera un UUID para evitar conflictos:
```
user_{userId}_{UUID}.{extension}
```

### Soporte Multi-formato
Soporta todos los formatos de imagen comunes:
- JPG/JPEG
- PNG
- GIF
- WEBP
- BMP

---

## 📌 Notas Importantes

1. **Las fotos se guardan en el servidor**, no en la base de datos
2. **Solo se guarda el nombre del archivo** en la BD (columnas `foto_pers` o `foto_ext`)
3. **El directorio de uploads debe tener permisos** de lectura/escritura
4. **Las fotos persisten** incluso si se reinicia la aplicación
5. **No hay límite de fotos** por usuario (se sobrescribe la anterior en la BD, pero el archivo viejo queda en disco)

---

## 🚀 Próximas Mejoras Sugeridas

1. **Eliminar fotos antiguas** cuando se sube una nueva
2. **Redimensionar automáticamente** las imágenes (thumbnails)
3. **Comprimir imágenes** grandes automáticamente
4. **Subir a cloud storage** (AWS S3, Google Cloud Storage)
5. **Agregar marca de agua** a las fotos
6. **Soporte para recortar** imagen antes de subir

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs del backend
2. Verifica la consola del navegador (F12)
3. Verifica los permisos del directorio de uploads
4. Verifica que el token JWT sea válido

---

**Fecha de Implementación:** 20 de Octubre, 2025  
**Versión:** 2.0  
**Archivo Modificado:** `PersonalTotalController.java`  
**Desarrollado para:** CENATE - Centro Nacional de Telemedicina

---

## ✅ RESUMEN

**Lo que funcionaba antes:**
- Ver usuarios ✅
- Editar datos de texto ✅
- Eliminar usuarios ✅

**Lo que se agregó ahora:**
- ✨ **Subir fotos de perfil** (POST endpoint)
- ✨ **Obtener fotos de perfil** (GET endpoint)
- ✨ **Validaciones de seguridad**
- ✨ **Vista previa de fotos**
- ✨ **Cache de imágenes**
- ✨ **Logs descriptivos**

**Endpoints Nuevos:**
- `POST /api/personal/{id}/foto` - Subir foto
- `GET /api/personal/foto/{fileName}` - Obtener foto

**¡Ahora el sistema está completamente funcional para gestión de fotos de perfil!** 🎉
