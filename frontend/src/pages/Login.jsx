import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { NotificationContext } from '../context/NotificationContext'
import { Card } from '../components/atoms'
import { LoginForm } from '../components/molecules'

export default function Login() {
  const { login, loading } = useContext(AuthContext)
  const { addNotification } = useContext(NotificationContext)
  const navigate = useNavigate()

  const handleLogin = async (credentials) => {
    const result = await login(credentials.email, credentials.password)
    if (result.success) {
      addNotification('Login successful!', 'success')
      navigate('/')
    } else {
      addNotification(result.error || 'Login failed', 'danger')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">RMS</h1>
          <p className="text-gray-600 mb-8">Restaurant Management System</p>
          <LoginForm onSubmit={handleLogin} isLoading={loading} />
        </div>
      </Card>
    </div>
  )
}
