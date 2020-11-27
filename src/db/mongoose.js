const mongoose = require('mongoose');

// Connect to MongoDB task-manager-api database
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false, // Optional
});
