import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export function withAdminAuth(gssp = () => ({ props: {} })) {
  return async (context) => {
    const { req } = context;

    try {
      const { JWT_SECRET } = process.env;

      if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET');
      }

      const cookies = cookie.parse(req?.headers?.cookie || '');
      const token = cookies.token;

      if (!token) throw new Error('Token not found');

      jwt.verify(token, JWT_SECRET);

      return await gssp(context);
    } catch (err) {
      console.error('❌ Auth error in withAdminAuth:', err.message || err);
      return {
        redirect: {
          destination: '/admin',
          permanent: false,
        },
      };
    }
  };
}
