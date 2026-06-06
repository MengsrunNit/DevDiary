import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/api'

export default function Home() {
  const [selectedTag, setSelectedTag] = useState(null)
  const [search, setSearch] = useState('')

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', selectedTag, search],
    queryFn: () =>
      api.get('/posts', { params: { tag: selectedTag, search: search || undefined } })
        .then(r => r.data),
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then(r => r.data),
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dev diary</h1>
        <p className="text-gray-400 text-sm">Things I learn, problems I solve, ideas I explore.</p>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 mb-6 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              !selectedTag
                ? 'bg-sky-500 text-white border-sky-500'
                : 'border-white/10 text-gray-400 hover:border-sky-500 hover:text-sky-400'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                selectedTag === tag.name
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'border-white/10 text-gray-400 hover:border-sky-500 hover:text-sky-400'
              }`}
            >
              #{tag.name} <span className="opacity-50">{tag.count}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No posts yet. Write your first diary entry!</p>
      ) : (
        <div className="divide-y divide-white/5">
          {posts.map(post => (
            <div key={post.id} className="py-6">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                {post.tags.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTag(t.name)}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
              <Link to={`/posts/${post.slug}`} className="block group">
                <h2 className="text-base font-medium text-white group-hover:text-sky-400 transition-colors mb-1">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
