import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import UserModel from "@/models/User";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { historyOrder } = await req.json();

    if (!Array.isArray(historyOrder)) {
      return NextResponse.json({ message: "historyOrder must be an array" }, { status: 400 });
    }

    await connectDB();

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { historyOrder },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "History order updated", historyOrder: updatedUser.historyOrder }, { status: 200 });
  } catch (error: any) {
    console.error("Update History Order Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ historyOrder: user.historyOrder || [] }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch History Order Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
