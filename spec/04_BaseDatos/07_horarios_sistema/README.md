# Documentación: Sistema de Horarios CENATE

**Ubicación:** `spec/04_BaseDatos/07_horarios_sistema/`
**Fecha creación:** 2026-01-03
**Propósito:** Documentar el modelo existente de horarios y su integración con nuevos módulos

---

## 📚 CONTENIDO DE ESTA CARPETA

### 1. `01_modelo_horarios_existente.md`

**Propósito:** Documentación técnica completa del modelo de horarios existente en la base de datos `maestro_cenate`.

**Contenido:**
- Modelo de datos completo (`ctr_periodo`, `ctr_horario`, `ctr_horario_det`, etc.)
- Reglas de negocio implementadas
- Flujo de carga de horarios por periodo
- Checklist operativo para evitar errores
- 50+ consultas SQL listas para usar (validación, auditoría, troubleshooting)
- Relación con el nuevo módulo de disponibilidad médica
- Troubleshooting de problemas comunes

**Cuándo usar:**
- ✅ Necesitas entender cómo funciona el sistema de horarios actual
- ✅ Vas a cargar horarios manualmente en `ctr_horario`
- ✅ Estás debuggeando por qué no aparecen slots en el chatbot
- ✅ Necesitas consultas SQL de validación o auditoría
- ✅ Estás diseñando una integración con el sistema existente

**No usar para:**
- ❌ Implementar el nuevo módulo de disponibilidad médica (ver `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`)

---

### 2. `02_guia_integracion_horarios.md`

**Propósito:** Guía práctica para integrar nuevos módulos con el sistema existente de horarios.

**Contenido:**
- Comparación rápida: Sistema existente vs Nuevo módulo
- 3 estrategias de integración (Independientes, Sincronización, Migración)
- Ejemplos de código (Java, SQL, React) para cada estrategia
- Casos de uso comunes con implementaciones
- Endpoints nuevos a crear para coordinadores y médicos
- Checklist de integración por módulo
- Queries útiles para debugging
- Advertencias importantes

**Cuándo usar:**
- ✅ Estás implementando disponibilidad médica y necesitas decidir cómo integrar
- ✅ Quieres sincronizar `disponibilidad_medica` con `ctr_horario`
- ✅ Necesitas crear endpoints para consultar horarios del chatbot
- ✅ Vas a implementar validaciones de consistencia entre sistemas
- ✅ Estás creando reportes comparativos

**No usar para:**
- ❌ Carga operativa de horarios (usa `01_modelo_horarios_existente.md`)

---

## 🎯 FLUJO DE USO RECOMENDADO

### Para Administradores de BD

1. Leer `01_modelo_horarios_existente.md` secciones 3-4 (modelo + reglas)
2. Usar checklist operativo (sección 6)
3. Ejecutar queries de validación (sección 7)
4. Consultar troubleshooting (sección 9) si hay problemas

### Para Desarrolladores Backend

1. Leer `01_modelo_horarios_existente.md` sección 3 (modelo de datos)
2. Leer `02_guia_integracion_horarios.md` sección 3 (estrategias)
3. Implementar estrategia elegida (Opción 1 recomendada)
4. Crear endpoints según sección 5 de guía de integración
5. Implementar validaciones de consistencia

### Para Desarrolladores Frontend

1. Leer `02_guia_integracion_horarios.md` sección 4 (casos de uso)
2. Implementar componentes según ejemplos
3. Integrar con endpoints creados por backend

### Para Coordinadores/Usuarios Finales

1. Leer `01_modelo_horarios_existente.md` secciones 1-2 (resumen + objetivo)
2. Usar checklist operativo antes de cada carga
3. Ejecutar queries básicas de validación

---

## 🔗 RELACIÓN CON OTROS DOCUMENTOS

### Planes de Implementación

- `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` - Nuevo módulo de disponibilidad
- `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` - Solicitud de turnos
- `plan/02_Modulos_Medicos/03_plan_trazabilidad_clinica.md` - Trazabilidad clínica

### Scripts SQL

- `spec/04_BaseDatos/06_scripts/` - Scripts de creación de tablas
- Queries específicas están dentro de `01_modelo_horarios_existente.md`

### Guías Operativas

- PDF original: `Guia_operativa_horarios_maestro_cenate.pdf` (v1.0, 16/12/2025)
- Esta documentación es la versión ampliada y contextualizada para CENATE

---

## 📊 COMPARACIÓN RÁPIDA: DOS SISTEMAS

| Aspecto | `ctr_horario` (Existente) | `disponibilidad_medica` (Nuevo) |
|---------|---------------------------|----------------------------------|
| **Archivo de referencia** | `01_modelo_horarios_existente.md` | `plan/.../01_plan_disponibilidad_turnos.md` |
| **Propósito** | Slots para chatbot | Declaración médicos |
| **Usuario** | Coordinadores | Médicos + Coordinadores |
| **Estados** | Sin flujo | BORRADOR → ENVIADO → REVISADO |
| **Validación** | Catálogos + FK | 150 horas mínimas |
| **Salida** | `vw_slots_disponibles_chatbot` | Disponibilidad aprobada |

---

## ⚠️ IMPORTANTE: NO CONFUNDIR

### Sistema Existente (`ctr_horario`)

```sql
-- Este es el sistema PRODUCTIVO del chatbot
-- NO modificar sin coordinación con equipo de chatbot
-- Genera slots reales para citas de pacientes
ctr_horario + ctr_horario_det + vw_slots_disponibles_chatbot
```

### Nuevo Módulo (`disponibilidad_medica`)

```sql
-- Este es el NUEVO sistema de declaración voluntaria
-- En desarrollo, NO está en producción
-- Sirve para planificación, no genera slots directamente
disponibilidad_medica + detalle_disponibilidad
```

---

## 🛠️ MANTENIMIENTO DE ESTA DOCUMENTACIÓN

### Actualizar cuando:

- [ ] Se modifica el modelo de `ctr_horario` en producción
- [ ] Se implementa una nueva estrategia de integración
- [ ] Se crean nuevos endpoints relacionados con horarios
- [ ] Se descubren nuevos problemas comunes (añadir a troubleshooting)
- [ ] Cambian reglas de negocio del chatbot

### Responsable:

- **Administrador de BD:** Actualizar `01_modelo_horarios_existente.md`
- **Developer Lead:** Actualizar `02_guia_integracion_horarios.md`

---

## 📝 HISTORIAL DE VERSIONES

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0.0 | 2026-01-03 | Creación inicial basada en PDF del admin BD | Ing. Styp Canto Rondón |

---

## 📧 CONTACTO

Para dudas o sugerencias sobre esta documentación:
- **Administrador BD:** Responsable del modelo `ctr_horario`
- **Developer Lead:** Ing. Styp Canto Rondón - Implementación de nuevos módulos

---

*Esta documentación es parte del proyecto CENATE - Sistema de Telemedicina EsSalud Perú*
