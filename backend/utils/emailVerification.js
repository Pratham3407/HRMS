const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP)
  // In production, configure with real SMTP
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || 'your-ethereal-user',
      pass: process.env.ETHEREAL_PASS || 'your-ethereal-pass'
    }
  });
};

// Send general email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@dayflowhrms.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    return info;
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw, just log for now
  }
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  const subject = 'Email Verification - Dayflow HRMS';
  const html = `
    <h2>Please verify your email address</h2>
    <p>Click on the following link to verify your email:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link will expire in 24 hours.</p>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = { generateVerificationToken, sendEmail, sendVerificationEmail };
