# ================================
# Multi-stage Dockerfile para Spring Boot con Gradle
# ================================

# -----------------------------
# Stage 1: Build
# -----------------------------
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

# Copiar código fuente
COPY src src/

# Construir la aplicación (esto genera el JAR)
RUN ./gradlew clean build -x test --no-daemon

# -----------------------------
# Stage 2: Runtime
# -----------------------------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR construido desde el stage anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Crear usuario no-root para seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/auth/health || exit 1

# Variables de entorno por defecto
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
