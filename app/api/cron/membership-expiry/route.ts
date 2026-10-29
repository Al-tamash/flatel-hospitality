import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { MembershipService, MembershipUnavailableError } from "@/lib/membership/membership-service";
import { notifyMembershipEnding } from "@/lib/notifications/dispatch";

/** Members are reminded this many days before their year ends. */
const REMINDER_DAYS = 14;

function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

/**
 * Daily job (see vercel.json): marks lapsed memberships as expired and emails members
 * whose year ends within two weeks. Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const expired = await MembershipService.expireOverdue();

    const ending = await MembershipService.findEndingSoon(REMINDER_DAYS);
    let reminded = 0;
    for (const member of ending) {
      if (await notifyMembershipEnding(member)) {
        await MembershipService.markReminderSent(member.id);
        reminded += 1;
      }
    }

    return NextResponse.json({ success: true, expired, reminded, due: ending.length });
  } catch (error: unknown) {
    if (error instanceof MembershipUnavailableError) {
      return NextResponse.json({ success: true, skipped: "memberships table not created yet" });
    }
    console.error("Membership expiry job failed");
    return NextResponse.json({ success: false, error: "Job failed." }, { status: 500 });
  }
}
