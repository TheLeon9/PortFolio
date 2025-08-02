import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export function withAuth(handler) {
  return async (req, res) => {
    const cookies = cookie.parse(req?.headers?.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: '❌ Unauthorized: Token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ message: '❌ Invalid or expired token' });
    }
  };
}
