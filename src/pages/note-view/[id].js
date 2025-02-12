import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Home, Send, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export default function NoteViewPage() {
  const [note, setNote] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedUser = decodeJWT(token)
      setUser(decodedUser)
    }

    if (id) {
      fetchNote()
    }
  }, [id])

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  const fetchNote = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/note-view/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch note')
      }
      const data = await response.json()
      setNote(data)
    } catch (error) {
      console.error('Error fetching note:', error)
      setError('Failed to load note. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/login-page')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/note-create', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          noteId: id,
          comment,
          userName: user.name
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }
      setComment('')
      fetchNote() // Refresh the note to show the new comment
    } catch (error) {
      console.error('Error submitting comment:', error)
      setError('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => router.push('/community')} className="bg-green-500 hover:bg-green-600">
          Back to Community
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home">
            <img src="/logo.png" alt="SpecsGaming Logo" className="h-8 w-auto" />
          </Link>
          <Link href="/community">
            <Button variant="ghost" className="text-white">
              <Home className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {note && (
            <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-400 flex items-center">
                  <FileText className="mr-2" />
                  {note.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none ext-white-400 mb-4>">
                  {note.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-white-400 mb-4">{paragraph}</p>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Created at: {new Date(note.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {note && note.comments && note.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-300 font-semibold">{comment.userName}</p>
                    <p className="mt-1">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Comment
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      className="w-full bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">You need to be logged in to comment.</p>
                  <Button onClick={() => router.push('/login-page')} className="bg-blue-500 hover:bg-blue-600">
                    Log In to Comment
                  </Button>
                </div>
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