import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LinkModel from "@/models/Link";
import mongoose from "mongoose";
import { encrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { links } = await req.json();

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ message: "An array of links is required" }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const validLinks = [];

    for (const link of links) {
      if (link.url) {
        validLinks.push({
          url: encrypt(link.url),
          title: link.title ? encrypt(link.title) : link.title,
          description: link.description ? encrypt(link.description) : link.description,
          userId: userId,
          createdAt: link.createdAt ? new Date(link.createdAt) : new Date(),
          isPinned: link.isPinned || false,
        });
      }
    }

    if (validLinks.length > 0) {
      await LinkModel.insertMany(validLinks);
    }

    return NextResponse.json({ message: "Links synced successfully", count: validLinks.length }, { status: 201 });
  } catch (error: any) {
    console.error("Sync Links Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
