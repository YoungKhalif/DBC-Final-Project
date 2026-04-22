import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/molecules/LoginForm'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleLogin = async (credentials) => {
    setApiError('')
    setLoading(true)
    
    const result = await login(credentials.email, credentials.password)
    
    if (result.success) {
      navigate('/dashboard') // Or wherever your protected route is
    } else {
      setApiError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {apiError && <p className="text-red-500 mb-4">{apiError}</p>}
      <LoginForm onSubmit={handleLogin} isLoading={loading} />
    </div>
  )
}