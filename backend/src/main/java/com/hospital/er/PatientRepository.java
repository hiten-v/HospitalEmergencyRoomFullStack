package com.hospital.er;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    List<Patient> findByStatusOrderByArrivalTimeAsc(String status);
    List<Patient> findByStatus(String status);
    List<Patient> findByNameContainingIgnoreCase(String name);
}