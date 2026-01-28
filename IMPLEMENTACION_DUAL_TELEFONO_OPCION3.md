# 📱 Implementación: Dual Mapping Inteligente de Teléfonos (Opción 3)

**Fecha:** 2026-01-28
**Versión:** v1.14.0
**Status:** ✅ Implementado y Compilado

---

## 🎯 Resumen de Cambios

Se implementó la **Opción 3: Dual mapping inteligente** para manejar correctamente dos teléfonos (principal y alterno) en la importación de solicitudes de bolsa desde Excel.

---

## 📋 Lógica Implementada

### Para ASEGURADOS QUE YA EXISTEN:

```
1. Teléfono Principal (Excel col 7) → asegurados.tel_fijo
   IF Excel.telefonoPrincipal != BD.tel_fijo
     → ACTUALIZAR BD.tel_fijo
     → LOG: Cambio anterior → nuevo valor

2. Teléfono Alterno (Excel col 8) → asegurados.tel_celular
   IF Excel.telefonoAlterno != BD.tel_celular
     → ACTUALIZAR BD.tel_celular
     → LOG: Cambio anterior → nuevo valor

3. Validación de cambios:
   - Solo actualiza si el valor es diferente (evita actualizaciones innecesarias)
   - Registra en logs el valor anterior y nuevo
   - Guarda cambios en BD si hay al menos 1 teléfono diferente
```

### Para ASEGURADOS NUEVOS (No existen en BD):

```
1. Crear nuevo asegurado con:
   - pk_asegurado = DNI (desde Excel)
   - paciente = nombre completo
   - tel_fijo = Teléfono Principal (Excel col 7)
   - tel_celular = Teléfono Alterno (Excel col 8)
   - correo_electronico = Correo (Excel col 9)
   - sexo = Sexo (Excel col 5)
   - fecha_nacimiento = Fecha Nac (Excel col 6)

2. Guardar en BD
3. Vincular automáticamente a la solicitud de bolsa
```

---

## 🔧 Archivos Modificados

### 1. **Frontend: CargarDesdeExcel.jsx**
- ✅ Plantilla actualizada con 11 columnas
- ✅ Validación aumentada de 10 → 11 campos
- ✅ Nombres de columnas mejorados: "Teléfono Principal" y "Teléfono Alterno"

### 2. **Backend DTO: SolicitudBolsaExcelRowDTO.java**
```java
// Antes (10 campos):
String telefono

// Ahora (11 campos):
String telefonoPrincipal    // Nuevo nombre
String telefonoAlterno      // Nuevo campo
```

### 3. **Backend Service: SolicitudBolsaServiceImpl.java**

#### Sección: Asegurado Existe (DUAL MAPPING INTELIGENTE)
```java
// Teléfono Principal → tel_fijo
if (row.telefonoPrincipal() != null && !row.telefonoPrincipal().isBlank()) {
    String telFijoAnterior = asegurado.getTelFijo();
    if (!row.telefonoPrincipal().equals(telFijoAnterior)) {
        asegurado.setTelFijo(row.telefonoPrincipal());
        log.info("📱 [TEL_FIJO] Actualizado: '{}' → '{}'", telFijoAnterior, row.telefonoPrincipal());
    }
}

// Teléfono Alterno → tel_celular
if (row.telefonoAlterno() != null && !row.telefonoAlterno().isBlank()) {
    String telCelularAnterior = asegurado.getTelCelular();
    if (!row.telefonoAlterno().equals(telCelularAnterior)) {
        asegurado.setTelCelular(row.telefonoAlterno());
        log.info("📱 [TEL_CELULAR] Actualizado: '{}' → '{}'", telCelularAnterior, row.telefonoAlterno());
    }
}
```

#### Sección: Asegurado Nuevo (CREACIÓN CON DUAL MAPPING)
```java
// Crear nuevo asegurado con ambos teléfonos
Asegurado nuevoAsegurado = new Asegurado();
nuevoAsegurado.setPkAsegurado(row.dni());
nuevoAsegurado.setDocPaciente(row.dni());
nuevoAsegurado.setPaciente(row.nombreCompleto());

// Teléfono Principal → tel_fijo
if (row.telefonoPrincipal() != null && !row.telefonoPrincipal().isBlank()) {
    nuevoAsegurado.setTelFijo(row.telefonoPrincipal());
}

// Teléfono Alterno → tel_celular
if (row.telefonoAlterno() != null && !row.telefonoAlterno().isBlank()) {
    nuevoAsegurado.setTelCelular(row.telefonoAlterno());
}

// Otros campos...
aseguradoRepository.save(nuevoAsegurado);
```

---

## 📊 Ejemplos de Ejecución

### Escenario 1: Asegurado existe con teléfonos iguales
```
Excel:
- DNI: 12345678
- Teléfono Principal: 987654321
- Teléfono Alterno: 998765432

BD (asegurados):
- tel_fijo: 987654321
- tel_celular: 998765432

Resultado:
✅ NO hay cambios, ambos coinciden
✅ Se registra: "Teléfono principal coincide, sin cambios"
✅ Solicitud se crea normalmente
```

### Escenario 2: Asegurado existe pero Excel trae nuevos teléfonos
```
Excel:
- DNI: 12345678
- Teléfono Principal: 123456789 (NUEVO)
- Teléfono Alterno: 456789012 (NUEVO)

BD (asegurados):
- tel_fijo: 987654321 (ANTERIOR)
- tel_celular: 998765432 (ANTERIOR)

Resultado:
📱 [TEL_FIJO] Actualizado para DNI 12345678: '987654321' → '123456789'
📱 [TEL_CELULAR] Actualizado para DNI 12345678: '998765432' → '456789012'
✅ Cambios guardados en BD
✅ Solicitud se crea con teléfonos actualizados
```

### Escenario 3: Asegurado NUEVO (no existe)
```
Excel:
- DNI: 99999999 (NUEVO)
- Nombre: Juan Pérez
- Teléfono Principal: 555666777
- Teléfono Alterno: 666777888

Resultado:
✏️ CREANDO nuevo Asegurado para DNI 99999999
   ✅ Tel Fijo asignado: 555666777
   ✅ Tel Celular asignado: 666777888
   💾 Guardando nuevo asegurado en BD...
   ✅ Nuevo asegurado guardado en BD!
✅ ÉXITO: Nuevo asegurado creado - Juan Pérez (DNI: 99999999) | Tel Fijo: 555666777 | Tel Celular: 666777888
```

---

## 🔍 Auditoría de Cambios

### Logs Generados

Cada actualización registra:
```
📱 [TEL_FIJO] Actualizado para DNI {dni}: '{anterior}' → '{nuevo}'
📱 [TEL_CELULAR] Actualizado para DNI {dni}: '{anterior}' → '{nuevo}'
📧 [CORREO] Actualizado para DNI {dni}: '{anterior}' → '{nuevo}'
🎂 [FECHA_NAC] Asignada para DNI {dni}: {fecha}
✅ [ASEGURADO ACTUALIZADO] DNI {dni} - Tel Fijo: {valor} | Tel Celular: {valor} | Correo: {valor}
```

### Recomendación Futura
Para auditoría completa a nivel BD, se puede:
1. Crear tabla `audit_asegurado_telefonos` con:
   - dni
   - campo_modificado (tel_fijo / tel_celular)
   - valor_anterior
   - valor_nuevo
   - fecha_cambio
   - origen (Excel / Manual)

2. Insertar records en trigger tras actualización

---

## ✅ Pruebas Recomendadas

### Test 1: Asegurado con teléfonos sin cambios
```
1. Crear Excel con asegurado existente
2. Mantener mismos teléfonos que BD
3. Cargar archivo
4. Verificar: No hay actualización en logs
```

### Test 2: Asegurado con teléfonos nuevos
```
1. Crear Excel con asegurado existente
2. Cambiar ambos teléfonos
3. Cargar archivo
4. Verificar: Ambos campos se actualizan en BD y logs
```

### Test 3: Crear nuevo asegurado
```
1. Crear Excel con DNI inexistente
2. Completar teléfono principal y alterno
3. Cargar archivo
4. Verificar: Nuevo asegurado creado en BD con ambos teléfonos
5. Verificar: Solicitud vinculada correctamente
```

### Test 4: Teléfonos parciales
```
1. Crear Excel con solo Teléfono Principal (Alterno vacío)
2. Cargar archivo
3. Verificar: Se actualiza solo tel_fijo, tel_celular se mantiene
```

---

## 📈 Comparación: Antes vs Después

| Aspecto | Antes (v1.13.8) | Después (v1.14.0) |
|---------|-----------------|-------------------|
| **Teléfonos en Excel** | 1 columna | 2 columnas |
| **Mapeo** | telefono → tel_celular | principal → tel_fijo; alterno → tel_celular |
| **Lógica** | Sobrescribía sin validación | Compara antes de actualizar |
| **Auditoría** | Logs básicos | Logs detallados con valores anteriores/nuevos |
| **Nuevos asegurados** | 1 teléfono | 2 teléfonos |
| **Campos en Excel** | 10 | 11 |

---

## 🚀 Próximos Pasos

1. **Descargar nueva plantilla:**
   - URL: `http://localhost:3000/bolsas/cargar-excel`
   - Botón: "Descargar Plantilla"
   - Verás: 11 columnas con "Teléfono Principal" y "Teléfono Alterno"

2. **Probar con casos reales:**
   - Cargar Excel con asegurados existentes (cambiar teléfonos)
   - Cargar Excel con nuevos asegurados
   - Revisar logs del backend para confirmar cambios

3. **Verificar en BD:**
   ```sql
   SELECT dni, tel_fijo, tel_celular
   FROM asegurados
   WHERE dni IN (SELECT doc_paciente FROM excel_importado)
   ORDER BY fecha_actualizacion DESC;
   ```

4. **Opcional: Implementar auditoría en BD**
   - Crear tabla de auditoría de teléfonos
   - Trigger al UPDATE asegurados

---

## 📝 Nota Técnica

La validación `if (!valor.equals(valorAnterior))` asegura que:
- ✅ No se actualiza si es igual
- ✅ Reduce escrituras innecesarias en BD
- ✅ Facilita detección de cambios reales
- ✅ Mejora rendimiento

---

**Implementación completada:** 2026-01-28
**Versión:** v1.14.0
**Status:** ✅ Compilado y Listo para Testing
