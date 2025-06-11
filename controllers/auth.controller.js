const bcrypt = require('bcrypt');

// In-memory user storage (can later replace with Redis or DB)
const users = new Map();

// In-memory refresh token storage for demonstration purposes.
// In production, store in Redis or a database.
const refreshTokenStore = new Map(); // In-memory refresh token storage

// POST /signup
async function signup(request, reply) {
  const { email, password } = request.body;
  if (users.has(email)) {
    return reply.status(400).send({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { email, password: hashedPassword });
  return reply.send({ message: 'User registered successfully' });
}

// POST /login
async function login(request, reply) {
  const { email, password } = request.body;
  const user = users.get(email);

  if (!user) {
    return reply.status(401).send({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return reply.status(401).send({ message: 'Invalid email or password' });
  }

  const accessToken = await reply.jwtSign({ email }, { expiresIn: '15m' });
  const refreshToken = await reply.jwtSign({ email }, { expiresIn: '7d' });

  refreshTokenStore.set(email, refreshToken);

  return reply.send({ accessToken, refreshToken });
}

// POST /logout
async function logout(request, reply) {
  const { email } = request.body;
  refreshTokenStore.delete(email);
  return reply.send({ message: 'Logged out successfully' });
}

// POST /refresh
async function refresh(request, reply) {
  const { email, refreshToken } = request.body;

  const storedToken = refreshTokenStore.get(email);
  if (!storedToken || storedToken !== refreshToken) {
    return reply.status(401).send({ message: 'Invalid refresh token' });
  }

  try {
    await request.jwtVerify(refreshToken); // verify validity
    const newAccessToken = await reply.jwtSign({ email }, { expiresIn: '15m' });
    return reply.send({ accessToken: newAccessToken });
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid or expired refresh token' });
  }
}

module.exports = {
  signup,
  login,
  logout,
  refresh,
};
