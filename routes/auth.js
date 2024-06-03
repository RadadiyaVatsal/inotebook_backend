// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchUser=require('../middleware/getUser');

const JWT_SECRET = "iamvatsal";

// Route 1: Creating a new user by API POST: http://localhost:3020/api/auth/create-user
router.post('/create-user', [
  body('name')
    .isLength({ min: 5 })
    .withMessage('Name must consist of at least 5 characters'),

  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must have at least 5 characters'),

  body('email')
    .isEmail()
    .withMessage('Invalid email')
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('This email already has one account');
      }
    })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email
    });

    const data = {
      user: {
        id: user.id // outsider user.id
      }
    };

    const jwtData = await jwt.sign(data, JWT_SECRET);
    res.send({ "token": jwtData });
  } catch (error) {
    console.error('Error saving user:', error.message);
    res.status(500).json({ error: 'An error occurred while saving the user' });
  }
});

// Route:2 Let user login with correct detail by using API POST: http://localhost:3020/api/auth/login-user
router.post('/login-user', [
  body('password')
    .exists()
    .withMessage('Password cannot be blank'),

  body('email')
    .isEmail()
    .withMessage('Invalid email format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct details" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Please try to login with correct details" });
    }

    const data = {
      user: {
        id: user.id // outsider user.id
      }
    };

    // If everything is okay then return token which is made by using user's id
    const jwtData = await jwt.sign(data, JWT_SECRET);
    res.send({ "token": jwtData });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ error: 'An error occurred while logging in the user' });
  }
});



//Route 3 : for getting all detail of spacefic user by hittin POST req : http://localhost:3020/api/auth/getuser
router.post('/getuser', fetchUser, async (req, res) => {
   
  try{
    const userId=req.user.id;
    const user=await User.findById(userId).select("-password"); //everything will be selected and returned except password from db
    res.send(user);
  }
  catch(error){
    res.status(500).send("Intenal server error");
  }
  }
);



module.exports = router;