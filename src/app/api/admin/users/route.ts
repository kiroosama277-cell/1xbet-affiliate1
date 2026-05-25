import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// GET /api/admin/users — list all admin users
export async function GET() {
  try {
    const users = await db.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        accessCode: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users — create new admin user with unique access code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, displayName, role, createdBy } = body;

    if (!username?.trim() || !displayName?.trim()) {
      return NextResponse.json({ error: "Username and display name are required" }, { status: 400 });
    }

    // Check if username exists
    const existing = await db.adminUser.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Generate unique 8-char access code
    const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const user = await db.adminUser.create({
      data: {
        username: username.trim(),
        displayName: displayName.trim(),
        accessCode,
        role: role === "super" ? "super" : "admin",
        createdBy: createdBy || null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PATCH /api/admin/users — toggle active status or regenerate code
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, regenerateCode } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (regenerateCode) {
      data.accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    }

    const user = await db.adminUser.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Prevent deleting the last super admin
    const user = await db.adminUser.findUnique({ where: { id } });
    if (user?.role === "super") {
      const superCount = await db.adminUser.count({ where: { role: "super" } });
      if (superCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last super admin" }, { status: 400 });
      }
    }

    await db.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
