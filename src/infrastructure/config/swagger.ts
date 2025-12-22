import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Gestión de Envíos',
    version: '1.0.0',
    description: 'API REST para gestión de envíos, usuarios, ubicaciones, tarifas y seguimiento de estado',
    contact: {
      name: 'Soporte API',
      email: 'soporte@envios.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string',
            example: 'Descripción del error'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            example: 'Juan Pérez'
          },
          email: {
            type: 'string',
            example: 'juan@example.com'
          }
        }
      },
      Location: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          code: {
            type: 'string',
            example: 'MX-CDMX'
          },
          name: {
            type: 'string',
            example: 'Ciudad de México'
          }
        }
      },
      Shipment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          userId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          originId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          destinationId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          weight: {
            type: 'number',
            example: 5.5
          },
          status: {
            type: 'string',
            example: 'en_transito'
          }
        }
      }
    }
  },
  security: []
};

const options = {
  swaggerDefinition,
  apis: [
    './src/interface/routes/*.ts',
    './src/interface/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
