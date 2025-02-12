'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Home, List, Trash, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

export default function NoteEditJsx() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('active')
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      console.log('Fetching note with id:', id)
      fetchNote()
    }
  }, [id])

  const fetchNote = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/note-edit/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch note')
      }
      const data = await response.json()
      console.log('Frontend: Fetched note data', data)
      setTitle(data.title)
      setContent(data.content)
      setStatus(data.status)
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching note:', error)
      setError('Error loading the patch note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/note-edit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          status,
        }),
      })

      if (response.ok) {
        router.push('/note-list')
      } else {
        const data = await response.json()
        setError(data.message || 'Error updating the patch note')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`/api/note-edit/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          router.push('/note-list')
        } else {
          const data = await response.json()
          setError(data.message || 'Error deleting the patch note')
        }
      } catch (error) {
        setError('An error occurred while deleting the note.')
      }
    }
  }

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await fetch(`/api/comments/${id}/${commentId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setComments(comments.filter(comment => comment._id !== commentId))
        } else {
          const data = await response.json()
          setError(data.message || 'Error deleting the comment')
        }
      } catch (error) {
        setError('An error occurred while deleting the comment.')
      }
    }
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home-admin">
            <img src="/logo.png" alt="SpecsGaming Logo" className="h-8 w-auto" />
          </Link>
          <div className="flex space-x-4">
            <Link href="/home-admin">
              <Button variant="ghost" className="text-white">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/note-list">
              <Button variant="ghost" className="text-white">
                <List className="mr-2 h-4 w-4" />
                Note List
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-green-400 flex items-center justify-center">
                <FileText className="mr-2" /> Edit Patch Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="text-gray-400 font-semibold">Title</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-2 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="content" className="text-gray-400 font-semibold">Content</label>
                  <Textarea
                    id="content"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="mt-2 text-white"
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <Checkbox
                    id="status"
                    checked={status === 'active'}
                    onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
                    className="mr-2"
                  />
                  <label htmlFor="status" className="text-gray-400 font-semibold">
                    Active
                  </label>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-between">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    Save Changes
                  </Button>
                  <Button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    <Trash className="mr-2 h-4 w-4" /> Delete Note
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl mx-auto mt-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400 flex items-center">
                <MessageSquare className="mr-2" /> Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {console.log('Frontend: Rendering comments', comments)}
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-white">{comment.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-sm">
                        {comment.userName} - {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      <Button onClick={() => handleCommentDelete(comment._id)} variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No comments yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  )
}