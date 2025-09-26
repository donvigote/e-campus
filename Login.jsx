import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, GraduationCap, Users, BarChart3, BookOpen } from 'lucide-react'
import axios from 'axios'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await axios.get('http://localhost:8000/api/auth/google/login/')
      const { authorization_url } = response.data
      
      // Redirigir al usuario a la página de login de Google
      window.location.href = authorization_url
    } catch (error) {
      console.error("Error al intentar iniciar sesión con Google:", error)
      setError("No se pudo conectar con el servidor. Verifica que el backend esté funcionando.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Panel izquierdo - Información */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">e-campus</h1>
                <p className="text-gray-600">Dashboard Académico Inteligente</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Centraliza y visualiza toda la información de Google Classroom en un dashboard 
              intuitivo diseñado especialmente para Semillero Digital.
            </p>
          </div>

          {/* Características */}
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestión de Estudiantes</h3>
                <p className="text-gray-600 text-sm">Visualiza el progreso de todos los estudiantes en tiempo real</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reportes Avanzados</h3>
                <p className="text-gray-600 text-sm">Estadísticas detalladas de entregas y rendimiento académico</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Integración Completa</h3>
                <p className="text-gray-600 text-sm">Sincronización automática con Google Classroom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Login */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Bienvenido
              </CardTitle>
              <CardDescription className="text-gray-600">
                Inicia sesión con tu cuenta de Google para acceder al dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar Sesión con Google
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
