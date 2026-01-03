const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Employee', 'HR', 'Admin'],
    default: 'Employee'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  profile: {
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    profilePicture: {
      type: String,
      default: ''
    },
    jobTitle: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    joiningDate: {
      type: Date
    },
    salary: {
      basic: {
        type: Number,
        default: 0
      },
      hra: {
        type: Number,
        default: 0
      },
      allowances: {
        type: Number,
        default: 0
      },
      deductions: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    documents: [{
      name: String,
      file: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

