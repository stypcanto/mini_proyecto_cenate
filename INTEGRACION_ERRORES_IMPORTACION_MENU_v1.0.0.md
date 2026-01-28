# 🔗 INTEGRACIÓN ERRORES DE IMPORTACIÓN - Guía Completa

> **Versión:** v1.0.0
> **Fecha:** 2026-01-28
> **Status:** ✅ Frontend y Backend Completados
> **Pendiente:** Registro en MBAC Admin Panel

---

## ✅ Lo que YA está hecho

### 1. **Frontend - Routing Actualizado**
✅ **Archivo:** `frontend/src/config/componentRegistry.js`
```javascript
'/bolsas/errores-importacion': {
  component: lazy(() => import('../pages/bolsas/ErroresImportacion')),
  requiredAction: 'ver',
},
```
- Ruta registrada después de `/bolsas/solicitudes`
- Lazy-loading configurado
- MBAC action requerida: `'ver'`

### 2. **Frontend - Icono Sidebar**
✅ **Archivo:** `frontend/src/components/DynamicSidebar.jsx`
```javascript
} else if (nombrePagina.toLowerCase().includes('error')) {
  return FileSearch;  // Icono para búsqueda de errores
}
```
- Icon: `FileSearch` (🔍)
- Automático: Si la página en MBAC contiene "error", mostrará este icono

### 3. **Backend - Componentes Completados**
✅ Controller: `AuditErrorImportacionController.java` con 6 endpoints REST
✅ Service: `AuditErrorImportacionServiceImpl.java`
✅ DTO: `AuditErrorImportacionDTO.java`
✅ Repository: `AuditErroresImportacionRepository.java`
✅ Database: `audit_errores_importacion_bolsa` tabla

---

## 🔴 Lo que FALTA - Registro en MBAC

**El página NO aparecerá en el menú hasta que la registres en el MBAC Admin Panel.**

### Paso 1: Acceder al Admin Panel
1. Login como **SUPERADMIN** o **ADMIN**
2. Ir a `/admin/mbac`
3. Buscar módulo: **"Bolsas de Pacientes"**

### Paso 2: Agregar Página al Módulo

En el MBAC Admin Panel (MBACControl.jsx), agrega una nueva página con estos datos:

| Campo | Valor |
|-------|-------|
| **Nombre** | `Errores de Importación` |
| **Descripción** | Visualiza y analiza errores registrados durante importación de Excel |
| **Ruta** | `/bolsas/errores-importacion` |
| **Módulo** | Bolsas de Pacientes |
| **Icono** | `FileSearch` |
| **Orden** | **3** (después de Solicitudes que es orden 2) |
| **Activo** | ✅ Sí |

### Paso 3: Asignar Permisos (Opcional)

**Permisos por rol recomendados:**
- **SUPERADMIN**: Acceso completo (todos los permisos)
- **ADMIN**: `ver`, `editar`, `eliminar`
- **COORDINADOR_RED**: `ver` solamente
- **GESTOR_CITAS**: `ver` solamente

---

## 🗄️ Tabla MBAC - Inserción Manual (Alternativa)

Si prefieres usar SQL directamente en lugar del Admin Panel:

```sql
-- 1. Insertar la página en dim_paginas_modulo
INSERT INTO dim_paginas_modulo (
  id_modulo,           -- ID de "Bolsas de Pacientes"
  nombre,
  descripcion,
  ruta,
  icono,
  orden,
  activo,
  fecha_creacion
) VALUES (
  (SELECT id_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Bolsas de Pacientes'),
  'Errores de Importación',
  'Visualiza y analiza errores registrados durante importación de Excel',
  '/bolsas/errores-importacion',
  'FileSearch',
  3,
  true,
  CURRENT_TIMESTAMP
);

-- 2. Obtener el ID de la página recién creada (guardar para paso 3)
SELECT id_pagina FROM dim_paginas_modulo
WHERE ruta = '/bolsas/errores-importacion'
AND id_modulo = (SELECT id_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Bolsas de Pacientes');

-- 3. Asignar permisos a roles (repetir para cada rol)
INSERT INTO dim_permisos_paginas (
  id_pagina,           -- Del SELECT anterior
  id_rol,
  puede_ver,
  puede_editar,
  puede_eliminar,
  puede_crear,
  fecha_asignacion
) VALUES (
  (SELECT id_pagina FROM dim_paginas_modulo WHERE ruta = '/bolsas/errores-importacion'),
  (SELECT id_rol FROM dim_roles WHERE nombre_rol = 'SUPERADMIN'),
  true, true, true, true,
  CURRENT_TIMESTAMP
);

-- Para ADMIN
INSERT INTO dim_permisos_paginas (
  id_pagina,
  id_rol,
  puede_ver,
  puede_editar,
  puede_eliminar,
  puede_crear,
  fecha_asignacion
) VALUES (
  (SELECT id_pagina FROM dim_paginas_modulo WHERE ruta = '/bolsas/errores-importacion'),
  (SELECT id_rol FROM dim_roles WHERE nombre_rol = 'ADMIN'),
  true, false, false, false,
  CURRENT_TIMESTAMP
);
```

---

## 🧪 Verificación Después de Registrar

### 1. **Frontend - Verificar Ruta**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/bolsas/errores-importacion
```
Debe cargar la página sin errores 404

### 2. **Backend - Verificar Endpoint**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/bolsas/errores-importacion
```
Respuesta esperada:
```json
[
  {
    "id_error": 1,
    "numeroFila": 23,
    "pacienteDni": "12345678",
    "tipoError": "DUPLICADO",
    ...
  }
]
```

### 3. **Sidebar - Verificar Menú**
1. Login como usuario con permisos para Bolsas
2. Expandir "Bolsas de Pacientes" en sidebar
3. Debe ver 5 opciones:
   - ⬆️ Cargar desde Excel
   - ✅ Solicitudes
   - 🔍 **Errores de Importación** ← NUEVO
   - 📊 Estadísticas de Bolsas
   - 📁 Historial de Bolsas

---

## 📊 Status de Implementación

| Componente | Status | Archivo |
|-----------|--------|---------|
| React Component | ✅ Completo | `frontend/src/pages/bolsas/ErroresImportacion.jsx` |
| Service Frontend | ✅ Completo | `frontend/src/services/bolsasService.js` |
| Route Registry | ✅ Completo | `frontend/src/config/componentRegistry.js` |
| Sidebar Icon | ✅ Completo | `frontend/src/components/DynamicSidebar.jsx` |
| Controller | ✅ Completo | `backend/src/main/java/.../AuditErrorImportacionController.java` |
| Service | ✅ Completo | `backend/src/main/java/.../AuditErrorImportacionServiceImpl.java` |
| DTO | ✅ Completo | `backend/src/main/java/.../AuditErrorImportacionDTO.java` |
| Repository | ✅ Completo | `backend/src/main/java/.../AuditErroresImportacionRepository.java` |
| Database Table | ✅ Completo | `audit_errores_importacion_bolsa` |
| **MBAC Registration** | 🔴 **PENDIENTE** | Admin Panel MBACControl.jsx |

---

## 🚀 Próximos Pasos

1. **Ejecutar SQL de base de datos** (si no lo has hecho):
   ```bash
   PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate < spec/database/06_scripts/07_crear_tabla_audit_errores_importacion_bolsa.sql
   ```

2. **Compilar Backend**:
   ```bash
   cd backend
   ./gradlew clean build
   ./gradlew bootRun
   ```

3. **Reiniciar Frontend**:
   ```bash
   cd frontend
   npm start
   ```

4. **Registrar página en MBAC** (Admin Panel o SQL):
   - Opción A: Usar Admin Panel en `/admin/mbac`
   - Opción B: Ejecutar scripts SQL anteriores

5. **Verificar en Sidebar**:
   - Login y expandir "Bolsas de Pacientes"
   - Debe aparecer "Errores de Importación" con icono 🔍

---

## 🔗 Documentación Relacionada

- **Especificación completa:** `15_ERRORES_IMPORTACION_v2.1.0.md`
- **Implementación backend:** `IMPLEMENTACION_ERRORES_IMPORTACION_BD_v2.1.0.md`
- **Documentación Bolsas:** `00_INDICE_MAESTRO_MODULO_BOLSAS.md`

---

## 📞 Soporte

Si la página no aparece después de registrarla en MBAC:

1. **Limpiar caché frontend**:
   ```bash
   # Ctrl+Shift+Del (Chrome) o Cmd+Shift+Delete (Mac)
   # Luego: F5 para refrescar
   ```

2. **Verificar permisos de usuario**:
   ```sql
   SELECT * FROM dim_permisos_paginas
   WHERE id_pagina = (
     SELECT id_pagina FROM dim_paginas_modulo
     WHERE ruta = '/bolsas/errores-importacion'
   );
   ```

3. **Verificar tabla de auditoría**:
   ```sql
   SELECT * FROM audit_errores_importacion_bolsa LIMIT 10;
   ```

---

**Status:** ✅ Frontend Listo | ✅ Backend Listo | 🔴 MBAC Pendiente

**Desarrollador:** Ing. Styp Canto Rondón
**Versión:** v2.1.0 Módulo Bolsas
