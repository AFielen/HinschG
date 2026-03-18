'use client';

import Link from 'next/link';
import { AccordionItem } from '@/components/meldestelle/Accordion';

const KATEGORIEN = [
  'Sexuelle Belästigung',
  'Diskriminierung',
  'Betrug / Untreue',
  'Korruption / Bestechung',
  'Datenschutzverstöße',
  'Arbeitsschutzverstöße',
  'Umweltverstöße',
  'Geldwäsche',
  'Steuerhinterziehung',
  'Verstöße gegen Vergaberecht',
  'Sonstige Verstöße',
] as const;

export { KATEGORIEN };

export default function MeldestellePage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* ── Section 1: Welcome Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#212529' }}>
          Herzlich willkommen auf der gemeinsamen internen Meldestelle
        </h1>
        <p className="text-[0.9rem] leading-relaxed" style={{ color: '#4a5568' }}>
          Diese Meldestelle wird vom DRK Kreisverband StädteRegion Aachen e.V. betrieben und stellt
          nach dem Hinweisgeberschutzgesetz eine gemeinsame interne Meldestelle dar. Sie können auf
          dieser Seite Meldungen und Hinweise gemäß der EU-Whistleblower-Richtlinie und dem
          Hinweisgeberschutzgesetz (HinSchG) aufgeben. Ihre Angaben werden von uns streng
          vertraulich behandelt und wir stellen sicher, dass Informationen stets anonymisiert an die
          von uns betreuten Unternehmen weitergegeben werden. Korrektes und gesetzes-, und
          regelkonformes Handeln haben für uns und unsere Mitarbeiterinnen und Mitarbeiter höchste
          Priorität. Der Erfolg unseres Unternehmens hängt wesentlich von unserer Verlässlichkeit,
          Ehrlichkeit und Integrität ab. Zur Sicherstellung dieses Anspruchs ist es uns wichtig zu
          jederzeit über Rechts- und Regelverstöße Kenntnis zu erlangen.
        </p>
      </div>

      {/* ── Section 2: Report Actions Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <AccordionItem title="&#128274; Hinweis jetzt vertraulich melden!" defaultOpen>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: '#4a5568' }}>
              Bei einer vertraulichen Meldung werden Ihre persönlichen Daten (Name, Kontaktdaten)
              erfasst, jedoch streng vertraulich behandelt. Ihre Identität wird nur den befugten
              Mitarbeitern der Meldestelle bekannt sein und nicht ohne Ihre ausdrückliche Zustimmung
              an Dritte weitergegeben. Die Vertraulichkeit Ihrer Identität ist gesetzlich durch das
              Hinweisgeberschutzgesetz (HinSchG) geschützt.
            </p>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Eine vertrauliche Meldung ermöglicht es uns, bei Rückfragen direkt mit Ihnen in
              Kontakt zu treten und Sie über den Fortschritt der Bearbeitung zu informieren.
            </p>
            <div className="pt-2">
              <Link
                href="/meldestelle/vertraulich"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: '#4a7a9b', minHeight: '44px' }}
              >
                Meldung starten
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="&#128274; Hinweis jetzt anonym melden!">
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: '#4a5568' }}>
              Bei einer anonymen Meldung werden keine persönlichen Daten erfasst. Ihre Identität
              bleibt vollständig unbekannt – auch für die Mitarbeiter der Meldestelle. Diese Form
              der Meldung eignet sich insbesondere, wenn Sie Bedenken haben, Ihre Identität
              preiszugeben.
            </p>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Bitte beachten Sie, dass bei einer anonymen Meldung keine Rückfragen möglich sind.
              Beschreiben Sie den Sachverhalt daher so detailliert wie möglich.
            </p>
            <div className="pt-2">
              <Link
                href="/meldestelle/anonym"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: '#4a7a9b', minHeight: '44px' }}
              >
                Meldung starten
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="Weitere Meldewege" defaultOpen>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: '#4a5568' }}>
              Sofern Sie nicht das digitale Hinweisgebersystem nutzen möchten, haben Sie die
              Möglichkeit, einen Hinweis über folgende Meldewege abzugeben:
            </p>
            <div className="space-y-2 pl-1">
              <p className="text-[0.9rem]" style={{ color: '#4a5568' }}>
                <span className="font-semibold">Per E-Mail:</span>{' '}
                <a
                  href="mailto:meldestelle@drk-aachen.de"
                  className="underline"
                  style={{ color: '#4a7a9b' }}
                >
                  meldestelle@drk-aachen.de
                </a>
              </p>
              <p className="text-[0.9rem]" style={{ color: '#4a5568' }}>
                <span className="font-semibold">Per Telefon:</span>{' '}
                <a
                  href="tel:+492419457743"
                  className="underline"
                  style={{ color: '#4a7a9b' }}
                >
                  0241 / 94577430
                </a>
              </p>
            </div>
          </div>
        </AccordionItem>
      </div>

      {/* ── Section 3: FAQ Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#212529' }}>
          Häufig gestellte Fragen (FAQ)
        </h2>

        <AccordionItem title="Was ist das Hinweisgeberschutzgesetz?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das Hinweisgeberschutzgesetz (HinSchG) ist am 2. Juli 2023 in Kraft getreten und setzt
              die EU-Whistleblower-Richtlinie (2019/1937) in deutsches Recht um. Es schützt
              Personen, die im Rahmen ihrer beruflichen Tätigkeit Informationen über Verstöße
              erlangt haben und diese melden – sogenannte Hinweisgeber oder Whistleblower.
            </p>
            <p>
              Das Gesetz verbietet jede Form von Repressalien gegen Hinweisgeber, wie
              Kündigungen, Abmahnungen, Versetzungen oder Mobbing. Es stellt sicher, dass
              Hinweisgeber geschützt werden, wenn sie in gutem Glauben Verstöße melden, die das
              öffentliche Interesse berühren.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Was ist eine interne Meldestelle?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Eine interne Meldestelle ist eine Einrichtung innerhalb eines Unternehmens oder einer
              Organisation, die Hinweise auf Verstöße entgegennimmt und bearbeitet. Gemäß dem
              HinSchG sind Unternehmen ab 50 Beschäftigten verpflichtet, eine solche Meldestelle
              einzurichten.
            </p>
            <p>
              Die interne Meldestelle hat die Aufgabe, eingehende Meldungen entgegenzunehmen, den
              Sachverhalt zu prüfen, angemessene Folgemaßnahmen zu ergreifen und den Hinweisgeber
              über den Fortgang des Verfahrens zu informieren. Die mit der Bearbeitung betrauten
              Personen müssen unabhängig und fachkundig sein.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Welche gesetzlichen Anforderungen gibt es?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das HinSchG unterscheidet zwischen zwei Unternehmensgrößen mit unterschiedlichen
              Anforderungen:
            </p>
            <p>
              <span className="font-semibold">Unternehmen ab 250 Beschäftigten:</span> Diese
              Unternehmen mussten seit dem 2. Juli 2023 eine interne Meldestelle eingerichtet haben.
              Bei Verstößen gegen die Einrichtungspflicht drohen Bußgelder von bis zu 20.000 Euro.
            </p>
            <p>
              <span className="font-semibold">Unternehmen mit 50 bis 249 Beschäftigten:</span> Für
              diese Unternehmen galt eine verlängerte Umsetzungsfrist bis zum 17. Dezember 2023. Auch
              hier ist die Einrichtung einer internen Meldestelle verpflichtend.
            </p>
            <p>
              Die Meldestelle muss die Vertraulichkeit der Identität des Hinweisgebers wahren,
              innerhalb von sieben Tagen eine Eingangsbestätigung an den Hinweisgeber übermitteln und
              innerhalb von drei Monaten eine Rückmeldung über ergriffene Maßnahmen geben.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Welche Personen sind durch das HinSchG geschützt?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das HinSchG schützt einen breiten Personenkreis, der im Zusammenhang mit seiner
              beruflichen Tätigkeit Informationen über Verstöße erlangt hat. Dazu gehören
              insbesondere:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Arbeitnehmerinnen und Arbeitnehmer</li>
              <li>Beamtinnen und Beamte</li>
              <li>Auszubildende und Praktikanten</li>
              <li>Selbstständige und Freiberufler</li>
              <li>Gesellschafter und Mitglieder von Aufsichtsorganen</li>
              <li>Ehrenamtlich Tätige</li>
              <li>Bewerberinnen und Bewerber</li>
              <li>Ehemalige Beschäftigte</li>
            </ul>
            <p>
              Der Schutz erstreckt sich auch auf Personen, die den Hinweisgeber unterstützen
              (sogenannte Unterstützer), sowie auf Personen, die Gegenstand der Meldung sind, sofern
              sich der Verdacht nicht bestätigt.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Welche Verstöße werden durch das HinSchG erfasst?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das HinSchG erfasst Verstöße gegen eine Vielzahl von Rechtsvorschriften, die dem
              Schutz des öffentlichen Interesses dienen. Dazu gehören unter anderem Verstöße gegen:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Strafvorschriften (z.B. Betrug, Korruption, Untreue)</li>
              <li>Bußgeldvorschriften zum Schutz von Leib, Leben und Gesundheit</li>
              <li>Vorschriften des Arbeitsschutzes</li>
              <li>Datenschutzrecht (DSGVO, BDSG)</li>
              <li>Umweltschutzrecht</li>
              <li>Verbraucherschutzrecht</li>
              <li>Vergaberecht</li>
              <li>Steuerrecht (bei grenzüberschreitenden Gestaltungen)</li>
              <li>Geldwäschegesetz</li>
              <li>Produktsicherheitsvorschriften</li>
            </ul>
            <p>
              Nicht erfasst sind rein private Streitigkeiten oder arbeitsrechtliche Konflikte
              zwischen Arbeitnehmer und Arbeitgeber, sofern diese keinen Bezug zu den genannten
              Rechtsgebieten haben.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Was sind interne und externe Meldestellen?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das HinSchG sieht ein zweistufiges Meldesystem vor, das Hinweisgebern die Wahl
              zwischen internen und externen Meldestellen lässt:
            </p>
            <p>
              <span className="font-semibold">Interne Meldestellen</span> werden von den
              Unternehmen und Organisationen selbst eingerichtet. Sie sind die erste Anlaufstelle für
              Hinweisgeber und ermöglichen eine schnelle, interne Aufklärung von Missständen.
              Unternehmen können die Aufgaben der internen Meldestelle auch an Dritte (z.B. externe
              Ombudspersonen oder spezialisierte Dienstleister) übertragen.
            </p>
            <p>
              <span className="font-semibold">Externe Meldestellen</span> sind staatliche Stellen.
              Die zentrale externe Meldestelle des Bundes ist beim Bundesamt für Justiz (BfJ)
              angesiedelt. Daneben gibt es spezielle externe Meldestellen, etwa bei der
              Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) oder beim Bundeskartellamt.
            </p>
            <p>
              Hinweisgeber haben grundsätzlich ein Wahlrecht: Sie können sich sowohl an die interne
              als auch an die externe Meldestelle wenden. Das Gesetz empfiehlt jedoch, zunächst den
              internen Weg zu nutzen, sofern intern wirksam gegen den Verstoß vorgegangen werden
              kann.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Was sind gemeinsame interne Meldestellen?">
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: '#4a5568' }}>
            <p>
              Das HinSchG ermöglicht es Unternehmen mit 50 bis 249 Beschäftigten, eine gemeinsame
              interne Meldestelle einzurichten (§ 14 Abs. 2 HinSchG). Dabei können mehrere
              Unternehmen einen gemeinsamen Dritten mit der Einrichtung und dem Betrieb der internen
              Meldestelle beauftragen.
            </p>
            <p>
              Dies bietet insbesondere für kleinere Unternehmen Vorteile: Die Kosten für den Betrieb
              einer professionellen Meldestelle werden geteilt, und die Bearbeitung der Hinweise
              erfolgt durch fachkundige, unabhängige Personen. Die Verantwortung für die Ergreifung
              von Folgemaßnahmen verbleibt jedoch bei den einzelnen Unternehmen.
            </p>
            <p>
              Diese Meldestelle des DRK Kreisverband StädteRegion Aachen e.V. fungiert als
              gemeinsame interne Meldestelle für die von uns betreuten Organisationen und
              Unternehmen. Wir gewährleisten die professionelle und vertrauliche Bearbeitung aller
              eingehenden Hinweise gemäß den gesetzlichen Vorgaben.
            </p>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
