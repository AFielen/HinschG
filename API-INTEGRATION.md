# KI-Agenten-Schnittstelle

Diese App bietet eine REST-API für die Integration mit KI-Assistenten (z.B. Henry, ChatGPT, Claude).

## Endpunkte

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-02-20T10:00:00.000Z"
}
```

### [App-spezifische Endpunkte hier ergänzen]

```
GET /api/[name]     – Schema/Konfiguration abrufen
POST /api/[name]    – Aktion ausführen
```

## Authentifizierung

Keine – die API ist offen zugänglich (nur im lokalen Netzwerk / hinter Reverse Proxy).

## Beispiel-Integration

```typescript
const response = await fetch('https://[host]/api/[name]', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* ... */ }),
});
const result = await response.json();
```
