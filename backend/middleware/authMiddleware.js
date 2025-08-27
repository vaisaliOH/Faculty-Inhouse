const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
  // 1. Get token from the header
  const token = req.header('Authorization')?.split(' ')[1]; // Format is "Bearer TOKEN"

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the decoded faculty info to the request object
    req.faculty = decoded.faculty;
    next(); // Pass control to the next function (the actual route)
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};