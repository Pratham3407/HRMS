const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Get All Payrolls (Admin/HR only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id employeeId email profile.firstName profile.lastName profile.salary')
      .sort({ 'profile.firstName': 1 });

    const payrolls = users.map(user => ({
      id: user._id,
      employeeId: user.employeeId,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      email: user.email,
      salary: user.profile.salary
    }));

    res.json(payrolls);
  } catch (error) {
    console.error('Get all payrolls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Payroll (Employee can view own, Admin/HR can view all)
router.get('/:id', auth, async (req, res) => {
  try {
    const payrollId = req.params.id;

    // Employees can only view their own payroll
    if (req.user.role === 'Employee' && payrollId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(payrollId).select('_id employeeId email profile.firstName profile.lastName profile.salary');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      employeeId: user.employeeId,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      email: user.email,
      salary: user.profile.salary
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Salary Structure (Admin/HR only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { salary } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (salary) {
      const basic = parseFloat(salary.basic) || parseFloat(user.profile.salary.basic) || 0;
      const hra = parseFloat(salary.hra) || parseFloat(user.profile.salary.hra) || 0;
      const allowances = parseFloat(salary.allowances) || parseFloat(user.profile.salary.allowances) || 0;
      const deductions = parseFloat(salary.deductions) || parseFloat(user.profile.salary.deductions) || 0;
      
      const total = basic + hra + allowances - deductions;

      user.profile.salary = {
        basic,
        hra,
        allowances,
        deductions,
        total
      };
    }

    await user.save();

    res.json({ 
      message: 'Salary structure updated successfully', 
      salary: user.profile.salary 
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

