# 🧠 My Port Folio Tech

Welcome to the **technical core** of my portfolio! 💻✨  
This document is crafted for curious developers, recruiters, or anyone wanting to dive into how this project works behind the scenes.  
No fluff here — just clean structure, tools, and a bit of nerdy fun. 😎


---

## 🧬 Tech Stack Overview

| Layer          | Tech / Library                                  | Purpose |
|----------------|--------------------------------------------------|---------|
| **Framework**  | [Next.js](https://nextjs.org/)                   | Full-stack React with SSR & routing |
| **UI**         | [React](https://reactjs.org/)                    | Component-based rendering |
| **Animation**  | [GSAP](https://greensock.com/), [lil-gui](https://github.com/georgealways/lil-gui) | Smooth animations + controls |
| **3D / WebGL** | [Three.js](https://threejs.org/), [Postprocessing](https://www.npmjs.com/package/postprocessing), [three-custom-shader-material](https://github.com/Fyrestar/THREE.CustomShaderMaterial) | Immersive 3D experiences |
| **Styling**    | [Sass](https://sass-lang.com/)                   | Scalable modular stylesheets |
| **Backend**    | Next.js API routes                               | Custom serverless backend logic |
| **ORM**        | [Prisma](https://www.prisma.io/) + SQLite       | Database layer |
| **Auth**       | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), cookies | Token-based authentication |
| **Emailing**   | [Nodemailer](https://nodemailer.com/)            | Contact form handler |
| **Templating** | [Handlebars](https://handlebarsjs.com/)          | Email template engine |
| **Testing**    | Jest, Mocha, Chai, Supertest, Testing Library    | Unit & integration tests |
| **CI/CD**      | [Vercel](https://vercel.com/)                    | Hosting + auto-deployments |

---

## 🧪 Technical Features

### 🔐 Authentication & Security

- Secure login via **JWT tokens** stored in **HTTP-only cookies**.
- Passwords are hashed (in production setup).
- Input validation using middleware logic.
- Secure headers set via `next.config.js` & middleware.
- `.env` file stores secrets (ignored by Git).

### 🛠️ Backend API (Serverless)

- Built using **Next.js API routes**.
- Handles:
  - Contact form submission
  - Authentication
  - Database read/write via Prisma
- Uses cookies for auth & sessions.

### 🎮 3D Engine Integration

- WebGL rendering with **Three.js**.
- Real-time shader support using `three-custom-shader-material`.
- **GSAP** animations for UI transitions.
- **Postprocessing** used for visual effects (bloom, depth, etc.).
- Lightweight UI controls via **lil-gui**.

### 🧼 Testing Strategy

- **Frontend**:  
  Using `@testing-library/react` + `jest-dom` for component testing.

- **Backend/API**:  
  Tested with `Supertest`, `Jest`, and `Mocha`.

> Run front tests: `npm run test:front`  
> Run back tests: `npm run test:back`

---

## ⚙️ Available Commands

| Command              | Description |
|----------------------|-------------|
| `npm install`        | Install dependencies |
| `npm run dev`        | Run in development mode |
| `npm run build`      | Production build |
| `npm start`          | Start production server |
| `npx prisma migrate dev` | Run DB migrations |
| `npm run test:front` | Run frontend tests |
| `npm run test:back`  | Run backend/API tests |

---

## 🌿 .env Example

Make sure to create a `.env` file in the root folder:

```
DATABASE_URL="yourURL"
USER_EMAIL="yourEMAIL"
USER_PASSWORD="yourPassWord"
JWT_SECRET="yourJWTSECRET"
SMTP_SERVICE=yourService
SMTP_USER=yourUser
SMTP_PASS=yourPass
NOTIFY_TO=yourContact
```

> 🔐 Keep this file secret. Never commit it!

---

## ⚙️ Dev & Deployment

- Hosted on [**Vercel**](https://vercel.com/)
  - Auto-build on push
  - Live previews per branch
- `next.config.js` handles environment config
- Assets are served via Next.js optimized image & static handling
- Deploy status: 🟢 Always Green™

---

## 🌐 Site URL

You can visit the live site at [https://port-folio-peach-kappa.vercel.app/](https://port-folio-peach-kappa.vercel.app/). 💻

---

## 🧑‍💻 Author

Created by TheLeon 🔥.

> “Code is poetry in logic.” - Someone on Earth 🌍  

Thanks for visiting my portfolio technical part! 🩵 

And as we say in dev mode: "It works on my machine!" 💻✨
