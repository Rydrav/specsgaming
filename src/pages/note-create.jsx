// pages/create-patch-note.jsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Home, List, Send } from "lucide-react"
import { motion } from "framer-motion"

export default function CreatePatchNoteComponent() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [comment, setComment] = useState('')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patchNote, setPatchNote] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/note-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          status: 'active',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPatchNote({
          _id: data.id,
          title,
          content,
          status: 'active',
          createdAt: new Date().toISOString(),
          comments: []
        })
        setTitle('')
        setContent('')
      } else {
        const data = await response.json()
        setError(data.message || 'Error creating the patch note')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!patchNote) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/note-create', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: patchNote._id,
          comment,
          userName
        }),
      })

      if (response.ok) {
        setPatchNote(prevNote => ({
          ...prevNote,
          comments: [
            ...prevNote.comments,
            {
              _id: Date.now().toString(),
              content: comment,
              userName,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        setComment('')
        setUserName('')
      } else {
        const data = await response.json()
        setError(data.message || 'Error adding the comment')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-green-400 flex items-center justify-center">
                <FileText className="mr-2" /> Create Patch Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-200">Title</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-gray-700 border-gray-600 text-white" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-gray-200">Content</label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full bg-gray-700 border-gray-600 text-white min-h-[200px]" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Patch Note'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {patchNote && (
            <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-green-400 flex items-center justify-center">
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patchNote.comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">{comment.userName}</p>
                      <p className="mt-1">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleCommentSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="userName" className="text-sm font-medium text-gray-200">Your Name</label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium text-gray-200">Your Comment</label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      className="w-full bg-gray-700 border-gray-600 text-white min-h-[100px]" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  )
}