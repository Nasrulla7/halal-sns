/**
 * HALAL-INVEST: Production Timezone & Date Formatting Engine
 *
 * Invariants:
 * 1. Timestamps are always stored in ISO-8601 UTC across DB and API.
 * 2. Display times dynamically adapt to the user's browser/local timezone (e.g. Asia/Riyadh in KSA,
 *    Asia/Kolkata in India, America/New_York in US, etc.).
 * 3. Never hardcodes IST or any single regional timezone.
 * 4. Provides exchange hours conversion between native exchange time (IST) and user local time.
 */

export interface TimeZoneOption {
  value: string;
  label: string;
  region: string;
}

export const COMMON_TIMEZONES: TimeZoneOption[] = [
  { value: 'AUTO', label: 'Auto-detect Browser Timezone', region: 'Automatic' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3) — Saudi Arabia / GCC', region: 'Middle East' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4) — UAE', region: 'Middle East' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30) — India / NSE', region: 'South Asia' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1) — UK', region: 'Europe' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4) — US East', region: 'Americas' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', region: 'Global' },
];

/**
 * Returns the currently active timezone for the user.
 * Defaults to the browser's Intl timezone (e.g. 'Asia/Riyadh' when accessed from KSA).
 */
export function getUserTimeZone(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('halal_invest_user_timezone');
      if (stored && stored !== 'AUTO') {
        return stored;
      }
    }
  } catch {}

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Sets user timezone preference. Pass 'AUTO' to use browser detection.
 */
export function setUserTimeZone(tz: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (tz === 'AUTO') {
        window.localStorage.removeItem('halal_invest_user_timezone');
      } else {
        window.localStorage.setItem('halal_invest_user_timezone', tz);
      }
      window.dispatchEvent(new Event('timezone-changed'));
    }
  } catch {}
}

/**
 * Checks whether user has enabled auto-detection.
 */
export function isAutoTimeZone(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('halal_invest_user_timezone');
      return !stored || stored === 'AUTO';
    }
  } catch {}
  return true;
}

/**
 * Returns the short timezone abbreviation (e.g. 'AST', 'IST', 'GMT+3') for a given date and zone.
 */
export function getTimeZoneAbbr(date: Date = new Date(), timeZone?: string): string {
  const tz = timeZone || getUserTimeZone();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : tz;
  } catch {
    return tz;
  }
}

/**
 * Formats full timestamp with date, time, and timezone identifier.
 * Example in KSA: "27 Sep 2026, 09:15 PM AST"
 */
export function formatUserDateTime(
  timestamp?: string | number | Date | null,
  options?: { showSeconds?: boolean; timeZone?: string }
): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '—';

  const tz = options?.timeZone || getUserTimeZone();
  try {
    const formatted = d.toLocaleString('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: options?.showSeconds ? '2-digit' : undefined,
      hour12: true,
    });
    const abbr = getTimeZoneAbbr(d, tz);
    return `${formatted} ${abbr}`;
  } catch {
    return d.toISOString();
  }
}

/**
 * Formats time only with timezone badge.
 * Example in KSA: "09:15:20 PM AST"
 */
export function formatUserTime(
  timestamp?: string | number | Date | null,
  options?: { showSeconds?: boolean; timeZone?: string }
): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '—';

  const tz = options?.timeZone || getUserTimeZone();
  try {
    const formatted = d.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: options?.showSeconds ? '2-digit' : undefined,
      hour12: true,
    });
    const abbr = getTimeZoneAbbr(d, tz);
    return `${formatted} ${abbr}`;
  } catch {
    return d.toISOString();
  }
}

/**
 * Formats date only.
 * Example: "27 Sep 2026"
 */
export function formatUserDate(
  timestamp?: string | number | Date | null,
  timeZone?: string
): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '—';

  const tz = timeZone || getUserTimeZone();
  try {
    return d.toLocaleDateString('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/**
 * Computes exchange market trading hours converted to the user's active timezone.
 * NSE core session: 09:15 to 15:30 IST (Indian Standard Time, UTC+5:30).
 * In KSA (Asia/Riyadh, UTC+3), this translates to 06:45 to 13:00 AST.
 */
export function getConvertedExchangeHours(timeZone?: string): {
  exchangeName: string;
  exchangeHoursIST: string;
  localHours: string;
  localTzAbbr: string;
  isSameAsExchange: boolean;
} {
  const tz = timeZone || getUserTimeZone();
  const localAbbr = getTimeZoneAbbr(new Date(), tz);
  const isSameAsExchange = tz === 'Asia/Kolkata' || localAbbr === 'IST';

  if (isSameAsExchange) {
    return {
      exchangeName: 'NSE (National Stock Exchange of India)',
      exchangeHoursIST: '09:15 - 15:30 IST',
      localHours: '09:15 - 15:30 IST',
      localTzAbbr: 'IST',
      isSameAsExchange: true,
    };
  }

  // Convert NSE 09:15 IST and 15:30 IST to user local timezone
  // Construct today's date in IST
  try {
    const now = new Date();
    // 09:15 IST is UTC 03:45
    const openUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 45, 0));
    // 15:30 IST is UTC 10:00
    const closeUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0));

    const openLocal = openUtc.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const closeLocal = closeUtc.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return {
      exchangeName: 'NSE (National Stock Exchange of India)',
      exchangeHoursIST: '09:15 - 15:30 IST',
      localHours: `${openLocal} - ${closeLocal} ${localAbbr}`,
      localTzAbbr: localAbbr,
      isSameAsExchange: false,
    };
  } catch {
    return {
      exchangeName: 'NSE',
      exchangeHoursIST: '09:15 - 15:30 IST',
      localHours: '09:15 - 15:30 IST',
      localTzAbbr: localAbbr,
      isSameAsExchange: true,
    };
  }
}
