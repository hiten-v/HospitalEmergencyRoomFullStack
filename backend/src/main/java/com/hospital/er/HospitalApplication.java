package com.hospital.er;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class HospitalApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalApplication.class, args);
        System.out.println("✅ Hospital ER System Started!");
        System.out.println("🌐 http://localhost:8080");
        System.out.println("📡 MongoDB connected");
    }
}