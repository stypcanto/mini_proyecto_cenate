# ================================
# 🌱 Multi-stage Dockerfile para Spring Boot (Gradle)
# Compatible con ARM (Apple Silicon) y AMD64
# ================================

# -----------------------------
# 🏗️ Stage 1: Build
# -----------------------------
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

RUN ./gradlew dependencies --no-daemon

COPY src src/
RUN ./gradlew clean build -x test --no-daemon --refresh-dependencies

# -----------------------------
# 🚀 Stage 2: Runtime
# -----------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV TZ=America/Lima

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
