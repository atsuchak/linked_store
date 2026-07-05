import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LinkModel from "@/models/Link";
import mongoose from "mongoose";
import { encrypt } from "@/lib/encryption";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Local links might have UUIDs, which are 36 chars. Mongoose ObjectIds are 24.
    if (id.length !== 24 || id.includes('-')) {
       // If it's a local link format, it's not in the DB, so we can just return success
       return NextResponse.json({ message: "Link deleted locally" }, { status: 200 });
    }

    await connectDB();

    const result = await LinkModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    if (!result) {
      return NextResponse.json({ message: "Link not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Link deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Link Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { url, title, description, isPinned } = await req.json();

    if (id.length !== 24 || id.includes('-')) {
       return NextResponse.json({ message: "Link updated locally" }, { status: 200 });
    }

    await connectDB();

    const updateData: any = {};
    if (url !== undefined) updateData.url = encrypt(url);
    if (title !== undefined) updateData.title = title ? encrypt(title) : title;
    if (description !== undefined) updateData.description = description ? encrypt(description) : description;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No data to update" }, { status: 400 });
    }

    const updatedLink = await LinkModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(session.user.id),
      },
      { $set: updateData },
      { new: true }
    );

    if (!updatedLink) {
      return NextResponse.json({ message: "Link not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Link updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Update Link Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
