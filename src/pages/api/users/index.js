import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }

  const client = await clientPromise
  const db = client.db('specsGamingDB')
  const usersCollection = db.collection('usuarios')

  switch (req.method) {
    case 'GET':
      return getUsers(req, res, usersCollection)
    case 'POST':
      return createUser(req, res, usersCollection)
    case 'PUT':
      return updateUser(req, res, usersCollection)
    case 'DELETE':
      return deleteUser(req, res, usersCollection)
    case 'PATCH':
      return deactivateUser(req, res, usersCollection)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function getUsers(req, res, usersCollection) {
  const { page = 1, limit = 10, search = '' } = req.query
  const skip = (page - 1) * limit

  try {
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {}

    const total = await usersCollection.countDocuments(query)
    const users = await usersCollection.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray()

    const sanitizedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt
    }))

    res.status(200).json({
      users: sanitizedUsers,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
}

async function createUser(req, res, usersCollection) {
  const { name, email, password, accountStatus = 'active' } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = {
      name,
      email,
      password: hashedPassword,
      accountStatus,
      createdAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser)
    res.status(201).json({ message: 'User created successfully', userId: result.insertedId })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error creating user' })
  }
}

async function updateUser(req, res, usersCollection) {
  const { _id, name, email, accountStatus, newPassword } = req.body

  if (!_id || !name || !email || !accountStatus) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const updateData = { name, email, accountStatus }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      updateData.password = hashedPassword
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: 'No changes were made to the user' })
    }

    res.status(200).json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Error updating user' })
  }
}

async function deleteUser(req, res, usersCollection) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Error deleting user' })
  }
}

async function deactivateUser(req, res, usersCollection) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { accountStatus: 'inactive' } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: 'User is already inactive' })
    }

    res.status(200).json({ message: 'User account deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating user account:', error)
    res.status(500).json({ message: 'Error deactivating user account' })
  }
}