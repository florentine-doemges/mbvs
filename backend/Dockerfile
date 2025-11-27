FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
COPY gradlew ./
COPY src ./src
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
