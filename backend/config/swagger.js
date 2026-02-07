const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'eStore API',
            version: '1.0.0',
            description: 'API documentation for eStore E-commerce Application',
            contact: {
                name: 'API Support',
                email: 'support@estore.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server'
            },
            {
                url: 'https://estore-api.up.railway.app',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js', './models/*.js'], // Files containing annotations
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
