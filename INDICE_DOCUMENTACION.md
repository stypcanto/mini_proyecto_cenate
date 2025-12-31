# Índice General de Documentación - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | Guía rápida de navegación

**Versión:** v1.14.0
**Fecha:** 2025-12-30

---

## 🎯 Inicio Rápido

| Necesito... | Ver documento |
|-------------|---------------|
| **Levantar el proyecto en 5 minutos** | `CLAUDE.md` (sección "🚀 Quick Start") |
| **Entender qué es CENATE** | `CLAUDE.md` (sección "¿Qué es CENATE?") |
| **Ver glosario de términos** | `CLAUDE.md` (sección "Glosario de Términos") |
| **Guía principal del proyecto** | `CLAUDE.md` |
| **Empezar a desarrollar** | `README.md` |
| **Ver últimos cambios** | `checklist/01_Historial/01_changelog.md` |
| **Consultar API** | `spec/01_Backend/01_api_endpoints.md` |
| **Resolver problemas** | `spec/05_Troubleshooting/01_guia_problemas_comunes.md` |

---

## 📚 spec/ - Documentación Técnica

### 01_Backend/ - Spring Boot
```
spec/01_Backend/
└── 01_api_endpoints.md      # Todos los endpoints REST del sistema
```

**Cuándo consultar:**
- Necesitas saber qué endpoints existen
- Estás creando un nuevo endpoint
- Necesitas documentar un cambio en la API

---

### 02_Frontend/ - React
```
spec/02_Frontend/
└── (próximamente)            # Documentación de componentes React
```

**Estado:** En planificación

---

### 03_Arquitectura/ - Diagramas y Flujos
```
spec/03_Arquitectura/
└── 01_diagramas_sistema.md   # Arquitectura completa del sistema
```

**Cuándo consultar:**
- Necesitas entender cómo funciona el sistema
- Estás diseñando un nuevo módulo
- Quieres ver los flujos de datos

---

### 04_BaseDatos/ - PostgreSQL
```
spec/04_BaseDatos/
├── 01_modelo_usuarios/                       # Modelo de datos de usuarios
│   └── 01_modelo_usuarios.md
├── 02_guia_auditoria/                        # ⭐ Guía completa de auditoría
│   └── 02_guia_auditoria.md
├── 03_guia_auditoria_acceso_sensible/        # Auditoría de accesos críticos
│   └── 03_guia_auditoria_acceso_sensible.md
├── 04_analisis_estructura/                   # Análisis completo de la BD
│   └── 01_resumen_general.md                 # 135 tablas documentadas
├── 05_plan_limpieza/                         # Plan de optimización BD
│   ├── 01_resumen_ejecutivo.md               # Resumen para jefes
│   ├── 02_guia_ejecucion.md                  # Pasos detallados
│   └── 03_scripts_limpieza_fase1.sql         # Scripts SQL listos
├── 06_scripts/                               # Scripts SQL de mantenimiento
│   ├── 001_audit_view_and_indexes.sql
│   ├── 002_rename_logs_to_auditoria.sql
│   ├── 005_disponibilidad_medica.sql
│   ├── 007_agregar_email_preferido.sql
│   ├── 015_crear_tabla_firma_digital_personal.sql
│   └── ... (16 scripts en total)
└── 07_sql/                                   # Configuraciones SQL
    └── chatbot_menu_setup.sql
```

**Cuándo consultar:**
- Necesitas entender el modelo de datos
- Vas a crear/modificar tablas
- Necesitas ejecutar scripts de migración
- Quieres optimizar la base de datos
- Trabajas con auditoría del sistema

**⭐ Documentos Estrella:**
- `02_guia_auditoria.md` - Guía completa del sistema de auditoría
- `04_analisis_estructura/` - Análisis detallado de las 135 tablas
- `05_plan_limpieza/` - Plan para reducir la BD de 5.4GB a 3.9GB

---

### 05_Troubleshooting/ - Solución de Problemas
```
spec/05_Troubleshooting/
└── 01_guia_problemas_comunes.md              # Soluciones a problemas frecuentes
```

**Cuándo consultar:**
- El sistema no arranca
- Hay errores de SMTP/correos
- Docker no funciona correctamente
- Problemas de conexión a BD

---

## 📋 plan/ - Planificación

### 01_Seguridad_Auditoria/ - Seguridad del Sistema
```
plan/01_Seguridad_Auditoria/
├── 01_plan_auditoria.md              # Plan del sistema de auditoría (✅ Implementado v1.13.0)
├── 02_plan_seguridad_auth.md         # Plan de seguridad JWT (✅ Implementado v1.12.0)
└── 03_plan_mejoras_auditoria.md      # Mejoras adicionales (✅ Implementado v1.13.0)
```

**Estado:** Todos implementados
**Cuándo consultar:**
- Necesitas entender el sistema de auditoría
- Vas a agregar nuevas acciones auditadas
- Quieres mejorar la seguridad

---

### 02_Modulos_Medicos/ - Funcionalidades Médicas
```
plan/02_Modulos_Medicos/
├── 01_plan_disponibilidad_turnos.md  # Declaración de disponibilidad (✅ Implementado v1.9.0)
└── 02_plan_solicitud_turnos.md       # Solicitud de turnos (📋 Planificado)
```

**Estado:** Disponibilidad implementada, Solicitud en planificación
**Cuándo consultar:**
- Trabajas con turnos médicos
- Necesitas entender el flujo de disponibilidad
- Vas a implementar solicitud de turnos

---

### 03_Infraestructura/ - Red y Coordinación
```
plan/03_Infraestructura/
└── 01_plan_modulo_red.md              # Módulo de red coordinador (📋 Planificado)
```

**Estado:** En planificación
**Cuándo consultar:**
- Trabajas en coordinación entre instituciones

---

### 04_Integraciones/ - IA y Servicios Externos
```
plan/04_Integraciones/
└── 01_analisis_ollama.md              # Integración con Ollama AI (🔍 En análisis)
```

**Estado:** En análisis de viabilidad
**Cuándo consultar:**
- Evalúas integración con IA
- Quieres usar Ollama en el proyecto

---

### 05_Firma_Digital/ - Firma Digital
```
plan/05_Firma_Digital/
└── 01_plan_implementacion.md          # Plan de firma digital (📋 Planificado)
```

**Estado:** En planificación
**Cuándo consultar:**
- Implementas firma digital
- Necesitas validar certificados digitales

---

## ✅ checklist/ - Logs y Reportes

### 01_Historial/ - Changelog y Versiones
```
checklist/01_Historial/
├── 01_changelog.md                    # ⭐ Historial completo de cambios
└── 02_historial_versiones.md         # Registro de versiones y releases
```

**⭐ Documento más importante:**
`01_changelog.md` - Consulta SIEMPRE antes de implementar algo nuevo

**Cuándo consultar:**
- Necesitas ver qué cambió en cada versión
- Vas a crear un release
- Quieres saber cuándo se implementó algo

---

### 02_Reportes_Pruebas/ - Reportes de Testing
```
checklist/02_Reportes_Pruebas/
└── 01_reporte_disponibilidad.md      # Reporte de pruebas de disponibilidad médica
```

**Cuándo consultar:**
- Necesitas validar un módulo
- Vas a crear un reporte de pruebas
- Quieres ver ejemplos de testing

---

### 03_Checklists/ - Checklists de Implementación
```
checklist/03_Checklists/
└── 01_checklist_firma_digital.md     # Checklist de implementación firma digital
```

**Cuándo consultar:**
- Estás implementando un feature
- Necesitas asegurarte de no olvidar nada
- Quieres seguir un proceso estándar

---

### 04_Analisis/ - Análisis y Resúmenes
```
checklist/04_Analisis/
├── 01_analisis_chatbot_citas.md      # Análisis de chatbot para citas
└── 02_resumen_mejoras_auditoria.md   # Resumen de mejoras implementadas
```

**Cuándo consultar:**
- Necesitas ver análisis previos
- Quieres entender decisiones técnicas
- Buscas resúmenes ejecutivos

---

## 🗺️ Mapa de Navegación por Tarea

### Necesito implementar un nuevo módulo
1. ✅ Revisar: `CLAUDE.md` - Sección "Instrucciones para Claude"
2. ✅ Ver planes similares en: `plan/`
3. ✅ Crear checklist en: `checklist/03_Checklists/`
4. ✅ Actualizar: `checklist/01_Historial/01_changelog.md`

### Necesito resolver un problema
1. ✅ Buscar en: `spec/05_Troubleshooting/01_guia_problemas_comunes.md`
2. ✅ Revisar logs de auditoría en el sistema
3. ✅ Consultar: `checklist/01_Historial/01_changelog.md` (cambios recientes)

### Necesito entender cómo funciona algo
1. ✅ Leer: `CLAUDE.md` - Buscar el módulo específico
2. ✅ Ver arquitectura: `spec/03_Arquitectura/01_diagramas_sistema.md`
3. ✅ Revisar código fuente del módulo

### Necesito crear/modificar la base de datos
1. ✅ Consultar modelo: `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
2. ✅ Ver scripts existentes: `spec/04_BaseDatos/06_scripts/`
3. ✅ Crear nuevo script con numeración siguiente
4. ✅ Documentar en changelog

### Necesito hacer mantenimiento de la BD
1. ✅ Ver análisis: `spec/04_BaseDatos/04_analisis_estructura/`
2. ✅ Seguir plan: `spec/04_BaseDatos/05_plan_limpieza/`
3. ✅ Ejecutar scripts en ventana de mantenimiento

---

## 📖 Guía de Numeración

### Sistema Jerárquico de Numeración

```
XX_NombreCarpeta/
└── YY_nombre_archivo.md

XX = Número de categoría (01, 02, 03...)
YY = Número de archivo dentro de la categoría (01, 02, 03...)
```

**Ejemplo:**
```
spec/04_BaseDatos/02_guia_auditoria.md
  ↓    ↓            ↓
spec  04 = BD      02 = Segundo documento de BD
```

**Beneficios:**
- ✅ Orden alfabético = Orden lógico
- ✅ Fácil encontrar documentos
- ✅ Estructura escalable
- ✅ Navegación intuitiva

---

## 🎯 Documentos Estrella (⭐)

| Documento | Ruta | Descripción |
|-----------|------|-------------|
| **Guía Principal** | `CLAUDE.md` | Todo sobre el proyecto + contexto de negocio |
| **Contexto de Negocio** | `CLAUDE.md` (inicio) | Qué es CENATE, actores, flujos, glosario |
| **Changelog** | `checklist/01_Historial/01_changelog.md` | Historial completo de cambios |
| **Guía Auditoría** | `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md` | Sistema completo de auditoría |
| **API Endpoints** | `spec/01_Backend/01_api_endpoints.md` | Todos los endpoints REST |
| **Análisis BD** | `spec/04_BaseDatos/04_analisis_estructura/` | 135 tablas documentadas |

---

## 📞 Soporte

**Desarrollador Principal:**
Ing. Styp Canto Rondon

**Soporte Técnico:**
cenate.analista@essalud.gob.pe

**Sistema de Emails:**
cenateinformatica@gmail.com

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos de Documentación** | 26+ archivos |
| **Scripts SQL** | 15 scripts |
| **Versión Actual** | v1.14.0 |
| **Base de Datos** | 135 tablas, 5.4 GB |
| **Endpoints API** | 100+ endpoints |
| **Líneas de Documentación** | 10,000+ líneas |

---

*EsSalud Perú - CENATE | Sistema de Telemedicina*
*Última actualización: 2025-12-30*
