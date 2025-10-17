# ============================================================
# 🌱 Multi-stage Dockerfile para Spring Boot (Gradle)
# Compatible con ARM (Apple Silicon) y AMD64
# ============================================================

# ------------------------------------------------------------
# 🏗️ STAGE 1: BUILD
# ------------------------------------------------------------
FROM --platform=$BUILDPLATFORM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copiar configuración Gradle
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

# Descargar dependencias
RUN ./gradlew dependencies --no-daemon || true

# Copiar código fuente
COPY src src/

# Compilar y generar el JAR
RUN ./gradlew clean bootJar -x test --no-daemon --refresh-dependencies

# Verificar que se generó correctamente
RUN ls -lh build/libs && echo "✅ Build completado con éxito"


# ------------------------------------------------------------
# 🚀 STAGE 2: RUNTIME
# ------------------------------------------------------------
FROM --platform=$TARGETPLATFORM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Instalar utilidades
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Copiar el JAR compilado
COPY --from=build /app/build/libs/cenate-0.0.1-SNAPSHOT.jar /app/app.jar

# Crear usuario seguro
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Exponer puerto
EXPOSE 8080
ENV TZ=America/Lima
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Healthcheck (opcional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# ✅ ENTRYPOINT CORREGIDO
ENTRYPOINT ["java", "-jar", "/app/app.jar"]