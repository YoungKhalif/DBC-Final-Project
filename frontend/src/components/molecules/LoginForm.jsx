import { useState } from 'react'
import { Button, Input } from '../atoms'

export default function LoginForm({ onSubmit, isLoading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ email, password })
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setErrors({ ...errors, email: '' })
        }}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setErrors({ ...errors, password: '' })
        }}
        error={errors.password}
        required
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
