import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/registrations
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const refCode = req.nextUrl.searchParams.get("refCode");
    const search = req.nextUrl.searchParams.get("search");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "200");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (refCode) where.refCode = refCode;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { promoCode: { contains: search } },
      ];
    }

    const [registrations, total] = await Promise.all([
      db.registration.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          salesRef: { select: { id: true, code: true, name: true } },
          commissions: { select: { id: true, amount: true, status: true } },
        },
      }),
      db.registration.count({ where }),
    ]);

    return NextResponse.json({ registrations, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

// PATCH /api/admin/registrations - update registration status/notes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const registration = await db.registration.update({
      where: { id },
      data,
      include: { salesRef: { select: { name: true } } },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "registration_updated",
        details: `تم تحديث تسجيل ${registration.name} — الحالة: ${status || "بدون تغيير"}`,
        salesRefId: registration.salesRefId,
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}

// DELETE /api/admin/registrations?id=xxx - soft delete, or ?action=deleteAll - soft delete all
export async function DELETE(req: NextRequest) {
  try {
    // Check for deleteAll action from body
    let body: any = {};
    try { body = await req.json(); } catch {}
    
    if (body.action === "deleteAll") {
      // Soft delete all non-deleted registrations
      const result = await db.registration.updateMany({
        where: { deletedAt: null },
        data: { deletedAt: new Date() },
      });

      // Delete all registration-related activity logs
      await db.activityLog.deleteMany({
        where: { action: { in: ["registration_updated", "registration_deleted", "new_registration"] } },
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    // Single registration soft delete
    const id = req.nextUrl.searchParams.get("id") || body.id;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const registration = await db.registration.findUnique({ where: { id } });

    // Log activity before soft delete
    if (registration) {
      await db.activityLog.create({
        data: {
          action: "registration_deleted",
          details: `تم حذف تسجيل: ${registration.name}`,
          salesRefId: registration.salesRefId,
        },
      });
    }

    // Soft delete: set deletedAt
    await db.registration.update({ where: { id }, data: { deletedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}
