import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, name, password, hardware, selectedGames, accountStatus } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db('specsGamingDB');

    const existingUser = await db.collection('usuarios').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('usuarios').insertOne({
      email,
      name,
      password: hashedPassword,
      hardware,
      selectedGames,
      accountStatus,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Registro exitoso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
}