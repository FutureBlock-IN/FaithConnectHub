import * as z from "zod";

export const PRAYER_TITLE_MAX = 100;
export const PRAYER_REQUEST_MAX = 1000;
export const PRAYER_NAME_MAX = 80;

function stripControlCharacters(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.charCodeAt(0);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    if (isAllowedWhitespace || (code >= 32 && code !== 127)) {
      result += char;
    }
  }
  return result;
}

export function sanitizePrayerText(value: string, maxLength: number): string {
  return stripControlCharacters(value.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export const prayerRequestSubmitSchema = z
  .object({
    name: z
      .string()
      .max(
        PRAYER_NAME_MAX,
        `Name must be at most ${PRAYER_NAME_MAX} characters`
      ),
    email: z
      .string()
      .email("Please enter a valid email")
      .max(120)
      .optional()
      .or(z.literal("")),
    title: z
      .string()
      .min(1, "Prayer title is required")
      .max(
        PRAYER_TITLE_MAX,
        `Title must be at most ${PRAYER_TITLE_MAX} characters`
      ),
    request: z
      .string()
      .min(1, "Prayer request is required")
      .max(
        PRAYER_REQUEST_MAX,
        `Prayer request must be at most ${PRAYER_REQUEST_MAX} characters`
      ),
    isAnonymous: z.boolean(),
  });

export type PrayerRequestSubmitValues = z.infer<
  typeof prayerRequestSubmitSchema
>;

export function sanitizePrayerRequestInput(
  values: PrayerRequestSubmitValues
): PrayerRequestSubmitValues {
  return {
    name: sanitizePrayerText(values.name, PRAYER_NAME_MAX),
    email: values.email
      ? sanitizePrayerText(values.email, 120)
      : undefined,
    title: sanitizePrayerText(values.title, PRAYER_TITLE_MAX),
    request: sanitizePrayerText(values.request, PRAYER_REQUEST_MAX),
    isAnonymous: values.isAnonymous,
  };
}
