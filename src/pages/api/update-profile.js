// /pages/api/update-profile.js
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Disallowed method' })
  }

  const { newPassword, hardware } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded._id

    const client = await clientPromise
    const db = client.db('specsGamingDB')
    const usersCollection = db.collection('usuarios')

    const updateData = {}
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }
    if (hardware) {
      updateData.hardware = hardware
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Obtener el usuario actualizado
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) })

    // Crear un nuevo token con la información actualizada
    const newToken = jwt.sign(
      {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        hardware: updatedUser.hardware,
        selectedGames: updatedUser.selectedGames,
        createdAt: updatedUser.createdAt,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.status(200).json({ message: 'Profile updated successfully', token: newToken })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Error updating profile' })
  }
}