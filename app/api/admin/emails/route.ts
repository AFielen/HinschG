import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql, desc, and, isNotNull, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emails, emailKonten, hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

const emailColumns = {
  id: emails.id,
  kontoId: emails.kontoId,
  kontoName: emailKonten.name,
  richtung: emails.richtung,
  von: emails.von,
  an: emails.an,
  betreff: emails.betreff,
  inhalt: emails.inhalt,
  status: emails.status,
  hinweisId: emails.hinweisId,
  createdAt: emails.createdAt,
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'eingang';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    let statusWhere: SQL;
    switch (tab) {
      case 'gesendet':
        statusWhere = eq(emails.status, 'Gesendet');
        break;
      case 'warteschlange':
        statusWhere = eq(emails.status, 'Warteschlange');
        break;
      case 'fehler':
        statusWhere = eq(emails.status, 'Fehler');
        break;
      default:
        statusWhere = eq(emails.richtung, 'Eingang');
    }

    const { rows, count } = await withTenant(scope, async (tx) => {
      if (scope === 'all') {
        // Zentrale Nutzer/Admins: alle E-Mails inkl. fallungebundener (hinweisId null)
        const rows = await tx
          .select(emailColumns)
          .from(emails)
          .leftJoin(emailKonten, eq(emails.kontoId, emailKonten.id))
          .where(statusWhere)
          .orderBy(desc(emails.createdAt))
          .limit(limit)
          .offset(offset);
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(emails)
          .where(statusWhere);
        return { rows, count };
      }
      // Mandantengebunden: nur E-Mails zu Fällen des eigenen Kunden.
      // Der innerJoin auf hinweise wird durch RLS auf den Scope beschränkt;
      // fallungebundene E-Mails (hinweisId null) sind hier nicht sichtbar.
      const scopedWhere = and(statusWhere, isNotNull(emails.hinweisId));
      const rows = await tx
        .select(emailColumns)
        .from(emails)
        .innerJoin(hinweise, eq(emails.hinweisId, hinweise.id))
        .leftJoin(emailKonten, eq(emails.kontoId, emailKonten.id))
        .where(scopedWhere)
        .orderBy(desc(emails.createdAt))
        .limit(limit)
        .offset(offset);
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(emails)
        .innerJoin(hinweise, eq(emails.hinweisId, hinweise.id))
        .where(scopedWhere);
      return { rows, count };
    });

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/emails error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  // Ohne kontoId läuft der Versand über MAIL_FROM (Mailjet-Queue in lib/jobs.ts)
  kontoId: z.number({ coerce: true }).optional(),
  an: z.string().email('Ungültige E-Mail-Adresse'),
  betreff: z.string().min(1, 'Betreff ist erforderlich'),
  inhalt: z.string().min(1, 'Inhalt ist erforderlich'),
  hinweisId: z.number({ coerce: true }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const body = await request.json();
    const data = createSchema.parse(body);

    // Ist die E-Mail an einen Fall gebunden, muss dieser im Scope liegen —
    // sonst könnte ein mandantengebundener Bearbeiter Mails fremden Fällen
    // zuordnen (bzw. als offizielle Meldestelle versenden).
    if (data.hinweisId !== undefined) {
      const gefunden = await withTenant(scope, async (tx) => {
        const [row] = await tx
          .select({ id: hinweise.id })
          .from(hinweise)
          .where(eq(hinweise.id, data.hinweisId!))
          .limit(1);
        return row;
      });
      if (!gefunden) {
        return NextResponse.json(
          { error: 'Zugehörige Meldung nicht gefunden' },
          { status: 404 },
        );
      }
    }

    let vonAdresse = process.env.MAIL_FROM || 'meldestelle@drk-aachen.de';
    if (data.kontoId !== undefined) {
      const [konto] = await db
        .select({ email: emailKonten.email })
        .from(emailKonten)
        .where(eq(emailKonten.id, data.kontoId))
        .limit(1);

      if (!konto) {
        return NextResponse.json({ error: 'E-Mail-Konto nicht gefunden' }, { status: 404 });
      }
      vonAdresse = konto.email ?? vonAdresse;
    }

    const [email] = await db
      .insert(emails)
      .values({
        kontoId: data.kontoId ?? null,
        richtung: 'Ausgang',
        von: vonAdresse,
        an: data.an,
        betreff: data.betreff,
        inhalt: data.inhalt,
        status: 'Warteschlange',
        hinweisId: data.hinweisId ?? null,
      })
      .returning();

    return NextResponse.json({ success: true, data: email }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    console.error('POST /api/admin/emails error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
