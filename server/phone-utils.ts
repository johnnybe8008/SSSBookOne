export const DEFAULT_PHONE_COUNTRY_ISO = "ZA";

type SupportedCountry = "US" | "ZA";

const SUPPORTED_COUNTRY_ISOS: SupportedCountry[] = ["US", "ZA"];

export function normalizeCountryIso(value: string | null | undefined): SupportedCountry {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "US" || normalized === "ZA") {
    return normalized;
  }
  return DEFAULT_PHONE_COUNTRY_ISO;
}

export function normalizePhoneToE164(
  value: string | null | undefined,
  countryIso?: string | null,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  switch (normalizeCountryIso(countryIso)) {
    case "US":
      if (digits.length === 10) return `+1${digits}`;
      if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
      return null;
    case "ZA":
      if (digits.length === 10 && digits.startsWith("0")) return `+27${digits.slice(1)}`;
      if (digits.length === 9) return `+27${digits}`;
      if (digits.length === 11 && digits.startsWith("27")) return `+${digits}`;
      return null;
    default:
      return null;
  }
}

export function normalizeMobileFields(input: {
  mobilePhone?: string | null;
  mobileCountryIso?: string | null;
}) {
  const hasPhone = !!input.mobilePhone?.trim();
  if (!hasPhone) {
    return {
      mobileCountryIso: null,
      mobilePhoneE164: null,
    };
  }

  const mobileCountryIso = normalizeCountryIso(input.mobileCountryIso);
  const mobilePhoneE164 = normalizePhoneToE164(input.mobilePhone, mobileCountryIso);

  return {
    mobileCountryIso,
    mobilePhoneE164,
  };
}

export function getSupportedCountryOptions() {
  return SUPPORTED_COUNTRY_ISOS.map((countryIso) => ({
    countryIso,
    label: countryIso === "ZA" ? "South Africa (+27)" : "United States (+1)",
  }));
}
