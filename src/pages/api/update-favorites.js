import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar el token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const { selectedGames } = req.body;

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db('specsGamingDB');

    // Actualizar los juegos favoritos del usuario
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { selectedGames } }
    );

    // Crear un nuevo token con la información actualizada
    const updatedUser = await db.collection('usuarios').findOne(
      { _id: new ObjectId(userId) }
    );

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
    );

    res.status(200).json({ 
      message: 'Favoritos actualizados correctamente',
      token: newToken 
    });
  } catch (error) {
    console.error('Error al actualizar favoritos:', error);
    res.status(500).json({ 
      message: error.name === 'JsonWebTokenError' 
        ? 'Token inválido' 
        : 'Error al actualizar favoritos' 
    });
  }
}