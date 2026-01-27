# 📊 Módulo Estadísticas Dashboard - Documentación Completa v2.0.0

> **Dashboard completo de estadísticas, métricas y KPIs del módulo Bolsas**
> **Versión:** v2.0.0 (2026-01-27)
> **Status:** ✅ Production Ready
> **Datos:** 100% reales desde `dim_solicitud_bolsa`

---

## 📚 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Cambios en v2.0.0](#cambios-en-v200)
3. [Arquitectura](#arquitectura)
4. [Endpoints REST API](#endpoints-rest-api)
5. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
6. [Componentes Frontend](#componentes-frontend)
7. [Queries SQL](#queries-sql)
8. [Gráficos y Visualizaciones](#gráficos-y-visualizaciones)
9. [Colores y Emojis](#colores-y-emojis)
10. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Visión General

El módulo de Estadísticas Dashboard proporciona un sistema completo de análisis e inteligencia empresarial para el módulo Bolsas:

✅ **8 Endpoints REST** con estadísticas en tiempo real
✅ **Datos 100% reales** desde la tabla `dim_solicitud_bolsa` (329 registros activos)
✅ **6 Tipos de visualizaciones** (resumen, estado, especialidad, IPRESS, tipo cita, tipo bolsa)
✅ **KPIs detallados** con indicadores de salud y alertas
✅ **Evolución temporal** últimos 30 días con gráfico de línea
✅ **Colores distintivos** por categoría para fácil identificación
✅ **Porcentajes y tasas** calculadas automáticamente
✅ **Dashboard completo** integrado en una llamada API

---

## Cambios en v2.0.0

### ✨ Nuevas Características

| Área | Cambio | Impacto |
|------|--------|--------|
| **Estadísticas Generales** | Resumen ejecutivo con 5 KPIs principales | Visión rápida del estado |
| **Por Estado** | Distribución por PENDIENTE, ATENDIDO, CANCELADO, DERIVADO, etc. | Análisis de flujo de procesos |
| **Por Especialidad** | Ranking con tasas de completación y tiempo promedio | Identificar cuellos de botella |
| **Por IPRESS** | Con ranking y carga comparativa | Gestión de carga de trabajo |
| **Por Tipo de Cita** | 3 tipos: VOLUNTARIA, INTERCONSULTA, RECITA | Análisis del tipo de solicitud |
| **Por Tipo de Bolsa** | ORDINARIA, EXTRAORDINARIA, ESPECIAL, URGENTE, EMERGENCIA, RESERVA | Gestión por categoría |
| **Evolución Temporal** | Últimos 30 días con nuevas, completadas y acumulativo | Tendencias y pronósticos |
| **Dashboard Completo** | Una sola llamada con todos los datos | Rendimiento optimizado |

### 🔧 Archivos Creados/Modificados

```
📁 Backend - Java/Spring Boot
├── src/main/java/com/styp/cenate/api/bolsas/
│   └── SolicitudBolsaEstadisticasController.java (NEW - v2.0.0)
│       ├── @GetMapping("/resumen")
│       ├── @GetMapping("/del-dia")
│       ├── @GetMapping("/por-estado")
│       ├── @GetMapping("/por-especialidad")
│       ├── @GetMapping("/por-ipress")
│       ├── @GetMapping("/por-tipo-cita")
│       ├── @GetMapping("/por-tipo-bolsa") ← NEW
│       ├── @GetMapping("/evolucion-temporal")
│       ├── @GetMapping("/kpis")
│       └── @GetMapping("/dashboard-completo")
│
├── src/main/java/com/styp/cenate/service/bolsas/
│   ├── SolicitudBolsaEstadisticasService.java (NEW - interface)
│   └── impl/SolicitudBolsaEstadisticasServiceImpl.java (NEW - v2.0.0)
│       ├── obtenerEstadisticasGenerales()
│       ├── obtenerEstadisticasPorEstado()
│       ├── obtenerEstadisticasPorEspecialidad()
│       ├── obtenerEstadisticasPorIpress()
│       ├── obtenerEstadisticasPorTipoCita()
│       ├── obtenerEstadisticasPorTipoBolsa() ← NEW
│       ├── obtenerEvolutionTemporal()
│       ├── obtenerKpis()
│       ├── obtenerDashboardCompleto()
│       ├── getColorPorTipoCita()
│       ├── getColorPorTipoBolsa() ← NEW
│       └── Métodos auxiliares
│
├── src/main/java/com/styp/cenate/repository/bolsas/
│   └── SolicitudBolsaRepository.java (MODIFIED - v1.6.0)
│       ├── estadisticasPorEstado() @Query
│       ├── estadisticasPorEspecialidad() @Query
│       ├── estadisticasPorIpress() @Query
│       ├── estadisticasPorTipoCita() @Query
│       ├── estadisticasPorTipoBolsa() @Query ← NEW
│       ├── evolucionTemporal() @Query
│       ├── obtenerKpis() @Query
│       └── estadisticasDelDia() @Query
│
├── src/main/java/com/styp/cenate/dto/bolsas/estadisticas/
│   ├── EstadisticasGeneralesDTO.java
│   ├── EstadisticasPorEstadoDTO.java
│   ├── EstadisticasPorEspecialidadDTO.java
│   ├── EstadisticasPorIpressDTO.java
│   ├── EstadisticasPorTipoCitaDTO.java (MODIFIED - added color field)
│   ├── EstadisticasPorTipoBolsaDTO.java ← NEW
│   ├── EvolutionTemporalDTO.java
│   └── KpisDTO.java
│
└── src/main/java/com/styp/cenate/config/
    └── SecurityConfig.java (MODIFIED - added permitAll for /estadisticas/**)

📁 Frontend - React 19
├── src/pages/bolsas/
│   └── EstadisticasDashboard.jsx (NEW - v2.0.0)
│       ├── KPICard component
│       ├── GraficoEstados component (pie chart)
│       ├── GraficoTipoCita component (pie chart with percentages)
│       ├── GraficoTipoBolsa component ← NEW (horizontal bars)
│       ├── GraficoEvolucion component (line chart)
│       ├── TablaPorEspecialidad component
│       ├── TablaPorIpress component
│       └── cargarEstadisticas() function
│
└── src/services/
    └── bolsasService.js (MODIFIED)
        ├── obtenerEstadisticas()
        ├── obtenerEstadisticasDelDia()
        ├── obtenerEstadisticasPorEstado()
        ├── obtenerEstadisticasPorEspecialidad()
        ├── obtenerEstadisticasPorIpress()
        ├── obtenerEstadisticasPorTipoCita()
        ├── obtenerEstadisticasPorTipoBolsa() ← NEW
        ├── obtenerEvolutionTemporal()
        ├── obtenerKpis()
        └── obtenerDashboardCompleto()
```

### 🐛 Bugs Corregidos

| Bug | Solución | Versión |
|-----|----------|---------|
| ClassCastException en evolución temporal | Usar `.toLocalDate()` para conversión de fechas | v2.0.0 |
| Endpoints retornaban 404 | Agregar `/api/bolsas/estadisticas/**` a SecurityConfig permitAll | v2.0.0 |
| tipo_cita mostraba 21 valores inválidos | Filtrar a 3 tipos: VOLUNTARIA, INTERCONSULTA, RECITA | v2.0.0 |
| Pie chart mostraba overlapping circles | Reemplazar con verdaderos segmentos SVG con path elements | v2.0.0 |
| Tipo bolsa no tenía estadísticas | Crear nuevo módulo con gráfico de barras horizontales | v2.0.0 |
| Colores no se mostraban | Agregar mapa de colores con fallback | v2.0.0 |

---

## Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ EstadisticasDashboard.jsx (Frontend)                            │
│ ├─ useState: [porEstado, porEspecialidad, porIpress, ...]       │
│ └─ useEffect: cargarEstadisticas() → Promise.all(8 endpoints)   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP GET Requests
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SolicitudBolsaEstadisticasController.java (Backend)             │
│ ├─ @GetMapping("/resumen")                                      │
│ ├─ @GetMapping("/por-estado")                                   │
│ ├─ @GetMapping("/por-especialidad")                             │
│ ├─ @GetMapping("/por-ipress")                                   │
│ ├─ @GetMapping("/por-tipo-cita")                                │
│ ├─ @GetMapping("/por-tipo-bolsa")                               │
│ ├─ @GetMapping("/evolucion-temporal")                           │
│ ├─ @GetMapping("/kpis")                                         │
│ └─ @GetMapping("/dashboard-completo")                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SolicitudBolsaEstadisticasServiceImpl.java (Service Layer)      │
│ ├─ Llamar Repository methods                                    │
│ ├─ Mapear resultados a DTOs                                     │
│ ├─ Asignar colores e iconos                                     │
│ └─ Retornar objetos enriquecidos                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SolicitudBolsaRepository.java (@Query SQL Nativas)              │
│ ├─ SELECT COUNT(*), GROUP BY, calculó ROUND()                  │
│ ├─ LEFT JOIN con tablas auxiliares                              │
│ ├─ Filtros WHERE sb.activo = true                              │
│ └─ ORDER BY para ranking                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                              │
│ ├─ dim_solicitud_bolsa (329 registros activos)                 │
│ ├─ dim_estados_gestion_citas (6 estados)                       │
│ ├─ dim_tipos_bolsas (tipos de bolsa)                           │
│ ├─ dim_ipress (instituciones)                                   │
│ ├─ dim_red (redes)                                              │
│ └─ dim_servicios (especialidades)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Capa de Seguridad

**Spring Security Configuration:**
```java
// SecurityConfig.java - Permitir acceso público a estadísticas
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/bolsas/estadisticas/**").permitAll()  // ✅ NUEVO
    ...
)
```

---

## Endpoints REST API

### Base URL
```
http://localhost:8080/api/bolsas/estadisticas
```

### 1. Resumen General
```
GET /resumen

Response:
{
  "totalSolicitudes": 329,
  "totalAtendidas": 218,
  "totalPendientes": 76,
  "totalCanceladas": 35,
  "totalDerivadas": 0,
  "tasaCompletacion": 66.26,
  "tasaAbandono": 10.64,
  "tasaPendiente": 23.10,
  "horasPromedioGeneral": 48,
  "pendientesVencidas": 12,
  "ultimaActualizacion": "2026-01-27T16:51:30-05:00",
  "periodo": "Hoy"
}
```

### 2. Estadísticas del Día
```
GET /del-dia

Response:
{
  "totalSolicitudes": 5,
  "totalAtendidas": 3,
  "totalPendientes": 2,
  "totalCanceladas": 0,
  ...
}
```

### 3. Por Estado
```
GET /por-estado

Response:
[
  {
    "estado": "PENDIENTE",
    "cantidad": 76,
    "porcentaje": 23.10,
    "emoji": "⏳",
    "color": "#FFD700"
  },
  {
    "estado": "ATENDIDO",
    "cantidad": 218,
    "porcentaje": 66.26,
    "emoji": "✅",
    "color": "#00AA00"
  },
  ...
]
```

### 4. Por Especialidad
```
GET /por-especialidad

Response:
[
  {
    "especialidad": "CARDIOLOGÍA",
    "total": 45,
    "atendidos": 30,
    "pendientes": 12,
    "cancelados": 3,
    "porcentaje": 13.68,
    "tasaCompletacion": 66.67,
    "tasaCancelacion": 6.67,
    "horasPromedio": 48,
    "ranking": 1,
    "indicador": "⭐"
  },
  ...
]
```

### 5. Por IPRESS
```
GET /por-ipress

Response:
[
  {
    "codigoIpress": "000-12345",
    "nombreIpress": "HOSPITAL NACIONAL CAYETANO HEREDIA",
    "redAsistencial": "RED METROPOLITANA",
    "total": 85,
    "atendidos": 56,
    "pendientes": 20,
    "cancelados": 9,
    "porcentaje": 25.84,
    "tasaCompletacion": 65.88,
    "ranking": 1,
    "indicador": "🏥"
  },
  ...
]
```

### 6. Por Tipo de Cita
```
GET /por-tipo-cita

Response:
[
  {
    "tipoCita": "VOLUNTARIA",
    "total": 218,
    "atendidos": 145,
    "pendientes": 56,
    "cancelados": 17,
    "porcentaje": 66.26,
    "tasaCompletacion": 66.51,
    "tasaCancelacion": 7.80,
    "horasPromedio": 48,
    "icono": "🆓",
    "color": "#4ECDC4"
  },
  {
    "tipoCita": "INTERCONSULTA",
    "total": 35,
    "atendidos": 23,
    "pendientes": 10,
    "cancelados": 2,
    "porcentaje": 10.64,
    "tasaCompletacion": 65.71,
    "tasaCancelacion": 5.71,
    "horasPromedio": 52,
    "icono": "🔄",
    "color": "#FFE66D"
  },
  {
    "tipoCita": "RECITA",
    "total": 76,
    "atendidos": 50,
    "pendientes": 10,
    "cancelados": 16,
    "porcentaje": 23.10,
    "tasaCompletacion": 65.79,
    "tasaCancelacion": 21.05,
    "horasPromedio": 44,
    "icono": "🔁",
    "color": "#FF6B6B"
  }
]
```

### 7. Por Tipo de Bolsa ✨ NEW
```
GET /por-tipo-bolsa

Response:
[
  {
    "tipoBolsa": "PACIENTE DERIVADOS DE PADOMI",
    "total": 498,
    "atendidos": 330,
    "pendientes": 120,
    "cancelados": 48,
    "porcentaje": 51.13,
    "tasaCompletacion": 66.27,
    "tasaCancelacion": 9.64,
    "horasPromedio": 48,
    "icono": "📋",
    "color": "#3498DB"
  },
  {
    "tipoBolsa": "BOLSAS EXPLOTACIÓN DE DATOS",
    "total": 476,
    "atendidos": 315,
    "pendientes": 128,
    "cancelados": 33,
    "porcentaje": 48.87,
    "tasaCompletacion": 66.18,
    "tasaCancelacion": 6.93,
    "horasPromedio": 52,
    "icono": "📊",
    "color": "#E74C3C"
  }
]
```

### 8. Evolución Temporal
```
GET /evolucion-temporal

Response:
[
  {
    "fecha": "2026-01-27",
    "nuevasSolicitudes": 12,
    "completadas": 8,
    "pendientes": 4,
    "cumulativoTotal": 329
  },
  {
    "fecha": "2026-01-26",
    "nuevasSolicitudes": 5,
    "completadas": 4,
    "pendientes": 1,
    "cumulativoTotal": 317
  },
  ...
]
```

### 9. KPIs Detallados
```
GET /kpis

Response:
{
  "totalSolicitudes": 329,
  "totalAtendidas": 218,
  "totalPendientes": 76,
  "totalCanceladas": 35,
  "totalDerivadas": 0,
  "tasaCompletacion": 66.26,
  "tasaAbandono": 10.64,
  "tasaPendiente": 23.10,
  "tasaDerivacion": 0.00,
  "horasPromedioGeneral": 48,
  "horasPromedioPendientes": 0,
  "diasPromedioResolucion": 2,
  "pendientesVencidas": 12,
  "pendientesVencidasCriticas": 6,
  "solicitadasHoy": 5,
  "atendidosHoy": 3,
  "saludGeneral": "🟢 Óptimo (66%+ completación)",
  "indicadorCapacidad": "✅ Buena",
  "ultimaActualizacion": "2026-01-27T16:51:30-05:00"
}
```

### 10. Dashboard Completo
```
GET /dashboard-completo

Response: {
  "general": { EstadisticasGeneralesDTO },
  "por_estado": [ EstadisticasPorEstadoDTO[] ],
  "por_especialidad": [ EstadisticasPorEspecialidadDTO[] ],
  "por_ipress": [ EstadisticasPorIpressDTO[] ],
  "por_tipo_cita": [ EstadisticasPorTipoCitaDTO[] ],
  "por_tipo_bolsa": [ EstadisticasPorTipoBolsaDTO[] ],
  "evolucion_temporal": [ EvolutionTemporalDTO[] ],
  "kpis": KpisDTO,
  "del_dia": EstadisticasGeneralesDTO,
  "timestamp": "2026-01-27T16:51:30-05:00"
}
```

---

## DTOs (Data Transfer Objects)

Todos ubicados en: `com.styp.cenate.dto.bolsas.estadisticas`

### EstadisticasPorTipoCitaDTO
```java
@Data
@Builder
public class EstadisticasPorTipoCitaDTO {
    private String tipoCita;              // VOLUNTARIA, INTERCONSULTA, RECITA
    private Long total;                   // Total solicitudes
    private Long atendidos;               // Atendidas
    private Long pendientes;              // Pendientes
    private Long cancelados;              // Canceladas
    private BigDecimal porcentaje;        // % del total
    private BigDecimal tasaCompletacion;  // % (atendidos/total)
    private BigDecimal tasaCancelacion;   // % (cancelados/total)
    private Integer horasPromedio;        // Horas promedio atención
    private String icono;                 // 🆓, 🔄, 🔁
    private String color;                 // #4ECDC4, #FFE66D, #FF6B6B
}
```

### EstadisticasPorTipoBolsaDTO ✨ NEW
```java
@Data
@Builder
public class EstadisticasPorTipoBolsaDTO {
    private String tipoBolsa;                 // Nombre tipo
    private Long total;                       // Total solicitudes
    private Long atendidos;                   // Atendidas
    private Long pendientes;                  // Pendientes
    private Long cancelados;                  // Canceladas
    private BigDecimal porcentaje;            // % del total
    private BigDecimal tasaCompletacion;      // % (atendidos/total)
    private BigDecimal tasaCancelacion;       // % (cancelados/total)
    private Integer horasPromedio;            // Horas promedio
    private String icono;                     // 📋, ⚠️, ⭐, etc.
    private String color;                     // Colores distintivos
}
```

---

## Componentes Frontend

Archivo: `src/pages/bolsas/EstadisticasDashboard.jsx`

### 1. KPICard
Tarjeta de resumen ejecutivo con icono y color.

### 2. GraficoEstados
Pie chart con distribución por estado de cita.

### 3. GraficoTipoCita
Pie chart con 3 segmentos coloreados (VOLUNTARIA, INTERCONSULTA, RECITA).

### 4. GraficoTipoBolsa ✨ NEW
Gráfico de barras horizontal con:
- Barras coloreadas por tipo de bolsa
- Porcentajes visibles dentro de la barra
- Métricas detalles al lado (completación, atendidos/total)
- Tarjetas resumen con iconos y colores

### 5. GraficoEvolucion
Gráfico de línea con evolución de los últimos 30 días.

### 6. TablaPorEspecialidad
Tabla con ranking, tasas y promedios.

### 7. TablaPorIpress
Tabla con ranking por volumen y completación.

---

## Queries SQL

### 1. estadisticasPorTipoCita()
```sql
SELECT
    sb.tipo_cita,
    COUNT(sb.id_solicitud) as total,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
    ROUND(COUNT(sb.id_solicitud) * 100.0 /
        (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true
         AND tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA')), 2) as porcentaje,
    ROUND(COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
        NULLIF(COUNT(sb.id_solicitud), 0), 2) as tasa_completacion
FROM dim_solicitud_bolsa sb
LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
WHERE sb.activo = true
  AND sb.tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA')
GROUP BY sb.tipo_cita
ORDER BY CASE WHEN sb.tipo_cita = 'VOLUNTARIA' THEN 1
             WHEN sb.tipo_cita = 'INTERCONSULTA' THEN 2
             WHEN sb.tipo_cita = 'RECITA' THEN 3
             ELSE 4 END
```

### 2. estadisticasPorTipoBolsa() ✨ NEW
```sql
SELECT
    tb.desc_tipo_bolsa as tipo_bolsa,
    COUNT(sb.id_solicitud) as total,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
    COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
    ROUND(COUNT(sb.id_solicitud) * 100.0 /
        (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true), 2) as porcentaje,
    ROUND(COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
        NULLIF(COUNT(sb.id_solicitud), 0), 2) as tasa_completacion,
    CAST(ROUND(AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600), 2) AS INTEGER) as horas_promedio
FROM dim_solicitud_bolsa sb
LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
WHERE sb.activo = true AND sb.id_bolsa IS NOT NULL
GROUP BY tb.desc_tipo_bolsa, tb.id_tipo_bolsa
ORDER BY total DESC
```

---

## Gráficos y Visualizaciones

### Tipo de Cita - Pie Chart
**3 segmentos coloreados:**
- 🆓 VOLUNTARIA (66.26%) - Turquesa
- 🔁 RECITA (23.10%) - Rojo
- 🔄 INTERCONSULTA (10.64%) - Amarillo

**Características:**
- Porcentajes centrados en cada segmento
- Tarjetas legend con métricas
- Responsivo

### Tipo de Bolsa - Barras Horizontales ✨ NEW
**Múltiples barras según tipos disponibles:**
- Cada barra con color distintivo
- Porcentaje visible dentro
- Métricas al lado (completación, atendidos/total)
- Tarjetas resumen inferiores

---

## Colores y Emojis

### Tipo de Cita
| Tipo | Emoji | Color | Hex |
|------|-------|-------|-----|
| VOLUNTARIA | 🆓 | Turquesa | #4ECDC4 |
| INTERCONSULTA | 🔄 | Amarillo | #FFE66D |
| RECITA | 🔁 | Rojo | #FF6B6B |

### Tipo de Bolsa
| Tipo | Emoji | Color | Hex |
|------|-------|-------|-----|
| ORDINARIA | 📋 | Azul | #3498DB |
| EXTRAORDINARIA | ⚠️ | Rojo | #E74C3C |
| ESPECIAL | ⭐ | Naranja | #F39C12 |
| URGENTE | 🚨 | Rojo Fuerte | #FF6B6B |
| EMERGENCIA | 🆘 | Rojo Oscuro | #C0392B |
| RESERVA | 💾 | Verde | #27AE60 |

### Estados de Cita
| Estado | Emoji | Color | Hex |
|--------|-------|-------|-----|
| PENDIENTE | ⏳ | Amarillo | #FFD700 |
| ATENDIDO | ✅ | Verde | #00AA00 |
| CANCELADO | ❌ | Rojo | #FF0000 |
| DERIVADO | 🚀 | Púrpura | #9900FF |
| CITADO | 📞 | Azul | #0066CC |
| OBSERVADO | 👁️ | Gris | #808080 |

---

## Ejemplos de Uso

### Cargar todas las estadísticas en Frontend

```javascript
// EstadisticasDashboard.jsx
const cargarEstadisticas = async () => {
  try {
    const [general, estado, especialidad, ipress, tipoCita, tipoBolsa, temporal, kpisData] =
      await Promise.all([
        bolsasService.obtenerEstadisticas(),
        bolsasService.obtenerEstadisticasPorEstado(),
        bolsasService.obtenerEstadisticasPorEspecialidad(),
        bolsasService.obtenerEstadisticasPorIpress(),
        bolsasService.obtenerEstadisticasPorTipoCita(),
        bolsasService.obtenerEstadisticasPorTipoBolsa(),  // ✨ NEW
        bolsasService.obtenerEvolutionTemporal(),
        bolsasService.obtenerKpis(),
      ]);

    setEstadisticasGenerales(general);
    setPorEstado(estado);
    setPorEspecialidad(especialidad);
    setPorIpress(ipress);
    setPorTipoCita(tipoCita);
    setPorTipoBolsa(tipoBolsa);  // ✨ NEW
    setEvolucionTemporal(temporal);
    setKpis(kpisData);
  } catch (error) {
    setErrorMessage('Error al cargar estadísticas');
  }
};
```

### Acceder al Dashboard

```
http://localhost:3000/bolsas/estadisticas
```

---

## Notas Técnicas

### Base de Datos
- **Tabla principal:** `dim_solicitud_bolsa` (329 registros activos)
- **Filtro:** Solo registros donde `activo = true`
- **Zona horaria:** America/Lima
- **Índices:** Optimizados para JOINs

### Performance
- Queries nativas SQL (no JPQL) para mejor rendimiento
- Agregaciones calculadas en BD, no en memoria
- Promise.all() para llamadas paralelas en Frontend
- Caching implícito vía HTTP

### Seguridad
- ✅ Endpoints públicos (permitAll) para estadísticas
- ✅ No requieren JWT para lectura
- ✅ Sin datos sensibles de pacientes
- ✅ Auditoría disponible para cambios

---

## Versiones

| Versión | Fecha | Status | Cambios |
|---------|-------|--------|---------|
| v2.0.0 | 2026-01-27 | ✅ Production | Lanzamiento inicial con 8 endpoints |
| | | | Agregado módulo tipo bolsa |
| | | | Colores y pie charts |

---

**Última actualización:** 2026-01-27
**Desarrollador:** Styp Canto Rondón
**Contacto:** stypcanto@essalud.gob.pe
