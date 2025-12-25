import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  console.log("Sending OTP to email:", email);
  const mailOptions = {
    from: `"Yappers" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Yappers account 🗣️",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Space Grotesk', system-ui, sans-serif;
            background-color: #FFFEF5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border: 3px solid #1E1E1E;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 4px 4px 0px 0px #1E1E1E;
          }
          .logo {
            text-align: center;
            font-size: 32px;
            margin-bottom: 8px;
          }
          .title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #1E1E1E;
            margin-bottom: 24px;
          }
          .message {
            color: #6B7280;
            text-align: center;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .otp-container {
            background: #FF6B35;
            border: 3px solid #1E1E1E;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 24px;
            box-shadow: 2px 2px 0px 0px #1E1E1E;
          }
          .otp {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
          }
          .footer {
            color: #6B7280;
            text-align: center;
            font-size: 12px;
          }
          .warning {
            color: #FF6B6B;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🗣️</div>
          <div class="title">Yappers</div>
          <p class="message">
            Welcome to your college's anonymous community!<br>
            Use the code below to verify your email:
          </p>
          <div class="otp-container">
            <div class="otp">${otp}</div>
          </div>
          <p class="message">
            This code expires in <span class="warning">5 minutes</span>.
          </p>
          <p class="footer">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("OTP sent to email:", email);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

