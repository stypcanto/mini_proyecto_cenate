# PruebaAPI Fullstack - Spring Boot + React + PostgreSQL

Proyecto de ejemplo que expone una **API REST** para obtener información de pacientes desde **PostgreSQL**, con frontend en **React** y backend en **Spring Boot**, todo orquestado con **Docker**.

---

## 🛠 Tecnologías

- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA
- **Frontend**: React (Create React App)
- **Base de datos**: PostgreSQL 15
- **Contenerización**: Docker, Docker Compose
- **Comunicación**: REST API (JSON)

---

## 📂 Estructura del proyecto

```yaml 

cenate/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/styp/com/cenate/
│   │   │   │   ├── CenateApplication.java
│   │   │   │   ├── api/
│   │   │   │   │   ├── AseguradoController.java
│   │   │   │   │   └── Hello.java
│   │   │   │   ├── model/
│   │   │   │   │   └── Asegurado.java
│   │   │   │   └── repository/
│   │   │   │       └── AseguradoRepository.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/java/styp/com/cenate/
│   │       └── CenateApplicationTests.java
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md



```
## ⚙️ Configuración de entorno

Variables de conexión a PostgreSQL (backend `application.properties`):

```yaml
```properties
  spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://10.0.89.13:5432/maestro_cenate}
  spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
  spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:Essalud2025}

```
🚀 Levantar el proyecto con Docker

1. Construir los contenedores:
```bash
docker-compose build
```

2. Iniciar los servicios:

```bash
docker-compose up -d
```

3.  Verificar contenedores en ejecución:
```bash
 docker ps
```

### Puertos expuestos:

- Backend Spring Boot: http://localhost:8080
- Frontend React: http://localhost
- PostgreSQL: 5432


### 🔗 Probar endpoints desde la terminal

```bash

styp@MacBook-Pro-de-Styp cenate % docker ps
CONTAINER ID   IMAGE             COMMAND                  CREATED              STATUS              PORTS                    NAMES
f9e99cdc2b08   cenate-backend    "java -jar app.jar"      About a minute ago   Up About a minute   0.0.0.0:8080->8080/tcp   cenate-backend
2119ff33b649   cenate-frontend   "/docker-entrypoint.…"   4 minutes ago        Up 4 minutes        0.0.0.0:80->80/tcp       cenate-frontend

# Endpoint de prueba
curl "http://localhost:8080/api/hello"

# Lista con paginación
curl "http://localhost:8080/api/asegurados?page=0&size=10"

# Buscar por ID (pkAsegurado)
curl "http://localhost:8080/api/asegurados/id/12345"

# Buscar por documento (docPaciente)
curl "http://localhost:8080/api/asegurados/doc/07208947"


```

