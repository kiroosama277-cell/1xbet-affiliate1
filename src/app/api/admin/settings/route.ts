import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/settings
export async function GET() {
  try {
    const settings = await db.settings.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));
    return NextResponse.json(map);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/admin/settings - upsert setting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;
    if (!key || !value) {
      return NextResponse.json({ error: "Key and value required" }, { status: 400 });
    }

    const setting = await db.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "setting_updated",
        details: `تم تحديث الإعداد: ${key}`,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
