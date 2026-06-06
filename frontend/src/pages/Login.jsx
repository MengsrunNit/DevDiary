import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })

  const mutation = useMutation({
    mutationFn: () => {
      const data = new FormData()
      data.append('username', form.username)
      data.append('password', form.password)
      return api.post('/auth/login', data).then(r => r.data)
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      navigate('/')
    },
  })

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
      <p className="text-gray-400 text-sm mb-8">Sign in to your devlog</p>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && mutation.mutate()}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        {mutation.isError && (
          <p className="text-red-400 text-sm text-center">Incorrect username or password</p>
        )}
      </div>
    </div>
  )
}
