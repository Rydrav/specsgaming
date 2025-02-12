import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db('specsGamingDB')
      const notesCollection = db.collection('notes')

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      const total = await notesCollection.countDocuments()
      const notes = await notesCollection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      res.status(200).json({
        notes: notes.map(note => ({
          _id: note._id.toString(),
          title: note.title,
          content: note.content.substring(0, 100), // Only send a preview of the content
          createdAt: note.createdAt,
          commentCount: note.comments ? note.comments.length : 0
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    } catch (error) {
      console.error('Error fetching notes:', error)
      res.status(500).json({ message: 'Error al obtener las notas de parche' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}