const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate secure token
const generateVerificationToken = () =>
  crypto.randomBytes(32).toString('hex');

// Create REAL transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Verify SMTP once on server start
transporter.verify((err) => {
  if (err) {
    console.error('SMTP ERROR:', err);
  } else {
    console.log('SMTP server ready to send emails');
  }
});

// Generic email sender
const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// Verification email
const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your email – Dayflow HRMS',
    html: `
      <h2>Verify your email</h2>
      <p>Please verify your Dayflow account:</p>
      <a href="${url}">${url}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

module.exports = {
  generateVerificationToken,
  sendEmail,
  sendVerificationEmail,
};
