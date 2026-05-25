import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/admin/auth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, accessCode } = body;

    if (!username || !accessCode) {
      return NextResponse.json(
        { error: "Username and access code are required" },
        { status: 400 }
      );
    }

    // Check against Admin table
    const admin = await db.admin.findUnique({ where: { username } });

    if (admin) {
      // Admin exists in DB, verify access code
      if (admin.accessCode === accessCode) {
        const response = NextResponse.json({ success: true });
        response.cookies.set("admin_session", `authenticated_${Date.now()}`, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
          path: "/",
        });
        return response;
      } else {
        return NextResponse.json(
          { error: "بيانات الدخول غير صحيحة" },
          { status: 401 }
        );
      }
    }

    // Fallback: if no admin exists in DB yet, check hardcoded defaults
    const defaultUsername = "superadmin";
    const defaultAccessCode = "17F6413A";

    if (username === defaultUsername && accessCode === defaultAccessCode) {
      // Auto-create the admin record
      await db.admin.create({
        data: {
          username: defaultUsername,
          accessCode: defaultAccessCode,
        },
      });

      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_session", `authenticated_${Date.now()}`, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 }
    );
  }
}
