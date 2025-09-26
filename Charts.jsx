import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'

const Charts = ({ stats, studentProgress = [], courseProgress = [] }) => {
  // Datos para el gráfico de barras de entregas
  const submissionData = [
    {
      name: 'A tiempo',
      value: stats?.submissions_on_time || 0,
      color: '#10b981'
    },
    {
      name: 'Tardías',
      value: stats?.submissions_late || 0,
      color: '#f59e0b'
    },
    {
      name: 'Pendientes',
      value: stats?.submissions_pending || 0,
      color: '#ef4444'
    }
  ]

  // Datos para el gráfico circular de completitud
  const completionData = [
    {
      name: 'Completado',
      value: (stats?.submissions_on_time || 0) + (stats?.submissions_late || 0),
      color: '#3b82f6'
    },
    {
      name: 'Pendiente',
      value: stats?.submissions_pending || 0,
      color: '#e5e7eb'
    }
  ]

  // Datos de progreso por curso (simulados si no hay datos reales)
  const courseChartData = courseProgress.length > 0 ? courseProgress : [
    { name: 'Fundamentos Web', completion: 85, students: 24 },
    { name: 'JavaScript Avanzado', completion: 72, students: 22 },
    { name: 'React & APIs', completion: 68, students: 20 },
    { name: 'Backend con Node', completion: 45, students: 18 },
    { name: 'Bases de Datos', completion: 38, students: 16 }
  ]

  // Datos de tendencia semanal (simulados)
  const weeklyTrendData = [
    { week: 'Sem 1', submissions: 45, completion: 78 },
    { week: 'Sem 2', submissions: 52, completion: 82 },
    { week: 'Sem 3', submissions: 48, completion: 75 },
    { week: 'Sem 4', submissions: 61, completion: 88 },
    { week: 'Sem 5', submissions: 58, completion: 85 },
    { week: 'Sem 6', submissions: 65, completion: 92 }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de barras - Estado de entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Estado de Entregas</span>
          </CardTitle>
          <CardDescription>
            Distribución del estado actual de todas las entregas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {submissionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center space-x-4 mt-4">
            {submissionData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico circular - Tasa de completitud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5" />
            <span>Tasa de Completitud</span>
          </CardTitle>
          <CardDescription>
            Porcentaje general de tareas completadas vs pendientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.completion_rate || 0}%
            </div>
            <div className="text-sm text-gray-600">Tasa de completitud</div>
            
            <div className="flex justify-center space-x-4 mt-3">
              {completionData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de progreso por curso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Progreso por Curso</span>
          </CardTitle>
          <CardDescription>
            Porcentaje de completitud promedio por curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completion" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {courseChartData.slice(0, 3).map((course, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{course.name}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{course.students} estudiantes</Badge>
                  <span className="font-medium">{course.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de tendencia semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Tendencia Semanal</span>
          </CardTitle>
          <CardDescription>
            Evolución de entregas y completitud en las últimas semanas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="completion" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="% Completitud"
              />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Entregas"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Tendencia positiva</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Completitud</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Entregas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Charts
