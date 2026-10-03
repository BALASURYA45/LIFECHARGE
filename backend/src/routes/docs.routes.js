import { Router } from 'express';

const router = Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LifeCharge API Specification',
    version: '1.0.0',
    description: 'AI-Based Battery Health Prediction & Predictive Maintenance System for Electric Vehicles',
  },
  servers: [
    {
      url: '/api',
      description: 'Main API Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check API Health',
        responses: {
          '200': { description: 'System healthy' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User Authentication',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
        },
      },
    },
    '/predict': {
      post: {
        summary: 'Generate SOH and RUL Prediction',
        responses: {
          '200': { description: 'Prediction generated' },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        summary: 'Get Dashboard Analytics Summary',
        responses: {
          '200': { description: 'Analytics payload' },
        },
      },
    },
    '/digital-twin': {
      get: {
        summary: 'Get Battery Digital Twin State',
        responses: {
          '200': { description: 'Digital Twin realtime state' },
        },
      },
    },
  },
};

router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

router.get('/docs', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LifeCharge API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
      });
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
