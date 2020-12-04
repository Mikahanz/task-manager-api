const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TaskModel = require('./taskModel');

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'Name is required!',
      trim: true,
    },
    email: {
      type: String,
      required: 'Email is required!',
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        const isValid = validator.isEmail(value);

        if (!isValid) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (validator.contains(value, 'password')) {
          throw new Error('Password cannot contain the word "password"!');
        }

        if (!validator.isByteLength(value, { min: 6 })) {
          throw new Error('Password has to be more than 6 characters!');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------------------------------------------

// Virtual attributes for relationship with Task collection
userSchema.virtual('tasks', {
  ref: 'Task', // Refference to Task Model
  localField: '_id', // _id field on the User Collection
  foreignField: 'owner', // owner field on the Task collection
});

// -------------------------------------------------

// Hide private data
// When res.send({user}) is called from user.js,
// by default it converts it to JSON
// this method is being called
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // Exclude these attributes when fetch data
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// -----------------------------------------------------------

// Generate JWT
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  //console.log(`From generateAuthTokenMethod -> ${user._id}`);

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  // Merge a new token to the tokens array
  user.tokens = user.tokens.concat({ token: token });

  await user.save();

  return token;
};

// ------------------------------------------------------------

//Verify Credential
userSchema.statics.findByCredentials = async (email, password) => {
  // Find user with the provided email
  const user = await UserModel.findOne({ email });

  // Verify if user exists
  if (!user) {
    throw 'Unable to login!';
  }

  // Verify Password using bcrypt.compare
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw 'Unable to login!';
  }

  return user;
};

// -------------------------------------------------------------

// Middleware - Encrypt password before saving or updating user (for: Create & Update)
userSchema.pre('save', async function (next) {
  const user = this;

  // Verify if new password provided
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// --------------------------------------------------------------

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;

  await TaskModel.deleteMany({ owner: user._id });

  next();
});

// --------------------------------------------------------------

// User Model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
