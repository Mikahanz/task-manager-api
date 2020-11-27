const express = require('express');
require('./db/mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const UserModel = require('./models/userModel');
const TaskModel = require('./models/taskModel');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

// automatically parse JSON to Object
app.use(express.json());

// User Router
app.use(userRouter);

// Task Router
app.use(taskRouter);

// Listening port
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

//------------------------------------------

////// BELOW THIS LINE IS FOR TESTING PURPOSES //////

//// Testing Middleware Function ////

// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.send('Get requests are disabled!');
//   } else {
//     next();
//   }
// });

// Middleware function for maintenance mode
// app.use((req, res, next) => {
//   res.status(503).send('Site is temporarily unavailable!');
// });

//// Testing Bcryt ////

// const bcrypt = require('bcrypt');

// const hashThePassword = async (password) => {
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash(password, saltRounds);

//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare('mike122', hashedPassword);
//   console.log(isMatch);
// };

// hashThePassword('mike123');

//// Testing JWT Json Web Token ////

// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//   const token = jwt.sign({ _id: 'abc123' }, 'thisissecret', {
//     expiresIn: '1 seconds',
//   });
//   console.log(token);

//   const data = jwt.verify(token, 'thisissecret');
//   console.log(data);
// };

//myFunction();

//// JSON ////

// const pet = {
//   name: 'Mena',
// };

// pet.toJSON = function () {
//   console.log(this);
//   return this;
// };

// console.log(JSON.stringify(pet));
// console.log(pet);

//// Advance Relationship////

// const main = async () => {
//   // const task = await TaskModel.findById('5fbaeec8b2e6155240133156');
//   // await task.populate('owner').execPopulate();
//   // console.log(task);
//   // const user = await UserModel.findById('5fbaf5d60c0e3f1f941d397f');
//   // await user.populate('tasks').execPopulate();
//   // console.log(user.tasks);
// };

//main();

//// File Upload ////

// const multer = require('multer');

// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error('Please upload a Word Document!'));
//     }

//     cb(undefined, true);
//   },
// });

// app.post(
//   '/upload',
//   upload.single('uploadImage'),
//   (req, res) => {
//     res.send();
//   },
//   // Express Error Handling
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );
