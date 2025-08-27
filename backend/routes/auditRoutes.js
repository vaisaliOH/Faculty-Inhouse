const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Audit = require('../models/Audit');
const TimeTable = require('../models/TimeTable'); // Import the TimeTable model
const Academia = require('../models/Academia');   // Import the Academia model

// Helper function to figure out the hour number from the time slot
const getHourFromSlot = (slot) => {
  const startTime = slot.split(' - ')[0]; // e.g., "08:00 - 08:50" -> "08:00"
  const hourMap = {
    '08:00': 1, '08:50': 2, '09:45': 3, '10:40': 4, '11:35': 5, '12:30': 6,
    '01:25': 7, '02:20': 8, '03:10': 9, '04:00': 10, '04:50': 11, '05:30': 12
  };
  return hourMap[startTime] || null;
};

// This is the main API route
// In routes/auditRoutes.js

// ... (keep the rest of the code the same)

// In routes/auditRoutes.js

// ... (keep all the imports and the getHourFromSlot function)

// In routes/auditRoutes.js
// ... (keep all the imports and the getHourFromSlot function)

// In routes/auditRoutes.js
// ... (keep all the imports and the getHourFromSlot function)

router.get('/today', authMiddleware, async (req, res) => {
  const { batch } = req.query;
  if (!batch) {
    return res.status(400).json({ msg: 'Batch number is required.' });
  }

  try {
    // --- THIS IS THE FINAL FIX ---
    // Create a date object based on the server's local time
    const now = new Date();
    // Set the start of the day to midnight of the current local date
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    // Set the end of the day to 23:59:59 of the current local date
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    // --- END OF FIX ---

    const todayAcademia = await Academia.findOne({ date: { $gte: startOfDay, $lte: endOfDay } });

    if (!todayAcademia) {
      return res.json([]);
    }
    const currentDayOrder = todayAcademia.dayOrder;

    const audits = await Audit.find({
      faculty: req.faculty.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    if (audits.length === 0) {
      return res.json([]);
    }

    const auditsWithSubjects = await Promise.all(
      audits.map(async (audit) => {
        const hour = getHourFromSlot(audit.slot);
        if (hour) {
          const timetableSlot = await TimeTable.findOne({
            batch: parseInt(batch),
            dayOrder: currentDayOrder,
            hour: hour,
          }).lean();
          
          return {
            ...audit,
            subjectCode: timetableSlot ? timetableSlot.subjectCode : 'N/A',
          };
        }
        return { ...audit, subjectCode: 'N/A' };
      })
    );

    res.json(auditsWithSubjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;