import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import api from '../lib/api'

export default function PostDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = localStorage.getItem('token')

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.get(`/posts/${slug}`).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/posts/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
      navigate('/')
    },
  })

  if (isLoading) return <p className="text-gray-500 text-sm">Loading...</p>
  if (!post) return <p className="text-gray-500 text-sm">Post not found.</p>

  return (
    <article>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
          {post.tags.map(t => (
            <span key={t.name} className="text-sky-400">#{t.name}</span>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
        {token && (
          <div className="flex gap-3 mb-6">
            <button onClick={() => navigate(`/new?edit=${slug}`)} className="text-xs text-gray-500 hover:text-sky-400 transition-colors">
              Edit
            </button>
            <button
              onClick={() => { if (window.confirm('Delete this post?')) deleteMutation.mutate() }}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-sky-400 prose-strong:text-white prose-code:text-sky-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-sky-300" {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
