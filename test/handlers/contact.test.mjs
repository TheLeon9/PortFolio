import { expect } from 'chai';
import handler from '../../src/pages/api/contact.js';
import nodemailer from 'nodemailer';

// --- MOCK NODEMAILER ---
nodemailer.createTransport = () => ({
  sendMail: async () => Promise.resolve(),
});

// --- MOCK REQ/RES UTILITY ---
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
  it('✅ should send an email with valid data', async () => {
    const { req, res, resData } = mockReqRes(
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Hello from the contact form!',
      },
      'POST',
      '1.1.1.1' // Unique IP
    );

    await handler(req, res);
    expect(resData.status).to.equal(200);
    expect(resData.body.message).to.equal('✅ Email sent successfully.');
  });

  it('❌ should return an error if a field is missing', async () => {
    const { req, res, resData } = mockReqRes(
      {}, // Empty fields
      'POST',
      '2.2.2.2' // Different IP to avoid rate limiting
    );

    await handler(req, res);
    expect(resData.status).to.equal(400);
    expect(resData.body.message).to.include('❌ First name');
  });

  it('🚫 should block after too many requests (rate limit)', async () => {
    const validBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test',
    };

    // First request OK
    let { req, res, resData } = mockReqRes(validBody, 'POST', '3.3.3.3');
    await handler(req, res);
    expect(resData.status).to.equal(200);

    // Second request from same IP => blocked
    ({ req, res, resData } = mockReqRes(validBody, 'POST', '3.3.3.3'));
    await handler(req, res);
    expect(resData.status).to.equal(429);
    expect(resData.body.message).to.include('Too many requests');
  });
});
