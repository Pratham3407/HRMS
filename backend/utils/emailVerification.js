const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  // In production, configure with actual email service
  // For now, we'll use a simple console log approach
  // You can configure nodemailer with Gmail, SendGrid, etc.
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  console.log(`Verification email would be sent to: ${email}`);
  console.log(`Verification URL: ${verificationUrl}`);
  
  // Uncomment and configure for actual email sending:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Dayflow HRMS',
    html: `
      <h2>Please verify your email address</h2>
      <p>Click on the following link to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  */
  
  return verificationUrl;
};

module.exports = { generateVerificationToken, sendVerificationEmail };

