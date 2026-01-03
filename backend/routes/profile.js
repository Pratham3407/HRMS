const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// Get Profile
router.get('/:id?', auth, async (req, res) => {
  try {
    const profileId = req.params.id || req.user._id;
    
    // Employees can only view their own profile, Admin/HR can view any
    if (req.user.role === 'Employee' && profileId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(profileId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put('/:id?', auth, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    const profileId = req.params.id || req.user._id;
    const isAdminOrHR = req.user.role === 'Admin' || req.user.role === 'HR';
    const isOwnProfile = profileId === req.user._id.toString();

    // Employees can only edit their own profile (limited fields), Admin/HR can edit any
    if (!isOwnProfile && !isAdminOrHR) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(profileId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      jobTitle,
      department,
      joiningDate,
      salary
    } = req.body;

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    
    // Only Admin/HR can edit job details and salary
    if (isAdminOrHR) {
      if (jobTitle !== undefined) user.profile.jobTitle = jobTitle;
      if (department !== undefined) user.profile.department = department;
      if (joiningDate !== undefined) user.profile.joiningDate = joiningDate;
      if (salary !== undefined) {
        user.profile.salary = {
          ...user.profile.salary,
          ...salary,
          total: (salary.basic || user.profile.salary.basic) + 
                 (salary.hra || user.profile.salary.hra) + 
                 (salary.allowances || user.profile.salary.allowances) - 
                 (salary.deductions || user.profile.salary.deductions)
        };
      }
    }

    // Handle profile picture upload
    if (req.files && req.files.profilePicture) {
      // Delete old profile picture if exists
      if (user.profile.profilePicture) {
        const oldPicturePath = path.join(__dirname, '../uploads', user.profile.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      user.profile.profilePicture = req.files.profilePicture[0].filename;
    }

    // Handle document uploads
    if (req.files && req.files.documents) {
      req.files.documents.forEach(file => {
        user.profile.documents.push({
          name: file.originalname,
          file: file.filename
        });
      });
    }

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Document
router.delete('/documents/:documentId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const document = user.profile.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', document.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.profile.documents.pull(req.params.documentId);
    await user.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

