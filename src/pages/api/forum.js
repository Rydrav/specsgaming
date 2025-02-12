import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('specsGamingDB');

  if (req.method === 'POST') {
    const { title, content, createdBy, isAdmin } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'El contenido es requerido' });
    }

    try {
      if (isAdmin) {
        const newUpdate = {
          title,
          content,
          createdAt: new Date(),
          createdBy: "Admin",
        };
        await db.collection('adminUpdates').insertOne(newUpdate);
      } else {
        const newComment = {
          content,
          createdAt: new Date(),
          createdBy,
        };
        await db.collection('userComments').insertOne(newComment);
      }

      res.status(201).json({ message: 'Entrada creada exitosamente' });
    } catch (error) {
      console.error('Error al crear la entrada:', error);
      res.status(500).json({ message: 'Error al crear la entrada' });
    }
  } else if (req.method === 'GET') {
    try {
      const adminUpdates = await db.collection('adminUpdates').find({}).sort({ createdAt: -1 }).toArray();
      const userComments = await db.collection('userComments').find({}).sort({ createdAt: -1 }).toArray();

      res.status(200).json({ adminUpdates, userComments });
    } catch (error) {
      console.error('Error al obtener las actualizaciones y comentarios:', error);
      res.status(500).json({ message: 'Error al obtener las actualizaciones y comentarios' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
