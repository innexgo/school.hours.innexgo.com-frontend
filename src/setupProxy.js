const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:8079',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/innexgo_hours',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api/innexgo_hours': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/cnc',
    createProxyMiddleware({
      target: 'http://localhost:8078',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
};
