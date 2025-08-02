import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/pages/api/middlewares/authMiddleware.js';

const prisma = new PrismaClient();

// GET /api/project
async function handleGET(req, res) {
  try {
    const projects = await prisma.project.findMany();
    if (projects.length === 0) {
      return res
        .status(200)
        .json({ message: '✅ No Projects available', data: [] });
    }
    return res
      .status(200)
      .json({ message: '✅ Projects fetched', data: projects });
  } catch (err) {
    return res.status(500).json({ message: '❌ Failed to fetch Projects' });
  }
}

// POST /api/project
async function handlePOST(req, res) {
  const data = req.body;

  try {
    const existingProjects = await prisma.project.findMany();

    if (existingProjects.length >= 4) {
      return res.status(400).json({ message: '❌ Max 4 Projects allowed' });
    }

    const duplicate = existingProjects.find(
      (p) => p.title.toLowerCase().trim() === data.title.toLowerCase().trim()
    );

    if (duplicate) {
      return res
        .status(400)
        .json({ message: `❌ Project Title ${data.title} already exists` });
    }

    const newProject = await prisma.project.create({ data });
    return res
      .status(201)
      .json({ message: `✅ Project ${data.title} created`, data: newProject });
  } catch (err) {
    return res.status(400).json({ message: '❌ Failed to create Project' });
  }
}

// DELETE /api/project?id=123
async function handleDELETE(req, res) {
  const id = parseInt(req.query.id);

  if (!id || isNaN(id)) {
    return res
      .status(400)
      .json({ message: '❌ Invalid or missing Project ID' });
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res
        .status(404)
        .json({ message: `❌ Project with ID ${id} not found` });
    }

    await prisma.project.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: `✅ Project ${project.title} deleted` });
  } catch (err) {
    return res.status(500).json({ message: '❌ Error deleting the Project' });
  }
}

// PUT /api/project?id=123
async function handlePUT(req, res) {
  const id = parseInt(req.query.id);
  const data = req.body;

  if (!id || isNaN(id)) {
    return res
      .status(400)
      .json({ message: '❌ Invalid or missing Project ID' });
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res
        .status(404)
        .json({ message: `❌ Project with ID ${id} not found` });
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    return res
      .status(200)
      .json({ message: '✅ Project updated', data: updated });
  } catch (err) {
    return res.status(500).json({ message: '❌ Failed to update the Project' });
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
