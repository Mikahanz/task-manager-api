const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const UserModel = require('../../src/models/userModel');
const TaskModel = require('../../src/models/taskModel');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'James',
  email: 'james@gmail.com',
  password: 'james12345',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Alex',
  email: 'alex@gmail.com',
  password: 'alex12345',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: '1. Task',
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: '2. Task',
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Third Task',
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  // clear existing user for 'signup user' test
  await UserModel.deleteMany();
  await TaskModel.deleteMany();

  // create new user for 'login user' test
  await new UserModel(userOne).save();

  // creat another user
  await new UserModel(userTwo).save();

  await new TaskModel(taskOne).save();

  await new TaskModel(taskTwo).save();
  await new TaskModel(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
};
