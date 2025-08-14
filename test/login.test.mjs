import { expect } from 'chai';
import handler from '../src/pages/api/auth/login.js';

function mockReqRes(method, body = {}) {
  const req = {
    method,
    body,
    headers: {},
  };
  let statusCode = null;
  let jsonData = null;
  let headersSet = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    },
    setHeader(name, value) {
      headersSet[name] = value;
    },
    get statusCode() {
      return statusCode;
    },
    get jsonData() {
      return jsonData;
    },
    get headersSet() {
      return headersSet;
    },
  };

  return { req, res };
}

describe('POST /api/login', () => {
  beforeEach(() => {
    process.env.USER_EMAIL = 'test@example.com';
    process.env.USER_PASSWORD = 'pass123';
    process.env.JWT_SECRET = 'secret';
    process.env.NODE_ENV = 'test';
  });

  it('✅ devrait réussir avec des identifiants valides', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'test@example.com',
      password: 'pass123',
    });

    await handler(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.jsonData.message).to.equal('✅ Login succeeded');
    expect(res.headersSet['Set-Cookie']).to.match(/token=/);
  });

  it('❌ devrait renvoyer 400 si email ou mot de passe manquant', async () => {
    const { req, res } = mockReqRes('POST', { email: '' });

    await handler(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res.jsonData.message).to.include('Email and Password are required');
  });

  it('🚫 devrait renvoyer 401 si mauvais identifiants', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'wrong@example.com',
      password: 'wrong',
    });

    await handler(req, res);

    expect(res.statusCode).to.equal(401);
    expect(res.jsonData.message).to.include('Invalid Email or Password');
  });

  it('💥 devrait renvoyer 500 si erreur interne', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'test@example.com',
      password: 'pass123',
    });

    // Simuler une erreur
    const originalSign = (await import('jsonwebtoken')).default.sign;
    (await import('jsonwebtoken')).default.sign = () => {
      throw new Error('Simulated error');
    };

    await handler(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res.jsonData.message).to.include('Internal server error');

    // Restaurer la fonction originale
    (await import('jsonwebtoken')).default.sign = originalSign;
  });
});
