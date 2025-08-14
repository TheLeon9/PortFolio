import { expect } from 'chai';
import handler from '../src/pages/api/contact.js';
import nodemailer from 'nodemailer';

// --- MOCK NODEMAILER ---
nodemailer.createTransport = () => ({
  sendMail: async () => Promise.resolve(),
});

// --- UTILITAIRE MOCK REQ/RES ---
function mockReqRes(body, method = 'POST', ip = '127.0.0.1') {
  let resData = {};
  const req = {
    method,
    body,
    headers: { 'x-forwarded-for': ip },
    socket: { remoteAddress: ip },
  };
  const res = {
    status(code) {
      resData.status = code;
      return this;
    },
    json(data) {
      resData.body = data;
      return resData;
    },
  };
  return { req, res, resData };
}

describe('POST /api/contact', () => {
  it('✅ devrait envoyer un email avec des données valides', async () => {
    const { req, res, resData } = mockReqRes(
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Hello from the contact form!',
      },
      'POST',
      '1.1.1.1' // IP unique
    );

    await handler(req, res);
    expect(resData.status).to.equal(200);
    expect(resData.body.message).to.equal('✅ Email sent successfully.');
  });

  it('❌ devrait renvoyer une erreur si un champ est manquant', async () => {
    const { req, res, resData } = mockReqRes(
      {}, // Champs vides
      'POST',
      '2.2.2.2' // IP différente pour éviter rate limit
    );

    await handler(req, res);
    expect(resData.status).to.equal(400);
    expect(resData.body.message).to.include('❌ First name');
  });

  it('🚫 devrait bloquer après trop de requêtes (rate limit)', async () => {
    const validBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test',
    };

    // Première requête OK
    let { req, res, resData } = mockReqRes(validBody, 'POST', '3.3.3.3');
    await handler(req, res);
    expect(resData.status).to.equal(200);

    // Deuxième requête même IP => bloquée
    ({ req, res, resData } = mockReqRes(validBody, 'POST', '3.3.3.3'));
    await handler(req, res);
    expect(resData.status).to.equal(429);
    expect(resData.body.message).to.include('Too many requests');
  });
});
