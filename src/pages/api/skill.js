import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/pages/api/middlewares/authMiddleware.js';

const prisma = new PrismaClient();

// GET /api/skill
async function handleGET(req, res) {
  try {
    const skills = await prisma.skill.findMany();
    if (skills.length === 0) {
      return res
        .status(200)
        .json({ message: '✅ No Skills available', data: [] });
    }
    return res.status(200).json({ message: '✅ Skills fetched', data: skills });
  } catch (err) {
    return res.status(500).json({ message: '❌ Failed to fetch Skills' });
  }
}

// POST /api/skill
async function handlePOST(req, res) {
  const data = req.body;

  try {
    const existingSkills = await prisma.skill.findMany();

    if (existingSkills.length >= 12) {
      return res.status(400).json({ message: '❌ Max 12 Skills allowed' });
    }

    const duplicate = existingSkills.find(
      (s) => s.value.toLowerCase().trim() === data.value.toLowerCase().trim()
    );

    if (duplicate) {
      return res
        .status(400)
        .json({ message: `❌ Skill ${data.value} already exists` });
    }

    const newSkill = await prisma.skill.create({ data });
    return res
      .status(201)
      .json({ message: `✅ Skill ${data.value} created`, data: newSkill });
  } catch (err) {
    return res.status(400).json({ message: '❌ Failed to create Skill' });
  }
}

// DELETE /api/skill?id=123
async function handleDELETE(req, res) {
  const id = parseInt(req.query.id);

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: '❌ Invalid or missing Skill ID' });
  }

  try {
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return res
        .status(404)
        .json({ message: `❌ Skill with ID ${id} not found` });
    }

    await prisma.skill.delete({ where: { id } });

    return res.status(200).json({ message: `✅ Skill ${skill.value} deleted` });
  } catch (err) {
    return res.status(500).json({ message: '❌ Error deleting the Skill ' });
  }
}

// PUT /api/skill?id=1
async function handlePUT(req, res) {
  const id = parseInt(req.query.id);
  const data = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: '❌ Invalid or missing Skill ID' });
  }

  try {
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      return res
        .status(404)
        .json({ message: `❌ Skill with ID ${id} not found` });
    }

    const updated = await prisma.skill.update({
      where: { id },
      data,
    });
    return res.status(200).json({ message: '✅ Skill updated', data: updated });
  } catch (err) {
    return res
      .status(400)
      .json({ message: '❌ Skill not found or update failed' });
  }
}

// Middleware JWT secured API handler
export default withAuth(async (req, res) => {
  if (req.method === 'GET') return handleGET(req, res);
  if (req.method === 'POST') return handlePOST(req, res);
  if (req.method === 'DELETE') return handleDELETE(req, res);
  if (req.method === 'PUT') return handlePUT(req, res);

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  res.status(405).end(`❌ Method ${req.method} Not Allowed`);
});
