FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

# Install and update CA certificates - THIS IS CRITICAL FOR SSL
RUN apk add --no-cache ca-certificates && \
    update-ca-certificates

WORKDIR /app

# Copy the JAR file - use wildcard to find it
COPY --from=builder /app/target/*.jar app.jar

# Run with ALL necessary TLS flags
CMD ["java", \
    "-Djdk.tls.client.protocols=TLSv1.2", \
    "-Dhttps.protocols=TLSv1.2", \
    "-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts", \
    "-Djavax.net.ssl.trustStorePassword=changeit", \
    "-jar", "app.jar"]