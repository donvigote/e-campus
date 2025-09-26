import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  Search, 
  X, 
  Users, 
  BookOpen, 
  Calendar,
  GraduationCap
} from 'lucide-react'

const Filters = ({ onFiltersChange, courses = [], teachers = [] }) => {
  const [filters, setFilters] = useState({
    cohort: '',
    course: '',
    teacher: '',
    status: '',
    search: ''
  })

  const [activeFilters, setActiveFilters] = useState([])

  useEffect(() => {
    // Actualizar filtros activos
    const active = []
    if (filters.cohort) active.push({ key: 'cohort', label: 'Cohorte', value: filters.cohort })
    if (filters.course) active.push({ key: 'course', label: 'Curso', value: filters.course })
    if (filters.teacher) active.push({ key: 'teacher', label: 'Profesor', value: filters.teacher })
    if (filters.status) active.push({ key: 'status', label: 'Estado', value: filters.status })
    if (filters.search) active.push({ key: 'search', label: 'Búsqueda', value: filters.search })
    
    setActiveFilters(active)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const removeFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: ''
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      cohort: '',
      course: '',
      teacher: '',
      status: '',
      search: ''
    })
  }

  const statusOptions = [
    { value: 'completed', label: 'Completado', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'late', label: 'Tardío', color: 'bg-red-100 text-red-800' },
    { value: 'in_progress', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' }
  ]

  const cohortOptions = [
    'Cohorte 2024-1',
    'Cohorte 2024-2',
    'Cohorte 2023-2',
    'Cohorte 2023-1'
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters.length} activo{activeFilters.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Buscar estudiante
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Nombre o email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Cohorte */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <GraduationCap className="w-4 h-4" />
              <span>Cohorte</span>
            </Label>
            <Select value={filters.cohort} onValueChange={(value) => handleFilterChange('cohort', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cohorte" />
              </SelectTrigger>
              <SelectContent>
                {cohortOptions.map((cohort) => (
                  <SelectItem key={cohort} value={cohort}>
                    {cohort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>Curso</span>
            </Label>
            <Select value={filters.course} onValueChange={(value) => handleFilterChange('course', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profesor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Profesor</span>
            </Label>
            <Select value={filters.teacher} onValueChange={(value) => handleFilterChange('teacher', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.google_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado de entregas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Estado de entregas</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleFilterChange('status', filters.status === status.value ? '' : status.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.status === status.value
                    ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros activos */}
        {activeFilters.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filtros activos</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar todo
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="flex items-center space-x-1 pr-1"
                  >
                    <span className="text-xs">
                      <strong>{filter.label}:</strong> {filter.value}
                    </span>
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default Filters
