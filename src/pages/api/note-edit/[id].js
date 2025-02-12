import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { id } = req.query

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de nota inválido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('specsGamingDB')
    const notesCollection = db.collection('notes')

    if (req.method === 'GET') {
      const note = await notesCollection.findOne({ _id: new ObjectId(id) })

      if (!note) {
        return res.status(404).json({ message: 'Nota no encontrada' })
      }

      res.status(200).json({
        _id: note._id.toString(),
        title: note.title,
        content: note.content,
        status: note.status,
        comments: note.comments || []
      })
    } else if (req.method === 'PUT') {
      const { title, content, status } = req.body

      if (!title || !content) {
        return res.status(400).json({ message: 'Título y contenido son requeridos' })
      }

      const result = await notesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, content, status, updatedAt: new Date() } }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Nota no encontrada' })
      }

      res.status(200).json({ message: 'Nota actualizada exitosamente' })
    } else if (req.method === 'DELETE') {
      const result = await notesCollection.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Nota no encontrada' })
      }

      res.status(200).json({ message: 'Nota eliminada exitosamente' })
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ message: 'Error al procesar la nota de parche', error: error.message })
  }
}