# 🚨 GUÍA DE SOLUCIÓN: Backend no puede conectar a PostgreSQL

## ❌ PROBLEMA IDENTIFICADO

El backend está **unhealthy** porque no puede conectarse a PostgreSQL en `10.0.89.13:5432`

**Error:**
```
Caused by: java.net.SocketTimeoutException: Connect timed out
```

---

## 🔍 PASO 1: Diagnóstico Automatizado

Ejecuta el script de diagnóstico:

```bash
cd /Users/cenate2/PortalWeb/mini_proyecto_cenate
chmod +x diagnose-db-connection.sh
./diagnose-db-connection.sh
```

Este script te dirá exactamente dónde está el problema.

---

## ⚡ SOLUCIÓN RÁPIDA

### Opción A: Usar Network Mode Host (RECOMENDADO)

Si tu Mac puede conectarse a PostgreSQL pero el contenedor no:

```bash
# 1. Detener contenedores actuales
docker-compose down

# 2. Iniciar con configuración de red host
docker-compose -f docker-compose-host-network.yml up -d

# 3. Ver logs en tiempo real
docker logs -f cenate-backend
```

**¿Por qué funciona esto?**
- El `network_mode: host` hace que el contenedor use la misma red que tu Mac
- Elimina el aislamiento de red de Docker
- Permite acceso directo a recursos de red como `10.0.89.13`

---

### Opción B: Verificar y Arreglar Conectividad

Si ni tu Mac puede conectarse a PostgreSQL:

#### 1. Verificar que PostgreSQL está corriendo

```bash
# Intenta conectarte desde tu Mac
psql -h 10.0.89.13 -p 5432 -U postgres -d maestro_cenate

# O verifica solo conectividad
nc -zv 10.0.89.13 5432
```

#### 2. Si PostgreSQL está en otra máquina, verifica:

**En el servidor PostgreSQL (10.0.89.13):**

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql
# o
ps aux | grep postgres

# Verificar que escucha en todas las interfaces
sudo netstat -tlnp | grep 5432
# Debería mostrar: 0.0.0.0:5432 o *:5432
```

**Editar postgresql.conf:**
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```
Asegúrate que tenga:
```
listen_addresses = '*'
```

**Editar pg_hba.conf:**
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```
Agrega esta línea al final:
```
host    all    all    10.0.89.0/24    md5
```

**Reiniciar PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

#### 3. Verificar Firewall

**En el servidor PostgreSQL:**
```bash
# Permitir puerto 5432
sudo ufw allow 5432/tcp
```

---

## 🧪 VERIFICACIÓN PASO A PASO

### 1. Verificar conectividad desde tu Mac

```bash
# Prueba simple de puerto
nc -zv 10.0.89.13 5432

# Si está abierto, verás:
# Connection to 10.0.89.13 port 5432 [tcp/postgresql] succeeded!
```

### 2. Verificar credenciales

```bash
# Intenta conectarte con las credenciales del docker-compose
psql -h 10.0.89.13 -p 5432 -U postgres -d maestro_cenate
# Cuando pida password, usa: Essalud2025
```

### 3. Verificar desde el contenedor

```bash
# Entrar al contenedor
docker exec -it cenate-backend bash

# Dentro del contenedor
curl -v telnet://10.0.89.13:5432
```

---

## 📊 ESCENARIOS COMUNES

### Escenario 1: "Mac conecta, contenedor no"
**Causa:** Red Docker aislada
**Solución:** Usar `network_mode: host` (Opción A arriba)

### Escenario 2: "Nadie puede conectar"
**Causa:** PostgreSQL no acepta conexiones remotas o firewall
**Solución:** Configurar postgresql.conf y pg_hba.conf (Opción B arriba)

### Escenario 3: "Conecta pero falla autenticación"
**Causa:** Credenciales incorrectas
**Solución:** Verificar usuario/password en docker-compose.yml

### Escenario 4: "Base de datos no existe"
**Causa:** La BD 'maestro_cenate' no está creada
**Solución:** 
```bash
psql -h 10.0.89.13 -U postgres
CREATE DATABASE maestro_cenate;
```

---

## 🎯 COMANDOS ÚTILES

```bash
# Ver estado de contenedores
docker ps

# Ver logs del backend
docker logs -f cenate-backend

# Ver solo errores
docker logs cenate-backend 2>&1 | grep -i error

# Reiniciar contenedores
docker-compose restart

# Reconstruir y reiniciar
docker-compose down && docker-compose up -d --build

# Ver health status
docker inspect cenate-backend --format='{{.State.Health.Status}}'
```

---

## 🆘 SI NADA FUNCIONA

1. **Captura información del servidor PostgreSQL:**
```bash
ssh usuario@10.0.89.13
sudo netstat -tlnp | grep 5432
cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses
cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

2. **Intenta con la BD en modo local temporalmente:**
   - Instala PostgreSQL localmente en tu Mac
   - Cambia la URL en docker-compose.yml a `host.docker.internal:5432`

3. **Usa el backend sin Docker temporalmente:**
```bash
cd backend
./gradlew bootRun
```

---

## ✅ VERIFICACIÓN FINAL

Una vez resuelto el problema, deberías ver:

```bash
docker ps
# STATUS debe mostrar "healthy" o "(healthy)"

docker logs cenate-backend
# Debe mostrar:
# "Started CenateApplication"
# "Tomcat started on port 8080"
```

Y el endpoint de salud debe responder:
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```
