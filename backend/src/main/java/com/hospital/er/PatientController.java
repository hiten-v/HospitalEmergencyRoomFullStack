package com.hospital.er;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://hospitalemergencyroomfullstack-production.up.railway.app", // Add this
    "http://localhost:8080"  // Optional for local testing
})
public class PatientController {
    
    @Autowired
    private HospitalService hospitalService;
    
    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return hospitalService.getAllPatients();
    }
    
    @PostMapping("/patients")
    public Patient addPatient(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        int severity = Integer.parseInt(request.get("severity").toString());
        return hospitalService.addPatient(name, severity);
    }
    
    @PostMapping("/emergency")
    public Patient addEmergency(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        return hospitalService.addEmergencyPatient(name);
    }
    
    @DeleteMapping("/patients/{id}")
    public String deletePatient(@PathVariable String id) {
        hospitalService.removePatient(id);
        return "Patient deleted";
    }
    
    @PostMapping("/treat")
    public Patient treatNextPatient() {
        return hospitalService.treatNextPatient();
    }

    @PutMapping("/patients/{id}/treat")
    public Patient treatPatient(@PathVariable String id) {
        // Get patient
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Mark as treated
        patient.setStatus("TREATED");
        
        // Save to database
        return patientRepository.save(patient);
    }
    
    @PutMapping("/patients/{id}")
    public Patient updateSeverity(@PathVariable String id, @RequestBody Map<String, Integer> request) {
        int severity = request.get("severity");
        return hospitalService.updateSeverity(id, severity);
    }
    
    @GetMapping("/waiting")
    public List<Patient> getWaitingList() {
        return hospitalService.getWaitingList();
    }
    
    @GetMapping("/severity")
    public List<Patient> getPatientsBySeverity() {
        return hospitalService.getPatientsBySeverity();
    }
    
    @GetMapping("/search")
    public List<Patient> searchPatients(@RequestParam String name) {
        return hospitalService.searchByName(name);
    }
    
    @GetMapping("/next")
    public Patient getNextToTreat() {
        return hospitalService.getNextToTreat();
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return hospitalService.getStats();
    }
}