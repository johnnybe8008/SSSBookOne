import * as db from "./db";

type RecipientType = "staff" | "client";
type NotificationType = "sms" | "whatsapp";

const getTwilioConfig = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber, whatsappFrom };
};

const toE164 = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
};

const getRecipientPhone = (recipientType: RecipientType, record: any) => {
  if (!record) return null;
  return toE164(record.mobilePhone);
};

const formatWhen = (value: Date | string | null | undefined) => {
  if (!value) return "soon";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "soon";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const buildMessage = ({
  recipientType,
  session,
  clientRecord,
  staffRecord,
}: {
  recipientType: RecipientType;
  session: any;
  clientRecord: any;
  staffRecord: any;
}) => {
  const when = formatWhen(session?.scheduledDate || session?.sessionStartTime);
  const clientName = clientRecord?.name || "client";
  const staffName = staffRecord?.name || "staff";

  if (recipientType === "staff") {
    return `Scheduled session reminder: ${clientName} is scheduled for ${when}.`;
  }

  return `Your session with ${staffName} is scheduled for ${when}.`;
};

async function sendSms(to: string, body: string) {
  const config = getTwilioConfig();
  if (!config) {
    throw new Error("Twilio is not configured");
  }

  const authHeader = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: config.fromNumber,
        To: to,
        Body: body,
      }).toString(),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Twilio send failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  return response.json().catch(() => ({}));
}

async function sendWhatsapp(to: string, body: string) {
  const config = getTwilioConfig();
  if (!config) {
    throw new Error("Twilio is not configured");
  }
  if (!config.whatsappFrom) {
    throw new Error("Twilio WhatsApp sender is not configured");
  }

  const authHeader = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: config.whatsappFrom,
        To: `whatsapp:${to}`,
        Body: body,
      }).toString(),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Twilio WhatsApp send failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  return response.json().catch(() => ({}));
}

export async function sendDirectNotification(args: {
  recipientType: RecipientType;
  recipientRecord: any;
  message: string;
}) {
  const { recipientType, recipientRecord, message } = args;
  if (!recipientRecord) {
    throw new Error("Recipient not found");
  }
  if (recipientRecord.notificationOptOut) {
    return { status: "skipped" as const, reason: "Recipient opted out of notifications" };
  }

  const notificationType = recipientRecord.notificationPreference as NotificationType | null | undefined;
  if (!notificationType) {
    return { status: "skipped" as const, reason: "Recipient notification preference is not set" };
  }
  const recipientPhone = getRecipientPhone(recipientType, recipientRecord);
  if (!recipientPhone) {
    return { status: "failed" as const, reason: "Recipient phone number is missing or invalid" };
  }

  if (notificationType === "whatsapp") {
    await sendWhatsapp(recipientPhone, message);
    return { status: "sent" as const, channel: "whatsapp" as const };
  }

  await sendSms(recipientPhone, message);
  return { status: "sent" as const, channel: "sms" as const };
}

let dispatchInFlight = false;

export async function processPendingNotifications() {
  if (dispatchInFlight) {
    return;
  }

  const config = getTwilioConfig();
  if (!config) {
    return;
  }

  dispatchInFlight = true;
  try {
    const pending = await db.getPendingNotifications();
    for (const notification of pending) {
      try {
        if (notification.notificationType !== "sms") {
          await db.updateNotification(notification.id, {
            status: "skipped",
            skipReason: `Unsupported notification type: ${notification.notificationType}`,
          });
          continue;
        }

        const session = await db.getSessionById(notification.sessionId);
        if (!session) {
          await db.updateNotification(notification.id, {
            status: "failed",
            skipReason: "Session not found",
          });
          continue;
        }

        const staffRecord = await db.getStaffById(session.staffId);
        const clientRecord = await db.getClientById(session.clientId);
        const recipientRecord =
          notification.recipientType === "staff" ? staffRecord : clientRecord;
        const recipientPhone = getRecipientPhone(notification.recipientType as RecipientType, recipientRecord);

        if (!recipientPhone) {
          await db.updateNotification(notification.id, {
            status: "failed",
            skipReason: "Recipient phone number is missing or invalid",
          });
          continue;
        }

        const body = buildMessage({
          recipientType: notification.recipientType as RecipientType,
          session,
          clientRecord,
          staffRecord,
        });

        await sendSms(recipientPhone, body);
        await db.updateNotification(notification.id, {
          status: "sent",
          sentAt: new Date(),
          skipReason: null,
        });
      } catch (error: any) {
        await db.updateNotification(notification.id, {
          status: "failed",
          skipReason: error?.message || "Unknown notification error",
        });
      }
    }
  } finally {
    dispatchInFlight = false;
  }
}
