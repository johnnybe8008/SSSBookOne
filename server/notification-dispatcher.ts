import * as db from "./db";
import { normalizeCountryIso, normalizePhoneToE164 } from "./phone-utils";

type RecipientType = "staff" | "client";
type NotificationType = "sms" | "whatsapp";

type MessagingProviderRecord = Awaited<ReturnType<typeof db.getDefaultMessagingProvider>>;

type ProviderCredentials = {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  whatsappFrom?: string;
  productToken?: string;
};

type ProviderSettings = {
  defaultCountryIso?: "US" | "ZA";
  whatsappTemplateNamespace?: string;
  whatsappTemplateNameStaff?: string;
  whatsappTemplateNameClient?: string;
  whatsappTemplateLanguage?: string;
};

const getProviderCredentials = (provider: MessagingProviderRecord): ProviderCredentials =>
  (provider?.credentials as ProviderCredentials | null) || {};

const getProviderSettings = (provider: MessagingProviderRecord): ProviderSettings =>
  (provider?.settings as ProviderSettings | null) || {};

const getRecipientPhone = (provider: MessagingProviderRecord, record: any) => {
  if (!record) return null;
  if (record.mobilePhoneE164) return record.mobilePhoneE164;

  const settings = getProviderSettings(provider);
  const countryIso = normalizeCountryIso(record.mobileCountryIso || settings.defaultCountryIso);
  return normalizePhoneToE164(record.mobilePhone, countryIso);
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

async function sendViaTwilioSms(provider: MessagingProviderRecord, to: string, body: string) {
  const credentials = getProviderCredentials(provider);
  if (!credentials.accountSid || !credentials.authToken || !credentials.fromNumber) {
    throw new Error("Default Twilio provider is missing SMS credentials");
  }

  const authHeader = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: credentials.fromNumber,
        To: to,
        Body: body,
      }).toString(),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Twilio SMS send failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  return response.json().catch(() => ({}));
}

async function sendViaTwilioWhatsapp(provider: MessagingProviderRecord, to: string, body: string) {
  const credentials = getProviderCredentials(provider);
  if (!credentials.accountSid || !credentials.authToken || !credentials.whatsappFrom) {
    throw new Error("Default Twilio provider is missing WhatsApp credentials");
  }

  const authHeader = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: credentials.whatsappFrom,
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

function toCmNumber(value: string) {
  return value.startsWith("+") ? `00${value.slice(1)}` : value;
}

async function sendViaCmSms(provider: MessagingProviderRecord, to: string, body: string) {
  const credentials = getProviderCredentials(provider);
  if (!credentials.productToken || !credentials.fromNumber) {
    throw new Error("Default CM.com provider is missing SMS credentials");
  }

  const response = await fetch("https://gw.messaging.cm.com/v1.0/message", {
    method: "POST",
    headers: {
      "X-CM-PRODUCTTOKEN": credentials.productToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: {
        msg: [
          {
            from: credentials.fromNumber,
            to: [{ number: toCmNumber(to) }],
            body: {
              type: "auto",
              content: body,
            },
            allowedChannels: ["SMS"],
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`CM.com SMS send failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  return response.json().catch(() => ({}));
}

async function sendViaCmWhatsapp(
  provider: MessagingProviderRecord,
  to: string,
  body: string,
  recipientType: RecipientType,
) {
  const credentials = getProviderCredentials(provider);
  const settings = getProviderSettings(provider);
  const templateName =
    recipientType === "staff" ? settings.whatsappTemplateNameStaff : settings.whatsappTemplateNameClient;

  if (!credentials.productToken || !credentials.whatsappFrom) {
    throw new Error("Default CM.com provider is missing WhatsApp credentials");
  }
  if (!settings.whatsappTemplateNamespace || !templateName) {
    throw new Error("Default CM.com provider is missing WhatsApp template configuration");
  }

  const response = await fetch("https://gw.messaging.cm.com/v1.0/message", {
    method: "POST",
    headers: {
      "X-CM-PRODUCTTOKEN": credentials.productToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: {
        msg: [
          {
            from: credentials.whatsappFrom,
            to: [{ number: toCmNumber(to) }],
            body: {
              type: "auto",
              content: body,
            },
            allowedChannels: ["WhatsApp"],
            richContent: {
              conversation: [
                {
                  template: {
                    whatsapp: {
                      namespace: settings.whatsappTemplateNamespace,
                      element_name: templateName,
                      language: {
                        policy: "deterministic",
                        code: settings.whatsappTemplateLanguage || "en",
                      },
                      localizable_params: [{ default: body }],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`CM.com WhatsApp send failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  return response.json().catch(() => ({}));
}

async function sendSms(provider: MessagingProviderRecord, to: string, body: string) {
  if (!provider) {
    throw new Error("No active default messaging provider is configured");
  }

  if (provider.providerType === "cm") {
    return sendViaCmSms(provider, to, body);
  }

  return sendViaTwilioSms(provider, to, body);
}

async function sendWhatsapp(
  provider: MessagingProviderRecord,
  to: string,
  body: string,
  recipientType: RecipientType,
) {
  if (!provider) {
    throw new Error("No active default messaging provider is configured");
  }

  if (provider.providerType === "cm") {
    return sendViaCmWhatsapp(provider, to, body, recipientType);
  }

  return sendViaTwilioWhatsapp(provider, to, body);
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

  const provider = await db.getDefaultMessagingProvider();
  const recipientPhone = getRecipientPhone(provider, recipientRecord);
  if (!recipientPhone) {
    return { status: "failed" as const, reason: "Recipient phone number is missing or invalid" };
  }

  if (notificationType === "whatsapp") {
    await sendWhatsapp(provider, recipientPhone, message, recipientType);
    return { status: "sent" as const, channel: "whatsapp" as const };
  }

  await sendSms(provider, recipientPhone, message);
  return { status: "sent" as const, channel: "sms" as const };
}

let dispatchInFlight = false;

export async function processPendingNotifications() {
  if (dispatchInFlight) {
    return;
  }

  const provider = await db.getDefaultMessagingProvider();
  if (!provider) {
    return;
  }

  dispatchInFlight = true;
  try {
    const pending = await db.getPendingNotifications();
    for (const notification of pending) {
      try {
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
        const recipientPhone = getRecipientPhone(provider, recipientRecord);

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

        if (notification.notificationType === "whatsapp") {
          await sendWhatsapp(provider, recipientPhone, body, notification.recipientType as RecipientType);
        } else if (notification.notificationType === "sms") {
          await sendSms(provider, recipientPhone, body);
        } else {
          await db.updateNotification(notification.id, {
            status: "skipped",
            skipReason: `Unsupported notification type: ${notification.notificationType}`,
          });
          continue;
        }

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
