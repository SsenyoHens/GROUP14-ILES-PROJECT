import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // login logic will go here
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({
            ...credentials,
            username: e.target.value
          })}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({
            ...credentials,
            password: e.target.value
          })}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login