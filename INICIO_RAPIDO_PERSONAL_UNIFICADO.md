# 🚀 INICIO RÁPIDO: Sistema Unificado de Personal

## 📋 ¿Qué es esto?

Un sistema que permite **diferenciar y gestionar** en un solo panel:
- **Personal Interno (CENATE)**: Empleados propios
- **Personal Externo**: Empleados de hospitales, clínicas y centros de salud

## ⚡ Instalación Rápida (5 minutos)

### Paso 1: Ejecutar migración SQL

```bash
cd backend
psql -U postgres -d cenate_db -f sql/00_migracion_sistema_unificado.sql
```

**¿Qué hace?**
- ✅ Crea tabla `dim_ipress` (instituciones de salud)
- ✅ Actualiza tabla `dim_personal_externo` con relación a IPRESS
- ✅ Inserta 14 instituciones de ejemplo
- ✅ Crea índices para mejor rendimiento

### Paso 2: Recompilar el backend

```bash
# Con Gradle
./gradlew clean build

# Con Maven
mvn clean install
```

### Paso 3: Reiniciar la aplicación

```bash
# Con Docker
docker-compose restart backend

# O directamente
./gradlew bootRun
```

### Paso 4: Probar endpoints

```bash
# Dar permisos de ejecución
chmod +x backend/test_personal_unificado.sh

# Ejecutar pruebas (necesitas un token JWT)
./backend/test_personal_unificado.sh YOUR_JWT_TOKEN
```

## 🎯 Endpoints Principales

| Endpoint | Descripción | Ejemplo |
|----------|-------------|---------|
| `GET /api/personal-unificado` | Todo el personal | Ver todos |
| `GET /api/personal-unificado/filtrar` | Filtrar por criterios | Ver ejemplos abajo |
| `GET /api/personal-unificado/cenate` | Solo CENATE | Personal interno |
| `GET /api/personal-unificado/externos` | Solo externos | Otras instituciones |
| `GET /api/personal-unificado/estadisticas` | Métricas | Dashboard |

### Ejemplos de Filtros

```bash
# Solo personal CENATE
/api/personal-unificado/filtrar?tipoPersonal=CENATE

# Solo personal externo
/api/personal-unificado/filtrar?tipoPersonal=EXTERNO

# Personal que cumple años en junio
/api/personal-unificado/filtrar?mesCumpleanos=6

# Personal CENATE activo del área 5
/api/personal-unificado/filtrar?tipoPersonal=CENATE&estado=ACTIVO&idArea=5

# Buscar "garcia"
/api/personal-unificado/filtrar?searchTerm=garcia
```

## 🎨 Integración Frontend

### Opción 1: Usar componente React completo

```bash
# Copiar el componente ejemplo
cp frontend/ejemplos/PanelPersonalUnificado.tsx frontend/src/components/

# Importar en tu aplicación
import { PanelPersonalUnificado } from '@/components/PanelPersonalUnificado';

function App() {
  return <PanelPersonalUnificado />;
}
```

### Opción 2: Llamar directamente a la API

```javascript
// Obtener todo el personal
const response = await fetch('/api/personal-unificado', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const personal = await response.json();

// Filtrar por tipo
const response = await fetch('/api/personal-unificado/filtrar?tipoPersonal=CENATE', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const personalCenate = await response.json();
```

## 📊 Respuesta de la API

```json
{
  "id": 123,
  "tipoPersonal": "CENATE",  // ⭐ O "EXTERNO"
  "nombreCompleto": "JUAN GARCIA LOPEZ",
  "numeroDocumento": "75894621",
  "institucion": "CENATE",  // ⭐ O nombre de hospital
  "ipress": {  // ⭐ Solo para externos
    "idIpress": 1,
    "descIpress": "HOSPITAL DOS DE MAYO",
    "codIpress": "IP001"
  },
  "area": {  // ⭐ Solo para CENATE
    "idArea": 5,
    "descArea": "SISTEMAS"
  },
  "estado": "A",  // A/I para CENATE, ACTIVO/INACTIVO para todos
  "emailPersonal": "jgarcia@email.com",
  "telefono": "987654321"
}
```

## 🔍 Cómo Diferenciar en la UI

### Badge de Tipo

```jsx
{personal.tipoPersonal === 'CENATE' ? (
  <span className="badge badge-blue">
    🏢 CENATE
  </span>
) : (
  <span className="badge badge-green">
    🏥 EXTERNO
  </span>
)}
```

### Mostrar Institución

```jsx
{personal.tipoPersonal === 'CENATE' ? (
  <strong>CENATE</strong>
) : (
  <div>
    {personal.institucion}
    <small>({personal.ipress?.codIpress})</small>
  </div>
)}
```

### Filtros Condicionales

```jsx
{/* Mostrar filtro de Área solo para CENATE */}
{filtros.tipoPersonal === 'CENATE' && (
  <select value={filtros.idArea} onChange={...}>
    <option value="">Todas las áreas</option>
    {areas.map(area => (
      <option value={area.idArea}>{area.descArea}</option>
    ))}
  </select>
)}
```

## 📦 Crear Personal Externo

```javascript
// POST /api/personal-externo
const nuevoExterno = {
  idTipDoc: 1,
  numDocExt: "75894621",
  nomExt: "MARIA",
  apePaterExt: "FLORES",
  apeMaterExt: "DIAZ",
  fechNaciExt: "1990-06-15",
  genExt: "F",
  movilExt: "987654321",
  emailPersExt: "mflores@hospital.gob.pe",
  idIpress: 1  // ⭐ ID de la institución
};

const response = await fetch('/api/personal-externo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(nuevoExterno)
});
```

## 🏥 Listar IPRESS Disponibles

```javascript
// GET /api/ipress/activas
const response = await fetch('/api/ipress/activas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const instituciones = await response.json();

// Usar en un select
<select>
  {instituciones.map(ipress => (
    <option key={ipress.idIpress} value={ipress.idIpress}>
      {ipress.descIpress} ({ipress.codIpress})
    </option>
  ))}
</select>
```

## 📈 Dashboard de Estadísticas

```javascript
// GET /api/personal-unificado/estadisticas
const response = await fetch('/api/personal-unificado/estadisticas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const stats = await response.json();
// {
//   totalCenate: 45,
//   totalExterno: 23,
//   totalGeneral: 68,
//   totalActivosCenate: 42,
//   totalInactivosCenate: 3
// }
```

## ✅ Checklist de Implementación

### Backend
- [x] Ejecutar script SQL de migración
- [x] Compilar proyecto con nuevos archivos
- [x] Reiniciar aplicación
- [x] Probar endpoints con script de prueba

### Frontend
- [ ] Copiar componente React de ejemplo
- [ ] Adaptar estilos a tu diseño
- [ ] Implementar llamadas a API
- [ ] Agregar filtros según necesidades
- [ ] Implementar exportación de datos

## 🆘 Problemas Comunes

### Error: "IPRESS no encontrada"
**Solución:** Ejecutar script SQL de migración

### Error: "Column 'id_ipress' does not exist"
**Solución:** 
```sql
ALTER TABLE dim_personal_externo 
ADD COLUMN id_ipress INTEGER REFERENCES dim_ipress(id_ipress);
```

### Los filtros no funcionan
**Solución:** Verificar que los parámetros sean correctos:
- `tipoPersonal`: "CENATE" o "EXTERNO" (case-sensitive)
- `mesCumpleanos`: número 1-12
- `estado`: "ACTIVO", "INACTIVO", "A", o "I"

### No se muestran datos
**Solución:** 
1. Verificar que el token JWT sea válido
2. Verificar que existan datos en las tablas
3. Revisar logs del backend

## 📚 Documentación Completa

Para más detalles, ver:
- **[GUIA_SISTEMA_PERSONAL_UNIFICADO.md](./GUIA_SISTEMA_PERSONAL_UNIFICADO.md)** - Documentación completa
- **backend/sql/** - Scripts SQL
- **frontend/ejemplos/** - Componentes React de ejemplo

## 🎯 Próximos Pasos

1. ✅ **Implementar en desarrollo** - Seguir esta guía
2. ✅ **Probar funcionalidad** - Usar script de prueba
3. ✅ **Adaptar UI** - Usar componentes de ejemplo
4. ✅ **Capacitar usuarios** - Explicar diferencia CENATE vs Externo
5. ✅ **Monitorear uso** - Ver estadísticas

## 💬 Soporte

¿Problemas? Revisa:
1. Esta guía de inicio rápido
2. La guía completa
3. Los logs del backend (`logs/application.log`)
4. Los ejemplos de código en `frontend/ejemplos/`

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Producción lista
