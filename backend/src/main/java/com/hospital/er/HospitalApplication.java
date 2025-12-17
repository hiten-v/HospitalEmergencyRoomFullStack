package com.hospital.er;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class HospitalApplication {
    
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    public static void main(String[] args) {
        SpringApplication.run(HospitalApplication.class, args);
        
        System.out.println("========== DEBUG INFO ==========");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("Spring Boot Version: 3.1.5");
        System.out.println("MongoDB URI present: " + (System.getenv("MONGODB_URI") != null));
        System.out.println("========== END DEBUG ==========");
        
        System.out.println("✅ Hospital ER System Started!");
    }
    
    // This will print after Spring loads
    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("MongoDB URI from @Value: " + mongoUri);
    }
}