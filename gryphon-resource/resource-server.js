const fastify = require('fastify')({ logger: true });
const fastifyJWT = require('@fastify/jwt');
const fastifyCors = require('@fastify/cors');

// JWT 비밀키는 인증서버와 동일하게 설정해야 함
fastify.register(fastifyCors);
fastify.register(fastifyJWT, { secret: 'access-secret-key' });

// JWT 토큰 검증 미들웨어
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

// 보호된 리소스 엔드포인트
fastify.get('/protected-resource', async (request, reply) => {
  const clientId = request.user.client_id;
  return { message: `Hello, ${clientId}. This is a protected resource.` };
});

// 서버 시작
fastify.listen({ port: 3002 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});