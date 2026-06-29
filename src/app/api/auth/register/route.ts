import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';

export async function POST(req: Request) {
  try {
    const { email, password, otp } = await req.json();

    if (!email || !password || !otp) {
      return NextResponse.json({ message: 'Email, password, and OTP are required' }, { status: 400 });
    }

    await connectDB();

    // Verify OTP
    const validOtp = await Otp.findOne({ email: email.toLowerCase(), otp });

    if (!validOtp) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if user already exists (again, just in case)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User
    await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Delete the used OTP
    await Otp.deleteOne({ _id: validOtp._id });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
