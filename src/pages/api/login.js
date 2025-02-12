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
    const user = await db.collection('usuarios').findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    if (user.accountStatus === 'inactive') {
      return res.status(403).json({ message: 'Cuenta desactivada', accountStatus: 'inactive' });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        hardware: user.hardware,
        selectedGames: user.selectedGames || [],
        createdAt: user.createdAt,
        accountStatus: user.accountStatus,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, accountStatus: user.accountStatus });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}