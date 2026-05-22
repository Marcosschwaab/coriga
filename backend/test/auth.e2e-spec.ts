import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('AuthController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@test.com', password: 'pass123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.username).toBe('newuser');
      expect(res.body.user.role).toBe('user');
    });

    it('should register a new admin', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'newadmin', email: 'admin2@test.com', password: 'pass123', role: 'admin' })
        .expect(201);

      expect(res.body.user.role).toBe('admin');
    });

    it('should reject duplicate username', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'dupuser', email: 'dup1@test.com', password: 'pass123' })
        .expect(201);

      await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'dupuser', email: 'dup2@test.com', password: 'pass123' })
        .expect(409);
    });

    it('should reject duplicate email', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'unique1', email: 'dupmail@test.com', password: 'pass123' })
        .expect(201);

      await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ username: 'unique2', email: 'dupmail@test.com', password: 'pass123' })
        .expect(409);
    });

    it('should reject missing username', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/register')
        .send({ email: 'x@test.com', password: 'pass123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login admin successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user.username).toBe('admin');
    });

    it('should login user successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({ username: 'user', password: 'user123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.role).toBe('user');
    });

    it('should reject wrong password', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpass' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({ username: 'nobody', password: 'pass123' })
        .expect(401);
    });

    it('should reject empty fields', async () => {
      await request(ctx.httpServer)
        .post('/api/auth/login')
        .send({ username: '', password: '' })
        .expect(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile with valid admin token', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${ctx.adminToken}`)
        .expect(200);

      expect(res.body.username).toBe('admin');
      expect(res.body.role).toBe('admin');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return profile with valid user token', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${ctx.userToken}`)
        .expect(200);

      expect(res.body.username).toBe('user');
      expect(res.body.role).toBe('user');
    });

    it('should reject request without token', async () => {
      await request(ctx.httpServer)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(ctx.httpServer)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject request with malformed auth header', async () => {
      await request(ctx.httpServer)
        .get('/api/auth/profile')
        .set('Authorization', 'Invalid')
        .expect(401);
    });
  });

  describe('Role-based access control', () => {
    it('should allow admin to access dashboard', async () => {
      await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${ctx.adminToken}`)
        .expect(200);
    });

    it('should deny user from accessing dashboard', async () => {
      await request(ctx.httpServer)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${ctx.userToken}`)
        .expect(403);
    });

    it('should allow user to view reservations', async () => {
      await request(ctx.httpServer)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${ctx.userToken}`)
        .expect(200);
    });

    it('should deny user from creating reservations', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${ctx.userToken}`)
        .send({ residentId: 1, date: '2026-12-01' })
        .expect(403);
    });

    it('should deny user from updating pricing', async () => {
      await request(ctx.httpServer)
        .patch('/api/pricing-config')
        .set('Authorization', `Bearer ${ctx.userToken}`)
        .send({ weekdayPrice: 200 })
        .expect(403);
    });

    it('should deny unauthenticated requests', async () => {
      await request(ctx.httpServer)
        .get('/api/residents')
        .expect(401);
    });
  });
});
