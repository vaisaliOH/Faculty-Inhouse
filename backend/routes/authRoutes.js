const express = require('express');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty'); // Go up one level to find models
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

// @route   POST /api/auth/login
// @desc    Authenticate faculty & get token
// @access  Public
router.post('/login', async (req, res) => {
  // Get facultyId and email from the request body
  const { facultyId, email } = req.body;

  try {
    // 1. Check if the user exists in the database
    const faculty = await Faculty.findOne({ facultyId, email });

    // If no faculty member matches, send an error
    if (!faculty) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    // 2. If user exists, create the JWT "access pass"
    const payload = {
      faculty: {
        id: faculty.id, // The unique MongoDB ID (_id)
        facultyId: faculty.facultyId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }, // Token expires in 1 day
      (err, token) => {
        if (err) throw err;
        // 3. Send the token back to the frontend
        res.status(200).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;