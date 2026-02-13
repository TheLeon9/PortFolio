// 📦 Data for All the sections
export const sections = [
  { id: 'Home', range: [0, 25] },
  { id: 'About', range: [25, 50] },
  { id: 'Projects', range: [50, 75] },
  { id: 'Skills', range: [75, 95] },
  { id: 'Contact', range: [95, 100] },
];

// 📦 Data for All the sections Informations
export const sectionsInformation = [
  {
    title: 'MORACCHINI',
    coloredTitle: 'FLORIAN',
    text: 'Home',
  },
  {
    title: 'ABOUT',
    coloredTitle: 'ME',
    text: 'Learn more about who I am and what I do',
  },
  {
    title: 'MY',
    coloredTitle: 'PROJECTS',
    text: 'Explore a showcase of my diverse projects',
  },
  {
    title: 'MY',
    coloredTitle: 'SKILLS',
    text: 'Discover the various skills and technologies I work with',
  },
  {
    title: 'CONTACT',
    coloredTitle: 'ME',
    text: 'Find out how to get in touch with me',
  },
];

// 📦 Data for Height and width for IMG
export const imgWH = 20;

// 📦 Data for all the main color
export const DEFAULT_MAIN_COLOR = '#0132b5';
export const DEFAULT_BACKGROUND_COLOR = '#f8f8ff';
export const DEFAULT_TEXT_COLOR = '#1c1c1c';
export const DEFAULT_BLACK_COLOR = '#040b12';
export const DEFAULT_TRANSMISSION_LEVEL = 0.1;

// 📦 Data for the ChatBot questions
export const predefinedQuestions = [
  {
    id: 1,
    question: 'Tell me about the portfolio owner',
    answer:
      'The owner is a passionate developer specialized in Next.js, Three.js, and SCSS. He loves creating immersive and interactive web experiences.',
  },
  {
    id: 2,
    question: 'What are his skills?',
    answer:
      'He is skilled in JavaScript, React, Next.js, Three.js, SCSS, and modern front-end development.',
  },
  {
    id: 3,
    question: 'Does he have work experience?',
    answer:
      'Yes, he has worked on several projects ranging from personal portfolios to client websites, focusing on performance and design.',
  },
  {
    id: 4,
    question: 'How can I contact him ?',
    answer: 'You can contact him via the Contact section of this portfolio',
  },
  {
    id: 5,
    question: 'Which technologies does he prefer?',
    answer:
      'He primarily works with React, Next.js, Three.js, SCSS, and modern web tools to build interactive and performant web apps.',
  },
  {
    id: 6,
    question: 'Can I see his projects?',
    answer:
      'Absolutely! You can check out all his projects in the Projects section of this portfolio, with detailed descriptions and technologies used.',
  },
  {
    id: 7,
    question: 'Does he do UI/UX design?',
    answer:
      'Yes, he has experience in designing user-friendly and visually appealing interfaces, focusing on usability and accessibility.',
  },
  {
    id: 8,
    question: 'Is he available for freelance work?',
    answer:
      'He may be available for freelance projects. Please contact him via the Contact section to discuss any potential collaboration.',
  },
  {
    id: 9,
    question: 'Where can I find his GitHub or LinkedIn?',
    answer:
      'His GitHub and LinkedIn profiles are linked in the About section, where you can explore his repositories and professional background.',
  },
  {
    id: 10,
    question:
      'Congrats, you made it to the last question! 🎉 What should I know?',
    answer:
      "Thanks for sticking around! The owner loves exploring new tech, experimenting with creative ideas, and having fun while coding. You're awesome for reaching here! 🚀",
  },
];

// 📦 Data for the Color Picker options
export const COLOR_OPTIONS = {
  main: [
    { name: 'Legend Blue', color: '#0132b5' },
    { name: 'Crimson Red', color: '#b5013a' },
    { name: 'Forest Green', color: '#007755' },
    { name: 'Mustard Yellow', color: '#d4a500' },
    { name: 'Midnight Purple', color: '#5e2fbd' },
    { name: 'Deep Aqua', color: '#00a3b5' },
  ],
  background: [
    { name: 'Black', color: '#040b12' },
    { name: 'White', color: '#f8f8ff' },
  ],
};

// 📦 Data for user
export const userList = {
  id: 1,
  lastName: 'Moracchini',
  firstName: 'Florian',
  year: 23,
  country: 'France',
  city: 'Paris',
  linkedin: 'https://www.linkedin.com/in/florian-moracchini/',
  github: 'https://github.com/TheLeon9',
  description: 'Fullstack Dev passionné 🚀',
  email: 'florian.moracchini09@gmail.com',
  user_contact: false,
  user_chatbot: true,
};

// 📦 Data for skills
export const skillsList = [
  {
    id: 21,
    value: 'CSS',
    order: 2,
  },
  {
    id: 22,
    value: 'JS',
    order: 3,
  },
  {
    id: 23,
    value: 'FIGMA',
    order: 4,
  },
  {
    id: 24,
    value: 'ThreeJS',
    order: 5,
  },
  {
    id: 25,
    value: 'NextJS',
    order: 6,
  },
  {
    id: 26,
    value: 'React',
    order: 7,
  },
  {
    id: 27,
    value: 'UX',
    order: 8,
  },
  {
    id: 28,
    value: 'UI',
    order: 9,
  },
  {
    id: 29,
    value: 'SCSS',
    order: 10,
  },
  {
    id: 30,
    value: 'GSAP',
    order: 11,
  },
  {
    id: 31,
    value: 'ExpressJS',
    order: 12,
  },
  {
    id: 36,
    value: 'HTML',
    order: 1,
  },
];

// 📦 Data for projects
export const projectsList = [
  {
    id: 1,
    projectNumber: 1,
    title: 'Elementary Lion',
    description: 'Presentation of Lions fused with Elements',
    url: 'https://elementary-lions.vercel.app//',
    highlight1: 'NextJS',
    highlight2: 'SCSS',
    highlight3: 'Animations',
    highlight4: 'Responsive',
    highlight5: 'ThreeJS',
  },
  {
    id: 21,
    projectNumber: 2,
    title: 'Beauty Tech Med',
    description:
      'Website created for the medical branch of BeautyTech, a French national leader in cosmetics. The site showcases medical devices and aesthetic machines, targeting healthcare professionals in the aesthetic industry.',
    url: 'https://beautytech-med.fr',
    highlight1: 'Wordpress',
    highlight2: 'Work Study',
    highlight3: 'CSS',
    highlight4: 'Company',
    highlight5: 'Medical',
  },
  {
    id: 2,
    projectNumber: 3,
    title: '3D Saber',
    description: 'Presentation of a 3D Saber',
    url: '',
    highlight1: 'React',
    highlight2: 'SCSS',
    highlight3: 'Animations',
    highlight4: 'Responsive',
    highlight5: 'ThreeJS',
  },
  {
    id: 19,
    projectNumber: 4,
    title: 'Test',
    description: '',
    url: '',
    highlight1: '',
    highlight2: '',
    highlight3: '',
    highlight4: '',
    highlight5: '',
  },
];
