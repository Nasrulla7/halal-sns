/**
 * HALAL-INVEST: Source & Licensing Registry
 * Tracks access methods, licensing terms, automation permissions, and freshness SLAs.
 * Non-negotiable: No unauthorized exchange scraping.
 */

export interface SourceMetadata {
  id: string;
  sourceName: string;
  sourceType: 'BROKER_API' | 'OFFICIAL_EXCHANGE' | 'REGULATORY_FILING' | 'IR_PORTAL' | 'SHARIAH_BOARD';
  accessMethod: 'OFFICIAL_REST_API' | 'PUBLIC_DISCLOSURE' | 'DOCUMENT_PARSER' | 'MANUAL_AUDIT';
  authRequired: boolean;
  costINR: number;
  automationAllowed: boolean;
  commercialAllowed: boolean;
  redistributionAllowed: boolean;
  rateLimitPerMin: number;
  attributionRequired: boolean;
  lastVerifiedDate: string;
}

export class SourceRegistry {
  private static registry: SourceMetadata[] = [
    {
      id: 'src-fyers-api',
      sourceName: 'FYERS Broker Open API v3',
      sourceType: 'BROKER_API',
      accessMethod: 'OFFICIAL_REST_API',
      authRequired: true,
      costINR: 0, // Free tier for verified FYERS account holders
      automationAllowed: true,
      commercialAllowed: true,
      redistributionAllowed: false,
      rateLimitPerMin: 200,
      attributionRequired: true,
      lastVerifiedDate: '2026-09-20',
    },
    {
      id: 'src-nse-filings',
      sourceName: 'NSE India Corporate Disclosures & XBRL',
      sourceType: 'OFFICIAL_EXCHANGE',
      accessMethod: 'PUBLIC_DISCLOSURE',
      authRequired: false,
      costINR: 0,
      automationAllowed: false, // Disallows automated raw scraping; requires compliant ingestion
      commercialAllowed: false,
      redistributionAllowed: false,
      rateLimitPerMin: 10,
      attributionRequired: true,
      lastVerifiedDate: '2026-09-22',
    },
    {
      id: 'src-sebi-edgar',
      sourceName: 'SEBI Corporate Governance & Insider Registry',
      sourceType: 'REGULATORY_FILING',
      accessMethod: 'PUBLIC_DISCLOSURE',
      authRequired: false,
      costINR: 0,
      automationAllowed: true,
      commercialAllowed: false,
      redistributionAllowed: false,
      rateLimitPerMin: 30,
      attributionRequired: true,
      lastVerifiedDate: '2026-09-25',
    },
    {
      id: 'src-aaoifi-standard',
      sourceName: 'AAOIFI Shariah Standard No. (21)',
      sourceType: 'SHARIAH_BOARD',
      accessMethod: 'MANUAL_AUDIT',
      authRequired: false,
      costINR: 0,
      automationAllowed: true,
      commercialAllowed: true,
      redistributionAllowed: true,
      rateLimitPerMin: 999,
      attributionRequired: true,
      lastVerifiedDate: '2026-09-01',
    },
  ];

  public static getSources(): SourceMetadata[] {
    return this.registry;
  }
}
