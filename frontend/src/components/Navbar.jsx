import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="border-b border-white/10 bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-white tracking-tight">
          Mengsrun <span className="text-sky-400">Devlog</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {token ? (
            <>
              <Link to="/new" className="text-sky-400 hover:text-sky-300 font-medium">
                + New post
              </Link>
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
