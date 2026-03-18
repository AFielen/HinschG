// ── Gemeinsame Typen für DRK-Apps ──

/** Unterstützte Sprachen */
export type Locale = 'de' | 'en';

/** API Health Response */
export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

/** Standard API Error */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ── App-spezifische Typen hier ergänzen ──
