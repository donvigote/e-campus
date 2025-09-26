import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  GraduationCap,
  TrendingUp,
  Calendar,
  Download,
  Settings
} from 'lucide-react'
import axios from 'axios'
import Filters from './Filters'
import Charts from './Charts'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [studentProgress, setStudentProgress] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [filteredProgress, setFilteredProgress] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState(null)
  const [currentFilters, setCurrentFilters] = useState({})

  useEffect(() => {
    loadUserProfile()
    loadDashboardData()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/profile/', {
        withCredentials: true
      })
      setUser(response.data)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      setError('No se pudo cargar la información del usuario')
    }
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar estadísticas
      const statsResponse = await axios.get('http://localhost:8000/api/dashboard/stats/', {
        withCredentials: true
      })
      setStats(statsResponse.data)

      // Cargar progreso de estudiantes
      const progressResponse = await axios.get('http://localhost:8000/api/students/progress/', {
        withCredentials: true
      })
      setStudentProgress(progressResponse.data)
      setFilteredProgress(progressResponse.data)

      // Cargar cursos
      const coursesResponse = await axios.get('http://localhost:8000/api/courses/', {
        withCredentials: true
      })
      setCourses(coursesResponse.data)

      // Simular datos de profesores (en una implementación real vendría de la API)
      setTeachers([
        { id: 1, google_name: 'Prof. María García' },
        { id: 2, google_name: 'Prof. Juan Pérez' },
        { id: 3, google_name: 'Prof. Ana López' }
      ])
      
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError('No se pudieron cargar los datos del dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setError('')
    
    try {
      const response = await axios.post('http://localhost:8000/api/sync/classroom/', {}, {
        withCredentials: true
      })
      
      setLastSync(new Date())
      await loadDashboardData() // Recargar datos después de sincronizar
      
    } catch (error) {
      console.error('Error sincronizando:', error)
      setError('Error al sincronizar con Google Classroom')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters)
    
    // Aplicar filtros al progreso de estudiantes
    let filtered = [...studentProgress]
    
    if (filters.search) {
      filtered = filtered.filter(student => 
        student.student_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.student_email.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    
    if (filters.course) {
      filtered = filtered.filter(student => student.course_id === parseInt(filters.course))
    }
    
    if (filters.status) {
      filtered = filtered.filter(student => {
        switch (filters.status) {
          case 'completed':
            return student.completion_percentage === 100
          case 'pending':
            return student.completion_percentage === 0
          case 'late':
            return student.late_assignments > 0
          case 'in_progress':
            return student.completion_percentage > 0 && student.completion_percentage < 100
          default:
            return true
        }
      })
    }
    
    setFilteredProgress(filtered)
  }, [studentProgress])

  const exportData = () => {
    // Simular exportación de datos
    const dataStr = JSON.stringify(filteredProgress, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `e-campus-reporte-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">e-campus</h1>
              <p className="text-sm text-gray-600">Dashboard Académico</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {user.google_picture && (
                  <img 
                    src={user.google_picture} 
                    alt={user.google_name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.google_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={exportData}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button 
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              size="sm"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_courses}</div>
                <p className="text-xs text-muted-foreground">Cursos activos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_students}</div>
                <p className="text-xs text-muted-foreground">Estudiantes registrados</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tareas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_assignments}</div>
                <p className="text-xs text-muted-foreground">Tareas asignadas</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                <p className="text-xs text-muted-foreground">Entregas completadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Filters 
          onFiltersChange={handleFiltersChange}
          courses={courses}
          teachers={teachers}
        />

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Gráficos */}
            <Charts stats={stats} studentProgress={filteredProgress} />

            {/* Estadísticas de entregas */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Estado de Entregas</span>
                  </CardTitle>
                  <CardDescription>
                    Resumen del estado actual de todas las entregas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">{stats.submissions_on_time}</p>
                        <p className="text-sm text-green-600">Entregas a tiempo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-700">{stats.submissions_late}</p>
                        <p className="text-sm text-yellow-600">Entregas tardías</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Clock className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{stats.submissions_pending}</p>
                        <p className="text-sm text-red-600">Entregas pendientes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Lista de estudiantes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Progreso de Estudiantes</span>
                    </CardTitle>
                    <CardDescription>
                      Estado detallado del progreso académico por estudiante
                      {Object.keys(currentFilters).some(key => currentFilters[key]) && (
                        <span className="ml-2">
                          ({filteredProgress.length} de {studentProgress.length} estudiantes)
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {filteredProgress.length} estudiantes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProgress.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProgress.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.student_name}</p>
                              <p className="text-sm text-gray-500">{student.course_name}</p>
                              <p className="text-xs text-gray-400">{student.student_email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {student.completed_assignments}/{student.total_assignments} tareas
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.late_assignments} tardías
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  student.completion_percentage >= 80 ? 'bg-green-500' :
                                  student.completion_percentage >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${student.completion_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-12">
                              {student.completion_percentage}%
                            </span>
                          </div>
                          
                          {student.average_grade && (
                            <Badge variant="outline" className="min-w-[60px] justify-center">
                              {student.average_grade.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay estudiantes que coincidan con los filtros</p>
                    <p className="text-sm">Ajusta los filtros para ver más resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Charts stats={stats} studentProgress={filteredProgress} />
          </TabsContent>
        </Tabs>

        {/* Información de sincronización */}
        {lastSync && (
          <div className="text-center text-sm text-gray-500">
            Última sincronización: {lastSync.toLocaleString()}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
