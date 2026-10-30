import { getRoomById } from "@/lib/mock-rooms";
import type { BookingRecord } from "@/types/booking";
import type { MembershipRecord } from "@/lib/membership/membership-service";
import { getSiteUrl, sendEmail } from "@/lib/notifications/email";
import {
  bookingConfirmationEmail,
  membershipReminderEmail,
  membershipWelcomeEmail,
} from "@/lib/notifications/templates";

/**
 * Fire-and-forget notifications. Each one swallows its own errors: a failed email must
 * never undo a payment or a membership that has already been confirmed.
 */

export async function notifyMembershipJoined(member: MembershipRecord): Promise<void> {
  if (!member.memberCode || !member.validUntil) return;
  try {
    await sendEmail(
      membershipWelcomeEmail({
        fullName: member.fullName,
        email: member.email,
        memberCode: member.memberCode,
        tier: member.tier,
        validUntil: member.validUntil,
        siteUrl: getSiteUrl(),
      })
    );
  } catch {
    // Logged by sendEmail; nothing else to do.
  }
}

export async function notifyMembershipEnding(member: MembershipRecord): Promise<boolean> {
  if (!member.memberCode || !member.validUntil) return false;
  try {
    const result = await sendEmail(
      membershipReminderEmail({
        fullName: member.fullName,
        email: member.email,
        memberCode: member.memberCode,
        tier: member.tier,
        validUntil: member.validUntil,
        siteUrl: getSiteUrl(),
      })
    );
    return result.sent;
  } catch {
    return false;
  }
}

/** One email for a single booking, or for the whole group of a multi-flat booking. */
export async function notifyBookingConfirmed(bookings: BookingRecord[]): Promise<void> {
  if (bookings.length === 0 || !bookings[0].guest.email) return;
  try {
    await sendEmail(
      bookingConfirmationEmail({
        bookings,
        siteUrl: getSiteUrl(),
        flatName: (unitId) => getRoomById(unitId)?.type ?? unitId.toUpperCase(),
      })
    );
  } catch {
    // Logged by sendEmail; nothing else to do.
  }
}
