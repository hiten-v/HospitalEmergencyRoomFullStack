const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS - Allow all origins
app.use(cors());
app.use(express.json());

// MongoDB Connection
// NEW CODE - Use this instead
mongoose.connect(process.env.MONGODB_URI, { // REMOVE the '|| localhost' fallback
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ MongoDB Connected');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🔗 MongoDB Connected: ${mongoose.connection.readyState === 1 ? 'Yes' : 'No'}`);
        console.log(`🌐 Available endpoints:`);
        console.log(`   http://localhost:${PORT}/api/test`);
        console.log(`   http://localhost:${PORT}/api/patients/active`);
        console.log(`   http://localhost:${PORT}/api/patients/treated`);
        console.log(`   http://localhost:${PORT}/api/stats`);
    });
})
.catch(err => {
    console.error('❌ FATAL MongoDB Connection Error:', err.message);
    console.error('Failed to connect to MongoDB. Exiting...');
    process.exit(1); // Stop the app if DB connection fails
});

// Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  status: { type: String, enum: ['WAITING', 'TREATED', 'EMERGENCY'], default: 'WAITING' },
  arrivalTime: { type: Date, default: Date.now },
  treatedTime: { type: Date } // Track when patient was treated
});

const Patient = mongoose.model('Patient', patientSchema);

// Initialize with sample data
const initializeData = async () => {
  const count = await Patient.countDocuments();
  if (count === 0) {
    await Patient.create([
      { name: 'John Doe', severity: 3, status: 'WAITING', arrivalTime: new Date(Date.now() - 30*60000) },
      { name: 'Jane Smith', severity: 5, status: 'WAITING', arrivalTime: new Date(Date.now() - 15*60000) },
      { name: 'Emergency Patient 1', severity: 10, status: 'EMERGENCY', arrivalTime: new Date(Date.now() - 10*60000) },
      { name: 'Treated Patient', severity: 4, status: 'TREATED', arrivalTime: new Date(Date.now() - 45*60000), treatedTime: new Date(Date.now() - 5*60000) }
    ]);
    console.log('📝 Sample data initialized');
  }
};

// Helper function to sort patients correctly
const sortPatientsByPriority = (patients) => {
  return patients.sort((a, b) => {
    // 1. Emergency patients always come first
    if (a.status === 'EMERGENCY' && b.status !== 'EMERGENCY') return -1;
    if (a.status !== 'EMERGENCY' && b.status === 'EMERGENCY') return 1;
    
    // 2. If both are emergency or both are waiting, sort by severity (descending)
    if (a.severity !== b.severity) return b.severity - a.severity;
    
    // 3. If same severity, sort by arrival time (earliest first)
    return new Date(a.arrivalTime) - new Date(b.arrivalTime);
  });
};

// ALL ENDPOINTS:

// 1. Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    message: 'Backend is working!'
  });
});

// 2. Get active patients (WAITING + EMERGENCY - not TREATED) - FIXED SORTING
app.get('/api/patients/active', async (req, res) => {
  try {
    const patients = await Patient.find({ 
      status: { $in: ['WAITING', 'EMERGENCY'] } 
    });
    
    // Apply correct priority sorting
    const sortedPatients = sortPatientsByPriority(patients);
    
    res.json(sortedPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get treated patients
app.get('/api/patients/treated', async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'TREATED' })
      .sort({ treatedTime: -1 }); // Most recently treated first
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get all patients (for admin view)
app.get('/api/patients/all', async (req, res) => {
  try {
    const patients = await Patient.find();
    const sortedPatients = sortPatientsByPriority(
      patients.filter(p => p.status !== 'TREATED')
    ).concat(
      patients.filter(p => p.status === 'TREATED')
        .sort((a, b) => new Date(b.treatedTime) - new Date(a.treatedTime))
    );
    res.json(sortedPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Add patient
app.post('/api/patients', async (req, res) => {
  try {
    const { name, severity } = req.body;
    const patient = new Patient({
      name,
      severity: parseInt(severity),
      status: 'WAITING'
    });
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Add emergency patient (ALWAYS goes to top of queue)
app.post('/api/emergency', async (req, res) => {
  try {
    const { name } = req.body;
    const patient = new Patient({
      name,
      severity: 10,
      status: 'EMERGENCY'
    });
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Treat next patient (auto-selects highest priority)
app.post('/api/treat', async (req, res) => {
  try {
    // Get active patients
    const activePatients = await Patient.find({ 
      status: { $in: ['EMERGENCY', 'WAITING'] } 
    });
    
    if (activePatients.length === 0) {
      return res.status(404).json({ error: 'No patients waiting for treatment' });
    }
    
    // Sort to find highest priority
    const sortedPatients = sortPatientsByPriority(activePatients);
    const patient = sortedPatients[0]; // Highest priority patient
    
    patient.status = 'TREATED';
    patient.treatedTime = new Date();
    await patient.save();
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Treat specific patient by ID
app.put('/api/patients/:id/treat', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    patient.status = 'TREATED';
    patient.treatedTime = new Date();
    await patient.save();
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Update severity
app.put('/api/patients/:id', async (req, res) => {
  try {
    const { severity } = req.body;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    patient.severity = parseInt(severity);
    await patient.save();
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Get waiting list only (non-emergency)
app.get('/api/waiting', async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'WAITING' })
      .sort({ severity: -1, arrivalTime: 1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Get emergency list only
app.get('/api/emergency', async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'EMERGENCY' })
      .sort({ arrivalTime: 1 }); // Oldest emergency first
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Search patients
app.get('/api/search', async (req, res) => {
  try {
    const { name } = req.query;
    const patients = await Patient.find({
      name: { $regex: name, $options: 'i' }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Get next patient to treat
app.get('/api/next', async (req, res) => {
  try {
    const activePatients = await Patient.find({ 
      status: { $in: ['EMERGENCY', 'WAITING'] } 
    });
    
    if (activePatients.length === 0) {
      return res.json({});
    }
    
    const sortedPatients = sortPatientsByPriority(activePatients);
    res.json(sortedPatients[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const waiting = await Patient.countDocuments({ status: 'WAITING' });
    const emergency = await Patient.countDocuments({ status: 'EMERGENCY' });
    const treated = await Patient.countDocuments({ status: 'TREATED' });
    
    const avgSeverity = await Patient.aggregate([
      { $match: { status: { $in: ['WAITING', 'EMERGENCY'] } } },
      { $group: { _id: null, average: { $avg: '$severity' } } }
    ]);
    
    res.json({
      total,
      waiting,
      emergency,
      treated,
      active: waiting + emergency,
      averageSeverity: avgSeverity[0]?.average || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize data on startup
initializeData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 MongoDB Connected: ${mongoose.connection.readyState === 1 ? 'Yes' : 'No'}`);
  console.log(`🌐 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/api/test`);
  console.log(`   http://localhost:${PORT}/api/patients/active  (Active queue - EMERGENCY FIRST)`);
  console.log(`   http://localhost:${PORT}/api/patients/treated (Treated patients)`);
  console.log(`   http://localhost:${PORT}/api/stats`);
});