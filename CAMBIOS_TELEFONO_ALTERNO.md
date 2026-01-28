# 📱 Cambios: Agregar Teléfono Alterno a Solicitudes de Bolsa

**Versión:** v2.2.0 (2026-01-27)
**Estado:** ✅ Implementado

---

## 📋 Resumen de Cambios

Se agregó la capacidad de almacenar y mostrar el **teléfono alterno** (celular) de los asegurados en las solicitudes de bolsa. Los datos se importan automáticamente desde la tabla `asegurados.tel_celular`.

### Archivos Modificados

#### 🗄️ Base de Datos

**1. Migración SQL - Crear Columna**
- **Archivo:** `backend/src/main/resources/db/migration/V3_1_0__agregar_telefono_alterno_solicitud_bolsa.sql`
- **Acción:**
  - Agrega columna `paciente_telefono_alterno` (VARCHAR 20) a tabla `dim_solicitud_bolsa`
  - Importa datos desde `asegurados.tel_celular` automáticamente
  - Registra estadísticas de importación

**2. Script de Verificación**
- **Archivo:** `backend/src/main/resources/db/migration/V3_1_1__verificar_datos_telefono_alterno.sql`
- **Acción:** Verifica que la importación fue correcta y muestra ejemplos

#### ☕ Backend Java

**1. Entidad JPA**
- **Archivo:** `backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java`
- **Cambios:**
  - Agregado campo: `private String pacienteTelefonoAlterno;`
  - Anotaciones: `@Column(name = "paciente_telefono_alterno", length = 20)`
  - Comentario: Teléfono alterno/celular del asegurado

**2. DTO**
- **Archivo:** `backend/src/main/java/com/styp/cenate/dto/bolsas/SolicitudBolsaDTO.java`
- **Cambios:**
  - Agregado campo: `private String pacienteTelefonoAlterno;`
  - Anotación JSON: `@JsonProperty("paciente_telefono_alterno")`
  - Documentación actualizada a v2.2.0

#### ⚛️ Frontend React

**1. Componente Solicitudes.jsx**
- **Archivo:** `frontend/src/pages/bolsas/Solicitudes.jsx`
- **Cambios:**
  - **Mapeo de datos:** Línea 175 - Agregado `telefonoAlterno: solicitud.paciente_telefono_alterno || ''`
  - **Header tabla:** Línea 921 - Nueva columna "Teléfono Alterno"
  - **Datos tabla:** Línea 953 - Celda con valor `{solicitud.telefonoAlterno || 'N/A'}`

---

## 🚀 Instrucciones de Implementación

### Paso 1: Compilar Backend

```bash
cd backend
./gradlew build
```

### Paso 2: Ejecutar Backend

```bash
cd backend
./gradlew bootRun
```

**FlyWay ejecutará automáticamente las migraciones en orden:**
1. `V3_1_0__agregar_telefono_alterno_solicitud_bolsa.sql` - Crea columna e importa datos
2. `V3_1_1__verificar_datos_telefono_alterno.sql` - Verifica resultado

### Paso 3: Verificar Migraciones en BD

```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate << 'EOF'
-- Verificar que la columna existe
\d dim_solicitud_bolsa

-- Ver estadísticas de teléfonos
SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN paciente_telefono_alterno IS NOT NULL THEN 1 END) as con_alterno,
    COUNT(CASE WHEN paciente_telefono_alterno IS NULL THEN 1 END) as sin_alterno
FROM dim_solicitud_bolsa WHERE activo = true;
EOF
```

### Paso 4: Reiniciar Frontend

```bash
cd frontend
npm start
```

---

## 📊 Datos Esperados Después de la Migración

```
Total Solicitudes: 329
Con teléfono principal: ~329
Con teléfono alterno: ~180-220 (depende de registro en asegurados)
Con ambos teléfonos: ~150-200
```

---

## 🎯 Cambios Visibles en la Interfaz

### En la Tabla de Solicitudes
- ✅ Nueva columna **"Teléfono Alterno"** visible después de "Teléfono"
- ✅ Muestra valor desde BD o "N/A" si no existe
- ✅ Compatible con búsqueda y filtros actuales

### En Modal de Detalles del Asegurado
- ✅ Ya mostraba **"Teléfono celular o fijo alterno"** (línea 993)
- ✅ Ahora también disponible en tabla principal

---

## 🔄 Flujo de Datos

```
asegurados.tel_celular
         ↓
    (Migración SQL)
         ↓
dim_solicitud_bolsa.paciente_telefono_alterno
         ↓
SolicitudBolsa.pacienteTelefonoAlterno (Java)
         ↓
SolicitudBolsaDTO.pacienteTelefonoAlterno (JSON)
         ↓
Frontend: solicitud.telefonoAlterno
         ↓
Tabla React (columna nueva)
```

---

## ✅ Pruebas Recomendadas

### 1. Verificar Base de Datos
```bash
SELECT paciente_nombre, paciente_telefono, paciente_telefono_alterno
FROM dim_solicitud_bolsa
WHERE activo = true AND paciente_telefono_alterno IS NOT NULL
LIMIT 5;
```

### 2. Probar API REST
```bash
curl -X GET "http://localhost:8080/api/bolsas/solicitudes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.[] | {paciente_nombre, paciente_telefono, paciente_telefono_alterno}' | head -20
```

### 3. Verificar en Frontend
- Ir a: `http://localhost:3000/bolsas/solicitudes`
- Buscar una solicitud
- Verificar que la columna "Teléfono Alterno" aparezca
- Verificar que muestre valores o "N/A"

---

## 📝 Documentación de Base de Datos

### Tabla: dim_solicitud_bolsa (v2.2.0)

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| `paciente_telefono` | VARCHAR(20) | YES | Teléfono principal del asegurado |
| `paciente_telefono_alterno` | VARCHAR(20) | YES | **NUEVO:** Teléfono celular/alterno del asegurado |

### Origen de Datos

- `paciente_telefono`: Importado desde formulario Excel o entrada manual
- `paciente_telefono_alterno`: Importado automáticamente desde `asegurados.tel_celular`

---

## 🔧 Campos Afectados en BD

**Total de columnas en dim_solicitud_bolsa:** 28 (antes 27)

### Secuencia de Actualización
1. V3_0_4 - Creación tabla con `paciente_telefono`
2. V3_0_5 - Limpieza (27 columnas)
3. **V3_1_0 - Agregar `paciente_telefono_alterno` (28 columnas)**
4. V3_1_1 - Verificación y validación

---

## ⚠️ Consideraciones

### Importancia de asegurados.tel_celular
- Si un asegurado NO tiene `tel_celular` registrado en tabla `asegurados`, su solicitud mostrará "N/A"
- Recomendación: Mantener tabla `asegurados` actualizada con ambos teléfonos

### Impacto en Rendimiento
- ✅ Mínimo - solo 1 columna VARCHAR adicional
- ✅ Migración optimizada con índices existentes
- ✅ SIN cambios en índices principales

### Compatibilidad
- ✅ No rompe APIs existentes
- ✅ Campo opcional en DTO
- ✅ Frontend maneja valores NULL correctamente

---

## 📚 Referencias

**Documentación relacionada:**
- Especificación Módulo Bolsas: `spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md`
- Estructura tabla: `spec/database/12_tabla_dim_solicitud_bolsa_estructura.md`
- Modelo Asegurados: `spec/database/01_models/01_modelo_usuarios.md`

---

## ✅ Checklist de Implementación

- [ ] Backend compilado sin errores (`./gradlew build`)
- [ ] Backend iniciado con Flyway (`./gradlew bootRun`)
- [ ] Migraciones ejecutadas en BD (V3_1_0, V3_1_1)
- [ ] Columna `paciente_telefono_alterno` existe en `dim_solicitud_bolsa`
- [ ] Datos importados correctamente (~150-200 registros con valores)
- [ ] Frontend compilado sin errores (`npm build`)
- [ ] Frontend iniciado (`npm start`)
- [ ] Nueva columna visible en tabla
- [ ] Valores se muestran correctamente
- [ ] Búsqueda y filtros funcionan normalmente

---

**Implementación completada:** 2026-01-27
**Versión:** v2.2.0
**Status:** ✅ Listo para testing
