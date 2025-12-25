import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { sendOTPEmail, generateOTP } from "../services/email.service";
import { extractDomain, getSchoolName, generateToken, formatUserResponse } from "../utils/helpers";
import { OTPEntry, LoginOTPEntry } from "../types";

const router = Router();

// In-memory OTP store (use Redis in production)
const otpStore: Map<string, OTPEntry> = new Map();
const loginOtpStore: Map<string, LoginOTPEntry> = new Map();

// Register - sends OTP
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      res.status(400).json({ success: false, error: "All fields are required" });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, error: "Email already registered" });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP with user data
    otpStore.set(email, {
      otp,
      email,
      password,
      displayName,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // For development, log the OTP
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP and create user
router.post("/verify-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, error: "Email and OTP are required" });
      return;
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      res.status(400).json({ success: false, error: "No OTP found. Please register again." });
      return;
    }

    if (new Date() > storedData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: false, error: "OTP expired. Please try again." });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: false, error: "Invalid OTP" });
      return;
    }

    // Extract domain and get/create school
    const domain = extractDomain(email);
    let school = await prisma.school.findUnique({ where: { domain } });

    if (!school) {
      school = await prisma.school.create({
        data: {
          domain,
          name: getSchoolName(domain),
        },
      });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(storedData.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: storedData.displayName,
        schoolId: school.id,
        isVerified: true,
      },
    });

    // Clear OTP
    otpStore.delete(email);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      schoolId: user.schoolId,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user, school),
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resend OTP
router.post("/resend-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    console.log("Resend OTP request for:", email);

    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      // OTP session expired or server restarted - user needs to register again
      res.status(400).json({ 
        success: false, 
        error: "Session expired. Please go back and register again.",
        code: "SESSION_EXPIRED"
      });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    otpStore.set(email, {
      ...storedData,
      otp,
      expiresAt,
    });

    try {
      console.log("Sending OTP to email:", email);
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: "OTP resent to your email",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request OTP for login (forgot password flow)
router.post("/login-otp/request", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, error: "No account found with this email" });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store login OTP
    loginOtpStore.set(email, {
      otp,
      email,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.log(`[DEV] Login OTP for ${email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error: any) {
    console.error("Login OTP request error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP and login (forgot password flow)
router.post("/login-otp/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, error: "Email and OTP are required" });
      return;
    }

    const storedData = loginOtpStore.get(email);

    if (!storedData) {
      res.status(400).json({ success: false, error: "No OTP found. Please request a new one." });
      return;
    }

    if (new Date() > storedData.expiresAt) {
      loginOtpStore.delete(email);
      res.status(400).json({ success: false, error: "OTP expired. Please request a new one." });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: false, error: "Invalid OTP" });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    // Clear OTP
    loginOtpStore.delete(email);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      schoolId: user.schoolId,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user, user.school),
      },
    });
  } catch (error: any) {
    console.error("Login OTP verify error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      schoolId: user.schoolId,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user, user.school),
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
