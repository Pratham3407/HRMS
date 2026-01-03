const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Check In
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        employeeId: req.user._id,
        date: today,
        status: 'Present'
      });
    }

    attendance.checkIn = new Date();
    attendance.status = 'Present';
    await attendance.save();

    res.json({ message: 'Check-in successful', attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Out
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    
    // Calculate working hours
    const hours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Math.round(hours * 100) / 100;

    // If less than 4 hours, mark as half-day
    if (attendance.workingHours < 4) {
      attendance.status = 'Half-day';
    }

    await attendance.save();

    res.json({ message: 'Check-out successful', attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Today's Attendance
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: today
    });

    res.json(attendance || { message: 'No attendance record for today' });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Attendance (Weekly/Daily)
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, view } = req.query;
    
    let query = {};

    // Employees can only view their own attendance
    if (req.user.role === 'Employee') {
      query.employeeId = req.user._id;
    } else if ((req.user.role === 'Admin' || req.user.role === 'HR') && employeeId) {
      // Admin/HR can view specific employee's attendance
      query.employeeId = employeeId;
    }
    // If Admin/HR and no employeeId specified, fetch all employees' attendance

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (view === 'week') {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      query.date = {
        $gte: weekStart,
        $lte: weekEnd
      };
    } else {
      // Default: current month
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      query.date = {
        $gte: monthStart,
        $lte: monthEnd
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'employeeId email profile.firstName profile.lastName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Attendance (Admin/HR only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

