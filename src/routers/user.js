const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const UserModel = require('../models/userModel');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

//// END POINT FOR USER ////

// Create User / Sign Up User
router.post('/users', async (req, res) => {
  const user = new UserModel(req.body);

  try {
    // With Async / Await, if result returns a reject, the process stop and throws an error
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token }); // By default user object is coverted to JSON
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//--------------------------------------------

// Logout User
router.post('/users/logout', auth, async (req, res) => {
  try {
    // Remove user's token used
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).json({ error: 'Logout a User Failed!' });
  }
});

// -------------------------------------------

// Logout All Users
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.status(200).send();
  } catch (e) {
    res.status(500).json({ error: 'Logout All Users Failed!' });
  }
});

// -------------------------------------------

// Login User
router.post('/users/login', async (req, res) => {
  try {
    const user = await UserModel.findByCredentials(
      req.body.email,
      req.body.password
    );

    // Get Token
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

// ---------------------------------------------

// Read User Profile
router.get('/users/me', auth, async (req, res) => {
  res.status(200).send(req.user);
});

// ----------------------------------------------

// Update User

router.patch('/user/me', auth, async (req, res) => {
  // validate if field provided is exist
  const updates = Object.keys(req.body); // get the field name

  const userFields = ['name', 'email', 'password', 'age'];

  const isValidUserField = updates.every((update) =>
    userFields.includes(update)
  );

  if (!isValidUserField) {
    return res
      .status(400)
      .send({ error: `Only Fields: (${userFields}) are accepted!` });
  }

  try {
    //// assigning user properties with update properties provided
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send({ error: e });
  }
});

// ---------------------------------------------------

// Delete User

router.delete('/user/me', auth, async (req, res) => {
  if (!ObjectId.isValid(req.user._id)) {
    return res.status(400).json({ error: 'Invalid Id Format!' });
  }

  const _id = req.user._id;

  try {
    await req.user.remove();

    sendCancelationEmail(req.user.email, req.user.name);

    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// -------------------------------------------

// Read / Get User Avatar
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await UserModel.findById(_id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    // set content type to image/jpg
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

// -----------------------------------------

// Create avatar

const upload = multer({
  // dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an Image'));
    }

    cb(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// --------------------------------------------

// Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;

  await req.user.save();

  res.status(200).send();
});

// -------------------------------------------

module.exports = router;
