import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { sendOTP } from '@/lib/email';
import dns from 'dns';

// Force Google DNS to bypass ISP SRV blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function POST(req: Request) {
  try {
    const { email, type = 'register' } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (type === 'register' && existingUser) {
      if (existingUser.authProvider === 'google') {
        return NextResponse.json({ message: 'Email is already registered. Please try logging in.' }, { status: 400 });
      }
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }
    
    if (type === 'reset' && !existingUser) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }
    
    if (type === 'reset' && existingUser && existingUser.authProvider === 'google') {
      return NextResponse.json({ message: 'Password reset is not available for this account type.' }, { status: 400 });
    }

    // Generate a 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save the new OTP to DB
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
    });

    // Check if SMTP is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your-api-key") {
      console.log(`\n\n==========================================\n[DEV MODE] Resend not configured.\nOTP for ${email} is: ${otpCode}\n==========================================\n\n`);
      return NextResponse.json({ message: 'OTP logged to server console (Resend not configured)' }, { status: 200 });
    }

    // Send the OTP via email
    await sendOTP(email, otpCode, type as 'register' | 'reset');

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ message: 'Internal Server Error. ' + error.message }, { status: 500 });
  }
}
