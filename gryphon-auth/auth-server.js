const fastify = require('fastify')({ logger: true });
const fastifyJWT = require('@fastify/jwt');
const fastifyCors = require('@fastify/cors');

fastify.register(fastifyCors);
fastify.register(fastifyJWT, { secret: 'access-secret-key' });

// In-memory storage for simplicity
const clients = {
  'gryphon-client': {
    client_id: 'gryphon-client',
    client_secret: 'gryphon-secret',
    redirect_uri: 'http://localhost:3004/callback'
  }
};

const authorizationCodes = new Map();
const accessTokens = new Map();

// Step 1: Authorize (simulate login + consent)
fastify.get('/authorize', async (request, reply) => {
  const { client_id, redirect_uri } = request.query;

  const client = clients[client_id];
  if (!client || client.redirect_uri !== redirect_uri) {
    return reply.status(400).send({ error: 'Invalid client or redirect_uri' });
  }

  // Simulate user approval and return authorization code
  const code = Math.random().toString(36).substring(2, 15);
  authorizationCodes.set(code, client_id);

  reply.redirect(`${redirect_uri}?code=${code}`);
});

// Step 2: Exchange code for token
fastify.post('/token', async (request, reply) => {
  const { code, client_id, client_secret, redirect_uri } = request.body;

  const client = clients[client_id];
  if (!client || client.client_secret !== client_secret || client.redirect_uri !== redirect_uri) {
    return reply.status(400).send({ error: 'Invalid client credentials or redirect_uri' });
  }

  if (!authorizationCodes.has(code)) {
    return reply.status(400).send({ error: 'Invalid authorization code' });
  }

  authorizationCodes.delete(code);

  const accessToken = fastify.jwt.sign({ client_id }, { expiresIn: '1h' });
  const refreshToken = fastify.jwt.sign({ client_id }, { expiresIn: '7d' });

  accessTokens.set(accessToken, client_id);

  reply.send({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 3600
  });
});

// Step 3: Refresh token endpoint
fastify.post('/refresh', async (request, reply) => {
  const { refresh_token } = request.body;
  try {
    const decoded = fastify.jwt.verify(refresh_token);
    const newAccessToken = fastify.jwt.sign({ client_id: decoded.client_id }, { expiresIn: '1h' });
    reply.send({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 3600
    });
  } catch (err) {
    reply.status(401).send({ error: 'Invalid or expired refresh token' });
  }
});

fastify.listen({ port: 3001 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});