# 📊 SISTEMA DE AUDITORÍA Y REVISIÓN DE DUPLICADOS POTENCIALES

**Fecha Implementación:** 2026-01-25 23:58
**Base de Datos:** maestro_cenate
**Tabla afectada:** asegurados (443,228 registros marcados)
**Status:** ✅ COMPLETADO

---

## 🎯 DESCRIPCIÓN DEL SISTEMA

Sistema completo para identificar, marcar y revisar registros duplicados (DNI conflictivos) en la tabla de asegurados.

**Problema:** Encontrados 443,228 registros con DNI de 7 caracteres que coinciden con DNI de 8 caracteres existentes pero con DIFERENTES NOMBRES.

**Solución:** Marcar como "duplicado_potencial" + crear interfaz de revisión completa.

---

## 📋 COMPONENTES IMPLEMENTADOS

### 1. Base de Datos

#### Columna Nueva
```sql
ALTER TABLE asegurados
ADD COLUMN duplicado_potencial BOOLEAN DEFAULT false;
```

#### Tabla de Auditoría
```sql
CREATE TABLE audit_duplicados_asegurados (
  audit_id SERIAL PRIMARY KEY,
  pk_asegurado_7 VARCHAR(255),
  doc_paciente VARCHAR(255) UNIQUE NOT NULL,
  paciente_7 VARCHAR(255),
  pk_asegurado_8 VARCHAR(255),
  paciente_8 VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'PENDIENTE_REVISION',
  marcado_at TIMESTAMP DEFAULT NOW(),
  notas TEXT
);
```

**Registros:** 443,228 duplicados registrados
**Índices:** 3 (doc_paciente, pk_asegurado_7, estado)

---

### 2. API REST - Backend (Java/Spring Boot)

#### Endpoint 1: Listar Duplicados
```
GET /api/asegurados/duplicados/potenciales?page=0&size=25&ordenar=dni
```

**Parámetros:**
- `page` (int, default=0): Página de resultados
- `size` (int, default=25): Registros por página
- `ordenar` (string, default=doc_paciente): Campo para ordenar
  - `dni` → Ordenar por doc_paciente
  - `nombre` → Ordenar por paciente
  - `fecha` → Ordenar por fecnacimpaciente

**Respuesta:**
```json
{
  "content": [
    {
      "pkAsegurado": "1000023",
      "docPaciente": "01000023",
      "paciente": "JARAMILLO MONTEJO SARA",
      "edad": 65,
      "nombreIpress": "CENTRO DE SALUD...",
      "vigencia": true,
      "duplicadoPotencial": true,
      "sexo": "F",
      "telCelular": "999111222",
      "tipoSeguro": "...",
      "periodo": "202601",
      "fecnacimpaciente": "1958-12-15"
    }
  ],
  "totalElements": 443228,
  "totalPages": 17729,
  "size": 25,
  "number": 0,
  "numberOfElements": 25,
  "first": true,
  "last": false,
  "empty": false
}
```

**Características:**
- ✅ Paginación completa
- ✅ Ordenamiento flexible
- ✅ Información del asegurado
- ✅ Cálculo de edad automático
- ✅ Datos IPRESS incluidos

---

#### Endpoint 2: Detalle de Duplicado
```
GET /api/asegurados/duplicado/{docPaciente}
```

**Ejemplo:**
```
GET /api/asegurados/duplicado/01234567
```

**Respuesta:**
```json
{
  "docPaciente": "01234567",
  "pkAsegurado7": "1234567",
  "paciente7": "ALVAREZ LOPEZ LERDRY JOSUE",
  "pkAsegurado8": "01234567",
  "paciente8": "MORALES SAAVEDRA DENIS TEODOLFO",
  "estado": "PENDIENTE_REVISION",
  "marcadoAt": "2026-01-25T23:55:00.000Z"
}
```

**Información proporcionada:**
- Registro de 7 caracteres (MARCADO)
- Registro de 8 caracteres (PRIORITARIO)
- Estado de revisión
- Fecha de marcación

---

### 3. Frontend - React Component

#### Página: RevisarDuplicados.jsx

**Ubicación:** `/frontend/src/pages/asegurados/RevisarDuplicados.jsx`

**Funcionalidades:**

1. **Tabla de Duplicados**
   - Lista completa con 443,228 registros
   - Columnas: DNI, Nombre, Edad, IPRESS, Vigencia, Acciones
   - Paginación: 25 registros por página
   - Hover effects para mejor UX

2. **Controles de Búsqueda**
   - Búsqueda en tiempo real (nombre o DNI)
   - Filtrado instantáneo en cliente
   - Input con icono de búsqueda

3. **Ordenamiento**
   - Por DNI (doc_paciente)
   - Por Nombre (paciente)
   - Por Fecha (fecnacimpaciente)
   - Se aplica en servidor (eficiente)

4. **Exportación**
   - Botón "Exportar CSV"
   - Incluye: DNI, Nombre, Edad, IPRESS, Vigencia, Fecha Marcado
   - Archivo con nombre dinámico

5. **Modal de Detalles**
   - Comparación lado a lado
   - Registro de 7 caracteres (MARCADO) en naranja
   - Registro de 8 caracteres (PRIORITARIO) en verde
   - Estado y fecha de marcación
   - Instrucciones para próximos pasos

**Design:**
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Gradient background
- ✅ Icons de Lucide React
- ✅ Color coding (amber, green, red)
- ✅ Loading spinner
- ✅ Empty states

**Código:**
```jsx
<RevisarDuplicados />
```

---

## 🔄 FLUJO DE DATOS

```
Usuario abre página
    ↓
GET /api/asegurados/duplicados/potenciales
    ↓
Backend consulta asegurados WHERE duplicado_potencial = true
    ↓
Retorna 443,228 registros paginados
    ↓
Tabla React muestra 25 por página
    ↓
Usuario busca/ordena
    ↓
Se aplica en cliente (búsqueda) o servidor (ordenamiento)
    ↓
Usuario hace click en "Detalles"
    ↓
GET /api/asegurados/duplicado/{docPaciente}
    ↓
Backend consulta audit_duplicados_asegurados
    ↓
Retorna comparación 7 vs 8 caracteres
    ↓
Modal muestra detalles para análisis
```

---

## 📊 ESTADÍSTICAS

**Registros Duplicados:**
```
Total asegurados: 5,165,000
Marcados como duplicado_potencial: 443,228 (8.58%)
Páginas (25 por página): 17,729
```

**Distribución:**
- DNIs de 7 caracteres duplicados: 443,228
- DNIs de 8 caracteres no duplicados: 4,583,219
- DNIs otros formatos: 138,553

---

## 🛠️ INSTALACIÓN

### 1. Base de Datos

Ejecutar script SQL:
```bash
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/044_marcar_duplicados_potenciales.sql
```

O ejecutar manualmente las operaciones:
```sql
ALTER TABLE asegurados ADD COLUMN duplicado_potencial BOOLEAN DEFAULT false;
CREATE TABLE audit_duplicados_asegurados (...);
UPDATE asegurados SET duplicado_potencial = true WHERE ...;
```

### 2. Backend

El código Java ya está en:
```
backend/src/main/java/com/styp/cenate/api/pacientes/AseguradoController.java
```

Endpoints agregados:
- `GET /api/asegurados/duplicados/potenciales`
- `GET /api/asegurados/duplicado/{docPaciente}`

Solo necesita compilar:
```bash
./gradlew bootRun
```

### 3. Frontend

Archivo ya creado en:
```
frontend/src/pages/asegurados/RevisarDuplicados.jsx
```

**FALTA:** Agregar ruta en el router de la aplicación

En tu archivo de rutas (probablemente `App.jsx` o `Router.jsx`), agregar:

```jsx
import RevisarDuplicados from './pages/asegurados/RevisarDuplicados';

// En las rutas:
<Route path="/admin/asegurados/duplicados" element={<RevisarDuplicados />} />
```

---

## 🔗 INTEGRACIÓN CON MENÚ

Para que aparezca en el módulo de Asegurados, agregar al menú:

```jsx
{
  name: "Revisar Duplicados",
  icon: <AlertTriangle size={20} />,
  path: "/admin/asegurados/duplicados",
  description: "Auditoría de 443,228 DNI conflictivos"
}
```

---

## 🔄 REVERSIBILIDAD

**¿Es reversible?** SÍ, totalmente.

Para deshacer los cambios:

```sql
-- Desmarcar todos
UPDATE asegurados SET duplicado_potencial = false;

-- Limpiar tabla de auditoría
DELETE FROM audit_duplicados_asegurados;

-- Eliminar columna (si es necesario)
ALTER TABLE asegurados DROP COLUMN duplicado_potencial;

-- Eliminar tabla (si es necesario)
DROP TABLE audit_duplicados_asegurados;
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos ✅
- [x] Columna `duplicado_potencial` agregada
- [x] Tabla `audit_duplicados_asegurados` creada
- [x] Índices optimizados
- [x] 443,228 registros marcados
- [x] Integridad referencial confirmada

### Backend ✅
- [x] Endpoint GET /api/asegurados/duplicados/potenciales
- [x] Endpoint GET /api/asegurados/duplicado/{docPaciente}
- [x] Paginación implementada
- [x] Ordenamiento dinámico
- [x] Manejo de errores
- [x] Logging completo

### Frontend ✅
- [x] Componente RevisarDuplicados.jsx creado
- [x] Tabla con datos
- [x] Búsqueda en tiempo real
- [x] Paginación cliente-servidor
- [x] Ordenamiento
- [x] Modal de detalles
- [x] Exportación CSV
- [x] UI responsiva

### ⏳ Falta
- [ ] Agregar ruta en router de la aplicación
- [ ] Agregar enlace en menú del módulo Asegurados
- [ ] Testing completo
- [ ] Deploy a producción

---

## 🚀 PRÓXIMOS PASOS

### Inmediato
1. Agregar ruta en router
2. Agregar enlace en menú
3. Testing en desarrollo
4. Deploy

### Corto Plazo
1. Investigación de duplicados con ESSI
2. Documentación de decisiones
3. Marcar como "REVISADO" los que se confirmen

### Mediano Plazo
1. Deduplicación: eliminar o desactivar registros incorrectos
2. Validación de otros formatos (9+ caracteres)
3. Investigación de DNIs fake/legacy (< 7 caracteres)

---

## 📞 CONTACTO Y SOPORTE

**Tablas creadas:**
- `asegurados.duplicado_potencial` (BOOLEAN)
- `audit_duplicados_asegurados` (443,228 registros)

**Endpoints disponibles:**
- `GET /api/asegurados/duplicados/potenciales`
- `GET /api/asegurados/duplicado/{docPaciente}`

**Página React:**
- `/admin/asegurados/duplicados`

---

**Documento:** spec/04_BaseDatos/13_sistema_auditoria_duplicados.md
**Versión:** 1.0
**Estado:** ✅ Implementado
**Fecha:** 2026-01-25
**Commit:** bdc7163
