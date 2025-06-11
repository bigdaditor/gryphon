const bcrypt = require('bcrypt');

// POST /signup
async function signup(request, reply) {
  const { email, password } = request.body;
  const existingUser = await request.server.redis.get(`user:${email}`);
  if (existingUser) {
    return reply.status(400).send({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await request.server.redis.set(`user:${email}`, JSON.stringify({ email, password: hashedPassword }));
  const keys = await request.server.redis.keys('user:*');
  const users = await Promise.all(keys.map(async (key) => {
    const value = await request.server.redis.get(key);
    return JSON.parse(value);
  }));
  console.log('Current users:', users);
  return reply.send({ message: 'User registered successfully' });
}

// POST /login
async function login(request, reply) {
  const { email, password } = request.body;
  const userData = await request.server.redis.get(`user:${email}`);
  if (!userData) {
    return reply.status(401).send({ message: 'Invalid email or password' });
  }
  const user = JSON.parse(userData);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return reply.status(401).send({ message: 'Invalid email or password' });
  }

  const accessToken = await reply.jwtSign({ email }, { expiresIn: '1h' });
  const refreshToken = await reply.jwtSign({ email }, { expiresIn: '7d' });

  await request.server.redis.hset(`tokens:${email}`, 'access', accessToken, 'refresh', refreshToken);
  await request.server.redis.expire(`tokens:${email}`, 7 * 24 * 60 * 60);
  return reply.send({ accessToken, refreshToken });
}

// POST /logout
async function logout(request, reply) {
  const { email } = request.body;
  await request.server.redis.del(`tokens:${email}`);
  return reply.send({ message: 'Logged out successfully' });
}

// POST /refresh
async function refresh(request, reply) {
  const { email, refreshToken } = request.body;
  const storedToken = await request.server.redis.hget(`tokens:${email}`, 'refresh');
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
