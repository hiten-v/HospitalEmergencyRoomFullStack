package com.hospital.er;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;  // ADD THIS IMPORT
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HospitalService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    // Priority queue like your original code
    private PriorityQueue<Patient> priorityQueue = new PriorityQueue<>(
        Comparator.comparingInt(Patient::getSeverity).reversed()
            .thenComparing(Patient::getArrivalTime)
    );
    
    public Patient addPatient(String name, int severity) {
        Patient patient = new Patient(name, severity);
        Patient saved = patientRepository.save(patient);
        priorityQueue.add(saved);
        return saved;
    }
    
    public Patient addEmergencyPatient(String name) {
        Patient patient = new Patient(name, 10);
        patient.setEmergency(true);
        Patient saved = patientRepository.save(patient);
        priorityQueue.add(saved);
        return saved;
    }
    
    public void removePatient(String id) {
        patientRepository.deleteById(id);
        priorityQueue.removeIf(p -> p.getId().equals(id));
    }
    
    public Patient treatNextPatient() {
        if (priorityQueue.isEmpty()) {
            // Reload from database
            List<Patient> waiting = patientRepository.findByStatus("WAITING");
            priorityQueue.addAll(waiting);
            
            if (priorityQueue.isEmpty()) {
                throw new RuntimeException("No patients to treat");
            }
        }
        
        Patient patient = priorityQueue.poll();
        patient.setStatus("TREATED");
        return patientRepository.save(patient);
    }
    
    public Patient updateSeverity(String id, int severity) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        priorityQueue.remove(patient);
        patient.setSeverity(severity);
        
        Patient updated = patientRepository.save(patient);
        priorityQueue.add(updated);
        return updated;
    }
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public List<Patient> getWaitingList() {
        return patientRepository.findByStatusOrderByArrivalTimeAsc("WAITING");
    }
    
    public List<Patient> getPatientsBySeverity() {
        List<Patient> waiting = patientRepository.findByStatus("WAITING");
        waiting.sort(Comparator.comparingInt(Patient::getSeverity).reversed()
            .thenComparing(Patient::getArrivalTime));
        return waiting;
    }
    
    public Patient getNextToTreat() {
        List<Patient> waiting = getPatientsBySeverity();
        return waiting.isEmpty() ? null : waiting.get(0);
    }
    
    public List<Patient> searchByName(String name) {
        return patientRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", patientRepository.count());
        stats.put("waiting", patientRepository.findByStatus("WAITING").size());
        stats.put("treated", patientRepository.findByStatus("TREATED").size());
        return stats;
    }
    
    // // Load existing patients into priority queue on startup
    // @PostConstruct  // This runs after Spring initializes the bean
    // public void init() {
    //     List<Patient> waitingPatients = patientRepository.findByStatus("WAITING");
    //     priorityQueue.addAll(waitingPatients);
    //     System.out.println("✅ Loaded " + waitingPatients.size() + " patients into priority queue from MongoDB");
    // }
}