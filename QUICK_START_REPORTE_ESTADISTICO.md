# 🚀 Quick Start - Reporte Estadístico

## Verificación Rápida de Implementación

### ✅ Backend - Verificar Compilación

```bash
cd backend

# Limpiar y compilar
./gradlew clean build -x test

# Iniciar servidor
./gradlew bootRun

# Servidor disponible en: http://localhost:8080
```

**Pasos de compilación esperados:**
1. `compileJava` - Compila código Java (✅ Debe pasar)
2. `processResources` - Procesa recursos
3. `classes` - Genera clases compiladas
4. `jar` - Crea jar ejecutable

### ✅ Frontend - Verificar Dependencias

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar dev server
npm start

# Frontend disponible en: http://localhost:3000
```

---

## 🧪 Testing - Paso a Paso

### Paso 1: Verificar Backend API

Abrir postman o terminal y probar endpoint:

```bash
# Obtener token de autenticación
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Respuesta esperada:
# { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Probar endpoint de estadísticas
curl -X GET http://localhost:8080/api/formulario-diagnostico/42/estadisticas \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada: JSON con FormDiagEstadisticasDTO
```

### Paso 2: Verificar Frontend

1. Abrir navegador: `http://localhost:3000`
2. Navegar a: `/roles/gestionterritorial/diagnosticoipress`
3. Login con credenciales (si es necesario)

### Paso 3: Test Interactivo

**1. Cargar página de Diagnósticos**
```
✅ Tabla debe mostrar diagnósticos
✅ Columnas: IPRESS, Red, Estado, Fecha, Acciones
✅ Botón BarChart3 (ámbar) en columna Acciones
```

**2. Hacer clic en BarChart3**
```
✅ Modal debe abrirse suavemente
✅ Mostrar spinner "Cargando estadísticas..."
✅ En 2-3 seg, mostrar Dashboard
```

**3. Verificar Dashboard Tab**
```
✅ Información general (IPRESS, Red, Estado)
✅ 4 KPI Cards con valores
✅ PieChart: Distribución Sí/No
✅ BarChart: Equipamiento por tipo
✅ Tabla resumen: 5-6 secciones
```

**4. Cambiar a tab "Análisis por Sección"**
```
✅ Secciones con PieCharts individuales
✅ Tablas de detalles por sección
✅ Resumen de necesidades con cards de prioridad
```

**5. Cambiar a tab "Detalle Completo"**
```
✅ Tablas completas de equipamiento
✅ Servicios telesalud
✅ Necesidades identificadas
```

**6. Exportar a Excel**
```
✅ Botón "Exportar Excel" debe ser clickeable
✅ Archivo descarga: reporte_estadistico_formulario_42.xlsx
✅ Excel se abre en aplicación (Excel, LibreOffice, etc.)
✅ 8 hojas: Dashboard, RRHH, InfraFísica, InfraTec, etc.
```

---

## 🔍 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| **"Cannot find module ReporteEstadisticoModal"** | `npm install` en frontend |
| **Endpoint 404 /estadisticas** | Verificar gradle build completo (`./gradlew build`) |
| **Modal no abre** | Verificar console (F12) para errores |
| **Gráficos vacíos** | Verificar que formulario tiene datos en BD |
| **Excel descarga vacío** | Verificar que token es válido |

---

## 📋 Checklist de Validación Final

### Backend (Código)
- [ ] FormDiagEstadisticasDTO.java - 300+ líneas
- [ ] FormDiagExcelService.java - Interface
- [ ] FormDiagExcelServiceImpl.java - Implementación con 8 hojas
- [ ] FormDiagService.java - Nuevo método `obtenerEstadisticasDetalladas`
- [ ] FormDiagServiceImpl.java - Implementación (350+ líneas)
- [ ] FormDiagController.java - 2 nuevos endpoints

### Frontend (Código)
- [ ] ReporteEstadisticoModal.jsx - Componente modal completo
- [ ] DiagnosticoIpress.jsx - Import + States + onClick + Modal
- [ ] formularioDiagnosticoService.js - 2 nuevos métodos

### Compilación
- [ ] `gradle build` pasa sin errores
- [ ] `npm install` completa sin warnings
- [ ] Frontend inicia sin errores de consola

### Tests Funcionales
- [ ] Modal abre al hacer clic en BarChart3
- [ ] Dashboard carga en < 3 segundos
- [ ] Gráficos PieChart y BarChart renderizan
- [ ] Tab "Análisis" muestra datos correctos
- [ ] Tab "Detalle" muestra tablas completas
- [ ] Excel descarga correctamente
- [ ] Excel contiene 8 hojas con datos

---

## 🎯 Resumen de Cambios

### Nuevos Archivos
```
backend/src/main/java/com/styp/cenate/dto/formdiag/
  └── FormDiagEstadisticasDTO.java (NEW) ✨

backend/src/main/java/com/styp/cenate/service/formdiag/
  ├── FormDiagExcelService.java (NEW) ✨
  └── impl/
      └── FormDiagExcelServiceImpl.java (NEW) ✨

frontend/src/components/modals/
  └── ReporteEstadisticoModal.jsx (NEW) ✨
```

### Archivos Modificados
```
backend/src/main/java/com/styp/cenate/
  ├── api/formdiag/FormDiagController.java ✏️
  └── service/formdiag/
      ├── FormDiagService.java ✏️
      └── impl/FormDiagServiceImpl.java ✏️

frontend/src/
  ├── pages/roles/gestionterritorial/DiagnosticoIpress.jsx ✏️
  └── services/formularioDiagnosticoService.js ✏️
```

### Dependencias
- **Apache POI 5.2.5** - Ya incluida en build.gradle ✅
- **Recharts 3.3.0** - Ya incluida en package.json ✅
- **React 19.2.0** - Ya incluida en package.json ✅

---

## 🚀 Comandos Útiles

### Backend
```bash
# Limpiar y compilar
./gradlew clean build -x test

# Solo compilar sin tests
./gradlew classes

# Iniciar servidor Spring Boot
./gradlew bootRun

# Ver logs detallados
./gradlew bootRun --info
```

### Frontend
```bash
# Instalar y actualizar dependencias
npm install

# Iniciar dev server con hot reload
npm start

# Build para producción
npm run build

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json && npm install
```

### Testing Manual
```bash
# Curl al backend (reemplazar TOKEN)
TOKEN="tu_token_aqui"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/formulario-diagnostico/42/estadisticas

# Verificar que el formulario existe
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/formulario-diagnostico/42
```

---

## 📱 URLs Importantes

| Recurso | URL |
|---------|-----|
| **Frontend Home** | http://localhost:3000 |
| **Diagnósticos** | http://localhost:3000/roles/gestionterritorial/diagnosticoipress |
| **Backend API** | http://localhost:8080/api |
| **Swagger/OpenAPI** | http://localhost:8080/swagger-ui.html |
| **Actuator Health** | http://localhost:8080/actuator/health |

---

## 📊 Datos de Test

Si necesitas crear un formulario de prueba:

```bash
# POST para crear formulario
curl -X POST http://localhost:8080/api/formulario-diagnostico/borrador \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idIpress": 1,
    "anio": 2026,
    "datosGenerales": {
      "directorNombre": "Dr. Pérez",
      "directorCorreo": "perez@test.com"
    },
    "infraestructura": {
      "espacioFisico": true,
      "privacidad": true,
      "escritorio": true
    }
  }'
```

---

## 🎓 Estructura de Carpetas (Resumen)

```
mini_proyecto_cenate/
├── backend/
│   └── src/main/java/com/styp/cenate/
│       ├── api/formdiag/
│       │   └── FormDiagController.java ✏️
│       ├── service/formdiag/
│       │   ├── FormDiagService.java ✏️
│       │   ├── FormDiagExcelService.java ✨
│       │   └── impl/
│       │       ├── FormDiagServiceImpl.java ✏️
│       │       └── FormDiagExcelServiceImpl.java ✨
│       └── dto/formdiag/
│           └── FormDiagEstadisticasDTO.java ✨
├── frontend/
│   └── src/
│       ├── components/modals/
│       │   └── ReporteEstadisticoModal.jsx ✨
│       ├── services/
│       │   └── formularioDiagnosticoService.js ✏️
│       └── pages/roles/gestionterritorial/
│           └── DiagnosticoIpress.jsx ✏️
└── IMPLEMENTACION_REPORTE_ESTADISTICO.md ✨
```

---

## ✅ Verificación Final

Antes de considerar "Listo para Producción":

```bash
# 1. Backend compila sin errores
./gradlew clean build -x test
# ✅ BUILD SUCCESSFUL

# 2. Frontend inicia sin errores
npm start
# ✅ webpack compiled successfully

# 3. Endpoint /estadisticas retorna datos válidos
curl http://localhost:8080/api/formulario-diagnostico/42/estadisticas
# ✅ JSON válido con FormDiagEstadisticasDTO

# 4. Modal abre y carga en < 3 segundos
# (Verificar en navegador manualmente)

# 5. Excel se genera y descarga
# (Verificar en navegador manualmente)
```

---

**🎉 Si todos los pasos pasan, la implementación está lista para uso.**

Para soporte o preguntas, consultar: `IMPLEMENTACION_REPORTE_ESTADISTICO.md`
