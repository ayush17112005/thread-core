import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("SMTP connection successful");
  } catch (error) {
    console.error("SMTP connection failed");
    console.error(error);
  }
};
verifyTransporter();

export const sendResetEmail = async (to, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: `"YourApp" <${process.env.SMTP_USER}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 10 minutes</p>
        <p>If you didn't request this, ignore this email</p>
      `,
    });
    console.log("Reset email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reset email:", error);
    console.error(error);
    throw error;
  }
};
