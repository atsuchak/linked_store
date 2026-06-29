import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email?.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      image: user.image || "",
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, image } = await req.json();
    
    await connectDB();
    const user = await User.findOne({ email: session.user.email?.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (image !== undefined) user.image = image; // Base64 or empty string

    await user.save();

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
