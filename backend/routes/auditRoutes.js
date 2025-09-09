const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Audit = require('../models/Audit');
const TimeTable = require('../models/TimeTable');
const Academia = require('../models/Academia');

/**
 * Converts a time string (e.g., "09:45") into the corresponding timetable hour (1-12).
 * @param {string} timeString - The time in HH:MM format.
 * @returns {number|null} The hour number or null if not found.
 */
const getHourFromTime = (timeString) => {
    if (!timeString || !timeString.includes(':')) return null;
    const [hour, minute] = timeString.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;

    if (timeInMinutes >= 480 && timeInMinutes < 530) return 1;  // 08:00 - 08:49
    if (timeInMinutes >= 530 && timeInMinutes < 585) return 2;  // 08:50 - 09:44
    if (timeInMinutes >= 585 && timeInMinutes < 640) return 3;  // 09:45 - 10:39
    if (timeInMinutes >= 640 && timeInMinutes < 695) return 4;  // 10:40 - 11:34
    if (timeInMinutes >= 695 && timeInMinutes < 750) return 5;  // 11:35 - 12:29
    if (timeInMinutes >= 750 && timeInMinutes < 805) return 6;  // 12:30 - 01:24 PM
    if (timeInMinutes >= 805 && timeInMinutes < 855) return 7;  // 01:25 - 02:14 PM
    if (timeInMinutes >= 855 && timeInMinutes < 910) return 8;  // 02:15 - 03:09 PM
    if (timeInMinutes >= 910 && timeInMinutes < 960) return 9;  // 03:10 - 03:59 PM
    if (timeInMinutes >= 960 && timeInMinutes < 1010) return 10; // 04:00 - 04:49 PM
    if (timeInMinutes >= 1010 && timeInMinutes < 1050) return 11; // 04:50 - 05:29 PM
    if (timeInMinutes >= 1050 && timeInMinutes <= 1110) return 12;// 05:30 - 06:10 PM
    return null;
};

/**
 * ROUTE 1: GET /api/audits/today
 * Fetches the raw list of venues the faculty needs to visit today.
 */
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const audits = await Audit.find({
            faculty: req.faculty.id,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).lean();
        
        res.json(audits);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * ROUTE 2: POST /api/audits/lookup-subject
 * Looks up a subject code based on a batch and a specific time of visit.
 */
router.post('/lookup-subject', authMiddleware, async (req, res) => {
    const { batch, time } = req.body;

    if (!batch || !time) {
        return res.status(400).json({ msg: 'Batch and time are required.' });
    }

    try {
        // 1. Find today's Day Order
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const todayAcademia = await Academia.findOne({ date: { $gte: startOfDay, $lte: endOfDay } });
        if (!todayAcademia) {
            return res.status(404).json({ msg: 'Today is not a working day.' });
        }
        const currentDayOrder = todayAcademia.dayOrder;

        // 2. Convert the input time (e.g., "08:00") to an hour number (e.g., 1)
        const hour = getHourFromTime(time);
        if (!hour) {
            return res.status(404).json({ msg: 'No class scheduled at this time.' });
        }

        // 3. Look up the timetable for the specific slot
        const timetableSlot = await TimeTable.findOne({
            batch: parseInt(batch),
            dayOrder: currentDayOrder,
            hour: hour
        }).lean();

        if (!timetableSlot) {
            return res.status(404).json({ msg: 'Could not find a subject for the given time.' });
        }

        // 4. Send the found subject code back to the frontend
        res.json({ subjectCode: timetableSlot.subjectCode });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;