import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Increment the sessionVersion to invalidate all existing JWTs for this user
    await User.findByIdAndUpdate(userId, {
      $inc: { sessionVersion: 1 }
    });

    return NextResponse.json({ message: "Logged out from all devices successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Logout All Devices Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
