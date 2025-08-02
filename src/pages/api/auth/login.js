import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: '❌ Method Not Allowed' });
    }

    const { email, password } = req.body;

    const fakeUser = {
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD,
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: '❌ Email and Password are required' });
    }

    if (email === fakeUser.email && password === fakeUser.password) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600,
          path: '/',
          sameSite: 'lax',
        })
      );

      return res.status(200).json({ message: '✅ Login succeeded' });
    }

    return res.status(401).json({ message: '❌ Invalid Email or Password' });
  } catch (err) {
    return res.status(500).json({ message: '❌ Internal server error' });
  }
}
