const bcrypt = require('bcrypt');

// In-memory user storage (can later replace with Redis or DB)
const users = new Map();

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

  const token = await reply.jwtSign({ email },{expiresIn: '1h'});
  // Save token to Redis here if needed (stub)
  return reply.send({ token });
}

// POST /logout
async function logout(request, reply) {
  // Token invalidation logic (if storing in Redis, delete it)
  return reply.send({ message: 'Logged out successfully (stub)' });
}

module.exports = {
  signup,
  login,
  logout,
};
