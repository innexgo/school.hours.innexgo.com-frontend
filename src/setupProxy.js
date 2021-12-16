const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8079',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/innexgo_hours',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8080',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api/innexgo_hours': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/cnc',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8078',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
};
