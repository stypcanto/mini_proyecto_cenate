# ================================
# 🌱 Multi-stage Dockerfile para Spring Boot (Gradle)
# Compatible con ARM (Apple Silicon) y AMD64
# ================================

# -----------------------------
# 🏗️ Stage 1: Build
# -----------------------------
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copiar archivos necesarios para resolución de dependencias
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

# Descargar dependencias primero (sin suprimir errores)
RUN ./gradlew dependencies --no-daemon

# Copiar el código fuente completo
COPY src src/

# Forzar compilación limpia con dependencias nuevas
RUN ./gradlew clean build -x test --no-daemon --refresh-dependencies

# -----------------------------
# 🚀 Stage 2: Runtime
# -----------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copiar el JAR desde la etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Crear usuario no-root
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV TZ=America/Lima

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
