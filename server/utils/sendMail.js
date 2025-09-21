const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `AI Exam Platform <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Use this to complete your signup.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
