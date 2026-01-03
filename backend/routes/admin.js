const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Get All Employees
router.get('/employees', auth, isAdmin, async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' })
      .select('-password')
      .sort({ 'profile.firstName': 1 });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Dashboard Stats
router.get('/dashboard-stats', auth, isAdmin, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'Employee' });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ date: today, status: 'Present' });

    const recentLeaves = await Leave.find({ status: 'Pending' })
      .populate('employeeId', 'employeeId email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalEmployees,
      pendingLeaves,
      todayAttendance,
      recentLeaves
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

