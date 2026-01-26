# Módulo de Solicitudes de Bolsa

**Versión:** v1.6.0 | **Status:** ✅ Completado (v1.24.0 - Optimización UI)

## 📚 Documentación Principal

### Inicio Rápido
**⭐ COMIENZA AQUÍ:** [`08_modulo_bolsas_pacientes_completo.md`](./08_modulo_bolsas_pacientes_completo.md)
- Arquitectura general + flujo completo
- 26 campos en dim_solicitud_bolsa (v1.6.0)
- 8 Foreign Keys con integridad referencial
- 9 índices optimizados
- Casos de uso + ejemplos

### Especificaciones Técnicas

**Tabla Central (31 campos, v1.6.0):**
- **[08_modulo_bolsas_pacientes_completo.md](./08_modulo_bolsas_pacientes_completo.md)** ⭐
  - Almacenamiento completo: dim_solicitud_bolsa
  - 6 tipos de bolsas
  - Distribución: Coordinador → Gestoras de Citas
  - Estados: 10 estados de gestión

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

- **dim_solicitud_bolsa** (31 campos, 8 FKs, 9 índices)
- **dim_tipos_bolsas** (7 registros)
- **dim_estados_gestion_citas** (10 estados)
- **audit_solicitud_bolsa** (trazabilidad)

## 🔗 Referencias

- UML Completo: `spec/uml/UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`
- Base de datos: `spec/database/`
- Scripts SQL: `spec/database/06_scripts/`
- Troubleshooting: `spec/troubleshooting/`

---

**Última actualización:** 2026-01-26
