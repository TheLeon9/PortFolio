import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'testsecret';

const generateFakeToken = () => {
  const payload = { userId: 'fakeUserId', role: 'user' };
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

export default generateFakeToken;
