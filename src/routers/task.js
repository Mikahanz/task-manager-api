const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const TaskModel = require('../models/taskModel');
const auth = require('../middleware/auth');
const router = new express.Router();

router.get('/testtask', (req, res) => {
  res.send('this test task file');
});

//// END POINT FOR TASK ////

// Create Task
router.post('/tasks', auth, async (req, res) => {
  const task = new TaskModel({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//--------------------------------------------

// Read all tasks = /tasks
// Read Filter Tasks = /tasks?completed=true
// Read Pagination Tasks = /tasks?limit=5&skip=0 -->> page# = skip/limit + 1
// Read Sorting Task = /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  // Verify if client provides query "completed"
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'; // ternary
  }

  // Verify if client provides query "sortBy"
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; // ternary
  }

  try {
    // get tasks that belongs to authenticated user
    // const tasks = await TaskModel.find({ owner: req.user._id });

    // get tasks that are belong to this user
    await req.user
      .populate({
        path: 'tasks',
        match: match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort: sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//--------------------------------------------

// Read Task by Id
router.get('/tasks/:id', auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Id Format!' });
  }

  const _id = req.params.id;

  try {
    const task = await TaskModel.findOne({ _id: _id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ error: 'Task no found!' });
    }

    res.status(200).send(task);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// Update Task

router.patch('/task/:id', auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Id Format!' });
  }

  // Verify if the request attributes exist in the Task attribute Collection
  const taskUpdates = Object.keys(req.body);
  const taskFields = ['description', 'completed'];
  const isValidTaskField = taskUpdates.every((update) =>
    taskFields.includes(update)
  );

  // if not valid, Throw an error!
  if (!isValidTaskField) {
    return res
      .status(400)
      .send({ error: `Only Fields: (${taskFields}) are accepted!` });
  }

  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: `Task Not Found!` });
    }

    taskUpdates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    return res.status(200).send(task);
  } catch (e) {
    return res.status(400).send({ error: e });
  }
});

// Delete Task

router.delete('/task/:id', auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalide Id Format!' });
  }

  try {
    const task = await TaskModel.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task Not Found!' });
    }

    res.status(200).send(task);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//--------------------------------------------

module.exports = router;
