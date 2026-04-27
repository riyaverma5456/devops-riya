const request = require('supertest');
const app = require('../src/app');

describe('Dashboard API Endpoints', () => {
    it('should get current status (GET /api/status)', async () => {
        const res = await request(app).get('/api/status');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('temperature');
    });

    it('should increase temperature (POST /api/temperature)', async () => {
        const res = await request(app)
            .post('/api/temperature')
            .send({ action: 'increase' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('temperature');
    });

    it('should decrease temperature (POST /api/temperature)', async () => {
        const res = await request(app)
            .post('/api/temperature')
            .send({ action: 'decrease' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('temperature');
    });

    it('should toggle lights (POST /api/lights/toggle)', async () => {
        const res = await request(app).post('/api/lights/toggle');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('lightsOn');
    });

    it('should toggle security (POST /api/security/toggle)', async () => {
        const res = await request(app).post('/api/security/toggle');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('securityArmed');
    });

    it('should toggle media (POST /api/media/toggle)', async () => {
        const res = await request(app).post('/api/media/toggle');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('isPlaying');
    });

    it('should get all devices (GET /api/devices)', async () => {
        const res = await request(app).get('/api/devices');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should add a device (POST /api/devices)', async () => {
        const res = await request(app)
            .post('/api/devices')
            .send({ name: 'Smart Fan' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Smart Fan');
    });
});
