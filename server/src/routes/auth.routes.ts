import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { sendOTPEmail, generateOTP } from "../services/email.service";
import { extractDomain, getSchoolName, generateToken, formatUserResponse } from "../utils/helpers";
import { OTPEntry } from "../types";

const router = Router();

// In-memory OTP store (use Redis in production)
const otpStore: Map<string, OTPEntry> = new Map();

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
    console.log("email", email);

    if (!email) {
      console.log("Email is required");
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      console.log("No pending registration found");
      res.status(400).json({ success: false, error: "No pending registration found" });
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
