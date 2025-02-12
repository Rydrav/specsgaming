import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, password } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db('specsGamingDB');
    const admin = await db.collection('admins').findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}