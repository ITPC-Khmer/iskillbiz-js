const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { initDatabase, sequelize, Role, User } = require('../models');
const sessionStore = app.get('sessionStore');

const TEST_PHONE = '+19990000001';
const TEST_PASSWORD = 'Test@1234';

describe('Auth API', function() {
  this.timeout(15000);

  before(async () => {
    await initDatabase(sessionStore);
    await Role.findOrCreate({ where: { name: 'client' }, defaults: { description: 'Default client role' } });
  });

  after(async () => {
    await User.destroy({ where: { phone: TEST_PHONE } });
    await sequelize.close();
  });

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ phone: TEST_PHONE, password: TEST_PASSWORD, name: 'Test User' })
      .expect(201);

    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('user');
    expect(res.body.data.user).to.have.property('phone', TEST_PHONE);
    expect(res.body.data).to.have.property('token');
  });

  it('logs in an existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ phone: TEST_PHONE, password: TEST_PASSWORD })
      .expect(200);

    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('user');
    expect(res.body.data).to.have.property('token');
  });
});

