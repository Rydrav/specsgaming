// pages/api/note-create.js
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, content, status } = req.body

    try {
      const client = await clientPromise
      const db = client.db('specsGamingDB')

      const result = await db.collection('notes').insertOne({
        title,
        content,
        status,
        createdAt: new Date(),
        comments: []
      })

      return res.status(201).json({ message: 'Nota de parche creada exitosamente', id: result.insertedId })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error al crear la nota de parche' })
    }
  } else if (req.method === 'PUT') {
    const { noteId, comment, userName } = req.body

    try {
      const client = await clientPromise
      const db = client.db('specsGamingDB')

      const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId) },
        {
          $push: {
            comments: {
              _id: new ObjectId(),
              content: comment,
              userName,
              createdAt: new Date()
            }
          }
        }
      )

      if (result.modifiedCount === 1) {
        return res.status(200).json({ message: 'Comentario agregado exitosamente' })
      } else {
        return res.status(404).json({ message: 'Nota de parche no encontrada' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error al agregar el comentario' })
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' })
  }
}