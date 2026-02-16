# 📧 Sistema de Relay SMTP en Docker - CENATE

> **Versión:** 1.0
> **Última Actualización:** 2026-02-16
> **Componentes:** Docker Compose + Postfix Relay + Spring Boot

---

## 🎯 Arquitectura General del Relay

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (cenate-net)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐  │
│  │  Spring Boot        │         │   Postfix Relay      │  │
│  │  Backend Container  │ ──┐     │   (SMTP Relay)       │  │
│  │  (cenate-backend)   │   │     │   (smtp-relay)       │  │
│  │                     │   │     │                      │  │
│  │ :8080              │   └────→ :25 (interno)         │  │
│  │ MAIL_HOST:         │     ┌─ :2525 (externo)      │  │
│  │ host.docker.internal│   │    │                      │  │
│  │ MAIL_PORT: 2525     │   │    │ RELAYHOST:          │  │
│  │                     │   │    │ 172.20.0.227:25     │  │
│  └─────────────────────┘   │    │                      │  │
│                             │    │ (reenvía al servidor │  │
│                             └───→ EsSalud)             │  │
│                                  │                      │  │
│                                  └──────────────────────┘  │
│                                           │                │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  Servidor SMTP     │
                                    │  EsSalud           │
                                    │  172.20.0.227:25   │
                                    └────────────────────┘
```

---

## 📦 Componentes del Docker Compose

### **1. Backend Container (Spring Boot)**

```yaml
backend:
  container_name: cenate-backend
  build:
    context: ./backend
    dockerfile: Dockerfile
  environment:
    # 📧 Email SMTP (via host a servidor EsSalud)
    MAIL_HOST: ${MAIL_HOST:-host.docker.internal}
    MAIL_PORT: ${MAIL_PORT:-2525}
    MAIL_USERNAME: ${MAIL_USERNAME:-cenate.contacto@essalud.gob.pe}
    MAIL_PASSWORD: ${MAIL_PASSWORD:-essaludc50}
    MAIL_SMTP_AUTH: ${MAIL_SMTP_AUTH:-false}
    MAIL_SMTP_STARTTLS: ${MAIL_SMTP_STARTTLS:-false}
    MAIL_SMTP_SSL: ${MAIL_SMTP_SSL:-false}
    FRONTEND_URL: ${FRONTEND_URL:-http://10.0.89.239}
  ports:
    - "8080:8080"
  extra_hosts:
    # Permite al contenedor acceder a la red del host (macOS)
    - "host.docker.internal:host-gateway"
  depends_on:
    - smtp-relay
  networks:
    - cenate-net
```

**Puntos Clave:**
- ✅ `depends_on: smtp-relay` - Espera a que Postfix esté listo
- ✅ `host.docker.internal` - Accede al Postfix local (macOS/Docker Desktop)
- ✅ Puerto 2525 - Puerto alternativo para SMTP (evita conflictos)
- ✅ Sin autenticación SMTP (`MAIL_SMTP_AUTH: false`)

---

### **2. SMTP Relay Container (Postfix)**

```yaml
smtp-relay:
  container_name: smtp-relay-cenate
  image: boky/postfix
  ports:
    - "2525:25"
  environment:
    # 🔄 Reenvía los correos al servidor EsSalud
    - RELAYHOST=172.20.0.227:25
    # 📨 Solo permite enviar desde dominios EsSalud
    - ALLOWED_SENDER_DOMAINS=essalud.gob.pe
    # 🏢 Nombre del host de correo
    - POSTFIX_myhostname=cenate.essalud.gob.pe
    # 🌍 Zona horaria
    - TZ=America/Lima
    # 🔧 Deshabilitar verificación DNS (para red interna)
    - POSTFIX_smtp_dns_support_level=disabled
    - POSTFIX_disable_dns_lookups=yes
    - POSTFIX_smtp_host_lookup=native
    # 🚨 Restricciones de recipients
    - POSTFIX_smtpd_recipient_restrictions=permit_mynetworks,defer_unauth_destination
  extra_hosts:
    # 🗺️ Mapear dominios EsSalud a IP del servidor
    - "essalud.gob.pe:172.20.0.227"
    - "wiracocha.essalud:172.20.0.227"
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "postfix", "status"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**Puntos Clave:**
- ✅ **Imagen:** `boky/postfix` - Postfix preconfigurado
- ✅ **Puerto:** `2525:25` - Mapea puerto host 2525 a puerto 25 dentro del contenedor
- ✅ **RELAYHOST:** `172.20.0.227:25` - Servidor SMTP corporativo EsSalud
- ✅ **extra_hosts:** Mapea dominios a IP para resolución sin DNS
- ✅ **Healthcheck:** Verifica que Postfix esté corriendo

---

## 🔄 Flujo de Envío de Correos

### **Secuencia Completa:**

```
1. Spring Boot App quiere enviar email
   ↓
2. Se conecta a MAIL_HOST (host.docker.internal:2525)
   ↓
3. En Docker Desktop (macOS), host.docker.internal resuelve a localhost
   ↓
4. Conecta al Postfix relay en puerto 2525
   ↓
5. Postfix recibe el email (protocolo SMTP)
   ↓
6. Postfix valida que sea de dominio permitido (essalud.gob.pe)
   ↓
7. Postfix reenvía a RELAYHOST (172.20.0.227:25)
   ↓
8. Servidor EsSalud recibe y entrega el correo
   ↓
9. Postfix registra el evento en logs
   ↓
10. Backend marca como "ENVIADO" en tabla email_audit_log
```

---

## 🚀 Cómo Iniciar el Sistema

### **1. Opción A: Docker Compose (Recomendado)**

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d

# Ver logs del backend
docker logs -f cenate-backend

# Ver logs del relay SMTP
docker logs -f smtp-relay-cenate

# Detener todo
docker-compose down
```

### **2. Opción B: Con variables personalizadas**

```bash
# Crear archivo .env con variables personalizadas
cat > .env << EOF
SPRING_DATASOURCE_URL=jdbc:postgresql://10.0.89.241:5432/maestro_cenate
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=Essalud2025
MAIL_HOST=host.docker.internal
MAIL_PORT=2525
MAIL_USERNAME=cenate.contacto@essalud.gob.pe
MAIL_PASSWORD=essaludc50
FRONTEND_URL=http://10.0.89.239
EOF

# Iniciar con variables del archivo
docker-compose up -d
```

### **3. Opción C: Línea de comando**

```bash
docker-compose \
  -f docker-compose.yml \
  up -d \
  --build
```

---

## 📊 Monitoreo del Relay

### **Ver estado de Postfix**

```bash
# Conectar al contenedor
docker exec -it smtp-relay-cenate bash

# Ver cola de correos pendientes
postqueue -p

# Ver logs de Postfix
tail -f /var/log/mail.log

# Salir del contenedor
exit
```

### **Ver logs del backend**

```bash
docker logs cenate-backend | grep -i "email\|mail\|correo"
```

### **Verificar conectividad**

```bash
# Desde el backend, ver si puede conectar al relay
docker exec cenate-backend \
  sh -c "echo test | nc -v host.docker.internal 2525"

# Ver respuesta: esperado "220 ..." (SMTP ready)
```

---

## 🔍 Debugging

### **Problema: "Connection refused" en Puerto 2525**

```bash
# Verificar que Postfix está corriendo
docker ps | grep smtp-relay

# Si no aparece, revisar logs
docker logs smtp-relay-cenate

# Reiniciar el contenedor
docker-compose restart smtp-relay
```

### **Problema: Correos no se envían**

```bash
# 1. Verificar que el relay está escuchando
docker exec smtp-relay-cenate netstat -tlnp | grep :25

# 2. Verificar conectividad a EsSalud desde relay
docker exec smtp-relay-cenate \
  bash -c "nc -zv 172.20.0.227 25"

# 3. Ver cola de correos
docker exec smtp-relay-cenate postqueue -p

# 4. Ver logs detallados
docker exec smtp-relay-cenate \
  tail -100 /var/log/mail.log | grep "to=<correo>"
```

### **Problema: "Authentication required" en logs**

```bash
# El servidor SMTP corporativo requiere autenticación
# Solución: Agregue a docker-compose.yml

environment:
  - POSTFIX_smtp_sasl_auth_enable=yes
  - POSTFIX_smtp_sasl_password_maps=static:usuario:contraseña
  - POSTFIX_smtp_sasl_security_options=noanonymous
```

---

## 📋 Variables de Configuración Postfix

| Variable | Valor Actual | Descripción |
|----------|--------------|-------------|
| `RELAYHOST` | `172.20.0.227:25` | Servidor SMTP destino |
| `ALLOWED_SENDER_DOMAINS` | `essalud.gob.pe` | Solo permite estos dominios |
| `POSTFIX_myhostname` | `cenate.essalud.gob.pe` | Nombre HELO enviado |
| `POSTFIX_smtp_dns_support_level` | `disabled` | No resuelve DNS |
| `POSTFIX_disable_dns_lookups` | `yes` | Deshabilita búsquedas DNS |

---

## 🔐 Seguridad del Relay

### **Buenas Prácticas Implementadas:**

✅ **Restricción de dominios:** Solo envía desde `essalud.gob.pe`
✅ **Sin DNS:** Evita búsquedas DNS inseguras en red interna
✅ **Red privada Docker:** Los contenedores no están expuestos
✅ **Healthcheck:** Verifica que Postfix esté operativo
✅ **Logs auditables:** Todos los correos quedan registrados
✅ **No requiere autenticación:** El relay solo reenvía, no valida

### **Lo que DEBERÍA hacer:**

```
Backend → Relay (2525) → Servidor Corporativo (172.20.0.227:25)
                             ↑
                    (El servidor corporativo valida)
                    (El relay es solo intermediario)
```

---

## 🐳 Variantes del docker-compose.yml

### **Opción 1: Host Network (Linux)**

```yaml
services:
  smtp-relay:
    network_mode: "host"
    ports:
      - "2525:25"
```

**Ventaja:** Acceso directo a red del host
**Desventaja:** Solo funciona en Linux

### **Opción 2: Mac Fixed (macOS M1/M2)**

```yaml
backend:
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

**Ventaja:** Compatible con Docker Desktop en macOS
**Desventaja:** Requiere `host-gateway`

### **Opción 3: Con nombre de host**

```yaml
backend:
  environment:
    MAIL_HOST: smtp-relay
```

**Ventaja:** Usa DNS interno de Docker
**Desventaja:** Requiere estar en la misma red Docker

---

## 📈 Monitoreo y Logs

### **Estructura de logs Postfix:**

```
Jan 16 10:23:45 cenate relay/smtp[1234]: ABC123: to=<usuario@essalud.gob.pe>,
relay=172.20.0.227[172.20.0.227]:25, delay=0.45, delays=0.02/0.01/0.15/0.27,
dsn=2.0.0, status=sent (250 2.0.0 OK)
```

**Interpretación:**
- `ABC123` = Queue ID del correo
- `to=<usuario@essalud.gob.pe>` = Destinatario
- `relay=172.20.0.227` = Servidor destino
- `delay=0.45` = Tiempo total en segundos
- `status=sent` = ✅ Enviado exitosamente

---

## ✅ Checklist de Verificación

- [ ] Docker Compose está actualizado
- [ ] Variables de entorno configuradas correctamente
- [ ] Backend conecta a puerto 2525
- [ ] Postfix listening en puerto 25 (interno) y 2525 (externo)
- [ ] `depends_on` incluye `smtp-relay`
- [ ] `extra_hosts` mapea a los servicios correctamente
- [ ] Healthcheck de Postfix pasa
- [ ] Logs muestran "status=sent"
- [ ] Correos llegan a EsSalud
- [ ] Tabla `email_audit_log` registra envíos

---

## 🆘 Soporte y Troubleshooting Avanzado

### **Comando para limpiar queue (⚠️ PELIGRO):**

```bash
docker exec smtp-relay-cenate postsuper -d ALL
```

### **Reiniciar Postfix desde dentro del contenedor:**

```bash
docker exec smtp-relay-cenate postfix stop
docker exec smtp-relay-cenate postfix start
docker exec smtp-relay-cenate postfix status
```

### **Ver configuración actual de Postfix:**

```bash
docker exec smtp-relay-cenate postconf | grep relayhost
docker exec smtp-relay-cenate postconf | grep myorigin
```

---

## 📞 Contactos

| Servicio | Host | Puerto | Responsable |
|----------|------|--------|-------------|
| Relay SMTP (local) | host.docker.internal | 2525 | Docker Compose |
| Servidor SMTP (EsSalud) | 172.20.0.227 | 25 | Infraestructura EsSalud |
| Backend Spring Boot | localhost | 8080 | Developers |

---

**Documento creado:** 2026-02-16
**Base:** Implementación CENATE v1.68.5 en Docker
