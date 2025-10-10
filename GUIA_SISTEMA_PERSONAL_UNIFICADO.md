# 🏥 GUÍA COMPLETA: Sistema Unificado de Personal CENATE

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura de la Solución](#arquitectura-de-la-solución)
3. [Modelos de Datos](#modelos-de-datos)
4. [Endpoints de API](#endpoints-de-api)
5. [Filtros Disponibles](#filtros-disponibles)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Integración con Frontend](#integración-con-frontend)

---

## 📖 Descripción General

### ¿Qué hace este sistema?

Este sistema proporciona una **gestión unificada de personal** que permite:

✅ **Diferenciar claramente** entre:
- **Personal Interno (CENATE)**: Empleados propios de la institución
- **Personal Externo**: Empleados de otras instituciones (hospitales, clínicas, centros de salud)

✅ **Visualizar en un solo panel** todo el personal del sistema

✅ **Filtrar** por múltiples criterios:
- Tipo de institución (CENATE o Externo)
- Mes de cumpleaños
- Estado (Activo/Inactivo)
- Área (solo para personal CENATE)
- Búsqueda libre por nombre, apellido o documento

### Características Principales

| Característica | Personal CENATE | Personal Externo |
|---------------|-----------------|------------------|
| Identificación única | ✅ ID interno | ✅ ID externo |
| Vinculación con Usuario | ✅ Opcional | ✅ Opcional |
| Área de trabajo | ✅ Sí | ❌ No |
| Régimen laboral | ✅ Sí | ❌ No |
| Institución | CENATE (fijo) | IPRESS variable |
| Foto de perfil | ✅ Sí | ❌ No (pendiente) |
| Estado propio | ✅ A/I | Basado en usuario |

---

## 🏗️ Arquitectura de la Solución

### Componentes Creados/Modificados

```
backend/src/main/java/styp/com/cenate/
├── model/
│   ├── Ipress.java                    ✅ NUEVO
│   ├── PersonalExterno.java           🔄 ACTUALIZADO (ahora incluye relación con Ipress)
│   └── PersonalCnt.java              (sin cambios)
│
├── dto/
│   ├── IpressResponse.java            ✅ NUEVO
│   ├── PersonalUnificadoResponse.java ✅ NUEVO
│   ├── PersonalExternoResponse.java   🔄 ACTUALIZADO
│   └── PersonalExternoRequest.java    🔄 ACTUALIZADO
│
├── repository/
│   └── IpressRepository.java          ✅ NUEVO
│
├── service/
│   ├── IpressService.java             ✅ NUEVO
│   ├── PersonalUnificadoService.java  ✅ NUEVO
│   └── PersonalExternoService.java    🔄 ACTUALIZADO
│
└── api/
    ├── IpressController.java          ✅ NUEVO
    └── PersonalUnificadoController.java ✅ NUEVO
```

### Base de Datos

#### Tablas Principales

```sql
-- Personal interno (CENATE)
dim_personal_cnt
├── id_pers (PK)
├── id_area (FK)
├── id_reg_lab (FK)
├── stat_pers (A/I)
└── ... otros campos

-- Personal externo
dim_personal_externo
├── id_pers_ext (PK)
├── id_ipress (FK) ⭐ NUEVA RELACIÓN
└── ... otros campos

-- Instituciones de salud
dim_ipress ⭐ NUEVA TABLA
├── id_ipress (PK)
├── cod_ipress
├── desc_ipress
└── stat_ipress
```

---

## 📊 Modelos de Datos

### PersonalUnificadoResponse (DTO Unificado)

Este es el DTO principal que unifica ambos tipos de personal:

```java
{
  // IDENTIFICACIÓN
  "id": 123,
  "tipoPersonal": "CENATE" | "EXTERNO",
  "numeroDocumento": "75894621",
  
  // DATOS PERSONALES
  "nombres": "JUAN CARLOS",
  "apellidoPaterno": "GARCIA",
  "apellidoMaterno": "LOPEZ",
  "nombreCompleto": "JUAN CARLOS GARCIA LOPEZ",
  "fechaNacimiento": "1985-06-15",
  "edad": 39,
  "genero": "M",
  
  // CONTACTO
  "telefono": "987654321",
  "emailPersonal": "jgarcia@email.com",
  "emailCorporativo": "jgarcia@cenate.gob.pe",
  
  // INSTITUCIÓN ⭐ CLAVE PARA DIFERENCIAR
  "institucion": "CENATE",  // o "HOSPITAL NACIONAL DOS DE MAYO"
  "ipress": {               // Solo para externos
    "idIpress": 1,
    "descIpress": "HOSPITAL NACIONAL DOS DE MAYO",
    "codIpress": "IP001"
  },
  
  // INFORMACIÓN LABORAL (solo CENATE)
  "estado": "A",
  "area": { ... },
  "regimenLaboral": { ... },
  "periodo": "202510",
  "foto": "personal_123_uuid.jpg",
  
  // USUARIO ASOCIADO
  "idUsuario": 456,
  "usuario": {
    "nameUser": "jgarcia",
    "statUser": "ACTIVO"
  }
}
```

### Campos Clave para Diferenciación

| Campo | CENATE | Externo | Uso en Frontend |
|-------|--------|---------|-----------------|
| `tipoPersonal` | "CENATE" | "EXTERNO" | Badge de identificación |
| `institucion` | "CENATE" | Nombre IPRESS | Columna principal |
| `ipress` | null | Objeto completo | Detalles institución |
| `area` | Objeto | null | Filtros CENATE |
| `estado` | "A"/"I" | "ACTIVO"/"INACTIVO" | Filtros generales |

---

## 🔌 Endpoints de API

### Base URL
```
/api/personal-unificado
```

### 1. Obtener TODO el personal

```http
GET /api/personal-unificado
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "tipoPersonal": "CENATE",
    "institucion": "CENATE",
    "nombreCompleto": "JUAN GARCIA LOPEZ",
    ...
  },
  {
    "id": 1,
    "tipoPersonal": "EXTERNO",
    "institucion": "HOSPITAL NACIONAL DOS DE MAYO",
    "nombreCompleto": "MARIA FLORES DIAZ",
    ...
  }
]
```

### 2. Filtrar personal (⭐ ENDPOINT PRINCIPAL)

```http
GET /api/personal-unificado/filtrar
Authorization: Bearer {token}

Query Parameters:
  - tipoPersonal: "CENATE" | "EXTERNO" | null
  - mesCumpleanos: 1-12 | null
  - estado: "ACTIVO" | "INACTIVO" | "A" | "I" | null
  - idArea: integer | null (solo para CENATE)
  - searchTerm: string | null
```

**Ejemplos de filtrado:**

```bash
# Solo personal CENATE
GET /api/personal-unificado/filtrar?tipoPersonal=CENATE

# Solo personal externo
GET /api/personal-unificado/filtrar?tipoPersonal=EXTERNO

# Personal que cumple años en junio
GET /api/personal-unificado/filtrar?mesCumpleanos=6

# Personal CENATE activo del área 5
GET /api/personal-unificado/filtrar?tipoPersonal=CENATE&estado=ACTIVO&idArea=5

# Buscar "garcia" en todo el personal
GET /api/personal-unificado/filtrar?searchTerm=garcia

# Externos que cumplen años en diciembre
GET /api/personal-unificado/filtrar?tipoPersonal=EXTERNO&mesCumpleanos=12
```

### 3. Atajos convenientes

```http
# Solo CENATE
GET /api/personal-unificado/cenate

# Solo externos
GET /api/personal-unificado/externos

# Cumpleaños del mes
GET /api/personal-unificado/cumpleanos/{mes}

# Búsqueda rápida
GET /api/personal-unificado/buscar?q=garcia

# Estadísticas
GET /api/personal-unificado/estadisticas
```

### 4. Gestión de IPRESS

```http
# Listar todas las instituciones
GET /api/ipress

# Solo instituciones activas
GET /api/ipress/activas

# Buscar institución
GET /api/ipress/buscar?q=hospital

# Ver detalles de una IPRESS
GET /api/ipress/{id}
```

---

## 🔍 Filtros Disponibles

### Tabla de Compatibilidad de Filtros

| Filtro | CENATE | Externo | Descripción |
|--------|--------|---------|-------------|
| `tipoPersonal` | ✅ | ✅ | Filtrar por tipo de institución |
| `mesCumpleanos` | ✅ | ✅ | Mes de nacimiento (1-12) |
| `estado` | ✅ | ✅ | Estado activo/inactivo |
| `idArea` | ✅ | ❌ | Área específica (solo CENATE) |
| `searchTerm` | ✅ | ✅ | Búsqueda libre en nombres/docs |

### Combinaciones de Filtros Comunes

#### Para el Panel Principal

```javascript
// Vista general
GET /api/personal-unificado

// Vista CENATE
GET /api/personal-unificado/filtrar?tipoPersonal=CENATE

// Vista Externos
GET /api/personal-unificado/filtrar?tipoPersonal=EXTERNO
```

#### Para Reportes

```javascript
// Cumpleañeros del mes actual
const mesActual = new Date().getMonth() + 1;
GET /api/personal-unificado/cumpleanos/${mesActual}

// Personal activo de un área específica
GET /api/personal-unificado/filtrar?tipoPersonal=CENATE&estado=A&idArea=5

// Todos los externos activos
GET /api/personal-unificado/filtrar?tipoPersonal=EXTERNO&estado=ACTIVO
```

---

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar scripts SQL

```bash
# 1. Ejecutar script de IPRESS
psql -U postgres -d cenate_db -f backend/sql/01_datos_iniciales_ipress.sql

# 2. Verificar que las IPRESS se crearon
SELECT * FROM dim_ipress;
```

### Paso 2: Compilar el proyecto

```bash
cd backend
./gradlew clean build

# O si usas Maven
mvn clean install
```

### Paso 3: Reiniciar la aplicación

```bash
# Si usas Docker
docker-compose restart backend

# O directamente
./gradlew bootRun
```

### Paso 4: Verificar endpoints

```bash
# Test básico
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/personal-unificado/estadisticas

# Debería retornar:
{
  "totalCenate": 10,
  "totalExterno": 5,
  "totalGeneral": 15,
  "totalActivosCenate": 8,
  "totalInactivosCenate": 2
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Personal Externo con IPRESS

```java
// Request
POST /api/personal-externo
{
  "idTipDoc": 1,
  "numDocExt": "75894621",
  "nomExt": "MARIA",
  "apePaterExt": "FLORES",
  "apeMaterExt": "DIAZ",
  "fechNaciExt": "1990-06-15",
  "genExt": "F",
  "movilExt": "987654321",
  "emailPersExt": "mflores@hospital.gob.pe",
  "idIpress": 1  // ⭐ Hospital Dos de Mayo
}

// Response incluirá la información de la IPRESS
{
  "idPersExt": 123,
  "nombreCompleto": "MARIA FLORES DIAZ",
  "ipress": {
    "idIpress": 1,
    "descIpress": "HOSPITAL NACIONAL DOS DE MAYO",
    "codIpress": "IP001"
  },
  "nombreInstitucion": "HOSPITAL NACIONAL DOS DE MAYO"
}
```

### Ejemplo 2: Consulta Unificada en Frontend

```javascript
// React/TypeScript
const PersonalPanel = () => {
  const [personal, setPersonal] = useState([]);
  const [filtros, setFiltros] = useState({
    tipoPersonal: null,
    mesCumpleanos: null,
    estado: null,
    idArea: null,
    searchTerm: ''
  });

  const cargarPersonal = async () => {
    const params = new URLSearchParams();
    if (filtros.tipoPersonal) params.append('tipoPersonal', filtros.tipoPersonal);
    if (filtros.mesCumpleanos) params.append('mesCumpleanos', filtros.mesCumpleanos);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.idArea) params.append('idArea', filtros.idArea);
    if (filtros.searchTerm) params.append('searchTerm', filtros.searchTerm);
    
    const response = await fetch(
      `/api/personal-unificado/filtrar?${params}`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    const data = await response.json();
    setPersonal(data);
  };

  return (
    <div>
      {/* Filtros */}
      <FiltrosPersonal filtros={filtros} onChange={setFiltros} />
      
      {/* Tabla */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Tipo</th> {/* ⭐ CENATE o EXTERNO */}
            <th>Institución</th> {/* ⭐ Diferenciación clara */}
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {personal.map(p => (
            <tr key={`${p.tipoPersonal}-${p.id}`}>
              <td>{p.nombreCompleto}</td>
              <td>{p.numeroDocumento}</td>
              <td>
                <Badge color={p.tipoPersonal === 'CENATE' ? 'blue' : 'green'}>
                  {p.tipoPersonal}
                </Badge>
              </td>
              <td>
                {p.tipoPersonal === 'CENATE' ? (
                  <strong>CENATE</strong>
                ) : (
                  <span title={p.ipress?.codIpress}>
                    {p.institucion}
                  </span>
                )}
              </td>
              <td>
                <EstadoBadge activo={p.isActivo()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Ejemplo 3: Componente de Filtros

```javascript
const FiltrosPersonal = ({ filtros, onChange }) => {
  const [areas, setAreas] = useState([]);
  const [meses] = useState([
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    // ... resto de meses
  ]);

  useEffect(() => {
    // Cargar áreas para filtro
    fetch('/api/areas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(setAreas);
  }, []);

  return (
    <div className="filtros-panel">
      {/* Tipo de Personal */}
      <select 
        value={filtros.tipoPersonal || ''}
        onChange={(e) => onChange({...filtros, tipoPersonal: e.target.value || null})}
      >
        <option value="">Todos</option>
        <option value="CENATE">CENATE (Interno)</option>
        <option value="EXTERNO">Externo</option>
      </select>

      {/* Mes de Cumpleaños */}
      <select 
        value={filtros.mesCumpleanos || ''}
        onChange={(e) => onChange({...filtros, mesCumpleanos: e.target.value || null})}
      >
        <option value="">Todos los meses</option>
        {meses.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {/* Estado */}
      <select 
        value={filtros.estado || ''}
        onChange={(e) => onChange({...filtros, estado: e.target.value || null})}
      >
        <option value="">Todos</option>
        <option value="ACTIVO">Activos</option>
        <option value="INACTIVO">Inactivos</option>
      </select>

      {/* Área (solo visible si tipo es CENATE) */}
      {filtros.tipoPersonal === 'CENATE' && (
        <select 
          value={filtros.idArea || ''}
          onChange={(e) => onChange({...filtros, idArea: e.target.value || null})}
        >
          <option value="">Todas las áreas</option>
          {areas.map(a => (
            <option key={a.idArea} value={a.idArea}>
              {a.descArea}
            </option>
          ))}
        </select>
      )}

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre o documento..."
        value={filtros.searchTerm}
        onChange={(e) => onChange({...filtros, searchTerm: e.target.value})}
      />
    </div>
  );
};
```

---

## 🎨 Integración con Frontend

### Componentes Sugeridos

#### 1. Badge de Tipo de Personal

```javascript
const TipoPersonalBadge = ({ tipo }) => {
  const estilos = {
    CENATE: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🏢' },
    EXTERNO: { bg: 'bg-green-100', text: 'text-green-800', icon: '🏥' }
  };
  
  const estilo = estilos[tipo] || estilos.CENATE;
  
  return (
    <span className={`px-2 py-1 rounded ${estilo.bg} ${estilo.text}`}>
      {estilo.icon} {tipo}
    </span>
  );
};
```

#### 2. Card de Personal

```javascript
const PersonalCard = ({ personal }) => (
  <div className="card">
    <div className="card-header">
      <h3>{personal.nombreCompleto}</h3>
      <TipoPersonalBadge tipo={personal.tipoPersonal} />
    </div>
    
    <div className="card-body">
      <div className="info-row">
        <strong>Documento:</strong> {personal.numeroDocumento}
      </div>
      <div className="info-row">
        <strong>Institución:</strong>
        {personal.tipoPersonal === 'CENATE' ? (
          <span className="font-bold">CENATE</span>
        ) : (
          <span>
            {personal.institucion}
            {personal.ipress && (
              <small className="text-gray-500">
                ({personal.ipress.codIpress})
              </small>
            )}
          </span>
        )}
      </div>
      <div className="info-row">
        <strong>Email:</strong> {personal.emailPersonal}
      </div>
      {personal.area && (
        <div className="info-row">
          <strong>Área:</strong> {personal.area.descArea}
        </div>
      )}
    </div>
  </div>
);
```

#### 3. Tabla Responsiva

```javascript
const TablaPersonal = ({ personal }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th>Nombre</th>
          <th>DNI</th>
          <th>Tipo</th>
          <th>Institución</th>
          <th>Email</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {personal.map(p => (
          <tr key={`${p.tipoPersonal}-${p.id}`}>
            <td className="whitespace-nowrap">
              {p.nombreCompleto}
            </td>
            <td>{p.numeroDocumento}</td>
            <td>
              <TipoPersonalBadge tipo={p.tipoPersonal} />
            </td>
            <td>
              {p.tipoPersonal === 'CENATE' ? (
                <strong className="text-blue-600">CENATE</strong>
              ) : (
                <div>
                  <div>{p.institucion}</div>
                  {p.ipress && (
                    <small className="text-gray-500">
                      {p.ipress.codIpress}
                    </small>
                  )}
                </div>
              )}
            </td>
            <td>{p.emailPersonal}</td>
            <td>
              <EstadoBadge 
                estado={p.estado} 
                activo={p.isActivo()}
              />
            </td>
            <td>
              <BotonesAccion personal={p} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

---

## 📈 Estadísticas y Reportes

### Dashboard de Personal

```javascript
const DashboardPersonal = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/personal-unificado/estadisticas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(setStats);
  }, []);

  if (!stats) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Personal"
        value={stats.totalGeneral}
        icon="👥"
        color="blue"
      />
      <StatCard
        title="Personal CENATE"
        value={stats.totalCenate}
        icon="🏢"
        color="blue"
      />
      <StatCard
        title="Personal Externo"
        value={stats.totalExterno}
        icon="🏥"
        color="green"
      />
      <StatCard
        title="Activos CENATE"
        value={stats.totalActivosCenate}
        icon="✅"
        color="green"
      />
    </div>
  );
};
```

---

## 🔐 Seguridad y Permisos

Todos los endpoints requieren autenticación mediante JWT:

```
Authorization: Bearer {token}
```

### Roles requeridos:
- `SUPERADMIN`: Acceso completo
- `ADMIN`: Acceso completo
- `USER`: Solo lectura

---

## ✅ Checklist de Implementación

- [x] Modelo `Ipress` creado
- [x] Modelo `PersonalExterno` actualizado con relación a IPRESS
- [x] DTO `PersonalUnificadoResponse` creado
- [x] DTO `IpressResponse` creado
- [x] Repositorio `IpressRepository` creado
- [x] Servicio `PersonalUnificadoService` implementado
- [x] Servicio `IpressService` implementado
- [x] Controlador `PersonalUnificadoController` implementado
- [x] Controlador `IpressController` implementado
- [x] Scripts SQL de datos iniciales
- [x] Documentación completa
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Documentación de API (Swagger/OpenAPI)

---

## 🆘 Solución de Problemas

### Error: "IPRESS no encontrada"

**Causa:** No se han ejecutado los scripts SQL de datos iniciales.

**Solución:**
```bash
psql -U postgres -d cenate_db -f backend/sql/01_datos_iniciales_ipress.sql
```

### Error: "Column 'id_ipress' does not exist"

**Causa:** La columna `id_ipress` no existe en `dim_personal_externo`.

**Solución:**
```sql
ALTER TABLE dim_personal_externo 
ADD COLUMN id_ipress INTEGER REFERENCES dim_ipress(id_ipress);
```

### Error: Filtros no funcionan correctamente

**Causa:** Parámetros mal formados en la URL.

**Solución:** Verificar que los parámetros sean:
- `tipoPersonal`: "CENATE" o "EXTERNO" (case-sensitive)
- `mesCumpleanos`: número entre 1 y 12
- `estado`: "ACTIVO", "INACTIVO", "A", o "I"

---

## 📚 Referencias

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 👥 Soporte

Para dudas o problemas:
1. Revisar esta documentación
2. Verificar los logs de la aplicación
3. Consultar los ejemplos de código proporcionados

---

**Última actualización:** Octubre 2025
**Versión:** 1.0.0
