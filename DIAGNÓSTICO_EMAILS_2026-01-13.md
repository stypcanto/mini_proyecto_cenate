# 📧 DIAGNÓSTICO DE PROBLEMA: EMAILS NO SE ENVÍAN

**Fecha:** 13 de Enero 2026
**Problema:** Los correos de reset, cambio de contraseña y confirmación de aceptación **NO se están enviando**

---

## 🔴 RAÍZ DEL PROBLEMA

El servidor SMTP corporativo de EsSalud **NO está accesible**:

```
Error: Got bad greeting from SMTP host: 172.20.0.227, port: 25, response: [EOF]
```

### Explicación

- **`[EOF]`** = "End Of File" = La conexión se cierra inmediatamente sin respuesta válida
- **Servidor:** 172.20.0.227:25 (SMTP corporativo EsSalud)
- **Estado:** NO responde | No disponible | Bloqueado por firewall | Problema de red

---

## 🔍 DIAGNÓSTICO DETALLADO

### Logs del Sistema

```
2026-01-07 17:43:52.451 ERROR MailException al enviar correo a dbsa1709@gmail.com:
Mail server connection failed.
Failed messages: jakarta.mail.MessagingException: Got bad greeting from SMTP host: 172.20.0.227, port: 25
```

### Causas Probables (en orden de probabilidad)

| # | Causa | Síntomas | Solución |
|---|-------|---------|----------|
| 1️⃣ | Servidor SMTP corporativo no disponible | `[EOF]` al conectar | Contactar a TI EsSalud para verificar estado |
| 2️⃣ | Firewall bloquea puerto 25 | No puede establecer conexión | Solicitar a TI que abra puerto 25 |
| 3️⃣ | Problema de red/conectividad | `Connection timeout` | Verificar conectividad: `ping 172.20.0.227` |
| 4️⃣ | Servidor requiere autenticación (pero está deshabilitada) | `Auth failed` | Habilitar `MAIL_SMTP_AUTH=true` |

---

## ✅ SOLUCIONES RECOMENDADAS

### 🟢 Solución 1: Usar Gmail para Desarrollo (RECOMENDADO)

**Si el servidor corporativo no funciona en desarrollo**, usar la cuenta Gmail configurable:

#### Pasos:

1. **Habilitar fallback a Gmail:**
   ```bash
   export MAIL_USE_GMAIL_FALLBACK=true
   export MAIL_GMAIL_USERNAME=cenateinformatica@gmail.com
   export MAIL_GMAIL_PASSWORD="nolq uisr fwdw zdly"
   ```

2. **Reiniciar el backend:**
   ```bash
   cd backend
   ./gradlew bootRun
   ```

3. **Verificar en logs:**
   ```
   ✅ Using Gmail fallback for email sending
   ```

#### Ventajas:
- ✅ Funciona inmediatamente
- ✅ No requiere intervención de TI
- ✅ Ideal para desarrollo/testing
- ✅ Auditoría completa en logs

#### Desventajas:
- ⚠️ Los correos vendrán de `cenateinformatica@gmail.com` (no del dominio corporativo)
- ⚠️ Solo para desarrollo, no producción

---

### 🟠 Solución 2: Verificar Servidor Corporativo

**Si necesitas que funcione con el servidor corporativo:**

#### Paso 1: Verificar Conectividad
```bash
# Verificar si el servidor responde
ping 172.20.0.227

# Verificar si el puerto 25 está abierto
telnet 172.20.0.227 25
```

#### Paso 2: Contactar a TI EsSalud
- **Solicitar:** Verificar estado del servidor SMTP (172.20.0.227:25)
- **Mencionar:** "El sistema CENATE no puede enviar correos"
- **Proporcionar error:** "Got bad greeting from SMTP host: 172.20.0.227, port: 25, response: [EOF]"

#### Paso 3: Actualizar Credenciales (si es necesario)
```bash
export MAIL_HOST=172.20.0.227
export MAIL_PORT=25
export MAIL_USERNAME=cenate.contacto@essalud.gob.pe
export MAIL_PASSWORD=essaludc50
export MAIL_SMTP_AUTH=false  # Cambiar a true si requiere autenticación
export MAIL_SMTP_STARTTLS=true
```

---

## 🧪 NUEVO: Endpoint de Prueba SMTP

Se agregó un endpoint para diagnosticar problemas de email:

### Uso:
```bash
# Probar conexión SMTP
curl "http://localhost:8080/api/health/smtp-test?email=test@example.com"
```

### Respuesta Exitosa:
```json
{
  "exitoso": true,
  "mensaje": "Conexión SMTP exitosa",
  "detalle": "Se envió un correo de prueba a: test@example.com",
  "servidor": "172.20.0.227",
  "puerto": 25
}
```

### Respuesta con Error:
```json
{
  "exitoso": false,
  "mensaje": "Falló la conexión SMTP",
  "detalle": "No se pudo establecer conexión con el servidor de correo",
  "error": "Got bad greeting from SMTP host: 172.20.0.227, port: 25"
}
```

---

## 📋 CHECKLIST DE EMAILS

### Pendientes de Reset de Contraseña
- [ ] Verificar que los correos se envían cuando se solicita recuperación
- [ ] Verificar que el enlace funciona en el correo

### Pendientes de Cambio de Contraseña
- [ ] Verificar que los correos se envían al aprobar solicitudes
- [ ] Verificar que el enlace de configuración funciona

### Confirmación de Aceptación
- [ ] Verificar que se envían cuando se aprueban solicitudes de registro
- [ ] Verificar contenido del correo

### Rechazo de Solicitudes
- [ ] Verificar que se envían cuando se rechazan solicitudes
- [ ] Verificar que el motivo aparece en el correo

---

## 🔧 CAMBIOS IMPLEMENTADOS

### 1. HealthController.java
- ✅ Agregado endpoint `/api/health/smtp-test` para pruebas de conexión
- ✅ Diagnostica problemas SMTP automáticamente

### 2. application.properties
- ✅ Aumentados timeouts de SMTP (15 segundos)
- ✅ Configuración de SMTP más flexible
- ✅ Soporte para fallback a Gmail (via variable de entorno)

### 3. EmailService.java
- ✅ Mejorado manejo de excepciones
- ✅ Agregada función `diagnosticarErrorSMTP()` para diagnosticar automáticamente
- ✅ Logs más detallados para troubleshooting

---

## 📞 CONTACTOS

### Para Problemas de Email:
- **TI EsSalud:** [Contactar al equipo de infraestructura]
- **Servidor:** 172.20.0.227:25
- **Cuenta:** cenate.contacto@essalud.gob.pe

### Para Desarrollo:
- Usar Gmail fallback temporalmente mientras se resuelve el servidor corporativo

---

## 📊 ESTADO ACTUAL

| Componente | Estado | Notas |
|-----------|--------|-------|
| Configuración SMTP | ⚠️ NO FUNCIONA | Servidor corporativo no responde |
| Emails de Reset | ❌ NO ENVIADOS | Bloqueado por fallo SMTP |
| Emails de Cambio | ❌ NO ENVIADOS | Bloqueado por fallo SMTP |
| Emails de Aceptación | ❌ NO ENVIADOS | Bloqueado por fallo SMTP |
| Gmail Fallback | ✅ DISPONIBLE | Puede activarse para desarrollo |
| Pruebas SMTP | ✅ DISPONIBLE | Endpoint `/api/health/smtp-test` |

---

## 🚀 PRÓXIMOS PASOS

1. **Inmediato:** Decidir entre:
   - Usar Gmail fallback para desarrollo
   - Esperar que TI repare servidor corporativo

2. **Verificar:** Los cambios en código están listos para que funcione con ambos servidores

3. **Testing:** Una vez resuelto, probar todos los flujos de email

---

*Documento generado por: Claude Code | Fecha: 2026-01-13*
