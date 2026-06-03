"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index")); // Import the Express app
describe('Health Check API', () => {
    it('should return 200 and a success message', async () => {
        const response = await (0, supertest_1.default)(index_1.default).get('/');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toContain('ZyntraExams Backend');
    });
});
