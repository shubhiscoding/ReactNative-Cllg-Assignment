import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    schoolId: string;
  };
}

export interface OTPEntry {
  otp: string;
  email: string;
  password: string;
  displayName: string;
  expiresAt: Date;
}

export interface LoginOTPEntry {
  otp: string;
  email: string;
  expiresAt: Date;
}
