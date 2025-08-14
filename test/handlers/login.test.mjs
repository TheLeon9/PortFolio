import { expect } from 'chai';
import handler from '../../src/pages/api/auth/login.js';

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

  it('✅ should succeed with valid credentials', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'test@example.com',
      password: 'pass123',
    });

    await handler(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res.jsonData.message).to.equal('✅ Login succeeded');
    expect(res.headersSet['Set-Cookie']).to.match(/token=/);
  });

  it('❌ should return 400 if email or password is missing', async () => {
    const { req, res } = mockReqRes('POST', { email: '' });

    await handler(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res.jsonData.message).to.include('Email and Password are required');
  });

  it('🚫 should return 401 if credentials are invalid', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'wrong@example.com',
      password: 'wrong',
    });

    await handler(req, res);

    expect(res.statusCode).to.equal(401);
    expect(res.jsonData.message).to.include('Invalid Email or Password');
  });

  it('💥 should return 500 on internal error', async () => {
    const { req, res } = mockReqRes('POST', {
      email: 'test@example.com',
      password: 'pass123',
    });

    // Simulate an error
    const originalSign = (await import('jsonwebtoken')).default.sign;
    (await import('jsonwebtoken')).default.sign = () => {
      throw new Error('Simulated error');
    };

    await handler(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res.jsonData.message).to.include('Internal server error');

    // Restore the original function
    (await import('jsonwebtoken')).default.sign = originalSign;
  });
});
