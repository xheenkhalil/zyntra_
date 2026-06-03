"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Zyntra Exams API',
            version: '1.0.0',
            description: 'API documentation for Zyntra Exams backend',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local server',
            },
            {
                url: 'https://zyntraexams.onrender.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    apis: [path_1.default.join(__dirname, './routes/*.ts'), path_1.default.join(__dirname, './routes/*.js')],
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
