import { setupTestApp, teardownTestApp, request, TestContext } from './test-utils';

describe('GuestsController (e2e)', () => {
  let ctx: TestContext;
  let reservationId: number;

  const auth = (t: TestContext) => ({ Authorization: `Bearer ${t.adminToken}` });
  const userAuth = (t: TestContext) => ({ Authorization: `Bearer ${t.userToken}` });

  beforeAll(async () => {
    ctx = await setupTestApp();

    const residentRes = await request(ctx.httpServer)
      .post('/api/residents')
      .set(auth(ctx))
      .send({
        name: 'Guest Test Resident',
        phone: '3333333333',
        address: 'Building 3',
        email: 'guesttest@example.com',
      });

    const reservationRes = await request(ctx.httpServer)
      .post('/api/reservations')
      .set(auth(ctx))
      .send({
        residentId: residentRes.body.id,
        date: '2026-12-01',
        notes: 'Guest test party',
      });

    reservationId = reservationRes.body.id;
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  describe('POST /api/guests', () => {
    it('should create a guest successfully', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({
          reservationId,
          name: 'John Doe',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.reservationId).toBe(reservationId);
      expect(res.body.isPresent).toBe(false);
    });

    it('should reject missing name', async () => {
      await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId })
        .expect(400);
    });

    it('should reject missing reservationId', async () => {
      await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ name: 'No Reservation' })
        .expect(400);
    });

    it('should reject non-admin user', async () => {
      await request(ctx.httpServer)
        .post('/api/guests')
        .set(userAuth(ctx))
        .send({ reservationId, name: 'Hacker' })
        .expect(403);
    });
  });

  describe('GET /api/guests/reservation/:reservationId', () => {
    beforeAll(async () => {
      await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId, name: 'Alice' });
      await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId, name: 'Bob' });
    });

    it('should return all guests for a reservation', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/guests/reservation/${reservationId}`)
        .set(auth(ctx))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should be accessible by regular user', async () => {
      const res = await request(ctx.httpServer)
        .get(`/api/guests/reservation/${reservationId}`)
        .set(userAuth(ctx))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array for reservation with no guests', async () => {
      const newRes = await request(ctx.httpServer)
        .post('/api/reservations')
        .set(auth(ctx))
        .send({
          residentId: 1,
          date: '2026-12-15',
        });

      const res = await request(ctx.httpServer)
        .get(`/api/guests/reservation/${newRes.body.id}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('PATCH /api/guests/:id', () => {
    let guestId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId, name: 'Charlie' });
      guestId = res.body.id;
    });

    it('should update guest name', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(auth(ctx))
        .send({ name: 'Charlie Updated' })
        .expect(200);

      expect(res.body.name).toBe('Charlie Updated');
    });

    it('should mark guest as present', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(auth(ctx))
        .send({ isPresent: true })
        .expect(200);

      expect(res.body.isPresent).toBe(true);
    });

    it('should mark guest as not present', async () => {
      const res = await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(auth(ctx))
        .send({ isPresent: false })
        .expect(200);

      expect(res.body.isPresent).toBe(false);
    });

    it('should reject non-admin user', async () => {
      await request(ctx.httpServer)
        .patch(`/api/guests/${guestId}`)
        .set(userAuth(ctx))
        .send({ name: 'Hack' })
        .expect(403);
    });
  });

  describe('DELETE /api/guests/:id', () => {
    let guestId: number;

    beforeAll(async () => {
      const res = await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId, name: 'Delete Me' });
      guestId = res.body.id;
    });

    it('should delete a guest', async () => {
      await request(ctx.httpServer)
        .delete(`/api/guests/${guestId}`)
        .set(auth(ctx))
        .expect(200);

      const res = await request(ctx.httpServer)
        .get(`/api/guests/reservation/${reservationId}`)
        .set(auth(ctx))
        .expect(200);

      expect(res.body.find((g: any) => g.id === guestId)).toBeUndefined();
    });

    it('should reject non-admin user', async () => {
      const res = await request(ctx.httpServer)
        .post('/api/guests')
        .set(auth(ctx))
        .send({ reservationId, name: 'Auth Check' });

      await request(ctx.httpServer)
        .delete(`/api/guests/${res.body.id}`)
        .set(userAuth(ctx))
        .expect(403);
    });

    it('should return 404 for non-existent guest', async () => {
      await request(ctx.httpServer)
        .delete('/api/guests/99999')
        .set(auth(ctx))
        .expect(404);
    });

  });
});
