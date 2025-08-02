import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initDefaultUser = async () => {
  try {
    const existingUsers = await prisma.user.findMany();

    if (existingUsers.length === 0) {
      await prisma.user.create({
        data: {
          lastName: 'Moracchini',
          firstName: 'Florian',
          year: 23,
          country: 'France',
          city: 'Paris',
          linkedin: 'https://www.linkedin.com/in/florian-moracchini/',
          github: 'https://github.com/TheLeon9',
          description: 'Fullstack Dev passionné 🚀',
          email: 'florian.moracchini09@gmail.com',
        },
      });

      // console.log('✅ Default user created!');
    } else {
      // console.log('✅ User already exists, no need to create one.');
    }
  } catch (error) {
    console.error('❌ Error during user initialization:', error);
  } finally {
    await prisma.$disconnect();
  }
};
