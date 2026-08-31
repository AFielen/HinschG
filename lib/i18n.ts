export type Locale = 'de' | 'en';

/**
 * Übersetzungen für die öffentlichen Seiten (DRK-Seiten + Meldestelle).
 * Das Admin-Backend und /login bleiben bewusst einsprachig Deutsch.
 *
 * Konvention:
 * - `de` ist die Quelle der Wahrheit; `en` MUSS exakt dieselben Keys haben
 *   (typgesichert über Record<TranslationKey, string>).
 * - Fließtexte mit Inline-Links sind in Segmente aufgeteilt (…a1, …link, …a2).
 */
const de = {
  // ── Gemeinsam ──
  'common.back': 'Zurück',
  'common.next': 'Weiter',
  'common.cancel': 'Abbrechen',
  'common.pleaseSelect': 'Bitte wählen...',
  'common.loading': 'Wird geladen...',
  'common.backToHome': '← Zurück zur Startseite',
  'common.unknownError': 'Ein unbekannter Fehler ist aufgetreten',

  // ── DRK-Header ──
  'header.title': 'Hinweisgebersystem',
  'header.subtitle': 'DRK Meldestelle nach HinSchG',
  'header.subtitleShort': 'Meldestelle',
  'header.homeAria': 'Zur Startseite',
  'header.donate': 'Unterstützen',
  'header.help': 'Hilfe',
  'header.languageAria': 'Sprache wechseln',
  'header.languageTitle': 'Sprache / Language',

  // ── DRK-Footer ──
  'footer.org': 'Deutsches Rotes Kreuz',
  'footer.kv': 'Kreisverband StädteRegion Aachen e.V.',
  'footer.impressum': 'Impressum',
  'footer.datenschutz': 'Datenschutz',
  'footer.hilfe': 'Hilfe',
  'footer.spenden': 'Unterstützen',

  // ── Startseite ──
  'home.heroTitle': 'Hinweisgebersystem',
  'home.heroText':
    'Die digitale Meldestelle des DRK Kreisverband StädteRegion Aachen e.V. nach dem Hinweisgeberschutzgesetz (HinSchG). Hier können Sie Hinweise auf Rechts- und Regelverstöße vertraulich oder anonym abgeben – für den Kreisverband und die angeschlossenen Organisationen.',
  'home.toMeldestelle': 'Zur Meldestelle',
  'home.loginLink': 'Anmeldung für Meldestellen-Bearbeiter →',
  'home.card1.title': 'Vertraulich melden',
  'home.card1.text':
    'Ihre Identität wird streng vertraulich behandelt und ist nur den befugten Bearbeitern der Meldestelle bekannt. Rückfragen und Rückmeldungen sind möglich.',
  'home.card2.title': 'Anonym melden',
  'home.card2.text':
    'Auf Wunsch melden Sie ganz ohne Angabe persönlicher Daten. Ihre Identität bleibt dann auch der Meldestelle vollständig unbekannt.',
  'home.card3.title': 'Gesetzlicher Schutz',
  'home.card3.text':
    'Das Hinweisgeberschutzgesetz schützt Sie vor Repressalien wie Kündigung oder Benachteiligung, wenn Sie in gutem Glauben einen Verstoß melden.',

  // ── Hilfe ──
  'hilfe.title': 'Hilfe & Anleitung',
  'hilfe.intro':
    'Hier finden Sie Antworten auf häufige Fragen zum Hinweisgebersystem und zur Abgabe einer Meldung.',
  'hilfe.faqTitle': 'Häufige Fragen',
  'hilfe.faq1.q': 'Was ist das Hinweisgebersystem?',
  'hilfe.faq1.a1':
    'Das Hinweisgebersystem ist die digitale interne Meldestelle des DRK Kreisverband StädteRegion Aachen e.V. nach dem Hinweisgeberschutzgesetz (HinSchG). Über die ',
  'hilfe.faq1.link': 'Meldestelle',
  'hilfe.faq1.a2':
    ' können Hinweise auf Rechts- und Regelverstöße abgegeben werden – für den Kreisverband und die angeschlossenen Organisationen, die diese Meldestelle als gemeinsame interne Meldestelle nutzen.',
  'hilfe.faq2.q': 'Wer kann melden?',
  'hilfe.faq2.a':
    'Alle Personen, die im Zusammenhang mit ihrer beruflichen Tätigkeit Informationen über Verstöße erlangt haben – insbesondere Mitarbeitende, Auszubildende, Praktikanten, ehrenamtlich Tätige, Bewerberinnen und Bewerber sowie ehemalige Beschäftigte der angeschlossenen Organisationen. Ein Account oder Login ist für die Abgabe einer Meldung nicht erforderlich.',
  'hilfe.faq3.q': 'Werden meine Daten gespeichert?',
  'hilfe.faq3.a1':
    'Ja. Der Inhalt Ihrer Meldung und – bei einer vertraulichen Meldung – Ihre freiwillig angegebenen Kontaktdaten werden verschlüsselt übertragen und in einer Datenbank auf Servern in der EU (Deutschland) gespeichert, damit die Meldestelle den Hinweis gesetzeskonform bearbeiten und dokumentieren kann. Für angemeldete Meldestellen-Bearbeiter wird zusätzlich ein technisch notwendiges Session-Cookie gesetzt; für Hinweisgeber werden keine Cookies gesetzt. Details finden Sie in der ',
  'hilfe.faq3.link': 'Datenschutzerklärung',
  'hilfe.faq3.a2': '.',
  'hilfe.faq4.q': 'Kann ich anonym melden?',
  'hilfe.faq4.a':
    'Ja. Bei einer anonymen Meldung werden keine persönlichen Daten von Ihnen erfasst – Ihre Identität bleibt auch der Meldestelle unbekannt. Bitte beachten Sie: Bei anonymen Meldungen sind keine Rückfragen möglich. Beschreiben Sie den Sachverhalt daher so detailliert wie möglich.',
  'hilfe.faq5.q': 'Welche Fristen gelten?',
  'hilfe.faq5.a':
    'Nach dem HinSchG erhalten Sie spätestens nach 7 Tagen eine Bestätigung über den Eingang Ihrer Meldung. Innerhalb von 3 Monaten gibt die Meldestelle eine Rückmeldung über geplante oder bereits ergriffene Folgemaßnahmen. Bei anonymen Meldungen ohne Kontaktmöglichkeit können diese Rückmeldungen nicht zugestellt werden.',
  'hilfe.faq6.q': 'An wen wende ich mich bei technischen Problemen?',
  'hilfe.faq6.a1':
    'Bei technischen Problemen mit dieser Anwendung (z. B. Fehlermeldungen oder Darstellungsfehlern) wenden Sie sich an ',
  'hilfe.faq6.a2':
    '. Bitte senden Sie an diese Adresse keine inhaltlichen Hinweise – nutzen Sie dafür ausschließlich die ',
  'hilfe.faq6.link': 'Meldestelle',
  'hilfe.faq6.a3': ' oder die dort genannten alternativen Meldewege.',
  'hilfe.contactTitle': 'Fragen, Feedback oder Fehler gefunden?',
  'hilfe.contactText':
    'Wenden Sie sich an den DRK Kreisverband StädteRegion Aachen e.V. — auch bei technischen Fehlern, Bugs oder inhaltlichen Unklarheiten:',

  // ── Rechtstexte (Impressum/Datenschutz) ──
  'legal.bindingNotice':
    'The legally binding version of this page is German. / Die rechtsverbindliche Fassung ist Deutsch.',

  // ── Spenden ──
  'spenden.thanksTitle': 'Vielen Dank für Ihre Nutzung!',
  'spenden.thanksText':
    'Diese Anwendung wurde ehrenamtlich entwickelt und wird kostenlos als Open-Source-Software zur Verfügung gestellt — für alle DRK-Gliederungen und darüber hinaus.',
  'spenden.aboutTitle': 'Das Deutsche Rote Kreuz',
  'spenden.aboutText1':
    'Der DRK Kreisverband StädteRegion Aachen e.V. engagiert sich in zahlreichen Bereichen: Rettungsdienst, Katastrophenschutz, Soziale Dienste, Kinder- und Jugendhilfe, Flüchtlingshilfe und vieles mehr. Hunderte Ehrenamtliche und Hauptamtliche setzen sich täglich für Menschen in Not ein.',
  'spenden.aboutText2':
    'Mit einer Spende unterstützen Sie diese wichtige Arbeit direkt vor Ort in der StädteRegion Aachen.',
  'spenden.optionsTitle': 'Jetzt unterstützen',
  'spenden.online': 'Online spenden',
  'spenden.bank': 'Per Überweisung',
  'spenden.bankOrg': 'DRK Kreisverband StädteRegion Aachen e.V.',
  'spenden.bankInfo': 'Bankverbindung: Siehe www.drk-aachen.de/spenden',
  'spenden.member': 'Fördermitglied werden',
  'spenden.memberText':
    'Mit einer regelmäßigen Fördermitgliedschaft unterstützen Sie das DRK nachhaltig.',
  'spenden.memberMore': 'Mehr erfahren →',
  'spenden.osTitle': 'Open Source',
  'spenden.osText':
    'Diese Anwendung ist frei verfügbar auf GitHub. Sie können den Quellcode einsehen, mitentwickeln oder die App für Ihren eigenen DRK-Kreisverband nutzen.',

  // ── Meldestelle: Layout (Header/Footer) ──
  'mst.headerTitle': 'HINWEIS MELDESTELLE',
  'mst.headerSubtitle': 'DRK Kreisverband StädteRegion Aachen e.V.',
  'mst.nav.email': 'E-Mail',
  'mst.nav.companies': 'Unternehmen',
  'mst.nav.login': 'Anmelden',
  'mst.nav.help': 'Hilfe',

  // ── Meldestelle: Landing ──
  'mst.welcomeTitle': 'Herzlich willkommen auf der gemeinsamen internen Meldestelle',
  'mst.welcomeText':
    'Diese Meldestelle wird vom DRK Kreisverband StädteRegion Aachen e.V. betrieben und stellt nach dem Hinweisgeberschutzgesetz eine gemeinsame interne Meldestelle dar. Sie können auf dieser Seite Meldungen und Hinweise gemäß der EU-Whistleblower-Richtlinie und dem Hinweisgeberschutzgesetz (HinSchG) aufgeben. Ihre Angaben werden von uns streng vertraulich behandelt und wir stellen sicher, dass Informationen stets anonymisiert an die von uns betreuten Unternehmen weitergegeben werden. Korrektes und gesetzes-, und regelkonformes Handeln haben für uns und unsere Mitarbeiterinnen und Mitarbeiter höchste Priorität. Der Erfolg unseres Unternehmens hängt wesentlich von unserer Verlässlichkeit, Ehrlichkeit und Integrität ab. Zur Sicherstellung dieses Anspruchs ist es uns wichtig zu jederzeit über Rechts- und Regelverstöße Kenntnis zu erlangen.',
  'mst.confidential.title': 'Hinweis jetzt vertraulich melden!',
  'mst.confidential.text1':
    'Bei einer vertraulichen Meldung werden Ihre persönlichen Daten (Name, Kontaktdaten) erfasst, jedoch streng vertraulich behandelt. Ihre Identität wird nur den befugten Mitarbeitern der Meldestelle bekannt sein und nicht ohne Ihre ausdrückliche Zustimmung an Dritte weitergegeben. Die Vertraulichkeit Ihrer Identität ist gesetzlich durch das Hinweisgeberschutzgesetz (HinSchG) geschützt.',
  'mst.confidential.text2':
    'Eine vertrauliche Meldung ermöglicht es uns, bei Rückfragen direkt mit Ihnen in Kontakt zu treten und Sie über den Fortschritt der Bearbeitung zu informieren.',
  'mst.startReport': 'Meldung starten',
  'mst.anonymous.title': 'Hinweis jetzt anonym melden!',
  'mst.anonymous.text1':
    'Bei einer anonymen Meldung werden keine persönlichen Daten erfasst. Ihre Identität bleibt vollständig unbekannt – auch für die Mitarbeiter der Meldestelle. Diese Form der Meldung eignet sich insbesondere, wenn Sie Bedenken haben, Ihre Identität preiszugeben.',
  'mst.anonymous.text2':
    'Auch bei einer anonymen Meldung erhalten Sie ein Aktenzeichen und einen Zugangscode. Damit können Sie über das anonyme Postfach Rückfragen der Meldestelle beantworten und den Bearbeitungsstand verfolgen — Ihre Anonymität bleibt dabei gewahrt.',
  'mst.postfach.title': 'Postfach — Status Ihrer Meldung',
  'mst.postfach.text1':
    'Sie haben bereits eine Meldung abgegeben? Mit Ihrem Aktenzeichen und Ihrem Zugangscode können Sie sich im Postfach anmelden, den Bearbeitungsstand einsehen, Nachrichten der Meldestelle lesen und Rückfragen beantworten — auch bei anonymen Meldungen.',
  'mst.postfach.text2':
    'Aktenzeichen und Zugangscode wurden Ihnen einmalig nach dem Absenden Ihrer Meldung angezeigt.',
  'mst.postfach.button': 'Zum Postfach',
  'mst.channels.title': 'Weitere Meldewege',
  'mst.channels.text':
    'Sofern Sie nicht das digitale Hinweisgebersystem nutzen möchten, haben Sie die Möglichkeit, einen Hinweis über folgende Meldewege abzugeben:',
  'mst.channels.email': 'Per E-Mail:',
  'mst.channels.phone': 'Per Telefon:',

  // ── Meldestelle: FAQ ──
  'mst.faqTitle': 'Häufig gestellte Fragen (FAQ)',
  'mst.faq1.q': 'Was ist das Hinweisgeberschutzgesetz?',
  'mst.faq1.p1':
    'Das Hinweisgeberschutzgesetz (HinSchG) ist am 2. Juli 2023 in Kraft getreten und setzt die EU-Whistleblower-Richtlinie (2019/1937) in deutsches Recht um. Es schützt Personen, die im Rahmen ihrer beruflichen Tätigkeit Informationen über Verstöße erlangt haben und diese melden – sogenannte Hinweisgeber oder Whistleblower.',
  'mst.faq1.p2':
    'Das Gesetz verbietet jede Form von Repressalien gegen Hinweisgeber, wie Kündigungen, Abmahnungen, Versetzungen oder Mobbing. Es stellt sicher, dass Hinweisgeber geschützt werden, wenn sie in gutem Glauben Verstöße melden, die das öffentliche Interesse berühren.',
  'mst.faq2.q': 'Was ist eine interne Meldestelle?',
  'mst.faq2.p1':
    'Eine interne Meldestelle ist eine Einrichtung innerhalb eines Unternehmens oder einer Organisation, die Hinweise auf Verstöße entgegennimmt und bearbeitet. Gemäß dem HinSchG sind Unternehmen ab 50 Beschäftigten verpflichtet, eine solche Meldestelle einzurichten.',
  'mst.faq2.p2':
    'Die interne Meldestelle hat die Aufgabe, eingehende Meldungen entgegenzunehmen, den Sachverhalt zu prüfen, angemessene Folgemaßnahmen zu ergreifen und den Hinweisgeber über den Fortgang des Verfahrens zu informieren. Die mit der Bearbeitung betrauten Personen müssen unabhängig und fachkundig sein.',
  'mst.faq3.q': 'Welche gesetzlichen Anforderungen gibt es?',
  'mst.faq3.p1':
    'Das HinSchG unterscheidet zwischen zwei Unternehmensgrößen mit unterschiedlichen Anforderungen:',
  'mst.faq3.p2.label': 'Unternehmen ab 250 Beschäftigten:',
  'mst.faq3.p2.text':
    ' Diese Unternehmen mussten seit dem 2. Juli 2023 eine interne Meldestelle eingerichtet haben. Bei Verstößen gegen die Einrichtungspflicht drohen Bußgelder von bis zu 20.000 Euro.',
  'mst.faq3.p3.label': 'Unternehmen mit 50 bis 249 Beschäftigten:',
  'mst.faq3.p3.text':
    ' Für diese Unternehmen galt eine verlängerte Umsetzungsfrist bis zum 17. Dezember 2023. Auch hier ist die Einrichtung einer internen Meldestelle verpflichtend.',
  'mst.faq3.p4':
    'Die Meldestelle muss die Vertraulichkeit der Identität des Hinweisgebers wahren, innerhalb von sieben Tagen eine Eingangsbestätigung an den Hinweisgeber übermitteln und innerhalb von drei Monaten eine Rückmeldung über ergriffene Maßnahmen geben.',
  'mst.faq4.q': 'Welche Personen sind durch das HinSchG geschützt?',
  'mst.faq4.p1':
    'Das HinSchG schützt einen breiten Personenkreis, der im Zusammenhang mit seiner beruflichen Tätigkeit Informationen über Verstöße erlangt hat. Dazu gehören insbesondere:',
  'mst.faq4.li1': 'Arbeitnehmerinnen und Arbeitnehmer',
  'mst.faq4.li2': 'Beamtinnen und Beamte',
  'mst.faq4.li3': 'Auszubildende und Praktikanten',
  'mst.faq4.li4': 'Selbstständige und Freiberufler',
  'mst.faq4.li5': 'Gesellschafter und Mitglieder von Aufsichtsorganen',
  'mst.faq4.li6': 'Ehrenamtlich Tätige',
  'mst.faq4.li7': 'Bewerberinnen und Bewerber',
  'mst.faq4.li8': 'Ehemalige Beschäftigte',
  'mst.faq4.p2':
    'Der Schutz erstreckt sich auch auf Personen, die den Hinweisgeber unterstützen (sogenannte Unterstützer), sowie auf Personen, die Gegenstand der Meldung sind, sofern sich der Verdacht nicht bestätigt.',
  'mst.faq5.q': 'Welche Verstöße werden durch das HinSchG erfasst?',
  'mst.faq5.p1':
    'Das HinSchG erfasst Verstöße gegen eine Vielzahl von Rechtsvorschriften, die dem Schutz des öffentlichen Interesses dienen. Dazu gehören unter anderem Verstöße gegen:',
  'mst.faq5.li1': 'Strafvorschriften (z.B. Betrug, Korruption, Untreue)',
  'mst.faq5.li2': 'Bußgeldvorschriften zum Schutz von Leib, Leben und Gesundheit',
  'mst.faq5.li3': 'Vorschriften des Arbeitsschutzes',
  'mst.faq5.li4': 'Datenschutzrecht (DSGVO, BDSG)',
  'mst.faq5.li5': 'Umweltschutzrecht',
  'mst.faq5.li6': 'Verbraucherschutzrecht',
  'mst.faq5.li7': 'Vergaberecht',
  'mst.faq5.li8': 'Steuerrecht (bei grenzüberschreitenden Gestaltungen)',
  'mst.faq5.li9': 'Geldwäschegesetz',
  'mst.faq5.li10': 'Produktsicherheitsvorschriften',
  'mst.faq5.p2':
    'Nicht erfasst sind rein private Streitigkeiten oder arbeitsrechtliche Konflikte zwischen Arbeitnehmer und Arbeitgeber, sofern diese keinen Bezug zu den genannten Rechtsgebieten haben.',
  'mst.faq6.q': 'Was sind interne und externe Meldestellen?',
  'mst.faq6.p1':
    'Das HinSchG sieht ein zweistufiges Meldesystem vor, das Hinweisgebern die Wahl zwischen internen und externen Meldestellen lässt:',
  'mst.faq6.p2.label': 'Interne Meldestellen',
  'mst.faq6.p2.text':
    ' werden von den Unternehmen und Organisationen selbst eingerichtet. Sie sind die erste Anlaufstelle für Hinweisgeber und ermöglichen eine schnelle, interne Aufklärung von Missständen. Unternehmen können die Aufgaben der internen Meldestelle auch an Dritte (z.B. externe Ombudspersonen oder spezialisierte Dienstleister) übertragen.',
  'mst.faq6.p3.label': 'Externe Meldestellen',
  'mst.faq6.p3.text':
    ' sind staatliche Stellen. Die zentrale externe Meldestelle des Bundes ist beim Bundesamt für Justiz (BfJ) angesiedelt. Daneben gibt es spezielle externe Meldestellen, etwa bei der Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin) oder beim Bundeskartellamt.',
  'mst.faq6.p4':
    'Hinweisgeber haben grundsätzlich ein Wahlrecht: Sie können sich sowohl an die interne als auch an die externe Meldestelle wenden. Das Gesetz empfiehlt jedoch, zunächst den internen Weg zu nutzen, sofern intern wirksam gegen den Verstoß vorgegangen werden kann.',
  'mst.faq7.q': 'Was sind gemeinsame interne Meldestellen?',
  'mst.faq7.p1':
    'Das HinSchG ermöglicht es Unternehmen mit 50 bis 249 Beschäftigten, eine gemeinsame interne Meldestelle einzurichten (§ 14 Abs. 2 HinSchG). Dabei können mehrere Unternehmen einen gemeinsamen Dritten mit der Einrichtung und dem Betrieb der internen Meldestelle beauftragen.',
  'mst.faq7.p2':
    'Dies bietet insbesondere für kleinere Unternehmen Vorteile: Die Kosten für den Betrieb einer professionellen Meldestelle werden geteilt, und die Bearbeitung der Hinweise erfolgt durch fachkundige, unabhängige Personen. Die Verantwortung für die Ergreifung von Folgemaßnahmen verbleibt jedoch bei den einzelnen Unternehmen.',
  'mst.faq7.p3':
    'Diese Meldestelle des DRK Kreisverband StädteRegion Aachen e.V. fungiert als gemeinsame interne Meldestelle für die von uns betreuten Organisationen und Unternehmen. Wir gewährleisten die professionelle und vertrauliche Bearbeitung aller eingehenden Hinweise gemäß den gesetzlichen Vorgaben.',

  // ── Wizard (vertraulich + anonym) ──
  'wiz.step.organisation': 'Organisation',
  'wiz.step.personal': 'Persönliche Daten',
  'wiz.step.report': 'Meldung',
  'wiz.step.summary': 'Zusammenfassung',
  'wiz.orgTitle': 'Organisation auswählen',
  'wiz.orgHint': 'Bitte wählen Sie die Organisation aus, zu der Ihre Meldung gehört.',
  'wiz.orgLabel': 'Organisation',
  'wiz.orgLoadError':
    'Die Liste der Organisationen konnte nicht geladen werden. Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.',
  'wiz.personalTitle': 'Persönliche Daten',
  'wiz.personalHint':
    'Ihre Daten werden streng vertraulich behandelt und nur den befugten Mitarbeitern der Meldestelle zugänglich gemacht.',
  'wiz.anrede': 'Anrede',
  'wiz.anredeFrau': 'Frau',
  'wiz.anredeHerr': 'Herr',
  'wiz.vorname': 'Vorname',
  'wiz.vornamePh': 'Ihr Vorname',
  'wiz.nachname': 'Nachname',
  'wiz.nachnamePh': 'Ihr Nachname',
  'wiz.telefon': 'Telefon',
  'wiz.telefonPh': 'z.B. 0241 12345',
  'wiz.email': 'E-Mail',
  'wiz.emailPh': 'ihre@email.de',
  'wiz.reportTitle': 'Meldung erfassen',
  'wiz.reportHint': 'Beschreiben Sie den Sachverhalt so detailliert wie möglich.',
  'wiz.reportHintAnon':
    'Beschreiben Sie den Sachverhalt so detailliert wie möglich. Rückfragen der Meldestelle können Sie später anonym über das Postfach beantworten.',
  'wiz.kategorie': 'Kategorie',
  'wiz.datumVerstoss': 'Datum des Verstoßes',
  'wiz.beteiligte': 'Beteiligte Personen',
  'wiz.beteiligtePh': 'Welche Personen sind am Sachverhalt beteiligt?',
  'wiz.meldungstext': 'Meldungstext',
  'wiz.meldungstextPh': 'Beschreiben Sie den Sachverhalt so detailliert wie möglich...',
  'wiz.summaryTitle': 'Zusammenfassung',
  'wiz.summaryHint':
    'Bitte überprüfen Sie Ihre Angaben. Nach dem Absenden kann die Meldung nicht mehr geändert werden.',
  'wiz.summary.personal': 'Persönliche Daten',
  'wiz.summary.report': 'Meldung',
  'wiz.summary.name': 'Name',
  'wiz.summary.organisation': 'Organisation',
  'wiz.anonNotice.label': 'Anonyme Meldung:',
  'wiz.anonNotice.text':
    ' Es werden keine persönlichen Daten erfasst. Ihre Identität bleibt vollständig unbekannt. Über das anonyme Postfach können Sie nach dem Absenden dennoch Rückfragen der Meldestelle beantworten und den Bearbeitungsstand verfolgen.',
  'wiz.anonSummaryNotice':
    'Diese Meldung wird vollständig anonym übermittelt. Es werden keine persönlichen Daten gespeichert.',
  'wiz.submit': 'Meldung absenden',
  'wiz.submitting': 'Wird gesendet...',
  'wiz.submitError': 'Fehler beim Senden der Meldung',

  // ── Erfolgsansicht ──
  'success.title': 'Meldung erfolgreich übermittelt',
  'success.titleAnon': 'Anonyme Meldung erfolgreich übermittelt',
  'success.text':
    'Vielen Dank für Ihren Hinweis. Ihre Meldung wurde erfolgreich entgegengenommen und wird von unserer Meldestelle vertraulich bearbeitet.',
  'success.textAnon':
    'Vielen Dank für Ihren Hinweis. Ihre Meldung wurde vollständig anonym entgegengenommen. Es wurden keine persönlichen Daten erfasst.',
  'success.codeWarning':
    'Notieren Sie Aktenzeichen und Zugangscode jetzt — sie werden aus Sicherheitsgründen nur EINMAL angezeigt und können nicht wiederhergestellt werden.',
  'success.aktenzeichen': 'Aktenzeichen',
  'success.zugangscode': 'Zugangscode',
  'success.hint1': 'Mit diesen Angaben können Sie sich jederzeit im ',
  'success.hintAnon1': 'Mit diesen Angaben können Sie sich jederzeit anonym im ',
  'success.hintLink': 'Postfach',
  'success.hint2':
    ' anmelden, den Bearbeitungsstand einsehen, Rückfragen beantworten und Unterlagen nachreichen.',
  'success.hintAnon2':
    ' anmelden, den Bearbeitungsstand einsehen, Rückfragen beantworten und Unterlagen nachreichen — Ihre Anonymität bleibt dabei gewahrt.',
  'success.toPostfach': 'Zum Postfach',
  'success.backToStart': 'Zurück zur Startseite',

  // ── Postfach ──
  'pf.loading': 'Postfach wird geladen...',
  'pf.loginTitle': 'Postfach — Status Ihrer Meldung',
  'pf.loginIntro':
    'Melden Sie sich mit Ihrem Aktenzeichen und Ihrem Zugangscode an, um den Bearbeitungsstand Ihrer Meldung einzusehen, Nachrichten der Meldestelle zu lesen und Rückfragen zu beantworten — auch bei anonymen Meldungen.',
  'pf.aktenzeichenPh': 'z.B. 2026-08-31-ABCD2345',
  'pf.login': 'Anmelden',
  'pf.checking': 'Wird geprüft...',
  'pf.loginErrorTooMany': 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.',
  'pf.loginErrorWrong': 'Aktenzeichen oder Zugangscode ist falsch.',
  'pf.connError': 'Verbindungsfehler. Bitte versuchen Sie es erneut.',
  'pf.sessionExpired': 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
  'pf.codeHint':
    'Aktenzeichen und Zugangscode wurden Ihnen einmalig nach dem Absenden Ihrer Meldung angezeigt. Sie können aus Sicherheitsgründen nicht wiederhergestellt werden.',
  'pf.yourReport': 'Ihre Meldung',
  'pf.status.neu': 'Neu',
  'pf.status.inBearbeitung': 'In Bearbeitung',
  'pf.status.abgeschlossen': 'Abgeschlossen',
  'pf.received': 'Eingang',
  'pf.confirmation': 'Eingangsbestätigung',
  'pf.feedbackDone': 'Rückmeldung erfolgt',
  'pf.feedbackDue': 'Rückmeldung bis',
  'pf.messages': 'Nachrichten',
  'pf.noMessages': 'Noch keine Nachrichten vorhanden.',
  'pf.fromOffice': 'Meldestelle',
  'pf.fromYou': 'Sie',
  'pf.replyLabel': 'Ihre Nachricht an die Meldestelle',
  'pf.replyPh': 'Rückfrage beantworten, Informationen ergänzen oder Unterlagen beschreiben...',
  'pf.replyHint':
    'Belege und Unterlagen können Sie im Abschnitt „Anhänge“ unterhalb des Nachrichtenverlaufs als Datei nachreichen.',
  'pf.logout': 'Abmelden',
  'pf.send': 'Senden',
  'pf.sendError': 'Fehler beim Senden der Nachricht',
  'pf.attachments': 'Anhänge',
  'pf.noAttachments': 'Noch keine Anhänge vorhanden.',
  'pf.download': 'Herunterladen',
  'pf.uploadLabel': 'Datei nachreichen',
  'pf.uploadFormats':
    'Erlaubte Formate: PDF, JPG, PNG, WebP, TXT, DOCX, XLSX — maximal 10 MB pro Datei.',
  'pf.upload': 'Anhang hochladen',
  'pf.uploading': 'Wird hochgeladen...',
  'pf.uploadError': 'Fehler beim Hochladen der Datei',
  'pf.fileTooBig': 'Die Datei ist zu groß (maximal 10 MB).',
  'pf.fileTypeNotAllowed':
    'Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, JPG, PNG, WebP, TXT, DOCX und XLSX.',
} as const;

export type TranslationKey = keyof typeof de;

const en: Record<TranslationKey, string> = {
  // ── Common ──
  'common.back': 'Back',
  'common.next': 'Next',
  'common.cancel': 'Cancel',
  'common.pleaseSelect': 'Please select...',
  'common.loading': 'Loading...',
  'common.backToHome': '← Back to home page',
  'common.unknownError': 'An unknown error occurred',

  // ── DRK header ──
  'header.title': 'Whistleblower System',
  'header.subtitle': 'DRK reporting office under HinSchG',
  'header.subtitleShort': 'Reporting office',
  'header.homeAria': 'Go to home page',
  'header.donate': 'Support us',
  'header.help': 'Help',
  'header.languageAria': 'Switch language',
  'header.languageTitle': 'Sprache / Language',

  // ── DRK footer ──
  'footer.org': 'German Red Cross',
  'footer.kv': 'Kreisverband StädteRegion Aachen e.V.',
  'footer.impressum': 'Legal Notice',
  'footer.datenschutz': 'Privacy Policy',
  'footer.hilfe': 'Help',
  'footer.spenden': 'Support',

  // ── Home ──
  'home.heroTitle': 'Whistleblower System',
  'home.heroText':
    'The digital reporting office of the DRK Kreisverband StädteRegion Aachen e.V. under the German Whistleblower Protection Act (HinSchG). Here you can report violations of laws and regulations confidentially or anonymously – for the district association and its affiliated organisations.',
  'home.toMeldestelle': 'Go to the reporting office',
  'home.loginLink': 'Sign-in for case handlers →',
  'home.card1.title': 'Report confidentially',
  'home.card1.text':
    'Your identity is treated in strict confidence and is known only to the authorised case handlers of the reporting office. Follow-up questions and feedback are possible.',
  'home.card2.title': 'Report anonymously',
  'home.card2.text':
    'If you prefer, you can report without providing any personal data. Your identity then remains completely unknown, even to the reporting office.',
  'home.card3.title': 'Legal protection',
  'home.card3.text':
    'The Whistleblower Protection Act protects you against reprisals such as dismissal or discrimination when you report a violation in good faith.',

  // ── Help ──
  'hilfe.title': 'Help & Guide',
  'hilfe.intro':
    'Here you will find answers to frequently asked questions about the whistleblower system and how to submit a report.',
  'hilfe.faqTitle': 'Frequently asked questions',
  'hilfe.faq1.q': 'What is the whistleblower system?',
  'hilfe.faq1.a1':
    'The whistleblower system is the digital internal reporting office of the DRK Kreisverband StädteRegion Aachen e.V. under the German Whistleblower Protection Act (HinSchG). Via the ',
  'hilfe.faq1.link': 'reporting office',
  'hilfe.faq1.a2':
    ' you can report violations of laws and regulations – for the district association and its affiliated organisations, which use it as a joint internal reporting office.',
  'hilfe.faq2.q': 'Who can report?',
  'hilfe.faq2.a':
    'Anyone who has obtained information about violations in connection with their professional activities – in particular employees, trainees, interns, volunteers, job applicants and former employees of the affiliated organisations. No account or login is required to submit a report.',
  'hilfe.faq3.q': 'Is my data stored?',
  'hilfe.faq3.a1':
    'Yes. The content of your report and – for a confidential report – the contact details you provide voluntarily are transmitted in encrypted form and stored in a database on servers in the EU (Germany), so that the reporting office can process and document the report in accordance with the law. For signed-in case handlers, one technically necessary session cookie is additionally set; no cookies are set for whistleblowers. For details, see the ',
  'hilfe.faq3.link': 'privacy policy',
  'hilfe.faq3.a2': '.',
  'hilfe.faq4.q': 'Can I report anonymously?',
  'hilfe.faq4.a':
    'Yes. With an anonymous report, no personal data about you is collected – your identity remains unknown even to the reporting office. Please note: with anonymous reports, follow-up questions are not possible. Therefore, describe the matter in as much detail as possible.',
  'hilfe.faq5.q': 'Which deadlines apply?',
  'hilfe.faq5.a':
    'Under the HinSchG, you will receive a confirmation of receipt of your report within 7 days at the latest. Within 3 months, the reporting office will provide feedback on planned or already implemented follow-up measures. For anonymous reports without any means of contact, this feedback cannot be delivered.',
  'hilfe.faq6.q': 'Who do I contact in case of technical problems?',
  'hilfe.faq6.a1':
    'For technical problems with this application (e.g. error messages or display issues), please contact ',
  'hilfe.faq6.a2':
    '. Please do not send any actual reports to this address – use only the ',
  'hilfe.faq6.link': 'reporting office',
  'hilfe.faq6.a3': ' or the alternative reporting channels listed there.',
  'hilfe.contactTitle': 'Questions, feedback or found a bug?',
  'hilfe.contactText':
    'Contact the DRK Kreisverband StädteRegion Aachen e.V. — including for technical errors, bugs or questions about the content:',

  // ── Legal pages ──
  'legal.bindingNotice':
    'The legally binding version of this page is German. / Die rechtsverbindliche Fassung ist Deutsch.',

  // ── Donations ──
  'spenden.thanksTitle': 'Thank you for using this service!',
  'spenden.thanksText':
    'This application was developed on a volunteer basis and is provided free of charge as open-source software — for all German Red Cross branches and beyond.',
  'spenden.aboutTitle': 'The German Red Cross',
  'spenden.aboutText1':
    'The DRK Kreisverband StädteRegion Aachen e.V. is active in many areas: emergency medical services, disaster relief, social services, child and youth welfare, refugee aid and much more. Hundreds of volunteers and professionals work every day for people in need.',
  'spenden.aboutText2':
    'With a donation, you support this important work directly on the ground in the StädteRegion Aachen.',
  'spenden.optionsTitle': 'Support us now',
  'spenden.online': 'Donate online',
  'spenden.bank': 'By bank transfer',
  'spenden.bankOrg': 'DRK Kreisverband StädteRegion Aachen e.V.',
  'spenden.bankInfo': 'Bank details: see www.drk-aachen.de/spenden',
  'spenden.member': 'Become a supporting member',
  'spenden.memberText':
    'With a regular supporting membership, you help the German Red Cross in a sustainable way.',
  'spenden.memberMore': 'Learn more →',
  'spenden.osTitle': 'Open Source',
  'spenden.osText':
    'This application is freely available on GitHub. You can view the source code, contribute, or use the app for your own Red Cross branch.',

  // ── Reporting office: layout (header/footer) ──
  'mst.headerTitle': 'WHISTLEBLOWER REPORTING OFFICE',
  'mst.headerSubtitle': 'DRK Kreisverband StädteRegion Aachen e.V.',
  'mst.nav.email': 'Email',
  'mst.nav.companies': 'Organisations',
  'mst.nav.login': 'Sign in',
  'mst.nav.help': 'Help',

  // ── Reporting office: landing ──
  'mst.welcomeTitle': 'Welcome to the joint internal reporting office',
  'mst.welcomeText':
    'This reporting office is operated by the DRK Kreisverband StädteRegion Aachen e.V. and constitutes a joint internal reporting office under the German Whistleblower Protection Act. On this page you can submit reports and information in accordance with the EU Whistleblower Directive and the German Whistleblower Protection Act (HinSchG). Your information is treated in strict confidence, and we ensure that information is always passed on to the organisations we serve in anonymised form only. Acting correctly and in compliance with laws and regulations is a top priority for us and our employees. The success of our organisation depends fundamentally on our reliability, honesty and integrity. To uphold this standard, it is important for us to learn about legal and regulatory violations at any time.',
  'mst.confidential.title': 'Report a matter confidentially now!',
  'mst.confidential.text1':
    'With a confidential report, your personal data (name, contact details) is collected but treated in strict confidence. Your identity will be known only to the authorised staff of the reporting office and will not be passed on to third parties without your express consent. The confidentiality of your identity is protected by law under the German Whistleblower Protection Act (HinSchG).',
  'mst.confidential.text2':
    'A confidential report enables us to contact you directly if we have follow-up questions and to keep you informed about the progress of the case.',
  'mst.startReport': 'Start report',
  'mst.anonymous.title': 'Report a matter anonymously now!',
  'mst.anonymous.text1':
    'With an anonymous report, no personal data is collected. Your identity remains completely unknown – even to the staff of the reporting office. This form of reporting is particularly suitable if you have concerns about revealing your identity.',
  'mst.anonymous.text2':
    'Even with an anonymous report, you receive a reference number and an access code. With these you can answer follow-up questions from the reporting office and track the processing status via the anonymous inbox — your anonymity is preserved throughout.',
  'mst.postfach.title': 'Inbox — status of your report',
  'mst.postfach.text1':
    'Have you already submitted a report? With your reference number and your access code, you can sign in to the inbox, view the processing status, read messages from the reporting office and answer follow-up questions — including for anonymous reports.',
  'mst.postfach.text2':
    'Your reference number and access code were shown to you once after submitting your report.',
  'mst.postfach.button': 'Go to inbox',
  'mst.channels.title': 'Other reporting channels',
  'mst.channels.text':
    'If you prefer not to use the digital whistleblower system, you can submit a report via the following channels:',
  'mst.channels.email': 'By email:',
  'mst.channels.phone': 'By phone:',

  // ── Reporting office: FAQ ──
  'mst.faqTitle': 'Frequently Asked Questions (FAQ)',
  'mst.faq1.q': 'What is the German Whistleblower Protection Act?',
  'mst.faq1.p1':
    'The German Whistleblower Protection Act (HinSchG) entered into force on 2 July 2023 and transposes the EU Whistleblower Directive (2019/1937) into German law. It protects persons who have obtained information about violations in the course of their professional activities and who report them – so-called whistleblowers.',
  'mst.faq1.p2':
    'The Act prohibits any form of reprisal against whistleblowers, such as dismissal, formal warnings, transfers or bullying. It ensures that whistleblowers are protected when they report, in good faith, violations that affect the public interest.',
  'mst.faq2.q': 'What is an internal reporting office?',
  'mst.faq2.p1':
    'An internal reporting office is a unit within a company or organisation that receives and processes reports of violations. Under the HinSchG, companies with 50 or more employees are required to establish such a reporting office.',
  'mst.faq2.p2':
    'The internal reporting office is responsible for receiving incoming reports, examining the facts, taking appropriate follow-up measures and keeping the whistleblower informed about the progress of the procedure. The persons entrusted with processing must be independent and competent.',
  'mst.faq3.q': 'What are the legal requirements?',
  'mst.faq3.p1':
    'The HinSchG distinguishes between two company sizes with different requirements:',
  'mst.faq3.p2.label': 'Companies with 250 or more employees:',
  'mst.faq3.p2.text':
    ' These companies were required to have an internal reporting office in place from 2 July 2023. Violations of this obligation can result in fines of up to 20,000 euros.',
  'mst.faq3.p3.label': 'Companies with 50 to 249 employees:',
  'mst.faq3.p3.text':
    ' These companies benefited from an extended implementation deadline until 17 December 2023. Here too, establishing an internal reporting office is mandatory.',
  'mst.faq3.p4':
    'The reporting office must maintain the confidentiality of the whistleblower’s identity, send the whistleblower an acknowledgement of receipt within seven days, and provide feedback on the measures taken within three months.',
  'mst.faq4.q': 'Which persons are protected by the HinSchG?',
  'mst.faq4.p1':
    'The HinSchG protects a broad group of persons who have obtained information about violations in connection with their professional activities. This includes in particular:',
  'mst.faq4.li1': 'Employees',
  'mst.faq4.li2': 'Civil servants',
  'mst.faq4.li3': 'Trainees and interns',
  'mst.faq4.li4': 'Self-employed persons and freelancers',
  'mst.faq4.li5': 'Shareholders and members of supervisory bodies',
  'mst.faq4.li6': 'Volunteers',
  'mst.faq4.li7': 'Job applicants',
  'mst.faq4.li8': 'Former employees',
  'mst.faq4.p2':
    'The protection also extends to persons who support the whistleblower (so-called facilitators), as well as to persons who are the subject of a report, provided the suspicion is not confirmed.',
  'mst.faq5.q': 'Which violations are covered by the HinSchG?',
  'mst.faq5.p1':
    'The HinSchG covers violations of a wide range of legal provisions that serve to protect the public interest. These include, among others, violations of:',
  'mst.faq5.li1': 'Criminal law provisions (e.g. fraud, corruption, embezzlement)',
  'mst.faq5.li2': 'Administrative fine provisions protecting life, limb and health',
  'mst.faq5.li3': 'Occupational health and safety regulations',
  'mst.faq5.li4': 'Data protection law (GDPR, BDSG)',
  'mst.faq5.li5': 'Environmental protection law',
  'mst.faq5.li6': 'Consumer protection law',
  'mst.faq5.li7': 'Public procurement law',
  'mst.faq5.li8': 'Tax law (for cross-border arrangements)',
  'mst.faq5.li9': 'Anti-money laundering law',
  'mst.faq5.li10': 'Product safety regulations',
  'mst.faq5.p2':
    'Not covered are purely private disputes or employment law conflicts between employee and employer, provided they have no connection to the areas of law mentioned above.',
  'mst.faq6.q': 'What are internal and external reporting offices?',
  'mst.faq6.p1':
    'The HinSchG provides for a two-tier reporting system that gives whistleblowers the choice between internal and external reporting offices:',
  'mst.faq6.p2.label': 'Internal reporting offices',
  'mst.faq6.p2.text':
    ' are set up by companies and organisations themselves. They are the first point of contact for whistleblowers and enable a fast, internal investigation of wrongdoing. Companies can also delegate the tasks of the internal reporting office to third parties (e.g. external ombudspersons or specialised service providers).',
  'mst.faq6.p3.label': 'External reporting offices',
  'mst.faq6.p3.text':
    ' are government bodies. The central external reporting office of the federal government is located at the Federal Office of Justice (BfJ). In addition, there are special external reporting offices, for example at the Federal Financial Supervisory Authority (BaFin) or the Federal Cartel Office.',
  'mst.faq6.p4':
    'Whistleblowers generally have a right to choose: they can contact either the internal or the external reporting office. However, the law recommends using the internal channel first, provided the violation can be effectively addressed internally.',
  'mst.faq7.q': 'What are joint internal reporting offices?',
  'mst.faq7.p1':
    'The HinSchG allows companies with 50 to 249 employees to establish a joint internal reporting office (Section 14 (2) HinSchG). Several companies can commission a joint third party to set up and operate the internal reporting office.',
  'mst.faq7.p2':
    'This offers advantages especially for smaller companies: the costs of running a professional reporting office are shared, and reports are processed by competent, independent persons. Responsibility for taking follow-up measures, however, remains with each individual company.',
  'mst.faq7.p3':
    'This reporting office of the DRK Kreisverband StädteRegion Aachen e.V. acts as a joint internal reporting office for the organisations and companies we serve. We ensure the professional and confidential handling of all incoming reports in accordance with the legal requirements.',

  // ── Wizard (confidential + anonymous) ──
  'wiz.step.organisation': 'Organisation',
  'wiz.step.personal': 'Personal details',
  'wiz.step.report': 'Report',
  'wiz.step.summary': 'Summary',
  'wiz.orgTitle': 'Select organisation',
  'wiz.orgHint': 'Please select the organisation your report relates to.',
  'wiz.orgLabel': 'Organisation',
  'wiz.orgLoadError':
    'The list of organisations could not be loaded. Please reload the page or try again later.',
  'wiz.personalTitle': 'Personal details',
  'wiz.personalHint':
    'Your data is treated in strict confidence and made accessible only to the authorised staff of the reporting office.',
  'wiz.anrede': 'Salutation',
  'wiz.anredeFrau': 'Ms',
  'wiz.anredeHerr': 'Mr',
  'wiz.vorname': 'First name',
  'wiz.vornamePh': 'Your first name',
  'wiz.nachname': 'Last name',
  'wiz.nachnamePh': 'Your last name',
  'wiz.telefon': 'Phone',
  'wiz.telefonPh': 'e.g. +49 241 12345',
  'wiz.email': 'Email',
  'wiz.emailPh': 'your@email.com',
  'wiz.reportTitle': 'Enter report',
  'wiz.reportHint': 'Describe the matter in as much detail as possible.',
  'wiz.reportHintAnon':
    'Describe the matter in as much detail as possible. You can later answer follow-up questions from the reporting office anonymously via the inbox.',
  'wiz.kategorie': 'Category',
  'wiz.datumVerstoss': 'Date of the violation',
  'wiz.beteiligte': 'Persons involved',
  'wiz.beteiligtePh': 'Which persons are involved in the matter?',
  'wiz.meldungstext': 'Report text',
  'wiz.meldungstextPh': 'Describe the matter in as much detail as possible...',
  'wiz.summaryTitle': 'Summary',
  'wiz.summaryHint':
    'Please review your details. After submitting, the report can no longer be changed.',
  'wiz.summary.personal': 'Personal details',
  'wiz.summary.report': 'Report',
  'wiz.summary.name': 'Name',
  'wiz.summary.organisation': 'Organisation',
  'wiz.anonNotice.label': 'Anonymous report:',
  'wiz.anonNotice.text':
    ' No personal data is collected. Your identity remains completely unknown. After submitting, you can nevertheless answer follow-up questions from the reporting office and track the processing status via the anonymous inbox.',
  'wiz.anonSummaryNotice':
    'This report will be submitted completely anonymously. No personal data will be stored.',
  'wiz.submit': 'Submit report',
  'wiz.submitting': 'Sending...',
  'wiz.submitError': 'Error submitting the report',

  // ── Success view ──
  'success.title': 'Report submitted successfully',
  'success.titleAnon': 'Anonymous report submitted successfully',
  'success.text':
    'Thank you for your report. It has been received successfully and will be handled confidentially by our reporting office.',
  'success.textAnon':
    'Thank you for your report. It has been received completely anonymously. No personal data was collected.',
  'success.codeWarning':
    'Write down your reference number and access code now — for security reasons, they are shown only ONCE and cannot be recovered.',
  'success.aktenzeichen': 'Reference number',
  'success.zugangscode': 'Access code',
  'success.hint1': 'With these details you can sign in to the ',
  'success.hintAnon1': 'With these details you can anonymously sign in to the ',
  'success.hintLink': 'inbox',
  'success.hint2':
    ' at any time to view the processing status, answer follow-up questions and submit additional documents.',
  'success.hintAnon2':
    ' at any time to view the processing status, answer follow-up questions and submit additional documents — your anonymity is preserved throughout.',
  'success.toPostfach': 'Go to inbox',
  'success.backToStart': 'Back to the start page',

  // ── Inbox ──
  'pf.loading': 'Loading inbox...',
  'pf.loginTitle': 'Inbox — status of your report',
  'pf.loginIntro':
    'Sign in with your reference number and your access code to view the processing status of your report, read messages from the reporting office and answer follow-up questions — including for anonymous reports.',
  'pf.aktenzeichenPh': 'e.g. 2026-08-31-ABCD2345',
  'pf.login': 'Sign in',
  'pf.checking': 'Checking...',
  'pf.loginErrorTooMany': 'Too many sign-in attempts. Please try again later.',
  'pf.loginErrorWrong': 'Reference number or access code is incorrect.',
  'pf.connError': 'Connection error. Please try again.',
  'pf.sessionExpired': 'Your session has expired. Please sign in again.',
  'pf.codeHint':
    'Your reference number and access code were shown to you once after submitting your report. For security reasons, they cannot be recovered.',
  'pf.yourReport': 'Your report',
  'pf.status.neu': 'New',
  'pf.status.inBearbeitung': 'In progress',
  'pf.status.abgeschlossen': 'Closed',
  'pf.received': 'Received',
  'pf.confirmation': 'Acknowledgement',
  'pf.feedbackDone': 'Feedback provided',
  'pf.feedbackDue': 'Feedback due by',
  'pf.messages': 'Messages',
  'pf.noMessages': 'No messages yet.',
  'pf.fromOffice': 'Reporting office',
  'pf.fromYou': 'You',
  'pf.replyLabel': 'Your message to the reporting office',
  'pf.replyPh': 'Answer a follow-up question, add information or describe documents...',
  'pf.replyHint':
    'You can submit evidence and documents as files in the “Attachments” section below the message history.',
  'pf.logout': 'Sign out',
  'pf.send': 'Send',
  'pf.sendError': 'Error sending the message',
  'pf.attachments': 'Attachments',
  'pf.noAttachments': 'No attachments yet.',
  'pf.download': 'Download',
  'pf.uploadLabel': 'Submit a file',
  'pf.uploadFormats':
    'Allowed formats: PDF, JPG, PNG, WebP, TXT, DOCX, XLSX — maximum 10 MB per file.',
  'pf.upload': 'Upload attachment',
  'pf.uploading': 'Uploading...',
  'pf.uploadError': 'Error uploading the file',
  'pf.fileTooBig': 'The file is too large (maximum 10 MB).',
  'pf.fileTypeNotAllowed':
    'This file type is not allowed. Allowed types are PDF, JPG, PNG, WebP, TXT, DOCX and XLSX.',
};

const translations: Record<Locale, Record<TranslationKey, string>> = { de, en };

/**
 * Übersetzungsfunktion
 * @param key - Übersetzungsschlüssel (typsicher)
 * @param locale - Sprache (default: 'de')
 * @param params - Platzhalter-Werte, z.B. { year: '2026' } ersetzt {year}
 */
export function t(
  key: TranslationKey,
  locale: Locale = 'de',
  params?: Record<string, string | number>,
): string {
  let text: string = translations[locale][key] ?? translations.de[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

/**
 * Alle Keys einer Kategorie holen (z.B. alle 'home.*' Keys)
 */
export function tGroup(prefix: string, locale: Locale = 'de'): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(translations[locale])) {
    if (key.startsWith(prefix)) {
      result[key] = value;
    }
  }
  return result;
}
