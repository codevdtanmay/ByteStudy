# syntax=docker/dockerfile:1.7

# Build the Spring Boot application with Maven, then keep Maven out of the runtime image.
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests dependency:go-offline

COPY backend/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 appuser \
    && useradd --system --uid 10001 --gid appuser --home-dir /app --no-create-home appuser \
    && chown -R appuser:appuser /app

COPY --from=build --chown=appuser:appuser /workspace/target/bytepath-backend-1.0.0.jar /app/app.jar
COPY --chmod=755 backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENV PORT=8081
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0 -Dfile.encoding=UTF-8"
EXPOSE 8081
USER appuser

ENTRYPOINT ["docker-entrypoint.sh"]
