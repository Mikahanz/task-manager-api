const mongoose = require('mongoose');

// Task Model
const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
      required: 'description is very required!',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
