const fastify = require('fastify')({ logger: true });
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const fastifyJwt = require('fastify-jwt');
const fastifyRedis = require('fastify-redis');
const bcrypt = require("bcrypt");

dotenv.config();

// Register plugins
fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });
fastify.register(fastifyRedis, { host: process.env.REDIS_HOST || '127.0.0.1' });

// Register routes
fastify.register(authRoutes, { prefix: '/auth' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000 });
    fastify.log.info(`Server is running at http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();