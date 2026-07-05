import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LinkModel from "@/models/Link";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await LinkModel.deleteMany({ userId: new mongoose.Types.ObjectId(session.user.id) });

    return NextResponse.json({ message: "All links deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete All Links Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
