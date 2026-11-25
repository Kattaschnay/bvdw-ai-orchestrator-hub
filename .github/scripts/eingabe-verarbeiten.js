#!/usr/bin/env node
/*
 * Übernimmt eine freigegebene Eingabe (GitHub Issue aus einem Issue-Formular)
 * in data/labs.json. Ohne Abhängigkeiten – läuft mit Node 18+.
 *
 * Umgebungsvariablen: ISSUE_BODY, ISSUE_LABELS (kommagetrennt), ISSUE_NUMBER
 * Ausgabe: schreibt data/labs.json und eine Zusammenfassung nach stdout.
 * Exit-Code 2 = Eingabe fehlerhaft (Meldung auf stderr).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const DATEI = path.join(__dirname, "..", "..", "data", "labs.json");

function slug(s) {
  return String(s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Issue-Formular-Body ("### Label\n\nWert") in { label: wert } umwandeln. */
function parseFormular(body) {
  const felder = {};
  const teile = String(body || "").replace(/\r\n/g, "\n").split(/^### /m).slice(1);
  for (const teil of teile) {
    const [kopf, ...rest] = teil.split("\n");
    let wert = rest.join("\n").trim();
    if (wert === "_No response_" || wert === "(unverändert)") wert = "";
    felder[kopf.trim()] = wert;
  }
  return felder;
}

const zeilen = (s) => String(s || "").split("\n").map((z) => z.trim()).filter(Boolean);
const heute = () => new Date().toISOString().slice(0, 10);

function personenParsen(text) {
  return zeilen(text).map((z) => {
    const [name, unternehmen = "", rolle = "Lab-Leitung"] = z.split("|").map((x) => x.trim());
    return { name, unternehmen, rolle: rolle || "Lab-Leitung" };
  });
}

function bvdwParsen(text) {
  return zeilen(text).map((z) => {
    const [name, email = ""] = z.split("|").map((x) => x.trim());
    return { name, email };
  });
}

function labFinden(labs, eingabe) {
  const e = String(eingabe || "").trim();
  const s = slug(e);
  return labs.find((l) => l.id === e || l.id === s || slug(l.name) === s || l.name.toLowerCase() === e.toLowerCase());
}

function fehler(msg) {
  process.stderr.write(msg + "\n");
  process.exit(2);
}

function verarbeiten({ body, labels, nummer, daten }) {
  const f = parseFormular(body);
  const labs = daten.labs;
  let zusammenfassung;

  if (labels.includes("roadmap")) {
    const lab = labFinden(labs, f["Lab"]);
    if (!lab) fehler(`Lab „${f["Lab"]}“ nicht gefunden. Bitte Kürzel prüfen.`);
    if (!f["Titel des Meilensteins"]) fehler("Titel des Meilensteins fehlt.");
    lab.roadmap2027 = lab.roadmap2027 || [];
    lab.roadmap2027.push({
      quartal: f["Quartal"] || "Q1",
      titel: f["Titel des Meilensteins"],
      beschreibung: f["Beschreibung"] || "",
      typ: f["Format"] || "Sonstiges",
      status: f["Status"] || "geplant",
      verantwortlich: f["Verantwortlich"] || "",
      quelle: nummer ? `#${nummer}` : undefined,
    });
    const ord = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    lab.roadmap2027.sort((a, b) => (ord[a.quartal] || 9) - (ord[b.quartal] || 9));
    zusammenfassung = `Roadmap-Eintrag „${f["Titel des Meilensteins"]}“ (${f["Quartal"]}) für ${lab.name}`;
  } else if (labels.includes("lab-info")) {
    const lab = labFinden(labs, f["Lab"]);
    if (!lab) fehler(`Lab „${f["Lab"]}“ nicht gefunden. Bitte Kürzel prüfen.`);
    const geaendert = [];
    if (f["Lab-Leitung"]) { lab.leitung = personenParsen(f["Lab-Leitung"]); geaendert.push("Lab-Leitung"); }
    if (f["Verantwortlich BVDW"]) { lab.bvdw = bvdwParsen(f["Verantwortlich BVDW"]); geaendert.push("Verantwortlich BVDW"); }
    if (f["Termine"]) { lab.termine = f["Termine"]; geaendert.push("Termine"); }
    if (f["Aktuelle Projekte"]) { lab.aktuell = zeilen(f["Aktuelle Projekte"]).map((z) => z.replace(/^[-*•]\s*/, "")); geaendert.push("Aktuelle Projekte"); }
    if (f["Kurzbeschreibung"]) { lab.kurz = f["Kurzbeschreibung"].replace(/\s+/g, " "); geaendert.push("Kurzbeschreibung"); }
    if (f["Status des Labs"]) { lab.status = f["Status des Labs"]; geaendert.push("Status"); }
    if (f["Ziele 2027"]) { lab.ziele2027 = zeilen(f["Ziele 2027"]).map((z) => z.replace(/^[-*•]\s*/, "")); geaendert.push("Ziele 2027"); }
    if (f["Links"]) {
      lab.links = zeilen(f["Links"]).map((z) => {
        const [label, url] = z.split("|").map((x) => x.trim());
        return url ? { label, url } : { label: label, url: label };
      }).filter((l) => /^https?:\/\//.test(l.url));
      geaendert.push("Links");
    }
    if (!geaendert.length) fehler("Keine Änderungen im Formular gefunden.");
    zusammenfassung = `${lab.name}: ${geaendert.join(", ")} aktualisiert`;
  } else if (labels.includes("neues-lab")) {
    const name = f["Name des Labs"];
    if (!name) fehler("Name des Labs fehlt.");
    let id = slug(name);
    if (labs.some((l) => l.id === id)) fehler(`Ein Lab mit dem Kürzel „${id}“ existiert bereits.`);
    const feldNr = parseInt(String(f["Themenfeld"] || "").trim(), 10);
    if (!feldNr || !(daten.themenfelder || []).some((t) => t.nr === feldNr)) fehler("Themenfeld fehlt oder ist unbekannt.");
    labs.push({
      id, name,
      heimat: f["Heimat (Working Group / Initiative)"] || "",
      themenfeld: feldNr,
      status: "im Aufbau",
      kurz: (f["Kurzbeschreibung"] || "").replace(/\s+/g, " "),
      aktuell: [], hinweis: "",
      leitung: f["Lab-Leitung"] ? personenParsen(f["Lab-Leitung"]) : [],
      bvdw: f["Verantwortlich BVDW"] ? bvdwParsen(f["Verantwortlich BVDW"]) : [],
      termine: "",
      ziele2027: [], roadmap2027: [], links: [],
    });
    zusammenfassung = `Neues Lab „${name}“ (Kürzel ${id})`;
  } else {
    fehler("Unbekannter Eingabe-Typ (Label roadmap, lab-info oder neues-lab fehlt).");
  }

  daten.stand = heute();
  return zusammenfassung;
}

if (require.main === module) {
  const daten = JSON.parse(fs.readFileSync(DATEI, "utf8"));
  const labels = String(process.env.ISSUE_LABELS || "").split(",").map((x) => x.trim());
  const text = verarbeiten({ body: process.env.ISSUE_BODY, labels, nummer: process.env.ISSUE_NUMBER, daten });
  fs.writeFileSync(DATEI, JSON.stringify(daten, null, 2) + "\n");
  process.stdout.write(text + "\n");
}

module.exports = { parseFormular, verarbeiten, slug };
