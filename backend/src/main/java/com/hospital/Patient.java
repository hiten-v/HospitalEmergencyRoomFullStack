package com.hospital.er;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "patients")
public class Patient {
    @Id
    private String id;
    private String name;
    private int severity;
    private LocalDateTime arrivalTime;
    private boolean emergency;
    private String status;
    
    // Constructors
    public Patient() {
        this.arrivalTime = LocalDateTime.now();
        this.status = "WAITING";
        this.emergency = false;
    }
    
    public Patient(String name, int severity) {
        this();
        this.name = name;
        this.severity = Math.max(1, Math.min(severity, 10));
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getSeverity() { return severity; }
    public void setSeverity(int severity) { 
        this.severity = Math.max(1, Math.min(severity, 10)); 
    }
    
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    
    public boolean isEmergency() { return emergency; }
    public void setEmergency(boolean emergency) { this.emergency = emergency; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}