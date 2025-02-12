'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { FileText, Home, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export default function CommunityPage() {
  const [notes, setNotes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const notesPerPage = 10

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decodedUser = decodeJWT(token)
      setUser(decodedUser)
    }
    fetchNotes()
  }, [currentPage])

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

  const fetchNotes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/community?page=${currentPage}&limit=${notesPerPage}&status=active`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setNotes(data.notes || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setError(`Failed to load notes: ${error.message}. Please try again later.`)
    } finally {
      setLoading(false)
    }
  }

  const handleNoteClick = (noteId) => {
    router.push(`/note-view/${noteId}`)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/")
  }

  const handleRetry = () => {
    fetchNotes()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-gray-800"
      >
        <nav className="container mx-auto flex justify-between items-center">
          <Link href={user ? "/home" : "/"}>
            <motion.img
              whileHover={{ scale: 1.1 }}
              src="/logo.png"
              alt="SpecsGaming Logo"
              className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"
            />
          </Link>
          <div className="hidden md:flex space-x-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/games" className="hover:text-green-400 transition-colors">
                Games
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                href={user ? "/home" : "/recommender"}
                className="hover:text-green-400 transition-colors"
              >
                {user ? "Recommendations" : "Recommender"}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/community" className="text-green-400">
                Community
              </Link>
            </motion.div>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="text-green-400 hover:underline">
                {user.name}
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-none transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/50"
                >
                  Logout
                </Button>
              </motion.div>
            </div>
          ) : (
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-none transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/50"
                >
                  Login
                </Button>
              </motion.div>
            </Link>
          )}
        </nav>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6 text-green-400">Community Patch Notes</h1>
          {loading ? (
            <p className="text-center text-gray-400">Loading notes...</p>
          ) : error ? (
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={handleRetry} className="bg-green-500 hover:bg-green-600">
                Retry
              </Button>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-center text-gray-400">No notes available.</p>
          ) : (
            <div className="grid gap-4">
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleNoteClick(note._id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-green-400 flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 truncate">{note.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          {!loading && !error && notes.length > 0 && (
            <Pagination
              className="mt-6"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  )
}