import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = items.map((item) => ({
      ...item,
      url: `/uploads/${item.filename}`,
      thumbUrl: item.mimeType === "image/gif"
        ? `/uploads/${item.filename}`
        : `/uploads/thumb/${item.filename}`,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
