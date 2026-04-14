const nodemailer = require('nodemailer');

// Configure nodemailer - using ethereal email for testing
// In production, replace with your actual email service (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// For testing purposes, we'll log emails to console if service is disabled
const testMode = process.env.EMAIL_SERVICE === 'test' || !process.env.EMAIL_USER;

async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@netflix-clone.com',
    to: userEmail,
    subject: '🔐 Netflix Clone - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e50914 0%, #000000 100%); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🎬 Netflix Clone</h1>
        </div>
        
        <h2 style="color: #333;">Hi ${userName},</h2>
        
        <p style="color: #555; line-height: 1.6;">
          We received a request to reset the password for your Netflix Clone account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          To reset your password, click the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="
            background-color: #e50914;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">
            Reset Your Password
          </a>
        </div>
        
        <p style="color: #888; font-size: 12px; line-height: 1.6;">
          Or copy and paste this link in your browser:<br/>
          <code style="word-break: break-all;">${resetLink}</code>
        </p>
        
        <p style="color: #888; font-size: 12px; line-height: 1.6;">
          This password reset link will expire in 1 hour. If you need a new link, please request another password reset.
        </p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #888; font-size: 12px;">
          <p style="margin: 5px 0;">Netflix Clone Team</p>
          <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };

  try {
    if (testMode) {
      console.log('\n📧 EMAIL WOULD BE SENT (Test Mode):');
      console.log('To:', userEmail);
      console.log('Subject:', mailOptions.subject);
      console.log('Reset Link:', resetLink);
      console.log('\n');
      return true;
    }
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

async function sendPasswordChangeConfirmation(userEmail, userName) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@netflix-clone.com',
    to: userEmail,
    subject: '✅ Netflix Clone - Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">✅ Password Updated</h1>
        </div>
        
        <h2 style="color: #333;">Hi ${userName},</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Your password has been successfully changed. You can now log in with your new password.
        </p>
        
        <p style="color: #888; font-size: 12px; line-height: 1.6;">
          If you did not make this change, please contact our support team immediately.
        </p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #888; font-size: 12px;">
          <p style="margin: 5px 0;">Netflix Clone Team</p>
        </div>
      </div>
    `
  };

  try {
    if (testMode) {
      console.log('\n📧 CONFIRMATION EMAIL WOULD BE SENT (Test Mode):');
      console.log('To:', userEmail);
      console.log('Subject:', mailOptions.subject);
      console.log('\n');
      return true;
    }
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error sending password change confirmation email:', error);
    return false;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmation
};
