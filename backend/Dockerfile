# ============================================================
# 🌱 Multi-stage Dockerfile para Spring Boot (Gradle)
# Compatible con Java 17 y arquitectura ARM/AMD64
# ============================================================

# ------------------------------------------------------------
# 🏗️ STAGE 1: BUILD
# ------------------------------------------------------------
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copiar archivos de configuración de Gradle primero (para mejor cache)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Descargar dependencias (se cachea si no cambian)
RUN gradle dependencies --no-daemon || true

# Copiar el resto del código
COPY src ./src

# 🧱 Compilar el jar ejecutable (sin tests para acelerar)
# Usar 'gradle' directamente en lugar de './gradlew'
RUN gradle clean bootJar -x test --no-daemon

# 🔍 Verificar que el JAR contiene la clase principal
RUN ls -lh build/libs && \
    echo "Comprobando contenido del JAR..." && \
    jar tf build/libs/*.jar | grep CenateApplication || echo "❌ No se encontró la clase principal"


# ------------------------------------------------------------
# 🚀 STAGE 2: RUNTIME
# ------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 🧩 Instalar herramientas útiles (curl, jq, column)
RUN apt-get update && \
    apt-get install -y curl jq bsdmainutils && \
    rm -rf /var/lib/apt/lists/*

# Copiar el jar compilado desde el stage anterior
COPY --from=build /app/build/libs/*.jar app.jar


# CREAR LA CARPETA DE LOGS Y DAR PERMISOS
RUN mkdir -p /app/logs && \
    addgroup --system spring && adduser --system --ingroup spring spring && \
    chown -R spring:spring /app/logs


# Crear usuario no root
# RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Exponer el puerto
EXPOSE 8080

# Establecer zona horaria
ENV TZ=America/Lima

# ============================================================
# 🩺 HEALTHCHECK - Monitoreo de la API
# ============================================================
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:9090/actuator/health || exit 1

# ============================================================
# 🚀 ARRANQUE FINAL con optimización de memoria
# ============================================================
ENTRYPOINT ["java", \
  "-Xms512m", \
  "-Xmx1536m", \
  "-XX:+UseG1GC", \
  "-XX:MaxGCPauseMillis=100", \
  "-XX:+UseStringDeduplication", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/app.jar"]
