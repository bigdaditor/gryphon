const fastify = require('fastify')({ logger: true });
const fastifyJWT = require('@fastify/jwt');
const fastifyCors = require('@fastify/cors');
const axios = require('axios');

fastify.register(fastifyCors);
fastify.register(fastifyJWT, { secret: 'access-secret-key' });

// Access Token 검증 Hook
fastify.addHook('onRequest', async (request, reply) => {
  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return reply.status(401).send({ message: 'No token provided' });
  }

  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid or expired token' });
  }
});

// 리소스 서버에 프록시 요청
fastify.get('/api/protected-resource', async (request, reply) => {
  try {
    const token = request.headers['authorization'];
    const response = await axios.get('http://localhost:3002/protected-resource', {
      headers: { Authorization: token }
    });
    reply.send(response.data);
  } catch (error) {
    reply.status(502).send({ message: 'Failed to reach resource server' });
  }
});

// 서버 시작
fastify.listen({ port: 3003 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});