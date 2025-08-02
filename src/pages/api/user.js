import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/pages/api/middlewares/authMiddleware.js';

const prisma = new PrismaClient();

// GET /api/user
async function handleGET(req, res) {
  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: '✅ No Users available', data: [] });
    }
    return res.status(200).json({ message: '✅ Users fetched', data: users });
  } catch (err) {
    return res.status(500).json({ message: '❌ Failed to fetch users' });
  }
}

// PUT /api/user?id=123
async function handlePUT(req, res) {
  const id = parseInt(req.query.id);
  const data = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: '❌ Invalid or missing user ID' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    return res.status(200).json({ message: '✅ User updated', data: updated });
  } catch (err) {
    return res
      .status(400)
      .json({ message: '❌ User not found or update failed' });
  }
}

// Entrée API protégée par middleware JWT
export default withAuth(async (req, res) => {
  if (req.method === 'GET') return handleGET(req, res);
  if (req.method === 'PUT') return handlePUT(req, res);

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`❌ Method ${req.method} Not Allowed`);
});
