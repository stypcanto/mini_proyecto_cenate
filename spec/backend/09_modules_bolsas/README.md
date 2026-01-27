# Módulo de Solicitudes de Bolsa

**Versión:** v1.9.0 | **Status:** ✅ Production Ready - Enriquecimiento IPRESS/RED v1.9.0

## 📚 Documentación Principal

### 🚀 v1.9.0 - NUEVO (2026-01-26)
**⭐ COMIENZA AQUÍ (v1.9.0):** [`09_modulo_solicitudes_bolsa_import_v1.9.0.md`](./09_modulo_solicitudes_bolsa_import_v1.9.0.md)
- Excel import con enriquecimiento automático
- 43 campos en dim_solicitud_bolsa (completo)
- Enriquecimiento: dim_asegurados + dim_ipress + dim_red
- DTO y Mapper con todos los campos
- API completo + Ejemplos

**⚡ Quick Reference:** [`10_quick_reference_solicitudes_bolsa.md`](./10_quick_reference_solicitudes_bolsa.md)
- Guía rápida de uso
- Estructura Excel
- API endpoints
- Troubleshooting

**🔧 Cambios Técnicos:** [`11_cambios_tecnicos_v1.9.0.md`](./11_cambios_tecnicos_v1.9.0.md)
- Detalle de cambios de código
- Antes/Después
- Matriz de impacto

### Inicio Rápido (v1.6.0)
**Documentación anterior:** [`08_modulo_bolsas_pacientes_completo.md`](./08_modulo_bolsas_pacientes_completo.md)
- Arquitectura general + flujo completo
- 26 campos en dim_solicitud_bolsa (v1.6.0)
- 8 Foreign Keys con integridad referencial
- 9 índices optimizados
- Casos de uso + ejemplos

### Especificaciones Técnicas

**Tabla Central (43 campos, v1.9.0 - ACTUALIZADO):**
- **[09_modulo_solicitudes_bolsa_import_v1.9.0.md](./09_modulo_solicitudes_bolsa_import_v1.9.0.md)** ⭐
  - Almacenamiento completo: dim_solicitud_bolsa (43 campos)
  - 10 campos de Excel v1.8.0
  - Enriquecimiento: 5 campos desde dim_asegurados
  - Enriquecimiento: IPRESS + RED desde dim_ipress
  - Validación + Inserts batch
  - DTO y Mapper completos

**Catálogo de Tipos:**
- **[05_modulo_tipos_bolsas_crud.md](./05_modulo_tipos_bolsas_crud.md)** (v1.1.0)
  - CRUD completo de tipos de bolsas
  - 7 registros iniciales
  - Tabla: `dim_tipos_bolsas`

**Estados de Gestión:**
- **[07_modulo_estados_gestion_citas_crud.md](./07_modulo_estados_gestion_citas_crud.md)** (v1.33.0)
  - 10 estados: CITADO, NO_CONTESTA, NO_DESEA, ATENDIDO_IPRESS, HC_BLOQUEADA, NUM_NO_EXISTE, TEL_SIN_SERVICIO, REPROG_FALLIDA, SIN_VIGENCIA, APAGADO
  - Tabla: `dim_estados_gestion_citas`
  - CRUD + SQL nativo + Troubleshooting

**Resumen Integral:**
- **[06_resumen_modulo_bolsas_completo.md](./06_resumen_modulo_bolsas_completo.md)** (v1.33.0)
  - Visión general de todo el módulo
  - Flujo: Bolsas → Coordinador → Gestoras
  - Componentes reutilizables

**Auto-Normalización Excel:**
- **[04_auto_normalizacion_excel_107.md](./04_auto_normalizacion_excel_107.md)**
  - Importación automática desde Excel
  - Enriquecimiento de datos
  - Validación normalizada

## 🌊 Flujo del Sistema

```
1. IMPORTACIÓN (Excel → dim_solicitud_bolsa)
   ↓
2. COORDINADOR (http://localhost:3000/bolsas/solicitudes)
   - Visualiza todas las bolsas
   - Distribuye a Gestoras de Citas
   ↓
3. GESTORAS (http://localhost:3000/citas/gestion-asegurado)
   - Captan pacientes
   - Llaman/confirman citas
   - Registran estado (10 opciones)
   ↓
4. NOTIFICACIONES
   - WhatsApp/Email automático cuando CITADO
   ↓
5. AUDITORÍA
   - Registro completo: quién, cuándo, qué
```

## 📊 Modelos

- **dim_solicitud_bolsa** (43 campos v1.9.0, 8 FKs, 9 índices)
  - 10 campos de Excel (v1.8.0)
  - 5 campos enriquecidos (Asegurados)
  - 3 campos IPRESS/RED (Enriquecimiento v1.9.0)
  - 25 campos de auditoría y control
- **dim_tipos_bolsas** (7 registros)
- **dim_estados_gestion_citas** (10 estados)
- **audit_solicitud_bolsa** (trazabilidad)
- **bolsa_107_carga** (auditoría de importaciones)
- **staging.bolsa_107_raw** (antiguo - deprecated)

## 🔗 Referencias

- UML Completo: `spec/uml/UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`
- Base de datos: `spec/database/`
- Scripts SQL: `spec/database/06_scripts/`
- Troubleshooting: `spec/troubleshooting/`

---

## 📝 Historial de Versiones

### v1.9.0 (2026-01-26) - ✅ ACTUAL
- ✅ Enriquecimiento automático IPRESS + RED
- ✅ DTO con 43 campos completos
- ✅ Mapper con todos los mapeos
- ✅ API devolviendo datos enriquecidos
- ✅ Frontend mostrando IPRESS y RED

### v1.8.0 (2026-01-25)
- ✅ Excel import directo (sin staging)
- ✅ 10 campos de Excel v1.8.0
- ✅ Enriquecimiento dim_asegurados
- ✅ Validación de campos obligatorios

### v1.6.0 (anterior)
- ✅ CRUD solicitudes
- ✅ Estados gestión citas
- ✅ Distribución coordinador → gestoras

---

**Última actualización:** 2026-01-26 (v1.9.0)
**Status:** ✅ Production Ready
**Próximo:** v2.0.0 - Reportes y exportación
