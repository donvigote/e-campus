import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import axios from 'axios'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading, true/false = auth state
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/profile/', {
        withCredentials: true
      })
      
      if (response.data && response.data.id) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.log('Usuario no autenticado')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            } 
          />
          {/* Ruta para manejar errores de autenticación */}
          <Route 
            path="/auth-error" 
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <h2 className="text-2xl font-bold text-red-600">Error de Autenticación</h2>
                  <p className="text-gray-600">
                    Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Volver al inicio
                  </button>
                </div>
              </div>
            } 
          />
          {/* Ruta catch-all para páginas no encontradas */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
