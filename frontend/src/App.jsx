import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2,
  Stethoscope,
  Search,
  Users,
  CheckCircle,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
  UserCheck,
  History,
  BarChart3
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [activePatients, setActivePatients] = useState([])
  const [treatedPatients, setTreatedPatients] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [newPatient, setNewPatient] = useState({ name: '', severity: 3 })
  const [emergencyName, setEmergencyName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('active') // 'active', 'treated', 'all'
  const [nextPatient, setNextPatient] = useState(null)
  const [viewMode, setViewMode] = useState('queue') // 'queue', 'emergency', 'waiting'

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [activeRes, treatedRes, statsRes, nextRes] = await Promise.all([
        fetch(`${API_URL}/patients/active`),
        fetch(`${API_URL}/patients/treated`),
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/next`)
      ])
      
      const activeData = await activeRes.json()
      const treatedData = await treatedRes.json()
      const statsData = await statsRes.json()
      const nextData = await nextRes.json()
      
      setActivePatients(activeData)
      setTreatedPatients(treatedData)
      setStats(statsData)
      setNextPatient(nextData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to connect to server. Make sure backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const addPatient = async () => {
    if (!newPatient.name.trim()) {
      alert('Please enter patient name')
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient)
      })
      
      if (response.ok) {
        alert('Patient added to waiting queue!')
        setNewPatient({ name: '', severity: 3 })
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding patient:', error)
      alert('Failed to add patient')
    }
  }

  const addEmergency = async () => {
    if (!emergencyName.trim()) {
      alert('Please enter emergency patient name')
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: emergencyName })
      })
      
      if (response.ok) {
        alert('🚨 EMERGENCY patient added! They are now at TOP of the queue.')
        setEmergencyName('')
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding emergency:', error)
      alert('Failed to add emergency patient')
    }
  }

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Patient deleted successfully')
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('Failed to delete patient')
    }
  }

  const treatPatient = async (id) => {
    try {
      const response = await fetch(`${API_URL}/patients/${id}/treat`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`✅ Patient treated: ${data.name}\nTreatment time: ${new Date(data.treatedTime).toLocaleTimeString()}`)
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error treating patient:', error)
      alert('Failed to treat patient')
    }
  }

  const treatNextPatient = async () => {
    try {
      const response = await fetch(`${API_URL}/treat`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`✅ Treated: ${data.name} (${data.status === 'EMERGENCY' ? 'EMERGENCY' : 'Severity: ' + data.severity})\nTreatment time: ${new Date(data.treatedTime).toLocaleTimeString()}`)
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error treating next patient:', error)
      alert('Failed to treat patient')
    }
  }

  const updateSeverity = async (id, currentSeverity) => {
    const newSeverity = prompt('Enter new severity level (1-10):', currentSeverity)
    if (!newSeverity || isNaN(newSeverity) || newSeverity < 1 || newSeverity > 10) {
      alert('Please enter a valid severity between 1 and 10')
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ severity: parseInt(newSeverity) })
      })
      
      if (response.ok) {
        alert('Severity updated successfully!')
        fetchAllData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating severity:', error)
      alert('Failed to update severity')
    }
  }

  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      fetchAllData()
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      // Separate active and treated from search results
      const active = data.filter(p => p.status !== 'TREATED')
      const treated = data.filter(p => p.status === 'TREATED')
      setActivePatients(active)
      setTreatedPatients(treated)
    } catch (error) {
      console.error('Error searching:', error)
      alert('Search failed')
    }
  }

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (severity >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'EMERGENCY': return 'bg-red-500 text-white border-red-600'
      case 'WAITING': return 'bg-yellow-500 text-white border-yellow-600'
      case 'TREATED': return 'bg-green-500 text-white border-green-600'
      default: return 'bg-gray-500 text-white border-gray-600'
    }
  }

  const getSeverityBarColor = (severity) => {
    if (severity >= 8) return 'bg-red-600'
    if (severity >= 5) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600 text-lg">Loading Hospital ER System...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to database and loading patient data</p>
        </div>
      </div>
    )
  }

  const currentPatients = activeTab === 'active' ? activePatients : 
                         activeTab === 'treated' ? treatedPatients : 
                         [...activePatients, ...treatedPatients]

  const filteredPatients = viewMode === 'emergency' ? 
    currentPatients.filter(p => p.status === 'EMERGENCY') :
    viewMode === 'waiting' ? 
    currentPatients.filter(p => p.status === 'WAITING') :
    currentPatients

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-500 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                Hospital Emergency Room Management
              </h1>
              <p className="text-gray-900 mt-1">Priority-based patient queue with emergency handling</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-800">
                    {stats.active || 0} Active • {stats.treated || 0} Treated
                  </span>
                </div>
              </div>
              <button
                onClick={fetchAllData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Patients</p>
                <p className="text-2xl font-bold">{stats.active || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.waiting || 0} waiting • {stats.emergency || 0} emergency
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.waiting || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Regular patients
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{stats.emergency || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Top priority
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Treated</p>
                <p className="text-2xl font-bold text-green-600">{stats.treated || 0}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Completed today
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Severity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageSeverity ? stats.averageSeverity.toFixed(1) : '0.0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Active patients
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Next Patient Card */}
            {nextPatient && nextPatient._id && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Next to Treat
                </h2>
                <div className="bg-white rounded-lg p-4 shadow-inner border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">{nextPatient.name}</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(nextPatient.status)}`}>
                          {nextPatient.status}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(nextPatient.severity)}`}>
                          Severity: {nextPatient.severity}/10
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Arrived</p>
                      <p className="text-sm font-medium">{formatTime(nextPatient.arrivalTime)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => treatPatient(nextPatient._id)}
                    className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center justify-center font-bold text-lg shadow-md"
                  >
                    <Stethoscope className="w-5 h-5 mr-2" />
                    TREAT THIS PATIENT
                  </button>
                </div>
              </div>
            )}

            {/* Add Regular Patient */}
            <div className="bg-white rounded-xl shadow p-6 border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Regular Patient
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity Level (1-10)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newPatient.severity}
                      onChange={(e) => setNewPatient({...newPatient, severity: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className={`px-3 py-1 rounded-full ${getSeverityColor(newPatient.severity)} font-bold min-w-11.25 text-center border`}>
                      {newPatient.severity}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className={`${newPatient.severity <= 4 ? 'font-bold text-green-700' : ''}`}>Low (1-4)</span>
                    <span className={`${newPatient.severity >= 5 && newPatient.severity <= 7 ? 'font-bold text-yellow-700' : ''}`}>Medium (5-7)</span>
                    <span className={`${newPatient.severity >= 8 ? 'font-bold text-red-700' : ''}`}>High (8-10)</span>
                  </div>
                </div>
                <button
                  onClick={addPatient}
                  className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center font-medium shadow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Waiting Queue
                </button>
              </div>
            </div>

            {/* Emergency Admission */}
            <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-xl shadow p-6 border border-red-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                🚨 Emergency Admission
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Emergency Patient Name
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    placeholder="Critical patient name"
                  />
                </div>
                <button
                  onClick={addEmergency}
                  className="w-full bg-linear-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 flex items-center justify-center font-bold shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  ADD EMERGENCY PATIENT
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6 border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={treatNextPatient}
                  className="w-full bg-linear-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-700 flex items-center justify-center font-medium"
                  disabled={!nextPatient || !nextPatient._id}
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Auto-Treat Next Patient
                </button>
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search patients by name..."
                    />
                    <button
                      onClick={searchPatients}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Go
                    </button>
                  </div>
                  <button
                    onClick={() => { setSearchTerm(''); fetchAllData(); }}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 border border-gray-300"
                  >
                    Clear Search & Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Patient Queues */}
          <div className="lg:col-span-2">
            {/* Queue Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-3 rounded-lg font-medium ${activeTab === 'active' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border'}`}
                >
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Active Queue ({activePatients.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('treated')}
                  className={`px-4 py-3 rounded-lg font-medium ${activeTab === 'treated' ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-700 border'}`}
                >
                  <span className="flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    Treated ({treatedPatients.length})
                  </span>
                </button>
              </div>
              
              {activeTab === 'active' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('queue')}
                    className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'queue' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-white text-gray-700 border'}`}
                  >
                    All Active
                  </button>
                  <button
                    onClick={() => setViewMode('emergency')}
                    className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'emergency' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-white text-gray-700 border'}`}
                  >
                    Emergency Only
                  </button>
                  <button
                    onClick={() => setViewMode('waiting')}
                    className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'waiting' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-white text-gray-700 border'}`}
                  >
                    Waiting Only
                  </button>
                </div>
              )}
            </div>

            {/* Patient Queue */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
              <div className="px-6 py-4 border-b bg-linear-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {activeTab === 'active' ? 'Active Patient Queue' : 
                       activeTab === 'treated' ? 'Treated Patients History' : 
                       'All Patients'}
                    </h2>
                    <p className="text-gray-600">
                      {activeTab === 'active' ? 
                       (viewMode === 'emergency' ? '🚨 Emergency patients (highest priority)' :
                        viewMode === 'waiting' ? '⏳ Regular waiting patients' :
                        'All active patients sorted by priority') :
                       'Patients treated today'}
                    </p>
                  </div>
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            {activeTab === 'active' ? 
                             (viewMode === 'emergency' ? 'No emergency patients' :
                              viewMode === 'waiting' ? 'No waiting patients' :
                              'No active patients') :
                             'No treated patients yet'}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {activeTab === 'active' ? 'Add patients to see them here' : 
                             'Treat patients to see them here'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient._id} className={`hover:bg-gray-50 ${patient.status === 'EMERGENCY' ? 'bg-red-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getSeverityColor(patient.severity)} border-2 mr-4`}>
                                <span className="font-bold text-lg">{patient.severity}</span>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 flex items-center">
                                  {patient.name}
                                  {patient.status === 'EMERGENCY' && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                      ⚠️ EMERGENCY
                                    </span>
                                  )}
                                  {patient.status === 'TREATED' && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                                      ✅ TREATED
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {patient._id.substring(0, 8)}...
                                  {patient.status === 'TREATED' && patient.treatedTime && (
                                    <div className="text-green-600 font-medium">
                                      Treated: {formatTime(patient.treatedTime)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-28 bg-gray-200 rounded-full h-2.5 mr-3">
                                <div 
                                  className={`h-2.5 rounded-full ${getSeverityBarColor(patient.severity)}`}
                                  style={{ width: `${patient.severity * 10}%` }}
                                ></div>
                              </div>
                              <div className="text-right">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold ${getSeverityColor(patient.severity)} border`}>
                                  {patient.severity}/10
                                </span>
                              </div>
                            </div>
                            {patient.status !== 'TREATED' && (
                              <button
                                onClick={() => updateSeverity(patient._id, patient.severity)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 hover:underline"
                              >
                                Change severity
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium">Arrived:</div>
                              <div className="text-gray-600">{formatDateTime(patient.arrivalTime)}</div>
                            </div>
                            {patient.status === 'TREATED' && patient.treatedTime && (
                              <div className="text-sm mt-2">
                                <div className="font-medium text-green-700">Treated:</div>
                                <div className="text-green-600">{formatDateTime(patient.treatedTime)}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {patient.status === 'WAITING' && (
                                <>
                                  <button
                                    onClick={() => treatPatient(patient._id)}
                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm flex items-center font-medium border border-green-300"
                                    title="Treat this patient"
                                  >
                                    <Stethoscope className="w-3.5 h-3.5 mr-1" />
                                    Treat
                                  </button>
                                  <button
                                    onClick={() => deletePatient(patient._id)}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-sm flex items-center border border-red-300"
                                    title="Delete this patient"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Delete
                                  </button>
                                </>
                              )}
                              {patient.status === 'EMERGENCY' && (
                                <button
                                  onClick={() => treatPatient(patient._id)}
                                  className="bg-linear-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 px-4 py-1.5 rounded-lg text-sm flex items-center font-bold border border-red-600 shadow"
                                  title="Treat emergency patient immediately"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                  TREAT NOW
                                </button>
                              )}
                              {patient.status === 'TREATED' && (
                                <div className="text-green-600 text-sm flex items-center">
                                  <CheckCircle className="w-5 h-5 mr-1" />
                                  <span className="font-medium">Completed</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Footer */}
              <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-t">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">
                    Showing {filteredPatients.length} {activeTab === 'active' ? 'active' : 'treated'} patients
                  </span>
                  <span>
                    {activeTab === 'active' && (
                      <>
                        {activePatients.filter(p => p.status === 'EMERGENCY').length} emergency • 
                        {activePatients.filter(p => p.status === 'WAITING').length} waiting
                      </>
                    )}
                    {activeTab === 'treated' && (
                      <>Sorted by most recently treated</>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Queue Priority Explanation */}
            <div className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl shadow p-5 border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3">📋 Queue Priority Rules:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="font-bold text-red-700">EMERGENCY</span>
                  </div>
                  <p className="text-sm text-gray-600">Always at top, treated first</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="font-bold text-yellow-700">WAITING</span>
                  </div>
                  <p className="text-sm text-gray-600">Sorted by severity (high to low)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-bold text-green-700">TREATED</span>
                  </div>
                  <p className="text-sm text-gray-600">Moved to history after treatment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-500 border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-900 text-sm">
            Hospital ER System v2.0 • Priority Queue with Emergency Handling • 
            Real-time Management • MongoDB + Node.js + React • 
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App