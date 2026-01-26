# Plan de Implementación Spring AI - CENATE

**Versión:** 1.0.0
**Fecha:** 2026-01-26
**Autor:** Ing. Styp Canto Rondón
**Módulo:** Spring AI Integration

---

## Visión General

Integrar Spring AI en CENATE para proporcionar asistentes virtuales inteligentes que mejoren la experiencia del paciente y la eficiencia operativa del personal médico.

---

## Fases de Implementación

### FASE 1: Infraestructura Base (Semana 1-2)

**Objetivo:** Establecer la arquitectura Clean Architecture para Spring AI.

#### Tareas Backend
- [x] Crear estructura de carpetas `ai/domain`, `ai/application`, `ai/infrastructure`
- [x] Definir port interfaces (`LLMServicePort`, `PromptTemplatePort`, etc.)
- [x] Implementar domain models (`MensajeLLM`, `ConversacionContext`, etc.)
- [x] Implementar domain exceptions
- [x] Configurar Spring AI en `build.gradle`
- [ ] Configurar `application.properties` con variables de entorno
- [ ] Implementar `AnthropicClaudeAdapter`
- [ ] Implementar `InMemoryConversacionMemoryAdapter` (memoria básica)
- [ ] Implementar `FileSystemPromptTemplateAdapter`

#### Testing
- [ ] Unit tests de domain models
- [ ] Unit tests de adapters (con mocks)
- [ ] Test de conexión con Anthropic API

#### Entregables
- [ ] Estructura de carpetas completa
- [ ] Documentación de arquitectura (`spec/01_Backend/09_arquitectura_spring_ai.md`)
- [ ] Configuración funcionando con Claude 3.5 Sonnet

**Estimación:** 10 días hábiles

---

### FASE 2: Caso de Uso - Chatbot Disponibilidad (Semana 3-4)

**Objetivo:** Implementar el primer caso de uso completo: Chatbot de Disponibilidad de Citas.

#### Tareas Backend
- [ ] Implementar `DisponibilidadCitasUseCase` interface
- [ ] Implementar `DisponibilidadCitasUseCaseService`
- [ ] Implementar `ChatOrchestrationService`
- [ ] Implementar `SpringAIFunctionCallingAdapter`
- [ ] Registrar funciones: `buscarDisponibilidadMedica`, `confirmarCita`
- [ ] Implementar `ChatbotDisponibilidadController`
- [ ] Crear DTOs (`ChatRequestDTO`, `ChatResponseDTO`)
- [ ] Integrar con `AuditLogService` (auditoría IA)
- [ ] Crear prompt template `chatbot-disponibilidad-system-v1.txt`

#### Tareas Frontend
- [ ] Componente React `ChatbotDisponibilidad.jsx`
- [ ] UI de chat con burbujas de mensajes
- [ ] Renderizado de sugerencias de disponibilidad
- [ ] Botón de confirmación de cita
- [ ] Manejo de estados (cargando, error, éxito)
- [ ] Integración con servicio API

#### Testing
- [ ] Unit tests del use case service
- [ ] Integration tests del controller
- [ ] Tests de Function Calling
- [ ] Tests end-to-end (Postman/REST Client)
- [ ] Testing manual con usuarios reales (piloto)

#### Entregables
- [ ] Chatbot funcional en `/api/ai/chatbot-disponibilidad`
- [ ] Frontend integrado en `/disponibilidad` (ruta nueva)
- [ ] Documentación de uso (`spec/02_Modulos_Usuarios/03_chatbot_disponibilidad.md`)
- [ ] Video demo del flujo completo

**Estimación:** 10 días hábiles

---

### FASE 3: Optimización y Mejoras (Semana 5)

**Objetivo:** Optimizar rendimiento, reducir costos y mejorar experiencia.

#### Tareas
- [ ] Implementar `RedisConversacionMemoryAdapter` (reemplazar InMemory)
- [ ] Implementar caché de prompts (Caffeine)
- [ ] Implementar rate limiting en endpoints IA
- [ ] Optimizar cantidad de mensajes en contexto (A/B testing)
- [ ] Implementar resumen automático de conversaciones largas
- [ ] Agregar métricas Actuator para monitoreo
- [ ] Implementar fallback a OpenAI si Anthropic falla
- [ ] Validación avanzada de respuestas del LLM

#### Testing
- [ ] Load testing (JMeter) - 100 usuarios concurrentes
- [ ] Stress testing - límite de API
- [ ] Monitoreo de costos (tracking de tokens)

#### Entregables
- [ ] Sistema optimizado con Redis
- [ ] Métricas visibles en Grafana/Actuator
- [ ] Reporte de costos real vs estimado
- [ ] Plan de escalabilidad

**Estimación:** 5 días hábiles

---

### FASE 4: Caso de Uso - Asistente Diagnóstico (Semana 6-7)

**Objetivo:** Implementar asistente de diagnóstico para Personal Externo.

#### Tareas Backend
- [ ] Implementar `DiagnosticoAsistenteUseCase`
- [ ] Implementar `DiagnosticoAsistenteUseCaseService`
- [ ] Crear prompt template `asistente-diagnostico-system-v1.txt`
- [ ] Implementar controller `AsistenteDiagnosticoController`
- [ ] Integrar con formulario de diagnóstico existente
- [ ] Validar sugerencias con base de conocimiento médica (opcional)

#### Tareas Frontend
- [ ] Componente React `AsistenteDiagnostico.jsx`
- [ ] Wizard multi-paso (síntomas → análisis → sugerencia)
- [ ] Visualización de nivel de urgencia (BAJA/MEDIA/ALTA/CRITICA)
- [ ] Integración con formulario existente

#### Testing
- [ ] Validación médica con personal de CENATE
- [ ] Casos de prueba con síntomas conocidos
- [ ] Comparación diagnóstico IA vs diagnóstico real

#### Entregables
- [ ] Asistente funcional integrado en formulario
- [ ] Documentación de precisión (benchmark)
- [ ] Disclaimer legal visible en UI

**Estimación:** 10 días hábiles

---

### FASE 5: Caso de Uso - Análisis Tele-ECG (Semana 8-9)

**Objetivo:** Implementar análisis preliminar de imágenes ECG con IA.

#### Tareas Backend
- [ ] Implementar `AnalisisTeleECGUseCase`
- [ ] Implementar `AnalisisTeleECGUseCaseService`
- [ ] Adaptar `analyzeImage()` en `AnthropicClaudeAdapter`
- [ ] Crear prompt template `analisis-ecg-system-v1.txt`
- [ ] Implementar controller `AnalizadorTeleECGController`
- [ ] Integrar con módulo Tele-ECG existente (v1.24.0)
- [ ] Guardar análisis IA en nueva tabla `dim_teleecg_analisis_ia`

#### Tareas Frontend
- [ ] Botón "Análisis IA" en modal de revisión ECG
- [ ] Panel lateral con resultados de IA
- [ ] Visualización de hallazgos destacados
- [ ] Alertas si detecta severidad ALTA/CRITICA

#### Testing
- [ ] Validación con cardiólogos de CENATE
- [ ] Casos de prueba con ECGs normales y anormales
- [ ] Benchmark de precisión vs diagnóstico médico

#### Entregables
- [ ] Análisis IA integrado en módulo Tele-ECG
- [ ] Reporte de precisión (sensibilidad, especificidad)
- [ ] Disclaimer: "Análisis preliminar, requiere validación médica"

**Estimación:** 10 días hábiles

---

### FASE 6: Caso de Uso - Generador Reportes (Semana 10)

**Objetivo:** Automatizar generación de reportes médicos narrativos.

#### Tareas Backend
- [ ] Implementar `GeneracionReporteMedicoUseCase`
- [ ] Implementar `GeneracionReporteMedicoUseCaseService`
- [ ] Crear prompt template `generador-reporte-medico-v1.txt`
- [ ] Implementar controller `GeneradorReportesMedicosController`
- [ ] Integrar con módulo de pacientes

#### Tareas Frontend
- [ ] Botón "Generar Reporte IA" en perfil de paciente
- [ ] Editor de reportes generados (permitir ajustes)
- [ ] Exportar a PDF

#### Testing
- [ ] Validación de formato y contenido
- [ ] Comparación reportes IA vs reportes manuales

#### Entregables
- [ ] Generador de reportes funcional
- [ ] Plantillas de reportes estándar

**Estimación:** 5 días hábiles

---

### FASE 7: Producción y Monitoreo (Semana 11-12)

**Objetivo:** Desplegar a producción con monitoreo completo.

#### Tareas DevOps
- [ ] Configurar variables de entorno en servidor producción
- [ ] Configurar Redis cluster para memoria distribuida
- [ ] Configurar logs centralizados (ELK Stack)
- [ ] Configurar alertas de costos (si tokens > umbral)
- [ ] Configurar backup de conversaciones (auditoría)
- [ ] Health checks automatizados de servicio LLM

#### Tareas Seguridad
- [ ] Audit log de todas las interacciones IA
- [ ] Encriptación de mensajes sensibles (HIPAA-like)
- [ ] Rate limiting por usuario (prevenir abuso)
- [ ] Validación de permisos MBAC en endpoints IA

#### Documentación
- [ ] Manual de usuario (chatbot)
- [ ] Manual de administrador (configuración)
- [ ] Runbook de incidentes (troubleshooting)
- [ ] Plan de contingencia (si LLM cae)

#### Entregables
- [ ] Sistema desplegado en producción
- [ ] Dashboard de monitoreo activo
- [ ] Documentación completa
- [ ] Plan de capacitación para usuarios

**Estimación:** 10 días hábiles

---

## Cronograma General

| Fase | Duración | Fecha Inicio | Fecha Fin |
|------|----------|--------------|-----------|
| **FASE 1** - Infraestructura | 10 días | 2026-02-03 | 2026-02-14 |
| **FASE 2** - Chatbot Disponibilidad | 10 días | 2026-02-17 | 2026-02-28 |
| **FASE 3** - Optimización | 5 días | 2026-03-03 | 2026-03-07 |
| **FASE 4** - Asistente Diagnóstico | 10 días | 2026-03-10 | 2026-03-21 |
| **FASE 5** - Análisis Tele-ECG | 10 días | 2026-03-24 | 2026-04-04 |
| **FASE 6** - Generador Reportes | 5 días | 2026-04-07 | 2026-04-11 |
| **FASE 7** - Producción | 10 días | 2026-04-14 | 2026-04-25 |

**TOTAL:** 60 días hábiles (~12 semanas / 3 meses)

---

## Recursos Necesarios

### Humanos
- 1 Backend Developer (Java/Spring Boot) - Full time
- 1 Frontend Developer (React) - Full time
- 1 DevOps Engineer - Part time (Fases 1, 3, 7)
- 1 QA Engineer - Part time (todas las fases)
- 1 Product Owner (médico de CENATE) - Validación y testing

### Tecnológicos
- Anthropic API Key (Claude 3.5 Sonnet) - **$300/mes estimado**
- Servidor Redis (4GB RAM mínimo)
- Almacenamiento PostgreSQL (+50GB para historial IA)
- Monitoring tools (Grafana, Prometheus)

### Presupuesto Estimado

| Ítem | Costo Mensual | Costo 3 Meses |
|------|--------------|---------------|
| Anthropic API | $300 | $900 |
| Servidor Redis | $50 | $150 |
| Almacenamiento | $20 | $60 |
| Monitoring | $30 | $90 |
| **TOTAL** | **$400** | **$1,200 USD** |

---

## Riesgos y Mitigación

### Riesgo 1: Costos de API exceden presupuesto
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Implementar límites de uso diario
- Caché agresivo de respuestas comunes
- Usar Claude Haiku para tareas simples
- Alertas automáticas si costo > 80% presupuesto

### Riesgo 2: Latencia alta del LLM
**Probabilidad:** Media
**Impacto:** Medio
**Mitigación:**
- Streaming de respuestas (mostrar texto mientras se genera)
- Timeout de 30 segundos máximo
- Fallback a respuestas pre-programadas si timeout

### Riesgo 3: Precisión baja del LLM
**Probabilidad:** Media
**Impacto:** Alto (especialmente en diagnóstico y ECG)
**Mitigación:**
- Prompt engineering riguroso
- Validación médica obligatoria de resultados
- Disclaimer legal visible
- Benchmarking continuo vs diagnósticos reales

### Riesgo 4: Servicio Anthropic caído
**Probabilidad:** Baja
**Impacto:** Crítico
**Mitigación:**
- Fallback automático a OpenAI
- Modo degradado (sin IA, funcionalidad manual)
- SLA monitoring con alertas

---

## Criterios de Éxito

### Fase 2 (Chatbot Disponibilidad)
- ✅ 80% de usuarios completan búsqueda sin asistencia humana
- ✅ Tiempo promedio de conversación < 3 minutos
- ✅ Precisión de sugerencias > 90%
- ✅ Satisfacción usuarios (NPS) > 8/10

### Fase 4 (Asistente Diagnóstico)
- ✅ Precisión diagnóstica > 70% comparado con diagnóstico real
- ✅ Tiempo de generación < 30 segundos
- ✅ Reducción 30% en tiempo de llenado de formulario

### Fase 5 (Análisis Tele-ECG)
- ✅ Sensibilidad > 85% (detecta anomalías reales)
- ✅ Especificidad > 80% (no falsos positivos)
- ✅ Aprobación médica formal para uso clínico

### General
- ✅ Costo mensual < $400 USD
- ✅ Uptime > 99.5%
- ✅ Latencia p95 < 5 segundos
- ✅ Cero incidentes de seguridad (leaks de datos)

---

## Próximos Pasos Inmediatos

1. **Aprobar presupuesto** ($1,200 USD para 3 meses)
2. **Obtener API key de Anthropic** (crear cuenta organizacional)
3. **Asignar equipo de desarrollo** (2 devs + 1 QA)
4. **Kickoff meeting** con stakeholders médicos
5. **Iniciar FASE 1** (2026-02-03)

---

**Aprobado por:** _________________________
**Fecha:** _________________________

---

**Autor:** Ing. Styp Canto Rondón
**EsSalud Perú - CENATE**
**Versión:** 1.0.0 | 2026-01-26
