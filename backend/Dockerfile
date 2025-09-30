# -----------------------------
# Dockerfile para Spring Boot con Maven
# -----------------------------
# Esta versión asume que construyes el JAR fuera del contenedor
# usando Maven (`mvn clean package`). Si quieres construir dentro
# del contenedor, puedes descomentar la sección de build stage.

# -----------------------------
# Build stage (opcional)
# -----------------------------
# FROM maven:3.9.3-eclipse-temurin-17 AS build
# WORKDIR /app
# COPY pom.xml .
# COPY src ./src
# RUN mvn clean package -DskipTests

# -----------------------------
# Run stage
# -----------------------------
FROM openjdk:17-jdk-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el JAR generado por Maven
COPY target/*.jar app.jar

# Exponer el puerto de Spring Boot
EXPOSE 8080

# Variables de entorno opcionales (puedes definir aquí o en docker-compose)
# ENV SPRING_PROFILES_ACTIVE=prod
# ENV SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/maestro_cenate
# ENV SPRING_DATASOURCE_USERNAME=chatuser
# ENV SPRING_DATASOURCE_PASSWORD=chatpass

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
