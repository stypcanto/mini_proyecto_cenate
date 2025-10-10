# ================================
# Multi-stage Dockerfile para Spring Boot (Gradle)
# Compatible con ARM (Apple Silicon) y AMD64
# ================================

# -----------------------------
# Stage 1: Build
# -----------------------------
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copiar archivos Gradle y wrapper
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

# Copiar código fuente
COPY src src/

# Construir el JAR (sin ejecutar tests)
RUN ./gradlew clean build -x test --no-daemon

# -----------------------------
# Stage 2: Runtime
# -----------------------------
# Usamos una imagen ligera y estable compatible con ARM
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copiar el JAR desde la etapa de compilación
COPY --from=build /app/build/libs/*.jar app.jar

# Crear usuario no-root para mayor seguridad
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Exponer puerto
EXPOSE 8080

# Healthcheck (usa curl, más portable que wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Variables de entorno
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV TZ=America/Lima

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
