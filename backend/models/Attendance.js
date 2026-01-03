const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-day', 'Leave'],
    default: 'Absent'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index to ensure one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

