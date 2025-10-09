# 🚀 IMPLEMENTACIÓN RÁPIDA - GESTIÓN DE PERSONAL

## ⚡ COMANDOS RÁPIDOS DE IMPLEMENTACIÓN

### 1️⃣ Ejecutar Script SQL (Verificación y Datos de Prueba)
```bash
# Conectarse a PostgreSQL y ejecutar el script
psql -U postgres -d maestro_cenate -f backend/sql/verificacion_y_datos_prueba.sql
```

### 2️⃣ Compilar y Reiniciar Backend
```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend

# Compilar
./gradlew clean build

# Iniciar servidor
./gradlew bootRun
```

### 3️⃣ Reiniciar Frontend
```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend

# Instalar dependencias (si es necesario)
npm install

# Iniciar servidor de desarrollo
npm start
```

### 4️⃣ Acceder a la Aplicación
```
http://localhost:3000/admin/users
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Backend ✅
- [ ] Archivos de **Model** creados (PersonalCnt.java, TipoDocumento.java, Area.java, RegimenLaboral.java)
- [ ] Archivos de **Repository** creados (4 archivos)
- [ ] Archivos de **Service** creados (4 archivos)
- [ ] Archivos de **DTO** creados (5 archivos)
- [ ] Archivos de **Controller** creados (4 archivos)
- [ ] Backend compilado sin errores
- [ ] Backend iniciado correctamente
- [ ] APIs responden en `http://localhost:8080/api/`

### Frontend ✅
- [ ] Archivo **AdminUsersManagement.jsx** creado
- [ ] Archivo **App.js** actualizado con la nueva ruta
- [ ] Frontend compilado sin errores
- [ ] Frontend iniciado correctamente
- [ ] Página carga en `http://localhost:3000/admin/users`

### Base de Datos ✅
- [ ] Script SQL ejecutado
- [ ] Datos de prueba insertados
- [ ] Relaciones FK funcionando correctamente

---

## 🎯 ARCHIVOS CREADOS

### Backend (Java/Spring Boot)
```
backend/src/main/java/styp/com/cenate/

📁 model/
   ├── PersonalCnt.java ✅
   ├── TipoDocumento.java ✅
   ├── Area.java ✅
   └── RegimenLaboral.java ✅

📁 repository/
   ├── PersonalCntRepository.java ✅
   ├── TipoDocumentoRepository.java ✅
   ├── AreaRepository.java ✅
   └── RegimenLaboralRepository.java ✅

📁 service/
   ├── PersonalCntService.java ✅
   ├── TipoDocumentoService.java ✅
   ├── AreaService.java ✅
   └── RegimenLaboralService.java ✅

📁 dto/
   ├── PersonalCntRequest.java ✅
   ├── PersonalCntResponse.java ✅
   ├── TipoDocumentoResponse.java ✅
   ├── AreaResponse.java ✅
   └── RegimenLaboralResponse.java ✅

📁 api/
   ├── PersonalCntController.java ✅
   ├── TipoDocumentoController.java ✅
   ├── AreaController.java ✅
   └── RegimenLaboralController.java ✅
```

### Frontend (React)
```
frontend/src/
   ├── pages/admin/AdminUsersManagement.jsx ✅
   └── App.js (actualizado) ✅
```

### Documentación y Scripts
```
📁 cenate/
   ├── GUIA_IMPLEMENTACION_GESTION_PERSONAL.md ✅
   ├── IMPLEMENTACION_RAPIDA.md ✅ (este archivo)
   └── backend/sql/verificacion_y_datos_prueba.sql ✅
```

---

## 🧪 PRUEBA RÁPIDA DE API

### Obtener Token JWT
```bash
# Primero hacer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"tu_password"}'

# Copiar el token de la respuesta
```

### Probar Endpoints (reemplaza YOUR_TOKEN)
```bash
# 1. Ver todos los tipos de documento
curl -X GET "http://localhost:8080/api/tipos-documento" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Ver todas las áreas
curl -X GET "http://localhost:8080/api/areas" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Ver regímenes laborales
curl -X GET "http://localhost:8080/api/regimenes-laborales" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Ver todo el personal
curl -X GET "http://localhost:8080/api/personal" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Crear nuevo personal (ejemplo)
curl -X POST "http://localhost:8080/api/personal" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idTipDoc": 1,
    "numDocPers": "77889900",
    "perPers": "JOSE MANUEL CASTRO LEON",
    "statPers": "A",
    "fechNaciPers": "1991-06-15",
    "genPers": "M",
    "movilPers": "932109876",
    "emailPers": "jose.castro@personal.com",
    "emailCorpPers": "jcastro@cenate.gob.pe",
    "idRegLab": 1,
    "idArea": 2
  }'
```

---

## 🐛 SOLUCIÓN RÁPIDA DE PROBLEMAS

### Error: "Cannot find module"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Error: "Port 8080 already in use"
```bash
# Encontrar el proceso usando el puerto
lsof -i :8080

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en application.properties
```

### Error: "Authentication failed" o 403
```bash
# Verificar que tu usuario tiene rol ADMIN o SUPERADMIN
psql -U postgres -d maestro_cenate

# En psql:
SELECT u.name_user, r.desc_rol 
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'scantor';

# Si no tiene rol ADMIN, asignar:
INSERT INTO usuarios_roles (id_user, id_rol) 
VALUES (
    (SELECT id_user FROM dim_usuarios WHERE name_user = 'scantor'),
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'ADMIN')
);
```

### La tabla se muestra vacía
```bash
# Verificar que hay datos en PostgreSQL
psql -U postgres -d maestro_cenate -c "SELECT COUNT(*) FROM dim_personal_cnt;"

# Si retorna 0, ejecutar el script SQL de datos de prueba
psql -U postgres -d maestro_cenate -f backend/sql/verificacion_y_datos_prueba.sql
```

---

## 📊 ESTRUCTURA DE TABS EN LA UI

Una vez que abras `http://localhost:3000/admin/users`, verás 5 pestañas:

| # | Tab | Descripción | CRUD |
|---|-----|-------------|------|
| 1 | **Usuarios** | Usuarios del sistema | ❌ Solo lectura |
| 2 | **Personal** | Personal CNT completo | ✅ Crear/Editar/Eliminar |
| 3 | **Tipos Documento** | DNI, C.E, PASS, RUC | ✅ Crear/Editar/Eliminar |
| 4 | **Áreas** | Consulta Externa, TeleUrgencia, etc. | ✅ Crear/Editar/Eliminar |
| 5 | **Regímenes Laborales** | CAS, 728, LOCADOR | ✅ Crear/Editar/Eliminar |

---

## 🎨 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Visualización
- Lista completa de registros en tablas
- Búsqueda en tiempo real
- Badges de estado (Activo/Inactivo)
- Información detallada con relaciones FK
- Iconos modernos con Lucide React

### ✅ Creación
- Modal con formulario completo
- Validaciones de campos requeridos
- Selects para relaciones FK (Área, Régimen, Tipo Doc)
- Formato de fecha tipo input date
- Select de género (M/F)

### ✅ Edición
- Click en icono de lápiz
- Pre-carga de datos en el formulario
- Actualización de relaciones FK
- Mantiene valores anteriores

### ✅ Eliminación
- Click en icono de basura
- Confirmación antes de eliminar
- Eliminación permanente (sin soft delete por ahora)

---

## 🎯 DATOS DE PRUEBA INSERTADOS

Si ejecutaste el script SQL, tendrás 6 registros de prueba:

| ID | Nombre | Documento | Área | Régimen | Estado |
|----|--------|-----------|------|---------|--------|
| 1 | DR. JUAN CARLOS PEREZ | DNI 12345678 | Consulta Externa | 728 | Activo |
| 2 | LIC. MARIA ELENA RODRIGUEZ | DNI 87654321 | TeleUrgencia | 728 | Activo |
| 3 | TEC. PEDRO SANCHEZ | DNI 45678912 | Tele Apoyo | CAS | Activo |
| 4 | DRA. ANA FERNANDEZ | DNI 11223344 | Consulta Externa | 728 | Inactivo |
| 5 | CARLOS RAMIREZ | DNI 99887766 | TeleUrgencia | Locador | Activo |
| 6 | LAURA GONZALEZ | CE 001234567 | Consulta Externa | CAS | Activo |

---

## 📞 CONTACTO Y SOPORTE

Para más información detallada, consulta:
- **Guía Completa:** `GUIA_IMPLEMENTACION_GESTION_PERSONAL.md`
- **Script SQL:** `backend/sql/verificacion_y_datos_prueba.sql`

---

## ✅ RESUMEN FINAL

### Lo que se implementó:
1. ✅ **4 Entidades JPA** con relaciones
2. ✅ **4 Repositorios** con consultas personalizadas
3. ✅ **4 Servicios** con lógica de negocio
4. ✅ **5 DTOs** para Request/Response
5. ✅ **4 Controladores REST** con seguridad JWT
6. ✅ **1 Componente React** con 5 tabs
7. ✅ **CRUD completo** para 4 tablas maestras
8. ✅ **Datos de prueba** con 6 registros de personal

### Tecnologías utilizadas:
- ☕ **Java 17** con Spring Boot 3
- 🗄️ **PostgreSQL** con JPA/Hibernate
- ⚛️ **React 18** con Hooks
- 🎨 **Tailwind CSS** para estilos
- 🔐 **JWT** para autenticación
- 🔌 **REST API** con CORS configurado

---

## 🚀 ¡LISTO PARA USAR!

Ahora tienes un sistema completo de gestión de personal. Solo ejecuta los 3 comandos principales:

```bash
# 1. SQL
psql -U postgres -d maestro_cenate -f backend/sql/verificacion_y_datos_prueba.sql

# 2. Backend
cd backend && ./gradlew bootRun

# 3. Frontend (en otra terminal)
cd frontend && npm start
```

**¡Disfruta de tu nuevo sistema de gestión!** 🎉

---

**Última actualización:** $(date)  
**Versión:** 1.0
