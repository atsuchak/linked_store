import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/db";
import LinkModel from "@/models/Link";
import mongoose from "mongoose";
import { encrypt, decrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url, title, description } = await req.json();

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    await connectDB();

    const newLink = await LinkModel.create({
      url: encrypt(url),
      title: title ? encrypt(title) : title,
      description: description ? encrypt(description) : description,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    const responseLink = {
      ...newLink.toObject(),
      url,
      title,
      description
    };

    return NextResponse.json(responseLink, { status: 201 });
  } catch (error: any) {
    console.error("Save Link Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const links = await LinkModel.find({ userId: new mongoose.Types.ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .lean();

    const decryptedLinks = links.map((link: any) => ({
      ...link,
      url: decrypt(link.url),
      title: link.title ? decrypt(link.title) : link.title,
      description: link.description ? decrypt(link.description) : link.description
    }));

    return NextResponse.json(decryptedLinks, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Links Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
