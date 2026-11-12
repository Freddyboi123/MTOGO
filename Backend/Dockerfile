FROM eclipse-temurin:27-jre
WORKDIR /app
COPY target/app.jar app.jar
RUN useradd -r appuser
USER appuser
EXPOSE 6969
ENTRYPOINT ["java", "-jar", "app.jar"]
