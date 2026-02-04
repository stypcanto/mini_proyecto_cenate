# ✅ Checklist: Implementación Módulo Firma Digital

> **Versión:** v1.14.0
> **Fecha:** 2025-12-30
> **Tiempo Estimado Total:** 3.25 horas

---

## 🗄️ FASE 1: BASE DE DATOS (15 min)

### Script SQL
- [ ] Crear archivo `spec/scripts/015_crear_tabla_firma_digital_personal.sql`
- [ ] Definir tabla `firma_digital_personal` con todos los campos
  - [ ] `id_firma_personal` (PK, SERIAL)
  - [ ] `id_personal` (FK a dim_personal_cnt)
  - [ ] `entrego_token` (BOOLEAN, NOT NULL, default FALSE)
  - [ ] `numero_serie_token` (VARCHAR(100))
  - [ ] `fecha_entrega_token` (DATE)
  - [ ] `fecha_inicio_certificado` (DATE)
  - [ ] `fecha_vencimiento_certificado` (DATE)
  - [ ] `motivo_sin_token` (VARCHAR(50))
  - [ ] `observaciones` (TEXT)
  - [ ] `stat_firma` (CHAR(1), default 'A')
  - [ ] `created_at`, `updated_at` (TIMESTAMP)
- [ ] Agregar 5 constraints CHECK
  - [ ] `chk_entrego_token_fechas` (si entregó token, debe tener fechas + número serie)
  - [ ] `chk_no_entrego_motivo` (si NO entregó, debe tener motivo)
  - [ ] `chk_fechas_validas` (vencimiento > inicio)
  - [ ] `chk_ya_tiene_fechas` (si YA_TIENE, debe tener fechas)
  - [ ] `chk_numero_serie_token` (si tiene número serie, debe haber entregado token)
- [ ] Crear 4 índices
  - [ ] `idx_firma_personal_id_personal`
  - [ ] `idx_firma_personal_stat`
  - [ ] `idx_firma_personal_entrego_token`
  - [ ] `idx_firma_personal_fecha_vencimiento`
- [ ] Agregar foreign key a `dim_personal_cnt.id_pers` con ON DELETE CASCADE
- [ ] Crear trigger para `updated_at` automático
- [ ] Agregar comentarios a tabla y columnas
- [ ] Ejecutar script en BD:
  ```bash
  PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
    -f spec/scripts/015_crear_tabla_firma_digital_personal.sql
  ```
- [ ] Verificar que la tabla se creó correctamente
- [ ] Probar constraints con inserts de prueba

---

## ☕ FASE 2: BACKEND (60 min)

### 2.1 Modelo - Entidad JPA
- [ ] Crear `backend/src/main/java/com/styp/cenate/model/FirmaDigitalPersonal.java`
  - [ ] Anotaciones: `@Entity`, `@Table`, `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
  - [ ] Campo `idFirmaPersonal` (PK con `@GeneratedValue`)
  - [ ] Campo `personal` (ManyToOne con `PersonalCnt`)
  - [ ] Campo `entregoToken` (Boolean, default FALSE)
  - [ ] Campo `numeroSerieToken` (String)
  - [ ] Campo `fechaEntregaToken` (LocalDate)
  - [ ] Campo `fechaInicioCertificado` (LocalDate)
  - [ ] Campo `fechaVencimientoCertificado` (LocalDate)
  - [ ] Campo `motivoSinToken` (String)
  - [ ] Campo `observaciones` (String)
  - [ ] Campo `statFirma` (String, default "A")
  - [ ] Campos `createdAt`, `updatedAt` con `@CreationTimestamp`, `@UpdateTimestamp`
  - [ ] Métodos helper:
    - [ ] `isActivo()`
    - [ ] `tieneTokenEntregado()`
    - [ ] `tieneCertificadoVigente()`
    - [ ] `validarFechas()`
    - [ ] `esPendienteEntrega()`
    - [ ] `puedeActualizarEntrega()`
    - [ ] `obtenerEstadoCertificado()`
    - [ ] `obtenerDescripcionMotivo()`

### 2.2 Repository
- [ ] Crear `backend/src/main/java/com/styp/cenate/repository/FirmaDigitalPersonalRepository.java`
  - [ ] Extender `JpaRepository<FirmaDigitalPersonal, Long>`
  - [ ] Método `findByPersonal_IdPers(Long idPersonal)`
  - [ ] Método `findByPersonal(PersonalCnt personal)`
  - [ ] Método `findByStatFirma(String statFirma)`
  - [ ] Método `findByEntregoTokenAndStatFirma(Boolean entregoToken, String statFirma)`
  - [ ] Query `findCertificadosProximosVencer(LocalDate fechaActual, LocalDate fechaLimite)`
  - [ ] Query `contarCertificadosVencidos(LocalDate fechaActual)`
  - [ ] Método `existsByPersonal_IdPers(Long idPersonal)`
  - [ ] Método `findByMotivoSinTokenAndStatFirma(String motivo, String stat)`

### 2.3 DTOs
- [ ] Crear `backend/src/main/java/com/styp/cenate/dto/FirmaDigitalRequest.java`
  - [ ] Campos: `idPersonal`, `entregoToken`, `numeroSerieToken`, `fechaEntregaToken`
  - [ ] Campos: `fechaInicioCertificado`, `fechaVencimientoCertificado`, `motivoSinToken`, `observaciones`
  - [ ] Método `esValido()` con validación completa

- [ ] Crear `backend/src/main/java/com/styp/cenate/dto/FirmaDigitalResponse.java`
  - [ ] Campos básicos + `nombreCompleto`, `descripcionMotivo`, `estadoCertificado`
  - [ ] Campos: `numeroSerieToken`, `fechaEntregaToken`, `esPendiente`

- [ ] Crear `backend/src/main/java/com/styp/cenate/dto/ActualizarEntregaTokenRequest.java`
  - [ ] Campo `idFirmaPersonal`
  - [ ] Campo `numeroSerieToken`
  - [ ] Campo `fechaEntregaToken`
  - [ ] Campo `fechaInicioCertificado`
  - [ ] Campo `fechaVencimientoCertificado`
  - [ ] Campo `observaciones`

### 2.4 Service - Interface
- [ ] Crear `backend/src/main/java/com/styp/cenate/service/firmadigital/FirmaDigitalService.java`
  - [ ] Método `guardarFirmaDigital(FirmaDigitalRequest request)`
  - [ ] Método `obtenerPorIdPersonal(Long idPersonal)`
  - [ ] Método `listarActivas()`
  - [ ] Método `listarCertificadosProximosVencer()`
  - [ ] Método `eliminarFirmaDigital(Long idFirmaPersonal)`
  - [ ] Método `tieneFirmaDigital(Long idPersonal)`
  - [ ] Método `actualizarEntregaToken(ActualizarEntregaTokenRequest request)`
  - [ ] Método `listarEntregasPendientes()`

### 2.5 Service - Implementación
- [ ] Crear `backend/src/main/java/com/styp/cenate/service/firmadigital/impl/FirmaDigitalServiceImpl.java`
  - [ ] Inyectar `FirmaDigitalPersonalRepository`
  - [ ] Inyectar `PersonalCntRepository`
  - [ ] Inyectar `AuditLogService`
  - [ ] Implementar `guardarFirmaDigital()` con lógica UPSERT
  - [ ] Implementar `obtenerPorIdPersonal()`
  - [ ] Implementar `listarActivas()`
  - [ ] Implementar `listarCertificadosProximosVencer()` (30 días)
  - [ ] Implementar `eliminarFirmaDigital()` (soft delete)
  - [ ] Implementar `tieneFirmaDigital()`
  - [ ] Implementar `actualizarEntregaToken()`:
    - [ ] Buscar firma digital por ID
    - [ ] Validar que esté en estado PENDIENTE
    - [ ] Actualizar: `entregoToken=true`, agregar número serie y fechas
    - [ ] Limpiar `motivoSinToken`
    - [ ] Auditar acción
  - [ ] Implementar `listarEntregasPendientes()`
  - [ ] Método helper `mapToResponse(FirmaDigitalPersonal)`
  - [ ] Método helper `auditar(action, detalle, nivel, estado)`

### 2.6 Controller
- [ ] Crear `backend/src/main/java/com/styp/cenate/api/firmadigital/FirmaDigitalController.java`
  - [ ] Anotación `@RestController` y `@RequestMapping("/api/firma-digital")`
  - [ ] Inyectar `FirmaDigitalService`
  - [ ] Endpoint `PUT /{id}/actualizar-entrega`
    - [ ] PathVariable `id`
    - [ ] RequestBody `ActualizarEntregaTokenRequest`
    - [ ] Retornar `FirmaDigitalResponse`
  - [ ] Endpoint `GET /pendientes`
    - [ ] Retornar lista de firmas PENDIENTES
  - [ ] Endpoint `GET /personal/{idPersonal}`
    - [ ] Obtener firma digital por ID personal
  - [ ] Endpoint `GET /vencimientos`
    - [ ] Listar certificados próximos a vencer

### 2.7 Modificar Archivos Existentes

#### UsuarioCreateRequest.java
- [ ] Abrir `backend/src/main/java/com/styp/cenate/dto/UsuarioCreateRequest.java`
- [ ] Agregar campo `private FirmaDigitalRequest firmaDigital;` (línea ~68)

#### UsuarioServiceImpl.java
- [ ] Abrir `backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`
- [ ] Inyectar `FirmaDigitalService` en constructor
- [ ] En método `crearUsuario()`, después de guardar `PersonalCnt`:
  - [ ] Verificar si `request.getFirmaDigital()` no es null
  - [ ] Asignar `idPersonal` al request
  - [ ] Llamar a `firmaDigitalService.guardarFirmaDigital()`
  - [ ] Manejar excepciones (no fallar el registro completo)

---

## ⚛️ FASE 3: FRONTEND (75 min)

### 3.1 Componente Principal - Tab Firma Digital
- [ ] Crear `frontend/src/pages/user/components/common/FirmaDigitalTab.jsx`
  - [ ] Props: `formData`, `setFormData`, `errors`, `handleChange`, `regimenLaboral`
  - [ ] Determinar tipo de régimen:
    - [ ] `esLocador = regimenLaboral.includes('LOCADOR')`
    - [ ] `esCAS = regimenLaboral.includes('CAS')`
    - [ ] `es728 = regimenLaboral.includes('728')`
  - [ ] Handler `handleEntregoTokenChange(value)`:
    - [ ] Actualizar `entrego_token`
    - [ ] Limpiar campos relacionados
  - [ ] Handler `handleMotivoChange(motivo)`:
    - [ ] Actualizar `motivo_sin_token`
    - [ ] Limpiar fechas si NO es YA_TIENE
  - [ ] Sección: Header con título e icono
  - [ ] Sección: Mostrar régimen laboral (solo lectura, badge)
  - [ ] SI LOCADOR:
    - [ ] Mensaje informativo "Gestiona su propia firma digital"
    - [ ] Botón para continuar a Roles
  - [ ] SI CAS/728:
    - [ ] Botones "¿Entregó token?" (Sí/No) con diseño visual
    - [ ] SI entregó = SÍ:
      - [ ] Campo: Número de serie del token (input text, obligatorio)
      - [ ] Campo: Fecha inicio certificado (date picker, obligatorio)
      - [ ] Campo: Fecha vencimiento certificado (date picker, obligatorio)
      - [ ] Validación en tiempo real: vencimiento > inicio
    - [ ] SI entregó = NO:
      - [ ] Radio buttons para motivo:
        - [ ] YA_TIENE (con descripción)
        - [ ] NO_REQUIERE (con descripción)
        - [ ] PENDIENTE (con descripción)
      - [ ] SI motivo = YA_TIENE:
        - [ ] Subsección con campos de certificado existente
        - [ ] Campo: Fecha inicio (obligatorio)
        - [ ] Campo: Fecha vencimiento (obligatorio)
    - [ ] Campo: Observaciones (textarea, opcional)

### 3.2 Modal para Actualizar Entregas Pendientes
- [ ] Crear `frontend/src/pages/user/components/common/ActualizarEntregaTokenModal.jsx`
  - [ ] Props: `firmaDigital`, `onClose`, `onSuccess`
  - [ ] Estado local para campos del formulario
  - [ ] Estado para errores de validación
  - [ ] Estado para loading
  - [ ] Sección: Header del modal
    - [ ] Título "Registrar Entrega de Token"
    - [ ] Botón cerrar (X)
  - [ ] Sección: Información del personal (solo lectura)
    - [ ] Nombre completo
    - [ ] DNI
    - [ ] Badge "PENDIENTE" (color amber)
  - [ ] Sección: Formulario
    - [ ] Campo: Número de serie del token (input, obligatorio)
    - [ ] Campo: Fecha de entrega (date picker, default hoy, obligatorio)
    - [ ] Campo: Fecha inicio certificado (date picker, obligatorio)
    - [ ] Campo: Fecha vencimiento certificado (date picker, obligatorio)
    - [ ] Campo: Observaciones (textarea, opcional)
  - [ ] Validaciones:
    - [ ] Número de serie no vacío
    - [ ] Todas las fechas completas
    - [ ] Fecha vencimiento > fecha inicio
  - [ ] Handler `handleSubmit()`:
    - [ ] Validar formulario
    - [ ] Llamar a `PUT /api/firma-digital/{id}/actualizar-entrega`
    - [ ] Mostrar loading
    - [ ] En éxito: llamar `onSuccess()` y cerrar modal
    - [ ] En error: mostrar mensaje
  - [ ] Botones:
    - [ ] Cancelar (gris)
    - [ ] Registrar Entrega (emerald, disabled si hay errores)

### 3.3 Modificar CrearUsuarioModal.jsx
- [ ] Abrir `frontend/src/pages/user/components/common/CrearUsuarioModal.jsx`

#### Importaciones
- [ ] Línea ~10: `import FirmaDigitalTab from './FirmaDigitalTab';`

#### Estado formData
- [ ] Línea ~76: Agregar campos de firma digital:
  ```javascript
  entrego_token: null,
  numero_serie_token: '',
  fecha_entrega_token: '',
  fecha_inicio_certificado: '',
  fecha_vencimiento_certificado: '',
  motivo_sin_token: null,
  observaciones_firma: ''
  ```

#### Tabs Header
- [ ] Línea ~1053: Agregar botón tab "Firma Digital" (solo si tipo_personal !== '2')

#### Renderizado del Tab
- [ ] Línea ~1763: Renderizar `<FirmaDigitalTab />` cuando `selectedTab === 'firma'`
  - [ ] Pasar props: `formData`, `setFormData`, `errors`, `handleChange`
  - [ ] Pasar `regimenLaboral` (buscar en array `regimenesLaborales`)

#### Validación
- [ ] Línea ~849: En `handleNextOrSubmit`, agregar caso `if (selectedTab === 'firma')`
  - [ ] Obtener régimen seleccionado
  - [ ] Determinar si `requiereFirmaDigital` (CAS/728)
  - [ ] Validar selección de "¿Entregó token?"
  - [ ] Si SÍ entregó:
    - [ ] Validar `numero_serie_token` no vacío
    - [ ] Validar `fecha_inicio_certificado` no vacía
    - [ ] Validar `fecha_vencimiento_certificado` no vacía
    - [ ] Validar `fecha_vencimiento > fecha_inicio`
  - [ ] Si NO entregó:
    - [ ] Validar `motivo_sin_token` no vacío
    - [ ] Si motivo = YA_TIENE:
      - [ ] Validar fechas del certificado existente
  - [ ] Si hay errores, mostrar alert y return
  - [ ] Si OK, cambiar a tab 'roles'

#### Submit Final
- [ ] Línea ~900: En `handleSubmit`, agregar objeto `firmaDigital` a `dataToSend`
  - [ ] Solo si `tipo_personal === '1'` y tiene régimen CAS/728
  - [ ] Mapear campos del formData al formato del DTO:
    ```javascript
    dataToSend.firmaDigital = {
      entregoToken: formData.entrego_token === 'SI',
      numeroSerieToken: formData.numero_serie_token || null,
      fechaEntregaToken: formData.entrego_token === 'SI' ? new Date().toISOString().split('T')[0] : null,
      fechaInicioCertificado: formData.fecha_inicio_certificado || null,
      fechaVencimientoCertificado: formData.fecha_vencimiento_certificado || null,
      motivoSinToken: formData.motivo_sin_token || null,
      observaciones: formData.observaciones_firma || null
    };
    ```

#### useEffect para limpiar datos
- [ ] Agregar `useEffect` que detecte cambio de `id_regimen_laboral`
  - [ ] Si cambia a LOCADOR, limpiar todos los campos de firma digital

#### Texto del Botón
- [ ] Línea ~2038: Actualizar texto del botón según tab:
  - [ ] `'firma'` → "Siguiente →"

### 3.4 Modificar ActualizarModel.jsx
- [ ] Abrir `frontend/src/pages/user/components/common/ActualizarModel.jsx`

#### Importaciones
- [ ] Importar `FirmaDigitalTab`
- [ ] Importar `ActualizarEntregaTokenModal`

#### Estados
- [ ] Agregar estado `firmaDigitalData` (datos cargados de la firma digital)
- [ ] Agregar estado `mostrarModalActualizarEntrega` (boolean)

#### Cargar Datos
- [ ] Función `cargarDatosFirmaDigital()`:
  - [ ] Llamar a `GET /api/firma-digital/personal/{idPersonal}`
  - [ ] Guardar en `firmaDigitalData`
  - [ ] Si existe, pre-llenar campos en `formData`

#### Detectar PENDIENTE
- [ ] En el render, verificar si `firmaDigitalData.motivoSinToken === 'PENDIENTE'`
- [ ] Si es PENDIENTE, mostrar botón especial:
  - [ ] Texto: "Registrar Entrega de Token"
  - [ ] Icono: FileSignature
  - [ ] Color: amber
  - [ ] onClick: `setMostrarModalActualizarEntrega(true)`

#### Modal Actualizar Entrega
- [ ] Renderizar `<ActualizarEntregaTokenModal />` condicionalmente
  - [ ] Prop `firmaDigital={firmaDigitalData}`
  - [ ] Prop `onClose={() => setMostrarModalActualizarEntrega(false)}`
  - [ ] Prop `onSuccess={() => { cerrar modal, recargar datos }}`

#### Aplicar Cambios de CrearUsuarioModal
- [ ] Copiar cambios de campos `formData`
- [ ] Copiar lógica de validación de tab 'firma'
- [ ] Copiar lógica de submit con `firmaDigital`
- [ ] Copiar useEffect de limpieza

---

## 🧪 FASE 4: TESTING (40 min)

### 4.1 Testing Backend

#### Base de Datos
- [ ] Insertar firma con token entregado + número serie
- [ ] Insertar firma sin token, motivo YA_TIENE
- [ ] Insertar firma sin token, motivo NO_REQUIERE
- [ ] Insertar firma sin token, motivo PENDIENTE
- [ ] Intentar insertar con token SÍ pero sin número serie → Error constraint
- [ ] Intentar insertar con token SÍ pero sin fechas → Error constraint
- [ ] Intentar insertar con fecha_vencimiento < fecha_inicio → Error constraint
- [ ] Intentar insertar sin token pero sin motivo → Error constraint

#### Service
- [ ] Test: guardarFirmaDigital() crea nuevo registro
- [ ] Test: guardarFirmaDigital() actualiza registro existente (UPSERT)
- [ ] Test: obtenerPorIdPersonal() retorna firma existente
- [ ] Test: obtenerPorIdPersonal() retorna empty para personal sin firma
- [ ] Test: listarActivas() solo retorna stat_firma='A'
- [ ] Test: listarCertificadosProximosVencer() retorna los próximos 30 días
- [ ] Test: actualizarEntregaToken() funciona con firma PENDIENTE
- [ ] Test: actualizarEntregaToken() falla si NO es PENDIENTE
- [ ] Test: eliminarFirmaDigital() cambia stat_firma a 'I'

#### Controller
- [ ] Test: PUT /api/firma-digital/{id}/actualizar-entrega retorna 200
- [ ] Test: PUT con ID inválido retorna 404
- [ ] Test: GET /pendientes retorna lista correcta
- [ ] Test: Endpoints requieren autenticación

### 4.2 Testing Frontend

#### FirmaDigitalTab.jsx
- [ ] Test: Régimen LOCADOR muestra solo mensaje informativo
- [ ] Test: Régimen CAS muestra formulario completo
- [ ] Test: Botones "¿Entregó token?" funcionan correctamente
- [ ] Test: Si SÍ entregó, muestra campo número de serie
- [ ] Test: Si NO entregó, muestra opciones de motivo
- [ ] Test: Si motivo = YA_TIENE, muestra campos de certificado existente
- [ ] Test: Validación de fechas funciona (vencimiento > inicio)

#### ActualizarEntregaTokenModal.jsx
- [ ] Test: Modal se abre y cierra correctamente
- [ ] Test: Campos se validan antes de submit
- [ ] Test: Submit exitoso llama a onSuccess
- [ ] Test: Submit fallido muestra mensaje de error
- [ ] Test: Fecha de entrega default es hoy

#### CrearUsuarioModal.jsx
- [ ] Test: Tab "Firma Digital" aparece para usuarios INTERNOS
- [ ] Test: Tab NO aparece para usuarios EXTERNOS
- [ ] Test: Validación impide avanzar sin completar campos obligatorios
- [ ] Test: Submit incluye objeto firmaDigital en el request
- [ ] Test: useEffect limpia datos si cambia a régimen LOCADOR

#### ActualizarModel.jsx
- [ ] Test: Carga datos de firma digital existente
- [ ] Test: Botón "Registrar Entrega" aparece solo si es PENDIENTE
- [ ] Test: Modal de actualización funciona correctamente
- [ ] Test: Recarga datos después de actualizar entrega

### 4.3 Testing Integración
- [ ] Test E2E: Crear usuario CAS con token entregado
- [ ] Test E2E: Crear usuario 728 sin token, motivo PENDIENTE
- [ ] Test E2E: Editar usuario PENDIENTE y registrar entrega
- [ ] Test E2E: Verificar en BD que datos se guardaron correctamente
- [ ] Test E2E: Verificar auditoría de acciones

---

## 📚 FASE 5: DOCUMENTACIÓN (15 min)

### 5.1 Changelog
- [ ] Abrir `spec/002_changelog.md`
- [ ] Agregar nueva sección `[v1.14.0] - 2025-12-30`
- [ ] Describir: "Módulo de Firma Digital para personal interno"
- [ ] Listar archivos nuevos (11 backend + 2 frontend + 1 BD)
- [ ] Listar archivos modificados (2 backend + 2 frontend)
- [ ] Describir características principales:
  - [ ] Gestión de firma digital por régimen laboral
  - [ ] Número de serie del token
  - [ ] Actualización de entregas pendientes
  - [ ] Flujo completo de PENDIENTE a ENTREGADO

### 5.2 CLAUDE.md
- [ ] Abrir `CLAUDE.md`
- [ ] Agregar sección "Módulo de Firma Digital" después de "Disponibilidad de Turnos"
- [ ] Incluir:
  - [ ] Descripción del módulo
  - [ ] Flujo de uso (diagrama ASCII)
  - [ ] Arquitectura (BD, Backend, Frontend)
  - [ ] Reglas de negocio por tipo de régimen
  - [ ] Campos de la tabla
  - [ ] Endpoints API
  - [ ] Validaciones
  - [ ] Script SQL para ejecutar
  - [ ] Troubleshooting básico
  - [ ] Documentación relacionada

### 5.3 Version
- [ ] Abrir `frontend/src/config/version.js`
- [ ] Cambiar `APP_VERSION` a `'v1.14.0'`
- [ ] Cambiar `RELEASE_DATE` a `'2025-12-30'`
- [ ] Cambiar `RELEASE_NOTES` a `'Módulo de Firma Digital para personal interno con gestión de entregas pendientes'`

### 5.4 Plan y Checklist (ya completados)
- [x] Crear `spec/017_plan_firma_digital.md`
- [x] Crear `spec/018_checklist_firma_digital.md`

---

## 🚀 FASE 6: DEPLOYMENT (opcional)

### 6.1 Preparación
- [ ] Crear backup de base de datos antes de ejecutar script
- [ ] Verificar que servidor de desarrollo está funcionando
- [ ] Cerrar todas las conexiones activas a la tabla (si existe)

### 6.2 Base de Datos
- [ ] Ejecutar script SQL en BD remota
- [ ] Verificar que tabla se creó correctamente
- [ ] Verificar que índices existen
- [ ] Verificar que constraints funcionan

### 6.3 Backend
- [ ] Compilar backend: `./gradlew build`
- [ ] Verificar que no hay errores de compilación
- [ ] Ejecutar tests unitarios
- [ ] Iniciar backend en modo desarrollo
- [ ] Verificar logs de inicio (sin errores de JPA)

### 6.4 Frontend
- [ ] Instalar dependencias (si hay nuevas): `npm install`
- [ ] Compilar frontend: `npm run build`
- [ ] Verificar que no hay errores de compilación
- [ ] Iniciar frontend en modo desarrollo: `npm start`
- [ ] Verificar que la aplicación carga correctamente

### 6.5 Pruebas Manuales
- [ ] Crear un usuario INTERNO con régimen LOCADOR → Verificar mensaje informativo
- [ ] Crear un usuario INTERNO con régimen CAS, entregó token → Verificar captura de número de serie
- [ ] Crear un usuario INTERNO con régimen 728, NO entregó, PENDIENTE → Verificar se guarda
- [ ] Editar usuario PENDIENTE → Verificar botón "Registrar Entrega" aparece
- [ ] Registrar entrega de token → Verificar actualización correcta
- [ ] Verificar en BD que todos los datos se guardaron

---

## ✅ COMPLETADO

Una vez terminadas todas las tareas, marcar aquí:

- [ ] **FASE 1: BASE DE DATOS** - Completada
- [ ] **FASE 2: BACKEND** - Completada
- [ ] **FASE 3: FRONTEND** - Completada
- [ ] **FASE 4: TESTING** - Completada
- [ ] **FASE 5: DOCUMENTACIÓN** - Completada
- [ ] **FASE 6: DEPLOYMENT** - Completada

---

## 📝 Notas Adicionales

### Consideraciones Importantes
- Siempre hacer backup antes de modificar la BD
- Probar primero en entorno de desarrollo
- Validar constraints en BD antes de implementar lógica en backend
- Mantener coherencia entre validaciones frontend y backend
- Auditar todas las acciones críticas (crear, actualizar, eliminar)

### Próximos Pasos (Futuro)
1. Dashboard de entregas pendientes
2. Reportes de certificados próximos a vencer
3. Alertas automáticas por email (30 días antes)
4. Historial de renovaciones
5. Exportación a Excel

---

**Tiempo Total Estimado:** 3 horas 25 minutos
**Complejidad:** Media-Alta
**Prioridad:** Alta
