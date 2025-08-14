import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// --- Rate Limiting Config ---
let requestCount = {};
const RATE_LIMIT = 1; // 1 max
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function rateLimiter(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!requestCount[ip]) requestCount[ip] = [];
  requestCount[ip] = requestCount[ip].filter((ts) => now - ts < WINDOW_MS);

  if (requestCount[ip].length >= RATE_LIMIT) {
    res
      .status(429)
      .json({ message: '❌ Too many requests, please try again later.' });
    return true;
  }

  requestCount[ip].push(now);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '❌ Method not allowed' });
  }

  if (rateLimiter(req, res)) return;

  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // --- Validation ---
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({
        message:
          '❌ First name, last name, email, phone, and message are required.',
      });
    }

    // --- Load HTML template ---
    const templatePath = path.join(
      process.cwd(),
      'templates',
      'mail_notification.html'
    );
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // --- Compile Handlebars template ---
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const filledHtml = compiledTemplate({
      Date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      LastName: lastName,
      Email: email,
      Phone: phone,
      Message: message,
    });

    // --- Configure Nodemailer ---
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // --- Send Email ---
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO,
      subject: `📩 New contact message from ${firstName} ${lastName}`,
      html: filledHtml,
    });

    res.status(200).json({ message: '✅ Email sent successfully.' });
  } catch (err) {
    console.error('🔥 EMAIL ERROR:', err);
    res.status(500).json({ message: '❌ Failed to send email.' });
  }
}
