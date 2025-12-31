# Documentación Técnica - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | Especificaciones y guías técnicas

---

## Estructura de Carpetas

```
spec/
├── Backend/                          # Documentación del backend (Spring Boot)
│   └── 003_api_endpoints.md          # Listado completo de endpoints API REST
│
├── Arquitectura/                     # Diagramas y arquitectura del sistema
│   └── 004_arquitectura.md           # Diagramas de arquitectura y flujos
│
├── BD/                               # Base de datos (PostgreSQL)
│   ├── 001_espec_users_bd.md         # Modelo de datos de usuarios
│   ├── 011_guia_auditoria.md         # ⭐ Guía completa del sistema de auditoría
│   ├── 013_guia_auditoria_acceso_sensible.md
│   ├── scripts/                      # Scripts SQL para mantenimiento
│   │   ├── 001_audit_view_and_indexes.sql
│   │   ├── 002_rename_logs_to_auditoria.sql
│   │   ├── 005_disponibilidad_medica.sql
│   │   ├── 007_agregar_email_preferido.sql
│   │   └── ... (más scripts)
│   └── sql/
│       └── chatbot_menu_setup.sql
│
└── 005_troubleshooting.md            # Solución de problemas comunes
```

---

## Índice de Documentación

### 📊 Backend (Spring Boot)
| Archivo | Descripción | Versión |
|---------|-------------|---------|
| `Backend/003_api_endpoints.md` | Endpoints API REST completos | v1.13.0 |

### 🏗️ Arquitectura
| Archivo | Descripción | Versión |
|---------|-------------|---------|
| `Arquitectura/004_arquitectura.md` | Diagramas y flujos del sistema | v1.13.0 |

### 🗄️ Base de Datos
| Archivo | Descripción | Versión |
|---------|-------------|---------|
| `BD/001_espec_users_bd.md` | Modelo de datos de usuarios | v1.13.0 |
| `BD/011_guia_auditoria.md` | ⭐ Guía completa del sistema de auditoría | v1.13.0 |
| `BD/013_guia_auditoria_acceso_sensible.md` | Auditoría de accesos sensibles | v1.13.0 |
| `BD/scripts/` | Scripts SQL para mantenimiento y migraciones | - |

### 🔧 Troubleshooting
| Archivo | Descripción | Versión |
|---------|-------------|---------|
| `005_troubleshooting.md` | Solución de problemas comunes | v1.13.0 |

---

## Guías de Uso

### Para Desarrolladores Backend
1. **Endpoints API**: Consulta `Backend/003_api_endpoints.md` para todos los endpoints REST
2. **Arquitectura**: Revisa `Arquitectura/004_arquitectura.md` para el flujo del sistema
3. **Base de Datos**: Lee `BD/001_espec_users_bd.md` para el modelo de datos
4. **Auditoría**: Si trabajas con auditoría, lee `BD/011_guia_auditoria.md` ⭐

### Para DBAs
1. **Scripts SQL**: Todos los scripts están en `BD/scripts/`
2. **Auditoría**: Consulta `BD/011_guia_auditoria.md` para el sistema completo
3. **Modelo de Datos**: Revisa `BD/001_espec_users_bd.md`

### Para Resolución de Problemas
1. **Troubleshooting**: Consulta `005_troubleshooting.md`
2. **Logs del Sistema**: Revisa el módulo de auditoría

---

## Scripts SQL Importantes

### Auditoría
```bash
# Crear vista e índices de auditoría
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f BD/scripts/001_audit_view_and_indexes.sql

# Renombrar menú a "Auditoría"
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f BD/scripts/002_rename_logs_to_auditoria.sql
```

### Disponibilidad Médica
```bash
# Crear tablas de disponibilidad
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f BD/scripts/005_disponibilidad_medica.sql

# Agregar card al dashboard médico
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f BD/scripts/006_agregar_card_disponibilidad.sql
```

### Email Preferido
```bash
# Agregar campo email_preferido
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f BD/scripts/007_agregar_email_preferido.sql
```

---

## Documentación Relacionada

- **Planificación**: Ver carpeta `/plan` para planes de implementación
- **Checklists y Logs**: Ver carpeta `/checklist` para historial de cambios y reportes
- **Guía Principal**: Ver `CLAUDE.md` en la raíz del proyecto

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |

---

## Contacto

**Desarrollador Principal:**
Ing. Styp Canto Rondon

**Soporte Técnico:**
cenate.analista@essalud.gob.pe

**Sistema de Emails:**
cenateinformatica@gmail.com

---

*EsSalud Perú - CENATE | Sistema de Telemedicina*
*Última actualización: 2025-12-30*
