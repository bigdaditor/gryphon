const authController = require('../controllers/auth.controller');

async function authRoutes(fastify, options) {
  fastify.post('/signup', authController.signup);
  fastify.post('/login', authController.login);
  fastify.post('/logout', authController.logout);
  fastify.post('/refresh', authController.refresh);
}

module.exports = authRoutes;