FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

# Install and update CA certificates
RUN apk add --no-cache ca-certificates openssl && \
    update-ca-certificates

WORKDIR /app
COPY --from=builder /app/target/hospital-er.jar app.jar

# Run with COMPLETE TLS configuration
CMD ["java", \
    "-Djdk.tls.client.protocols=TLSv1.2,TLSv1.3", \
    "-Dhttps.protocols=TLSv1.2,TLSv1.3", \
    "-Djdk.tls.client.cipherSuites=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256", \
    "-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts", \
    "-Djavax.net.ssl.trustStorePassword=changeit", \
    "-Djavax.net.debug=ssl:handshake", \
    "-jar", "app.jar"]