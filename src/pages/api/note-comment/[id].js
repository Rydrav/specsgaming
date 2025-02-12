import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id } = req.query
    const { content, userId, userName } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de nota inválido' })
    }

    if (!content || !userId || !userName) {
      return res.status(400).json({ message: 'Faltan datos requeridos' })
    }

    try {
      const client = await clientPromise
      const db = client.db('specsGamingDB')
      const notesCollection = db.collection('notes')

      const result = await notesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            comments: {
              _id: new ObjectId(),
              content,
              userId,
              userName,
              createdAt: new Date()
            }
          }
        }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Nota no encontrada' })
      }

      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: 'No se pudo agregar el comentario' })
      }

      res.status(200).json({ message: 'Comentario agregado exitosamente' })
    } catch (error) {
      console.error('Error adding comment:', error)
      res.status(500).json({ message: 'Error al agregar el comentario', error: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}