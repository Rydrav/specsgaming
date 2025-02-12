'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { FileText, Plus, Home, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function NoteListJsx() {
  const [notes, setNotes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const notesPerPage = 10

  useEffect(() => {
    fetchNotes()
  }, [currentPage])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/note-list?page=${currentPage}&limit=${notesPerPage}`)
      const data = await response.json()
      setNotes(data.notes)
      setTotalPages(Math.ceil(data.total / notesPerPage))
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleNoteClick = (noteId) => {
    router.push(`/note-edit/${noteId}`)
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
            <Link href="/note-create">
              <Button className="bg-green-500 hover:bg-green-600">
                <Plus className="mr-2 h-4 w-4" /> New Note
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
          <h1 className="text-3xl font-bold mb-6 text-green-400">Patch Notes</h1>
          <div className="grid gap-4">
            
            {notes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
          <Pagination
            className="mt-6"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  )
}