import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getConstants = async (req, res) => {
  try {
    const [projects, users, skills] = await Promise.all([
      prisma.project.findMany(),
      prisma.user.findMany(),
      prisma.skill.findMany(),
    ]);

    res.status(200).json({
      message: '✅ Constants Data fetched',
      users,
      projects,
      skills,
    });
  } catch (err) {
    res.status(500).json({ error: '❌ Failed to fetch Constants Data' });
  }
};
