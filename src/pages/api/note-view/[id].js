import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query

    try {
      const client = await clientPromise
      const db = client.db('specsGamingDB')
      const notesCollection = db.collection('notes')

      const note = await notesCollection.findOne({ _id: new ObjectId(id) })

      if (!note) {
        return res.status(404).json({ message: 'Note not found' })
      }

      res.status(200).json({
        _id: note._id.toString(),
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        comments: note.comments || []
      })
    } catch (error) {
      console.error('Error fetching note:', error)
      res.status(500).json({ message: 'Error retrieving the note', error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}