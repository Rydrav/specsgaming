import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, name, password } = req.body;

  // Validación de email
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Formato de email inválido' });
  }

  // Validación de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'La contraseña no cumple con los requisitos de seguridad' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('specsGamingDB');

    const existingAdmin = await db.collection('admins').findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Este correo ya está registrado como administrador' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('admins').insertOne({
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Administrador registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el administrador' });
  }
}