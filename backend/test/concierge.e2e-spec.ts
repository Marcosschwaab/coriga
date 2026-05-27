import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('Concierge Role (e2e)', () => {
  let ctx: TestContext;

  const concierge = (t: TestContext) => ({ Authorization: `Bearer ${t.conciergeToken}` });
  const admin = (t: TestContext) => ({ Authorization: `Bearer ${t.adminToken}` });

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('Packages - full CRUD access', () => {
    let recipientId: number;
    let packageId: number;

    it('POST /api/packages/recipients - should create recipient', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/packages/recipients')
        .set(concierge(ctx))
        .send({ nome: 'Concierge Test', endereco: 'Rua A', cep: '12345678', cidade: 'City', bairro: 'Centro' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      recipientId = res.body.id;
    });

    it('GET /api/packages/recipients - should list recipients', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/packages/recipients')
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/packages/recipients/:id - should update recipient', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/packages/recipients/${recipientId}`)
        .set(concierge(ctx))
        .send({ nome: 'Concierge Updated' })
        .expect(200);

      expect(res.body.nome).toBe('Concierge Updated');
    });

    it('POST /api/packages - should create package order', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/packages')
        .set(concierge(ctx))
        .send({ codigoRastreio: 'BR123456789BR', recipientId, dataRecebimento: '2026-06-01' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      packageId = res.body.id;
    });

    it('GET /api/packages - should list packages', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/packages')
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/packages/:id - should get package by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/packages/${packageId}`)
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.id).toBe(packageId);
    });

    it('PATCH /api/packages/:id - should update package', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/packages/${packageId}`)
        .set(concierge(ctx))
        .send({ codigoRastreio: 'BR987654321BR' })
        .expect(200);

      expect(res.body.codigoRastreio).toBe('BR987654321BR');
    });

    it('DELETE /api/packages/:id - should delete package order first', async () => {
      await request(ctx.httpServer)
        .delete(`/api/packages/${packageId}`)
        .set(concierge(ctx))
        .expect(200);
    });

    it('DELETE /api/packages/recipients/:id - should delete recipient', async () => {
      await request(ctx.httpServer)
        .delete(`/api/packages/recipients/${recipientId}`)
        .set(concierge(ctx))
        .expect(200);
    });

    it('should reject concierge creating package without auth', async () => {
      await request(ctx.httpServer)
        .post('/api/packages')
        .send({ codigoRastreio: 'BR000000000BR', recipientId: 1, dataRecebimento: '2026-06-01' })
        .expect(401);
    });
  });

  describe('Guests - full CRUD access', () => {
    let residentId: number;
    let reservationId: number;
    let guestId: number;

    beforeAll(async () => {
      const residentRes = await request(ctx.httpServer)
        .post('/api/residents')
        .set(admin(ctx))
        .send({ name: 'Concierge Guest Test', phone: '4444444444', address: 'Building 4', email: 'conciergeguest@test.com' });
      residentId = residentRes.body.id;

      const reservationRes = await request(ctx.httpServer)
        .post('/api/reservations')
        .set(admin(ctx))
        .send({ residentId, date: '2026-12-10' });
      reservationId = reservationRes.body.id;
    });

    it('POST /api/guests - should create guest', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/guests')
        .set(concierge(ctx))
        .send({ reservationId, name: 'Concierge Guest' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Concierge Guest');
      guestId = res.body.id;
    });

    it('GET /api/guests/reservation/:reservationId - should list guests', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/guests/reservation/${reservationId}`)
        .set(concierge(ctx))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/guests/:id - should mark guest as present', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(concierge(ctx))
        .send({ isPresent: true })
        .expect(200);

      expect(res.body.isPresent).toBe(true);
    });

    it('PATCH /api/guests/:id - should update guest name', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(concierge(ctx))
        .send({ name: 'Concierge Guest Updated' })
        .expect(200);

      expect(res.body.name).toBe('Concierge Guest Updated');
    });

    it('DELETE /api/guests/:id - should delete guest', async () => {
      await request(ctx.httpServer)
        .delete(`/api/guests/${guestId}`)
        .set(concierge(ctx))
        .expect(200);
    });

    it('should reject guest creation without auth', async () => {
      await request(ctx.httpServer)
        .post('/api/guests')
        .send({ reservationId, name: 'No Auth' })
        .expect(401);
    });
  });

  describe('Reservations - read-only access', () => {
    let reservationId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/reservations')
        .set(admin(ctx))
        .send({ residentId: 1, date: '2026-12-20' });
      reservationId = res.body.id;
    });

    it('GET /api/reservations - should list reservations', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/reservations')
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/reservations/:id - should get reservation by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/reservations/${reservationId}`)
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.id).toBe(reservationId);
    });

    it('POST /api/reservations - should reject create', async () => {
      await request(ctx.httpServer)
        .post('/api/reservations')
        .set(concierge(ctx))
        .send({ residentId: 1, date: '2026-12-25' })
        .expect(403);
    });

    it('PATCH /api/reservations/:id - should reject update', async () => {
      await request(ctx.httpServer)
        .patch(`/api/reservations/${reservationId}`)
        .set(concierge(ctx))
        .send({ notes: 'Hacked' })
        .expect(403);
    });

    it('POST /api/reservations/:id/cancel - should reject cancel', async () => {
      await request(ctx.httpServer)
        .post(`/api/reservations/${reservationId}/cancel`)
        .set(concierge(ctx))
        .expect(403);
    });

    it('DELETE /api/reservations/:id - should reject delete', async () => {
      await request(ctx.httpServer)
        .delete(`/api/reservations/${reservationId}`)
        .set(concierge(ctx))
        .expect(403);
    });
  });

  describe('Residents - read-only access', () => {
    let residentId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/residents')
        .set(admin(ctx))
        .send({ name: 'Readonly Resident', phone: '5555555555', address: 'Building 5', email: 'readonly@test.com' });
      residentId = res.body.id;
    });

    it('GET /api/residents - should list residents', async () => {
      const res = await request(ctx.httpServer)
        .get('/api/residents')
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/residents/:id - should get resident by id', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/residents/${residentId}`)
        .set(concierge(ctx))
        .expect(200);

      expect(res.body.id).toBe(residentId);
    });

    it('POST /api/residents - should reject create', async () => {
      await request(ctx.httpServer)
        .post('/api/residents')
        .set(concierge(ctx))
        .send({ name: 'Hacker', phone: '0000000000', address: 'Nowhere', email: 'hack@test.com' })
        .expect(403);
    });

    it('PATCH /api/residents/:id - should reject update', async () => {
      await request(ctx.httpServer)
        .patch(`/api/residents/${residentId}`)
        .set(concierge(ctx))
        .send({ name: 'Hacked' })
        .expect(403);
    });

    it('DELETE /api/residents/:id - should reject delete', async () => {
      await request(ctx.httpServer)
        .delete(`/api/residents/${residentId}`)
        .set(concierge(ctx))
        .expect(403);
    });
  });
});
