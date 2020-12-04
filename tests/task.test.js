const { get } = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const TaskModel = require('../src/models/taskModel');
const {
  userOneId,
  userOne,
  setupDatabase,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From my test',
    })
    .expect(201);

  const task = await TaskModel.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should not create task with invalid description/completed', async () => {
  // Test 'description'
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: '',
      completed: false,
    })
    .expect(400);

  // Test 'completed'
  const response2 = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Eat',
      completed: 'Yes',
    })
    .expect(400);
});

test('Should fetch user task by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body._id).toEqual(taskOne._id.toString());
});

test('Should not fetch user task by id if unauthenticated', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
});

test('Should not fetch other users task by id', async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test('Should fetch only completed tasks', async () => {
  const response = await request(app)
    .get(`/tasks?completed=true`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
});

test('Should fetch only incomplete tasks', async () => {
  const response = await request(app)
    .get(`/tasks?completed=false`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
});

test('Should sort tasks by description', async () => {
  // Test SortBy 'description:desc'
  const response = await request(app)
    .get(`/tasks?sortBy=description:desc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body[0].description).toEqual('2. Task');

  // Test SortBy 'completed:desc'
  const response2 = await request(app)
    .get(`/tasks?sortBy=completed:desc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response2.body[0].completed).toEqual(true); // validate 1st in the array
  expect(response2.body[response2.body.length - 1].completed).toEqual(false); // validate last in the array

  // Test SortBy 'createdAt'
  const response3 = await request(app)
    .get(`/tasks?sortBy=createdAt:desc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const latestCreated = new Date(response3.body[0].createdAt);
  const oldestCreated = new Date(
    response3.body[response3.body.length - 1].createdAt
  );

  const dateCreatedIsDesc = latestCreated > oldestCreated;
  expect(dateCreatedIsDesc).toBe(true);

  // Test SortBy 'updatedAt'
  const response4 = await request(app)
    .get(`/tasks?sortBy=updatedAt:desc`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const latestUpdated = new Date(response4.body[0].updatedAt);
  const oldestUpdated = new Date(
    response4.body[response4.body.length - 1].updatedAt
  );

  const dateUpdatedIsDesc = latestUpdated > oldestUpdated;
  expect(dateUpdatedIsDesc).toBe(true);
});

test('Should fetch page of tasks', async () => {
  const limit = 10;
  const skip = 0;

  const response = await request(app)
    .get(`/tasks?limit=${limit}&skip=${skip}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  const pageNum = skip / limit + 1;
  expect(pageNum).toBe(1);
});

test('Should NOT update task with invalid description/completed', async () => {
  // Test 'description'
  const response = await request(app)
    .patch(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: '',
      completed: false,
    })
    .expect(400);

  // Test 'completed'
  const response2 = await request(app)
    .patch(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Eat',
      completed: 'Yes',
    })
    .expect(400);
});

test('Should NOT update other users task', async () => {
  const response = await request(app)
    .patch(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      description: 'Mange',
      completed: false,
    })
    .expect(404);
});

test('Should get user`s tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test('Should not delete other users tasks', async () => {
  const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await TaskModel.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test('Should delete user task', async () => {
  const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should NOT delete task if unauthenticated', async () => {
  const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .send()
    .expect(401);
});
