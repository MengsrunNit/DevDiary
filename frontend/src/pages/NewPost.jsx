import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function NewPost() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', content: '', tags: '' })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/posts', data).then(r => r.data),
    onSuccess: (post) => {
      queryClient.invalidateQueries(['posts'])
      navigate(`/posts/${post.slug}`)
    },
  })

  const handleSubmit = (published) => {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    mutation.mutate({ ...form, tags, published })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">New diary entry</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title — e.g. What is Docker Compose?"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
        <input
          type="text"
          placeholder="Tags — e.g. docker, devops, today-i-learned"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
        <textarea
          placeholder={`Write in Markdown...\n\n## What I learned\n\nToday I finally understood...\n\n\`\`\`yaml\nservices:\n  web:\n    image: nginx\n\`\`\``}
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          rows={20}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => handleSubmit(false)}
            disabled={mutation.isPending || !form.title || !form.content}
            className="px-4 py-2 text-sm border border-white/10 rounded-lg text-gray-300 hover:border-sky-500 hover:text-sky-400 transition-colors disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={mutation.isPending || !form.title || !form.content}
            className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            Publish
          </button>
        </div>
        {mutation.isError && (
          <p className="text-red-400 text-sm">Failed to save. Are you logged in?</p>
        )}
      </div>
    </div>
  )
}
