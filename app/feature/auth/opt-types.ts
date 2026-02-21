// types/otp.ts

// Send OTP Types
export type SendOTPPayload = {
  email: string;
};

export type SendOTPResponse = {
  message: string;
  maskedEmail: string;
};

export type SendOTPError = {
  error: string;
};

// Verify OTP Types
export type VerifyOTPPayload = {
  email: string;
  otp: string;
};

export type VerifyOTPResponse = {
  message: string;
  success: boolean;
};

export type VerifyOTPError = {
  error: string;
  attemptsLeft?: number;
};