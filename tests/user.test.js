const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/models/userModel');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

// Execute this method before each test
beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Michael',
      email: 'michael@gmail.com',
      password: 'michael12345',
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await UserModel.findById(response.body.user._id);

  expect(user).not.toBeNull();

  // Assertions about the response body
  expect(response.body).toMatchObject({
    user: {
      name: 'Michael',
      email: 'michael@gmail.com',
    },

    token: user.tokens[0].token,
  });

  // Assert that the password is encrypted
  expect(user.password).not.toBe('michael12345');
});

test('Should not signup user with invalid name/email/password', async () => {
  // Test Name
  await request(app)
    .post('/users')
    .send({
      email: 'lana@gmail.com',
      age: 23,
      password: 'lana12345',
    })
    .expect(400);

  // Test Email
  await request(app)
    .post('/users')
    .send({
      name: 'Lana',
      email: 'lanagmail.com',
      age: 23,
      password: 'lana12345',
    })
    .expect(400);

  // Password
  await request(app)
    .post('/users')
    .send({
      name: 'Lana',
      email: 'lana@gmail.com',
      age: 23,
      password: 'lana',
    })
    .expect(400);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Verify new token is saved in the database
  const user = await UserModel.findById(userOneId);

  expect(user).not.toBeNull();

  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not update user if unauthenticated', async () => {
  const response = await request(app)
    .patch('/user/me')
    //.set('Authorization', `Bearer ${userOne.tokens[0].token}`) // This test will fail if uncommented
    .send({
      name: 'Lanax',
      email: 'lanax@gmail.com',
      age: 23,
      password: 'lanax12345',
    })
    .expect(401);
});

test('Should not update user with invalid name/email/password', async () => {
  // Test Name
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: '',
      email: 'lana@gmail.com',
      age: 23,
      password: 'lana12345',
    })
    .expect(400);

  // Test Email
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Lana',
      email: 'lanagmail.com',
      age: 23,
      password: 'lana12345',
    })
    .expect(400);

  // Password
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Lana',
      email: 'lana@gmail.com',
      age: 23,
      password: 'lana',
    })
    .expect(400);
});

test('Should not login noneexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'james@gmail.com',
      password: 'jame12345',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  const response = await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Verify user is removed
  const user = await UserModel.findById(userOneId);
  expect(user).toBeNull;
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/user/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await UserModel.findById(userOneId);
  // validate data has been uploaded
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  const response = await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Jamiex',
    })
    .expect(200);

  // validate name has been changed
  expect(response.body.name).toBe('Jamiex');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Montreal',
    })
    .expect(400);
});
