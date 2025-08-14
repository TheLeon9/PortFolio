import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/constants
async function handleGET(req, res) {
  try {
    const [projects, users, skills] = await Promise.all([
      prisma.project.findMany(),
      prisma.user.findMany(),
      prisma.skill.findMany(),
    ]);

    if (projects.length === 0 && users.length === 0 && skills.length === 0) {
      return res.status(200).json({
        message: '✅ No Constants available',
        data: { projects: [], users: [], skills: [] },
      });
    }

    return res.status(200).json({
      message: '✅ Constants Data fetched',
      data: { projects, users, skills },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: '❌ Failed to fetch Constants Data' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGET(req, res);

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`❌ Method ${req.method} Not Allowed`);
}
