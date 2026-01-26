# 📦 Backend Documentation

**Versión:** v1.34.1 | **Status:** ✅ Production Ready

## 📂 Estructura Organizada

### Código (Spring Boot)
- **01_api/** - Endpoints REST
- **02_modules/** - Módulos específicos
- **03_services/** - Lógica de servicios
- **04_dto/** - Data Transfer Objects
- **05_notifications/** - Notificaciones
- **06_auth/** - Autenticación y seguridad

### Documentación (por Tema)

#### ⭐ Spring AI
**[07_spring_ai/](./07_spring_ai/)**
- Integración con Claude (IA)
- Chatbot de atención al asegurado
- Arquitectura Clean Architecture
- Configuración y deployment

#### 📋 Planes y Especificaciones
**[08_plans/](./08_plans/)**
- Plan de auditoría
- Plan de solicitud de turnos
- Plan de disponibilidad médica

#### 📦 Módulo de Solicitudes de Bolsa
**[09_modules_bolsas/](./09_modules_bolsas/)** ⭐ **RECOMENDADO**
- **Inicio rápido:** [`08_modulo_bolsas_pacientes_completo.md`](./09_modules_bolsas/08_modulo_bolsas_pacientes_completo.md)
- CRUD de tipos de bolsas
- Estados de gestión de citas
- Auto-normalización de Excel
- Resumen integral del módulo

#### 🔧 Otros Módulos
**[10_modules_other/](./10_modules_other/)**
- Firma Digital
- Formulario 107
- Notificaciones (Email/WhatsApp)
- Tele-ECG v1.24.0 ✅

#### 📖 Referencia
**[11_reference/](./11_reference/)**
- Documentación de endpoints REST
- Procedimiento para crear nuevos módulos
- Resumen de cambios

## 📊 Archivos Principales

| Archivo | Propósito | Carpeta |
|---------|-----------|---------|
| **01_api_endpoints.md** | Referencia de endpoints | 11_reference |
| **08_modulo_bolsas_pacientes_completo.md** | Módulo de bolsas completo | 09_modules_bolsas |
| **07_modulo_estados_gestion_citas_crud.md** | Estados de gestión | 09_modules_bolsas |
| **00_Procedimiento_NuevoModulo_Pagina.md** | Crear nuevos módulos | 11_reference |
| **002_changelog.md** | Histórico de cambios | (raíz) |

## 🛠️ Stack

- **Backend:** Spring Boot 3.5.6 + Java 17
- **ORM:** JPA/Hibernate
- **Database:** PostgreSQL 14+
- **AI:** Spring AI + Claude (Anthropic)

## 🚀 Inicio Rápido

**Por rol:**
- **Backend Dev:** Lee [`08_plans/`](./08_plans/) + [`09_modules_bolsas/`](./09_modules_bolsas/) + [`11_reference/01_api_endpoints.md`](./11_reference/01_api_endpoints.md)
- **Nuevo Módulo:** Lee [`11_reference/00_Procedimiento_NuevoModulo_Pagina.md`](./11_reference/00_Procedimiento_NuevoModulo_Pagina.md)
- **Spring AI:** Lee [`07_spring_ai/00_INDICE_SPRING_AI.md`](./07_spring_ai/00_INDICE_SPRING_AI.md)

## 📚 Lectura Recomendada

1. **Entender el sistema:** 👉 [`09_modules_bolsas/08_modulo_bolsas_pacientes_completo.md`](./09_modules_bolsas/08_modulo_bolsas_pacientes_completo.md)
2. **Implementar endpoint:** 👉 [`11_reference/00_Procedimiento_NuevoModulo_Pagina.md`](./11_reference/00_Procedimiento_NuevoModulo_Pagina.md)
3. **Referencia técnica:** 👉 [`11_reference/01_api_endpoints.md`](./11_reference/01_api_endpoints.md)

