// scripts/generate-constants.js
import fs from 'fs';
import path from 'path';

// Import direct de ton handler Next.js
import handler from '../src/pages/api/constant.js';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not found. Skipping constants generation.');
  process.exit(0); // exit normalement sans erreur
}

// Fake request/response pour exécuter ton handler en local
function runApiHandler() {
  return new Promise((resolve, reject) => {
    const req = { method: 'GET' };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        if (this.statusCode >= 400) {
          reject(data);
        } else {
          resolve(data);
        }
      },
      setHeader() {},
      end(msg) {
        reject(new Error(msg));
      },
    };

    handler(req, res);
  });
}

async function generateConstants() {
  try {
    console.log('🔄 Fetching constants from internal API handler...');

    const { data } = await runApiHandler();
    const { users = [], skills = [], projects = [] } = data;

    const now = new Date();
    const timestamp = now.toLocaleString('fr-FR');

    const formatArray = (name, array) => {
      const sectionName = name
        .replace('List', '')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();

      const comment = `// 📦 Data for ${sectionName}`;

      const content = array
        .map((item) => {
          const formatted = Object.entries(item)
            .map(([key, value]) => {
              const safeValue =
                typeof value === 'string'
                  ? `'${value.replace(/'/g, "\\'")}'`
                  : value;
              return `  ${key}: ${safeValue}`;
            })
            .join(',\n');
          return `{\n${formatted}\n}`;
        })
        .join(',\n');

      return `${comment}\nexport const ${name} = [\n${content}\n];\n`;
    };

    const finalContent =
      `// 🚨 File generated automatically on ${timestamp}\n\n` +
      formatArray('userList', users) +
      '\n' +
      formatArray('skillsList', skills) +
      '\n' +
      formatArray('projectsList', projects);

    const filePath = path.resolve(
      process.cwd(),
      'src/constants/constants-generated.js'
    );

    fs.writeFileSync(filePath, finalContent, 'utf8');

    console.log('✅ constants-generated.js created successfully!');
  } catch (err) {
    console.error('❌ Error during constants generation:', err);
    process.exit(1);
  }
}

generateConstants();
