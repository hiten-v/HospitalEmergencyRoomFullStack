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
  CheckCircle
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function App() {
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({ total: 0, waiting: 0, treated: 0 })
  const [form, setForm] = useState({ name: '', severity: 5 })
  const [view, setView] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [view])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/patients`).then(res => res.json()),
        fetch(`${API_URL}/stats`).then(res => res.json())
      ])
      setPatients(patientsRes)
      setStats(statsRes)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (isEmergency = false) => {
    if (!form.name.trim()) {
      alert('Please enter patient name')
      return
    }

    try {
      const url = isEmergency ? `${API_URL}/emergency` : `${API_URL}/patients`
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          severity: isEmergency ? 10 : parseInt(form.severity)
        })
      })
      setForm({ name: '', severity: 5 })
      fetchData()
    } catch (error) {
      alert('Error adding patient. Make sure backend is running.')
    }
  }

  const handleTreat = async (id) => {
    if (!window.confirm('Mark this patient as treated?')) return;
    
    try {
        await fetch(`${API_URL}/patients/${id}/treat`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        fetchData();
    } catch (error) {
        console.error('Error treating patient:', error);
    }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return
    try {
      await fetch(`${API_URL}/patients/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  const getSeverityColor = (severity) => {
    if (severity >= 9) return 'bg-red-500 text-white'
    if (severity >= 7) return 'bg-orange-500 text-white'
    if (severity >= 5) return 'bg-yellow-500 text-white'
    return 'bg-green-500 text-white'
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-500 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hospital ER System</h1>
                <p className="text-white">Emergency Room Management Dashboard</p>
              </div>
            </div>
            <div className="text-sm text-white">
              MongoDB + Spring Boot + React
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/80 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.waiting}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/80 rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Treated</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.treated}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Add Patient Section */}
        <div className="bg-white/80 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Admit New Patient</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 border text-black border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level: <span className="font-bold">{form.severity}/10</span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.severity}
                    onChange={(e) => setForm({...form, severity: e.target.value})}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className={`px-3 py-1 rounded-full ${getSeverityColor(form.severity)}`}>
                    {form.severity}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleAdd(false)}
                className="flex-1 bg-blue-300 hover:bg-blue-500 text-slate-900 font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Patient</span>
              </button>
              
              <button
                onClick={() => handleAdd(true)}
                className="flex-1 bg-red-300 hover:bg-red-500 text-slate-900 font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <AlertCircle className="h-5 w-5" />
                <span>Emergency Admission</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'all', label: 'All Patients', icon: Users },
            { id: 'waiting', label: 'Waiting', icon: Clock },
            { id: 'severity', label: 'By Severity', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  view === tab.id
                    ? 'bg-blue-100/70 text-blue-700 border border-blue-300'
                    : 'bg-gray-100/70 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Patients Table */}
        <div className="bg-white/80 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Patients List</h2>
            <div className="text-sm text-gray-600">
              Showing {patients.length} patients
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600">No patients found</p>
              <p className="text-sm text-gray-500">Add your first patient above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients
                    .filter(patient => view === 'all' || 
                           (view === 'waiting' && patient.status === 'WAITING') ||
                           (view === 'severity' && patient.status === 'WAITING'))
                    .sort((a, b) => view === 'severity' ? b.severity - a.severity : 0)
                    .map((patient) => (
                      <tr key={patient.id} className="bg-white/80 hover:bg-gray-200 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {patient.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {patient.id.substring(0, 8)}...
                              </div>
                            </div>
                            {patient.emergency && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-semibold">
                                EMERGENCY
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`px-3 py-1 rounded-full ${getSeverityColor(patient.severity)}`}>
                              {patient.severity}/10
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            patient.status === 'WAITING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(patient.arrivalTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-3">
                            {patient.status === 'WAITING' && (
                              <button
                                onClick={() => handleTreat(patient.id)}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <Stethoscope className="h-4 w-4 mr-1" />
                                Treat
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(patient.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>Hospital Emergency Room Management System</p>
            <p className="mt-2">Built with Spring Boot, MongoDB, and Vite React</p>
            <p className="mt-1">API Endpoint: {API_URL}</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App