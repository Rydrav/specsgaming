import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { id, commentId } = req.query

  if (!ObjectId.isValid(id) || !ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: 'ID de nota o comentario inválido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('specsGamingDB')
    const notesCollection = db.collection('notes')

    if (req.method === 'DELETE') {
      const result = await notesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { comments: { _id: new ObjectId(commentId) } } }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Nota no encontrada' })
      }

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Comentario no encontrado' })
      }

      res.status(200).json({ message: 'Comentario eliminado exitosamente' })
    } else {
      res.setHeader('Allow', ['DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ message: 'Error al procesar el comentario', error: error.message })
  }
}