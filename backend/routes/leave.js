const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailVerification');

// Apply for Leave
router.post('/apply', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate total days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employeeId: req.user._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ message: 'You have an overlapping leave request' });
    }

    const leave = new Leave({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      remarks: remarks || ''
    });

    await leave.save();
    await leave.populate('employeeId', 'employeeId email profile.firstName profile.lastName');

    // Send email to HR/Admins
    const admins = await User.find(
  { role: { $in: ['Admin', 'HR', 'admin', 'hr'] }, email: { $exists: true, $ne: '' } },
  'email'
);

const adminEmails = admins.map(a => a.email).filter(Boolean);

if (adminEmails.length > 0) {
  await sendEmail({
    to: adminEmails.join(','),
    subject: 'New Leave Request Submitted - Dayflow HRMS',
    html: `
      <h2>New Leave Request</h2>
      <p><strong>Employee:</strong> ${leave.employeeId.profile.firstName} ${leave.employeeId.profile.lastName} (${leave.employeeId.employeeId})</p>
      <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
      <p><strong>Date Range:</strong> ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}</p>
      <p><strong>Total Days:</strong> ${leave.totalDays}</p>
      <p><strong>Remarks:</strong> ${leave.remarks || 'None'}</p>
      <p>Please review and approve/reject the request in the HRMS dashboard.</p>
    `,
  });
}


    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get My Leaves
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id })
      .populate('approvedBy', 'employeeId email profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Leaves (Admin/HR only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'employeeId email profile.firstName profile.lastName')
      .populate('approvedBy', 'employeeId email profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Leave by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'employeeId email profile.firstName profile.lastName')
      .populate('approvedBy', 'employeeId email profile.firstName profile.lastName');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Employees can only view their own leaves
    if (req.user.role === 'Employee' && leave.employeeId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject Leave (Admin/HR only)
router.put('/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { status, adminComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "Approved" or "Rejected"' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leave.status = status;
    leave.adminComments = adminComments || '';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();

    await leave.save();

    // If approved, update attendance records
    if (status === 'Approved') {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);

        await Attendance.findOneAndUpdate(
          {
            employeeId: leave.employeeId,
            date: date
          },
          {
            employeeId: leave.employeeId,
            date: date,
            status: 'Leave'
          },
          { upsert: true, new: true }
        );
      }
    }

    await leave.populate('employeeId', 'employeeId email profile.firstName profile.lastName');
    await leave.populate('approvedBy', 'employeeId email profile.firstName profile.lastName');

    // Send email to employee
    const employeeEmail = leave.employeeId.email;
    const subject = `Leave Request ${status} - Dayflow HRMS`;
    const html = `
      <h2>Leave Request Update</h2>
      <p>Your leave request has been <strong>${status.toLowerCase()}</strong>.</p>
      <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
      <p><strong>Date Range:</strong> ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}</p>
      <p><strong>Total Days:</strong> ${leave.totalDays}</p>
      ${leave.adminComments ? `<p><strong>HR Comments:</strong> ${leave.adminComments}</p>` : ''}
      <p>Approved by: ${leave.approvedBy.profile.firstName} ${leave.approvedBy.profile.lastName}</p>
    `;
    
    if (employeeEmail) {
  await sendEmail({
    to: employeeEmail,
    subject,
    html,
  });
}


    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

