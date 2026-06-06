import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import NewPost from './pages/NewPost'
import Login from './pages/Login'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:slug" element={<PostDetail />} />
              <Route path="/new" element={<NewPost />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}