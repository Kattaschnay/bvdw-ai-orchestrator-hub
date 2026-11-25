# BVDW AI Orchestrator Hub

Zentrale Übersicht aller KI-Labs des BVDW: Startseite mit Kacheln, je Lab eine Unterseite mit Lab-Leitung, Ansprechpersonen, Zielen und **Roadmap 2027**.

Die Seite läuft ohne Server direkt über **GitHub Pages**. Alle Inhalte stehen in `data/labs.json`. Gepflegt wird ausschließlich über GitHub – die Seite selbst hat keine Eingabemöglichkeiten.

## Pflege der Inhalte (nur Bereich KI)

Die öffentliche Seite ist **reine Ansicht** – dort gibt es keine Eingabemöglichkeiten. Gepflegt wird ausschließlich hier im Repo:

**Variante A – Formular (empfohlen):** *Issues → New issue* → Formular wählen → absenden → Label **`freigegeben`** setzen. Die Action schreibt die Änderung in `data/labs.json` und legt einen Pull Request an. PR mergen → nach ca. 1 Minute live.

| Formular | Wofür |
|---|---|
| **Roadmap-Eintrag 2027** | Neuen Meilenstein (Quartal, Titel, Format, Status, Verantwortlich) hinzufügen |
| **Lab-Infos aktualisieren** | Lab-Leitung, BVDW-Verantwortliche, Termine, aktuelle Projekte, Kurzbeschreibung, Status, Ziele 2027, Links ändern |
| **Neues Lab anlegen** | Neue Kachel in einem Themenfeld |

Die Action verarbeitet nur Eingaben von Personen mit Schreibrechten (Owner/Collaborators). Eingaben Dritter werden ignoriert, auch wenn sie das Label bekommen.

**Variante B – direkt:** `data/labs.json` auf GitHub öffnen → Stift-Symbol → ändern → „Commit changes“. Nach ca. 1 Minute live.

**Damit niemand sonst Eingaben machen kann:** Repo auf **Private** stellen (die Seite bleibt öffentlich; GitHub Pages aus privaten Repos braucht GitHub Pro) – oder bei öffentlichem Repo unter *Settings → General → Features* die **Issues** deaktivieren und nur Variante B nutzen.

## Eigene BVDW-Subdomain

1. Im Repo unter *Settings → Pages → Custom domain* die Subdomain eintragen (z. B. `ki-hub.bvdw.org`) und speichern.
2. BVDW-IT legt im DNS einen **CNAME** an: `ki-hub` → `kattaschnay.github.io`
3. Nach der DNS-Prüfung „Enforce HTTPS“ aktivieren.

## Einrichtung (einmalig)

1. Repo auf GitHub anlegen, z. B. `Kattaschnay/bvdw-ai-orchestrator-hub`, und diese Dateien hochladen.
2. **Settings → Pages → Build and deployment → Source: „GitHub Actions“.**
3. **Settings → Actions → General → Workflow permissions:** „Read and write permissions“ und **„Allow GitHub Actions to create and approve pull requests“** aktivieren.
4. **Issues → Labels:** Label `freigegeben` anlegen (die Labels `eingabe`, `roadmap`, `lab-info`, `neues-lab` legt GitHub beim ersten Formular an – sonst ebenfalls manuell anlegen).

Die Seite ist dann erreichbar unter `https://<github-name>.github.io/bvdw-ai-orchestrator-hub/`.

## Schrift PP Telegraf

Die Seite nutzt PP Telegraf (Regular, Ultrabold) aus `fonts/`. PP Telegraf ist eine lizenzierte Schrift – in einem **öffentlichen** Repo wären die Dateien für alle herunterladbar. Deshalb sind sie per `.gitignore` ausgeschlossen; ohne sie fällt die Seite auf Helvetica/Arial zurück. Wenn die Lizenz die Einbindung im Web erlaubt, die Zeile `fonts/*.otf` aus `.gitignore` entfernen und die Dateien mit hochladen.

## Datenmodell (`data/labs.json`)

```json
{
  "id": "ai-value-chain",                 // Kürzel, wird zur URL lab.html?id=…
  "name": "Lab AI Value Chain",
  "heimat": "Bereich KI",                 // Working Group / Initiative
  "themenfeld": 7,                        // Nummer aus "themenfelder" (1–7)
  "status": "aktiv",                      // aktiv | im Aufbau | in Planung | pausiert
  "kurz": "Ein Satz für die Kachel",
  "aktuell": ["Laufendes Projekt"],
  "hinweis": "",                          // z. B. Teilnahmebedingungen
  "leitung": [{ "name": "", "unternehmen": "", "rolle": "Lab-Leitung" }],
  "bvdw": [{ "name": "", "email": "" }],  // Verantwortlich BVDW
  "termine": "alle 3 Wochen, mittwochs 10 Uhr",
  "ziele2027": ["…"],
  "roadmap2027": [{ "quartal": "Q1", "titel": "", "beschreibung": "", "typ": "Publikation",
                    "status": "geplant", "verantwortlich": "" }],
  "links": [{ "label": "SharePoint", "url": "https://…" }]
}
```

Seitenweite Inhalte (Intro, Leitlinien, Formate, Publikationen, Kontakt) stehen in `data/config.json`.

## Logo

Das BVDW-Logo als `assets/bvdw-logo.svg` (oder `assets/bvdw-logo.png`) ablegen – es erscheint dann automatisch oben links. Solange die Datei fehlt, steht dort die Wortmarke „BVDW“ in PP Telegraf.

## Lokal ansehen

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

Tests für die Formular-Verarbeitung: `node .github/scripts/test.js`
