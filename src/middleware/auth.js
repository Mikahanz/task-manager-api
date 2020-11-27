const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Middleware for authentication ===> Request ->> Middleware ->> Route Handler(Router)
const auth = async (req, res, next) => {
  try {
    // Get the token from the header Authorization request
    const token = req.header('Authorization').replace('Bearer ', '');

    // Decode the token to get the user's _Id
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // verify if user exists in the  database using the decoded _id and token provided
    const user = await UserModel.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    // If user doesn't exist, throw an error!
    if (!user) {
      throw new Error();
    }

    // give the route handler access to the token fetched from the header request authorization variable
    req.token = token;
    // give the route handler access to the data fetched from the database
    req.user = user;

    next();
  } catch (e) {
    res.status(401).json({ error: 'Please Authenticate!' });
  }
};

module.exports = auth;
