import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/db";
import User from "@/models/User";
import LinkModel from "@/models/Link";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email?.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete all links associated with this user
    await LinkModel.deleteMany({ userId: new mongoose.Types.ObjectId(user._id) });

    // Delete the user
    await User.deleteOne({ _id: user._id });

    return NextResponse.json({ message: "Account and all data deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
