const express = require('express');
require('./db/mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const UserModel = require('./models/userModel');
const TaskModel = require('./models/taskModel');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

// automatically parse JSON to Object
app.use(express.json());

// User Router
app.use(userRouter);

// Task Router
app.use(taskRouter);

module.exports = app;
