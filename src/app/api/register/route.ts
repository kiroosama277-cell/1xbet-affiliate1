import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, country, promoCode, trafficSource, channelDesc, refCode } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !country || !promoCode?.trim() || !trafficSource) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the sales ref if a refCode was provided
    let salesRefId: string | null = null;
    if (refCode) {
      const salesRef = await db.salesRef.findUnique({ where: { code: refCode } });
      if (salesRef) {
        salesRefId = salesRef.id;
      }
    }

    // Save the registration
    const registration = await db.registration.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
        promoCode: promoCode.trim().toUpperCase(),
        trafficSource,
        channelDesc: channelDesc?.trim() || null,
        refCode: refCode || null,
        salesRefId,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "registration",
        details: `تسجيل جديد: ${name} من ${country}${refCode ? ` عبر ${refCode}` : ""}`,
        salesRefId,
      },
    });

    // Auto-create commission if sales ref exists
    if (salesRefId) {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Get commission amount from settings (default 5 USD)
      let commissionAmount = 5;
      try {
        const setting = await db.settings.findUnique({ where: { key: "commission_amount" } });
        if (setting) commissionAmount = parseFloat(setting.value);
      } catch {}

      await db.commission.create({
        data: {
          salesRefId,
          registrationId: registration.id,
          amount: commissionAmount,
          currency: "USD",
          status: "pending",
          month,
        },
      });
    }

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
