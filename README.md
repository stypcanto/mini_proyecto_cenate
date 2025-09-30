# PruebaAPI Fullstack - Spring Boot + React + PostgreSQL

Proyecto de ejemplo que expone una API REST para obtener información de pacientes desde PostgreSQL, con frontend en React y backend en Spring Boot, todo orquestado con Docker.

---

## 🛠 Tecnologías

- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA
- **Frontend**: React, Create React App
- **Base de datos**: PostgreSQL 15
- **Contenerización**: Docker, Docker Compose
- **Comunicación**: REST API JSON

---

## 📂 Estructura del proyecto

PruebaAPI_Fullstack/
├── backend/
│ ├── src/main/java/com/example/pruebaapi/
│ │ ├── controller/PacienteController.java
│ │ ├── model/Paciente.java
│ │ ├── repository/PacienteRepository.java
│ │ └── PruebaApiApplication.java
│ └── pom.xml
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
├── docker-compose.yml
└── README.md

```yaml

---

## ⚙️ Configuración de entorno

Variables de conexión a PostgreSQL (backend `application.properties`):

```properties
spring.datasource.url=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
spring.datasource.username=chatbot_cnt
spring.datasource.password=C3n3tQ123
spring.jpa.hibernate.ddl-auto=none
server.port=5000

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
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                    NAMES
02ed55b63e84   cenate-frontend   "/docker-entrypoint.…"   6 seconds ago   Up 5 seconds   0.0.0.0:80->80/tcp       cenate-frontend
e85d41ded25f   cenate-backend    "java -jar app.jar"      6 seconds ago   Up 5 seconds   0.0.0.0:8080->8080/tcp   cenate-backend
38c15c0115c0   postgres:15       "docker-entrypoint.s…"   6 seconds ago   Up 6 seconds   0.0.0.0:5432->5432/tcp   cenate-db
styp@MacBook-Pro-de-Styp cenate % curl http://localhost:8080/api/hello
Hola desde Spring Boot!%                                                                                     styp@MacBook-Pro-de-Styp cenate % curl http://localhost:80            
<!doctype html><html lang="en"><head><meta charset="utf-8"/>
```

