import { createContext, useState, useCallback, useEffect } from 'react'
import client from '../services/api' // Import the axios client you created

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true) // Start true to check existing token

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Optional: Create a /me endpoint to verify token and get user data
          const response = await client.get('/auth/me')
          setUser(response.data.user)
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      // Perform actual API call to your Laravel/Node backend
      const response = await client.post('/auth/login', { email, password })
      
      const { user, token } = response.data
      
      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('token', token)
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}