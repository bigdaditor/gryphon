const fastify = require('fastify')({ logger: true });
const fastifyFormbody = require('@fastify/formbody');
const axios = require('axios');

fastify.register(fastifyFormbody);

const CLIENT_ID = 'gryphon-client';
const CLIENT_SECRET = 'gryphon-secret';
const REDIRECT_URI = 'http://localhost:3004/callback';

// Step 1: 클라이언트 시작점 - 인가 요청
fastify.get('/login', async (request, reply) => {
  const authUrl = `http://localhost:3001/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  reply.redirect(authUrl);
});

// Step 2: 리디렉션 URI - 인가 코드 수신 및 토큰 요청
fastify.get('/callback', async (request, reply) => {
  const code = request.query.code;

  if (!code) {
    return reply.status(400).send({ error: 'Authorization code not provided' });
  }

  try {
    const tokenRes = await axios.post('http://localhost:3001/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    });
    reply.send(tokenRes.data);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Failed to retrieve access token' });
  }
});

// 서버 시작
fastify.listen({ port: 3004 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});