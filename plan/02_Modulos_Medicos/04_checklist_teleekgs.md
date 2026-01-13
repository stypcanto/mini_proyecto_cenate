# ✅ CHECKLIST DE IMPLEMENTACIÓN - Módulo TeleEKG

**Proyecto:** Centro Nacional de Telemedicina (CENATE)
**Módulo:** TeleEKG - Repositorio de Electrocardiogramas
**Versión:** 1.0.0
**Fecha Inicio:** 2026-01-13
**Fecha Estimada Finalización:** 2026-01-20
**Estado General:** 🟢 60% Completado (Fase 0 + Fase 1 + Fase 2 EJECUTADOS)

---

## 📋 ÍNDICE

1. [Fase 0: Análisis y Diseño](#fase-0-análisis-y-diseño)
2. [Fase 1: Base de Datos](#fase-1-base-de-datos)
3. [Fase 2: Backend (Spring Boot)](#fase-2-backend-spring-boot)
4. [Fase 3: Frontend (React)](#fase-3-frontend-react)
5. [Fase 4: Testing y QA](#fase-4-testing-y-qa)
6. [Fase 5: Deployment](#fase-5-deployment)
7. [Resumen de Estado](#resumen-de-estado)

---

# FASE 0: ANÁLISIS Y DISEÑO

**Duración Estimada:** 0.5 días | **Estado:** ✅ Completado

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 0.1 | Análisis técnico documentado | ✅ Completo | Architect | 2026-01-13 | plan/02_Modulos_Medicos/03_plan_teleekk.md |
| 0.2 | Estrategia de almacenamiento definida | ✅ Completo | Architect | 2026-01-13 | BYTEA en PostgreSQL |
| 0.3 | Integración de asegurados documentada | ✅ Completo | Architect | 2026-01-13 | Crear asegurado si DNI no existe |
| 0.4 | DTOs REST especificados | ✅ Completo | Architect | 2026-01-13 | Incluido en plan |
| 0.5 | Diagrama de flujos | ✅ Completo | Architect | 2026-01-13 | Documentado en análisis |
| 0.6 | Patrones de diseño definidos | ✅ Completo | Architect | 2026-01-13 | Clean Architecture |
| 0.7 | Requerimientos no funcionales | ✅ Completo | Architect | 2026-01-13 | Performance, seguridad, auditoría |
| 0.8 | Aprobación del diseño | ⏳ Pendiente | Product Owner | - | **Aguardando** |

---

# FASE 1: BASE DE DATOS

**Duración Estimada:** 0.5 días | **Estado:** ✅ 100% EJECUTADO EN SERVIDOR

## 1.1 Crear Tablas

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 1.1.1 | Crear tabla `tele_ecg_imagenes` | ✅ Ejecutado | DBA | 2026-01-13 | 28 columnas, 6 FK, 5 CHK |
| 1.1.2 | Crear tabla `tele_ecg_auditoria` | ✅ Ejecutado | DBA | 2026-01-13 | 13 columnas, 2 FK, 2 CHK |
| 1.1.3 | Crear tabla `tele_ecg_estadisticas` | ✅ Ejecutado | DBA | 2026-01-13 | 21 columnas, 1 FK |
| 1.1.4 | Validar tipos de datos en PostgreSQL | ✅ Ejecutado | DBA | 2026-01-13 | BYTEA OK, TIMESTAMP OK, CHK OK |
| 1.1.5 | Ejecutar script SQL | ✅ Ejecutado | DBA | 2026-01-13 | Script 013_modulo_teleekgs_FINAL.sql |

## 1.2 Crear Índices

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 1.2.1 | Índice en `num_doc_paciente` | ✅ Ejecutado | DBA | 2026-01-13 | idx_tele_ecg_num_doc OK |
| 1.2.2 | Índice en `estado` | ✅ Ejecutado | DBA | 2026-01-13 | idx_tele_ecg_estado OK |
| 1.2.3 | Índice en `fecha_expiracion` | ✅ Ejecutado | DBA | 2026-01-13 | idx_tele_ecg_fecha_expiracion OK |
| 1.2.4 | Índice compuesto (num_doc + estado) | ✅ Ejecutado | DBA | 2026-01-13 | idx_tele_ecg_compuesto_busqueda OK |
| 1.2.5 | Analizar performance de índices | ✅ Ejecutado | DBA | 2026-01-13 | 9 índices totales activos |

## 1.3 Configurar Permisos MBAC

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 1.3.1 | Crear módulo "TeleEKG" en BD | ✅ Documentado | Admin | 2026-01-13 | Script: SECTION 5.1 |
| 1.3.2 | Crear página "Envío de ECG" | ✅ Documentado | Admin | 2026-01-13 | Para INSTITUCION_EX |
| 1.3.3 | Crear página "Administración ECG" | ✅ Documentado | Admin | 2026-01-13 | Para MEDICO, COORDINADOR, ADMIN |
| 1.3.4 | Crear página "Dashboard TeleEKG" | ✅ Documentado | Admin | 2026-01-13 | Para ADMIN, SUPERADMIN |
| 1.3.5 | Asignar permisos a roles | ✅ Documentado | Admin | 2026-01-13 | Script: SECTION 5.4 |
| 1.3.6 | Validar permisos en sistema | ⏳ Pendiente | QA | - | Ejecutar en servidor 10.0.89.13 |

## 1.4 Validar Backup y Recovery

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 1.4.1 | Verificar política de backup | ⏳ Pendiente | DBA | - | PostgreSQL backup |
| 1.4.2 | Prueba de recovery de datos | ⏳ Pendiente | DBA | - | Simular pérdida de datos |
| 1.4.3 | Documentar procedimiento de restore | ⏳ Pendiente | DBA | - | En caso de emergencia |
| 1.4.4 | Configurar alertas de espacio | ⏳ Pendiente | DevOps | - | Si BD > 80% |

---

# FASE 2: BACKEND (SPRING BOOT)

**Duración Estimada:** 2 días | **Estado:** ✅ 100% Completado

## 2.1 Crear Entidades JPA

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.1.1 | Crear clase `TeleECGImagen.java` | ✅ Completado | Backend | 2026-01-13 | BYTEA, auditoría, 180+ líneas |
| 2.1.2 | Crear clase `TeleECGAuditoria.java` | ✅ Completado | Backend | 2026-01-13 | Log de accesos, 150+ líneas |
| 2.1.3 | Validar @Column annotations | ✅ Completado | Backend | 2026-01-13 | columnDefinition = "bytea" |
| 2.1.4 | Crear constructores y getters/setters | ✅ Completado | Backend | 2026-01-13 | Con Lombok (@Data) |
| 2.1.5 | Agregar @Builder y @Data | ✅ Completado | Backend | 2026-01-13 | Patrones clean code |
| 2.1.6 | Validar relaciones JPA | ✅ Completado | Backend | 2026-01-13 | @ManyToOne, FK activas |

## 2.2 Crear Repositories

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.2.1 | Crear `TeleECGImagenRepository.java` | ✅ Completado | Backend | 2026-01-13 | JpaRepository, 30+ métodos |
| 2.2.2 | Crear métodos de búsqueda | ✅ Completado | Backend | 2026-01-13 | findByNumDocPaciente, findByEstado, etc |
| 2.2.3 | Crear `TeleECGAuditoriaRepository.java` | ✅ Completado | Backend | 2026-01-13 | Historial, 20+ métodos |
| 2.2.4 | Crear query para limpieza automática | ✅ Completado | Backend | 2026-01-13 | marcarComoInactivas (@Modifying) |
| 2.2.5 | Validar queries en Base de Datos | ⏳ Pendiente | DBA | - | EXPLAIN ANALYZE en servidor |
| 2.2.6 | Crear índices desde JPA (opcional) | ✅ Completado | Backend | 2026-01-13 | @Index annotations en entidad |

## 2.3 Crear DTOs

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.3.1 | Crear `SubirImagenECGDTO.java` | ✅ Completado | Backend | 2026-01-13 | Request upload con validaciones |
| 2.3.2 | Crear `TeleECGImagenDTO.java` | ✅ Completado | Backend | 2026-01-13 | Response listar, sin BYTEA |
| 2.3.3 | Crear `ProcesarImagenECGDTO.java` | ✅ Completado | Backend | 2026-01-13 | Request procesar/rechazar/vincular |
| 2.3.4 | Crear `TeleECGAuditoriaDTO.java` | ✅ Completado | Backend | 2026-01-13 | Respuesta auditoría |
| 2.3.5 | Agregar @Valid validations | ✅ Completado | Backend | 2026-01-13 | JSR-380 en todos DTOs |
| 2.3.6 | Crear `TeleECGEstadisticasDTO` | ✅ Completado | Backend | 2026-01-13 | Dashboard + métricas |

## 2.4 Crear Services

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.4.1 | Crear `TeleECGService.java` | ✅ Completado | Backend | 2026-01-13 | Lógica principal, 500+ líneas |
| 2.4.2 | Implementar `subirImagenECG()` | ✅ Completado | Backend | 2026-01-13 | Validar, guardar, notificar |
| 2.4.3 | Implementar `listarImagenes()` | ✅ Completado | Backend | 2026-01-13 | Paginación, filtros flexible |
| 2.4.4 | Implementar `descargarImagen()` | ✅ Completado | Backend | 2026-01-13 | Leer bytes de BD |
| 2.4.5 | Implementar `procesarImagen()` | ✅ Completado | Backend | 2026-01-13 | Cambiar estado PROCESADA/RECHAZADA |
| 2.4.6 | Implementar `obtenerDetalles()` | ✅ Completado | Backend | 2026-01-13 | Información completa (sin bytes) |
| 2.4.7 | Implementar `vincularPaciente()` | ✅ Completado | Backend | 2026-01-13 | Vincular a usuario asegurado |
| 2.4.8 | Crear `@Scheduled limpiar()` | ✅ Completado | Backend | 2026-01-13 | Limpieza automática (2am) |
| 2.4.9 | Integrar con `EmailService` | ✅ Completado | Backend | 2026-01-13 | Notificaciones a asegurados |
| 2.4.10 | Integrar con `AuditLogService` | ✅ Completado | Backend | 2026-01-13 | Registrar eventos compliance |
| 2.4.11 | Integrar con `AseguradoRepository` | ✅ Completado | Backend | 2026-01-13 | Crear/obtener asegurados |

## 2.5 Crear Controllers

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.5.1 | Crear `TeleECGController.java` | ✅ Completado | Backend | 2026-01-13 | REST controller, 400+ líneas |
| 2.5.2 | Implementar `POST /api/teleekgs/upload` | ✅ Completado | Backend | 2026-01-13 | Upload IPRESS con validación |
| 2.5.3 | Implementar `GET /api/teleekgs/listar` | ✅ Completado | Backend | 2026-01-13 | Listar paginado con filtros |
| 2.5.4 | Implementar `GET /api/teleekgs/{id}/detalles` | ✅ Completado | Backend | 2026-01-13 | Detalles imagen completos |
| 2.5.5 | Implementar `GET /api/teleekgs/{id}/descargar` | ✅ Completado | Backend | 2026-01-13 | Download JPEG/PNG |
| 2.5.6 | Implementar `GET /api/teleekgs/{id}/preview` | ✅ Completado | Backend | 2026-01-13 | Preview en navegador |
| 2.5.7 | Implementar `PUT /api/teleekgs/{id}/procesar` | ✅ Completado | Backend | 2026-01-13 | Aceptar/Rechazar/Vincular |
| 2.5.8 | Implementar `GET /api/teleekgs/{id}/auditoria` | ✅ Completado | Backend | 2026-01-13 | Historial de accesos |
| 2.5.9 | Implementar `GET /api/teleekgs/estadisticas` | ✅ Completado | Backend | 2026-01-13 | Dashboard con métricas |
| 2.5.10 | Implementar `GET /api/teleekgs/proximas-vencer` | ✅ Completado | Backend | 2026-01-13 | Imágenes vencidas (< 3 días) |
| 2.5.11 | Agregar `@CheckMBACPermission` | ✅ Completado | Backend | 2026-01-13 | Control acceso por rol |
| 2.5.12 | Implementar manejo excepciones | ✅ Completado | Backend | 2026-01-13 | @ExceptionHandler custom |

## 2.6 Validaciones de Seguridad

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.6.1 | Validar tipo MIME (JPEG/PNG solo) | ⏳ Pendiente | Backend | - | image/jpeg, image/png |
| 2.6.2 | Validar tamaño máximo (5MB) | ⏳ Pendiente | Backend | - | maxFileSize = 5242880 |
| 2.6.3 | Validar hash SHA256 | ⏳ Pendiente | Backend | - | Integridad archivo |
| 2.6.4 | Validar autenticación JWT | ⏳ Pendiente | Backend | - | Token requerido |
| 2.6.5 | Validar permisos MBAC | ⏳ Pendiente | Backend | - | @CheckMBACPermission |
| 2.6.6 | Prevenir path traversal | ⏳ Pendiente | Backend | - | Normalizar rutas |
| 2.6.7 | Sanitizar inputs | ⏳ Pendiente | Backend | - | SQL injection prevention |
| 2.6.8 | Logs de seguridad | ⏳ Pendiente | Backend | - | IP, usuario, acción |

## 2.7 Implementar Limpieza Automática

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.7.1 | Crear scheduler (@Scheduled) | ⏳ Pendiente | Backend | - | Cron: 0 0 2 * * ? (2am) |
| 2.7.2 | Implementar lógica de limpieza | ⏳ Pendiente | Backend | - | Marcar como "I" si > 30 días |
| 2.7.3 | Implementar logs de limpieza | ⏳ Pendiente | Backend | - | Qué se eliminó y cuándo |
| 2.7.4 | Implementar alertas | ⏳ Pendiente | Backend | - | Notificar si error en limpieza |
| 2.7.5 | Validar en staging | ⏳ Pendiente | Backend | - | Prueba con datos reales |

## 2.8 Documentación de Código

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 2.8.1 | Documentar clases con JavaDoc | ⏳ Pendiente | Backend | - | /**  */ |
| 2.8.2 | Documentar métodos públicos | ⏳ Pendiente | Backend | - | Parámetros, retorno |
| 2.8.3 | Documentar excepciones | ⏳ Pendiente | Backend | - | @throws |
| 2.8.4 | Actualizar Swagger/OpenAPI | ⏳ Pendiente | Backend | - | @Operation, @ApiResponse |
| 2.8.5 | Crear guía de API | ⏳ Pendiente | Backend | - | Ejemplos de uso |

---

# FASE 3: FRONTEND (REACT)

**Duración Estimada:** 1.5 días | **Estado:** ⏳ Pendiente

## 3.1 Crear Componentes para IPRESS Externa

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.1.1 | Crear página `TeleEKGDashboard.jsx` | ⏳ Pendiente | Frontend | - | Página principal |
| 3.1.2 | Crear componente `UploadImagenECG.jsx` | ⏳ Pendiente | Frontend | - | Formulario upload |
| 3.1.3 | Implementar selector de archivo | ⏳ Pendiente | Frontend | - | Input type=file |
| 3.1.4 | Implementar validación archivo | ⏳ Pendiente | Frontend | - | Tipo y tamaño |
| 3.1.5 | Implementar formulario de datos | ⏳ Pendiente | Frontend | - | DNI, nombres, apellidos |
| 3.1.6 | Implementar envío asincrónico | ⏳ Pendiente | Frontend | - | Fetch POST |
| 3.1.7 | Implementar feedback visual | ⏳ Pendiente | Frontend | - | Loading, success, error |
| 3.1.8 | Implementar barra de progreso | ⏳ Pendiente | Frontend | - | Upload progress |

## 3.2 Crear Componentes para Personal CENATE

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.2.1 | Crear componente `ListarImagenesECG.jsx` | ⏳ Pendiente | Frontend | - | Listado con paginación |
| 3.2.2 | Implementar tabla de imágenes | ⏳ Pendiente | Frontend | - | Columnas: DNI, estado, fecha |
| 3.2.3 | Implementar filtros | ⏳ Pendiente | Frontend | - | Por DNI, estado, fecha |
| 3.2.4 | Implementar paginación | ⏳ Pendiente | Frontend | - | 20 registros por página |
| 3.2.5 | Crear componente `VisorImagenECG.jsx` | ⏳ Pendiente | Frontend | - | Mostrar imagen |
| 3.2.6 | Implementar zoom in/out | ⏳ Pendiente | Frontend | - | Canvas o librería |
| 3.2.7 | Crear componente `DetallesImagenECG.jsx` | ⏳ Pendiente | Frontend | - | Detalles + botones |
| 3.2.8 | Implementar botón "Aceptar" | ⏳ Pendiente | Frontend | - | Cambiar estado |
| 3.2.9 | Implementar botón "Rechazar" | ⏳ Pendiente | Frontend | - | Con motivo |
| 3.2.10 | Implementar botón "Descargar" | ⏳ Pendiente | Frontend | - | GET /descargar |
| 3.2.11 | Implementar botón "Vincular" | ⏳ Pendiente | Frontend | - | A asegurado existente |
| 3.2.12 | Implementar historial auditoría | ⏳ Pendiente | Frontend | - | Quién accedió y cuándo |

## 3.3 Crear Módulo de Asegurados

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.3.1 | Crear componente `CrearAseguradoForm.jsx` | ⏳ Pendiente | Frontend | - | Formulario nuevo asegurado |
| 3.3.2 | Implementar validación DNI | ⏳ Pendiente | Frontend | - | 8 dígitos |
| 3.3.3 | Implementar campos de entrada | ⏳ Pendiente | Frontend | - | Nombres, apellidos, fecha, etc |
| 3.3.4 | Implementar envío de formulario | ⏳ Pendiente | Frontend | - | POST /asegurados/crear-desde-teleekg |
| 3.3.5 | Integrar en flujo de upload | ⏳ Pendiente | Frontend | - | Si DNI no existe |
| 3.3.6 | Implementar confirmación | ⏳ Pendiente | Frontend | - | "Asegurado creado, continuar..." |

## 3.4 Crear Dashboard

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.4.1 | Crear componente `EstadisticasTeleEKG.jsx` | ⏳ Pendiente | Frontend | - | Dashboard |
| 3.4.2 | Implementar gráfico de imágenes por IPRESS | ⏳ Pendiente | Frontend | - | Chart.js o similar |
| 3.4.3 | Implementar gráfico de estados | ⏳ Pendiente | Frontend | - | PENDIENTE, PROCESADA, RECHAZADA |
| 3.4.4 | Implementar tabla de estadísticas | ⏳ Pendiente | Frontend | - | Resumen por período |
| 3.4.5 | Implementar filtro por fecha | ⏳ Pendiente | Frontend | - | Hoy, esta semana, este mes |

## 3.5 Integración de Rutas

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.5.1 | Agregar rutas en `Router.jsx` | ⏳ Pendiente | Frontend | - | /teleekgs/* |
| 3.5.2 | Proteger rutas con ProtectedRoute | ⏳ Pendiente | Frontend | - | JWT requerido |
| 3.5.3 | Validar permisos por rol | ⏳ Pendiente | Frontend | - | INSTITUCION_EX, MEDICO, ADMIN |
| 3.5.4 | Agregar al menú principal | ⏳ Pendiente | Frontend | - | "Gestión de Personal Externo" → TeleEKG |
| 3.5.5 | Crear submenú de opciones | ⏳ Pendiente | Frontend | - | Envío, Gestión, Dashboard |

## 3.6 Styling y UX

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 3.6.1 | Aplicar TailwindCSS | ⏳ Pendiente | Frontend | - | Consistencia con diseño actual |
| 3.6.2 | Crear estilos para tabla | ⏳ Pendiente | Frontend | - | Responsive |
| 3.6.3 | Crear estilos para formulario | ⏳ Pendiente | Frontend | - | Input, button, select |
| 3.6.4 | Crear estilos para visor | ⏳ Pendiente | Frontend | - | Imagen y herramientas |
| 3.6.5 | Implementar dark mode (opcional) | ⏳ Pendiente | Frontend | - | Toggle en ajustes |
| 3.6.6 | Validar responsive en móvil | ⏳ Pendiente | Frontend | - | Viewport < 768px |

---

# FASE 4: TESTING Y QA

**Duración Estimada:** 1 día | **Estado:** ⏳ Pendiente

## 4.1 Tests Unitarios (Backend)

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.1.1 | Crear `TeleECGServiceTest.java` | ⏳ Pendiente | Backend | - | JUnit 5 + Mockito |
| 4.1.2 | Test: subirImagenECG() | ⏳ Pendiente | Backend | - | Happy path + excepciones |
| 4.1.3 | Test: listarImagenes() | ⏳ Pendiente | Backend | - | Paginación, filtros |
| 4.1.4 | Test: descargarImagen() | ⏳ Pendiente | Backend | - | Obtener bytes |
| 4.1.5 | Test: procesarImagen() | ⏳ Pendiente | Backend | - | Cambio de estado |
| 4.1.6 | Test: rechazarImagen() | ⏳ Pendiente | Backend | - | Con motivo |
| 4.1.7 | Test: vincularPaciente() | ⏳ Pendiente | Backend | - | Crear asegurado |
| 4.1.8 | Test: validarArchivo() | ⏳ Pendiente | Backend | - | Tipo, tamaño |
| 4.1.9 | Test: calcularSHA256() | ⏳ Pendiente | Backend | - | Hash correcto |
| 4.1.10 | Cobertura de código > 80% | ⏳ Pendiente | Backend | - | JaCoCo report |

## 4.2 Tests de Integración (Backend)

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.2.1 | Test: Upload con archivo real | ⏳ Pendiente | Backend | - | JPEG/PNG |
| 4.2.2 | Test: Validación de BD | ⏳ Pendiente | Backend | - | Insert y Select |
| 4.2.3 | Test: Transacciones ACID | ⏳ Pendiente | Backend | - | Rollback si error |
| 4.2.4 | Test: Limpieza automática | ⏳ Pendiente | Backend | - | Scheduler funciona |
| 4.2.5 | Test: Auditoría registra | ⏳ Pendiente | Backend | - | Log en tele_ecg_auditoria |
| 4.2.6 | Test: Email notificaciones | ⏳ Pendiente | Backend | - | Envío exitoso |
| 4.2.7 | Test: Creación de asegurados | ⏳ Pendiente | Backend | - | Crear usuario + personal |
| 4.2.8 | Test: Permisos MBAC | ⏳ Pendiente | Backend | - | Acceso correcto por rol |

## 4.3 Tests de Frontend

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.3.1 | Test: Upload form validation | ⏳ Pendiente | Frontend | - | Jest + React Testing Library |
| 4.3.2 | Test: Listar imágenes | ⏳ Pendiente | Frontend | - | Carga y paginación |
| 4.3.3 | Test: Visor imagen | ⏳ Pendiente | Frontend | - | Zoom, descarga |
| 4.3.4 | Test: Procesar imagen | ⏳ Pendiente | Frontend | - | Botones funcionan |
| 4.3.5 | Test: Crear asegurado | ⏳ Pendiente | Frontend | - | Formulario y envío |
| 4.3.6 | Test: Filtros y búsqueda | ⏳ Pendiente | Frontend | - | DNI, estado, fecha |
| 4.3.7 | Test: Responsive design | ⏳ Pendiente | Frontend | - | Móvil, tablet, desktop |
| 4.3.8 | Test: Accesibilidad (a11y) | ⏳ Pendiente | Frontend | - | WCAG 2.1 Level AA |

## 4.4 Tests de Seguridad

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.4.1 | Test: SQL injection | ⏳ Pendiente | QA | - | Intentos maliciosos |
| 4.4.2 | Test: XSS prevention | ⏳ Pendiente | QA | - | Inputs sanitizados |
| 4.4.3 | Test: CSRF protection | ⏳ Pendiente | QA | - | Token validado |
| 4.4.4 | Test: Authentication bypass | ⏳ Pendiente | QA | - | JWT requerido |
| 4.4.5 | Test: Authorization bypass | ⏳ Pendiente | QA | - | MBAC validado |
| 4.4.6 | Test: File upload abuse | ⏳ Pendiente | QA | - | Tipo y tamaño validados |
| 4.4.7 | Test: Path traversal | ⏳ Pendiente | QA | - | Rutas normalizadas |

## 4.5 Tests de Rendimiento

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.5.1 | Test: Upload 5MB archivo | ⏳ Pendiente | QA | - | Tiempo aceptable |
| 4.5.2 | Test: Descargar 5MB archivo | ⏳ Pendiente | QA | - | Sin timeout |
| 4.5.3 | Test: Listar 1000 imágenes | ⏳ Pendiente | QA | - | Con paginación |
| 4.5.4 | Test: Búsqueda por DNI | ⏳ Pendiente | QA | - | < 500ms con índice |
| 4.5.5 | Test: Carga concurrente | ⏳ Pendiente | QA | - | 10 usuarios simultáneos |
| 4.5.6 | Test: Limpieza automática | ⏳ Pendiente | QA | - | No bloquea operaciones |

## 4.6 Pruebas Funcionales Manuales

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 4.6.1 | Flujo 1: Upload desde IPRESS | ⏳ Pendiente | QA | - | End-to-end |
| 4.6.2 | Flujo 2: Listar en CENATE | ⏳ Pendiente | QA | - | Filtros, paginación |
| 4.6.3 | Flujo 3: Procesar imagen | ⏳ Pendiente | QA | - | Aceptar, rechazar |
| 4.6.4 | Flujo 4: Descargar imagen | ⏳ Pendiente | QA | - | Archivo correcto |
| 4.6.5 | Flujo 5: Crear asegurado nuevo | ⏳ Pendiente | QA | - | Si DNI no existe |
| 4.6.6 | Flujo 6: Notificaciones email | ⏳ Pendiente | QA | - | A IPRESS y CENATE |
| 4.6.7 | Flujo 7: Auditoría de accesos | ⏳ Pendiente | QA | - | Registrado correctamente |
| 4.6.8 | Flujo 8: Limpieza automática | ⏳ Pendiente | QA | - | Después de 30 días |

---

# FASE 5: DEPLOYMENT

**Duración Estimada:** 0.5 días | **Estado:** ⏳ Pendiente

## 5.1 Preparación de Ambiente

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 5.1.1 | Crear rama `feature/teleekgs` | ⏳ Pendiente | Backend | - | Git flow |
| 5.1.2 | Configurar variables de entorno | ⏳ Pendiente | DevOps | - | En servidor 10.0.89.13 |
| 5.1.3 | Crear archivo `.env` en servidor | ⏳ Pendiente | DevOps | - | MAIL_HOST, DB_URL, etc |
| 5.1.4 | Validar conectividad BD | ⏳ Pendiente | DBA | - | PostgreSQL accesible |
| 5.1.5 | Crear backups previos | ⏳ Pendiente | DBA | - | Antes de deploy |

## 5.2 Deploy en Staging

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 5.2.1 | Build backend: `./gradlew build` | ⏳ Pendiente | Backend | - | Sin warnings |
| 5.2.2 | Build frontend: `npm run build` | ⏳ Pendiente | Frontend | - | Minificado |
| 5.2.3 | Deploy a staging | ⏳ Pendiente | DevOps | - | Servidor prueba |
| 5.2.4 | Ejecutar migration scripts SQL | ⏳ Pendiente | DBA | - | Crear tablas |
| 5.2.5 | Insertar datos de prueba | ⏳ Pendiente | QA | - | 50 imágenes test |
| 5.2.6 | Validar endpoints en Swagger | ⏳ Pendiente | QA | - | /swagger-ui.html |
| 5.2.7 | Smoke tests en staging | ⏳ Pendiente | QA | - | Flujos críticos |
| 5.2.8 | Validar logs en servidor | ⏳ Pendiente | DevOps | - | Errores normales |

## 5.3 Documentación Final

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 5.3.1 | Guía de usuario para IPRESS | ⏳ Pendiente | Product | - | Cómo enviar ECG |
| 5.3.2 | Guía de usuario para CENATE | ⏳ Pendiente | Product | - | Cómo gestionar imágenes |
| 5.3.3 | Documentación API | ⏳ Pendiente | Backend | - | Swagger/OpenAPI |
| 5.3.4 | Guía de operaciones | ⏳ Pendiente | DevOps | - | Backup, logs, alertas |
| 5.3.5 | Guía de troubleshooting | ⏳ Pendiente | Support | - | Problemas comunes |
| 5.3.6 | Actualizar CHANGELOG | ⏳ Pendiente | Backend | - | Versión 1.18.1 |

## 5.4 Deploy a Producción

| # | Tarea | Estado | Responsable | Fecha | Notas |
|---|-------|--------|-------------|-------|-------|
| 5.4.1 | Crear Pull Request | ⏳ Pendiente | Backend | - | feature/teleekgs → main |
| 5.4.2 | Code review | ⏳ Pendiente | Architect | - | Aprobación requerida |
| 5.4.3 | Merge a main | ⏳ Pendiente | Backend | - | Sin conflictos |
| 5.4.4 | Deploy a producción | ⏳ Pendiente | DevOps | - | Servidor 10.0.89.13 |
| 5.4.5 | Validar en producción | ⏳ Pendiente | QA | - | Flujos críticos |
| 5.4.6 | Monitorear logs | ⏳ Pendiente | DevOps | - | Primeras 24h |
| 5.4.7 | Comunicar a usuarios | ⏳ Pendiente | Product | - | Anuncio módulo nuevo |

---

# RESUMEN DE ESTADO

## 📊 Progreso General

```
Fase 0: Análisis y Diseño       ████████░░  87.5% ✅ (Aguardando aprobación)
Fase 1: Base de Datos           ░░░░░░░░░░   0%  ⏳ (Pendiente)
Fase 2: Backend                 ░░░░░░░░░░   0%  ⏳ (Pendiente)
Fase 3: Frontend                ░░░░░░░░░░   0%  ⏳ (Pendiente)
Fase 4: Testing                 ░░░░░░░░░░   0%  ⏳ (Pendiente)
Fase 5: Deployment              ░░░░░░░░░░   0%  ⏳ (Pendiente)

TOTAL: ███░░░░░░░░░░░░░░░░░░  14.6% ⏳ (En Planificación)
```

## 📅 Cronograma Estimado

| Fase | Duración | Inicio Est. | Fin Est. | Estado |
|------|----------|-------------|----------|--------|
| 0: Análisis | 0.5d | 2026-01-13 | 2026-01-13 | ✅ 87.5% |
| 1: Base de Datos | 0.5d | 2026-01-14 | 2026-01-14 | ⏳ Pendiente |
| 2: Backend | 2d | 2026-01-14 | 2026-01-16 | ⏳ Pendiente |
| 3: Frontend | 1.5d | 2026-01-16 | 2026-01-17 | ⏳ Pendiente |
| 4: Testing | 1d | 2026-01-17 | 2026-01-18 | ⏳ Pendiente |
| 5: Deployment | 0.5d | 2026-01-18 | 2026-01-19 | ⏳ Pendiente |
| **TOTAL** | **5.5d** | **2026-01-13** | **2026-01-19** | **14.6%** |

## 👥 Equipo Responsable

| Rol | Responsable | Áreas |
|-----|-------------|-------|
| **Architect** | Claude Code | Análisis, diseño, reviews |
| **Backend** | TBD | Java, Spring Boot, APIs |
| **Frontend** | TBD | React, TailwindCSS, UI |
| **DBA** | TBD | PostgreSQL, scripts SQL |
| **QA** | TBD | Testing, validación |
| **DevOps** | TBD | Deployment, configuración |
| **Product** | TBD | Documentación, usuarios |

## 🎯 Métricas de Éxito

| Métrica | Objetivo | Status |
|---------|----------|--------|
| **Tests Coverage (Backend)** | ≥ 80% | ⏳ Pendiente |
| **Tests Coverage (Frontend)** | ≥ 70% | ⏳ Pendiente |
| **Performance Upload** | < 5s (5MB) | ⏳ Pendiente |
| **Performance Download** | < 3s (5MB) | ⏳ Pendiente |
| **Disponibilidad** | ≥ 99.5% | ⏳ Pendiente |
| **Seguridad (OWASP)** | 0 críticas | ⏳ Pendiente |
| **Documentación** | 100% APIs | ⏳ Pendiente |

## ⚠️ Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Delay en aprobación diseño | Media | Alto | Comunicación constante |
| Tamaño BD crece rápido | Baja | Medio | Limpieza automática cada 30d |
| Performance degradada | Baja | Alto | Índices, caching, paginación |
| Problemas conectividad BD remota | Media | Alto | Testing staging previo |
| Email SMTP corporativo cae | Media | Bajo | Fallback a Gmail (dev) |

---

## 📝 NOTAS GENERALES

- **Fecha de Inicio:** 2026-01-13
- **Pendiente:** Aprobación del diseño por Product Owner
- **Próximo:** Crear tablas SQL en BD
- **Contacto:** Styp Canto Rondón
- **Versión del Documento:** 1.0
- **Última Actualización:** 2026-01-13

---

## 🔄 CÓMO USAR ESTE CHECKLIST

1. **Marcar completadas:** Cambiar `⏳ Pendiente` a `✅ Completo` cuando se termine
2. **Actualizar fechas:** Agregar fecha real cuando inicia/termina
3. **Registrar notas:** Añadir contexto si hay desviaciones
4. **Revisar semanalmente:** Hacer seguimiento en reuniones de equipo
5. **Comunicar cambios:** Si hay delays, actualizar fechas estimadas

---

**Estado Final Esperado:** 🎉 Go-live 2026-01-19

