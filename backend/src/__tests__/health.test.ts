import request from 'supertest';
import app from '../index'; // Import the Express app

describe('Health Check API', () => {
  it('should return 200 and a success message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('ZyntraExams Backend');
  });
});
