FROM openjdk:17-slim

WORKDIR /app
COPY target/hospital-er.jar app.jar

# Add TLS fix
CMD ["java", "-Djdk.tls.client.protocols=TLSv1.2", "-jar", "app.jar"]